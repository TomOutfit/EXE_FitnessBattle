import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../../../../core/models_exercise.dart';

class ExerciseLeaderboardPage extends ConsumerStatefulWidget {
  const ExerciseLeaderboardPage({super.key});

  @override
  ConsumerState<ExerciseLeaderboardPage> createState() => _ExerciseLeaderboardPageState();
}

class _ExerciseLeaderboardPageState extends ConsumerState<ExerciseLeaderboardPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          // Header
          const Padding(
            padding: EdgeInsets.all(16),
            child: Row(
              children: [
                Text(
                  '🏆 BXH Tập Luyện',
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
            child: TabBar(
              controller: _tabController,
              indicator: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(10),
              ),
              indicatorSize: TabBarIndicatorSize.tab,
              dividerColor: Colors.transparent,
              labelColor: Colors.white,
              unselectedLabelColor: AppColors.textMuted,
              labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              tabs: const [
                Tab(text: '💪 Hít Đất'),
                Tab(text: '🏋️ Kéo Xà'),
                Tab(text: '🚶 Đi Bộ'),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _LeaderboardTab(
                  type: ExerciseTypeEnum.pushup,
                  leaderboard: ref.watch(pushupLeaderboardProvider),
                  icon: '💪',
                  color: const Color(0xFFFF6b35),
                ),
                _LeaderboardTab(
                  type: ExerciseTypeEnum.pullup,
                  leaderboard: ref.watch(pullupLeaderboardProvider),
                  icon: '🏋️',
                  color: const Color(0xFF5352ed),
                ),
                _LeaderboardTab(
                  type: ExerciseTypeEnum.walking,
                  leaderboard: ref.watch(walkingLeaderboardProvider),
                  icon: '🚶',
                  color: const Color(0xFF2ed573),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _LeaderboardTab extends StatelessWidget {
  final ExerciseTypeEnum type;
  final List<ExerciseLeaderboardEntry> leaderboard;
  final String icon;
  final Color color;

  const _LeaderboardTab({
    required this.type,
    required this.leaderboard,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    // Get Top 5
    final top5 = leaderboard.take(5).toList();
    
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      children: [
        // Header Info
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [color, color.withValues(alpha: 0.7)],
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              Text(icon, style: const TextStyle(fontSize: 40)),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Top 5 ${type.name}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      'Kỷ lục cao nhất mọi thời đại',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white.withValues(alpha: 0.8),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Top 5 Podium
        Container(
          height: 220,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // 2nd Place
              if (top5.length > 1)
                _TopPodiumCard(
                  entry: top5[1],
                  rank: 2,
                  height: 70,
                  color: const Color(0xFFC0C0C0),
                ),
              const SizedBox(width: 8),
              // 1st Place
              if (top5.isNotEmpty)
                _TopPodiumCard(
                  entry: top5[0],
                  rank: 1,
                  height: 95,
                  color: const Color(0xFFFFD700),
                ),
              const SizedBox(width: 8),
              // 3rd Place
              if (top5.length > 2)
                _TopPodiumCard(
                  entry: top5[2],
                  rank: 3,
                  height: 50,
                  color: const Color(0xFFCD7F32),
                ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Rest of List
        const Text(
          '📊 Bảng xếp hạng đầy đủ',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),

        ...leaderboard.map((entry) => Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: _LeaderboardEntryCard(entry: entry, color: color),
        )),
      ],
    );
  }
}

class _TopPodiumCard extends StatelessWidget {
  final ExerciseLeaderboardEntry entry;
  final int rank;
  final double height;
  final Color color;

  const _TopPodiumCard({
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
        // Avatar
        AvatarWidget(
          avatarUrl: entry.avatar,
          size: 50,
          showBorder: true,
          borderColor: color,
        ),
        const SizedBox(height: 4),
        // Name
        SizedBox(
          width: 70,
          child: Text(
            entry.oderName,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        // Score
        Text(
          '${entry.bestScore}',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        // Podium
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
                style: const TextStyle(fontSize: 24),
              ),
              Text(
                '#$rank',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: color.computeLuminance() > 0.5 ? Colors.black : Colors.white,
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

class _LeaderboardEntryCard extends StatelessWidget {
  final ExerciseLeaderboardEntry entry;
  final Color color;

  const _LeaderboardEntryCard({
    required this.entry,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: entry.isCurrentUser
            ? AppColors.primary.withValues(alpha: 0.15)
            : AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: entry.isCurrentUser
            ? Border.all(color: AppColors.primary, width: 2)
            : null,
      ),
      child: Row(
        children: [
          // Rank
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: entry.rank <= 3
                  ? _getRankColor(entry.rank)
                  : (entry.isCurrentUser ? AppColors.primary : AppColors.surfaceLight),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: entry.rank <= 3
                  ? Text(_getRankEmoji(entry.rank), style: const TextStyle(fontSize: 18))
                  : Text(
                      '${entry.rank}',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: entry.isCurrentUser ? Colors.white : AppColors.textSecondary,
                      ),
                    ),
            ),
          ),
          const SizedBox(width: 12),
          // Avatar
          AvatarWidget(
            avatarUrl: entry.avatar,
            size: 44,
            showBorder: entry.isCurrentUser,
            borderColor: AppColors.primary,
          ),
          const SizedBox(width: 12),
          // Info
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
                        color: entry.isCurrentUser ? AppColors.primary : AppColors.textPrimary,
                      ),
                    ),
                    if (entry.isCurrentUser) ...[
                      const SizedBox(width: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Bạn',
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
                  '${entry.totalSessions} buổi tập • ${entry.avgAccuracy.toStringAsFixed(0)}% chính xác',
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          // Score
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${entry.bestScore}',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              Text(
                _getUnitLabel(entry.type),
                style: const TextStyle(
                  fontSize: 10,
                  color: AppColors.textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _getRankColor(int rank) {
    switch (rank) {
      case 1:
        return const Color(0xFFFFD700);
      case 2:
        return const Color(0xFFC0C0C0);
      case 3:
        return const Color(0xFFCD7F32);
      default:
        return AppColors.surfaceLight;
    }
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

  String _getUnitLabel(ExerciseTypeEnum type) {
    switch (type) {
      case ExerciseTypeEnum.pushup:
        return 'lần';
      case ExerciseTypeEnum.pullup:
        return 'lần';
      case ExerciseTypeEnum.walking:
        return 'bước';
      default:
        return '';
    }
  }
}
