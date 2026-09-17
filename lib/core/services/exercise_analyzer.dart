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
  final bool reachedDepth;
  final String depthStatus; // 'ready', 'going_down', 'depth_passed'
  final double virtualBarY;
  
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
    this.reachedDepth = false,
    this.depthStatus = 'ready',
    this.virtualBarY = 0.0,
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
  bool _reachedDepth = false;
  double _virtualBarY = 0.0;
  
  // Biomechanical Angle Thresholds (International Standard)
  // Push-up Thresholds
  static const double pushupLockoutAngle = 150.0; // Arms extended at top (150 deg)
  static const double pushupBottomAngle = 90.0;   // Vai hạ ngang hoặc qua khuỷu tay (<= 90 deg)
  static const double pushupMinHipAngle = 145.0;  // Body straight plank line (180 deg ideal)
  static const double pushupPikeHipAngle = 135.0; // Piking hips up
  
  // Pull-up Thresholds
  static const double pullupDeadHangAngle = 140.0; // Full arms extension at bottom (dead hang)
  static const double pullupTopAngle = 85.0;      // Flexed pull
  
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
    _reachedDepth = false;
    _virtualBarY = 0.0;
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

    // Kiểm tra vai hạ ngang hoặc qua khuỷu tay (trong toạ độ màn hình Y tăng dần về phía sàn)
    final bool isShoulderPastElbow = shoulder.y >= elbow.y - 12.0;
    final bool isDepthMet = elbowAngle <= pushupBottomAngle || isShoulderPastElbow;

    if (isDepthMet && _repState == RepState.goingDown) {
      _reachedDepth = true;
    }

    switch (_repState) {
      case RepState.waiting:
        // Ready at top lockout (elbows >= 150 deg and straight plank)
        if (elbowAngle >= pushupLockoutAngle) {
          _repState = RepState.goingDown;
          _repStartTime = now;
          _lowestElbowAngleInRep = elbowAngle;
          _reachedDepth = false;
          if (nose != null) _initialNoseY = nose.y;
          _initialShoulderY = shoulder.y;
        }
        realtimeFeedback = 'Bắt đầu: Hạ vai ngang hoặc qua khuỷu tay (≤90°)';
        break;

      case RepState.goingDown:
        // Kiểm tra đạt độ sâu chuẩn
        if (isDepthMet) {
          _reachedDepth = true;
          _repState = RepState.goingUp;
          _bottomReachedTime = now;
          realtimeFeedback = '✓ Đã đạt độ sâu (vai qua khuỷu tay)! Đẩy thẳng tay lên!';
        } else {
          realtimeFeedback = 'Hạ vai thêm một chút (Góc: ${elbowAngle.round()}° → cần ≤90°)';
        }
        break;

      case RepState.goingUp:
        // Đẩy người lên hoàn tất rep (>= 150 deg)
        if (elbowAngle >= pushupLockoutAngle) {
          final double repDuration = _repStartTime != null
              ? now.difference(_repStartTime!).inMilliseconds / 1000.0
              : 1.0;

          // ── Quy tắc: Vai phải hạ ngang hoặc qua khuỷu tay mới tính 1 rep ──
          final bool isPlausibleSpeed = repDuration >= pushupMinDurationSec;

          if (!_reachedDepth) {
            _currentAntiCheatAlert = '⚠️ Không tính rep: Vai chưa hạ ngang hoặc qua khuỷu tay (đạt ${_lowestElbowAngleInRep.round()}°, cần ≤90°)!';
          } else if (!isPlausibleSpeed) {
            _currentAntiCheatAlert = '⚠️ QUÁ NHANH (${repDuration.toStringAsFixed(2)}s): Thực hiện chậm và có kiểm soát!';
          } else {
            // Rep hợp lệ!
            _repCount++;
            final bool isStrictlyCorrect = isFormValid && _currentIssues.isEmpty;
            if (isStrictlyCorrect) {
              _correctCount++;
            }
            onRepCompleted?.call(_repCount, isStrictlyCorrect);
          }

          _repState = RepState.waiting;
          _repStartTime = null;
          _reachedDepth = false;
          _lowestElbowAngleInRep = 180.0;
        } else {
          realtimeFeedback = 'Đẩy thẳng tay khóa khớp trên (Góc: ${elbowAngle.round()}°)';
        }
        break;

      case RepState.completed:
        _repState = RepState.waiting;
        break;
    }

    final String depthStatus = _reachedDepth
        ? 'depth_passed'
        : (_repState == RepState.goingDown ? 'going_down' : 'ready');

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
      reachedDepth: _reachedDepth,
      depthStatus: depthStatus,
      virtualBarY: 0.0,
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

    // Cập nhật vị trí xà đơn ảo theo cổ tay
    double wristMidY = wrist.y;
    if (landmarks['leftWrist'] != null && landmarks['rightWrist'] != null) {
      wristMidY = (landmarks['leftWrist']!.y + landmarks['rightWrist']!.y) / 2.0;
    }
    if (_virtualBarY == 0.0) {
      _virtualBarY = wristMidY;
    } else {
      _virtualBarY = _virtualBarY * 0.85 + wristMidY * 0.15;
    }

    // Calculate elbow angle
    final elbowAngle = PoseUtils.calculateAngle(shoulder, elbow, wrist);
    
    // QUY TẮC: "Đầu vượt qua tay là tính hít xà"
    // Trong hệ tọa độ Y: nhỏ hơn là ở trên cao
    final bool headOverHands = (nose.y <= _virtualBarY + 18.0);
    
    _currentIssues = [];
    _currentAntiCheatAlert = null;
    bool isFormValid = true;
    String? realtimeFeedback;

    if (elbowAngle < _lowestElbowAngleInRep) {
      _lowestElbowAngleInRep = elbowAngle;
    }

    if (headOverHands && _repState == RepState.goingUp) {
      _reachedDepth = true;
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
        // Starting dead-hang position: arms extended (>= 140 deg)
        if (elbowAngle >= pullupDeadHangAngle) {
          _repState = RepState.goingUp;
          _repStartTime = now;
          _lowestElbowAngleInRep = elbowAngle;
          _reachedDepth = false;
          _recentHipXHistory.clear();
        }
        realtimeFeedback = 'Treo người duỗi thẳng tay để bắt đầu';
        break;

      case RepState.goingUp:
        // Đỉnh của rep: Đầu/cằm vượt qua tay/xà
        if (headOverHands) {
          _reachedDepth = true;
          _repState = RepState.goingDown;
          _bottomReachedTime = now;
          realtimeFeedback = '✓ ĐẦU ĐÃ VƯỢT QUA TAY! Hạ người có kiểm soát!';
        } else {
          realtimeFeedback = 'Kéo mạnh lên: Đưa đầu vượt qua tay (Góc tay: ${elbowAngle.round()}°)';
        }
        break;

      case RepState.goingDown:
        // Hạ người về dead hang (elbows >= 140 deg)
        if (elbowAngle >= pullupDeadHangAngle) {
          final double repDuration = _repStartTime != null
              ? now.difference(_repStartTime!).inMilliseconds / 1000.0
              : 1.0;

          // ── Quy tắc: Phải kéo đầu vượt qua tay mới tính 1 rep hít xà ──
          final bool isPlausibleSpeed = repDuration >= pullupMinDurationSec;

          if (!_reachedDepth) {
            _currentAntiCheatAlert = '⚠️ Không tính rep: Đầu chưa vượt qua tay! Hãy kéo đầu vượt qua xà!';
          } else if (!isPlausibleSpeed) {
            _currentAntiCheatAlert = '⚠️ QUÁ NHANH (${repDuration.toStringAsFixed(2)}s): Không tính lần này!';
          } else {
            // Rep hít xà hợp lệ!
            _repCount++;
            final bool isStrictlyCorrect = isFormValid && _currentIssues.isEmpty;
            if (isStrictlyCorrect) {
              _correctCount++;
            }
            onRepCompleted?.call(_repCount, isStrictlyCorrect);
          }

          _repState = RepState.waiting;
          _repStartTime = null;
          _reachedDepth = false;
          _lowestElbowAngleInRep = 180.0;
        } else {
          realtimeFeedback = 'Hạ người hết cỡ duỗi thẳng tay (Góc: ${elbowAngle.round()}°)';
        }
        break;

      case RepState.completed:
        _repState = RepState.waiting;
        break;
    }

    final String depthStatus = _reachedDepth
        ? 'depth_passed'
        : (_repState == RepState.goingUp ? 'going_down' : 'ready');

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
      reachedDepth: _reachedDepth,
      depthStatus: depthStatus,
      virtualBarY: _virtualBarY,
    );
  }

  /// Getters
  int get repCount => _repCount;
  int get correctCount => _correctCount;
  RepState get repState => _repState;
  List<String> get formIssues => _currentIssues;
  bool get reachedDepth => _reachedDepth;
  double get virtualBarY => _virtualBarY;
}
