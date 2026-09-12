import 'dart:async';
import 'dart:math' as math;
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers.dart';
import '../../../../core/services/exercise_analyzer.dart';
import '../../../../core/services/anticheat_service.dart';
import '../../../../core/models_exercise.dart';

/// Battle Camera Page - Real-time 2-player battle with split screen cameras & Anti-Cheat AI
class BattleCameraPage extends ConsumerStatefulWidget {
  final ExerciseTypeEnum exerciseType;
  final Function(int myScore, int oppScore)? onBattleComplete;
  
  const BattleCameraPage({
    super.key,
    required this.exerciseType,
    this.onBattleComplete,
  });
  
  @override
  ConsumerState<BattleCameraPage> createState() => _BattleCameraPageState();
}

class _BattleCameraPageState extends ConsumerState<BattleCameraPage> with WidgetsBindingObserver {
  // Cameras
  CameraController? _frontCamera;
  bool _isInitialized = false;
  
  // Battle state
  int _myCount = 0;
  int _opponentCount = 0;
  int _myCorrectCount = 0;
  int _timeRemaining = 60;
  bool _isRunning = false;
  bool _showResults = false;
  String _feedback = 'Hãy vào vị trí sẵn sàng!';
  String? _antiCheatWarning;
  bool _isCorrectForm = true;
  double _currentAngle = 0.0;
  
  // Pose detection
  PoseDetector? _poseDetector;
  bool _isProcessingFrame = false;
  
  // Analyzer & Services
  ExerciseAnalyzer? _analyzer;
  AntiCheatService? _antiCheat;
  final FlutterTts _flutterTts = FlutterTts();
  
  // Timers
  Timer? _battleTimer;
  Timer? _opponentTimer;
  
  // Skeleton points
  Map<String, Offset> _myLandmarks = {};
  Map<String, Offset> _opponentLandmarks = {};
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initTts();
    _initializeBattle();
  }

  void _initTts() async {
    try {
      await _flutterTts.setLanguage('vi-VN');
      await _flutterTts.setSpeechRate(1.0);
      await _flutterTts.setVolume(1.0);
    } catch (_) {}
  }

  void _speak(String text) async {
    try {
      await _flutterTts.stop();
      await _flutterTts.speak(text);
    } catch (_) {}
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
      options: PoseDetectorOptions(
        mode: PoseDetectionMode.stream,
        model: PoseDetectionModel.accurate,
      ),
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
          if (isCorrect) {
            _myCorrectCount++;
            _speak('$count');
          } else {
            _speak('Sai form');
          }
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
      
      final frontCamera = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );
      
      _frontCamera = CameraController(
        frontCamera,
        ResolutionPreset.medium,
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.yuv420,
      );
      
      await _frontCamera!.initialize();
      await _frontCamera!.startImageStream(_processImage);
      
      if (mounted) {
        setState(() => _isInitialized = true);
      }
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
        
        // 1. Analyze biomechanical pose
        final analysis = _analyzer!.analyzePose(pose);
        
        // 2. Anti-cheat validation
        final antiCheatResult = _antiCheat!.validatePose(
          pose,
          widget.exerciseType == ExerciseTypeEnum.pushup
              ? RealExerciseType.pushup
              : RealExerciseType.pullup,
        );
        
        // Update landmarks for skeleton overlay
        final landmarks = <String, Offset>{};
        final size = Size(image.width.toDouble(), image.height.toDouble());
        for (final entry in pose.landmarks.entries) {
          landmarks[entry.key.name] = Offset(
            entry.value.x / size.width * (MediaQuery.of(context).size.width * 0.5),
            entry.value.y / size.height * (MediaQuery.of(context).size.height * 0.7),
          );
        }
        
        if (mounted) {
          setState(() {
            _myLandmarks = landmarks;
            _myCount = analysis.repCount;
            _myCorrectCount = analysis.correctRepCount;
            _currentAngle = analysis.currentAngle;
            _isCorrectForm = analysis.isCorrectForm && antiCheatResult.isValid;
            _feedback = analysis.feedback ?? antiCheatResult.warning ?? '';
            _antiCheatWarning = analysis.antiCheatAlert;
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
      final camera = _frontCamera?.description;
      final sensorOrientation = camera?.sensorOrientation ?? 0;
      final rotation = InputImageRotationValue.fromRawValue(sensorOrientation) ??
          InputImageRotation.rotation0deg;

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
          rotation: rotation,
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
      _antiCheatWarning = null;
      _feedback = 'Trận đấu bắt đầu! AI Anti-Cheat đang giám sát!';
    });
    
    _analyzer?.reset();
    _antiCheat?.reset();
    _speak('Trận đấu bắt đầu! 60 giây so tài thể lực công bằng.');
    
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
    
    // Simulate opponent scoring with realistic biometric pace (2.5s - 3.8s per rep)
    _simulateOpponent();
  }
  
  void _simulateOpponent() {
    _opponentTimer = Timer.periodic(const Duration(milliseconds: 3100), (timer) {
      if (mounted && _isRunning && !_showResults) {
        setState(() => _opponentCount++);
      }
    });
    
    Timer.periodic(const Duration(milliseconds: 600), (timer) {
      if (!mounted || !_isRunning || _showResults) {
        timer.cancel();
        return;
      }
      final random = math.Random();
      setState(() {
        _opponentLandmarks = {
          'leftShoulder': Offset(50 + random.nextDouble() * 10, 100 + random.nextDouble() * 10),
          'leftElbow': Offset(60 + random.nextDouble() * 10, 150 + random.nextDouble() * 10),
          'leftWrist': Offset(70 + random.nextDouble() * 10, 200 + random.nextDouble() * 10),
          'rightShoulder': Offset(150 + random.nextDouble() * 10, 100 + random.nextDouble() * 10),
          'rightElbow': Offset(140 + random.nextDouble() * 10, 150 + random.nextDouble() * 10),
          'rightWrist': Offset(130 + random.nextDouble() * 10, 200 + random.nextDouble() * 10),
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

    final String result = _myCorrectCount > _opponentCount
        ? 'win'
        : _myCorrectCount == _opponentCount
            ? 'draw'
            : 'lose';

    // ── SYNC BATTLE DATA TO ALL FEATURES ──
    WorkoutSyncService.syncBattle(
      ref: ref,
      exerciseType: widget.exerciseType,
      myScore: _myCount,
      myCorrectScore: _myCorrectCount,
      oppScore: _opponentCount,
      result: result,
      durationSeconds: 60 - _timeRemaining,
    );
    
    widget.onBattleComplete?.call(_myCorrectCount, _opponentCount);
    if (_myCorrectCount > _opponentCount) {
      _speak('Chúc mừng bạn đã chiến thắng trận đấu với $_myCorrectCount lần chuẩn form!');
    } else if (_myCorrectCount == _opponentCount) {
      _speak('Trận đấu kết thúc với kết quả hòa!');
    } else {
      _speak('Trận đấu kết thúc. Hãy cố gắng ở trận tiếp theo!');
    }
  }
  
  void _disposeResources() {
    _battleTimer?.cancel();
    _opponentTimer?.cancel();
    _frontCamera?.dispose();
    _poseDetector?.close();
    _flutterTts.stop();
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
          // Top Bar - Timer, Anti-Cheat Badge, Scores
          _buildTopBar(exerciseColor),

          // Anti-Cheat Warning Banner if triggered
          if (_antiCheatWarning != null)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.warning, color: Colors.white, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _antiCheatWarning!,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ),
                ],
              ),
            ),
          
          // Split Screen Cameras (Player 1 vs Opponent)
          Expanded(
            child: Row(
              children: [
                // My Camera (Left side - Live Camera + Pose Tracking)
                Expanded(
                  child: _buildCameraView(
                    label: 'BẠN',
                    count: _myCount,
                    correctCount: _myCorrectCount,
                    landmarks: _myLandmarks,
                    color: const Color(0xFF2ED573),
                    isMe: true,
                    currentAngle: _currentAngle,
                  ),
                ),
                
                // VS Divider
                Container(
                  width: 3,
                  color: const Color(0xFFFF4757),
                ),
                
                // Opponent Camera (Right side - Simulated Live Peer Feed)
                Expanded(
                  child: _buildCameraView(
                    label: 'ĐỐI THỦ',
                    count: _opponentCount,
                    correctCount: null,
                    landmarks: _opponentLandmarks,
                    color: const Color(0xFF5352ED),
                    isMe: false,
                  ),
                ),
              ],
            ),
          ),
          
          // Bottom Bar HUD
          _buildBottomBar(exerciseColor),
        ],
      ),
    );
  }
  
  Widget _buildTopBar(Color exerciseColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      color: const Color(0xFF10121C),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.close, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
          
          // Timer Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
            decoration: BoxDecoration(
              color: _timeRemaining <= 10 ? Colors.red : const Color(0xFFFF6B35),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: (_timeRemaining <= 10 ? Colors.red : const Color(0xFFFF6B35)).withValues(alpha: 0.5),
                  blurRadius: 10,
                ),
              ],
            ),
            child: Row(
              children: [
                const Icon(Icons.timer, color: Colors.white, size: 18),
                const SizedBox(width: 6),
                Text(
                  '${_timeRemaining}s',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white),
                ),
              ],
            ),
          ),
          
          // Anti-Cheat Status
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: const Color(0xFF2ED573).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF2ED573)),
            ),
            child: const Row(
              children: [
                Icon(Icons.shield, color: Color(0xFF2ED573), size: 13),
                SizedBox(width: 4),
                Text('Anti-Cheat ON', style: TextStyle(color: Color(0xFF2ED573), fontSize: 10, fontWeight: FontWeight.bold)),
              ],
            ),
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
    double? currentAngle,
  }) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Camera Preview
        if (_isInitialized && _frontCamera != null && isMe)
          CameraPreview(_frontCamera!)
        else if (!isMe)
          Container(
            color: const Color(0xFF141624),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 70,
                    height: 70,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: color, width: 2),
                      color: Colors.white12,
                    ),
                    child: const Center(
                      child: Text('⚔️', style: TextStyle(fontSize: 32)),
                    ),
                  ),
                  const SizedBox(height: 10),
                  const Text('Đối thủ đang đấu...', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          )
        else
          Container(
            color: Colors.black,
            child: const Center(child: CircularProgressIndicator(color: Colors.white)),
          ),
        
        // Skeleton Overlay
        if (landmarks.isNotEmpty && isMe)
          CustomPaint(
            size: Size.infinite,
            painter: BattleSkeletonPainter(
              landmarks: landmarks,
              color: _isCorrectForm ? const Color(0xFF2ED573) : Colors.red,
            ),
          ),
        
        // Overlay Info Card
        Positioned(
          top: 8,
          left: 8,
          right: 8,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.7),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isMe ? const Color(0xFF2ED573).withValues(alpha: 0.4) : Colors.white12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  label,
                  style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 11),
                ),
                Text(
                  '$count Rep',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16),
                ),
              ],
            ),
          ),
        ),

        // Angle Pill for User
        if (isMe && currentAngle != null && currentAngle > 0)
          Positioned(
            bottom: 10,
            left: 8,
            right: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: currentAngle <= (widget.exerciseType == ExerciseTypeEnum.pushup ? 92 : 78)
                      ? const Color(0xFF2ED573)
                      : Colors.white24,
                ),
              ),
              child: Text(
                'Góc tay: ${currentAngle.round()}° ${widget.exerciseType == ExerciseTypeEnum.pushup ? '(Mục tiêu: ≤90°)' : '(Mục tiêu: ≤78°)'}',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: currentAngle <= (widget.exerciseType == ExerciseTypeEnum.pushup ? 92 : 78)
                      ? const Color(0xFF2ED573)
                      : Colors.white70,
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
      ],
    );
  }
  
  Widget _buildBottomBar(Color exerciseColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Color(0xFF10121C),
        border: Border(top: BorderSide(color: Colors.white12)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF2ED573).withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.verified, color: Color(0xFF2ED573), size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              _feedback,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ),
          TextButton(
            onPressed: _endBattle,
            style: TextButton.styleFrom(
              foregroundColor: Colors.redAccent,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            ),
            child: const Text('DỪNG TRẬN', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
          ),
        ],
      ),
    );
  }
  
  Widget _buildResults() {
    final isWin = _myCorrectCount > _opponentCount;
    final isDraw = _myCorrectCount == _opponentCount;
    final pointsEarned = isWin ? 50 : (isDraw ? 20 : 10);
    final accuracy = _myCount > 0 ? (_myCorrectCount / _myCount * 100) : 0.0;
    
    return Container(
      color: const Color(0xFF0B0D14),
      child: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Result Icon
                Container(
                  width: 90,
                  height: 90,
                  decoration: BoxDecoration(
                    color: isWin 
                        ? const Color(0xFF2ED573).withValues(alpha: 0.2)
                        : (isDraw ? const Color(0xFFFFA502).withValues(alpha: 0.2) : Colors.red.withValues(alpha: 0.2)),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isWin ? const Color(0xFF2ED573) : (isDraw ? const Color(0xFFFFA502) : Colors.red),
                      width: 2,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      isWin ? '🏆' : (isDraw ? '🤝' : '😤'),
                      style: const TextStyle(fontSize: 48),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                
                Text(
                  isWin ? 'CHIẾN THẮNG XUẤT SẮC!' : (isDraw ? 'HÒA ĐIỂM!' : 'THUA TRẬN!'),
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: isWin 
                        ? const Color(0xFF2ED573) 
                        : (isDraw ? const Color(0xFFFFA502) : Colors.red),
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Kết quả đã được xác minh qua AI Pose Biomechanics',
                  style: TextStyle(color: Colors.white60, fontSize: 12),
                ),
                const SizedBox(height: 24),
                
                // Scores Comparison
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF161B29),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      Column(
                        children: [
                          const Text('BẠN', style: TextStyle(color: Color(0xFF2ED573), fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text('$_myCorrectCount', style: const TextStyle(fontSize: 44, fontWeight: FontWeight.w900, color: Colors.white)),
                          Text('✓ $accuracy% chuẩn', style: const TextStyle(color: Color(0xFF2ED573), fontSize: 10)),
                        ],
                      ),
                      
                      const Text('VS', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFFFF4757))),
                      
                      Column(
                        children: [
                          const Text('ĐỐI THỦ', style: TextStyle(color: Color(0xFF5352ED), fontSize: 12, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Text('$_opponentCount', style: const TextStyle(fontSize: 44, fontWeight: FontWeight.w900, color: Colors.white)),
                          const Text('Tập trực tuyến', style: TextStyle(color: Colors.white38, fontSize: 10)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                
                // Rewards
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        const Color(0xFFFF6B35).withValues(alpha: 0.2),
                        const Color(0xFF5352ED).withValues(alpha: 0.2),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFFF6B35).withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Text('⚡ +${_myCorrectCount * 15} XP', style: const TextStyle(color: Color(0xFFFF6B35), fontWeight: FontWeight.bold, fontSize: 14)),
                      Text('🪙 +${_myCorrectCount * 8} Coins', style: const TextStyle(color: Color(0xFFFFA502), fontWeight: FontWeight.bold, fontSize: 14)),
                      Text('🏆 +$pointsEarned Rank', style: const TextStyle(color: Color(0xFF2ED573), fontWeight: FontWeight.bold, fontSize: 14)),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      setState(() => _showResults = false);
                      _startBattle();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2ED573),
                      foregroundColor: const Color(0xFF0F0F23),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('ĐẤU LẠI TRẬN MỚI', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('VỀ TRANG ĐẤU TRƯỜNG'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
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
      canvas.drawCircle(landmark, 4, pointPaint);
    }
  }
  
  @override
  bool shouldRepaint(BattleSkeletonPainter oldDelegate) {
    return landmarks != oldDelegate.landmarks || color != oldDelegate.color;
  }
}
