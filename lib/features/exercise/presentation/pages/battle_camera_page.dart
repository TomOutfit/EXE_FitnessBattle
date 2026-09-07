import 'dart:async';
import 'dart:math' as math;
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import '../../../../core/services/exercise_analyzer.dart';
import '../../../../core/services/anticheat_service.dart';
import '../../../../core/models_exercise.dart';

/// Battle Camera Page - Real-time 2-player battle with split screen cameras
class BattleCameraPage extends StatefulWidget {
  final ExerciseTypeEnum exerciseType;
  final Function(int myScore, int oppScore)? onBattleComplete;
  
  const BattleCameraPage({
    super.key,
    required this.exerciseType,
    this.onBattleComplete,
  });
  
  @override
  State<BattleCameraPage> createState() => _BattleCameraPageState();
}

class _BattleCameraPageState extends State<BattleCameraPage> with WidgetsBindingObserver {
  // Cameras
  CameraController? _frontCamera;
  CameraController? _backCamera;
  bool _isInitialized = false;
  bool _useFrontCamera = true;
  
  // Battle state
  int _myCount = 0;
  int _opponentCount = 0;
  int _myCorrectCount = 0;
  int _timeRemaining = 60;
  bool _isRunning = false;
  bool _showResults = false;
  
  // Pose detection
  PoseDetector? _poseDetector;
  bool _isProcessingFrame = false;
  
  // Analyzer
  ExerciseAnalyzer? _analyzer;
  AntiCheatService? _antiCheat;
  
  // Timer
  Timer? _battleTimer;
  Timer? _opponentTimer;
  
  // Skeleton points
  Map<String, Offset> _myLandmarks = {};
  Map<String, Offset> _opponentLandmarks = {};
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initializeBattle();
  }
  
  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _disposeResources();
    super.dispose();
  }
  
  Future<void> _initializeBattle() async {
    // Initialize pose detector
    _poseDetector = PoseDetector(
      options: PoseDetectorOptions(mode: PoseDetectionMode.stream),
    );
    
    // Initialize analyzer
    _analyzer = ExerciseAnalyzer(
      exerciseType: widget.exerciseType == ExerciseTypeEnum.pushup
          ? RealExerciseType.pushup
          : RealExerciseType.pullup,
    );
    _analyzer!.onRepCompleted = (count, isCorrect) {
      if (mounted) {
        setState(() {
          _myCount = count;
          if (isCorrect) _myCorrectCount++;
        });
      }
    };
    
    _antiCheat = AntiCheatService();
    
    // Initialize cameras
    await _initializeCameras();
    
    // Start battle
    _startBattle();
  }
  
  Future<void> _initializeCameras() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) return;
      
      // Setup front camera (main camera for player)
      final frontCamera = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );
      
      _frontCamera = CameraController(
        frontCamera,
        ResolutionPreset.high,
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.yuv420,
      );
      
      await _frontCamera!.initialize();
      await _frontCamera!.startImageStream(_processImage);
      
      // Try to get back camera for opponent view (if available and different)
      if (cameras.length > 1) {
        final backCamera = cameras.firstWhere(
          (c) => c.lensDirection == CameraLensDirection.back,
          orElse: () => cameras.first,
        );
        
        if (backCamera != frontCamera) {
          _backCamera = CameraController(
            backCamera,
            ResolutionPreset.medium,
            enableAudio: false,
            imageFormatGroup: ImageFormatGroup.yuv420,
          );
          
          try {
            await _backCamera!.initialize();
          } catch (e) {
            // Back camera might not be accessible
            _backCamera = null;
          }
        }
      }
      
      setState(() => _isInitialized = true);
    } catch (e) {
      debugPrint('Camera error: $e');
    }
  }
  
  Future<void> _processImage(CameraImage image) async {
    if (!_isRunning || _poseDetector == null || _isProcessingFrame) return;
    _isProcessingFrame = true;
    
    try {
      final inputImage = _convertImage(image);
      if (inputImage == null) return;
      
      final poses = await _poseDetector!.processImage(inputImage);
      
      if (poses.isNotEmpty) {
        final pose = poses.first;
        
        // Analyze pose
        _analyzer?.analyzePose(pose);
        
        // Anti-cheat
        final antiCheatResult = _antiCheat?.validatePose(
          pose,
          widget.exerciseType == ExerciseTypeEnum.pushup
              ? RealExerciseType.pushup
              : RealExerciseType.pullup,
        );
        
        // Update landmarks for skeleton overlay
        final landmarks = <String, Offset>{};
        for (final entry in pose.landmarks.entries) {
          landmarks[entry.key.name] = Offset(
            entry.value.x / image.width * 200,
            entry.value.y / image.height * 300,
          );
        }
        
        if (mounted) {
          setState(() {
            _myLandmarks = landmarks;
          });
        }
      }
    } catch (e) {
      debugPrint('Process error: $e');
    } finally {
      _isProcessingFrame = false;
    }
  }
  
  InputImage? _convertImage(CameraImage image) {
    try {
      final imageFormat = image.format.group == ImageFormatGroup.yuv420
          ? InputImageFormat.yuv420
          : InputImageFormat.nv21;
      
      final WriteBuffer allBytes = WriteBuffer();
      for (final Plane plane in image.planes) {
        allBytes.putUint8List(plane.bytes);
      }
      final bytes = allBytes.done().buffer.asUint8List();

      return InputImage.fromBytes(
        bytes: bytes,
        metadata: InputImageMetadata(
          size: Size(image.width.toDouble(), image.height.toDouble()),
          rotation: InputImageRotation.rotation270deg,
          format: imageFormat,
          bytesPerRow: image.planes.first.bytesPerRow,
        ),
      );
    } catch (e) {
      return null;
    }
  }
  
  void _startBattle() {
    setState(() {
      _isRunning = true;
      _myCount = 0;
      _opponentCount = 0;
      _myCorrectCount = 0;
      _timeRemaining = 60;
      _showResults = false;
    });
    
    _analyzer?.reset();
    
    // Start battle timer
    _battleTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          _timeRemaining--;
          if (_timeRemaining <= 0) {
            _endBattle();
          }
        });
      }
    });
    
    // Simulate opponent (in real app, this would be another player's camera)
    _simulateOpponent();
  }
  
  void _simulateOpponent() {
    // Simulate opponent with random intervals (2-4 seconds)
    _opponentTimer = Timer.periodic(
      Duration(seconds: 2 + (DateTime.now().second % 3)), 
      (timer) {
        if (mounted && _isRunning && !_showResults) {
          setState(() => _opponentCount++);
        }
      },
    );
    
    // Simulate opponent movement periodically
    Timer.periodic(const Duration(milliseconds: 500), (timer) {
      if (!mounted || !_isRunning || _showResults) {
        timer.cancel();
        return;
      }
      // Random opponent landmarks for visualization
      final random = math.Random();
      setState(() {
        _opponentLandmarks = {
          'leftShoulder': Offset(50 + random.nextDouble() * 20, 100 + random.nextDouble() * 20),
          'leftElbow': Offset(60 + random.nextDouble() * 20, 150 + random.nextDouble() * 20),
          'leftWrist': Offset(70 + random.nextDouble() * 20, 200 + random.nextDouble() * 20),
          'rightShoulder': Offset(150 + random.nextDouble() * 20, 100 + random.nextDouble() * 20),
          'rightElbow': Offset(140 + random.nextDouble() * 20, 150 + random.nextDouble() * 20),
          'rightWrist': Offset(130 + random.nextDouble() * 20, 200 + random.nextDouble() * 20),
        };
      });
    });
  }
  
  void _endBattle() {
    _battleTimer?.cancel();
    _opponentTimer?.cancel();
    setState(() {
      _isRunning = false;
      _showResults = true;
    });
    
    widget.onBattleComplete?.call(_myCount, _opponentCount);
  }
  
  void _disposeResources() {
    _battleTimer?.cancel();
    _opponentTimer?.cancel();
    _frontCamera?.dispose();
    _backCamera?.dispose();
    _poseDetector?.close();
  }
  
  @override
  Widget build(BuildContext context) {
    final exerciseColor = Color(int.parse(widget.exerciseType.color.replaceAll('#', '0xFF')));
    
    return Scaffold(
      backgroundColor: Colors.black,
      body: _showResults ? _buildResults() : _buildBattleView(exerciseColor),
    );
  }
  
  Widget _buildBattleView(Color exerciseColor) {
    return SafeArea(
      child: Column(
        children: [
          // Top Bar - Timer and Scores
          _buildTopBar(exerciseColor),
          
          // Split Screen Cameras
          Expanded(
            child: Row(
              children: [
                // My Camera (Left side)
                Expanded(
                  child: _buildCameraView(
                    label: 'BẠN',
                    count: _myCount,
                    correctCount: _myCorrectCount,
                    landmarks: _myLandmarks,
                    color: exerciseColor,
                    isMe: true,
                  ),
                ),
                
                // Divider with VS
                Container(
                  width: 4,
                  color: Colors.white,
                ),
                
                // Opponent Camera (Right side)
                Expanded(
                  child: _buildCameraView(
                    label: 'ĐỐI THỦ',
                    count: _opponentCount,
                    correctCount: null,
                    landmarks: _opponentLandmarks,
                    color: Colors.grey,
                    isMe: false,
                  ),
                ),
              ],
            ),
          ),
          
          // Bottom Instructions
          _buildBottomBar(exerciseColor),
        ],
      ),
    );
  }
  
  Widget _buildTopBar(Color exerciseColor) {
    return Container(
      padding: const EdgeInsets.all(12),
      color: Colors.black87,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Close button
          IconButton(
            icon: const Icon(Icons.close, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
          
          // Timer
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            decoration: BoxDecoration(
              color: _timeRemaining <= 10 ? Colors.red : exerciseColor,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                const Icon(Icons.timer, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Text(
                  '$_timeRemaining',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          
          // Settings
          IconButton(
            icon: const Icon(Icons.flip_camera_ios, color: Colors.white),
            onPressed: _switchCamera,
            tooltip: 'Đổi camera',
          ),
        ],
      ),
    );
  }
  
  Widget _buildCameraView({
    required String label,
    required int count,
    int? correctCount,
    required Map<String, Offset> landmarks,
    required Color color,
    required bool isMe,
  }) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Camera Preview or Placeholder
        if (_isInitialized && _frontCamera != null && isMe)
          CameraPreview(_frontCamera!)
        else if (!isMe)
          // Opponent view - simulated or connected player
          Container(
            color: Colors.grey[900],
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.person,
                    size: 80,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Đang kết nối...',
                    style: TextStyle(color: Colors.grey[500]),
                  ),
                ],
              ),
            ),
          )
        else
          Container(
            color: Colors.black,
            child: const Center(
              child: CircularProgressIndicator(color: Colors.white),
            ),
          ),
        
        // Skeleton Overlay
        if (landmarks.isNotEmpty)
          CustomPaint(
            size: Size.infinite,
            painter: BattleSkeletonPainter(
              landmarks: landmarks,
              color: color,
            ),
          ),
        
        // Player Label and Score
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Colors.black54, Colors.transparent],
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Label
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: isMe ? color : Colors.grey,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    label,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
                
                // Score
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '$count',
                      style: TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                        color: isMe ? color : Colors.white,
                        shadows: [
                          Shadow(
                            color: Colors.black.withValues(alpha: 0.5),
                            blurRadius: 10,
                          ),
                        ],
                      ),
                    ),
                    if (correctCount != null)
                      Text(
                        '✓ $correctCount form tốt',
                        style: const TextStyle(
                          color: Colors.green,
                          fontSize: 10,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
        
        // Exercise Icon
        Positioned(
          bottom: 8,
          left: 0,
          right: 0,
          child: Center(
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                widget.exerciseType.emoji,
                style: const TextStyle(fontSize: 24),
              ),
            ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildBottomBar(Color exerciseColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: const BoxDecoration(
        color: Colors.black87,
        border: Border(top: BorderSide(color: Colors.white12)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.green.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.videocam, color: Colors.greenAccent, size: 20),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Camera AI tự động chấm điểm',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                Text(
                  'Tập đúng form để tự động +1 điểm',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: _endBattle,
            style: TextButton.styleFrom(
              foregroundColor: Colors.redAccent,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            ),
            child: const Text('DỪNG TRẬN', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
  
  Widget _buildResults() {
    final isWin = _myCount > _opponentCount;
    final isDraw = _myCount == _opponentCount;
    final pointsEarned = isDraw ? _myCount : (_myCount * 2);
    final accuracy = _myCount > 0 ? (_myCorrectCount / _myCount * 100) : 0.0;
    
    return Container(
      color: Colors.black,
      child: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Result Icon
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    color: isWin 
                        ? Colors.green.withValues(alpha: 0.2)
                        : (isDraw ? Colors.orange.withValues(alpha: 0.2) : Colors.red.withValues(alpha: 0.2)),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      isWin ? '🏆' : (isDraw ? '🤝' : '😤'),
                      style: const TextStyle(fontSize: 64),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                
                // Result Text
                Text(
                  isWin ? 'CHIẾN THẮNG!' : (isDraw ? 'HÒA!' : 'THUA!'),
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: isWin 
                        ? Colors.green 
                        : (isDraw ? Colors.orange : Colors.red),
                  ),
                ),
                const SizedBox(height: 32),
                
                // Scores Comparison
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    // My Score
                    Column(
                      children: [
                        const Text(
                          'BẠN',
                          style: TextStyle(color: Colors.white70, fontSize: 14),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '$_myCount',
                          style: TextStyle(
                            fontSize: 64,
                            fontWeight: FontWeight.bold,
                            color: isWin ? Colors.green : Colors.white,
                          ),
                        ),
                        Text(
                          '${accuracy.toStringAsFixed(0)}% form đúng',
                          style: const TextStyle(color: Colors.green, fontSize: 12),
                        ),
                      ],
                    ),
                    
                    // VS
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white10,
                        shape: BoxShape.circle,
                      ),
                      child: const Text(
                        'VS',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    
                    // Opponent Score
                    Column(
                      children: [
                        const Text(
                          'ĐỐI THỦ',
                          style: TextStyle(color: Colors.white70, fontSize: 14),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '$_opponentCount',
                          style: const TextStyle(
                            fontSize: 64,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                
                // Rewards
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white10,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    children: [
                      Text(
                        '+$pointsEarned ĐIỂM RANK',
                        style: const TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.amber,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _RewardItem(icon: '⭐', label: '+${_myCount * 10} XP'),
                          _RewardItem(icon: '💰', label: '+${_myCount * 5} Coins'),
                          _RewardItem(icon: '🔥', label: '+${isWin ? 3 : 1} Streak'),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                
                // Action Buttons
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      setState(() => _showResults = false);
                      _startBattle();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text(
                      'CHƠI LẠI',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('VỀ TRANG CHỦ'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
  
  void _switchCamera() {
    setState(() {
      _useFrontCamera = !_useFrontCamera;
    });
    // In a real app, this would switch between front and back camera
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Đang đổi camera...'),
        duration: Duration(seconds: 1),
      ),
    );
  }
}

class _RewardItem extends StatelessWidget {
  final String icon;
  final String label;
  
  const _RewardItem({required this.icon, required this.label});
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(icon, style: const TextStyle(fontSize: 24)),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 12),
        ),
      ],
    );
  }
}

/// Skeleton painter for battle mode
class BattleSkeletonPainter extends CustomPainter {
  final Map<String, Offset> landmarks;
  final Color color;
  
  BattleSkeletonPainter({
    required this.landmarks,
    required this.color,
  });
  
  static const connections = [
    ['leftShoulder', 'leftElbow', 'leftWrist'],
    ['rightShoulder', 'rightElbow', 'rightWrist'],
    ['leftShoulder', 'rightShoulder'],
    ['leftShoulder', 'leftHip'],
    ['rightShoulder', 'rightHip'],
    ['leftHip', 'rightHip'],
    ['leftHip', 'leftKnee', 'leftAnkle'],
    ['rightHip', 'rightKnee', 'rightAnkle'],
  ];
  
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;
    
    final pointPaint = Paint()
      ..color = color
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
      canvas.drawCircle(landmark, 4, pointPaint);
    }
  }
  
  @override
  bool shouldRepaint(BattleSkeletonPainter oldDelegate) {
    return landmarks != oldDelegate.landmarks || color != oldDelegate.color;
  }
}
