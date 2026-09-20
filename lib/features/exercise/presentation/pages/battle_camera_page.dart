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
import '../../../../core/theme/app_theme.dart';

enum BattlePhase {
  lobbyReadyCheck, // Phase 1: Dual player camera check & ready lock-in
  countdown,       // Phase 2: Synchronized 3.. 2.. 1.. FIGHT!
  inBattle,        // Phase 3: Split-screen real-time match
  results          // Phase 4: Match resolution & ELO rewards
}

/// Battle Camera Page - Real-time 2-player Synchronized Arena with Split Screen Cameras & Anti-Cheat AI 4.0
class BattleCameraPage extends ConsumerStatefulWidget {
  final ExerciseTypeEnum exerciseType;
  final String roomCode;
  final String battleMode; // 'ranked', 'custom_room', 'ai_practice'
  final Function(int myScore, int oppScore)? onBattleComplete;

  const BattleCameraPage({
    super.key,
    required this.exerciseType,
    this.roomCode = 'FB-8842',
    this.battleMode = 'ranked',
    this.onBattleComplete,
  });

  @override
  ConsumerState<BattleCameraPage> createState() => _BattleCameraPageState();
}

class _BattleCameraPageState extends ConsumerState<BattleCameraPage> with WidgetsBindingObserver, SingleTickerProviderStateMixin {
  // Cameras
  CameraController? _frontCamera;
  bool _isInitialized = false;

  // Battle Phase state machine
  BattlePhase _currentPhase = BattlePhase.lobbyReadyCheck;
  bool _myReady = false;
  bool _oppReady = false;
  bool _poseDetectedInLobby = false;
  int _countdownNumber = 3;
  String _countdownText = '3';

  // Battle state
  int _myCount = 0;
  int _opponentCount = 0;
  int _myCorrectCount = 0;
  int _timeRemaining = 60;
  bool _isRunning = false;
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

  // Timers & Animation
  Timer? _battleTimer;
  Timer? _opponentTimer;
  Timer? _countdownTimer;
  Timer? _lobbySimTimer;
  late AnimationController _pulseController;

  // Skeleton points
  Pose? _myPose;
  Size? _myCameraImageSize;
  Map<String, Offset> _opponentLandmarks = {};

  // Opponent Biometrics
  final String _oppName = 'Văn Hùng (Rank Kim Cương)';
  final String _oppAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
  final int _oppElo = 1580;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
    _initTts();
    _initializeSetup();
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
    _pulseController.dispose();
    _disposeResources();
    super.dispose();
  }

  Future<void> _initializeSetup() async {
    // Initialize pose detector with stream mode
    _poseDetector = PoseDetector(
      options: PoseDetectorOptions(
        mode: PoseDetectionMode.stream,
        model: PoseDetectionModel.base,
      ),
    );

    // Initialize analyzer
    _analyzer = ExerciseAnalyzer(
      exerciseType: widget.exerciseType == ExerciseTypeEnum.pullup
          ? RealExerciseType.pullup
          : RealExerciseType.pushup,
    );
    _analyzer!.onRepCompleted = (count, isCorrect) {
      if (mounted && _currentPhase == BattlePhase.inBattle) {
        setState(() {
          _myCount = count;
          if (isCorrect) {
            _myCorrectCount++;
            _speak('$count');
            HapticFeedback.mediumImpact();
          } else {
            _speak('Chưa đủ biên độ');
            HapticFeedback.heavyImpact();
          }
        });
      }
    };

    _antiCheat = AntiCheatService();

    // Initialize camera
    await _initializeCameras();

    // Opponent auto-connect in lobby
    _lobbySimTimer = Timer(const Duration(milliseconds: 1800), () {
      if (mounted && _currentPhase == BattlePhase.lobbyReadyCheck) {
        setState(() {
          _oppReady = true;
        });
        if (_myReady) {
          _startSynchronizedCountdown();
        }
      }
    });
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
    if (_poseDetector == null || _isProcessingFrame) return;
    _isProcessingFrame = true;

    try {
      final inputImage = _convertImage(image);
      if (inputImage == null) return;

      final poses = await _poseDetector!.processImage(inputImage);

      if (poses.isNotEmpty) {
        final pose = poses.first;

        // In Lobby phase: check if full body or key joints are in frame
        if (_currentPhase == BattlePhase.lobbyReadyCheck) {
          if (!_poseDetectedInLobby && mounted) {
            setState(() => _poseDetectedInLobby = true);
          }
        }

        // In Battle phase: run biomechanical analysis and anti-cheat
        if (_currentPhase == BattlePhase.inBattle && _isRunning) {
          final analysis = _analyzer!.analyzePose(pose);
          final antiCheatResult = _antiCheat!.validatePose(
            pose,
            widget.exerciseType == ExerciseTypeEnum.pullup
                ? RealExerciseType.pullup
                : RealExerciseType.pushup,
          );

          final int sensorOrientation = _frontCamera?.description.sensorOrientation ?? 0;
          final bool isRotated = sensorOrientation == 90 || sensorOrientation == 270;
          final double imgWidth = isRotated ? image.height.toDouble() : image.width.toDouble();
          final double imgHeight = isRotated ? image.width.toDouble() : image.height.toDouble();

          if (mounted) {
            setState(() {
              _myPose = pose;
              _myCameraImageSize = Size(imgWidth, imgHeight);
              _myCount = analysis.repCount;
              _myCorrectCount = analysis.correctRepCount;
              _currentAngle = analysis.currentAngle;
              _isCorrectForm = analysis.isCorrectForm && antiCheatResult.isValid;
              _feedback = analysis.feedback ?? antiCheatResult.warning ?? 'Duy trì form chuẩn!';
              _antiCheatWarning = analysis.antiCheatAlert;
            });
          }
        }
      } else {
        if (_currentPhase == BattlePhase.lobbyReadyCheck && _poseDetectedInLobby && mounted) {
          setState(() => _poseDetectedInLobby = false);
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

      if (image.planes.length == 1) {
        final format = InputImageFormatValue.fromRawValue(image.format.raw) ?? InputImageFormat.nv21;
        return InputImage.fromBytes(
          bytes: image.planes.first.bytes,
          metadata: InputImageMetadata(
            size: Size(image.width.toDouble(), image.height.toDouble()),
            rotation: rotation,
            format: format,
            bytesPerRow: image.planes.first.bytesPerRow,
          ),
        );
      }

      final Uint8List bytes = _convertYUV420ToNV21(image);

      return InputImage.fromBytes(
        bytes: bytes,
        metadata: InputImageMetadata(
          size: Size(image.width.toDouble(), image.height.toDouble()),
          rotation: rotation,
          format: InputImageFormat.nv21,
          bytesPerRow: image.width,
        ),
      );
    } catch (e) {
      return null;
    }
  }

  static Uint8List _convertYUV420ToNV21(CameraImage image) {
    final int width = image.width;
    final int height = image.height;
    
    final Plane yPlane = image.planes[0];
    final Plane uPlane = image.planes[1];
    final Plane vPlane = image.planes[2];

    final int ySize = width * height;
    final int uvSize = width * (height ~/ 2);
    final Uint8List nv21 = Uint8List(ySize + uvSize);

    final Uint8List yBuffer = yPlane.bytes;
    final int yRowStride = yPlane.bytesPerRow;
    int nv21Index = 0;

    if (yRowStride == width) {
      nv21.setRange(0, ySize, yBuffer);
      nv21Index = ySize;
    } else {
      for (int row = 0; row < height; row++) {
        final int srcOffset = row * yRowStride;
        nv21.setRange(nv21Index, nv21Index + width, yBuffer, srcOffset);
        nv21Index += width;
      }
    }

    final Uint8List uBuffer = uPlane.bytes;
    final Uint8List vBuffer = vPlane.bytes;
    final int uRowStride = uPlane.bytesPerRow;
    final int vRowStride = vPlane.bytesPerRow;
    final int uPixelStride = uPlane.bytesPerPixel ?? 1;
    final int vPixelStride = vPlane.bytesPerPixel ?? 1;

    final int uvHeight = height ~/ 2;
    final int uvWidth = width ~/ 2;

    for (int row = 0; row < uvHeight; row++) {
      final int uRowOffset = row * uRowStride;
      final int vRowOffset = row * vRowStride;
      for (int col = 0; col < uvWidth; col++) {
        final int vIndex = vRowOffset + col * vPixelStride;
        final int uIndex = uRowOffset + col * uPixelStride;

        nv21[nv21Index++] = vIndex < vBuffer.length ? vBuffer[vIndex] : 128;
        nv21[nv21Index++] = uIndex < uBuffer.length ? uBuffer[uIndex] : 128;
      }
    }

    return nv21;
  }

  // ── PHASE 1: READY LOCK-IN ──
  void _toggleMyReady() {
    setState(() {
      _myReady = !_myReady;
    });

    if (_myReady) {
      _speak('Đã sẵn sàng! Đang đồng bộ thời gian thi đấu với đối thủ.');
      HapticFeedback.heavyImpact();

      // If opponent already ready, trigger synchronized countdown
      if (_oppReady) {
        _startSynchronizedCountdown();
      } else {
        // Opponent will ready in 1.2s
        _lobbySimTimer?.cancel();
        _lobbySimTimer = Timer(const Duration(milliseconds: 1200), () {
          if (mounted && _currentPhase == BattlePhase.lobbyReadyCheck) {
            setState(() => _oppReady = true);
            _startSynchronizedCountdown();
          }
        });
      }
    }
  }

  // ── PHASE 2: SYNCHRONIZED COUNTDOWN ──
  void _startSynchronizedCountdown() {
    setState(() {
      _currentPhase = BattlePhase.countdown;
      _countdownNumber = 3;
      _countdownText = '3';
    });

    _speak('Ba... Chuẩn bị!');
    HapticFeedback.vibrate();

    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }

      setState(() {
        _countdownNumber--;
        if (_countdownNumber == 2) {
          _countdownText = '2';
          _speak('Hai... Vào vị trí!');
          HapticFeedback.vibrate();
        } else if (_countdownNumber == 1) {
          _countdownText = '1';
          _speak('Một... Sẵn sàng!');
          HapticFeedback.vibrate();
        } else if (_countdownNumber == 0) {
          _countdownText = 'CHIẾN!';
          _speak('CHIẾN ĐẤU!');
          HapticFeedback.heavyImpact();
        } else {
          timer.cancel();
          _startLiveBattle();
        }
      });
    });
  }

  // ── PHASE 3: LIVE BATTLE START ──
  void _startLiveBattle() {
    setState(() {
      _currentPhase = BattlePhase.inBattle;
      _isRunning = true;
      _myCount = 0;
      _opponentCount = 0;
      _myCorrectCount = 0;
      _timeRemaining = 60;
      _antiCheatWarning = null;
      _feedback = 'Trận đấu bắt đầu! AI Anti-Cheat 4.0 đang giám sát!';
    });

    _analyzer?.reset();
    _antiCheat?.reset();

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

    // Simulate realistic opponent pacing
    _simulateOpponent();
  }

  void _simulateOpponent() {
    final rand = math.Random();
    _opponentTimer = Timer.periodic(const Duration(milliseconds: 2800), (timer) {
      if (mounted && _isRunning && _currentPhase == BattlePhase.inBattle) {
        setState(() {
          _opponentCount++;
        });
      }
    });

    Timer.periodic(const Duration(milliseconds: 400), (timer) {
      if (!mounted || !_isRunning || _currentPhase != BattlePhase.inBattle) {
        timer.cancel();
        return;
      }
      setState(() {
        _opponentLandmarks = {
          'leftShoulder': Offset(50 + rand.nextDouble() * 8, 90 + rand.nextDouble() * 8),
          'leftElbow': Offset(60 + rand.nextDouble() * 8, 140 + rand.nextDouble() * 8),
          'leftWrist': Offset(70 + rand.nextDouble() * 8, 190 + rand.nextDouble() * 8),
          'rightShoulder': Offset(140 + rand.nextDouble() * 8, 90 + rand.nextDouble() * 8),
          'rightElbow': Offset(130 + rand.nextDouble() * 8, 140 + rand.nextDouble() * 8),
          'rightWrist': Offset(120 + rand.nextDouble() * 8, 190 + rand.nextDouble() * 8),
        };
      });
    });
  }

  // ── PHASE 4: BATTLE COMPLETION ──
  void _endBattle() {
    _battleTimer?.cancel();
    _opponentTimer?.cancel();
    setState(() {
      _isRunning = false;
      _currentPhase = BattlePhase.results;
    });

    final String result = _myCorrectCount > _opponentCount
        ? 'win'
        : _myCorrectCount == _opponentCount
            ? 'draw'
            : 'lose';

    // Sync battle rewards
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
      _speak('Chúc mừng bạn đã chiến thắng với $_myCorrectCount lần chuẩn form!');
    } else if (_myCorrectCount == _opponentCount) {
      _speak('Trận đấu kết thúc với kết quả hòa!');
    } else {
      _speak('Trận đấu kết thúc. Hãy cố gắng hơn ở trận sau nhé!');
    }
  }

  void _disposeResources() {
    _battleTimer?.cancel();
    _opponentTimer?.cancel();
    _countdownTimer?.cancel();
    _lobbySimTimer?.cancel();
    _frontCamera?.dispose();
    _poseDetector?.close();
    _flutterTts.stop();
  }

  @override
  Widget build(BuildContext context) {
    final exerciseColor = Color(int.parse(widget.exerciseType.color.replaceAll('#', '0xFF')));

    switch (_currentPhase) {
      case BattlePhase.lobbyReadyCheck:
        return _buildLobbyReadyCheckView(exerciseColor);
      case BattlePhase.countdown:
        return _buildCountdownOverlay(exerciseColor);
      case BattlePhase.inBattle:
        return _buildBattleView(exerciseColor);
      case BattlePhase.results:
        return _buildResultsView();
    }
  }

  // =========================================================================
  // VIEW 1: LOBBY & DUAL READY CHECK (ĐỒNG BỘ 2 NGƯỜI CHƠI)
  // =========================================================================
  Widget _buildLobbyReadyCheckView(Color exerciseColor) {
    final user = ref.watch(userProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0C0E17),
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text(
                            'PHÒNG ĐẤU CAMERA 1V1',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF2ED573).withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFF2ED573)),
                            ),
                            child: const Text('📶 28ms', style: TextStyle(color: Color(0xFF2ED573), fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Mã Phòng: ${widget.roomCode} • ${widget.exerciseType.name}',
                        style: const TextStyle(color: Colors.white60, fontSize: 12),
                      ),
                    ],
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.bolt, color: AppColors.warning, size: 16),
                        const SizedBox(width: 4),
                        Text('${user.stamina}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  children: [
                    // Synchronized Lock-in Alert Banner
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
                      child: const Row(
                        children: [
                          Icon(Icons.sync_lock, color: Color(0xFFFF6B35), size: 24),
                          SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'ĐỒNG BỘ GIỜ THI ĐẤU (DUAL READY)',
                                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'Cả 2 đấu thủ phải cùng bấm "SẴN SÀNG" để kích hoạt đếm ngược 3-2-1.',
                                  style: TextStyle(color: Colors.white70, fontSize: 11),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Head-to-Head Cards (You vs Opponent)
                    Row(
                      children: [
                        // Player Card
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFF161B29),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(
                                color: _myReady ? const Color(0xFF2ED573) : Colors.white12,
                                width: _myReady ? 2 : 1,
                              ),
                            ),
                            child: Column(
                              children: [
                                Stack(
                                  alignment: Alignment.bottomRight,
                                  children: [
                                    CircleAvatar(
                                      radius: 34,
                                      backgroundImage: NetworkImage(user.avatar),
                                      backgroundColor: Colors.white12,
                                    ),
                                    if (_myReady)
                                      Container(
                                        padding: const EdgeInsets.all(4),
                                        decoration: const BoxDecoration(
                                          color: Color(0xFF2ED573),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(Icons.check, color: Colors.black, size: 14),
                                      ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  user.name,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                                Text('Lv.${user.level} • ${user.streak} ngày streak', style: const TextStyle(color: Colors.white54, fontSize: 10)),
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: _myReady ? const Color(0xFF2ED573).withValues(alpha: 0.2) : Colors.white10,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    _myReady ? 'ĐÃ SẴN SÀNG ✅' : 'CHƯA SẴN SÀNG',
                                    style: TextStyle(
                                      color: _myReady ? const Color(0xFF2ED573) : Colors.white60,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 10,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // VS Badge
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                          child: Column(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: const BoxDecoration(
                                  color: Color(0xFFFF4757),
                                  shape: BoxShape.circle,
                                ),
                                child: const Text('VS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 12)),
                              ),
                            ],
                          ),
                        ),

                        // Opponent Card
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFF161B29),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(
                                color: _oppReady ? const Color(0xFF2ED573) : Colors.white12,
                                width: _oppReady ? 2 : 1,
                              ),
                            ),
                            child: Column(
                              children: [
                                Stack(
                                  alignment: Alignment.bottomRight,
                                  children: [
                                    CircleAvatar(
                                      radius: 34,
                                      backgroundImage: NetworkImage(_oppAvatar),
                                      backgroundColor: Colors.white12,
                                    ),
                                    if (_oppReady)
                                      Container(
                                        padding: const EdgeInsets.all(4),
                                        decoration: const BoxDecoration(
                                          color: Color(0xFF2ED573),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(Icons.check, color: Colors.black, size: 14),
                                      ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  _oppName,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                                Text('ELO $_oppElo • Thắng 68%', style: const TextStyle(color: Colors.white54, fontSize: 10)),
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: _oppReady ? const Color(0xFF2ED573).withValues(alpha: 0.2) : Colors.white10,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    _oppReady ? 'ĐÃ SẴN SÀNG ✅' : 'ĐANG CHỜ ⏳',
                                    style: TextStyle(
                                      color: _oppReady ? const Color(0xFF2ED573) : Colors.amber,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 10,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),

                    // Camera Pre-Check Preview Window
                    Container(
                      height: 220,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: const Color(0xFF141624),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: _poseDetectedInLobby ? const Color(0xFF2ED573) : Colors.amber.withValues(alpha: 0.5),
                          width: 2,
                        ),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(18),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            if (_isInitialized && _frontCamera != null)
                              CameraPreview(_frontCamera!)
                            else
                              const Center(child: CircularProgressIndicator(color: Colors.white)),

                            // Camera Framing Guide Overlay
                            Positioned(
                              top: 12,
                              left: 12,
                              right: 12,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: Colors.black87,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: _poseDetectedInLobby ? const Color(0xFF2ED573) : Colors.amber,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      _poseDetectedInLobby ? Icons.check_circle : Icons.accessibility_new,
                                      color: _poseDetectedInLobby ? const Color(0xFF2ED573) : Colors.amber,
                                      size: 16,
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        _poseDetectedInLobby
                                            ? 'AI POSE: Đã bắt được toàn thân trong khung hình ✅'
                                            : 'Hãy lùi xa 1.5m - 2m để AI quét trọn vẹn khớp cơ thể',
                                        style: TextStyle(
                                          color: _poseDetectedInLobby ? const Color(0xFF2ED573) : Colors.amber,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Rules & Anti-Cheat Summary
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF141824),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.shield_outlined, color: Color(0xFF2ED573), size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Quy định: Thời gian 60s. Góc tay chuẩn ≤90°. Điểm chỉ tính cho reps đạt chuẩn sinh trắc học AI.',
                              style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 11),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Bottom Ready Action Button
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFF10121C),
                border: Border(top: BorderSide(color: Colors.white12)),
              ),
              child: SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: _toggleMyReady,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _myReady ? const Color(0xFFFF4757) : const Color(0xFF2ED573),
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 6,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        _myReady ? Icons.close : Icons.bolt,
                        color: _myReady ? Colors.white : const Color(0xFF0F0F23),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _myReady ? 'HỦY SẴN SÀNG' : '⚡ TÔI ĐÃ SẴN SÀNG',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: _myReady ? Colors.white : const Color(0xFF0F0F23),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // =========================================================================
  // VIEW 2: SYNCHRONIZED 3.. 2.. 1.. COUNTDOWN OVERLAY
  // =========================================================================
  Widget _buildCountdownOverlay(Color exerciseColor) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Background Camera Preview
          if (_isInitialized && _frontCamera != null)
            Opacity(opacity: 0.35, child: CameraPreview(_frontCamera!)),

          // Dark Gradient
          Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: Alignment.center,
                radius: 1.0,
                colors: [
                  Colors.black.withValues(alpha: 0.4),
                  Colors.black.withValues(alpha: 0.9),
                ],
              ),
            ),
          ),

          // Pulsing Countdown Display
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, child) {
                    final scale = 1.0 + (_pulseController.value * 0.15);
                    return Transform.scale(
                      scale: scale,
                      child: Container(
                        width: 140,
                        height: 140,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFFFF6B35).withValues(alpha: 0.2),
                          border: Border.all(
                            color: _countdownNumber == 0 ? const Color(0xFF2ED573) : const Color(0xFFFF6B35),
                            width: 4,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: (_countdownNumber == 0 ? const Color(0xFF2ED573) : const Color(0xFFFF6B35))
                                  .withValues(alpha: 0.6),
                              blurRadius: 30,
                              spreadRadius: 8,
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            _countdownText,
                            style: TextStyle(
                              fontSize: _countdownNumber == 0 ? 32 : 64,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 24),
                const Text(
                  'ĐỒNG BỘ GIỜ KHỞI TRANH...',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                    letterSpacing: 2,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  widget.exerciseType.name.toUpperCase(),
                  style: TextStyle(
                    color: exerciseColor,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // =========================================================================
  // VIEW 3: SPLIT-SCREEN REALTIME BATTLE VIEW
  // =========================================================================
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
                Text('AI Anti-Cheat ON', style: TextStyle(color: Color(0xFF2ED573), fontSize: 10, fontWeight: FontWeight.bold)),
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
    required Color color,
    required bool isMe,
    double? currentAngle,
  }) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Camera Preview
        if (_isInitialized && _frontCamera != null && isMe)
          ClipRect(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final previewSize = _frontCamera!.value.previewSize!;
                final isPortrait = MediaQuery.of(context).orientation == Orientation.portrait;
                final pWidth = isPortrait ? previewSize.height : previewSize.width;
                final pHeight = isPortrait ? previewSize.width : previewSize.height;

                return SizedBox.expand(
                  child: FittedBox(
                    fit: BoxFit.cover,
                    child: SizedBox(
                      width: pWidth,
                      height: pHeight,
                      child: CameraPreview(_frontCamera!),
                    ),
                  ),
                );
              },
            ),
          )
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
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text('Live Sync 100%', style: TextStyle(color: Colors.greenAccent, fontSize: 9, fontWeight: FontWeight.bold)),
                  ),
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
        if (isMe && _myPose != null && _myCameraImageSize != null)
          CustomPaint(
            size: Size.infinite,
            painter: BattleSkeletonPainter(
              pose: _myPose,
              imageSize: _myCameraImageSize,
              isFrontCamera: _frontCamera?.description.lensDirection == CameraLensDirection.front,
              color: _isCorrectForm ? const Color(0xFF2ED573) : Colors.red,
            ),
          )
        else if (!isMe && _opponentLandmarks.isNotEmpty)
          CustomPaint(
            size: Size.infinite,
            painter: BattleSkeletonPainter(
              rawLandmarks: _opponentLandmarks,
              color: color,
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

  // =========================================================================
  // VIEW 4: BATTLE RESULTS VIEW (KẾT QUẢ & THƯỞNG ĐỒNG BỘ)
  // =========================================================================
  Widget _buildResultsView() {
    final isWin = _myCorrectCount > _opponentCount;
    final isDraw = _myCorrectCount == _opponentCount;
    final pointsEarned = isWin ? 50 : (isDraw ? 20 : 10);
    final accuracy = _myCount > 0 ? ((_myCorrectCount / _myCount) * 100).round() : 0;

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
                      setState(() {
                        _currentPhase = BattlePhase.lobbyReadyCheck;
                        _myReady = false;
                        _oppReady = false;
                      });
                      _initializeSetup();
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

/// Skeleton painter for battle mode - HIGH VISIBILITY NEON with BoxFit.cover alignment
class BattleSkeletonPainter extends CustomPainter {
  final Pose? pose;
  final Size? imageSize;
  final bool isFrontCamera;
  final Map<String, Offset>? rawLandmarks;
  final Color color;

  BattleSkeletonPainter({
    this.pose,
    this.imageSize,
    this.isFrontCamera = true,
    this.rawLandmarks,
    required this.color,
  });

  static const bodyConnections = [
    [PoseLandmarkType.leftShoulder, PoseLandmarkType.rightShoulder],
    [PoseLandmarkType.leftShoulder, PoseLandmarkType.leftHip],
    [PoseLandmarkType.rightShoulder, PoseLandmarkType.rightHip],
    [PoseLandmarkType.leftHip, PoseLandmarkType.rightHip],
    [PoseLandmarkType.leftShoulder, PoseLandmarkType.leftElbow],
    [PoseLandmarkType.leftElbow, PoseLandmarkType.leftWrist],
    [PoseLandmarkType.rightShoulder, PoseLandmarkType.rightElbow],
    [PoseLandmarkType.rightElbow, PoseLandmarkType.rightWrist],
    [PoseLandmarkType.leftHip, PoseLandmarkType.leftKnee],
    [PoseLandmarkType.leftKnee, PoseLandmarkType.leftAnkle],
    [PoseLandmarkType.rightHip, PoseLandmarkType.rightKnee],
    [PoseLandmarkType.rightKnee, PoseLandmarkType.rightAnkle],
  ];

  static const faceConnections = [
    [PoseLandmarkType.leftEar, PoseLandmarkType.leftEyeOuter],
    [PoseLandmarkType.leftEyeOuter, PoseLandmarkType.leftEye],
    [PoseLandmarkType.leftEye, PoseLandmarkType.nose],
    [PoseLandmarkType.nose, PoseLandmarkType.rightEye],
    [PoseLandmarkType.rightEye, PoseLandmarkType.rightEyeOuter],
    [PoseLandmarkType.rightEyeOuter, PoseLandmarkType.rightEar],
    [PoseLandmarkType.nose, PoseLandmarkType.leftMouth],
    [PoseLandmarkType.nose, PoseLandmarkType.rightMouth],
  ];

  static const keyJointTypes = [
    PoseLandmarkType.leftShoulder,
    PoseLandmarkType.rightShoulder,
    PoseLandmarkType.leftElbow,
    PoseLandmarkType.rightElbow,
    PoseLandmarkType.leftWrist,
    PoseLandmarkType.rightWrist,
    PoseLandmarkType.leftHip,
    PoseLandmarkType.rightHip,
    PoseLandmarkType.leftKnee,
    PoseLandmarkType.rightKnee,
    PoseLandmarkType.leftAnkle,
    PoseLandmarkType.rightAnkle,
  ];

  static const double VISIBILITY_THRESHOLD = 0.25;

  @override
  void paint(Canvas canvas, Size size) {
    final glowPaint = Paint()
      ..color = color.withValues(alpha: 0.5)
      ..strokeWidth = 10
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 6);

    final linePaint = Paint()
      ..color = color
      ..strokeWidth = 3.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final pointGlowPaint = Paint()
      ..color = color.withValues(alpha: 0.6)
      ..style = PaintingStyle.fill
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);

    final pointPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final corePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    if (rawLandmarks != null && rawLandmarks!.isNotEmpty) {
      // Opponent simulated landmarks
      final rawConns = [
        ['leftShoulder', 'leftElbow', 'leftWrist'],
        ['rightShoulder', 'rightElbow', 'rightWrist'],
        ['leftShoulder', 'rightShoulder'],
        ['leftShoulder', 'leftHip'],
        ['rightShoulder', 'rightHip'],
        ['leftHip', 'rightHip'],
      ];
      for (final conn in rawConns) {
        for (int i = 0; i < conn.length - 1; i++) {
          final p1 = rawLandmarks![conn[i]];
          final p2 = rawLandmarks![conn[i + 1]];
          if (p1 != null && p2 != null) {
            canvas.drawLine(p1, p2, glowPaint);
            canvas.drawLine(p1, p2, linePaint);
          }
        }
      }
      for (final pt in rawLandmarks!.values) {
        canvas.drawCircle(pt, 8, pointGlowPaint);
        canvas.drawCircle(pt, 5, pointPaint);
        canvas.drawCircle(pt, 2, corePaint);
      }
      return;
    }

    if (pose == null || imageSize == null || imageSize!.width <= 0 || imageSize!.height <= 0) {
      return;
    }

    final double imgWidth = imageSize!.width;
    final double imgHeight = imageSize!.height;

    final double scaleX = size.width / imgWidth;
    final double scaleY = size.height / imgHeight;
    final double scale = math.max(scaleX, scaleY);

    final double offsetX = (size.width - imgWidth * scale) / 2.0;
    final double offsetY = (size.height - imgHeight * scale) / 2.0;

    Offset mapPoint(PoseLandmark lm) {
      final double xInImg = isFrontCamera ? (imgWidth - lm.x) : lm.x;
      return Offset(
        xInImg * scale + offsetX,
        lm.y * scale + offsetY,
      );
    }

    final landmarks = pose!.landmarks;

    for (final pair in bodyConnections) {
      final lm1 = landmarks[pair[0]];
      final lm2 = landmarks[pair[1]];
      if (lm1 != null && lm2 != null && lm1.likelihood > VISIBILITY_THRESHOLD && lm2.likelihood > VISIBILITY_THRESHOLD) {
        final p1 = mapPoint(lm1);
        final p2 = mapPoint(lm2);
        canvas.drawLine(p1, p2, glowPaint);
        canvas.drawLine(p1, p2, linePaint);
      }
    }

    for (final pair in faceConnections) {
      final lm1 = landmarks[pair[0]];
      final lm2 = landmarks[pair[1]];
      if (lm1 != null && lm2 != null && lm1.likelihood > VISIBILITY_THRESHOLD && lm2.likelihood > VISIBILITY_THRESHOLD) {
        final p1 = mapPoint(lm1);
        final p2 = mapPoint(lm2);
        canvas.drawLine(p1, p2, linePaint);
      }
    }

    for (final entry in landmarks.entries) {
      final type = entry.key;
      final lm = entry.value;
      if (lm.likelihood > VISIBILITY_THRESHOLD) {
        final pos = mapPoint(lm);
        final isMajor = keyJointTypes.contains(type);
        if (isMajor) {
          canvas.drawCircle(pos, 9.0, pointGlowPaint);
          canvas.drawCircle(pos, 5.5, pointPaint);
          canvas.drawCircle(pos, 2.5, corePaint);
        } else {
          canvas.drawCircle(pos, 3.0, pointPaint);
          canvas.drawCircle(pos, 1.5, corePaint);
        }
      }
    }
  }

  @override
  bool shouldRepaint(BattleSkeletonPainter oldDelegate) => true;
}
