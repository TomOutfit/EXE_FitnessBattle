import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import 'pose_detection_service.dart';

/// Exercise type enumeration
enum RealExerciseType {
  pushup,
  pullup,
}

/// State of current exercise rep
enum RepState {
  waiting,     // Waiting for start position
  goingDown,   // Moving to down position
  goingUp,     // Moving back to start
  completed,   // Rep completed
}

/// Analysis result for a single frame
class FrameAnalysis {
  final int repCount;
  final double currentAngle;
  final bool isCorrectForm;
  final String? feedback;
  final RepState repState;
  final List<String> formIssues;
  
  FrameAnalysis({
    required this.repCount,
    required this.currentAngle,
    required this.isCorrectForm,
    this.feedback,
    required this.repState,
    this.formIssues = const [],
  });
}

/// Service to analyze poses and count exercise reps
class ExerciseAnalyzer {
  final RealExerciseType exerciseType;
  
  // State
  int _repCount = 0;
  RepState _repState = RepState.waiting;
  DateTime? _lastRepTime;
  List<String> _currentIssues = [];
  
  // Callbacks
  Function(FrameAnalysis)? onFrameAnalyzed;
  Function(int, bool)? onRepCompleted; // (count, isCorrect)
  
  // Configuration thresholds
  final double _repMinDuration = 0.4; // Minimum seconds for a full rep (anti-cheat)
  final int _elbowDownAngle = 110;    // Max angle for "down" position
  final int _elbowUpAngle = 150;      // Min angle for "up" position
  
  // Push-up specific
  final int _shoulderMinAngle = 10;
  final int _shoulderMaxAngle = 75;
  final int _hipMinAngle = 140;
  
  // Pull-up specific
  
  ExerciseAnalyzer({required this.exerciseType});
  
  /// Reset analyzer state
  void reset() {
    _repCount = 0;
    _repState = RepState.waiting;
    _lastRepTime = null;
    _currentIssues = [];
  }
  
  /// Process a pose and return analysis result
  FrameAnalysis analyzePose(Pose pose) {
    final landmarks = PoseUtils.getExerciseLandmarks(pose);
    
    switch (exerciseType) {
      case RealExerciseType.pushup:
        return _analyzePushup(landmarks);
      case RealExerciseType.pullup:
        return _analyzePullup(landmarks);
    }
  }
  
  /// Analyze push-up form (supports both left and right side tracking)
  FrameAnalysis _analyzePushup(Map<String, PoseLandmark?> landmarks) {
    // Check left side
    final hasLeftSide = landmarks['leftShoulder'] != null &&
        landmarks['leftElbow'] != null &&
        landmarks['leftWrist'] != null &&
        landmarks['leftHip'] != null;

    // Check right side
    final hasRightSide = landmarks['rightShoulder'] != null &&
        landmarks['rightElbow'] != null &&
        landmarks['rightWrist'] != null &&
        landmarks['rightHip'] != null;

    if (!hasLeftSide && !hasRightSide) {
      return FrameAnalysis(
        repCount: _repCount,
        currentAngle: 0,
        isCorrectForm: false,
        feedback: 'Vui lòng đứng trong khung hình camera',
        repState: _repState,
        formIssues: ['Không phát hiện được tư thế'],
      );
    }

    // Pick best side based on landmark confidence or presence
    final isLeft = hasLeftSide;
    final shoulder = isLeft ? landmarks['leftShoulder']! : landmarks['rightShoulder']!;
    final elbow = isLeft ? landmarks['leftElbow']! : landmarks['rightElbow']!;
    final wrist = isLeft ? landmarks['leftWrist']! : landmarks['rightWrist']!;
    final hip = isLeft ? landmarks['leftHip']! : landmarks['rightHip']!;
    final ankle = isLeft ? (landmarks['leftAnkle'] ?? hip) : (landmarks['rightAnkle'] ?? hip);
    
    // Calculate elbow angle
    final elbowAngle = PoseUtils.calculateAngle(shoulder, elbow, wrist);
    
    // Check shoulder alignment
    final shoulderAngle = PoseUtils.calculateAngle(elbow, shoulder, hip);
    
    // Check back straightness (hip alignment)
    final hipAngle = PoseUtils.calculateAngle(shoulder, hip, ankle);
    
    // Validate form
    _currentIssues = [];
    bool isCorrectForm = true;
    String? feedback;
    
    // Check shoulder position
    if (shoulderAngle < _shoulderMinAngle || shoulderAngle > _shoulderMaxAngle) {
      _currentIssues.add('Vai cao/thấp quá');
      isCorrectForm = false;
      feedback = 'Giữ góc vai tự nhiên';
    }
    
    // Check back straightness
    if (hipAngle < _hipMinAngle) {
      _currentIssues.add('Lưng cong');
      isCorrectForm = false;
      feedback = 'Giữ lưng thẳng';
    }
    
    // Check elbow range
    if (elbowAngle > 200 || elbowAngle < 30) {
      _currentIssues.add('Góc tay bất thường');
      isCorrectForm = false;
      feedback = 'Kiểm tra vị trí tay';
    }
    
    // Auto rep counting state machine
    _processPushupRep(elbowAngle, isCorrectForm);
    
    return FrameAnalysis(
      repCount: _repCount,
      currentAngle: elbowAngle,
      isCorrectForm: isCorrectForm,
      feedback: feedback ?? (_repState == RepState.goingDown ? 'Xuống sâu hơn' : 'Đẩy người lên'),
      repState: _repState,
      formIssues: _currentIssues,
    );
  }
  
  /// Process push-up rep state machine
  void _processPushupRep(double elbowAngle, bool isCorrectForm) {
    final now = DateTime.now();
    
    switch (_repState) {
      case RepState.waiting:
        // Start when arms are extended (>= 150 deg)
        if (elbowAngle >= _elbowUpAngle) {
          _repState = RepState.goingDown;
          _lastRepTime = now;
        }
        break;
        
      case RepState.goingDown:
        // Going down - reached bottom (<= 110 deg)
        if (elbowAngle <= _elbowDownAngle) {
          _repState = RepState.goingUp;
        }
        break;
        
      case RepState.goingUp:
        // Going back up - rep complete (>= 150 deg)
        if (elbowAngle >= _elbowUpAngle) {
          final isRepValid = isCorrectForm && _currentIssues.isEmpty;
          
          // Anti-cheat duration check
          if (_lastRepTime != null) {
            final duration = now.difference(_lastRepTime!).inMilliseconds / 1000;
            if (duration < _repMinDuration) {
              _currentIssues.add('Thực hiện quá nhanh');
            } else {
              _repCount++;
              onRepCompleted?.call(_repCount, isRepValid);
            }
          } else {
            _repCount++;
            onRepCompleted?.call(_repCount, isRepValid);
          }
          
          _repState = RepState.waiting;
          _lastRepTime = null;
        }
        break;
        
      case RepState.completed:
        _repState = RepState.waiting;
        break;
    }
  }
  
  /// Analyze pull-up form (supports both left and right side tracking)
  FrameAnalysis _analyzePullup(Map<String, PoseLandmark?> landmarks) {
    final hasLeftSide = landmarks['leftShoulder'] != null &&
        landmarks['leftElbow'] != null &&
        landmarks['leftWrist'] != null;

    final hasRightSide = landmarks['rightShoulder'] != null &&
        landmarks['rightElbow'] != null &&
        landmarks['rightWrist'] != null;

    final nose = landmarks['nose'];
    
    if ((!hasLeftSide && !hasRightSide) || nose == null) {
      return FrameAnalysis(
        repCount: _repCount,
        currentAngle: 0,
        isCorrectForm: false,
        feedback: 'Vui lòng đứng trong khung hình camera',
        repState: _repState,
        formIssues: ['Không phát hiện được tư thế'],
      );
    }
    
    final isLeft = hasLeftSide;
    final shoulder = isLeft ? landmarks['leftShoulder']! : landmarks['rightShoulder']!;
    final elbow = isLeft ? landmarks['leftElbow']! : landmarks['rightElbow']!;
    final wrist = isLeft ? landmarks['leftWrist']! : landmarks['rightWrist']!;

    // Calculate elbow angle
    final elbowAngle = PoseUtils.calculateAngle(shoulder, elbow, wrist);
    
    // Check if chin/nose is above shoulder level
    final chinAboveShoulder = (nose.y - shoulder.y) < 15;
    
    // Validate form
    _currentIssues = [];
    bool isCorrectForm = true;
    String? feedback;
    
    // Check for half rep
    if (elbowAngle > 115 && elbowAngle < 150) {
      _currentIssues.add('Chưa kéo lên đủ cao');
      isCorrectForm = false;
      feedback = 'Kéo cằm qua xà';
    }
    
    // Auto rep counting logic
    _processPullupRep(chinAboveShoulder, elbowAngle, isCorrectForm);
    
    return FrameAnalysis(
      repCount: _repCount,
      currentAngle: elbowAngle,
      isCorrectForm: isCorrectForm,
      feedback: feedback ?? (chinAboveShoulder ? 'Hạ người xuống' : 'Kéo người lên'),
      repState: _repState,
      formIssues: _currentIssues,
    );
  }
  
  /// Process pull-up rep state machine
  void _processPullupRep(bool chinAboveShoulder, double elbowAngle, bool isCorrectForm) {
    final now = DateTime.now();
    
    switch (_repState) {
      case RepState.waiting:
        // Start hanging with arms extended (>= 150 deg)
        if (elbowAngle >= _elbowUpAngle) {
          _repState = RepState.goingUp;
          _lastRepTime = now;
        }
        break;
        
      case RepState.goingUp:
        // Chin above bar or elbow bent <= 100 deg
        if (chinAboveShoulder || elbowAngle <= 100) {
          _repState = RepState.goingDown;
        }
        break;
        
      case RepState.goingDown:
        // Arms extended again = rep complete
        if (elbowAngle >= _elbowUpAngle) {
          final isRepValid = isCorrectForm && _currentIssues.isEmpty;
          
          if (_lastRepTime != null) {
            final duration = now.difference(_lastRepTime!).inMilliseconds / 1000;
            if (duration < _repMinDuration) {
              _currentIssues.add('Thực hiện quá nhanh');
            } else {
              _repCount++;
              onRepCompleted?.call(_repCount, isRepValid);
            }
          } else {
            _repCount++;
            onRepCompleted?.call(_repCount, isRepValid);
          }
          _repState = RepState.waiting;
          _lastRepTime = null;
        }
        break;
        
      case RepState.completed:
        _repState = RepState.waiting;
        break;
    }
  }
  
  /// Get current rep count
  int get repCount => _repCount;
  
  /// Get current rep state
  RepState get repState => _repState;
  
  /// Get current form issues
  List<String> get formIssues => _currentIssues;
}
