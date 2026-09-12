import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models.dart';
import '../../../../core/providers.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/common_widgets.dart';

class ChallengePage extends ConsumerWidget {
  const ChallengePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final challenges = ref.watch(challengesProvider);

    return DefaultTabController(
      length: 3,
      child: SafeArea(
        child: Column(
          children: [
            // Header
            const Padding(
              padding: EdgeInsets.all(16),
              child: Row(
                children: [
                  Text(
                    '🏆 Thử thách',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
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
                  Tab(text: 'Hàng ngày'),
                  Tab(text: 'Tuần này'),
                  Tab(text: 'Tháng này'),
                ],
              ),
            ),

            // Tab Views
            Expanded(
              child: TabBarView(
                children: [
                  _ChallengeList(
                    challenges: challenges.where((c) => c.type == ChallengeType.daily).toList(),
                    emptyMessage: 'Không có thử thách hàng ngày',
                  ),
                  _ChallengeList(
                    challenges: challenges.where((c) => c.type == ChallengeType.weekly).toList(),
                    emptyMessage: 'Không có thử thách tuần này',
                  ),
                  _ChallengeList(
                    challenges: challenges.where((c) => c.type == ChallengeType.monthly).toList(),
                    emptyMessage: 'Không có thử thách tháng này',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ChallengeList extends ConsumerWidget {
  final List<Challenge> challenges;
  final String emptyMessage;

  const _ChallengeList({
    required this.challenges,
    required this.emptyMessage,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (challenges.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.emoji_events_outlined, size: 64, color: AppColors.textMuted),
            const SizedBox(height: 16),
            Text(
              emptyMessage,
              style: const TextStyle(fontSize: 16, color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: challenges.length,
      itemBuilder: (context, index) {
        final challenge = challenges[index];
        final color = Color(int.parse(challenge.color.replaceAll('#', '0xFF')));
        final progress = challenge.current / challenge.target;

        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(
                        _getIcon(challenge.icon),
                        color: color,
                        size: 28,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                challenge.title,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              if (challenge.completed) ...[
                                const SizedBox(width: 8),
                                const Icon(
                                  Icons.check_circle,
                                  color: AppColors.success,
                                  size: 20,
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            challenge.description,
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${challenge.current}/${challenge.target} ${challenge.unit}',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              Text(
                                '${(progress * 100).toInt()}%',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: color,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          ProgressBar(
                            progress: progress,
                            color: color,
                            height: 10,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    const Icon(Icons.card_giftcard, size: 16, color: AppColors.accent),
                    const SizedBox(width: 4),
                    Text(
                      '+${challenge.reward.xp} XP',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Icon(Icons.monetization_on, size: 16, color: AppColors.accent),
                    const SizedBox(width: 4),
                    Text(
                      '+${challenge.reward.coins} Coins',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: AppColors.accent,
                      ),
                    ),
                    const Spacer(),
                    if (challenge.completed)
                      ElevatedButton(
                        onPressed: () {
                          ref.read(challengesProvider.notifier).claimReward(challenge.id);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Đã nhận thưởng +${challenge.reward.xp} XP, +${challenge.reward.coins} Coins!'),
                              backgroundColor: AppColors.success,
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.success,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('Nhận thưởng', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                      )
                    else
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.timer, size: 14, color: AppColors.textMuted),
                            const SizedBox(width: 4),
                            Text(
                              _getTimeRemaining(challenge.expiresAt),
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  IconData _getIcon(String iconName) {
    switch (iconName) {
      case 'flame':
        return Icons.local_fire_department;
      case 'zap':
        return Icons.bolt;
      case 'swords':
        return Icons.sports_mma;
      default:
        return Icons.emoji_events;
    }
  }

  String _getTimeRemaining(String expiresAt) {
    final expiry = DateTime.tryParse(expiresAt);
    if (expiry == null) {
      return expiresAt; // Already a formatted string like '5 ngày' or '12 giờ'
    }
    final now = DateTime.now();
    final diff = expiry.difference(now);

    if (diff.isNegative) {
      return 'Hết hạn';
    } else if (diff.inDays > 0) {
      return '${diff.inDays} ngày';
    } else if (diff.inHours > 0) {
      return '${diff.inHours} giờ';
    } else {
      return '${diff.inMinutes} phút';
    }
  }
}
