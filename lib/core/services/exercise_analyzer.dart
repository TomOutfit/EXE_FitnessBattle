import 'dart:math' as math;
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import 'pose_detection_service.dart';

/// Exercise type enumeration
enum RealExerciseType {
  pushup,
  pullup,
}

/// State of current exercise rep
enum RepState {
  waiting,     // Waiting for start position (Lockout / Full extension)
  goingDown,   // Moving to down / bottom position
  goingUp,     // Moving back to start
  completed,   // Rep completed
}

/// Analysis result for a single frame
class FrameAnalysis {
  final int repCount;
  final int correctRepCount;
  final double currentAngle;
  final double bodyAlignmentAngle;
  final bool isCorrectForm;
  final String? feedback;
  final String? antiCheatAlert;
  final RepState repState;
  final List<String> formIssues;
  
  FrameAnalysis({
    required this.repCount,
    this.correctRepCount = 0,
    required this.currentAngle,
    this.bodyAlignmentAngle = 180.0,
    required this.isCorrectForm,
    this.feedback,
    this.antiCheatAlert,
    required this.repState,
    this.formIssues = const [],
  });
}

/// Service to analyze poses, enforce biomechanical standards and detect cheating
class ExerciseAnalyzer {
  final RealExerciseType exerciseType;
  
  // State
  int _repCount = 0;
  int _correctCount = 0;
  RepState _repState = RepState.waiting;
  DateTime? _repStartTime;
  DateTime? _bottomReachedTime;
  List<String> _currentIssues = [];
  String? _currentAntiCheatAlert;
  
  // Biomechanical Angle Thresholds (International Standard)
  // Push-up Thresholds
  static const double pushupLockoutAngle = 155.0; // Arms extended at top
  static const double pushupBottomAngle = 92.0;   // Deep 90-deg elbow bend
  static const double pushupMinHipAngle = 145.0;  // Body straight plank line (180 deg ideal)
  static const double pushupPikeHipAngle = 135.0; // Piking hips up
  
  // Pull-up Thresholds
  static const double pullupDeadHangAngle = 155.0; // Full arms extension at bottom
  static const double pullupTopAngle = 78.0;      // Deep pull with chin over bar
  
  // Anti-Cheat Rep Min Timers (Humanly impossible speeds)
  static const double pushupMinDurationSec = 0.70;
  static const double pullupMinDurationSec = 0.90;
  
  // Historical tracking for anti-cheat
  double _lowestElbowAngleInRep = 180.0;
  double _initialNoseY = 0.0;
  double _initialShoulderY = 0.0;
  final List<double> _recentHipXHistory = [];
  
  // Callbacks
  Function(FrameAnalysis)? onFrameAnalyzed;
  Function(int count, bool isCorrect)? onRepCompleted;

  ExerciseAnalyzer({required this.exerciseType});
  
  /// Reset analyzer state
  void reset() {
    _repCount = 0;
    _correctCount = 0;
    _repState = RepState.waiting;
    _repStartTime = null;
    _bottomReachedTime = null;
    _currentIssues = [];
    _currentAntiCheatAlert = null;
    _lowestElbowAngleInRep = 180.0;
    _recentHipXHistory.clear();
  }
  
  /// Process a pose and return biomechanical analysis
  FrameAnalysis analyzePose(Pose pose) {
    final landmarks = PoseUtils.getExerciseLandmarks(pose);
    
    switch (exerciseType) {
      case RealExerciseType.pushup:
        return _analyzePushup(landmarks);
      case RealExerciseType.pullup:
        return _analyzePullup(landmarks);
    }
  }
  
  // -------------------------------------------------------------
  // 1. Biomechanical Push-Up Analysis & Anti-Cheat
  // -------------------------------------------------------------
  FrameAnalysis _analyzePushup(Map<String, PoseLandmark?> landmarks) {
    // Check available sides
    final leftArm = landmarks['leftShoulder'] != null &&
        landmarks['leftElbow'] != null &&
        landmarks['leftWrist'] != null &&
        landmarks['leftHip'] != null;

    final rightArm = landmarks['rightShoulder'] != null &&
        landmarks['rightElbow'] != null &&
        landmarks['rightWrist'] != null &&
        landmarks['rightHip'] != null;

    if (!leftArm && !rightArm) {
      return FrameAnalysis(
        repCount: _repCount,
        correctRepCount: _correctCount,
        currentAngle: 0,
        isCorrectForm: false,
        feedback: 'Vui lòng vào khung hình (Góc nghiêng 45° hoặc ngang)',
        repState: _repState,
        formIssues: ['Không phát hiện được tư thế'],
      );
    }

    // Pick best visible side
    final isLeft = leftArm;
    final shoulder = isLeft ? landmarks['leftShoulder']! : landmarks['rightShoulder']!;
    final elbow = isLeft ? landmarks['leftElbow']! : landmarks['rightElbow']!;
    final wrist = isLeft ? landmarks['leftWrist']! : landmarks['rightWrist']!;
    final hip = isLeft ? landmarks['leftHip']! : landmarks['rightHip']!;
    final knee = isLeft ? (landmarks['leftKnee'] ?? hip) : (landmarks['rightKnee'] ?? hip);
    final ankle = isLeft ? (landmarks['leftAnkle'] ?? knee) : (landmarks['rightAnkle'] ?? knee);
    final nose = landmarks['nose'];
    
    // 1. Calculate joint angles
    final elbowAngle = PoseUtils.calculateAngle(shoulder, elbow, wrist);
    final hipPlankAngle = PoseUtils.calculateAngle(shoulder, hip, ankle);
    
    _currentIssues = [];
    _currentAntiCheatAlert = null;
    bool isFormValid = true;
    String? realtimeFeedback;

    // Track lowest depth reached in current rep
    if (elbowAngle < _lowestElbowAngleInRep) {
      _lowestElbowAngleInRep = elbowAngle;
    }

    // ── Anti-Cheat 1: Head Bobbing / Nodding (Gật đầu ăn gian) ──
    // If head/nose drops significantly while elbow angle is still large (> 125 deg)
    if (nose != null && _repState == RepState.goingDown) {
      if (_initialNoseY > 0) {
        final double headDrop = (nose.y - _initialNoseY).abs();
        final double shoulderDrop = (shoulder.y - _initialShoulderY).abs();
        if (headDrop > 35 && shoulderDrop < 12 && elbowAngle > 125) {
          _currentAntiCheatAlert = '🚫 CẢNH BÁO GẬT ĐẦU ĂN GIAN: Hãy gập khuỷu tay hạ ngực, không cúi đầu!';
          isFormValid = false;
        }
      }
    }

    // ── Anti-Cheat 2: Sagging Hips / Arched Back (Võng lưng / Chạm bụng trước) ──
    if (hipPlankAngle < pushupMinHipAngle) {
      _currentIssues.add('Võng lưng (Sà bụng xuống)');
      isFormValid = false;
      realtimeFeedback = 'Siết bụng, giữ thẳng người từ vai đến gót chân!';
    } else if (hipPlankAngle < pushupPikeHipAngle) {
      _currentIssues.add('Nhô mông quá cao');
      isFormValid = false;
      realtimeFeedback = 'Hạ hông xuống thẳng hàng!';
    }

    // ── Biomechanical Push-Up Rep State Machine ──
    final now = DateTime.now();

    switch (_repState) {
      case RepState.waiting:
        // Ready at top lockout (elbows >= 155 deg and straight plank)
        if (elbowAngle >= pushupLockoutAngle) {
          _repState = RepState.goingDown;
          _repStartTime = now;
          _lowestElbowAngleInRep = elbowAngle;
          if (nose != null) _initialNoseY = nose.y;
          _initialShoulderY = shoulder.y;
        }
        realtimeFeedback = 'Bắt đầu: Hạ ngực xuống vuông góc 90°';
        break;

      case RepState.goingDown:
        // Check if bottom depth (<= 92 deg) is reached
        if (elbowAngle <= pushupBottomAngle) {
          _repState = RepState.goingUp;
          _bottomReachedTime = now;
          realtimeFeedback = '✓ Đạt độ sâu! Đẩy người lên dứt khoát!';
        } else {
          realtimeFeedback = 'Xuống sâu hơn một chút (Góc: ${elbowAngle.round()}° / 90°)';
        }
        break;

      case RepState.goingUp:
        // Returning to top lockout (>= 155 deg)
        if (elbowAngle >= pushupLockoutAngle) {
          final double repDuration = _repStartTime != null
              ? now.difference(_repStartTime!).inMilliseconds / 1000.0
              : 1.0;

          // ── Anti-Cheat 3: Half-Rep Verification (Chưa xuống đủ sâu) ──
          final bool reachedFullDepth = _lowestElbowAngleInRep <= pushupBottomAngle;
          
          // ── Anti-Cheat 4: Rep too fast (Làm quá nhanh / Giật cục) ──
          final bool isPlausibleSpeed = repDuration >= pushupMinDurationSec;

          if (!reachedFullDepth) {
            _currentAntiCheatAlert = '⚠️ NỬA REP: Bạn chưa xuống đủ sâu (cần đạt 90°)! Không tính rep.';
          } else if (!isPlausibleSpeed) {
            _currentAntiCheatAlert = '⚠️ QUÁ NHANH (${repDuration.toStringAsFixed(2)}s): Thực hiện chậm và có kiểm soát!';
          } else {
            // Count valid rep!
            _repCount++;
            final bool isStrictlyCorrect = isFormValid && _currentIssues.isEmpty;
            if (isStrictlyCorrect) {
              _correctCount++;
            }
            onRepCompleted?.call(_repCount, isStrictlyCorrect);
          }

          _repState = RepState.waiting;
          _repStartTime = null;
          _lowestElbowAngleInRep = 180.0;
        } else {
          realtimeFeedback = 'Đẩy thẳng tay khóa khớp trên (Góc: ${elbowAngle.round()}°)';
        }
        break;

      case RepState.completed:
        _repState = RepState.waiting;
        break;
    }

    return FrameAnalysis(
      repCount: _repCount,
      correctRepCount: _correctCount,
      currentAngle: elbowAngle,
      bodyAlignmentAngle: hipPlankAngle,
      isCorrectForm: isFormValid && _currentAntiCheatAlert == null,
      feedback: _currentAntiCheatAlert ?? realtimeFeedback,
      antiCheatAlert: _currentAntiCheatAlert,
      repState: _repState,
      formIssues: _currentIssues,
    );
  }

  // -------------------------------------------------------------
  // 2. Biomechanical Pull-Up Analysis & Anti-Cheat
  // -------------------------------------------------------------
  FrameAnalysis _analyzePullup(Map<String, PoseLandmark?> landmarks) {
    final leftArm = landmarks['leftShoulder'] != null &&
        landmarks['leftElbow'] != null &&
        landmarks['leftWrist'] != null;

    final rightArm = landmarks['rightShoulder'] != null &&
        landmarks['rightElbow'] != null &&
        landmarks['rightWrist'] != null;

    final nose = landmarks['nose'];
    
    if ((!leftArm && !rightArm) || nose == null) {
      return FrameAnalysis(
        repCount: _repCount,
        correctRepCount: _correctCount,
        currentAngle: 0,
        isCorrectForm: false,
        feedback: 'Vui lòng đứng trong khung hình (Góc trực diện hoặc chéo)',
        repState: _repState,
        formIssues: ['Không phát hiện được tư thế'],
      );
    }
    
    final isLeft = leftArm;
    final shoulder = isLeft ? landmarks['leftShoulder']! : landmarks['rightShoulder']!;
    final elbow = isLeft ? landmarks['leftElbow']! : landmarks['rightElbow']!;
    final wrist = isLeft ? landmarks['leftWrist']! : landmarks['rightWrist']!;
    final hip = isLeft ? landmarks['leftHip'] : landmarks['rightHip'];

    // Calculate elbow angle
    final elbowAngle = PoseUtils.calculateAngle(shoulder, elbow, wrist);
    
    // Check if chin / nose has ascended past wrist / bar level
    // In screen coordinates: smaller Y = higher physical position
    final bool chinAboveBar = (nose.y <= wrist.y + 25.0);
    
    _currentIssues = [];
    _currentAntiCheatAlert = null;
    bool isFormValid = true;
    String? realtimeFeedback;

    if (elbowAngle < _lowestElbowAngleInRep) {
      _lowestElbowAngleInRep = elbowAngle;
    }

    // ── Anti-Cheat: Kipping & Leg Swinging Detection (Lăng người / Giật chân) ──
    if (hip != null) {
      _recentHipXHistory.add(hip.x);
      if (_recentHipXHistory.length > 10) {
        _recentHipXHistory.removeAt(0);
      }

      if (_recentHipXHistory.length >= 8 && _repState == RepState.goingUp) {
        final double minX = _recentHipXHistory.reduce(math.min);
        final double maxX = _recentHipXHistory.reduce(math.max);
        final double hipSwingWidth = (maxX - minX).abs();

        if (hipSwingWidth > 45.0) {
          _currentAntiCheatAlert = '🚫 CẢNH BÁO LĂNG NGƯỜI (KIPPING): Hãy dùng cơ xô kéo tĩnh, không giật chân!';
          isFormValid = false;
        }
      }
    }

    // ── Biomechanical Pull-Up Rep State Machine ──
    final now = DateTime.now();

    switch (_repState) {
      case RepState.waiting:
        // Starting dead-hang position: arms fully extended (>= 155 deg)
        if (elbowAngle >= pullupDeadHangAngle) {
          _repState = RepState.goingUp;
          _repStartTime = now;
          _lowestElbowAngleInRep = elbowAngle;
          _recentHipXHistory.clear();
        }
        realtimeFeedback = 'Treo người duỗi thẳng tay để bắt đầu';
        break;

      case RepState.goingUp:
        // Peak of pull-up reached: Chin above bar AND elbow flexed <= 78 deg
        if (chinAboveBar && elbowAngle <= pullupTopAngle) {
          _repState = RepState.goingDown;
          _bottomReachedTime = now;
          realtimeFeedback = '✓ Cằm đã vượt xà! Hạ người có kiểm soát!';
        } else {
          realtimeFeedback = 'Kéo mạnh lên: Đưa cằm vượt xà (Góc tay: ${elbowAngle.round()}°)';
        }
        break;

      case RepState.goingDown:
        // Returning down to dead hang (elbows >= 155 deg)
        if (elbowAngle >= pullupDeadHangAngle) {
          final double repDuration = _repStartTime != null
              ? now.difference(_repStartTime!).inMilliseconds / 1000.0
              : 1.0;

          // ── Anti-Cheat: Partial Pull-up Verification (Kéo chưa tới cằm) ──
          final bool reachedTop = _lowestElbowAngleInRep <= pullupTopAngle;
          final bool isPlausibleSpeed = repDuration >= pullupMinDurationSec;

          if (!reachedTop) {
            _currentAntiCheatAlert = '⚠️ NỬA REP: Cằm chưa qua xà! Không tính rep.';
          } else if (!isPlausibleSpeed) {
            _currentAntiCheatAlert = '⚠️ QUÁ NHANH (${repDuration.toStringAsFixed(2)}s): Không tính lần này!';
          } else {
            // Valid pull-up rep!
            _repCount++;
            final bool isStrictlyCorrect = isFormValid && _currentIssues.isEmpty;
            if (isStrictlyCorrect) {
              _correctCount++;
            }
            onRepCompleted?.call(_repCount, isStrictlyCorrect);
          }

          _repState = RepState.waiting;
          _repStartTime = null;
          _lowestElbowAngleInRep = 180.0;
        } else {
          realtimeFeedback = 'Hạ người hết cỡ duỗi thẳng tay (Góc: ${elbowAngle.round()}°)';
        }
        break;

      case RepState.completed:
        _repState = RepState.waiting;
        break;
    }

    return FrameAnalysis(
      repCount: _repCount,
      correctRepCount: _correctCount,
      currentAngle: elbowAngle,
      bodyAlignmentAngle: 180.0,
      isCorrectForm: isFormValid && _currentAntiCheatAlert == null,
      feedback: _currentAntiCheatAlert ?? realtimeFeedback,
      antiCheatAlert: _currentAntiCheatAlert,
      repState: _repState,
      formIssues: _currentIssues,
    );
  }

  /// Getters
  int get repCount => _repCount;
  int get correctCount => _correctCount;
  RepState get repState => _repState;
  List<String> get formIssues => _currentIssues;
}
