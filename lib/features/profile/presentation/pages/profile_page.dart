import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/models.dart';
import '../../../../core/providers.dart';
import '../../../../core/services/app_database.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../../../../core/widgets/database_manager_dialog.dart';

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
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                const Icon(Icons.email_outlined, size: 13, color: Colors.white70),
                                const SizedBox(width: 4),
                                Text(
                                  user.email ?? 'demo@fitnessbattle.vn',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: Colors.white70,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                const Icon(Icons.calendar_today, size: 13, color: Colors.white70),
                                const SizedBox(width: 4),
                                Text(
                                  'Tham gia: ${user.joinDate}',
                                  style: const TextStyle(
                                    fontSize: 11,
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
                    onTap: () => context.go('/shop'),
                  ),
                  const Divider(color: AppColors.surfaceLight, height: 1),
                  _MenuItem(
                    icon: Icons.workspace_premium,
                    title: 'Membership',
                    subtitle: 'Nâng cấp tài khoản',
                    onTap: () => context.go('/membership'),
                  ),
                  const Divider(color: AppColors.surfaceLight, height: 1),
                  _MenuItem(
                    icon: Icons.storage,
                    title: 'Quản lý Cơ Sở Dữ Liệu',
                    subtitle: 'Xem bảng, chỉnh sửa & Đặt lại CSDL',
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (ctx) => const DatabaseManagerDialog(),
                      );
                    },
                  ),
                  const Divider(height: 1, color: AppColors.border),
                  _MenuItem(
                    icon: Icons.switch_account_outlined,
                    title: 'Chuyển Đổi Tài Khoản',
                    subtitle: 'Chuyển nhanh giữa Demo & VIP Pro',
                    onTap: () => _showSwitchAccountDialog(context, ref),
                  ),
                  const Divider(height: 1, color: AppColors.border),
                  _MenuItem(
                    icon: Icons.logout,
                    title: 'Đăng Xuất',
                    subtitle: 'Thoát khỏi phiên đăng nhập hiện tại',
                    iconColor: AppColors.error,
                    textColor: AppColors.error,
                    onTap: () => _handleLogout(context, ref),
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

  void _showSwitchAccountDialog(BuildContext context, WidgetRef ref) {
    final accounts = AppDatabase.instance.getAllAccounts();
    final currentUser = ref.read(userProvider);

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.switch_account, color: AppColors.primary, size: 24),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Chuyển Đổi Tài Khoản',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          'Chọn tài khoản đã lưu trong CSDL',
                          style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: accounts.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final acc = accounts[index];
                    final isCurrent = acc.id == currentUser.id;

                    return InkWell(
                      onTap: isCurrent
                          ? null
                          : () async {
                              final updatedUser = await AppDatabase.instance.switchAccount(acc.id);
                              ref.read(userProvider.notifier).updateUser(updatedUser);
                              if (context.mounted) {
                                Navigator.pop(ctx);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Row(
                                      children: [
                                        const Icon(Icons.check_circle, color: AppColors.success),
                                        const SizedBox(width: 10),
                                        Text('Đã chuyển sang: ${acc.name}'),
                                      ],
                                    ),
                                    backgroundColor: AppColors.surface,
                                  ),
                                );
                              }
                            },
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isCurrent
                              ? AppColors.primary.withValues(alpha: 0.12)
                              : AppColors.surfaceLight,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isCurrent ? AppColors.primary : AppColors.border,
                            width: isCurrent ? 1.5 : 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            AvatarWidget(
                              avatarUrl: acc.isVIP
                                  ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                                  : currentUser.avatar,
                              size: 46,
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        acc.name,
                                        style: const TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.bold,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                      if (acc.isVIP) ...[
                                        const SizedBox(width: 6),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: AppColors.accent.withValues(alpha: 0.2),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: const Text(
                                            'VIP',
                                            style: TextStyle(
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                              color: AppColors.accent,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    '${acc.email} • ${acc.isVIP ? "VIP Pro (Lv.25)" : "Standard (Lv.15)"}',
                                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                  ),
                                ],
                              ),
                            ),
                            if (isCurrent)
                              const Icon(Icons.check_circle, color: AppColors.primary, size: 22)
                            else
                              const Icon(Icons.login, color: AppColors.textMuted, size: 20),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.pop(ctx);
                    context.push('/auth');
                  },
                  icon: const Icon(Icons.person_add_outlined, size: 18),
                  label: const Text('Thêm tài khoản / Đăng nhập khác'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _handleLogout(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.logout, color: AppColors.error),
            SizedBox(width: 10),
            Text('Đăng Xuất', style: TextStyle(color: AppColors.textPrimary)),
          ],
        ),
        content: const Text(
          'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản hiện tại?',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              AppDatabase.instance.logout();
              context.go('/auth');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Đăng Xuất'),
          ),
        ],
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
  final Color? iconColor;
  final Color? textColor;

  const _MenuItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.iconColor,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveIconColor = iconColor ?? AppColors.primary;
    final effectiveTextColor = textColor ?? AppColors.textPrimary;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: effectiveIconColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: effectiveIconColor),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: effectiveTextColor,
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
      ),
    );
  }
}
