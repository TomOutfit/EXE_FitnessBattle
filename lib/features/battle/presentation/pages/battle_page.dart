import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/models.dart';
import '../../../../core/models_exercise.dart';
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
                    '⚔️ Đấu Trường',
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

class _BattlesTab extends ConsumerWidget {
  final List<Battle> battles;

  const _BattlesTab({required this.battles});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Start Battle Button - Opens camera battle screen
        Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            gradient: AppColors.battleGradient,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.4),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () => _showBattleStartDialog(context, ref),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.sports_mma, color: Colors.white, size: 32),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '⚔️ BẮT ĐẦU ĐẤU CAMERA',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Mở camera 2 người chơi',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.white.withValues(alpha: 0.8),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.arrow_forward_ios, color: Colors.white, size: 20),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),

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
                text: 'Xếp hạng',
                icon: Icons.military_tech,
                gradient: AppColors.primaryGradient,
                onPressed: () => _showBattleStartDialog(context, ref),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: GradientButton(
                text: 'Giao hữu',
                icon: Icons.handshake,
                gradient: const LinearGradient(
                  colors: [Color(0xFF5352ED), Color(0xFF7070FF)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                onPressed: () => _showBattleStartDialog(context, ref),
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
                        color: _getBattleTypeColor(battle.type).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        _getBattleTypeName(battle.type),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: _getBattleTypeColor(battle.type),
                        ),
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: battle.status == BattleStatus.active
                            ? AppColors.success.withValues(alpha: 0.2)
                            : AppColors.warning.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        battle.status == BattleStatus.active ? 'ĐANG CHƠI' : 'CHỜ',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: battle.status == BattleStatus.active 
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
                    if (battle.status == BattleStatus.waiting)
                      GradientButton(
                        text: 'Tham gia',
                        gradient: AppColors.primaryGradient,
                        onPressed: () {
                          final user = ref.read(userProvider);
                          ref.read(battlesProvider.notifier).joinBattle(battle.id, user);
                          context.push('/battle-camera?type=pushup');
                        },
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

   void _showBattleStartDialog(BuildContext context, WidgetRef ref) {
    final user = ref.read(userProvider);
    if (user.stamina < 10) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: AppColors.surface,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(Icons.bolt, color: AppColors.warning, size: 28),
              SizedBox(width: 8),
              Text('THIẾU THỂ LỰC', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
            ],
          ),
          content: Text(
            'Cần tối thiểu 10 Thể Lực (⚡) để vào trận đấu. Hiện tại bạn còn ${user.stamina} ⚡.\nHãy nghỉ ngơi hoặc nạp thêm tại Cửa Hàng!',
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('ĐÓNG', style: TextStyle(color: AppColors.textMuted)),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                context.push('/shop');
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
              child: const Text('ĐẾN SHOP'),
            ),
          ],
        ),
      );
      return;
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _BattleStartSheet(
        onStartBattle: (exerciseType) {
          Navigator.pop(context);
          context.push('/battle-camera?type=${exerciseType.id}');
        },
      ),
    );
  }

  Color _getBattleTypeColor(BattleType type) {
    switch (type) {
      case BattleType.ranked:
        return AppColors.primary;
      case BattleType.friendly:
        return AppColors.secondary;
      case BattleType.challenge:
        return AppColors.warning;
      default:
        return AppColors.textMuted;
    }
  }

  String _getBattleTypeName(BattleType type) {
    switch (type) {
      case BattleType.ranked:
        return 'XẾP HẠNG';
      case BattleType.friendly:
        return 'GIAO HỮU';
      case BattleType.challenge:
        return 'THÁCH ĐẤU';
      case BattleType.ruby_stake:
        return 'CƯỢC RUBY';
      case BattleType.titan:
        return 'TITAN';
      case BattleType.brand_spot:
        return 'ĐỐI TÁC';
    }
  }
}

class _HistoryTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyList = ref.watch(battleHistoryProvider);

    if (historyList.isEmpty) {
      return ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          AppCard(
            child: Column(
              children: [
                Icon(Icons.history, size: 48, color: AppColors.textMuted),
                SizedBox(height: 12),
                Text(
                  'Chưa có trận đấu nào',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                SizedBox(height: 4),
                Text(
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

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: historyList.length,
      itemBuilder: (context, index) {
        final item = historyList[index];
        final isWin = item.result == 'win' || item.result == 'opp_cheat';
        final isDraw = item.result == 'draw';
        final resultColor = isWin ? const Color(0xFF2ED573) : isDraw ? const Color(0xFFFFA502) : const Color(0xFFFF4757);
        final resultText = isWin ? 'THẮNG' : isDraw ? 'HÒA' : 'THUA';

        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '⚔️ ${item.battleType}',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      item.exerciseName,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: resultColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: resultColor.withValues(alpha: 0.4)),
                      ),
                      child: Text(
                        resultText,
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: resultColor),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 18,
                            backgroundImage: NetworkImage(item.opponentAvatar),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Đối thủ', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                                Text(
                                  item.opponentName,
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceLight,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Text(
                            '${item.myScore}',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: resultColor),
                          ),
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 6),
                            child: Text('-', style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.bold)),
                          ),
                          Text(
                            '${item.opponentScore}',
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.bolt, color: AppColors.secondary, size: 14),
                        const SizedBox(width: 2),
                        Text('+${item.xpGained} XP', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                        const SizedBox(width: 12),
                        const Icon(Icons.military_tech, color: Color(0xFF2ED573), size: 14),
                        const SizedBox(width: 2),
                        Text('+${item.pointsGained} Rank', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                      ],
                    ),
                    Text(
                      '${item.timestamp.hour.toString().padLeft(2, '0')}:${item.timestamp.minute.toString().padLeft(2, '0')} • ${item.timestamp.day}/${item.timestamp.month}',
                      style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
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
}

class _PremiumArenasTab extends StatelessWidget {
  final List<PremiumArena> arenas;

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
            gradient: arena.status == ArenaStatus.live 
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
                        color: _getArenaStatusColor(arena.status).withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        _getArenaStatusName(arena.status),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: _getArenaStatusColor(arena.status),
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

  Color _getArenaStatusColor(ArenaStatus status) {
    switch (status) {
      case ArenaStatus.open:
        return AppColors.success;
      case ArenaStatus.countdown:
        return AppColors.warning;
      case ArenaStatus.live:
        return AppColors.error;
      case ArenaStatus.finished:
        return AppColors.textMuted;
    }
  }

  String _getArenaStatusName(ArenaStatus status) {
    switch (status) {
      case ArenaStatus.open:
        return 'MỞ';
      case ArenaStatus.countdown:
        return 'SẮP BẮT ĐẦU';
      case ArenaStatus.live:
        return 'ĐANG DIỄN RA';
      case ArenaStatus.finished:
        return 'KẾT THÚC';
    }
  }
}

/// Bottom sheet for selecting exercise type before starting battle
class _BattleStartSheet extends StatelessWidget {
  final Function(ExerciseTypeEnum) onStartBattle;

  const _BattleStartSheet({required this.onStartBattle});

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      decoration: const BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle bar
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.textMuted,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              
              // Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                child: Column(
                  children: [
                    const Text(
                      '⚔️ CHỌN BÀI TẬP ĐẤU',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Chọn bài tập để bắt đầu trận đấu camera',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              
              // Exercise Options
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    // Push-up Option
                    _ExerciseBattleOption(
                      exerciseType: ExerciseTypeEnum.pushup,
                      description: 'Hít đất • Đối thủ bên phải',
                      gradient: const LinearGradient(
                        colors: [Color(0xFFFF6b35), Color(0xFFFF8E53)],
                      ),
                      onTap: () => onStartBattle(ExerciseTypeEnum.pushup),
                    ),
                    const SizedBox(height: 10),
                    
                    // Pull-up Option
                    _ExerciseBattleOption(
                      exerciseType: ExerciseTypeEnum.pullup,
                      description: 'Kéo xà • Đối thủ bên phải',
                      gradient: const LinearGradient(
                        colors: [Color(0xFF5352ed), Color(0xFF7070FF)],
                      ),
                      onTap: () => onStartBattle(ExerciseTypeEnum.pullup),
                    ),
                    const SizedBox(height: 10),
                    
                    // Squat Option
                    _ExerciseBattleOption(
                      exerciseType: ExerciseTypeEnum.squat,
                      description: 'Squat • Đối thủ bên phải',
                      gradient: const LinearGradient(
                        colors: [Color(0xFFffa502), Color(0xFFFFBE3D)],
                      ),
                      onTap: () => onStartBattle(ExerciseTypeEnum.squat),
                    ),
                  ],
                ),
              ),
              
              // Info section
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.info_outline, color: AppColors.primary, size: 18),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Text(
                        'Camera bên trái là bạn, bên phải là đối thủ.\nKết nối 2 thiết bị để chơi cùng nhau!',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              
              // Cancel button
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text(
                  'Hủy',
                  style: TextStyle(
                    fontSize: 15,
                    color: AppColors.textMuted,
                  ),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }
}

class _ExerciseBattleOption extends StatelessWidget {
  final ExerciseTypeEnum exerciseType;
  final String description;
  final Gradient gradient;
  final VoidCallback onTap;

  const _ExerciseBattleOption({
    required this.exerciseType,
    required this.description,
    required this.gradient,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: (gradient as LinearGradient).colors.first.withValues(alpha: 0.4),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      exerciseType.emoji,
                      style: const TextStyle(fontSize: 28),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        exerciseType.name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        description,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.white.withValues(alpha: 0.8),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.play_arrow, color: Colors.white, size: 24),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
