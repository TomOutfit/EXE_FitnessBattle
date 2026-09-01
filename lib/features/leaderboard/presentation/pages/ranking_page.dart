import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/common_widgets.dart';

class RankingPage extends ConsumerWidget {
  const RankingPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final leaderboard = ref.watch(leaderboardProvider);
    final user = ref.watch(userProvider);

    return DefaultTabController(
      length: 2,
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const Text(
                    '📊 Bảng xếp hạng',
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
                        const Icon(Icons.emoji_events, color: AppColors.accent, size: 18),
                        const SizedBox(width: 4),
                        Text(
                          'Hạng #${user.rank}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
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
              child: const TabBar(
                indicator: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.all(Radius.circular(10)),
                ),
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                labelColor: Colors.white,
                unselectedLabelColor: AppColors.textMuted,
                labelStyle: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                tabs: [
                  Tab(text: 'Toàn mùa'),
                  Tab(text: 'Tuần này'),
                ],
              ),
            ),

            // Top 3
            Container(
              height: 160,
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  // 2nd Place
                  if (leaderboard.length > 1)
                    _TopThreeCard(
                      entry: leaderboard[1],
                      rank: 2,
                      height: 120,
                      color: const Color(0xFFC0C0C0),
                    ),
                  const SizedBox(width: 8),
                  // 1st Place
                  _TopThreeCard(
                    entry: leaderboard[0],
                    rank: 1,
                    height: 140,
                    color: const Color(0xFFFFD700),
                  ),
                  const SizedBox(width: 8),
                  // 3rd Place
                  if (leaderboard.length > 2)
                    _TopThreeCard(
                      entry: leaderboard[2],
                      rank: 3,
                      height: 100,
                      color: const Color(0xFFCD7F32),
                    ),
                ],
              ),
            ),

            // Rest of Leaderboard
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: leaderboard.length - 3,
                itemBuilder: (context, index) {
                  final entry = leaderboard[index + 3];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: AppCard(
                      color: entry.isCurrentUser == true 
                          ? AppColors.primary.withValues(alpha: 0.15)
                          : AppColors.surface,
                      child: Row(
                        children: [
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: entry.isCurrentUser == true
                                  ? AppColors.primary
                                  : AppColors.surfaceLight,
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                '${entry.rank}',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: entry.isCurrentUser == true
                                      ? Colors.white
                                      : AppColors.textSecondary,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          AvatarWidget(
                            avatarUrl: entry.avatar,
                            size: 44,
                            showBorder: entry.isVIP == true,
                            borderColor: AppColors.accent,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      entry.oderName,
                                      style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                        color: entry.isCurrentUser == true
                                            ? AppColors.primary
                                            : AppColors.textPrimary,
                                      ),
                                    ),
                                    if (entry.isVIP == true) ...[
                                      const SizedBox(width: 4),
                                      const Icon(
                                        Icons.diamond,
                                        size: 14,
                                        color: AppColors.accent,
                                      ),
                                    ],
                                  ],
                                ),
                                Text(
                                  'Level ${entry.level}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '${entry.points}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const Text(
                                'điểm',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TopThreeCard extends StatelessWidget {
  final dynamic entry;
  final int rank;
  final double height;
  final Color color;

  const _TopThreeCard({
    required this.entry,
    required this.rank,
    required this.height,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Container(
          width: 52,
          height: 52,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: color, width: 3),
            color: AppColors.surface,
          ),
          child: ClipOval(
            child: Image.network(
              entry.avatar,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Icon(Icons.person, color: color),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          entry.oderName,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
          overflow: TextOverflow.ellipsis,
        ),
        Text(
          '${entry.points} pts',
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          width: 70,
          height: height,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [color.withValues(alpha: 0.8), color.withValues(alpha: 0.4)],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                _getRankEmoji(rank),
                style: const TextStyle(fontSize: 28),
              ),
              Text(
                '#$rank',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: color.computeLuminance() > 0.5 
                      ? Colors.black 
                      : Colors.white,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  String _getRankEmoji(int rank) {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  }
}
