import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/common_widgets.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Profile Header
            AppCard(
              gradient: AppColors.primaryGradient,
              child: Column(
                children: [
                  Row(
                    children: [
                      Stack(
                        children: [
                          AvatarWidget(avatarUrl: user.avatar, size: 80),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2),
                              ),
                              child: Text(
                                '${user.level}',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  user.name,
                                  style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                if (user.isVIP) ...[
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(Icons.diamond, size: 12, color: Colors.white),
                                        SizedBox(width: 2),
                                        Text(
                                          'VIP',
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            if (user.equippedTitle != null) ...[
                              const SizedBox(height: 4),
                              Text(
                                user.equippedTitle!,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: Colors.white70,
                                ),
                              ),
                            ],
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.calendar_today, size: 14, color: Colors.white70),
                                const SizedBox(width: 4),
                                Text(
                                  'Tham gia: ${user.joinDate}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Colors.white70,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  XpProgressBar(
                    currentXp: user.xp,
                    xpToNextLevel: user.xpToNextLevel,
                    level: user.level,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Stats Grid
            Row(
              children: [
                Expanded(
                  child: AppCard(
                    child: Column(
                      children: [
                        const Icon(Icons.emoji_events, color: AppColors.accent, size: 28),
                        const SizedBox(height: 8),
                        Text(
                          '${user.totalPoints}',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const Text(
                          'Tổng điểm',
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
                        const Icon(Icons.sports_mma, color: AppColors.primary, size: 28),
                        const SizedBox(height: 8),
                        Text(
                          '${user.winCount}W - ${user.loseCount}L',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const Text(
                          'Trận đấu',
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
                        const Icon(Icons.local_fire_department, color: AppColors.error, size: 28),
                        const SizedBox(height: 8),
                        Text(
                          '${user.streak}',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const Text(
                          'Streak',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // More Stats
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '📈 Thống kê tổng quan',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _StatRow(
                    icon: Icons.fitness_center,
                    label: 'Tổng bài tập',
                    value: '${user.stats.totalWorkouts}',
                    color: AppColors.primary,
                  ),
                  const SizedBox(height: 12),
                  _StatRow(
                    icon: Icons.timer,
                    label: 'Tổng thời gian',
                    value: '${user.stats.totalMinutes} phút',
                    color: AppColors.secondary,
                  ),
                  const SizedBox(height: 12),
                  _StatRow(
                    icon: Icons.local_fire_department,
                    label: 'Calories đốt',
                    value: '${user.stats.totalCalories}',
                    color: AppColors.error,
                  ),
                  const SizedBox(height: 12),
                  _StatRow(
                    icon: Icons.favorite,
                    label: 'Nhịp tim TB',
                    value: '${user.stats.avgHeartRate} BPM',
                    color: AppColors.success,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Badges
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '🏅 Huy hiệu',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: user.badges.map((badge) {
                      final color = Color(int.parse(badge.color.replaceAll('#', '0xFF')));
                      return Container(
                        width: 80,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: badge.earned 
                              ? color.withValues(alpha: 0.2)
                              : AppColors.surfaceLight,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: badge.earned ? color : AppColors.textMuted,
                            width: 1,
                          ),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              _getBadgeIcon(badge.icon),
                              color: badge.earned ? color : AppColors.textMuted,
                              size: 24,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              badge.name,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                color: badge.earned ? AppColors.textPrimary : AppColors.textMuted,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Menu Items
            AppCard(
              padding: EdgeInsets.zero,
              child: Column(
                children: [
                  _MenuItem(
                    icon: Icons.military_tech,
                    title: 'Battle Pass',
                    subtitle: 'Mùa #7 — Cyber Sprint',
                    onTap: () {},
                  ),
                  const Divider(color: AppColors.surfaceLight, height: 1),
                  _MenuItem(
                    icon: Icons.card_giftcard,
                    title: 'Voucher của tôi',
                    subtitle: '3 voucher đang có',
                    onTap: () {},
                  ),
                  const Divider(color: AppColors.surfaceLight, height: 1),
                  _MenuItem(
                    icon: Icons.shopping_bag,
                    title: 'Cửa hàng',
                    subtitle: 'Skin & Items',
                    onTap: () {},
                  ),
                  const Divider(color: AppColors.surfaceLight, height: 1),
                  _MenuItem(
                    icon: Icons.settings,
                    title: 'Cài đặt',
                    subtitle: 'Tài khoản & Thông báo',
                    onTap: () {},
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Currency Section
            Row(
              children: [
                Expanded(
                  child: AppCard(
                    child: Row(
                      children: [
                        const Icon(Icons.diamond, color: Color(0xFFFF4757), size: 24),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Ruby',
                              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                            Text(
                              '${user.ruby}',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                        const Spacer(),
                        GradientButton(
                          text: 'Mua',
                          gradient: AppColors.rubyGradient,
                          onPressed: () {},
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  IconData _getBadgeIcon(String iconName) {
    switch (iconName) {
      case 'shield':
        return Icons.shield;
      case 'flame':
        return Icons.local_fire_department;
      case 'trophy':
        return Icons.emoji_events;
      case 'heart-pulse':
        return Icons.favorite;
      case 'users':
        return Icons.people;
      case 'crown':
        return Icons.workspace_premium;
      default:
        return Icons.star;
    }
  }
}

class _StatRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _MenuItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}
