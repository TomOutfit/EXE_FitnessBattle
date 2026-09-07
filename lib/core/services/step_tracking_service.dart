import 'dart:async';
import 'package:pedometer/pedometer.dart';
import 'package:flutter/foundation.dart';

// Re-export for convenience
export 'package:pedometer/pedometer.dart' show StepCount, PedestrianStatus;

/// Step tracking state
class StepState {
  final int totalSteps;
  final int todaySteps;
  final int sessionSteps;
  final DateTime? lastSync;
  final bool isTracking;
  final String? pedestrianStatus;
  final String? error;
  
  StepState({
    this.totalSteps = 0,
    this.todaySteps = 0,
    this.sessionSteps = 0,
    this.lastSync,
    this.isTracking = false,
    this.pedestrianStatus,
    this.error,
  });
  
  StepState copyWith({
    int? totalSteps,
    int? todaySteps,
    int? sessionSteps,
    DateTime? lastSync,
    bool? isTracking,
    String? pedestrianStatus,
    String? error,
  }) {
    return StepState(
      totalSteps: totalSteps ?? this.totalSteps,
      todaySteps: todaySteps ?? this.todaySteps,
      sessionSteps: sessionSteps ?? this.sessionSteps,
      lastSync: lastSync ?? this.lastSync,
      isTracking: isTracking ?? this.isTracking,
      pedestrianStatus: pedestrianStatus ?? this.pedestrianStatus,
      error: error,
    );
  }
  
  /// Calculate points earned (10 steps = 1 point)
  int get pointsEarned => todaySteps ~/ 10;
  
  /// Calculate distance in km (average step = 0.75m)
  double get distanceKm => (todaySteps * 0.75) / 1000;
  
  /// Calculate distance bonus points (100m = 1 point)
  int get distanceBonus => (distanceKm * 10).floor();
  
  /// Total points for today
  int get totalPoints => pointsEarned + distanceBonus;
}

/// Service for real-time step tracking using device pedometer sensor
class StepTrackingService {
  StreamSubscription<StepCount>? _stepCountSubscription;
  StreamSubscription<PedestrianStatus>? _pedestrianStatusSubscription;
  
  int _baseStepCount = 0;
  int _sessionStartSteps = 0;
  DateTime? _sessionStartTime;
  
  // Callbacks
  Function(StepState)? onStepUpdate;
  
  /// Check and request permissions
  Future<bool> requestPermissions() async {
    try {
      // Just try to listen once to check if sensor is available
      await Pedometer.stepCountStream.first.timeout(
        const Duration(seconds: 3),
      );
      return true;
    } catch (e) {
      debugPrint('Pedometer not available: $e');
      return false;
    }
  }
  
  /// Start step tracking with real sensor
  Future<bool> startTracking() async {
    try {
      // Reset session
      _sessionStartSteps = 0;
      _sessionStartTime = DateTime.now();
      
      // Listen to step count stream
      _stepCountSubscription = Pedometer.stepCountStream.listen(
        _onStepCount,
        onError: _onStepCountError,
      );
      
      // Listen to pedestrian status stream
      _pedestrianStatusSubscription = Pedometer.pedestrianStatusStream.listen(
        _onPedestrianStatusChanged,
        onError: _onPedestrianStatusError,
      );
      
      onStepUpdate?.call(StepState(isTracking: true, totalSteps: 0, todaySteps: 0));
      return true;
      
    } catch (e) {
      debugPrint('Error starting step tracking: $e');
      onStepUpdate?.call(StepState(
        isTracking: false,
        error: 'Không thể khởi động cảm biến bước chân: $e',
      ));
      return false;
    }
  }
  
  /// Handle step count updates
  void _onStepCount(StepCount event) {
    // Set base count on first reading
    if (_baseStepCount == 0) {
      _baseStepCount = event.steps;
      _sessionStartTime = DateTime.now();
    }
    
    final currentSteps = event.steps;
    final sessionSteps = currentSteps - _baseStepCount;
    
    // Calculate today's steps (reset at midnight)
    int todaySteps = sessionSteps;
    if (_sessionStartTime != null && !_isSameDay(_sessionStartTime!, DateTime.now())) {
      // New day, reset session
      _baseStepCount = currentSteps;
      _sessionStartTime = DateTime.now();
      todaySteps = 0;
    }
    
    onStepUpdate?.call(StepState(
      totalSteps: currentSteps,
      todaySteps: todaySteps > 0 ? todaySteps : 0,
      sessionSteps: sessionSteps > 0 ? sessionSteps : 0,
      lastSync: DateTime.now(),
      isTracking: true,
    ));
  }
  
  /// Handle step count errors
  void _onStepCountError(dynamic error) {
    debugPrint('Step count error: $error');
    onStepUpdate?.call(StepState(
      isTracking: false,
      error: 'Lỗi cảm biến bước chân: $error',
    ));
  }
  
  /// Handle pedestrian status changes
  void _onPedestrianStatusChanged(PedestrianStatus event) {
    debugPrint('Pedestrian status: ${event.status}');
    // Status is 'walking', 'stopped', or 'unknown'
  }
  
  /// Handle pedestrian status errors
  void _onPedestrianStatusError(dynamic error) {
    debugPrint('Pedestrian status error: $error');
    // This is usually not critical
  }
  
  /// Check if two dates are the same day
  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }
  
  /// Stop step tracking
  void stopTracking() {
    _stepCountSubscription?.cancel();
    _pedestrianStatusSubscription?.cancel();
    _stepCountSubscription = null;
    _pedestrianStatusSubscription = null;
    onStepUpdate?.call(StepState(isTracking: false));
  }
  
  /// Reset step count (e.g., at midnight)
  void resetDailySteps() {
    _sessionStartSteps = _baseStepCount;
    _sessionStartTime = DateTime.now();
    onStepUpdate?.call(StepState(
      totalSteps: _baseStepCount,
      todaySteps: 0,
      sessionSteps: 0,
      lastSync: DateTime.now(),
      isTracking: true,
    ));
  }
  
  /// Get current state
  StepState getCurrentState() {
    return StepState(
      totalSteps: 0,
      todaySteps: 0,
      isTracking: false,
    );
  }
  
  /// Dispose resources
  void dispose() {
    stopTracking();
  }
}

/// Points calculation helper
class StepPointsCalculator {
  /// Calculate points from steps
  static int calculatePoints(int steps) {
    // Base: 10 steps = 1 point
    final basePoints = steps ~/ 10;
    
    // Distance bonus: 100m = 1 point (assuming 0.75m per step)
    final distanceMeters = steps * 0.75;
    final distanceBonus = distanceMeters ~/ 100;
    
    return basePoints + distanceBonus;
  }
  
  /// Calculate daily goal progress
  static double calculateProgress(int currentSteps, int targetSteps) {
    if (targetSteps <= 0) return 0;
    return (currentSteps / targetSteps).clamp(0.0, 1.0);
  }
  
  /// Check if daily goal is completed
  static bool isGoalCompleted(int currentSteps, int targetSteps) {
    return currentSteps >= targetSteps;
  }
  
  /// Get bonus for completing daily goal
  static int getCompletionBonus() {
    return 30; // 30 coins bonus
  }
}
