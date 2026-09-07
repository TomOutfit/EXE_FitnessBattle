import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/common_widgets.dart';

class BattlePage extends ConsumerWidget {
  const BattlePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final battles = ref.watch(battlesProvider);
    final premiumArenas = ref.watch(premiumArenasProvider);
    final user = ref.watch(userProvider);

    return DefaultTabController(
      length: 3,
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const Text(
                    '⚔️ Battle Arena',
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
                        const Icon(Icons.bolt, color: AppColors.secondary, size: 18),
                        const SizedBox(width: 4),
                        Text(
                          '${user.stamina}',
                          style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary),
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
                  Tab(text: 'Trận đấu'),
                  Tab(text: 'Đấu trường'),
                  Tab(text: 'Lịch sử'),
                ],
              ),
            ),

            // Tab Views
            Expanded(
              child: TabBarView(
                children: [
                  // Battles Tab
                  _BattlesTab(battles: battles),
                  
                  // Premium Arenas Tab
                  _PremiumArenasTab(arenas: premiumArenas),
                  
                  // History Tab
                  _HistoryTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BattlesTab extends StatelessWidget {
  final List battles;

  const _BattlesTab({required this.battles});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Quick Battle Section
        const Text(
          '⚡ Tạo trận nhanh',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: GradientButton(
                text: 'Ranked',
                icon: Icons.military_tech,
                gradient: AppColors.primaryGradient,
                onPressed: () {},
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: GradientButton(
                text: 'Giao hữu',
                icon: Icons.handshake,
                gradient: AppColors.secondary.withAlpha(200) as LinearGradient,
                onPressed: () {},
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Available Battles
        const Text(
          '🎮 Phòng chờ',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        ...battles.map((battle) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: AppCard(
            onTap: () {},
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getBattleTypeColor(battle.type.name).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        _getBattleTypeName(battle.type.name),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: _getBattleTypeColor(battle.type.name),
                        ),
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: battle.status.name == 'active' 
                            ? AppColors.success.withValues(alpha: 0.2)
                            : AppColors.warning.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        battle.status.name == 'active' ? 'ĐANG CHƠI' : 'CHỜ',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: battle.status.name == 'active' 
                              ? AppColors.success
                              : AppColors.warning,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  battle.title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '🏃 ${battle.exerciseType} • ⏱️ ${battle.duration} phút',
                  style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    AvatarWidget(avatarUrl: battle.players[0].avatar, size: 32),
                    const SizedBox(width: 8),
                    Text(
                      battle.players[0].oderName,
                      style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'VS',
                      style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textMuted),
                    ),
                    const SizedBox(width: 12),
                    AvatarWidget(avatarUrl: battle.players[1].avatar, size: 32),
                    const SizedBox(width: 8),
                    Text(
                      battle.players[1].oderName,
                      style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        '+${battle.reward.xp} XP • +${battle.reward.coins} Coins',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    if (battle.status.name == 'waiting')
                      const GradientButton(
                        text: 'Tham gia',
                        gradient: AppColors.primaryGradient,
                      ),
                  ],
                ),
              ],
            ),
          ),
        )),
      ],
    );
  }

  Color _getBattleTypeColor(String type) {
    switch (type) {
      case 'ranked':
        return AppColors.primary;
      case 'friendly':
        return AppColors.secondary;
      case 'challenge':
        return AppColors.warning;
      default:
        return AppColors.textMuted;
    }
  }

  String _getBattleTypeName(String type) {
    switch (type) {
      case 'ranked':
        return 'RANKED';
      case 'friendly':
        return 'GIAO HỮU';
      case 'challenge':
        return 'THÁCH ĐẤU';
      default:
        return type.toUpperCase();
    }
  }
}

class _PremiumArenasTab extends StatelessWidget {
  final List arenas;

  const _PremiumArenasTab({required this.arenas});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          '💎 Đấu trường Premium',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        ...arenas.map((arena) => Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: AppCard(
            gradient: arena.status.name == 'live' 
                ? AppColors.battleGradient 
                : null,
            onTap: () {},
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text(
                      '🏆',
                      style: TextStyle(fontSize: 24),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            arena.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            arena.description,
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: _getArenaStatusColor(arena.status.name).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        _getArenaStatusName(arena.status.name),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: _getArenaStatusColor(arena.status.name),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Phần thưởng',
                          style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                        ),
                        Text(
                          '${arena.prizePool} Ruby',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.accent,
                          ),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text(
                          'Phí vào cửa',
                          style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                        ),
                        Row(
                          children: [
                            const Icon(Icons.diamond, color: Color(0xFFFF4757), size: 16),
                            const SizedBox(width: 4),
                            Text(
                              '${arena.entryRuby}',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Icon(Icons.people, size: 14, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      '${arena.participants}/${arena.maxParticipants}',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                    const Spacer(),
                    const Icon(Icons.timer, size: 14, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      '${arena.duration} phút',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ],
            ),
          ),
        )),
      ],
    );
  }

  Color _getArenaStatusColor(String status) {
    switch (status) {
      case 'open':
        return AppColors.success;
      case 'countdown':
        return AppColors.warning;
      case 'live':
        return AppColors.error;
      default:
        return AppColors.textMuted;
    }
  }

  String _getArenaStatusName(String status) {
    switch (status) {
      case 'open':
        return 'MỞ';
      case 'countdown':
        return 'SẮP BẮT ĐẦU';
      case 'live':
        return 'ĐANG DIỄN RA';
      default:
        return status.toUpperCase();
    }
  }
}

class _HistoryTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        AppCard(
          child: Column(
            children: [
              const Icon(Icons.history, size: 48, color: AppColors.textMuted),
              const SizedBox(height: 12),
              const Text(
                'Chưa có trận đấu nào',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Tham gia trận đấu để xem lịch sử tại đây',
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
