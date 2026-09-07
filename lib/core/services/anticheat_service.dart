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
  tooFast,           // Rep completed too fast
  impossibleAngle,   // Body position impossible
  missingLandmarks,  // Not enough body visible
  bodyOutOfFrame,    // Body partially out of frame
  suspiciousPattern,  // Suspicious pattern detected
  lowConfidence,     // Low detection confidence
}

/// Anti-cheat service for validating exercise form
class AntiCheatService {
  // Configuration
  final double minRepDuration = 0.5; // Minimum seconds for a rep
  final double maxRepSpeed = 5.0;    // Max reps per second
  final double minConfidence = 0.5;  // Minimum landmark confidence
  
  // Tracking
  DateTime? _lastRepTime;
  List<double> _recentRepDurations = [];
  int _consecutiveViolations = 0;
  
  // Thresholds for push-up
  static const double pushupMinElbowAngle = 45;
  static const double pushupMaxElbowAngle = 200;
  static const double pushupMinShoulderAngle = 0;
  static const double pushupMaxShoulderAngle = 90;
  
  // Thresholds for pull-up
  static const double pullupMinElbowAngle = 30;
  static const double pullupMaxElbowAngle = 200;
  
  /// Reset anti-cheat state
  void reset() {
    _lastRepTime = null;
    _recentRepDurations = [];
    _consecutiveViolations = 0;
  }
  
  /// Validate a complete rep
  AntiCheatResult validateRep({
    required ExerciseAnalyzer analyzer,
    required RealExerciseType exerciseType,
  }) {
    final issues = <AntiCheatViolation>[];
    String? warning;
    
    // Check rep duration
    if (_lastRepTime != null && analyzer.repState == RepState.waiting) {
      final duration = DateTime.now().difference(_lastRepTime!).inMilliseconds / 1000;
      
      if (duration < minRepDuration) {
        issues.add(AntiCheatViolation.tooFast);
        warning = 'Thực hiện quá nhanh - không tính lần này';
        _consecutiveViolations++;
      } else if (duration > 10) {
        // Too slow is okay, just reset
        _consecutiveViolations = 0;
      }
      
      _recentRepDurations.add(duration);
      if (_recentRepDurations.length > 5) {
        _recentRepDurations.removeAt(0);
      }
      
      _lastRepTime = DateTime.now();
    }
    
    // Check for suspicious patterns (all reps too fast)
    if (_recentRepDurations.length >= 3) {
      final avgDuration = _recentRepDurations.reduce((a, b) => a + b) / _recentRepDurations.length;
      if (avgDuration < minRepDuration * 1.5) {
        issues.add(AntiCheatViolation.suspiciousPattern);
        warning = 'Phát hiện nghi vấn - vui lòng kiểm tra';
      }
    }
    
    // Too many consecutive violations
    if (_consecutiveViolations >= 3) {
      issues.add(AntiCheatViolation.suspiciousPattern);
      warning = 'Nhiều lần sai liên tiếp - yêu cầu kiểm tra';
    }
    
    return issues.isEmpty 
        ? AntiCheatResult.valid()
        : AntiCheatResult.invalid(issues, warning);
  }
  
  /// Validate pose landmarks
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
    
    // Check for impossible angles based on exercise type
    if (exerciseType == RealExerciseType.pushup) {
      final pushupResult = _validatePushupAngles(landmarks);
      if (pushupResult != null) {
        issues.add(pushupResult);
      }
    } else {
      final pullupResult = _validatePullupAngles(landmarks);
      if (pullupResult != null) {
        issues.add(pullupResult);
      }
    }
    
    return issues.isEmpty 
        ? AntiCheatResult.valid()
        : AntiCheatResult.invalid(issues, 'Kiểm tra vị trí cơ thể');
  }
  
  /// Validate push-up specific angles
  AntiCheatViolation? _validatePushupAngles(Map<PoseLandmarkType, PoseLandmark> landmarks) {
    final leftElbow = landmarks[PoseLandmarkType.leftElbow];
    final rightElbow = landmarks[PoseLandmarkType.rightElbow];
    final leftShoulder = landmarks[PoseLandmarkType.leftShoulder];
    
    if (leftElbow == null || rightElbow == null || leftShoulder == null) return null;
    
    // Check elbow angles
    final leftAngle = PoseUtils.calculateAngle(
      landmarks[PoseLandmarkType.leftShoulder]!,
      leftElbow,
      landmarks[PoseLandmarkType.leftWrist]!,
    );
    
    if (leftAngle < pushupMinElbowAngle || leftAngle > pushupMaxElbowAngle) {
      return AntiCheatViolation.impossibleAngle;
    }
    
    // Check if elbows are bent backwards (impossible)
    if (leftAngle > 180) {
      return AntiCheatViolation.impossibleAngle;
    }
    
    return null;
  }
  
  /// Validate pull-up specific angles
  AntiCheatViolation? _validatePullupAngles(Map<PoseLandmarkType, PoseLandmark> landmarks) {
    final leftElbow = landmarks[PoseLandmarkType.leftElbow];
    
    if (leftElbow == null) return null;
    
    final leftAngle = PoseUtils.calculateAngle(
      landmarks[PoseLandmarkType.leftShoulder]!,
      leftElbow,
      landmarks[PoseLandmarkType.leftWrist]!,
    );
    
    if (leftAngle < pullupMinElbowAngle || leftAngle > pullupMaxElbowAngle) {
      return AntiCheatViolation.impossibleAngle;
    }
    
    return null;
  }
  
  /// Get current violation count
  int get consecutiveViolations => _consecutiveViolations;
  
  /// Check if user should be flagged
  bool get shouldFlag => _consecutiveViolations >= 5;
  
  /// Get violation message
  String getViolationMessage(AntiCheatViolation violation) {
    switch (violation) {
      case AntiCheatViolation.tooFast:
        return 'Thực hiện quá nhanh';
      case AntiCheatViolation.impossibleAngle:
        return 'Vị trí bất khả thi';
      case AntiCheatViolation.missingLandmarks:
        return 'Thiếu điểm tham chiếu';
      case AntiCheatViolation.bodyOutOfFrame:
        return 'Cơ thể nằm ngoài khung hình';
      case AntiCheatViolation.suspiciousPattern:
        return 'Phát hiện nghi vấn';
      case AntiCheatViolation.lowConfidence:
        return 'Độ chính xác thấp';
    }
  }
}
