import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers.dart';
import '../../core/theme/app_theme.dart';

class BottomNavBar extends ConsumerWidget {
  const BottomNavBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIndex = ref.watch(selectedIndexProvider);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _NavItem(
                icon: Icons.home_rounded,
                label: 'Trang chủ',
                isSelected: currentIndex == 0,
                onTap: () {
                  ref.read(selectedIndexProvider.notifier).state = 0;
                  context.go('/home');
                },
              ),
              _NavItem(
                icon: Icons.emoji_events_rounded,
                label: 'Battle',
                isSelected: currentIndex == 1,
                onTap: () {
                  ref.read(selectedIndexProvider.notifier).state = 1;
                  context.go('/battle');
                },
              ),
              _NavItem(
                icon: Icons.flag_rounded,
                label: 'Thử thách',
                isSelected: currentIndex == 2,
                onTap: () {
                  ref.read(selectedIndexProvider.notifier).state = 2;
                  context.go('/challenge');
                },
              ),
              _NavItem(
                icon: Icons.leaderboard_rounded,
                label: 'BXH',
                isSelected: currentIndex == 3,
                onTap: () {
                  ref.read(selectedIndexProvider.notifier).state = 3;
                  context.go('/ranking');
                },
              ),
              _NavItem(
                icon: Icons.person_rounded,
                label: 'Cá nhân',
                isSelected: currentIndex == 4,
                onTap: () {
                  ref.read(selectedIndexProvider.notifier).state = 4;
                  context.go('/profile');
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withValues(alpha: 0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isSelected ? AppColors.primary : AppColors.textMuted,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                color: isSelected ? AppColors.primary : AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
