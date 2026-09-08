import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../../../../core/mock_data_exercise.dart';

class GPSCoordinatePoint {
  final double lat;
  final double lng;
  final double speed;
  final DateTime timestamp;

  GPSCoordinatePoint({
    required this.lat,
    required this.lng,
    required this.speed,
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
  bool _isStarted = false;
  bool _isPaused = false;
  bool _isCompleted = false;

  String _trackMode = 'outdoor'; // 'outdoor' or 'indoor'
  int _targetSteps = 3000;

  int _steps = 0;
  double _distanceMeters = 0.0;
  int _elapsedSeconds = 0;
  double _currentSpeedKmh = 0.0;
  double _avgSpeedKmh = 0.0;
  String _currentPace = '00:00';
  int _calories = 0;
  int _cadence = 0;
  int _heartRate = 85;

  String _gpsStatus = 'good'; // 'good', 'searching', 'poor'
  double _gpsAccuracy = 4.5;
  String? _antiCheatWarning;
  bool _isSimulating = true;

  final List<GPSCoordinatePoint> _routePoints = [];
  Timer? _trackerTimer;
  Timer? _stepMotionTimer;

  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _trackerTimer?.cancel();
    _stepMotionTimer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  void _startTracking() {
    setState(() {
      _isStarted = true;
      _isPaused = false;
      _isCompleted = false;
      _antiCheatWarning = null;
    });

    _startTimers();
  }

  void _startTimers() {
    _trackerTimer?.cancel();
    _stepMotionTimer?.cancel();

    double baseLat = 10.7769;
    double baseLng = 106.7009;

    _trackerTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!_isStarted || _isPaused || _isCompleted) return;

      setState(() {
        _elapsedSeconds++;

        // Simulate GPS & Step accumulation
        if (_isSimulating) {
          final double angle = (_elapsedSeconds * 4 * pi) / 180;
          final double radius = 0.0018 + sin(angle * 0.5) * 0.0006;
          final double newLat = baseLat + radius * cos(angle);
          final double newLng = baseLng + radius * sin(angle);

          final double simSpeed = 4.8 + sin(angle) * 0.8; // ~5.2 km/h
          _currentSpeedKmh = double.parse(simSpeed.toStringAsFixed(1));

          final int stepDelta = 2 + (Random().nextInt(2));
          _steps += stepDelta;

          final double distDelta = (simSpeed * 1000) / 3600; // ~1.4 m/s
          _distanceMeters += distDelta;

          _routePoints.add(GPSCoordinatePoint(
            lat: newLat,
            lng: newLng,
            speed: simSpeed,
            timestamp: DateTime.now(),
          ));

          // Anti-cheat verification
          if (_currentSpeedKmh > 25.0) {
            _antiCheatWarning = 'Tốc độ quá nhanh (>25km/h). Đã tạm dừng đếm để chống gian lận xe máy!';
          } else {
            _antiCheatWarning = null;
          }
        }

        // Calculate Pace (min/km)
        if (_distanceMeters > 50) {
          final double totalKm = _distanceMeters / 1000;
          final double paceMinutes = (_elapsedSeconds / 60) / totalKm;
          final int pMin = paceMinutes.floor();
          final int pSec = ((paceMinutes - pMin) * 60).floor();
          _currentPace = '${pMin.toString().padLeft(2, '0')}\'${pSec.toString().padLeft(2, '0')}"';

          _avgSpeedKmh = double.parse((totalKm / (_elapsedSeconds / 3600)).toStringAsFixed(1));
        }

        // Calories: ~0.043 kcal per step + MET factor
        _calories = (_steps * 0.043 + (_distanceMeters / 1000) * 22).round();

        // Cadence (SPM)
        if (_elapsedSeconds > 5) {
          _cadence = ((_steps / _elapsedSeconds) * 60).round();
        }

        // Heart Rate
        _heartRate = min(155, max(78, (80 + _currentSpeedKmh * 8.5).round()));
      });
    });
  }

  void _pauseTracking() {
    setState(() {
      _isPaused = true;
    });
  }

  void _resumeTracking() {
    setState(() {
      _isPaused = false;
    });
  }

  void _finishTracking() {
    setState(() {
      _isStarted = false;
      _isPaused = false;
      _isCompleted = true;
    });

    _trackerTimer?.cancel();
    _stepMotionTimer?.cancel();

    // Update Riverpod Providers
    final finalSteps = max(_steps, (_distanceMeters / 0.76).round());
    ref.read(userExerciseStatsProvider.notifier).addWalkingSteps(finalSteps);
    ref.read(dailyWalkingGoalProvider.notifier).updateSteps(
      ref.read(dailyWalkingGoalProvider).currentSteps + finalSteps,
    );

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
              'Buổi tập đã được xác minh qua Anti-Cheat AI và lưu vào hồ sơ cá nhân.',
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
              _trackMode == 'outdoor' ? '🛰️ GPS Vệ Tinh + Gia Tốc Mobile' : '👟 Cảm biến bước chân Pedometer',
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
            ),
          ],
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.volume_up, color: Color(0xFF2ED573)),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Giọng nói hướng dẫn đã bật')),
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
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Color(0xFF2ED573),
                          boxShadow: [
                            BoxShadow(color: Color(0xFF2ED573), blurRadius: 6),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'GPS Độ chính xác cao (±${_gpsAccuracy.toStringAsFixed(0)}m)',
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
                    child: const Row(
                      children: [
                        Icon(Icons.shield, color: Color(0xFF2ED573), size: 12),
                        SizedBox(width: 4),
                        Text('Anti-Cheat AI', style: TextStyle(color: Color(0xFF2ED573), fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

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
            const SizedBox(height: 16),

            // Main Step Counter Card
            AppCard(
              child: Column(
                children: [
                  const Text(
                    'SỐ BƯỚC CHÂN THỰC TẾ',
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
                    'BẮT ĐẦU ĐI BỘ (GPS LIVE)',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
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
