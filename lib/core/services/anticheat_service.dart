import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import 'pose_detection_service.dart';
import 'exercise_analyzer.dart';

/// Anti-cheat validation result
class AntiCheatResult {
  final bool isValid;
  final List<AntiCheatViolation> violations;
  final String? warning;
  
  AntiCheatResult({
    required this.isValid,
    this.violations = const [],
    this.warning,
  });
  
  factory AntiCheatResult.valid() => AntiCheatResult(isValid: true);
  
  factory AntiCheatResult.invalid(List<AntiCheatViolation> violations, [String? warning]) => 
      AntiCheatResult(isValid: false, violations: violations, warning: warning);
}

/// Types of anti-cheat violations
enum AntiCheatViolation {
  tooFast,           // Rep completed too fast (< 0.7s)
  headBobbing,       // Nodding/dropping head instead of bending elbows
  saggingHips,       // Dropping belly/hips to touch ground early
  pikingHips,        // Raising butt/hips high in the air
  halfRep,           // Incomplete depth (< 90 deg pushup / chin not over bar)
  kippingSwinging,   // Kicking legs or swinging body on pull-up
  incompleteLockout, // Not locking out arms at top/bottom
  missingLandmarks,  // Not enough body visible in camera frame
  lowConfidence,     // Low detection confidence / poor lighting
  notHuman,          // Chỉ tính con người thật
  strangerDetected,  // Phát hiện người khác bước vào
  userAway,          // Người tập ban đầu rời khỏi camera
}

/// Anti-cheat service for validating exercise form & detecting cheats
class AntiCheatService {
  // Configuration
  final double minPushupDuration = 0.70;
  final double minPullupDuration = 0.90;
  final double minConfidence = 0.50;
  
  // Tracking
  DateTime? _lastRepTime;
  final List<double> _recentRepDurations = [];
  int _consecutiveViolations = 0;

  // Single-Subject Lock
  BiometricSignature? _lockedSignature;
  int _lockFrames = 0;
  DateTime _lastSeenUserTime = DateTime.now();
  bool _isUserAway = false;
  String _subjectStatus = 'locking'; // 'locking', 'matched', 'user_away', 'stranger_detected'
  int _subjectMatchScore = 100;
  
  /// Reset anti-cheat state
  void reset() {
    _lastRepTime = null;
    _recentRepDurations.clear();
    _consecutiveViolations = 0;
    _lockedSignature = null;
    _lockFrames = 0;
    _lastSeenUserTime = DateTime.now();
    _isUserAway = false;
    _subjectStatus = 'locking';
    _subjectMatchScore = 100;
  }
  
  /// Validate a complete rep
  AntiCheatResult validateRep({
    required ExerciseAnalyzer analyzer,
    required RealExerciseType exerciseType,
  }) {
    final issues = <AntiCheatViolation>[];
    String? warning;
    final now = DateTime.now();
    
    // Check rep duration
    if (_lastRepTime != null) {
      final duration = now.difference(_lastRepTime!).inMilliseconds / 1000.0;
      final minDuration = exerciseType == RealExerciseType.pushup ? minPushupDuration : minPullupDuration;
      
      if (duration < minDuration) {
        issues.add(AntiCheatViolation.tooFast);
        warning = 'Thực hiện quá nhanh (${duration.toStringAsFixed(2)}s) - Không tính rep này!';
        _consecutiveViolations++;
      } else {
        _consecutiveViolations = 0;
      }
      
      _recentRepDurations.add(duration);
      if (_recentRepDurations.length > 5) {
        _recentRepDurations.removeAt(0);
      }
    }
    
    _lastRepTime = now;
    
    return issues.isEmpty 
        ? AntiCheatResult.valid()
        : AntiCheatResult.invalid(issues, warning);
  }
  
  /// Validate pose landmarks in real time
  AntiCheatResult validatePose(Pose pose, RealExerciseType exerciseType) {
    final issues = <AntiCheatViolation>[];
    final landmarks = pose.landmarks;
    
    // Check for required landmarks
    final requiredLandmarks = exerciseType == RealExerciseType.pushup
        ? [
            PoseLandmarkType.leftShoulder,
            PoseLandmarkType.leftElbow,
            PoseLandmarkType.leftWrist,
            PoseLandmarkType.leftHip,
          ]
        : [
            PoseLandmarkType.leftShoulder,
            PoseLandmarkType.leftElbow,
            PoseLandmarkType.leftWrist,
            PoseLandmarkType.nose,
          ];
    
    for (final type in requiredLandmarks) {
      final landmark = landmarks[type];
      if (landmark == null) {
        issues.add(AntiCheatViolation.missingLandmarks);
        break;
      }
      
      if (landmark.likelihood < minConfidence) {
        issues.add(AntiCheatViolation.lowConfidence);
        break;
      }
    }
    
    return issues.isEmpty 
        ? AntiCheatResult.valid()
        : AntiCheatResult.invalid(issues, getViolationMessage(issues.first));
  }
  
  /// Validate that pose belongs to human and to the single locked subject
  AntiCheatResult validateSubject(Pose pose) {
    // 1. Kiểm tra chỉ tính con người thật
    final human = PoseUtils.validateHumanPose(pose);
    if (!human.isHuman) {
      return AntiCheatResult.invalid([AntiCheatViolation.notHuman], '🚫 AI chỉ tính con người: ${human.reason}');
    }

    // 2. Khóa đối tượng duy nhất (Single-Subject Lock)
    final sig = PoseUtils.extractBiometricSignature(pose);
    if (sig == null) {
      return AntiCheatResult.valid();
    }

    // Nếu chưa khóa, tích lũy 5 frame để khóa người tập ban đầu
    if (_lockedSignature == null) {
      _lockFrames++;
      if (_lockFrames >= 5) {
        _lockedSignature = sig;
        _subjectStatus = 'matched';
        _subjectMatchScore = 100;
        _lastSeenUserTime = DateTime.now();
        _isUserAway = false;
      } else {
        _subjectStatus = 'locking';
      }
      return AntiCheatResult.valid();
    }

    // Đã khóa -> đối chiếu chữ ký sinh trắc học
    final match = PoseUtils.compareBiometricSignatures(_lockedSignature!, sig);
    _subjectMatchScore = match.similarity;

    if (!match.isSamePerson) {
      // Người khác bước vào -> Chặn tuyệt đối!
      _subjectStatus = 'stranger_detected';
      return AntiCheatResult.invalid(
        [AntiCheatViolation.strangerDetected],
        '🚫 PHÁT HIỆN NGƯỜI KHÁC: Hệ thống đã khóa với bạn (Độ khớp: ${match.similarity}%)',
      );
    }

    // Đúng người tập ban đầu
    _lastSeenUserTime = DateTime.now();
    _isUserAway = false;
    _subjectStatus = 'matched';
    return AntiCheatResult.valid();
  }

  /// Check if user has stepped away from camera (> 1.2s)
  bool checkUserAway() {
    if (_lockedSignature == null) return false;
    final int awayMs = DateTime.now().difference(_lastSeenUserTime).inMilliseconds;
    if (awayMs > 1200) {
      _isUserAway = true;
      _subjectStatus = 'user_away';
      return true;
    }
    return false;
  }

  String get subjectStatus => _subjectStatus;
  int get subjectMatchScore => _subjectMatchScore;
  bool get isUserAway => _isUserAway;

  /// Get current violation count
  int get consecutiveViolations => _consecutiveViolations;
  
  /// Get violation message
  String getViolationMessage(AntiCheatViolation violation) {
    switch (violation) {
      case AntiCheatViolation.tooFast:
        return 'Thực hiện quá nhanh';
      case AntiCheatViolation.headBobbing:
        return 'Gật đầu ăn gian (hạ ngực, không cúi đầu)';
      case AntiCheatViolation.saggingHips:
        return 'Võng lưng (siết cơ bụng giữ thẳng)';
      case AntiCheatViolation.pikingHips:
        return 'Nhô mông quá cao';
      case AntiCheatViolation.halfRep:
        return 'Nửa rep (vai chưa hạ ngang khuỷu tay)';
      case AntiCheatViolation.kippingSwinging:
        return 'Lăng người / Giật chân (kéo tĩnh bằng cơ xô)';
      case AntiCheatViolation.incompleteLockout:
        return 'Chưa khóa thẳng tay';
      case AntiCheatViolation.missingLandmarks:
        return 'Chưa trọn vẹn trong khung hình';
      case AntiCheatViolation.lowConfidence:
        return 'Độ sáng yếu hoặc góc camera bị che';
      case AntiCheatViolation.notHuman:
        return 'Chỉ nhận diện con người thật';
      case AntiCheatViolation.strangerDetected:
        return 'Phát hiện người khác (đang khóa người ban đầu)';
      case AntiCheatViolation.userAway:
        return 'Bạn đã rời khỏi camera';
    }
  }
}
