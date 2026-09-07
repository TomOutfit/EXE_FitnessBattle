import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../../../../core/models_exercise.dart';
import '../../../../core/mock_data_exercise.dart'; // For MembershipPlan

class MembershipPage extends ConsumerWidget {
  const MembershipPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userMembership = ref.watch(userMembershipProvider);
    final plans = ref.watch(membershipPlansProvider);

    return SafeArea(
      child: SingleChildScrollView(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const Text(
                    '👑 Membership',
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
                      color: _getMembershipColor(userMembership.tier).withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      children: [
                        Text(
                          _getMembershipEmoji(userMembership.tier),
                          style: const TextStyle(fontSize: 16),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _getMembershipName(userMembership.tier),
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: _getMembershipColor(userMembership.tier),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Current Membership Status
            if (userMembership.tier != MembershipTier.free)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      _getMembershipColor(userMembership.tier),
                      _getMembershipColor(userMembership.tier).withValues(alpha: 0.7),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
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
                          child: Center(
                            child: Text(
                              _getMembershipEmoji(userMembership.tier),
                              style: const TextStyle(fontSize: 32),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${_getMembershipName(userMembership.tier)} Member',
                                style: const TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              if (userMembership.expiryDate != null)
                                Text(
                                  'Hết hạn: ${_formatDate(userMembership.expiryDate!)}',
                                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _MembershipStat(
                                label: 'Bonus Điểm',
                                value: '+${userMembership.dailyBonusPercent}%',
                                icon: Icons.stars,
                              ),
                              Container(width: 1, height: 30, color: Colors.white24),
                              _MembershipStat(
                                label: 'Giảm Phí',
                                value: '-${userMembership.battleCostReduction}%',
                                icon: Icons.percent,
                              ),
                              Container(width: 1, height: 30, color: Colors.white24),
                              _MembershipStat(
                                label: 'Sync',
                                value: userMembership.unlimitedSync ? '∞' : 'Có',
                                icon: Icons.sync,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )
            else
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.textMuted.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceLight,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Center(
                        child: Text('🌱', style: TextStyle(fontSize: 32)),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Free Member',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const Text(
                            'Nâng cấp để nhận nhiều ưu đãi!',
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),

            // Membership Plans
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  const Text(
                    '📦 Gói Membership',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Plan Cards
            ...plans.map((plan) => _MembershipPlanCard(
              plan: plan,
              isCurrentPlan: plan.tier == userMembership.tier,
              onSelect: () => _showPlanDetails(context, ref, plan),
            )),

            const SizedBox(height: 24),

            // Current Perks
            if (userMembership.tier != MembershipTier.free) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    const Text(
                      '✨ Quyền lợi của bạn',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: userMembership.perks.asMap().entries.map((entry) {
                    final index = entry.key;
                    final perk = entry.value;
                    return Column(
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                color: AppColors.success.withValues(alpha: 0.2),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.check,
                                color: AppColors.success,
                                size: 16,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                perk,
                                style: const TextStyle(
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ),
                          ],
                        ),
                        if (index < userMembership.perks.length - 1)
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 8),
                            child: Divider(color: AppColors.surfaceLight, height: 1),
                          ),
                      ],
                    );
                  }).toList(),
                ),
              ),
            ],

            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Color _getMembershipColor(MembershipTier tier) {
    switch (tier) {
      case MembershipTier.free:
        return AppColors.textMuted;
      case MembershipTier.basic:
        return const Color(0xFF3498db);
      case MembershipTier.premium:
        return const Color(0xFF9b59b6);
      case MembershipTier.vip:
        return const Color(0xFFf39c12);
    }
  }

  String _getMembershipEmoji(MembershipTier tier) {
    switch (tier) {
      case MembershipTier.free:
        return '🌱';
      case MembershipTier.basic:
        return '🥉';
      case MembershipTier.premium:
        return '🥈';
      case MembershipTier.vip:
        return '👑';
    }
  }

  String _getMembershipName(MembershipTier tier) {
    switch (tier) {
      case MembershipTier.free:
        return 'Free';
      case MembershipTier.basic:
        return 'Basic';
      case MembershipTier.premium:
        return 'Premium';
      case MembershipTier.vip:
        return 'VIP';
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  void _showPlanDetails(BuildContext context, WidgetRef ref, MembershipPlan plan) {
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
            Row(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: _getMembershipColor(plan.tier).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Center(
                    child: Text(
                      _getMembershipEmoji(plan.tier),
                      style: const TextStyle(fontSize: 32),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${plan.name} Membership',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        '${plan.durationDays} ngày',
                        style: const TextStyle(color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${plan.priceFormatted}đ',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                    Text(
                      '/${plan.durationDays} ngày',
                      style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Features
            ...plan.features.map((feature) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: AppColors.success, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      feature,
                      style: const TextStyle(color: AppColors.textPrimary),
                    ),
                  ),
                ],
              ),
            )),

            if (plan.notIncluded.isNotEmpty) ...[
              const SizedBox(height: 12),
              ...plan.notIncluded.map((feature) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 6),
                child: Row(
                  children: [
                    const Icon(Icons.cancel_outlined, color: AppColors.textMuted, size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        feature,
                        style: const TextStyle(color: AppColors.textMuted),
                      ),
                    ),
                  ],
                ),
              )),
            ],

            const SizedBox(height: 24),
            GradientButton(
              text: 'MUA NGAY',
              gradient: LinearGradient(
                colors: [
                  _getMembershipColor(plan.tier),
                  _getMembershipColor(plan.tier).withValues(alpha: 0.7),
                ],
              ),
              onPressed: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Đang xử lý thanh toán ${plan.name}...'),
                    backgroundColor: AppColors.primary,
                  ),
                );
              },
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Đóng'),
            ),
          ],
        ),
      ),
    );
  }
}

class _MembershipStat extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _MembershipStat({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 20),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            color: Colors.white70,
          ),
        ),
      ],
    );
  }
}

class _MembershipPlanCard extends StatelessWidget {
  final MembershipPlan plan;
  final bool isCurrentPlan;
  final VoidCallback onSelect;

  const _MembershipPlanCard({
    required this.plan,
    required this.isCurrentPlan,
    required this.onSelect,
  });

  Color _getColor() {
    switch (plan.tier) {
      case MembershipTier.free:
        return AppColors.textMuted;
      case MembershipTier.basic:
        return const Color(0xFF3498db);
      case MembershipTier.premium:
        return const Color(0xFF9b59b6);
      case MembershipTier.vip:
        return const Color(0xFFf39c12);
      default:
        return AppColors.primary;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: GestureDetector(
        onTap: isCurrentPlan ? null : onSelect,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: plan.isPopular
                  ? _getColor()
                  : isCurrentPlan
                      ? AppColors.success
                      : AppColors.surfaceLight,
              width: plan.isPopular || isCurrentPlan ? 2 : 1,
            ),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: _getColor().withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(
                        plan.tier == MembershipTier.basic
                            ? '🥉'
                            : plan.tier == MembershipTier.premium
                                ? '🥈'
                                : '👑',
                        style: const TextStyle(fontSize: 28),
                      ),
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
                              plan.name,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            if (isCurrentPlan) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.success.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  'ĐANG DÙNG',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.success,
                                  ),
                                ),
                              ),
                            ],
                            if (plan.isPopular) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Text(
                                  'PHỔ BIẾN',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                        Text(
                          '${plan.durationDays} ngày',
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '${plan.priceFormatted}đ',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: _getColor(),
                        ),
                      ),
                      Text(
                        '/${plan.durationDays} ngày',
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: plan.features.take(4).map((feature) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      feature,
                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
