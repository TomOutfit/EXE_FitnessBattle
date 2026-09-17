import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/providers.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../../../../core/models_exercise.dart';
import 'exercise_camera_page.dart';
import 'battle_camera_page.dart';

class ExerciseTrackPage extends ConsumerStatefulWidget {
  const ExerciseTrackPage({super.key});

  @override
  ConsumerState<ExerciseTrackPage> createState() => _ExerciseTrackPageState();
}

class _ExerciseTrackPageState extends ConsumerState<ExerciseTrackPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Text(
                  '💪 Tập Luyện',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.local_fire_department, color: AppColors.error, size: 18),
                      const SizedBox(width: 4),
                      Consumer(
                        builder: (context, ref, _) {
                          final user = ref.watch(userProvider);
                          return Text(
                            '${user.streak} ngày',
                            style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Tabs
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: TabBar(
              controller: _tabController,
              indicator: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(10),
              ),
              indicatorSize: TabBarIndicatorSize.tab,
              dividerColor: Colors.transparent,
              labelColor: Colors.white,
              unselectedLabelColor: AppColors.textMuted,
              labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              tabs: const [
                Tab(text: '💪 Hít Đất'),
                Tab(text: '🏋️ Kéo Xà'),
                Tab(text: '🚶 Đi Bộ'),
              ],
            ),
          ),

          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _PushupTab(),
                _PullupTab(),
                _WalkingTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================
// PUSH-UP TAB
// ============================================

class _PushupTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(userExerciseStatsProvider);
    final dailyGoals = ref.watch(dailyExerciseGoalsProvider);
    final recentSessions = ref.watch(recentExerciseSessionsProvider);
    final pushupSessions = recentSessions.where((s) => s.type == ExerciseTypeEnum.pushup).toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Quick Stats Card
        AppCard(
          gradient: const LinearGradient(
            colors: [Color(0xFFFF6b35), Color(0xFFFF8E53)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Center(
                      child: Text('💪', style: TextStyle(fontSize: 32)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Hít Đất',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          'Kỷ lục cá nhân: ${stats.bestPushupCount} lần',
                          style: const TextStyle(color: Colors.white70, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _StatItem(label: 'Tổng', value: '${stats.totalPushups}'),
                  Container(width: 1, height: 30, color: Colors.white24),
                  _StatItem(label: 'Tuần này', value: '${stats.weeklyPushups.reduce((a, b) => a + b)}'),
                  Container(width: 1, height: 30, color: Colors.white24),
                  _StatItem(label: 'Hôm nay', value: '${dailyGoals.pushupCompleted}'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Daily Goal Progress
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    '🎯 Mục tiêu hôm nay',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    '${dailyGoals.pushupCompleted}/${dailyGoals.pushupTarget}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ProgressBar(
                progress: dailyGoals.pushupProgress,
                color: const Color(0xFFFF6b35),
                height: 12,
              ),
              const SizedBox(height: 8),
              if (dailyGoals.pushupCompleted >= dailyGoals.pushupTarget)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.check_circle, color: AppColors.success, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Hoàn thành! +50 Coins',
                        style: TextStyle(color: AppColors.success, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Start Training Button
        GradientButton(
          text: 'BẮT ĐẦU TẬP',
          icon: Icons.play_arrow,
          gradient: const LinearGradient(
            colors: [Color(0xFFFF6b35), Color(0xFFFF8E53)],
          ),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const ExerciseCameraPage(exerciseType: ExerciseTypeEnum.pushup),
              ),
            );
          },
        ),
        const SizedBox(height: 16),

        // Battle Mode
        AppCard(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const BattleCameraPage(exerciseType: ExerciseTypeEnum.pushup),
              ),
            );
          },
          child: Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.sports_mma, color: AppColors.primary, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '⚔️ Chế độ Thi đấu',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Thách đấu 1 phút - Ai nhiều hơn thắng!',
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.textMuted),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Recent Sessions
        const Text(
          '📊 Lịch sử gần đây',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        if (pushupSessions.isEmpty)
          AppCard(
            child: Column(
              children: [
                const Icon(Icons.fitness_center, size: 40, color: AppColors.textMuted),
                const SizedBox(height: 8),
                const Text('Chưa có buổi tập nào', style: TextStyle(color: AppColors.textSecondary)),
                const SizedBox(height: 4),
                const Text('Bắt đầu tập để xem lịch sử', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
              ],
            ),
          )
        else
          ...pushupSessions.take(3).map((session) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: _SessionCard(session: session),
          )),
      ],
    );
  }
}

// ============================================
// PULL-UP TAB
// ============================================

class _PullupTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(userExerciseStatsProvider);
    final dailyGoals = ref.watch(dailyExerciseGoalsProvider);
    final recentSessions = ref.watch(recentExerciseSessionsProvider);
    final pullupSessions = recentSessions.where((s) => s.type == ExerciseTypeEnum.pullup).toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Quick Stats Card
        AppCard(
          gradient: const LinearGradient(
            colors: [Color(0xFF5352ed), Color(0xFF7f73ed)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Center(
                      child: Text('🏋️', style: TextStyle(fontSize: 32)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Kéo Xà',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          'Kỷ lục cá nhân: ${stats.bestPullupCount} lần',
                          style: const TextStyle(color: Colors.white70, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _StatItem(label: 'Tổng', value: '${stats.totalPullups}'),
                  Container(width: 1, height: 30, color: Colors.white24),
                  _StatItem(label: 'Tuần này', value: '${stats.weeklyPullups.reduce((a, b) => a + b)}'),
                  Container(width: 1, height: 30, color: Colors.white24),
                  _StatItem(label: 'Hôm nay', value: '${dailyGoals.pullupCompleted}'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Daily Goal Progress
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    '🎯 Mục tiêu hôm nay',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    '${dailyGoals.pullupCompleted}/${dailyGoals.pullupTarget}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ProgressBar(
                progress: dailyGoals.pullupProgress,
                color: const Color(0xFF5352ed),
                height: 12,
              ),
              const SizedBox(height: 8),
              if (dailyGoals.pullupCompleted >= dailyGoals.pullupTarget)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.check_circle, color: AppColors.success, size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Hoàn thành! +75 Coins',
                        style: TextStyle(color: AppColors.success, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Start Training Button
        GradientButton(
          text: 'BẮT ĐẦU TẬP',
          icon: Icons.play_arrow,
          gradient: const LinearGradient(
            colors: [Color(0xFF5352ed), Color(0xFF7f73ed)],
          ),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const ExerciseCameraPage(exerciseType: ExerciseTypeEnum.pullup),
              ),
            );
          },
        ),
        const SizedBox(height: 16),

        // Battle Mode
        AppCard(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const BattleCameraPage(exerciseType: ExerciseTypeEnum.pullup),
              ),
            );
          },
          child: Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.sports_mma, color: AppColors.primary, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '⚔️ Chế độ Thi đấu',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Thách đấu 1 phút - Ai nhiều hơn thắng!',
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.textMuted),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Recent Sessions
        const Text(
          '📊 Lịch sử gần đây',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        if (pullupSessions.isEmpty)
          AppCard(
            child: Column(
              children: [
                const Icon(Icons.fitness_center, size: 40, color: AppColors.textMuted),
                const SizedBox(height: 8),
                const Text('Chưa có buổi tập nào', style: TextStyle(color: AppColors.textSecondary)),
                const SizedBox(height: 4),
                const Text('Bắt đầu tập để xem lịch sử', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
              ],
            ),
          )
        else
          ...pullupSessions.take(3).map((session) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: _SessionCard(session: session),
          )),
      ],
    );
  }
}

// ============================================
// WALKING TAB
// ============================================

class _WalkingTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(userExerciseStatsProvider);
    final dailyGoal = ref.watch(dailyWalkingGoalProvider);
    final distanceKm = (dailyGoal.currentSteps * 0.75 / 1000).toStringAsFixed(2);
    final calories = (dailyGoal.currentSteps * 0.038).round();
    final pointsEarned = (dailyGoal.currentSteps ~/ 10) + (dailyGoal.currentSteps ~/ 100);

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      children: [
        // ── 1. HERO WALKING CARD (Glassmorphic Emerald Gradient) ──
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF0F9B0F), Color(0xFF10AC84), Color(0xFF2ED573)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF10AC84).withValues(alpha: 0.35),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.22),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Text('🚶', style: TextStyle(fontSize: 26)),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'ĐI BỘ & CHẠY BỘ',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              letterSpacing: 0.8,
                            ),
                          ),
                          Text(
                            'Tổng tích lũy: ${stats.totalWalkingSteps} bước',
                            style: const TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.bolt, color: Color(0xFFFFD700), size: 16),
                        const SizedBox(width: 4),
                        Text(
                          '+$pointsEarned pts',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Step Numbers & Circle Progress Info
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Bước chân hôm nay',
                        style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            '${dailyGoal.currentSteps}',
                            style: const TextStyle(
                              fontSize: 34,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              letterSpacing: -0.5,
                            ),
                          ),
                          Text(
                            ' / ${dailyGoal.targetSteps}',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      '${(dailyGoal.progress * 100).toInt()}%',
                      style: const TextStyle(
                        color: Color(0xFF10AC84),
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Progress Bar
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: LinearProgressIndicator(
                  value: dailyGoal.progress.clamp(0.0, 1.0),
                  minHeight: 10,
                  backgroundColor: Colors.black.withValues(alpha: 0.2),
                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              ),
              const SizedBox(height: 18),

              // 3 Metric Grid
              Container(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _MiniWalkingStat(
                      icon: Icons.place,
                      label: 'Quãng đường',
                      value: '$distanceKm km',
                    ),
                    Container(width: 1, height: 26, color: Colors.white24),
                    _MiniWalkingStat(
                      icon: Icons.local_fire_department,
                      label: 'Năng lượng',
                      value: '$calories kcal',
                    ),
                    Container(width: 1, height: 26, color: Colors.white24),
                    _MiniWalkingStat(
                      icon: Icons.timer,
                      label: 'Thời gian',
                      value: '${(dailyGoal.currentSteps / 110).round()} phút',
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // ── 2. AI ANTI-CHEAT SHIELD STATUS BADGE ──
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
          decoration: BoxDecoration(
            color: const Color(0xFF10AC84).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF10AC84).withValues(alpha: 0.35)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF10AC84).withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.shield, color: Color(0xFF2ED573), size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Hệ Thống AI Anti-Cheat 4.0 Hoạt Động',
                      style: TextStyle(
                        color: Color(0xFF2ED573),
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Tự động khóa chống đi xe máy, xe đạp điện & lắc tay ảo',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 10),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF2ED573).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'Active',
                  style: TextStyle(color: Color(0xFF2ED573), fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // ── 3. PRIMARY ACTION: GPS LIVE WALKING BUTTON ──
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: const LinearGradient(
              colors: [Color(0xFF2ED573), Color(0xFF10AC84)],
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF2ED573).withValues(alpha: 0.4),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              shadowColor: Colors.transparent,
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            ),
            onPressed: () => context.push('/gps-walking'),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: const BoxDecoration(
                    color: Color(0xFF0F0F23),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.play_arrow_rounded, color: Color(0xFF2ED573), size: 24),
                ),
                const SizedBox(width: 12),
                const Text(
                  'BẮT ĐẦU ĐI BỘ REALTIME (GPS LIVE)',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF0F0F23),
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // ── 4. TWO TRACKING MODES CARDS ──
        Row(
          children: [
            Expanded(
              child: InkWell(
                onTap: () => context.push('/gps-walking'),
                borderRadius: BorderRadius.circular(18),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0xFF2ED573).withValues(alpha: 0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF2ED573).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.near_me, color: Color(0xFF2ED573), size: 22),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF2ED573).withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text('GPS Live', style: TextStyle(color: Color(0xFF2ED573), fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Ngoài trời (GPS)',
                        style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary, fontSize: 14),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Vẽ lộ trình bản đồ, lọc nhiễu vệ tinh 2D Kalman & đo Pace',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.3),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: InkWell(
                onTap: () => context.push('/gps-walking'),
                borderRadius: BorderRadius.circular(18),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(Icons.directions_run, color: AppColors.primary, size: 22),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text('Sensor', style: TextStyle(color: AppColors.primary, fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Trong nhà / Máy chạy',
                        style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary, fontSize: 14),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Cảm biến bước chân sinh học, tự động hiệu chỉnh sải bước',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 11, height: 1.3),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // ── 5. QUICK ACTIONS & SYNC ──
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    '⚡ Tiện ích & Đồng bộ dữ liệu',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                  TextButton.icon(
                    onPressed: () => _showSyncDialog(context),
                    icon: const Icon(Icons.sync, size: 16, color: AppColors.primary),
                    label: const Text('Đồng bộ', style: TextStyle(color: AppColors.primary, fontSize: 12)),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: BorderSide(color: AppColors.surfaceLight),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => _showSyncDialog(context),
                      icon: const Icon(Icons.watch, color: Color(0xFF2ED573), size: 18),
                      label: const Text('Smartwatch', style: TextStyle(color: AppColors.textPrimary, fontSize: 12)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: BorderSide(color: AppColors.surfaceLight),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => _showManualEntryDialog(context, ref),
                      icon: const Icon(Icons.edit_note, color: AppColors.primary, size: 18),
                      label: const Text('Nhập số bước', style: TextStyle(color: AppColors.textPrimary, fontSize: 12)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // ── 6. GAMIFICATION POINTS POLICY ──
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: const [
                  Text('💎', style: TextStyle(fontSize: 18)),
                  SizedBox(width: 8),
                  Text(
                    'Cơ chế Thưởng & Tích Điểm Đi Bộ',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const _PointInfoRow(icon: '👟', label: '10 bước chân thực tế', value: '+1 Điểm Thể Lực'),
              const Divider(color: AppColors.surfaceLight, height: 16),
              const _PointInfoRow(icon: '📍', label: '100m quãng đường GPS', value: '+1 Điểm Thưởng'),
              const Divider(color: AppColors.surfaceLight, height: 16),
              const _PointInfoRow(icon: '🎯', label: 'Hoàn thành mục tiêu 10.000 bước', value: '+30 Coins & XP'),
              const Divider(color: AppColors.surfaceLight, height: 16),
              const _PointInfoRow(icon: '🔥', label: 'Duy trì chuỗi Streak (Hôm nay)', value: 'x1.25 Multiplier'),
            ],
          ),
        ),
        const SizedBox(height: 20),
      ],
    );
  }

  void _showSyncDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Đồng bộ thiết bị'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.watch),
              title: const Text('Apple Watch / Wear OS'),
              subtitle: const Text('Đồng bộ từ đồng hồ thông minh'),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Đang tìm thiết bị...')),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.phone_android),
              title: const Text('Pedometer (Bước chân)'),
              subtitle: const Text('Sử dụng cảm biến điện thoại'),
              onTap: () {
                Navigator.pop(context);
                context.push('/gps-walking');
              },
            ),
            ListTile(
              leading: const Icon(Icons.directions_walk),
              title: const Text('GPS Tracking'),
              subtitle: const Text('Theo dõi qua GPS'),
              onTap: () {
                Navigator.pop(context);
                context.push('/gps-walking');
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  void _showManualEntryDialog(BuildContext context, WidgetRef ref) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Nhập số bước'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'Số bước',
            hintText: 'VD: 5000',
            suffixText: 'bước',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () {
              final steps = int.tryParse(controller.text);
              if (steps != null && steps > 0) {
                ref.read(userExerciseStatsProvider.notifier).addWalkingSteps(steps);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Đã thêm $steps bước!')),
                );
              }
            },
            child: const Text('Xác nhận'),
          ),
        ],
      ),
    );
  }
}

// ============================================
// HELPER WIDGETS
// ============================================

class _StatItem extends StatelessWidget {
  final String label;
  final String value;

  const _StatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.white70,
          ),
        ),
      ],
    );
  }
}

class _MiniWalkingStat extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _MiniWalkingStat({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: Colors.white70, size: 14),
            const SizedBox(width: 4),
            Text(
              label,
              style: const TextStyle(color: Colors.white70, fontSize: 11),
            ),
          ],
        ),
        const SizedBox(height: 3),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
      ],
    );
  }
}

class _SessionCard extends StatelessWidget {
  final ExerciseSession session;

  const _SessionCard({required this.session});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Color(int.parse(session.type.color.replaceAll('#', '0xFF'))).withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(session.type.emoji, style: const TextStyle(fontSize: 24)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${session.count} lần',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  '${session.durationSeconds ~/ 60}:${(session.durationSeconds % 60).toString().padLeft(2, '0')} • ${session.accuracy.percentage.toStringAsFixed(0)}%',
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '+${session.xpEarned} XP',
                style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.primary),
              ),
              Text(
                '+${session.pointsEarned} pts',
                style: const TextStyle(fontSize: 12, color: AppColors.accent),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PointInfoRow extends StatelessWidget {
  final String icon;
  final String label;
  final String value;

  const _PointInfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Text(icon, style: const TextStyle(fontSize: 20)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(color: AppColors.textSecondary),
            ),
          ),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.success),
          ),
        ],
      ),
    );
  }
}

// ============================================
// EXERCISE SESSION PAGE
// ============================================

class ExerciseSessionPage extends ConsumerStatefulWidget {
  final ExerciseTypeEnum exerciseType;

  const ExerciseSessionPage({super.key, required this.exerciseType});

  @override
  ConsumerState<ExerciseSessionPage> createState() => _ExerciseSessionPageState();
}

class _ExerciseSessionPageState extends ConsumerState<ExerciseSessionPage> {
  int _count = 0;
  int _correctCount = 0;
  bool _isRunning = false;
  int _elapsedSeconds = 0;
  bool _showFeedback = false;
  String _lastFeedback = '';

  @override
  void initState() {
    super.initState();
    _startSession();
  }

  void _startSession() {
    setState(() {
      _isRunning = true;
      _count = 0;
      _correctCount = 0;
      _elapsedSeconds = 0;
    });
  }

  void _incrementCount({bool isCorrect = true}) {
    setState(() {
      _count++;
      if (isCorrect) {
        _correctCount++;
      }
      _lastFeedback = isCorrect ? '✓ Form tốt!' : '⚠️ Cải thiện form!';
      _showFeedback = true;
      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) setState(() => _showFeedback = false);
      });
    });
  }

  void _endSession() {
    setState(() => _isRunning = false);
    _showResults();
  }

  void _showResults() {
    final accuracy = _count > 0 ? (_correctCount / _count * 100) : 0.0;
    final xpEarned = ExerciseRewards.calculateXP(widget.exerciseType, _count, 14);
    final pointsEarned = ExerciseRewards.calculatePoints(widget.exerciseType, _count, 14);
    final caloriesBurned = ExerciseRewards.calculateCalories(widget.exerciseType, _count);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.textMuted,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              widget.exerciseType.emoji,
              style: const TextStyle(fontSize: 64),
            ),
            const SizedBox(height: 16),
            const Text(
              'HOÀN THÀNH!',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _ResultItem(label: 'Tổng', value: '$_count', color: AppColors.primary),
                _ResultItem(label: 'Chuẩn', value: '$_correctCount', color: AppColors.success),
                _ResultItem(label: 'Độ chính xác', value: '${accuracy.toStringAsFixed(0)}%', color: AppColors.accent),
              ],
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(
                    children: [
                      const Icon(Icons.bolt, color: AppColors.primary),
                      const SizedBox(height: 4),
                      Text('+$xpEarned XP', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                      const Text('Kinh nghiệm', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                    ],
                  ),
                  Container(width: 1, height: 40, color: AppColors.textMuted),
                  Column(
                    children: [
                      const Icon(Icons.stars, color: AppColors.accent),
                      const SizedBox(height: 4),
                      Text('+$pointsEarned', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.accent)),
                      const Text('Điểm', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                    ],
                  ),
                  Container(width: 1, height: 40, color: AppColors.textMuted),
                  Column(
                    children: [
                      const Icon(Icons.local_fire_department, color: AppColors.error),
                      const SizedBox(height: 4),
                      Text('+$caloriesBurned', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.error)),
                      const Text('Calories', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            GradientButton(
              text: 'TIẾP TỤC',
              gradient: AppColors.primaryGradient,
              onPressed: () => Navigator.pop(context),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
              },
              child: const Text('Về trang chủ'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final color = Color(int.parse(widget.exerciseType.color.replaceAll('#', '0xFF')));

    return Scaffold(
      backgroundColor: color.withValues(alpha: 0.1),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            if (_count > 0) {
              _showExitConfirmation();
            } else {
              Navigator.pop(context);
            }
          },
        ),
        title: Text(
          widget.exerciseType.name,
          style: TextStyle(color: color),
        ),
        actions: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Icon(Icons.timer, size: 16, color: color),
                const SizedBox(width: 4),
                Text(
                  '${_elapsedSeconds ~/ 60}:${(_elapsedSeconds % 60).toString().padLeft(2, '0')}',
                  style: TextStyle(color: color, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Counter Display
          Expanded(
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (_showFeedback)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      decoration: BoxDecoration(
                        color: _lastFeedback.startsWith('✓') 
                            ? AppColors.success.withValues(alpha: 0.2)
                            : AppColors.warning.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        _lastFeedback,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: _lastFeedback.startsWith('✓') ? AppColors.success : AppColors.warning,
                        ),
                      ),
                    )
                  else
                    Text(
                      widget.exerciseType.emoji,
                      style: const TextStyle(fontSize: 80),
                    ),
                  const SizedBox(height: 24),
                  Text(
                    '$_count',
                    style: TextStyle(
                      fontSize: 120,
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
                  ),
                  Text(
                    _count == 1 ? 'lần' : 'lần',
                    style: const TextStyle(
                      fontSize: 24,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '$_correctCount/${_count} form chuẩn',
                      style: const TextStyle(
                        color: AppColors.success,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Control Buttons
          Container(
            padding: const EdgeInsets.all(24),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _incrementCount(isCorrect: false),
                    icon: const Text('⚠️', style: TextStyle(fontSize: 20)),
                    label: const Text('Sai form'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: GradientButton(
                    text: '+1',
                    icon: Icons.add,
                    gradient: LinearGradient(colors: [color, color.withValues(alpha: 0.7)]),
                    onPressed: () => _incrementCount(isCorrect: true),
                  ),
                ),
              ],
            ),
          ),

          // End Session Button
          Padding(
            padding: const EdgeInsets.only(left: 24, right: 24, bottom: 24),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _endSession,
                style: ElevatedButton.styleFrom(
                  backgroundColor: color,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'KẾT THÚC BUỔI TẬP',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showExitConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Thoát buổi tập?'),
        content: Text('Bạn đã tập $_count lần. Kết quả sẽ không được lưu.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Tiếp tục tập'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Thoát'),
          ),
        ],
      ),
    );
  }
}

class _ResultItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _ResultItem({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
