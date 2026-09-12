import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:camera/camera.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers.dart';
import '../../../../core/services/pose_detection_service.dart';
import '../../../../core/services/exercise_analyzer.dart';
import '../../../../core/services/anticheat_service.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/models_exercise.dart';

/// Camera-based exercise tracking page with real-time pose tracking & anti-cheat
class ExerciseCameraPage extends ConsumerStatefulWidget {
  final ExerciseTypeEnum exerciseType;
  final bool isBattleMode;
  final Function(int count, int correctCount, List<String> issues)? onSessionComplete;
  
  const ExerciseCameraPage({
    super.key,
    required this.exerciseType,
    this.isBattleMode = false,
    this.onSessionComplete,
  });
  
  @override
  ConsumerState<ExerciseCameraPage> createState() => _ExerciseCameraPageState();
}

class _ExerciseCameraPageState extends ConsumerState<ExerciseCameraPage> with WidgetsBindingObserver {
  // Services
  PoseDetectionService? _poseService;
  PoseDetector? _poseDetector;
  ExerciseAnalyzer? _analyzer;
  AntiCheatService? _antiCheat;
  final FlutterTts _flutterTts = FlutterTts();
  
  // Camera
  CameraController? _camera;
  CameraDescription? _cameraDescription;
  bool _isCameraInitialized = false;
  String? _cameraError;
  bool _isProcessingFrame = false;
  
  // State
  int _repCount = 0;
  int _correctCount = 0;
  double _currentAngle = 0.0;
  double _bodyAlignmentAngle = 180.0;
  String _feedback = 'Đứng vào khung hình camera để bắt đầu';
  String? _antiCheatWarning;
  bool _isCorrectForm = true;
  List<String> _formIssues = [];
  int _elapsedSeconds = 0;
  bool _isSessionActive = false;
  bool _voiceGuidance = true;
  Timer? _sessionTimer;
  Timer? _feedbackTimer;
  
  // Pose visualization
  Map<String, Offset> _landmarks = {};
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initTts();
    _initializeServices();
  }

  void _initTts() async {
    try {
      await _flutterTts.setLanguage('vi-VN');
      await _flutterTts.setSpeechRate(1.0);
      await _flutterTts.setVolume(1.0);
    } catch (_) {}
  }

  void _speak(String text) async {
    if (!_voiceGuidance) return;
    try {
      await _flutterTts.stop();
      await _flutterTts.speak(text);
    } catch (_) {}
  }
  
  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _disposeServices();
    super.dispose();
  }
  
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_camera == null || !_camera!.value.isInitialized) return;
    
    if (state == AppLifecycleState.inactive) {
      _camera?.dispose();
    } else if (state == AppLifecycleState.resumed) {
      _initializeCamera();
    }
  }
  
  /// Initialize services
  Future<void> _initializeServices() async {
    // Initialize pose detector
    _poseDetector = PoseDetector(
      options: PoseDetectorOptions(
        mode: PoseDetectionMode.stream,
        model: PoseDetectionModel.accurate,
      ),
    );

    // Initialize pose detection service
    _poseService = PoseDetectionService();
    _poseService!.onError = _onCameraError;
    
    // Initialize exercise analyzer
    _analyzer = ExerciseAnalyzer(
      exerciseType: widget.exerciseType == ExerciseTypeEnum.pushup
          ? RealExerciseType.pushup
          : RealExerciseType.pullup,
    );
    _analyzer!.onRepCompleted = _onRepCompleted;
    
    // Initialize anti-cheat
    _antiCheat = AntiCheatService();
    
    // Initialize camera
    await _initializeCamera();
  }
  
  /// Initialize camera
  Future<void> _initializeCamera() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        setState(() => _cameraError = 'Không tìm thấy camera trên thiết bị');
        return;
      }
      
      // Use front camera for self tracking
      final frontCamera = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );
      
      _cameraDescription = frontCamera;
      _camera = CameraController(
        frontCamera,
        ResolutionPreset.medium,
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.yuv420,
      );
      
      await _camera!.initialize();
      
      // Start image stream for pose detection
      await _camera!.startImageStream(_processCameraImage);
      
      setState(() => _isCameraInitialized = true);
      
    } catch (e) {
      setState(() => _cameraError = 'Lỗi khởi động camera: $e');
    }
  }
  
  /// Process camera image for real-time ML pose detection
  Future<void> _processCameraImage(CameraImage image) async {
    if (_poseDetector == null || !_isSessionActive || _isProcessingFrame) return;
    _isProcessingFrame = true;
    
    try {
      final inputImage = _convertCameraImage(image);
      if (inputImage == null) return;
      
      // Detect human body pose
      final poses = await _poseDetector!.processImage(inputImage);
      
      if (poses.isNotEmpty) {
        final pose = poses.first;
        
        // 1. Run pose through biomechanical analyzer
        final analysis = _analyzer!.analyzePose(pose);
        
        // 2. Run anti-cheat validation
        final antiCheatResult = _antiCheat!.validatePose(
          pose,
          widget.exerciseType == ExerciseTypeEnum.pushup
              ? RealExerciseType.pushup
              : RealExerciseType.pullup,
        );
        
        // Update UI
        if (mounted) {
          setState(() {
            _repCount = analysis.repCount;
            _correctCount = analysis.correctRepCount;
            _currentAngle = analysis.currentAngle;
            _bodyAlignmentAngle = analysis.bodyAlignmentAngle;
            _isCorrectForm = analysis.isCorrectForm && antiCheatResult.isValid;
            _feedback = analysis.feedback ?? antiCheatResult.warning ?? '';
            _antiCheatWarning = analysis.antiCheatAlert;
            _formIssues = analysis.formIssues;
            _updateSkeletonPoints(pose, image);
          });
        }
      }
      
    } catch (e) {
      debugPrint('Error processing camera frame: $e');
    } finally {
      _isProcessingFrame = false;
    }
  }
  
  /// Convert CameraImage to InputImage
  InputImage? _convertCameraImage(CameraImage image) {
    try {
      final camera = _cameraDescription;
      final sensorOrientation = camera?.sensorOrientation ?? 0;
      final rotation = InputImageRotationValue.fromRawValue(sensorOrientation) ??
          InputImageRotation.rotation0deg;

      final format = InputImageFormatValue.fromRawValue(image.format.raw) ??
          (image.format.group == ImageFormatGroup.yuv420
              ? InputImageFormat.nv21
              : InputImageFormat.yuv420);

      // Concatenate all planes for YUV420
      final WriteBuffer allBytes = WriteBuffer();
      for (final Plane plane in image.planes) {
        allBytes.putUint8List(plane.bytes);
      }
      final bytes = allBytes.done().buffer.asUint8List();

      return InputImage.fromBytes(
        bytes: bytes,
        metadata: InputImageMetadata(
          size: Size(image.width.toDouble(), image.height.toDouble()),
          rotation: rotation,
          format: format,
          bytesPerRow: image.planes.first.bytesPerRow,
        ),
      );
    } catch (e) {
      return null;
    }
  }
  
  /// Handle camera errors
  void _onCameraError(String error) {
    if (mounted) {
      setState(() => _cameraError = error);
    }
  }
  
  /// Handle rep completion
  void _onRepCompleted(int count, bool isCorrect) {
    if (isCorrect) {
      _speak('$count. Chuẩn form!');
    } else {
      _speak('$count. Chưa chuẩn form!');
    }
  }
  
  /// Update skeleton visualization points
  void _updateSkeletonPoints(Pose pose, CameraImage image) {
    final size = Size(image.width.toDouble(), image.height.toDouble());
    final landmarks = <String, Offset>{};
    
    for (final entry in pose.landmarks.entries) {
      final landmark = entry.value;
      landmarks[entry.key.name] = Offset(
        landmark.x / size.width * MediaQuery.of(context).size.width,
        landmark.y / size.height * (MediaQuery.of(context).size.height * 0.7),
      );
    }
    
    _landmarks = landmarks;
  }
  
  /// Start exercise session
  void _startSession() {
    setState(() {
      _isSessionActive = true;
      _repCount = 0;
      _correctCount = 0;
      _formIssues = [];
      _antiCheatWarning = null;
      _elapsedSeconds = 0;
      _feedback = 'Bắt đầu! AI đang giám sát góc khớp thời gian thực...';
    });
    
    _analyzer?.reset();
    _antiCheat?.reset();
    _speak('Bắt đầu buổi tập. Hãy vào vị trí và thực hiện chuẩn động tác!');
    
    // Start timer
    _sessionTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() => _elapsedSeconds++);
        
        // Auto-end session after 5 minutes
        if (!widget.isBattleMode && _elapsedSeconds >= 300) {
          _endSession();
        }
      }
    });
  }
  
  /// End exercise session
  void _endSession() {
    _sessionTimer?.cancel();
    setState(() => _isSessionActive = false);
    
    final durationMin = (_elapsedSeconds / 60).ceil().clamp(1, 60);
    final cal = (_correctCount * (widget.exerciseType == ExerciseTypeEnum.pushup ? 0.5 : 1.2)).round();
    final accuracy = _repCount > 0 ? (_correctCount / _repCount * 100) : 0.0;

    // ── SYNC TO ALL FEATURES ACROSS THE APP ──
    WorkoutSyncService.syncWorkout(
      ref: ref,
      exerciseType: widget.exerciseType.id,
      totalReps: _repCount,
      validReps: _correctCount,
      durationMinutes: durationMin,
      caloriesBurned: cal,
      accuracy: accuracy,
      formIssues: _formIssues,
    );

    widget.onSessionComplete?.call(_repCount, _correctCount, _formIssues);
    _speak('Hoàn thành buổi tập! Bạn đạt $_repCount lần, trong đó có $_correctCount lần chuẩn form.');
    _showResultsDialog();
  }
  
  /// Show results dialog
  void _showResultsDialog() {
    final accuracy = _repCount > 0 ? (_correctCount / _repCount * 100) : 0.0;
    final xpEarned = widget.exerciseType == ExerciseTypeEnum.pushup ? (_correctCount * 3) : (_correctCount * 5);
    final coinsEarned = widget.exerciseType == ExerciseTypeEnum.pushup ? (_correctCount * 1) : (_correctCount * 2);
    final cal = (_correctCount * (widget.exerciseType == ExerciseTypeEnum.pushup ? 0.5 : 1.2)).round();
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.textMuted,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              widget.exerciseType.emoji,
              style: const TextStyle(fontSize: 56),
            ),
            const SizedBox(height: 12),
            const Text(
              '🎉 HOÀN THÀNH BUỔI TẬP!',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 6),
            const Text(
              'Dữ liệu đã được đồng bộ vào Cấp độ, Nhiệm vụ và Lịch sử',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _ResultItem(label: 'Tổng Rep', value: '$_repCount', color: AppColors.primary),
                  _ResultItem(label: 'Rep Chuẩn', value: '$_correctCount', color: const Color(0xFF2ED573)),
                  _ResultItem(label: 'Độ Chuẩn', value: '${accuracy.toStringAsFixed(0)}%', color: const Color(0xFFFFA502)),
                ],
              ),
            ),
            const SizedBox(height: 12),
            // Rewards Row
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF2ED573).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF2ED573).withValues(alpha: 0.3)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.bolt, color: AppColors.secondary, size: 20),
                      const SizedBox(width: 4),
                      Text('+$xpEarned XP', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                    ],
                  ),
                  Row(
                    children: [
                      const Icon(Icons.monetization_on, color: Color(0xFFFFA502), size: 20),
                      const SizedBox(width: 4),
                      Text('+$coinsEarned Coins', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                    ],
                  ),
                  Row(
                    children: [
                      const Icon(Icons.local_fire_department, color: Color(0xFFFF4757), size: 20),
                      const SizedBox(width: 4),
                      Text('$cal kcal', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  _startSession();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2ED573),
                  foregroundColor: const Color(0xFF0F0F23),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('TẬP LẠI', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              ),
            ),
            const SizedBox(height: 10),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Đóng & Về trang chủ', style: TextStyle(color: AppColors.textMuted)),
            ),
          ],
        ),
      ),
    );
  }
  
  /// Dispose services
  Future<void> _disposeServices() async {
    _sessionTimer?.cancel();
    _feedbackTimer?.cancel();
    _camera?.dispose();
    _poseDetector?.close();
    _poseService?.dispose();
    _flutterTts.stop();
  }
  
  @override
  Widget build(BuildContext context) {
    final exerciseColor = Color(
      int.parse(widget.exerciseType.color.replaceAll('#', '0xFF')),
    );
    
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Camera Preview
          if (_isCameraInitialized && _camera != null)
            Positioned.fill(
              child: AspectRatio(
                aspectRatio: _camera!.value.aspectRatio,
                child: CameraPreview(_camera!),
              ),
            )
          else if (_cameraError != null)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, color: Colors.red, size: 52),
                    const SizedBox(height: 16),
                    Text(
                      _cameraError!,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _initializeCamera,
                      child: const Text('Khởi động lại Camera'),
                    ),
                  ],
                ),
              ),
            )
          else
            const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: Color(0xFF2ED573)),
                  SizedBox(height: 16),
                  Text('Đang kết nối Camera AI...', style: TextStyle(color: Colors.white70)),
                ],
              ),
            ),
          
          // Skeleton Overlay
          if (_landmarks.isNotEmpty && _isSessionActive)
            CustomPaint(
              size: Size.infinite,
              painter: SkeletonPainter(
                landmarks: _landmarks,
                isCorrectForm: _isCorrectForm,
              ),
            ),
          
          // Top Bar & Controls
          SafeArea(
            child: Column(
              children: [
                // Top Navigation Bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                      // Anti-cheat status pill
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFF2ED573).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFF2ED573)),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.shield, color: Color(0xFF2ED573), size: 14),
                            SizedBox(width: 4),
                            Text('Anti-Cheat AI', style: TextStyle(color: Color(0xFF2ED573), fontSize: 11, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                      // Timer
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.timer, color: Colors.white, size: 14),
                            const SizedBox(width: 4),
                            Text(
                              '${_elapsedSeconds ~/ 60}:${(_elapsedSeconds % 60).toString().padLeft(2, '0')}',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Camera Angle Guide Hint
                if (!_isSessionActive)
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.black87,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFF2ED573).withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.camera_alt, color: Color(0xFF2ED573), size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            widget.exerciseType == ExerciseTypeEnum.pushup
                                ? '📐 Góc đặt máy: Đặt điện thoại nghiêng góc 45° hoặc nhìn ngang cách 1.5 - 2m để AI quan sát góc khuỷu tay và lưng.'
                                : '📐 Góc đặt máy: Đặt điện thoại góc trực diện/chéo ngang tầm ngực cách 1.5 - 2m để AI quan sát cằm và xà.',
                            style: const TextStyle(color: Colors.white70, fontSize: 11),
                          ),
                        ),
                      ],
                    ),
                  ),

                // Anti-Cheat Active Warning Alert
                if (_antiCheatWarning != null)
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: Colors.red.withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(color: Colors.red.withValues(alpha: 0.5), blurRadius: 10),
                      ],
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.warning, color: Colors.white, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _antiCheatWarning!,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                
                const Spacer(),
                
                // Real-time Angle & Rep Display HUD
                Container(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      // Large Rep Counter
                      Text(
                        '$_repCount',
                        style: TextStyle(
                          fontSize: 90,
                          fontWeight: FontWeight.w900,
                          color: _isCorrectForm ? const Color(0xFF2ED573) : const Color(0xFFFFA502),
                          height: 1.0,
                          shadows: [
                            Shadow(color: Colors.black.withValues(alpha: 0.8), blurRadius: 15),
                          ],
                        ),
                      ),
                      Text(
                        widget.exerciseType.name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 6),

                      // Biomechanical Joint Angle Pills
                      if (_isSessionActive && _currentAngle > 0)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.black87,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: _currentAngle <= (widget.exerciseType == ExerciseTypeEnum.pushup ? 92 : 78)
                                      ? const Color(0xFF2ED573)
                                      : Colors.white24,
                                ),
                              ),
                              child: Text(
                                'Góc tay: ${_currentAngle.round()}° ${widget.exerciseType == ExerciseTypeEnum.pushup ? '(Mục tiêu: ≤90°)' : '(Mục tiêu: ≤78°)'}',
                                style: TextStyle(
                                  color: _currentAngle <= (widget.exerciseType == ExerciseTypeEnum.pushup ? 92 : 78)
                                      ? const Color(0xFF2ED573)
                                      : Colors.white70,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),

                      const SizedBox(height: 8),

                      // Coaching Feedback Pill
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: _isCorrectForm
                              ? const Color(0xFF2ED573).withValues(alpha: 0.85)
                              : Colors.orange.withValues(alpha: 0.9),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _feedback,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Stats row (Chuẩn vs Tổng)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF2ED573).withValues(alpha: 0.25),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '✓ Chuẩn Form: $_correctCount',
                              style: const TextStyle(color: Color(0xFF2ED573), fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white12,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              'Tổng: $_repCount',
                              style: const TextStyle(color: Colors.white70, fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                // Bottom Button Control
                Container(
                  padding: const EdgeInsets.all(20),
                  child: _isSessionActive
                      ? SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _endSession,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            child: const Text('KẾT THÚC BUỔI TẬP', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          ),
                        )
                      : SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _startSession,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF2ED573),
                              foregroundColor: const Color(0xFF0F0F23),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            child: const Text(
                              'BẮT ĐẦU TẬP (AI REALTIME)',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Result item widget
class _ResultItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  
  const _ResultItem({
    required this.label,
    required this.value,
    required this.color,
  });
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}

/// Skeleton painter for pose visualization
class SkeletonPainter extends CustomPainter {
  final Map<String, Offset> landmarks;
  final bool isCorrectForm;
  
  SkeletonPainter({
    required this.landmarks,
    required this.isCorrectForm,
  });
  
  static const connections = [
    ['leftShoulder', 'rightShoulder'],
    ['leftShoulder', 'leftElbow', 'leftWrist'],
    ['rightShoulder', 'rightElbow', 'rightWrist'],
    ['leftShoulder', 'leftHip'],
    ['rightShoulder', 'rightHip'],
    ['leftHip', 'rightHip'],
    ['leftHip', 'leftKnee', 'leftAnkle'],
    ['rightHip', 'rightKnee', 'rightAnkle'],
  ];
  
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = isCorrectForm ? const Color(0xFF2ED573) : Colors.red
      ..strokeWidth = 3.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    
    final pointPaint = Paint()
      ..color = isCorrectForm ? const Color(0xFF2ED573) : Colors.red
      ..style = PaintingStyle.fill;
    
    for (final connection in connections) {
      for (int i = 0; i < connection.length - 1; i++) {
        final start = landmarks[connection[i]];
        final end = landmarks[connection[i + 1]];
        
        if (start != null && end != null) {
          canvas.drawLine(start, end, paint);
        }
      }
    }
    
    for (final landmark in landmarks.values) {
      canvas.drawCircle(landmark, 5, pointPaint);
    }
  }
  
  @override
  bool shouldRepaint(SkeletonPainter oldDelegate) => true;
}
