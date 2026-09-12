import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter_tts/flutter_tts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../../../../core/providers.dart';

class GPSCoordinatePoint {
  final double lat;
  final double lng;
  final double speed; // m/s
  final double accuracy;
  final DateTime timestamp;

  GPSCoordinatePoint({
    required this.lat,
    required this.lng,
    required this.speed,
    required this.accuracy,
    required this.timestamp,
  });
}

class GPSWalkingPage extends ConsumerStatefulWidget {
  const GPSWalkingPage({super.key});

  @override
  ConsumerState<GPSWalkingPage> createState() => _GPSWalkingPageState();
}

class _GPSWalkingPageState extends ConsumerState<GPSWalkingPage>
    with SingleTickerProviderStateMixin {
  // Tracking state
  bool _isStarted = false;
  bool _isPaused = false;
  bool _isCompleted = false;

  // Mode: 'outdoor' (GPS + Sensor Fusion) or 'indoor' (Pedometer only)
  String _trackMode = 'outdoor';
  int _targetSteps = 3000;

  // Metrics
  int _steps = 0;
  double _distanceMeters = 0.0;
  int _elapsedSeconds = 0;
  double _currentSpeedKmh = 0.0;
  double _avgSpeedKmh = 0.0;
  String _currentPace = '00:00';
  int _calories = 0;
  int _cadence = 0;
  int _heartRate = 80;

  // GPS & Anti-Cheat AI State
  String _gpsStatus = 'searching'; // 'good', 'medium', 'poor', 'searching'
  double _gpsAccuracy = 0.0;
  String? _antiCheatWarning;
  String _movementState = 'stationary'; // 'walking', 'stationary', 'fake_shaking', 'vehicle'
  bool _voiceGuidance = true;
  bool _sensorsReady = false;

  // Diagnostic & Sensor Fusion Buffers
  final List<GPSCoordinatePoint> _routePoints = [];
  final List<DateTime> _recentStepsWindow = [];
  final List<Map<String, dynamic>> _recentGpsMovements = []; // {timestamp, distance}
  GPSCoordinatePoint? _lastAcceptedGpsPoint;
  int _consecutiveStationaryDrifts = 0;

  // Step detection variables
  double _lastAccelMagnitude = 9.8;
  String _accelState = 'falling';
  DateTime _lastStepTimestamp = DateTime.now();
  final List<DateTime> _stepCandidateBuffer = [];
  bool _isStepTrainConfirmed = false;

  // Streams & Timers
  StreamSubscription<Position>? _positionStreamSub;
  StreamSubscription<AccelerometerEvent>? _accelStreamSub;
  Timer? _metricsTimer;
  late AnimationController _pulseController;
  final FlutterTts _flutterTts = FlutterTts();

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();

    _initTts();
    _checkAndRequestPermissions();
  }

  void _initTts() async {
    try {
      await _flutterTts.setLanguage('vi-VN');
      await _flutterTts.setSpeechRate(0.9);
      await _flutterTts.setVolume(1.0);
    } catch (_) {}
  }

  void _speak(String text) async {
    if (!_voiceGuidance) return;
    try {
      await _flutterTts.stop();
      await _flutterTts.speak(text);
    } catch (_) {}
  }

  Future<void> _checkAndRequestPermissions() async {
    await [
      Permission.location,
      Permission.locationWhenInUse,
      Permission.activityRecognition,
      Permission.sensors,
    ].request();
  }

  @override
  void dispose() {
    _stopSensorStreams();
    _metricsTimer?.cancel();
    _pulseController.dispose();
    _flutterTts.stop();
    super.dispose();
  }

  void _stopSensorStreams() {
    _positionStreamSub?.cancel();
    _positionStreamSub = null;
    _accelStreamSub?.cancel();
    _accelStreamSub = null;
  }

  // -------------------------------------------------------------
  // 1. Haversine Distance Calculation (Meter precision)
  // -------------------------------------------------------------
  double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    const double r = 6371000; // Earth radius in meters
    final double phi1 = (lat1 * pi) / 180;
    final double phi2 = (lat2 * pi) / 180;
    final double deltaPhi = ((lat2 - lat1) * pi) / 180;
    final double deltaLambda = ((lon2 - lon1) * pi) / 180;

    final double a = sin(deltaPhi / 2) * sin(deltaPhi / 2) +
        cos(phi1) * cos(phi2) * sin(deltaLambda / 2) * sin(deltaLambda / 2);
    final double c = 2 * atan2(sqrt(a), sqrt(1 - a));

    return r * c;
  }

  // -------------------------------------------------------------
  // 2. Real Hardware Accelerometer Step Detection & Anti-Cheat
  // -------------------------------------------------------------
  void _startAccelerometerTracking() {
    _accelStreamSub?.cancel();
    _accelStreamSub = accelerometerEventStream().listen((AccelerometerEvent event) {
      if (!_isStarted || _isPaused || _isCompleted) return;

      final double x = event.x;
      final double y = event.y;
      final double z = event.z;
      final double magnitude = sqrt(x * x + y * y + z * z);
      final DateTime now = DateTime.now();

      const double peakThreshold = 11.5;
      const double valleyThreshold = 8.5;
      const int minStepIntervalMs = 280; // max ~214 SPM (sprint)
      const int maxStepIntervalMs = 1400; // min ~42 SPM (slow walk)

      // Clean rolling 8-second window
      _recentStepsWindow.removeWhere((t) => now.difference(t).inMilliseconds > 8000);
      _recentGpsMovements.removeWhere((g) => now.difference(g['timestamp'] as DateTime).inMilliseconds > 8000);

      if (_accelState == 'falling' && magnitude > peakThreshold) {
        _accelState = 'rising';
      } else if (_accelState == 'rising' && magnitude < valleyThreshold) {
        _accelState = 'falling';
        final int intervalMs = now.difference(_lastStepTimestamp).inMilliseconds;

        if (intervalMs >= minStepIntervalMs) {
          _lastStepTimestamp = now;

          // Reset step candidate buffer if paused too long (> 1.8s)
          if (intervalMs > 1800) {
            _stepCandidateBuffer.clear();
            _isStepTrainConfirmed = false;
          }

          _stepCandidateBuffer.add(now);
          _recentStepsWindow.add(now);

          // ── Anti-Cheat Layer 1: High Frequency Hand Shaking (> 215 SPM) ──
          final int stepsIn8s = _recentStepsWindow.length;
          final double cadenceSpm = (stepsIn8s / 8) * 60;
          if (cadenceSpm > 215) {
            setState(() {
              _movementState = 'fake_shaking';
              _antiCheatWarning = '🚫 PHÁT HIỆN LẮC TAY BẤT THƯỜNG (>215 SPM): Tạm dừng tích lũy bước chân!';
            });
            return; // REJECT FAKE SHAKE STEP
          }

          // ── Anti-Cheat Layer 2: Sensor Fusion in Outdoor Mode (Standing Still & Shaking Phone) ──
          if (_trackMode == 'outdoor' && _gpsStatus != 'poor' && _lastAcceptedGpsPoint != null) {
            final double totalGpsDistIn8s = _recentGpsMovements.fold<double>(
              0.0,
              (sum, item) => sum + (item['distance'] as double),
            );

            // User produces >= 5 steps in 8s but GPS displacement is < 2.5m and GPS speed is negligible
            if (stepsIn8s >= 5 && totalGpsDistIn8s < 2.5 && _currentSpeedKmh < 0.9) {
              setState(() {
                _movementState = 'fake_shaking';
                _antiCheatWarning = '🚫 PHÁT HIỆN LẮC TAY TẠI CHỖ: Người dùng đang đứng yên (GPS không di chuyển). Đã đóng băng không cộng bước!';
              });
              return; // REJECT STATIONARY SHAKE STEP
            }
          }

          // ── Biomechanical Step Train Confirmation (Require 3 consistent rhythmic steps) ──
          if (!_isStepTrainConfirmed) {
            if (_stepCandidateBuffer.length >= 3) {
              final List<int> intervals = [];
              for (int i = 1; i < _stepCandidateBuffer.length; i++) {
                intervals.add(_stepCandidateBuffer[i].difference(_stepCandidateBuffer[i - 1]).inMilliseconds);
              }
              final double avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
              final bool isRhythmic = intervals.every((intv) => (intv - avgInterval).abs() < avgInterval * 0.5);

              if (isRhythmic && avgInterval >= minStepIntervalMs && avgInterval <= maxStepIntervalMs) {
                _isStepTrainConfirmed = true;
                final int bufferedCount = _stepCandidateBuffer.length;
                setState(() {
                  _movementState = 'walking';
                  _antiCheatWarning = null;
                  _steps += bufferedCount;
                  if (_trackMode == 'indoor') {
                    _distanceMeters += bufferedCount * 0.74;
                  }
                });
              }
            }
            return;
          }

          // ── Real Continuous Step Verified ──
          setState(() {
            _movementState = 'walking';
            _antiCheatWarning = null;
            _steps += 1;
            if (_trackMode == 'indoor') {
              _distanceMeters += 0.74;
            }
          });
        }
      }

      _lastAccelMagnitude = magnitude;
    });
  }

  // -------------------------------------------------------------
  // 3. Real Hardware Geolocation Tracking & GPS Jitter Suppressor
  // -------------------------------------------------------------
  void _startGPSLocationTracking() async {
    final bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      setState(() {
        _gpsStatus = 'poor';
        _antiCheatWarning = 'Vui lòng bật định vị GPS trên thiết bị để theo dõi ngoài trời.';
      });
      return;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        setState(() {
          _gpsStatus = 'poor';
          _antiCheatWarning = 'Quyền GPS bị từ chối.';
        });
        return;
      }
    }

    const LocationSettings locationSettings = LocationSettings(
      accuracy: LocationAccuracy.bestForNavigation,
      distanceFilter: 2, // notify every 2 meters
    );

    _positionStreamSub?.cancel();
    _positionStreamSub = Geolocator.getPositionStream(locationSettings: locationSettings).listen((Position position) {
      if (!_isStarted || _isPaused || _isCompleted) return;

      final double latitude = position.latitude;
      final double longitude = position.longitude;
      final double accuracy = position.accuracy;
      final double speed = position.speed; // m/s
      final DateTime now = position.timestamp;

      setState(() {
        _gpsAccuracy = accuracy;
        if (accuracy <= 15) {
          _gpsStatus = 'good';
        } else if (accuracy <= 32) {
          _gpsStatus = 'medium';
        } else {
          _gpsStatus = 'poor';
        }
      });

      // Discard inaccurate GPS readings (accuracy > 38m)
      if (accuracy > 38) return;

      if (_lastAcceptedGpsPoint == null || _routePoints.isEmpty) {
        final firstPoint = GPSCoordinatePoint(
          lat: latitude,
          lng: longitude,
          speed: speed >= 0 ? speed : 0,
          accuracy: accuracy,
          timestamp: now,
        );
        _lastAcceptedGpsPoint = firstPoint;
        setState(() {
          _routePoints.add(firstPoint);
        });
        return;
      }

      final last = _lastAcceptedGpsPoint!;
      final double distDelta = _calculateDistance(last.lat, last.lng, latitude, longitude);
      final double timeDelta = now.difference(last.timestamp).inMilliseconds / 1000.0;

      if (timeDelta <= 0.2) return; // ignore redundant duplicate ticks

      double speedKmh = 0.0;
      if (speed >= 0) {
        speedKmh = speed * 3.6;
      } else {
        speedKmh = (distDelta / timeDelta) * 3.6;
      }

      // ── GPS Jitter & Stationary Deadzone Filter ──
      // Dynamic minimum physical movement threshold proportional to GPS accuracy
      final double minPhysicalMoveThreshold = max(3.8, min(10.0, accuracy * 0.42));

      if (distDelta < minPhysicalMoveThreshold || speedKmh < 1.0) {
        // Confirmed stationary jitter: DO NOT ADD DISTANCE!
        _consecutiveStationaryDrifts++;
        setState(() {
          _currentSpeedKmh = 0.0;
          if (_recentStepsWindow.isEmpty) {
            _movementState = 'stationary';
            if (_consecutiveStationaryDrifts >= 4) {
              _antiCheatWarning = null;
            }
          }
        });
        return; // Return without accumulating fake distance!
      }

      // ── Anti-Cheat: High Speed Vehicle Filter (> 24 km/h) ──
      if (speedKmh > 24.0) {
        setState(() {
          _movementState = 'vehicle';
          _antiCheatWarning = '⚠️ TỐC ĐỘ QUÁ NHANH (>24km/h): Đã tạm dừng tính quãng đường do nghi vấn đi xe máy/ô tô!';
        });
        return; // REJECT VEHICLE
      }

      // ── Anti-Cheat: Passive Transport (GPS moves fast but ZERO steps over 12s) ──
      final int stepsInLast10s = _recentStepsWindow.length;
      if (speedKmh > 11.0 && stepsInLast10s == 0 && timeDelta > 3) {
        setState(() {
          _movementState = 'vehicle';
          _antiCheatWarning = '🚗 PHÁT HIỆN ĐANG ĐI XE: Toạ độ GPS di chuyển nhưng không có bước chân người!';
        });
        return; // REJECT PASSIVE TRANSPORT
      }

      // ── Valid Physical Walking Movement Detected! ──
      _consecutiveStationaryDrifts = 0;
      final double validSpeedKmh = min(20.0, max(1.2, double.parse(speedKmh.toStringAsFixed(1))));

      _recentGpsMovements.add({'timestamp': now, 'distance': distDelta});

      final validPoint = GPSCoordinatePoint(
        lat: latitude,
        lng: longitude,
        speed: validSpeedKmh / 3.6,
        accuracy: accuracy,
        timestamp: now,
      );
      _lastAcceptedGpsPoint = validPoint;

      setState(() {
        _movementState = 'walking';
        _antiCheatWarning = null;
        _currentSpeedKmh = validSpeedKmh;
        _routePoints.add(validPoint);

        if (_trackMode == 'outdoor') {
          _distanceMeters += distDelta;
        }
      });
    });
  }

  // -------------------------------------------------------------
  // 4. Start / Pause / Resume / Finish Controls
  // -------------------------------------------------------------
  void _startTracking() {
    setState(() {
      _isStarted = true;
      _isPaused = false;
      _isCompleted = false;
      _antiCheatWarning = null;
      _movementState = 'stationary';
      _recentStepsWindow.clear();
      _recentGpsMovements.clear();
      _stepCandidateBuffer.clear();
      _isStepTrainConfirmed = false;
      _lastAcceptedGpsPoint = null;
      _consecutiveStationaryDrifts = 0;
      _sensorsReady = true;
    });

    _speak('Bắt đầu theo dõi buổi đi bộ. Cảm biến và định vị GPS thực tế đã kích hoạt!');
    _startAccelerometerTracking();
    if (_trackMode == 'outdoor') {
      _startGPSLocationTracking();
    }

    _startMetricsTimer();
  }

  void _startMetricsTimer() {
    _metricsTimer?.cancel();
    _metricsTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!_isStarted || _isPaused || _isCompleted) return;

      setState(() {
        _elapsedSeconds++;

        // ── Calculate Pace (min/km) ──
        if (_distanceMeters > 30) {
          final double totalKm = _distanceMeters / 1000;
          final double paceMinutes = (_elapsedSeconds / 60) / totalKm;
          final int pMin = paceMinutes.floor();
          final int pSec = ((paceMinutes - pMin) * 60).floor();
          if (pMin < 60) {
            _currentPace = '${pMin.toString().padLeft(2, '0')}\'${pSec.toString().padLeft(2, '0')}"';
          } else {
            _currentPace = '>60\'00"';
          }

          _avgSpeedKmh = double.parse((totalKm / (_elapsedSeconds / 3600)).toStringAsFixed(1));
        }

        // ── Calories: ~0.043 kcal per step + MET factor ──
        _calories = (_steps * 0.043 + (_distanceMeters / 1000) * 22).round();

        // ── Cadence (SPM) ──
        if (_elapsedSeconds > 4) {
          _cadence = ((_steps / _elapsedSeconds) * 60).round();
        }

        // ── Dynamic Heart Rate ──
        _heartRate = min(155, max(76, (78 + _currentSpeedKmh * 8.2).round()));
      });
    });
  }

  void _pauseTracking() {
    setState(() {
      _isPaused = true;
    });
    _speak('Đã tạm dừng');
  }

  void _resumeTracking() {
    setState(() {
      _isPaused = false;
    });
    _speak('Tiếp tục luyện tập');
  }

  void _finishTracking() {
    setState(() {
      _isStarted = false;
      _isPaused = false;
      _isCompleted = true;
    });

    _stopSensorStreams();
    _metricsTimer?.cancel();

    // Update Riverpod Providers & Sync to All Features
    final finalSteps = max(_steps, (_distanceMeters / 0.74).round());
    final durationMin = max(1, (_elapsedSeconds / 60).ceil());
    final cal = _calories > 0 ? _calories : (finalSteps * 0.04).round();

    WorkoutSyncService.syncWorkout(
      ref: ref,
      exerciseType: 'walking',
      totalReps: finalSteps,
      validReps: finalSteps,
      durationMinutes: durationMin,
      caloriesBurned: cal,
      accuracy: 100.0,
      formIssues: const [],
    );

    _speak('Tuyệt vời! Bạn đã hoàn thành $finalSteps bước chân.');
    _showCompletionDialog();
  }

  String _formatTime(int secs) {
    final int h = secs ~/ 3600;
    final int m = (secs % 3600) ~/ 60;
    final int s = secs % 60;
    if (h > 0) {
      return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
    }
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  void _showCompletionDialog() {
    final int xpGained = max(50, (_steps / 10).round());
    final int coinsGained = max(20, (_steps / 25).round());

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: Color(0xFF2ED573), width: 1.5),
        ),
        title: Column(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2ED573), Color(0xFF7BED9F)],
                ),
                borderRadius: BorderRadius.circular(18),
              ),
              child: const Icon(Icons.emoji_events, size: 36, color: Color(0xFF0F0F23)),
            ),
            const SizedBox(height: 12),
            const Text(
              '🎉 Hoàn Thành Xuất Sắc!',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 20,
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Buổi tập đã được xác minh qua Cảm biến thực tế & Bộ lọc chống trôi GPS.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _StatCol(label: 'Tổng bước chân', value: '$_steps', color: const Color(0xFF2ED573)),
                      _StatCol(label: 'Quãng đường', value: '${(_distanceMeters / 1000).toStringAsFixed(2)} km', color: AppColors.textPrimary),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _StatCol(label: 'Thời gian', value: _formatTime(_elapsedSeconds), color: AppColors.textPrimary),
                      _StatCol(label: 'Calo đốt cháy', value: '$_calories kcal', color: const Color(0xFFFF4757)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.primary.withValues(alpha: 0.15),
                    AppColors.secondary.withValues(alpha: 0.15),
                  ],
                ),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.4)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Text('⚡ +$xpGained XP', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 15)),
                  Container(width: 1, height: 20, color: AppColors.border),
                  Text('🪙 +$coinsGained Coins', style: const TextStyle(color: AppColors.accent, fontWeight: FontWeight.bold, fontSize: 15)),
                ],
              ),
            ),
          ],
        ),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2ED573),
                foregroundColor: const Color(0xFF0F0F23),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: () {
                Navigator.of(ctx).pop();
                context.go('/exercise');
              },
              child: const Text('Xác nhận & Về màn hình tập', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final double progressPercent = min(1.0, _steps / (_targetSteps > 0 ? _targetSteps : 1));

    return Scaffold(
      backgroundColor: const Color(0xFF0B0D14),
      appBar: AppBar(
        backgroundColor: AppColors.surface.withValues(alpha: 0.95),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () {
            if (_isStarted && !_isCompleted) {
              showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  backgroundColor: AppColors.surface,
                  title: const Text('Dừng buổi tập?'),
                  content: const Text('Bạn có chắc chắn muốn thoát khỏi buổi theo dõi GPS này?'),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
                      onPressed: () {
                        Navigator.pop(ctx);
                        _finishTracking();
                        context.go('/exercise');
                      },
                      child: const Text('Dừng & Lưu'),
                    ),
                  ],
                ),
              );
            } else {
              context.go('/exercise');
            }
          },
        ),
        title: Column(
          children: [
            const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.directions_walk, color: Color(0xFF2ED573), size: 20),
                SizedBox(width: 6),
                Text(
                  'GPS & Bước Chân Live',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
              ],
            ),
            Text(
              _trackMode == 'outdoor' ? '🛰️ Khử Nhiễu GPS + Cảm Biến Gia Tốc' : '👟 Cảm biến bước chân Pedometer',
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
            ),
          ],
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(_voiceGuidance ? Icons.volume_up : Icons.volume_off, color: _voiceGuidance ? const Color(0xFF2ED573) : AppColors.textMuted),
            onPressed: () {
              setState(() {
                _voiceGuidance = !_voiceGuidance;
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(_voiceGuidance ? 'Giọng nói hướng dẫn đã bật' : 'Giọng nói hướng dẫn đã tắt')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Status Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.surfaceLight),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _gpsStatus == 'good'
                              ? const Color(0xFF2ED573)
                              : _gpsStatus == 'medium'
                              ? const Color(0xFFFFA502)
                              : AppColors.error,
                          boxShadow: [
                            BoxShadow(
                              color: _gpsStatus == 'good' ? const Color(0xFF2ED573) : const Color(0xFFFFA502),
                              blurRadius: 6,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _gpsStatus == 'good'
                            ? 'GPS Độ chính xác cao (±${_gpsAccuracy.toStringAsFixed(0)}m)'
                            : _gpsStatus == 'medium'
                            ? 'GPS Trung bình (Khử nhiễu ON)'
                            : 'Đang kết nối GPS vệ tinh...',
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFF2ED573).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.shield, color: _sensorsReady ? const Color(0xFF2ED573) : AppColors.textMuted, size: 12),
                        const SizedBox(width: 4),
                        const Text('Anti-Cheat AI', style: TextStyle(color: Color(0xFF2ED573), fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),

            // Real-Time Movement State Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: _movementState == 'walking'
                    ? const Color(0xFF2ED573).withValues(alpha: 0.12)
                    : _movementState == 'fake_shaking'
                    ? AppColors.error.withValues(alpha: 0.2)
                    : _movementState == 'vehicle'
                    ? const Color(0xFFFFA502).withValues(alpha: 0.2)
                    : const Color(0xFFF7C948).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: _movementState == 'walking'
                      ? const Color(0xFF2ED573).withValues(alpha: 0.4)
                      : _movementState == 'fake_shaking'
                      ? AppColors.error
                      : _movementState == 'vehicle'
                      ? const Color(0xFFFFA502)
                      : const Color(0xFFF7C948).withValues(alpha: 0.4),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _movementState == 'walking'
                              ? const Color(0xFF2ED573)
                              : _movementState == 'fake_shaking'
                              ? AppColors.error
                              : _movementState == 'vehicle'
                              ? const Color(0xFFFFA502)
                              : const Color(0xFFF7C948),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _movementState == 'walking'
                            ? '🟢 Đang di chuyển thực tế (Đang tính điểm)'
                            : _movementState == 'fake_shaking'
                            ? '🚫 Lắc tay tại chỗ bị chặn (Không tính)'
                            : _movementState == 'vehicle'
                            ? '🚗 Phát hiện đi xe (Tạm ngưng tính km)'
                            : '⏸️ Đang đứng yên (Chống trôi GPS - Dừng cộng)',
                        style: TextStyle(
                          color: _movementState == 'walking'
                              ? const Color(0xFF2ED573)
                              : _movementState == 'fake_shaking'
                              ? AppColors.error
                              : _movementState == 'vehicle'
                              ? const Color(0xFFFFA502)
                              : const Color(0xFFF7C948),
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    _movementState == 'walking' ? 'Ghi nhận' : 'Đóng băng',
                    style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),

            // Anti-Cheat Alert
            if (_antiCheatWarning != null)
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.15),
                  border: Border.all(color: AppColors.error),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning, color: AppColors.error, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _antiCheatWarning!,
                        style: const TextStyle(color: AppColors.error, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),

            // Anti-Cheat Diagnostics Hub
            Container(
              padding: const EdgeInsets.all(10),
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.03),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _DiagnosticBadge(label: 'Khử Trôi GPS', desc: 'Chống tăng khi đứng yên'),
                  _DiagnosticBadge(label: 'Chống Lắc Tay', desc: 'Nhịp bước sinh học'),
                  _DiagnosticBadge(label: 'Sensor Fusion', desc: 'GPS + Gia tốc thực tế'),
                ],
              ),
            ),

            // Radar Map Visualizer
            Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFF0E111A),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.surfaceLight),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: CustomPaint(
                  painter: RadarRoutePainter(
                    route: _routePoints,
                    isStarted: _isStarted,
                    pulseValue: _pulseController.value,
                  ),
                  child: Stack(
                    children: [
                      Positioned(
                        top: 10,
                        left: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.surface.withValues(alpha: 0.85),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: const Color(0xFF2ED573).withValues(alpha: 0.4)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.explore, color: Color(0xFF2ED573), size: 14),
                              const SizedBox(width: 4),
                              Text(
                                _isStarted ? (_isPaused ? 'TẠM DỪNG' : 'LIVE GPS TRACK') : 'SẴN SÀNG',
                                style: const TextStyle(color: Color(0xFF2ED573), fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Positioned(
                        top: 10,
                        right: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.surface.withValues(alpha: 0.85),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '⚡ ${_currentSpeedKmh.toStringAsFixed(1)} km/h',
                            style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Main Step Counter Card
            AppCard(
              child: Column(
                children: [
                  const Text(
                    'SỐ BƯỚC CHÂN THỰC TẾ (SENSOR LIVE)',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textMuted, letterSpacing: 1),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '$_steps',
                    style: const TextStyle(
                      fontSize: 52,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF2ED573),
                      height: 1.1,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Mục tiêu: $_targetSteps bước', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                      Text('${(progressPercent * 100).round()}%', style: const TextStyle(color: Color(0xFF2ED573), fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: progressPercent,
                      minHeight: 8,
                      backgroundColor: AppColors.surfaceLight,
                      valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF2ED573)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: AppColors.surfaceLight),
                  const SizedBox(height: 8),

                  // Metrics Grid
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _MetricItem(label: 'Quãng đường', value: (_distanceMeters / 1000).toStringAsFixed(2), unit: 'km', color: AppColors.primary),
                      _MetricItem(label: 'Thời gian', value: _formatTime(_elapsedSeconds), unit: 'phút', color: const Color(0xFF70A1FF)),
                      _MetricItem(label: 'Calo', value: '$_calories', unit: 'kcal', color: const Color(0xFFFF4757)),
                      _MetricItem(label: 'Pace', value: _currentPace, unit: '/km', color: const Color(0xFFFFA502)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Text('Nhịp: $_cadence SPM', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      Text('TB: $_avgSpeedKmh km/h', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      Text('Tim: $_heartRate BPM', style: const TextStyle(fontSize: 11, color: Color(0xFFFF4757))),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Controls
            if (!_isStarted && !_isCompleted)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2ED573),
                    foregroundColor: const Color(0xFF0F0F23),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  icon: const Icon(Icons.play_arrow, size: 28),
                  label: const Text(
                    'BẮT ĐẦU ĐI BỘ (GPS & SENSOR LIVE)',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                  ),
                  onPressed: _startTracking,
                ),
              ),

            if (_isStarted && !_isCompleted)
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _isPaused ? const Color(0xFF2ED573) : const Color(0xFFFFA502),
                        foregroundColor: const Color(0xFF0F0F23),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      icon: Icon(_isPaused ? Icons.play_arrow : Icons.pause),
                      label: Text(_isPaused ? 'TIẾP TỤC' : 'TẠM DỪNG', style: const TextStyle(fontWeight: FontWeight.bold)),
                      onPressed: _isPaused ? _resumeTracking : _pauseTracking,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFF4757),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      icon: const Icon(Icons.stop),
                      label: const Text('KẾT THÚC', style: const TextStyle(fontWeight: FontWeight.bold)),
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            backgroundColor: AppColors.surface,
                            title: const Text('Kết thúc buổi tập?'),
                            content: const Text('Bạn có muốn kết thúc và nhận thưởng cho buổi tập này?'),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2ED573)),
                                onPressed: () {
                                  Navigator.pop(ctx);
                                  _finishTracking();
                                },
                                child: const Text('Xác nhận'),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

class _DiagnosticBadge extends StatelessWidget {
  final String label;
  final String desc;

  const _DiagnosticBadge({required this.label, required this.desc});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, color: Color(0xFF2ED573), size: 11),
            const SizedBox(width: 3),
            Text(label, style: const TextStyle(color: Color(0xFF2ED573), fontWeight: FontWeight.bold, fontSize: 10)),
          ],
        ),
        const SizedBox(height: 2),
        Text(desc, style: const TextStyle(color: AppColors.textMuted, fontSize: 8)),
      ],
    );
  }
}

class _StatCol extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatCol({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
        const SizedBox(height: 2),
        Text(value, style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }
}

class _MetricItem extends StatelessWidget {
  final String label;
  final String value;
  final String unit;
  final Color color;

  const _MetricItem({
    required this.label,
    required this.value,
    required this.unit,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
        const SizedBox(height: 3),
        Text(value, style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: color)),
        Text(unit, style: const TextStyle(fontSize: 9, color: AppColors.textMuted)),
      ],
    );
  }
}

class RadarRoutePainter extends CustomPainter {
  final List<GPSCoordinatePoint> route;
  final bool isStarted;
  final double pulseValue;

  RadarRoutePainter({
    required this.route,
    required this.isStarted,
    required this.pulseValue,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final bgPaint = Paint()..color = const Color(0xFF0E111A);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    final gridPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.04)
      ..strokeWidth = 1;

    for (double x = 0; x < size.width; x += 24) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += 24) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    if (route.isEmpty) {
      final center = Offset(size.width / 2, size.height / 2);
      final radarPaint = Paint()
        ..color = const Color(0xFF2ED573).withValues(alpha: 0.3)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2;

      canvas.drawCircle(center, 30 + pulseValue * 20, radarPaint);
      canvas.drawCircle(center, 6, Paint()..color = const Color(0xFF2ED573));
      return;
    }

    double minLat = double.infinity, maxLat = -double.infinity;
    double minLng = double.infinity, maxLng = -double.infinity;

    for (final p in route) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    }

    final double latSpan = max(0.0004, maxLat - minLat);
    final double lngSpan = max(0.0004, maxLng - minLng);
    const double padding = 30.0;

    double toScreenX(double lng) => padding + ((lng - minLng) / lngSpan) * (size.width - padding * 2);
    double toScreenY(double lat) => size.height - (padding + ((lat - minLat) / latSpan) * (size.height - padding * 2));

    // Draw Route Path
    final pathPaint = Paint()
      ..color = const Color(0xFF2ED573)
      ..strokeWidth = 3.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final path = Path();
    for (int i = 0; i < route.length; i++) {
      final sx = toScreenX(route[i].lng);
      final sy = toScreenY(route[i].lat);
      if (i == 0) {
        path.moveTo(sx, sy);
      } else {
        path.lineTo(sx, sy);
      }
    }
    canvas.drawPath(path, pathPaint);

    // Draw Start Pin
    if (route.isNotEmpty) {
      final startPt = Offset(toScreenX(route.first.lng), toScreenY(route.first.lat));
      canvas.drawCircle(startPt, 6, Paint()..color = const Color(0xFFFF4757));
    }

    // Draw Current Position Pin with Pulsing Aura
    if (route.isNotEmpty) {
      final curPt = Offset(toScreenX(route.last.lng), toScreenY(route.last.lat));
      final auraPaint = Paint()
        ..color = const Color(0xFF2ED573).withValues(alpha: 1 - pulseValue)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(curPt, 8 + pulseValue * 14, auraPaint);
      canvas.drawCircle(curPt, 6, Paint()..color = const Color(0xFF2ED573));
      canvas.drawCircle(curPt, 6, Paint()..color = Colors.white..style = PaintingStyle.stroke..strokeWidth = 2);
    }
  }

  @override
  bool shouldRepaint(covariant RadarRoutePainter oldDelegate) => true;
}
