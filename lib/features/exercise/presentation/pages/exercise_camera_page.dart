import 'dart:async';
import 'dart:math' as math;
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

  // Single-Subject Lock & Depth state
  bool _reachedDepth = false;
  String _depthStatus = 'ready'; // 'ready', 'going_down', 'depth_passed'
  double _virtualBarY = 0.0;
  String _subjectStatus = 'locking'; // 'locking', 'matched', 'user_away', 'stranger_detected'
  int _subjectMatchScore = 100;
  int _countdown = 0;
  Timer? _countdownTimer;
  int _autoDetectionFrames = 0;
  int _scanConfidence = 0;
  String _scanDetails = 'Đang quét tư thế...';
  
  // Pose visualization
  Map<String, Offset> _landmarks = {};
  Map<String, double> _visibility = {};
  
  // Debug state
  int _debugLandmarkCount = 0;
  String _debugPoseStatus = 'Initializing...';
  bool _showDebugPanel = true; // Set to true for debugging
  
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
    // Initialize pose detector with base stream mode for high performance real-time detection
    _poseDetector = PoseDetector(
      options: PoseDetectorOptions(
        mode: PoseDetectionMode.stream,
        model: PoseDetectionModel.base,
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

  /// Start automatic countdown transition
  void _startCountdown() {
    if (_countdown > 0 || _isSessionActive) return;
    setState(() => _countdown = 3);
    _speak(
      widget.exerciseType == ExerciseTypeEnum.pullup
          ? 'Đã nhận diện xà và tư thế bám xà! Bắt đầu sau 3 giây. Kéo đầu vượt qua tay nhé!'
          : 'Phát hiện tư thế hít đất! Bắt đầu sau 3 giây.',
    );

    int count = 3;
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      count--;
      if (mounted) {
        setState(() => _countdown = count);
      }
      if (count <= 0) {
        timer.cancel();
        _countdownTimer = null;
        if (mounted) {
          setState(() => _countdown = 0);
          _startSession();
        }
      }
    });
  }
  
  /// Process camera image for real-time ML pose detection
  Future<void> _processCameraImage(CameraImage image) async {
    if (_poseDetector == null || _isProcessingFrame) return;
    _isProcessingFrame = true;
    
    try {
      final inputImage = _convertCameraImage(image);
      if (inputImage == null) {
        debugPrint('❌ Failed to convert camera image');
        _isProcessingFrame = false;
        return;
      }
      
      // Detect human body pose
      final poses = await _poseDetector!.processImage(inputImage);
      
      debugPrint('📸 Camera frame processed: ${poses.length} poses detected');
      
      if (poses.isNotEmpty) {
        final pose = poses.first;
        debugPrint('✅ Pose detected with ${pose.landmarks.length} landmarks');
        
        // ── 1. SCAN PHASE (Trước khi tập: Quét tư thế / Check xà) ──
        if (!_isSessionActive) {
          if (widget.exerciseType == ExerciseTypeEnum.pullup) {
            final scan = PoseUtils.checkPullupPosition(pose);
            if (scan.barY > 0) {
              _virtualBarY = scan.barY;
            }
            if (mounted) {
              setState(() {
                _scanConfidence = scan.confidence;
                _scanDetails = scan.details;
                _updateSkeletonPoints(pose, image);
              });
            }
            if (scan.isInPosition) {
              _autoDetectionFrames++;
              if (_autoDetectionFrames >= 15 && _countdown == 0) {
                _startCountdown();
              }
            } else {
              _autoDetectionFrames = 0;
            }
          } else {
            final scan = PoseUtils.checkPushupPosition(pose);
            if (mounted) {
              setState(() {
                _scanConfidence = scan.confidence;
                _scanDetails = scan.details;
                _updateSkeletonPoints(pose, image);
              });
            }
            if (scan.isInPosition) {
              _autoDetectionFrames++;
              if (_autoDetectionFrames >= 15 && _countdown == 0) {
                _startCountdown();
              }
            } else {
              _autoDetectionFrames = 0;
            }
          }
          return;
        }

        // ── 2. WORKOUT PHASE (Đang tập: Kiểm tra chỉ con người & Khóa đối tượng duy nhất) ──
        final subjectCheck = _antiCheat!.validateSubject(pose);
        final String currentStatus = _antiCheat!.subjectStatus;
        final int matchScore = _antiCheat!.subjectMatchScore;

        // Nếu người lạ bước vào hoặc không phải con người -> CHẶN TUYỆT ĐỐI!
        if (!subjectCheck.isValid) {
          if (mounted) {
            setState(() {
              _subjectStatus = currentStatus;
              _subjectMatchScore = matchScore;
              _antiCheatWarning = subjectCheck.warning;
              _feedback = subjectCheck.warning ?? '';
              _isCorrectForm = false;
              _updateSkeletonPoints(pose, image);
            });
          }
          return; // DỪNG: KHÔNG ĐẾM REP CHO NGƯỜI LẠ / VẬT THỂ
        }

        // Kiểm tra người tập rời camera
        if (_antiCheat!.checkUserAway()) {
          if (mounted) {
            setState(() {
              _subjectStatus = 'user_away';
              _antiCheatWarning = '⚠️ Bạn đã rời khỏi camera – Hệ thống đang khóa với bạn và tạm dừng';
              _feedback = '⚠️ Đang đợi bạn quay lại camera...';
              _updateSkeletonPoints(pose, image);
            });
          }
          return; // DỪNG: TẠM DỪNG CHỜ NGƯỜI CŨ QUAY LẠI
        }

        // ── 3. PHÂN TÍCH REP BIOMECHANICS ĐÚNG NGƯỜI ĐÃ KHÓA ──
        final analysis = _analyzer!.analyzePose(pose);
        final antiCheatResult = _antiCheat!.validatePose(
          pose,
          widget.exerciseType == ExerciseTypeEnum.pushup
              ? RealExerciseType.pushup
              : RealExerciseType.pullup,
        );
        
        // Update UI
        if (mounted) {
          setState(() {
            _subjectStatus = currentStatus;
            _subjectMatchScore = matchScore;
            _repCount = analysis.repCount;
            _correctCount = analysis.correctRepCount;
            _currentAngle = analysis.currentAngle;
            _bodyAlignmentAngle = analysis.bodyAlignmentAngle;
            _isCorrectForm = analysis.isCorrectForm && antiCheatResult.isValid;
            _feedback = analysis.feedback ?? antiCheatResult.warning ?? '';
            _antiCheatWarning = analysis.antiCheatAlert;
            _formIssues = analysis.formIssues;
            _reachedDepth = analysis.reachedDepth;
            _depthStatus = analysis.depthStatus;
            if (analysis.virtualBarY > 0) {
              _virtualBarY = analysis.virtualBarY;
            }
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
      // Get camera orientation
      final camera = _cameraDescription;
      final int sensorOrientation = camera?.sensorOrientation ?? 0;
      final InputImageRotation rotation = InputImageRotationValue.fromRawValue(sensorOrientation) ??
          InputImageRotation.rotation0deg;

      // Determine format
      final format = InputImageFormatValue.fromRawValue(image.format.raw) ??
          (image.format.group == ImageFormatGroup.yuv420
              ? InputImageFormat.nv21
              : InputImageFormat.yuv420);

      // Concatenate all planes
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
      debugPrint('Error converting camera image: $e');
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
    final int sensorOrientation = _cameraDescription?.sensorOrientation ?? 0;
    final bool isRotated = sensorOrientation == 90 || sensorOrientation == 270;
    final double imgWidth = isRotated ? image.height.toDouble() : image.width.toDouble();
    final double imgHeight = isRotated ? image.width.toDouble() : image.height.toDouble();

    final screenSize = MediaQuery.of(context).size;
    final landmarks = <String, Offset>{};
    final visMap = <String, double>{};

    // Get all landmarks from pose
    final poseLandmarks = pose.landmarks;
    
    for (final entry in poseLandmarks.entries) {
      final name = entry.key.name;
      final landmark = entry.value;
      
      double screenX, screenY;
      if (_cameraDescription?.lensDirection == CameraLensDirection.front) {
        screenX = screenSize.width - (landmark.x / imgWidth * screenSize.width);
      } else {
        screenX = landmark.x / imgWidth * screenSize.width;
      }
      
      screenY = landmark.y / imgHeight * screenSize.height;
      
      landmarks[name] = Offset(screenX, screenY);
      visMap[name] = landmark.likelihood;
    }

    // Update state
    _landmarks = landmarks;
    _visibility = visMap;
    _debugLandmarkCount = landmarks.length;
    _debugPoseStatus = 'Pose Detected ✓ (${landmarks.length} pts)';
    
    // Debug output
    debugPrint('✅ Updated skeleton: $_debugLandmarkCount points detected');
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
          
          // Skeleton Overlay - COVERS FULL SCREEN
          if (_landmarks.isNotEmpty)
            Positioned.fill(
              child: CustomPaint(
                size: Size.infinite,
                painter: SkeletonPainter(
                  landmarks: _landmarks,
                  visibility: _visibility,
                  isCorrectForm: _isCorrectForm,
                  isPullup: widget.exerciseType == ExerciseTypeEnum.pullup,
                  virtualBarY: _virtualBarY,
                  reachedDepth: _reachedDepth,
                ),
              ),
            ),

          // DEBUG PANEL - Shows pose detection status
          if (_showDebugPanel && _isCameraInitialized)
            Positioned(
              top: MediaQuery.of(context).padding.top + 160,
              left: 8,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black87,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: _debugLandmarkCount > 0 ? Colors.green : Colors.orange),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '🔍 Debug Info',
                      style: TextStyle(
                        color: _debugLandmarkCount > 0 ? Colors.green : Colors.orange,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Status: $_debugPoseStatus',
                      style: const TextStyle(color: Colors.white, fontSize: 10),
                    ),
                    Text(
                      'Landmarks: $_debugLandmarkCount',
                      style: TextStyle(
                        color: _debugLandmarkCount > 0 ? Colors.green : Colors.orange,
                        fontSize: 10,
                      ),
                    ),
                    Text(
                      'Session: ${_isSessionActive ? "Active" : "Inactive"}',
                      style: const TextStyle(color: Colors.white70, fontSize: 10),
                    ),
                  ],
                ),
              ),
            ),

          // Countdown Overlay
          if (_countdown > 0)
            Positioned.fill(
              child: Container(
                color: Colors.black.withValues(alpha: 0.65),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF2ED573), width: 3),
                          color: const Color(0xFF2ED573).withValues(alpha: 0.18),
                        ),
                        child: Center(
                          child: Text(
                            '$_countdown',
                            style: const TextStyle(
                              fontSize: 58,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF2ED573),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'BẮT ĐẦU TỰ ĐỘNG!',
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 1),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        widget.exerciseType == ExerciseTypeEnum.pullup
                            ? '✅ Vị trí xà & tư thế bám xà được xác nhận'
                            : '✅ Tư thế hít đất được xác nhận',
                        style: const TextStyle(color: Color(0xFF2ED573), fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          
          // Top Bar & Controls
          SafeArea(
            child: Column(
              children: [
                // Top Navigation Bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back, color: Colors.white, size: 22),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const SizedBox(width: 8),
                      // Single-Subject Lock Status Pill - High Contrast
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A).withValues(alpha: 0.94),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: _subjectStatus == 'matched'
                                  ? const Color(0xFF2ED573)
                                  : _subjectStatus == 'stranger_detected'
                                  ? Colors.redAccent
                                  : _subjectStatus == 'user_away'
                                  ? Colors.orangeAccent
                                  : const Color(0xFF00E5FF),
                              width: 1.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: _subjectStatus == 'matched'
                                    ? const Color(0xFF2ED573).withValues(alpha: 0.35)
                                    : _subjectStatus == 'stranger_detected'
                                    ? Colors.redAccent.withValues(alpha: 0.45)
                                    : _subjectStatus == 'user_away'
                                    ? Colors.orangeAccent.withValues(alpha: 0.35)
                                    : const Color(0xFF00E5FF).withValues(alpha: 0.3),
                                blurRadius: 10,
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                _subjectStatus == 'matched'
                                    ? Icons.lock
                                    : _subjectStatus == 'stranger_detected'
                                    ? Icons.person_off
                                    : _subjectStatus == 'user_away'
                                    ? Icons.warning_amber
                                    : Icons.person_search,
                                color: _subjectStatus == 'matched'
                                    ? const Color(0xFF2ED573)
                                    : _subjectStatus == 'stranger_detected'
                                    ? Colors.redAccent
                                    : _subjectStatus == 'user_away'
                                    ? Colors.orangeAccent
                                    : const Color(0xFF00E5FF),
                                size: 13,
                              ),
                              const SizedBox(width: 5),
                              Flexible(
                                child: Text(
                                  _subjectStatus == 'matched'
                                      ? '🛡️ ĐÃ KHÓA: BẠN ($_subjectMatchScore%)'
                                      : _subjectStatus == 'stranger_detected'
                                      ? '🚫 CHẶN: PHÁT HIỆN NGƯỜI LẠ'
                                      : _subjectStatus == 'user_away'
                                      ? '⚠️ BẠN ĐANG RỜI CAMERA'
                                      : '🔒 ĐANG KHÓA DUY NHẤT BẠN...',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w800,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      // Timer
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A).withValues(alpha: 0.85),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white24),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.timer, color: Colors.white, size: 12),
                            const SizedBox(width: 3),
                            Text(
                              '${_elapsedSeconds ~/ 60}:${(_elapsedSeconds % 60).toString().padLeft(2, '0')}',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 6),
                      // Top Quick End/Exit Button
                      InkWell(
                        onTap: _isSessionActive ? _endSession : () => Navigator.pop(context),
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
                          decoration: BoxDecoration(
                            color: _isSessionActive
                                ? const Color(0xFFFF4757).withValues(alpha: 0.95)
                                : Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: _isSessionActive ? const Color(0xFFFF6B81) : Colors.white38,
                              width: 1,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                _isSessionActive ? Icons.flag : Icons.close,
                                color: Colors.white,
                                size: 12,
                              ),
                              const SizedBox(width: 3),
                              Text(
                                _isSessionActive ? 'KẾT THÚC' : 'THOÁT',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 10.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Camera Scan & Position Detection Banner - High-Contrast Crystal-Clear HUD
                if (!_isSessionActive && _countdown == 0)
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withValues(alpha: 0.92),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _scanConfidence >= 70 ? const Color(0xFF2ED573) : const Color(0xFF00E5FF),
                        width: 1.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.6),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Row 1: Scan Icon + Title + Confidence + Quick Start Button
                        Row(
                          children: [
                            // Icon + Title - HIGH CONTRAST DARK BG + BRIGHT TEXT
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F172A).withValues(alpha: 0.95),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: const Color(0xFF00E5FF), width: 2),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF00E5FF).withValues(alpha: 0.6),
                                    blurRadius: 12,
                                    spreadRadius: 2,
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.document_scanner, color: Color(0xFF00E5FF), size: 20),
                                  const SizedBox(width: 8),
                                  Text(
                                    widget.exerciseType == ExerciseTypeEnum.pullup
                                        ? 'CHỐT MỐC XÀ & NHẬN DIỆN BẠN'
                                        : 'NHẬN DIỆN NGƯỜI TẬP',
                                    style: const TextStyle(
                                      color: Color(0xFF00E5FF),
                                      fontWeight: FontWeight.w900,
                                      fontSize: 14,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: _scanConfidence >= 70
                                    ? const Color(0xFF2ED573).withValues(alpha: 0.25)
                                    : const Color(0xFFFFA502).withValues(alpha: 0.25),
                                borderRadius: BorderRadius.circular(6),
                                border: Border.all(
                                  color: _scanConfidence >= 70 ? const Color(0xFF2ED573) : const Color(0xFFFFA502),
                                  width: 1,
                                ),
                              ),
                              child: Text(
                                '$_scanConfidence%',
                                style: TextStyle(
                                  color: _scanConfidence >= 70 ? const Color(0xFF2ED573) : const Color(0xFFFFA502),
                                  fontWeight: FontWeight.w900,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            InkWell(
                              onTap: () {
                                setState(() {
                                  _isSessionActive = true;
                                  _isCorrectForm = true;
                                });
                              },
                              borderRadius: BorderRadius.circular(8),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.white30, width: 1),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.play_arrow, size: 13, color: Colors.white),
                                    SizedBox(width: 3),
                                    Text('Vào tập ngay', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10.5)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        // Row 2: Slim Progress bar
                        ClipRRect(
                          borderRadius: BorderRadius.circular(2),
                          child: LinearProgressIndicator(
                            value: (_scanConfidence / 100.0).clamp(0.0, 1.0),
                            minHeight: 2.5,
                            backgroundColor: Colors.white12,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              _scanConfidence >= 70 ? const Color(0xFF2ED573) : const Color(0xFF00E5FF),
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),
                        // Row 3: Horizontal Mini Chips
                        Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          children: [
                            _ScanChip(
                              label: 'Người thật',
                              icon: Icons.person,
                              isOk: _landmarks.isNotEmpty,
                            ),
                            _ScanChip(
                              label: widget.exerciseType == ExerciseTypeEnum.pullup ? 'Thấy xà' : 'Toàn thân',
                              icon: Icons.visibility,
                              isOk: _landmarks.length >= 6,
                            ),
                            _ScanChip(
                              label: widget.exerciseType == ExerciseTypeEnum.pullup ? 'Bám xà' : 'Phẳng sàn',
                              icon: widget.exerciseType == ExerciseTypeEnum.pullup ? Icons.pan_tool : Icons.straighten,
                              isOk: _scanConfidence >= 50,
                            ),
                            _ScanChip(
                              label: widget.exerciseType == ExerciseTypeEnum.pullup ? 'Treo người' : 'Chống tay',
                              icon: Icons.accessibility_new,
                              isOk: _scanConfidence >= 70,
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        // Row 4: 1-line subtle dynamic status
                        Row(
                          children: [
                            const Text('💡', style: TextStyle(fontSize: 11)),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                _scanDetails,
                                style: const TextStyle(color: Color(0xFFFFEAA7), fontSize: 10.5, fontWeight: FontWeight.bold),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
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
                
                // Real-time Angle & Rep Display HUD (Compacted)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  child: Column(
                    children: [
                      // Large Rep Counter
                      Text(
                        '$_repCount',
                        style: TextStyle(
                          fontSize: 62,
                          fontWeight: FontWeight.w900,
                          color: _isCorrectForm ? const Color(0xFF2ED573) : const Color(0xFFFFA502),
                          height: 1.0,
                          shadows: [
                            Shadow(color: Colors.black.withValues(alpha: 0.8), blurRadius: 15),
                          ],
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        widget.exerciseType.name,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.white70,
                        ),
                      ),
                      const SizedBox(height: 6),

                      // Biomechanical Joint Angle Pills & Depth Status
                      if (_isSessionActive)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            if (_currentAngle > 0)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                                decoration: BoxDecoration(
                                  color: Colors.black87,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: _currentAngle <= (widget.exerciseType == ExerciseTypeEnum.pushup ? 90 : 85)
                                        ? const Color(0xFF2ED573)
                                        : Colors.white24,
                                  ),
                                ),
                                child: Text(
                                  'Góc tay: ${_currentAngle.round()}°',
                                  style: TextStyle(
                                    color: _currentAngle <= (widget.exerciseType == ExerciseTypeEnum.pushup ? 90 : 85)
                                        ? const Color(0xFF2ED573)
                                        : Colors.white70,
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            if (widget.exerciseType == ExerciseTypeEnum.pushup && _bodyAlignmentAngle > 0) ...[
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                                decoration: BoxDecoration(
                                  color: Colors.black87,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: _bodyAlignmentAngle >= 150 ? const Color(0xFF2ED573) : Colors.orange,
                                  ),
                                ),
                                child: Text(
                                  'Thân: ${_bodyAlignmentAngle.round()}°',
                                  style: TextStyle(
                                    color: _bodyAlignmentAngle >= 150 ? const Color(0xFF2ED573) : Colors.orange,
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                            const SizedBox(width: 6),
                            // Depth Status Badge
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                              decoration: BoxDecoration(
                                color: _reachedDepth
                                    ? const Color(0xFF2ED573).withValues(alpha: 0.25)
                                    : _depthStatus == 'going_down'
                                    ? Colors.orange.withValues(alpha: 0.25)
                                    : Colors.white10,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: _reachedDepth
                                      ? const Color(0xFF2ED573)
                                      : _depthStatus == 'going_down'
                                      ? Colors.orange
                                      : Colors.white24,
                                ),
                              ),
                              child: Text(
                                widget.exerciseType == ExerciseTypeEnum.pullup
                                    ? (_reachedDepth
                                        ? '✅ ĐẦU VƯỢT QUA XÀ'
                                        : _depthStatus == 'going_down'
                                        ? '⚠️ KÉO ĐẦU QUA TAY'
                                        : '🏋️ TREO NGƯỜI DUỖI TAY')
                                    : (_reachedDepth
                                        ? '✅ VAI QUA KHUỶU (ĐẠT CHUẨN)'
                                        : _depthStatus == 'going_down'
                                        ? '⚠️ HẠ SÂU THÊM (≤90°)'
                                        : '💪 VỊ TRÍ CAO'),
                                style: TextStyle(
                                  color: _reachedDepth
                                      ? const Color(0xFF2ED573)
                                      : _depthStatus == 'going_down'
                                      ? Colors.orange
                                      : Colors.white70,
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),

                      const SizedBox(height: 6),

                      // Coaching Feedback Pill
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: _isCorrectForm
                              ? const Color(0xFF2ED573).withValues(alpha: 0.85)
                              : Colors.orange.withValues(alpha: 0.9),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Text(
                          _feedback,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ),
                      const SizedBox(height: 6),

                      // Stats row (Chuẩn vs Tổng)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF2ED573).withValues(alpha: 0.25),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              '✓ Chuẩn Form: $_correctCount',
                              style: const TextStyle(color: Color(0xFF2ED573), fontWeight: FontWeight.bold, fontSize: 11),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.white12,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'Tổng: $_repCount',
                              style: const TextStyle(color: Colors.white70, fontSize: 11),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                // Bottom Button Control - Always accessible End and Exit buttons
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  child: _isSessionActive
                      ? SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: _endSession,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFFF4757),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                              elevation: 4,
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.flag, size: 20),
                                SizedBox(width: 8),
                                Text(
                                  'KẾT THÚC & NHẬN THƯỞNG',
                                  style: TextStyle(
                                    fontSize: 14.5,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      : Row(
                          children: [
                            // Exit Button
                            OutlinedButton(
                              onPressed: () => Navigator.pop(context),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.white70,
                                side: const BorderSide(color: Colors.white38),
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.close, size: 16, color: Colors.white70),
                                  SizedBox(width: 4),
                                  Text(
                                    'THOÁT',
                                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 10),
                            // Quick Start Button
                            Expanded(
                              child: ElevatedButton(
                                onPressed: _startSession,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF2ED573),
                                  foregroundColor: const Color(0xFF0F0F23),
                                  padding: const EdgeInsets.symmetric(vertical: 13),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                ),
                                child: const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.play_arrow, size: 18),
                                    SizedBox(width: 6),
                                    Text(
                                      'VÀO TẬP NGAY',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w900,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
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

/// Skeleton painter for pose visualization - WEB-STYLE VERSION
/// Mobile-optimized with lower thresholds and brighter rendering
class SkeletonPainter extends CustomPainter {
  final Map<String, Offset> landmarks;
  final Map<String, double> visibility;
  final bool isCorrectForm;
  final bool isPullup;
  final double virtualBarY;
  final bool reachedDepth;
  final String? warningMessage;
  
  SkeletonPainter({
    required this.landmarks,
    required this.visibility,
    required this.isCorrectForm,
    this.isPullup = false,
    this.virtualBarY = 0.0,
    this.reachedDepth = false,
    this.warningMessage,
  });
  
  // Full body connections matching frontend web
  static const connections = [
    // Torso
    ['leftShoulder', 'rightShoulder'],
    ['leftShoulder', 'leftHip'],
    ['rightShoulder', 'rightHip'],
    ['leftHip', 'rightHip'],
    // Left arm
    ['leftShoulder', 'leftElbow'],
    ['leftElbow', 'leftWrist'],
    // Right arm
    ['rightShoulder', 'rightElbow'],
    ['rightElbow', 'rightWrist'],
    // Left leg
    ['leftHip', 'leftKnee'],
    ['leftKnee', 'leftAnkle'],
    // Right leg
    ['rightHip', 'rightKnee'],
    ['rightKnee', 'rightAnkle'],
  ];
  
  // Face connections (head/face)
  static const faceConnections = [
    ['nose', 'leftEye'],
    ['nose', 'rightEye'],
    ['leftEye', 'leftEar'],
    ['rightEye', 'rightEar'],
  ];
  
  // Key joint points to highlight
  static const keyJoints = [
    'leftShoulder', 'rightShoulder',
    'leftElbow', 'rightElbow',
    'leftWrist', 'rightWrist',
    'leftHip', 'rightHip',
    'leftKnee', 'rightKnee',
    'nose',
  ];
  
  // Very low visibility threshold for mobile - show more points
  static const double VISIBILITY_THRESHOLD = 0.15;
  
  @override
  void paint(Canvas canvas, Size size) {
    // Debug: log how many landmarks we have
    debugPrint('🔍 SkeletonPainter: ${landmarks.length} landmarks detected');
    
    // If no landmarks, don't draw anything
    if (landmarks.isEmpty) {
      debugPrint('⚠️ SkeletonPainter: No landmarks to draw!');
      return;
    }
    
    // ── Vẽ thanh xà ảo khi hít xà ──
    if (isPullup && virtualBarY > 0) {
      final barColor = reachedDepth ? const Color(0xFF2ED573) : const Color(0xFFFFD700);
      
      // Glow effect - BRIGHTER
      final glowPaint = Paint()
        ..color = barColor.withValues(alpha: 0.6)
        ..strokeWidth = 20
        ..style = PaintingStyle.stroke
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 12);
      canvas.drawLine(
        Offset(20, virtualBarY),
        Offset(size.width - 20, virtualBarY),
        glowPaint,
      );
      
      // Main bar - THICKER
      final barPaint = Paint()
        ..color = barColor
        ..strokeWidth = 8.0
        ..style = PaintingStyle.stroke;
      canvas.drawLine(
        Offset(20, virtualBarY),
        Offset(size.width - 20, virtualBarY),
        barPaint,
      );

      // Badge text - LARGER
      final textSpan = TextSpan(
        text: reachedDepth ? '✨ ĐÃ VƯỢT XÀ' : '🎯 VỊ TRÍ XÀ',
        style: const TextStyle(
          color: Color(0xFFFFD700),
          fontSize: 16,
          fontWeight: FontWeight.bold,
        ),
      );
      final textPainter = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
      )..layout();

      final badgeRect = RRect.fromRectAndRadius(
        Rect.fromLTWH(24, math.max(10.0, virtualBarY - 40.0), textPainter.width + 32, 36),
        const Radius.circular(12),
      );
      canvas.drawRRect(badgeRect, Paint()..color = const Color(0xFF1E293B).withValues(alpha: 0.95));
      canvas.drawRRect(badgeRect, Paint()..color = barColor..strokeWidth = 3..style = PaintingStyle.stroke);
      textPainter.paint(canvas, Offset(40, math.max(10.0, virtualBarY - 40.0) + 10));
    }
    
    // ── Cảnh báo form sai ──
    if (warningMessage != null && !isCorrectForm) {
      _drawWarningBadge(canvas, size, warningMessage!);
    }

    // ── Xác định màu sắc theo form - BRIGHT COLORS ──
    Color primaryColor;
    if (isCorrectForm) {
      primaryColor = const Color(0xFF00FF88); // BRIGHT GREEN
    } else {
      primaryColor = const Color(0xFFFF4444); // BRIGHT RED
    }
    
    // ── Draw skeleton with multiple layers for better visibility ──
    
    // Layer 1: Thick glow (outermost)
    final glowPaint = Paint()
      ..color = primaryColor.withValues(alpha: 0.5)
      ..strokeWidth = 30
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 20);
    
    // Layer 2: Black outline for contrast
    final outlinePaint = Paint()
      ..color = Colors.black
      ..strokeWidth = 16
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    
    // Layer 3: Main colored line
    final paint = Paint()
      ..color = primaryColor
      ..strokeWidth = 10
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    
    // Layer 4: Inner highlight
    final highlightPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.6)
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    
    // ── Draw body connections ──
    int drawnConnections = 0;
    for (final connection in connections) {
      for (int i = 0; i < connection.length - 1; i++) {
        final startName = connection[i];
        final endName = connection[i + 1];
        final start = landmarks[startName];
        final end = landmarks[endName];
        
        if (start != null && end != null) {
          // Check visibility
          final startVis = visibility[startName] ?? 0.5;
          final endVis = visibility[endName] ?? 0.5;
          
          // Draw if visibility is above threshold
          if (startVis > VISIBILITY_THRESHOLD && endVis > VISIBILITY_THRESHOLD) {
            drawnConnections++;
            
            // Draw all layers
            canvas.drawLine(start, end, glowPaint);
            canvas.drawLine(start, end, outlinePaint);
            canvas.drawLine(start, end, paint);
            canvas.drawLine(start, end, highlightPaint);
          }
        }
      }
    }
    
    debugPrint('📍 SkeletonPainter: drew $drawnConnections connections');
    
    // ── Draw face connections ──
    final facePaint = Paint()
      ..color = primaryColor.withValues(alpha: 0.9)
      ..strokeWidth = 6
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    
    for (final connection in faceConnections) {
      final start = landmarks[connection[0]];
      final end = landmarks[connection[1]];
      if (start != null && end != null) {
        final startVis = visibility[connection[0]] ?? 0.5;
        final endVis = visibility[connection[1]] ?? 0.5;
        if (startVis > VISIBILITY_THRESHOLD && endVis > VISIBILITY_THRESHOLD) {
          canvas.drawLine(start, end, facePaint);
        }
      }
    }
    
    // ── Draw joint points ──
    final pointGlowPaint = Paint()
      ..color = primaryColor.withValues(alpha: 0.6)
      ..style = PaintingStyle.fill
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 20);
    
    final pointPaint = Paint()
      ..color = primaryColor
      ..style = PaintingStyle.fill;
    
    final corePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    
    final pointOutlinePaint = Paint()
      ..color = Colors.black
      ..style = PaintingStyle.stroke
      ..strokeWidth = 5;
    
    for (final entry in landmarks.entries) {
      final name = entry.key;
      final pos = entry.value;
      final vis = visibility[name] ?? 0.5;
      
      // Only draw if visibility is above threshold
      if (vis > VISIBILITY_THRESHOLD) {
        final isKeyJoint = keyJoints.contains(name);
        final radius = isKeyJoint ? 22.0 : 14.0;
        
        // Draw glow
        canvas.drawCircle(pos, radius + 12, pointGlowPaint);
        // Draw main circle
        canvas.drawCircle(pos, radius, pointPaint);
        // Draw white core
        canvas.drawCircle(pos, radius * 0.5, corePaint);
        // Draw outline
        canvas.drawCircle(pos, radius, pointOutlinePaint);
        
        debugPrint('  🦴 Drew point: $name at ${pos.dx.toStringAsFixed(0)},${pos.dy.toStringAsFixed(0)} (vis: ${vis.toStringAsFixed(2)})');
      }
    }
    
    debugPrint('✅ SkeletonPainter paint complete');
  }
  
  void _drawWarningBadge(Canvas canvas, Size size, String message) {
    final textSpan = TextSpan(
      text: '⚠️ $message',
      style: const TextStyle(
        color: Colors.orange,
        fontSize: 14,
        fontWeight: FontWeight.bold,
      ),
    );
    final textPainter = TextPainter(
      text: textSpan,
      textDirection: TextDirection.ltr,
    )..layout();

    final badgeRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(
        (size.width - textPainter.width - 32) / 2,
        size.height * 0.15,
        textPainter.width + 32,
        36,
      ),
      const Radius.circular(12),
    );
    canvas.drawRRect(badgeRect, Paint()..color = const Color(0xFF1E293B).withValues(alpha: 0.95));
    canvas.drawRRect(badgeRect, Paint()..color = Colors.orange..strokeWidth = 2..style = PaintingStyle.stroke);
    textPainter.paint(canvas, Offset((size.width - textPainter.width) / 2, size.height * 0.15 + 10));
  }
  
  @override
  bool shouldRepaint(SkeletonPainter oldDelegate) => true;
}

class _ScanChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isOk;

  const _ScanChip({
    required this.label,
    required this.icon,
    required this.isOk,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2.5),
      decoration: BoxDecoration(
        color: isOk ? const Color(0xFF2ED573).withValues(alpha: 0.2) : const Color(0xFF1E293B).withValues(alpha: 0.75),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: isOk ? const Color(0xFF2ED573) : const Color(0xFF94A3B8).withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: isOk ? const Color(0xFF2ED573) : Colors.white70),
          const SizedBox(width: 3),
          Text(
            '$label: ',
            style: TextStyle(
              color: isOk ? Colors.white : const Color(0xFFE2E8F0),
              fontWeight: FontWeight.bold,
              fontSize: 10,
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
            decoration: BoxDecoration(
              color: isOk ? const Color(0xFF2ED573).withValues(alpha: 0.25) : const Color(0xFF94A3B8).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              isOk ? 'Đạt' : 'Chờ',
              style: TextStyle(
                color: isOk ? const Color(0xFF2ED573) : const Color(0xFF94A3B8),
                fontWeight: FontWeight.w900,
                fontSize: 9.5,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
