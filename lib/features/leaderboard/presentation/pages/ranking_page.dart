import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/models.dart';
import '../../../../core/providers.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/common_widgets.dart';

class RankingPage extends ConsumerStatefulWidget {
  const RankingPage({super.key});

  @override
  ConsumerState<RankingPage> createState() => _RankingPageState();
}

class _RankingPageState extends ConsumerState<RankingPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        final user = ref.read(userProvider);
        final filter = _tabController.index == 0
            ? 'all_time'
            : _tabController.index == 1
                ? 'weekly'
                : 'today';
        ref.read(leaderboardProvider.notifier).setFilter(filter, user);
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final leaderboard = ref.watch(leaderboardProvider);
    final user = ref.watch(userProvider);
    final liveTicker = ref.watch(liveTickerProvider);

    // Compute user's dynamic rank
    final myEntryIndex = leaderboard.indexWhere((e) => e.isCurrentUser == true || e.oderId == user.id);
    final myRank = myEntryIndex >= 0 ? leaderboard[myEntryIndex].rank : user.rank;

    return SafeArea(
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                const Text(
                  '📊 Bảng Xếp Hạng Live',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withValues(alpha: 0.3),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.emoji_events, color: Colors.white, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        'Hạng #$myRank',
                        style: const TextStyle(
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Real-time Live Ticker Bar
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF141828),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF2ED573).withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2ED573).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text('LIVE', style: TextStyle(color: Color(0xFF2ED573), fontSize: 9, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: liveTicker.when(
                    data: (text) => Text(
                      text,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500),
                    ),
                    loading: () => const Text('Đang kết nối dữ liệu trực tiếp...', style: TextStyle(color: Colors.white38, fontSize: 11)),
                    error: (_, __) => const Text('Cộng đồng Fitness Battle đang sôi động', style: TextStyle(color: Colors.white38, fontSize: 11)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 6),

          // Filter Tabs (Toàn mùa / Tuần này / Hôm nay)
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: TabBar(
              controller: _tabController,
              indicator: const BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.all(Radius.circular(10)),
              ),
              indicatorSize: TabBarIndicatorSize.tab,
              dividerColor: Colors.transparent,
              labelColor: Colors.white,
              unselectedLabelColor: AppColors.textMuted,
              labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
              tabs: const [
                Tab(text: '🏆 Toàn mùa'),
                Tab(text: '⚡ Tuần này'),
                Tab(text: '🔥 Hôm nay'),
              ],
            ),
          ),

          // Podium Top 3 (if available)
          if (leaderboard.length >= 3)
            Container(
              height: 200,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  // 2nd Place
                  _TopThreeCard(
                    entry: leaderboard[1],
                    rank: 2,
                    height: 65,
                    color: const Color(0xFFC0C0C0),
                  ),
                  const SizedBox(width: 8),
                  // 1st Place
                  _TopThreeCard(
                    entry: leaderboard[0],
                    rank: 1,
                    height: 90,
                    color: const Color(0xFFFFD700),
                  ),
                  const SizedBox(width: 8),
                  // 3rd Place
                  _TopThreeCard(
                    entry: leaderboard[2],
                    rank: 3,
                    height: 48,
                    color: const Color(0xFFCD7F32),
                  ),
                ],
              ),
            ),

          // Rest of Leaderboard List
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                ref.read(leaderboardProvider.notifier).setFilter('all_time', user);
              },
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                itemCount: leaderboard.length > 3 ? leaderboard.length - 3 : leaderboard.length,
                itemBuilder: (context, index) {
                  final entry = leaderboard.length > 3 ? leaderboard[index + 3] : leaderboard[index];
                  final isMe = entry.isCurrentUser == true || entry.oderId == user.id;

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: AppCard(
                      color: isMe 
                          ? AppColors.primary.withValues(alpha: 0.18)
                          : AppColors.surface,
                      child: Row(
                        children: [
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: isMe
                                  ? AppColors.primary
                                  : AppColors.surfaceLight,
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                '${entry.rank}',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: isMe
                                      ? Colors.white
                                      : AppColors.textSecondary,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          AvatarWidget(
                            avatarUrl: entry.avatar,
                            size: 40,
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
                                    Flexible(
                                      child: Text(
                                        entry.oderName,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                          color: isMe 
                                              ? AppColors.primary
                                              : AppColors.textPrimary,
                                        ),
                                      ),
                                    ),
                                    if (entry.isVIP == true) ...[
                                      const SizedBox(width: 4),
                                      const Icon(Icons.star, color: Color(0xFFFFD700), size: 14),
                                    ],
                                    if (isMe) ...[
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppColors.primary,
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: const Text('BẠN', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Cấp độ Lv.${entry.level}',
                                  style: const TextStyle(
                                    fontSize: 11,
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
                                  fontSize: 16,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const Text(
                                'pts',
                                style: TextStyle(
                                  fontSize: 10,
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
          ),
        ],
      ),
    );
  }
}

class _TopThreeCard extends StatelessWidget {
  final LeaderboardEntry entry;
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
    return Expanded(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          AvatarWidget(
            avatarUrl: entry.avatar,
            size: rank == 1 ? 52 : 42,
            showBorder: true,
            borderColor: color,
          ),
          const SizedBox(height: 4),
          Text(
            entry.oderName,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          Text(
            '${entry.points} pts',
            style: TextStyle(
              fontSize: 10,
              color: color,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 6),
          Container(
            height: height,
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [color.withValues(alpha: 0.8), color.withValues(alpha: 0.3)],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
              border: Border.all(color: color.withValues(alpha: 0.6)),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  _getRankEmoji(rank),
                  style: const TextStyle(fontSize: 20),
                ),
                Text(
                  '#$rank',
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 12,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
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
