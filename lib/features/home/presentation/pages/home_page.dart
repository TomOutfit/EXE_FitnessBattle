import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/models.dart';
import '../../../../core/providers.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/common_widgets.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    final battles = ref.watch(battlesProvider);
    final challenges = ref.watch(challengesProvider);
    final activities = ref.watch(activitiesProvider);
    final exerciseStats = ref.watch(userExerciseStatsProvider);
    final dailyGoals = ref.watch(dailyExerciseGoalsProvider);

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Brand Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.asset(
                        'assets/images/Logo.png',
                        width: 32,
                        height: 32,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) => const Icon(
                          Icons.fitness_center,
                          color: AppColors.primary,
                          size: 28,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'FITNESS BATTLE',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: AppColors.primary,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () => context.push('/shop'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.diamond, color: Color(0xFFFF4757), size: 16),
                        const SizedBox(width: 4),
                        Text(
                          '${user.ruby}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Header User Info
            Row(
              children: [
                AvatarWidget(avatarUrl: user.avatar, size: 56),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Xin chào, ${user.name}! 👋',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.local_fire_department, color: AppColors.primary, size: 16),
                          const SizedBox(width: 4),
                          Text(
                            '${user.streak} ngày liên tiếp',
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // XP Progress
            AppCard(
              child: XpProgressBar(
                currentXp: user.xp,
                xpToNextLevel: user.xpToNextLevel,
                level: user.level,
              ),
            ),
            const SizedBox(height: 20),

            // Quick Stats
            Row(
              children: [
                Expanded(
                  child: AppCard(
                    child: Column(
                      children: [
                        const Icon(Icons.monetization_on, color: AppColors.accent, size: 28),
                        const SizedBox(height: 8),
                        Text(
                          '${user.coins}',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const Text(
                          'Coins',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: AppCard(
                    child: Column(
                      children: [
                        const Icon(Icons.bolt, color: AppColors.secondary, size: 28),
                        const SizedBox(height: 8),
                        Text(
                          '${user.stamina}/${user.maxStamina}',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const Text(
                          'Stamina',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: AppCard(
                    child: Column(
                      children: [
                        const Icon(Icons.emoji_events, color: AppColors.primary, size: 28),
                        const SizedBox(height: 8),
                        Text(
                          '#${user.rank}',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const Text(
                          'Hạng',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Exercise Quick Access
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  '💪 Tập Luyện Hôm Nay',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                TextButton(
                  onPressed: () => context.go('/exercise'),
                  child: const Text('Xem tất cả', style: TextStyle(color: AppColors.primary)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _ExerciseQuickCard(
                    emoji: '💪',
                    name: 'Hít Đất',
                    progress: dailyGoals.pushupProgress,
                    current: dailyGoals.pushupCompleted,
                    target: dailyGoals.pushupTarget,
                    color: const Color(0xFFFF6b35),
                    onTap: () => context.go('/exercise'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _ExerciseQuickCard(
                    emoji: '🏋️',
                    name: 'Kéo Xà',
                    progress: dailyGoals.pullupProgress,
                    current: dailyGoals.pullupCompleted,
                    target: dailyGoals.pullupTarget,
                    color: const Color(0xFF5352ed),
                    onTap: () => context.go('/exercise'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _ExerciseQuickCard(
                    emoji: '🚶',
                    name: 'Đi Bộ',
                    progress: dailyGoals.walkingProgress,
                    current: dailyGoals.walkingCompleted,
                    target: dailyGoals.walkingTarget,
                    color: const Color(0xFF2ed573),
                    onTap: () => context.go('/exercise'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Exercise Stats Summary
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '📊 Thống kê tuần này',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${exerciseStats.weeklyPushups.reduce((a, b) => a + b)} lần hít đất',
                          style: const TextStyle(color: Colors.white70),
                        ),
                        Text(
                          '${exerciseStats.weeklyPullups.reduce((a, b) => a + b)} lần kéo xà',
                          style: const TextStyle(color: Colors.white70),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.local_fire_department, color: Colors.white, size: 24),
                        const SizedBox(height: 4),
                        Text(
                          '${exerciseStats.currentStreak}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                            fontSize: 18,
                          ),
                        ),
                        const Text(
                          'Streak',
                          style: TextStyle(color: Colors.white70, fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Active Battles
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  '⚔️ Trận đấu đang diễn ra',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                TextButton(
                  onPressed: () {},
                  child: const Text('Xem tất cả', style: TextStyle(color: AppColors.primary)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 140,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: battles.where((b) => b.status == BattleStatus.active).length,
                itemBuilder: (context, index) {
                  final battle = battles.where((b) => b.status == BattleStatus.active).toList()[index];
                  return Container(
                    width: 280,
                    margin: const EdgeInsets.only(right: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: AppColors.battleGradient,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              battle.title,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Text(
                                'LIVE',
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            ),
                          ],
                        ),
                        const Spacer(),
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    battle.players[0].oderName,
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
                                  ),
                                  Text(
                                    '${battle.players[0].heartRate} BPM',
                                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                                  ),
                                ],
                              ),
                            ),
                            const Text(
                              'VS',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    battle.players[1].oderName,
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
                                  ),
                                  Text(
                                    '${battle.players[1].heartRate} BPM',
                                    style: const TextStyle(color: Colors.white70, fontSize: 12),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),

            // Challenges
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  '🏆 Thử thách hôm nay',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                TextButton(
                  onPressed: () {},
                  child: const Text('Xem tất cả', style: TextStyle(color: AppColors.primary)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...challenges.take(3).map((challenge) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: AppCard(
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: Color(int.parse(challenge.color.replaceAll('#', '0xFF'))).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        challenge.completed ? Icons.check_circle : Icons.flag,
                        color: Color(int.parse(challenge.color.replaceAll('#', '0xFF'))),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            challenge.title,
                            style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                          ),
                          const SizedBox(height: 4),
                          ProgressBar(
                            progress: challenge.current / challenge.target,
                            color: Color(int.parse(challenge.color.replaceAll('#', '0xFF'))),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${challenge.current}/${challenge.target} ${challenge.unit}',
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            )),
            const SizedBox(height: 24),

            // Recent Activities
            const Text(
              '📊 Hoạt động gần đây',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            ...activities.take(3).map((activity) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: AppCard(
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceLight,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.fitness_center, color: AppColors.primary),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            activity.type,
                            style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                          ),
                          Text(
                            '${activity.duration} phút • ${activity.calories} cal',
                            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '+${activity.xp} XP',
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                        Text(
                          activity.date,
                          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            )),
          ],
        ),
      ),
    );
  }
}

class _ExerciseQuickCard extends StatelessWidget {
  final String emoji;
  final String name;
  final double progress;
  final int current;
  final int target;
  final Color color;
  final VoidCallback onTap;

  const _ExerciseQuickCard({
    required this.emoji,
    required this.name,
    required this.progress,
    required this.current,
    required this.target,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: color.withValues(alpha: 0.3),
            width: 1,
          ),
        ),
        child: Column(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 24)),
            const SizedBox(height: 4),
            Text(
              name,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '$current',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              '/$target',
              style: const TextStyle(
                fontSize: 10,
                color: AppColors.textMuted,
              ),
            ),
            const SizedBox(height: 4),
            Container(
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(2),
              ),
              child: FractionallySizedBox(
                alignment: Alignment.centerLeft,
                widthFactor: progress,
                child: Container(
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
