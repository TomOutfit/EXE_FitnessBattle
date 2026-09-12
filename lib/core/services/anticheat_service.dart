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
  
  /// Reset anti-cheat state
  void reset() {
    _lastRepTime = null;
    _recentRepDurations.clear();
    _consecutiveViolations = 0;
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
        return 'Nửa rep (xuống chưa đủ sâu)';
      case AntiCheatViolation.kippingSwinging:
        return 'Lăng người / Giật chân (kéo tĩnh bằng cơ xô)';
      case AntiCheatViolation.incompleteLockout:
        return 'Chưa khóa thẳng tay';
      case AntiCheatViolation.missingLandmarks:
        return 'Chưa trọn vẹn trong khung hình';
      case AntiCheatViolation.lowConfidence:
        return 'Độ sáng yếu hoặc góc camera bị che';
    }
  }
}
