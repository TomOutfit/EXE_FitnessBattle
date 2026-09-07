import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:camera/camera.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import '../../../../core/services/pose_detection_service.dart';
import '../../../../core/services/exercise_analyzer.dart';
import '../../../../core/services/anticheat_service.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/models_exercise.dart';

/// Camera-based exercise tracking page
class ExerciseCameraPage extends StatefulWidget {
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
  State<ExerciseCameraPage> createState() => _ExerciseCameraPageState();
}

class _ExerciseCameraPageState extends State<ExerciseCameraPage> with WidgetsBindingObserver {
  // Services
  PoseDetectionService? _poseService;
  PoseDetector? _poseDetector;
  ExerciseAnalyzer? _analyzer;
  AntiCheatService? _antiCheat;
  
  // Camera
  CameraController? _camera;
  CameraDescription? _cameraDescription;
  bool _isCameraInitialized = false;
  String? _cameraError;
  bool _isProcessingFrame = false;
  
  // State
  int _repCount = 0;
  int _correctCount = 0;
  String _feedback = '';
  bool _isCorrectForm = true;
  List<String> _formIssues = [];
  int _elapsedSeconds = 0;
  bool _isSessionActive = false;
  Timer? _sessionTimer;
  Timer? _feedbackTimer;
  
  // Pose visualization
  List<Offset> _skeletonPoints = [];
  Map<String, Offset> _landmarks = {};
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initializeServices();
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
      options: PoseDetectorOptions(mode: PoseDetectionMode.stream),
    );

    // Initialize pose detection service
    _poseService = PoseDetectionService();
    _poseService!.onPoseDetected = _onPoseDetected;
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
        setState(() => _cameraError = 'Không tìm thấy camera');
        return;
      }
      
      // Use front camera for exercise tracking
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
  
  /// Process camera image for pose detection
  Future<void> _processCameraImage(CameraImage image) async {
    if (_poseDetector == null || !_isSessionActive || _isProcessingFrame) return;
    _isProcessingFrame = true;
    
    try {
      // Convert camera image to input image
      final inputImage = _convertCameraImage(image);
      if (inputImage == null) return;
      
      // Detect pose
      final poses = await _poseDetector!.processImage(inputImage);
      
      if (poses.isNotEmpty) {
        final pose = poses.first;
        
        // Run pose through analyzer
        final analysis = _analyzer!.analyzePose(pose);
        
        // Run anti-cheat validation
        final antiCheatResult = _antiCheat!.validatePose(
          pose,
          widget.exerciseType == ExerciseTypeEnum.pushup
              ? RealExerciseType.pushup
              : RealExerciseType.pullup,
        );
        
        // Update UI on main thread
        if (mounted) {
          setState(() {
            _repCount = analysis.repCount;
            _isCorrectForm = analysis.isCorrectForm && antiCheatResult.isValid;
            _feedback = analysis.feedback ?? antiCheatResult.warning ?? '';
            _formIssues = [...analysis.formIssues, ...antiCheatResult.violations.map((v) => _antiCheat!.getViolationMessage(v))];
            _updateSkeletonPoints(pose, image);
          });
        }
      }
      
    } catch (e) {
      debugPrint('Error processing image: $e');
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
  
  /// Handle pose detection
  void _onPoseDetected(Pose pose) {
    if (!_isSessionActive) return;
    
    final analysis = _analyzer!.analyzePose(pose);
    
    setState(() {
      _repCount = analysis.repCount;
      _isCorrectForm = analysis.isCorrectForm;
      _feedback = analysis.feedback ?? '';
      _formIssues = analysis.formIssues;
    });
  }
  
  /// Handle camera errors
  void _onCameraError(String error) {
    if (mounted) {
      setState(() => _cameraError = error);
    }
  }
  
  /// Handle rep completion
  void _onRepCompleted(int count, bool isCorrect) {
    setState(() {
      if (isCorrect) _correctCount++;
    });
    
    // Show feedback
    _showFeedback(isCorrect ? 'Chuẩn form!' : 'Sai form - Chưa đạt');
  }
  
  /// Show feedback toast
  void _showFeedback(String message) {
    _feedbackTimer?.cancel();
    setState(() => _feedback = message);
    _feedbackTimer = Timer(const Duration(seconds: 1), () {
      if (mounted) setState(() => _feedback = '');
    });
  }
  
  /// Update skeleton visualization points
  void _updateSkeletonPoints(Pose pose, CameraImage image) {
    final size = Size(image.width.toDouble(), image.height.toDouble());
    final landmarks = <String, Offset>{};
    
    for (final entry in pose.landmarks.entries) {
      final landmark = entry.value;
      // Convert normalized coordinates to screen coordinates
      landmarks[entry.key.name] = Offset(
        landmark.x / size.width * 400,
        landmark.y / size.height * 600,
      );
    }
    
    setState(() => _landmarks = landmarks);
  }
  
  /// Start exercise session
  void _startSession() {
    setState(() {
      _isSessionActive = true;
      _repCount = 0;
      _correctCount = 0;
      _formIssues = [];
      _elapsedSeconds = 0;
    });
    
    _analyzer?.reset();
    _antiCheat?.reset();
    
    // Start timer
    _sessionTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() => _elapsedSeconds++);
        
        // Auto-end session after 3 minutes (training mode)
        if (!widget.isBattleMode && _elapsedSeconds >= 180) {
          _endSession();
        }
      }
    });
  }
  
  /// End exercise session
  void _endSession() {
    _sessionTimer?.cancel();
    setState(() => _isSessionActive = false);
    
    // Show results
    widget.onSessionComplete?.call(_repCount, _correctCount, _formIssues);
    _showResultsDialog();
  }
  
  /// Show results dialog
  void _showResultsDialog() {
    final accuracy = _repCount > 0 ? (_correctCount / _repCount * 100) : 0.0;
    
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
            const SizedBox(height: 24),
            Text(
              widget.exerciseType.emoji,
              style: const TextStyle(fontSize: 64),
            ),
            const SizedBox(height: 16),
            const Text(
              'HOÀN THÀNH!',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _ResultItem(label: 'Tổng', value: '$_repCount', color: AppColors.primary),
                _ResultItem(label: 'Chuẩn', value: '$_correctCount', color: AppColors.success),
                _ResultItem(label: 'Độ chính xác', value: '${accuracy.toStringAsFixed(0)}%', color: AppColors.accent),
              ],
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  _startSession();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('TẬP LẠI', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Đóng'),
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
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error, color: Colors.red, size: 48),
                  const SizedBox(height: 16),
                  Text(
                    _cameraError!,
                    style: const TextStyle(color: Colors.white),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _initializeCamera,
                    child: const Text('Thử lại'),
                  ),
                ],
              ),
            )
          else
            const Center(child: CircularProgressIndicator()),
          
          // Skeleton Overlay
          if (_landmarks.isNotEmpty)
            CustomPaint(
              size: Size.infinite,
              painter: SkeletonPainter(
                landmarks: _landmarks,
                isCorrectForm: _isCorrectForm,
              ),
            ),
          
          // Top Bar
          SafeArea(
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.timer, color: Colors.white, size: 18),
                            const SizedBox(width: 8),
                            Text(
                              '${_elapsedSeconds ~/ 60}:${(_elapsedSeconds % 60).toString().padLeft(2, '0')}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                
                const Spacer(),
                
                // Count Display
                Container(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      Text(
                        '$_repCount',
                        style: TextStyle(
                          fontSize: 120,
                          fontWeight: FontWeight.bold,
                          color: exerciseColor,
                          shadows: [
                            Shadow(
                              color: Colors.black.withValues(alpha: 0.5),
                              blurRadius: 10,
                            ),
                          ],
                        ),
                      ),
                      Text(
                        widget.exerciseType.name,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                          shadows: [
                            Shadow(
                              color: Colors.black,
                              blurRadius: 5,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 6),
                      // Realtime guidance or success badge
                      if (_feedback.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: _isCorrectForm ? Colors.green.withValues(alpha: 0.9) : Colors.orange.withValues(alpha: 0.9),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: (_isCorrectForm ? Colors.green : Colors.orange).withValues(alpha: 0.4),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Text(
                            _feedback,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        )
                      else if (_formIssues.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.red.withValues(alpha: 0.85),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            _formIssues.first,
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                          ),
                        )
                      else if (_isSessionActive)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.black45,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Text(
                            'AI đang tự động đếm...',
                            style: TextStyle(color: Colors.white70, fontSize: 13),
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
                              color: Colors.green.withValues(alpha: 0.25),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '✓ Chuẩn: $_correctCount',
                              style: const TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white12,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'Tổng: $_repCount',
                              style: const TextStyle(color: Colors.white70),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                // Controls
                Container(
                  padding: const EdgeInsets.all(24),
                  child: _isSessionActive
                      ? Row(
                          children: [
                            Expanded(
                              child: ElevatedButton(
                                onPressed: _endSession,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.red,
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                ),
                                child: const Text('KẾT THÚC', style: TextStyle(fontWeight: FontWeight.bold)),
                              ),
                            ),
                          ],
                        )
                      : ElevatedButton(
                          onPressed: _startSession,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: exerciseColor,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 48,
                              vertical: 16,
                            ),
                          ),
                          child: const Text(
                            'BẮT ĐẦU TẬP',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
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
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
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
  
  // Skeleton connections
  static const connections = [
    ['leftEar', 'leftEye', 'nose', 'rightEye', 'rightEar'],
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
      ..color = isCorrectForm ? Colors.green : Colors.red
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke;
    
    final pointPaint = Paint()
      ..color = isCorrectForm ? Colors.green : Colors.red
      ..style = PaintingStyle.fill;
    
    // Draw connections
    for (final connection in connections) {
      for (int i = 0; i < connection.length - 1; i++) {
        final start = landmarks[connection[i]];
        final end = landmarks[connection[i + 1]];
        
        if (start != null && end != null) {
          canvas.drawLine(start, end, paint);
        }
      }
    }
    
    // Draw points
    for (final landmark in landmarks.values) {
      canvas.drawCircle(landmark, 6, pointPaint);
    }
  }
  
  @override
  bool shouldRepaint(SkeletonPainter oldDelegate) {
    return landmarks != oldDelegate.landmarks ||
           isCorrectForm != oldDelegate.isCorrectForm;
  }
}
