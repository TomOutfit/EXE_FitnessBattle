import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/providers.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../../../../core/models_exercise.dart';
import '../../../../core/exercise_library.dart';
import 'exercise_camera_page.dart';
import 'battle_camera_page.dart';
import 'gps_walking_page.dart';

class ExerciseTrackPage extends ConsumerStatefulWidget {
  const ExerciseTrackPage({super.key});

  @override
  ConsumerState<ExerciseTrackPage> createState() => _ExerciseTrackPageState();
}

class _ExerciseTrackPageState extends ConsumerState<ExerciseTrackPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _showFitnessLevelModal(BuildContext context, String currentLevel) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Chọn Trình Độ Thể Lực',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Tự động cân chỉnh bài tập & mục tiêu',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textMuted),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              ...FitnessLevelEnum.values.map((lvl) {
                final isSelected = currentLevel == lvl.id;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: InkWell(
                    onTap: () {
                      ref.read(userProvider.notifier).updateFitnessLevel(lvl.id);
                      ref.read(dailyExerciseGoalsProvider.notifier).updateTargetsForFitnessLevel(lvl.id);
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Row(
                            children: [
                              const Icon(Icons.check_circle, color: AppColors.success),
                              const SizedBox(width: 8),
                              Text('Đã chuyển sang cấp độ: ${lvl.label}'),
                            ],
                          ),
                          backgroundColor: AppColors.surfaceLight,
                        ),
                      );
                    },
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isSelected ? lvl.color.withValues(alpha: 0.15) : AppColors.surfaceLight,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isSelected ? lvl.color : AppColors.border,
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Text(lvl.icon, style: const TextStyle(fontSize: 24)),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  lvl.label,
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                    color: isSelected ? lvl.color : AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  lvl == FitnessLevelEnum.beginner
                                      ? 'Mục tiêu nhẹ nhàng (20 hít đất, 5 kéo xà). AI chấm điểm nới lỏng.'
                                      : lvl == FitnessLevelEnum.intermediate
                                          ? 'Mục tiêu tiêu chuẩn (50 hít đất, 20 kéo xà). Đấu trường chuẩn 90°.'
                                          : 'Mục tiêu cực đại (100 hít đất, 45 kéo xà). Dead Hang & Full ROM.',
                                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          ),
                          if (isSelected)
                            Icon(Icons.check_circle, color: lvl.color, size: 20),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(userProvider);
    final currentLevelEnum = FitnessLevelEnum.fromString(user.fitnessLevel);

    return SafeArea(
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                const Text(
                  '💪 Kho Bài Tập',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.local_fire_department, color: AppColors.error, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        '${user.streak} ngày',
                        style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Fitness Level Banner
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    currentLevelEnum.color.withValues(alpha: 0.18),
                    AppColors.surface,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: currentLevelEnum.color.withValues(alpha: 0.5)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: currentLevelEnum.color,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Center(
                      child: Text(currentLevelEnum.icon, style: const TextStyle(fontSize: 20)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              currentLevelEnum.label,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: Colors.white),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                              decoration: BoxDecoration(
                                color: currentLevelEnum.color.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                currentLevelEnum.badge,
                                style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: currentLevelEnum.color),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Bài tập & Trọng tài AI tự động khớp theo thể trạng',
                          style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () => _showFitnessLevelModal(context, user.fitnessLevel),
                    icon: const Icon(Icons.tune, size: 14),
                    label: const Text('Đổi Cấp', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                    style: TextButton.styleFrom(
                      foregroundColor: currentLevelEnum.color,
                      backgroundColor: AppColors.surfaceLight,
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

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
              labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
              tabs: const [
                Tab(text: '💪 Hít Đất'),
                Tab(text: '🏋️ Kéo Xà'),
                Tab(text: '🚶 Đi Bộ'),
                Tab(text: '🗺️ Lộ Trình'),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _ExerciseCategoryView(type: 'pushup', currentLevel: currentLevelEnum),
                _ExerciseCategoryView(type: 'pullup', currentLevel: currentLevelEnum),
                _WalkingCategoryView(currentLevel: currentLevelEnum),
                const _RoadmapCategoryView(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================
// EXERCISE CATEGORY VIEW (PUSHUP & PULLUP)
// ============================================

class _ExerciseCategoryView extends ConsumerWidget {
  final String type;
  final FitnessLevelEnum currentLevel;

  const _ExerciseCategoryView({required this.type, required this.currentLevel});

  void _showDetailModal(BuildContext context, ExerciseVariationModel item) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => _VariationDetailSheet(item: item),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(userExerciseStatsProvider);
    final dailyGoals = ref.watch(dailyExerciseGoalsProvider);
    final isPushup = type == 'pushup';
    final completed = isPushup ? dailyGoals.pushupCompleted : dailyGoals.pullupCompleted;
    final target = isPushup ? dailyGoals.pushupTarget : dailyGoals.pullupTarget;
    final progress = isPushup ? dailyGoals.pushupProgress : dailyGoals.pullupProgress;
    final color = isPushup ? const Color(0xFFFF6B35) : const Color(0xFF5352ED);

    final variations = ExerciseLibraryData.variations.where((v) => v.type == type).toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Quick Stats Card
        AppCard(
          gradient: LinearGradient(
            colors: isPushup
                ? [const Color(0xFFFF6B35), const Color(0xFFFF8E53)]
                : [const Color(0xFF5352ED), const Color(0xFF7070FF)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Center(
                      child: Text(isPushup ? '💪' : '🏋️', style: const TextStyle(fontSize: 26)),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isPushup ? 'Hít Đất Hàng Ngày' : 'Kéo Xà Hàng Ngày',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        Text(
                          'Mục tiêu cấp độ ${currentLevel.label}: $target cái',
                          style: const TextStyle(color: Colors.white70, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('$completed/$target', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
                      const Text('Đã hoàn thành', style: TextStyle(fontSize: 10, color: Colors.white70)),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ProgressBar(progress: progress, color: Colors.white, height: 8),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('🔥 Đốt ~${(completed * (isPushup ? 0.5 : 1.2)).round()} kcal', style: const TextStyle(fontSize: 11.5, color: Colors.white70)),
                  Text('🏆 Kỷ lục: ${isPushup ? stats.bestPushupCount : stats.bestPullupCount} cái', style: const TextStyle(fontSize: 11.5, color: Colors.white70)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Main Camera Button
        GradientButton(
          text: 'BẮT ĐẦU TẬP (CAMERA AI VISION)',
          icon: Icons.play_arrow,
          gradient: LinearGradient(
            colors: isPushup
                ? [const Color(0xFFFF6B35), const Color(0xFFFF8E53)]
                : [const Color(0xFF5352ED), const Color(0xFF7070FF)],
          ),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ExerciseCameraPage(
                  exerciseType: isPushup ? ExerciseTypeEnum.pushup : ExerciseTypeEnum.pullup,
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 18),

        // Section Title: Variations
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '📚 Danh Sách Biến Thể (${variations.length})',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const Text(
              'Chạm để xem form AI',
              style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Variation Cards
        ...variations.map((item) {
          final isCurrent = item.level == currentLevel;

          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: AppCard(
              onTap: () => _showDetailModal(context, item),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: item.level.color.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: item.level.color.withValues(alpha: 0.4)),
                        ),
                        child: Center(
                          child: Text(item.icon, style: const TextStyle(fontSize: 22)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  item.vietnameseName,
                                  style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                                ),
                                if (isCurrent) ...[
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                    decoration: BoxDecoration(
                                      color: item.level.color.withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      'Phù hợp bạn',
                                      style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: item.level.color),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${item.name} • ${item.badge}',
                              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      Row(
                        children: List.generate(5, (s) => Icon(
                          Icons.star,
                          size: 13,
                          color: s < item.difficultyStars ? const Color(0xFFFFD700) : Colors.white12,
                        )),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    item.description,
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      _Chip(label: '🎯 ${item.targetRepsPerSet}', color: const Color(0xFFA29BFE)),
                      _Chip(label: '⚡ AI: ${item.aiTargetAngle}', color: const Color(0xFF2ED573)),
                      _Chip(label: '💪 ${item.targetMuscle.split(',')[0]}', color: const Color(0xFFFF8E53)),
                    ],
                  ),
                ],
              ),
            ),
          );
        }),

        const SizedBox(height: 10),
        // Action card: Battle Mode
        AppCard(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => BattleCameraPage(
                  exerciseType: isPushup ? ExerciseTypeEnum.pushup : ExerciseTypeEnum.pullup,
                ),
              ),
            );
          },
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(Icons.sports_mma, color: color, size: 24),
              ),
              const SizedBox(width: 14),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '⚔️ Đấu Trường 1v1',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Thách đấu 60 giây nhận Ruby và leo rank',
                      style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.textMuted),
            ],
          ),
        ),
      ],
    );
  }
}

// ============================================
// WALKING CATEGORY VIEW
// ============================================

class _WalkingCategoryView extends ConsumerWidget {
  final FitnessLevelEnum currentLevel;

  const _WalkingCategoryView({required this.currentLevel});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dailyGoals = ref.watch(dailyExerciseGoalsProvider);
    final walkingGoal = dailyGoals.walkingTarget;
    final walkingCompleted = dailyGoals.walkingCompleted;
    final progress = walkingGoal > 0 ? (walkingCompleted / walkingGoal).clamp(0.0, 1.0) : 0.0;
    final variations = ExerciseLibraryData.variations.where((v) => v.type == 'walking').toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        AppCard(
          gradient: const LinearGradient(
            colors: [Color(0xFF2ED573), Color(0xFF7BED9F)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Center(
                      child: Text('🚶', style: TextStyle(fontSize: 26)),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Đi Bộ & Sức Bền',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0D0E15)),
                        ),
                        Text(
                          'Mục tiêu ${currentLevel.label}: ${walkingGoal.toString()} bước',
                          style: const TextStyle(color: Color(0xFF2C3E50), fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('$walkingCompleted', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0D0E15))),
                      Text('/$walkingGoal bước', style: const TextStyle(fontSize: 10, color: Color(0xFF2C3E50), fontWeight: FontWeight.w600)),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ProgressBar(progress: progress, color: const Color(0xFF0D0E15), height: 8),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _DarkStat(label: 'Khoảng cách', value: '${(walkingCompleted * 0.00075).toStringAsFixed(2)} km'),
                  _DarkStat(label: 'Calories', value: '${(walkingCompleted * 0.04).round()} kcal'),
                  _DarkStat(label: 'Thời gian', value: '${(walkingCompleted / 100).round()} ph'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // GPS Walking Button
        GradientButton(
          text: 'BẮT ĐẦU ĐI BỘ (GPS LIVE TRACKER)',
          icon: Icons.navigation,
          gradient: const LinearGradient(
            colors: [Color(0xFF2ED573), Color(0xFF7BED9F)],
          ),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const GPSWalkingPage()),
            );
          },
        ),
        const SizedBox(height: 18),

        const Text(
          '📚 Chế Độ Đi Bộ Theo Cấp Độ',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
        ),
        const SizedBox(height: 10),

        ...variations.map((item) {
          final isCurrent = item.level == currentLevel;

          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: item.level.color.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(child: Text(item.icon, style: const TextStyle(fontSize: 22))),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(item.vietnameseName, style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                                if (isCurrent) ...[
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                    decoration: BoxDecoration(
                                      color: item.level.color.withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text('Phù hợp bạn', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: item.level.color)),
                                  ),
                                ],
                              ],
                            ),
                            Text(item.badge, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(item.description, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    children: [
                      _Chip(label: '🎯 ${item.targetRepsPerSet}', color: const Color(0xFFA29BFE)),
                      _Chip(label: '⚡ ${item.aiTargetAngle}', color: const Color(0xFF2ED573)),
                    ],
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}

// ============================================
// ROADMAP CATEGORY VIEW
// ============================================

class _RoadmapCategoryView extends ConsumerWidget {
  const _RoadmapCategoryView();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    final stages = ExerciseLibraryData.roadmapStages;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.trending_up, color: AppColors.primary, size: 18),
                  SizedBox(width: 6),
                  Text(
                    'Lộ Trình Nâng Cấp Thể Lực Chuẩn Khoa Học',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: AppColors.primary),
                  ),
                ],
              ),
              SizedBox(height: 4),
              Text(
                'Quá tải tăng dần giúp bạn thích nghi từ người mới tập đến vận động viên mà không bị quá sức hay chấn thương.',
                style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary, height: 1.4),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        ...stages.map((stage) {
          final isCur = user.fitnessLevel == stage.level.id;

          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: stage.level.color,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Center(child: Text(stage.icon, style: const TextStyle(fontSize: 20))),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(stage.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                            Text(stage.subtitle, style: TextStyle(fontSize: 11, color: stage.level.color, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                      if (isCur)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: stage.level.color,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('ĐANG Ở ĐÂY', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.black)),
                        ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(stage.description, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4)),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('🎯 Cột mốc hoàn thành:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white)),
                        const SizedBox(height: 4),
                        ...stage.milestones.map((m) => Padding(
                          padding: const EdgeInsets.only(bottom: 2),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('• ', style: TextStyle(color: AppColors.primary)),
                              Expanded(child: Text(m, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary))),
                            ],
                          ),
                        )),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }
}

// ============================================
// VARIATION DETAIL BOTTOM SHEET
// ============================================

class _VariationDetailSheet extends StatelessWidget {
  final ExerciseVariationModel item;

  const _VariationDetailSheet({required this.item});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(item.icon, style: const TextStyle(fontSize: 32)),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.vietnameseName, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                    Text(item.name, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  ],
                ),
              ),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
            ],
          ),
          const SizedBox(height: 12),
          Text(item.description, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4)),
          const SizedBox(height: 14),

          // AI Guidance
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.success.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.success.withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.verified_user, color: AppColors.success, size: 16),
                    SizedBox(width: 6),
                    Text('Tiêu Chuẩn Chấm Điểm AI:', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.success)),
                  ],
                ),
                const SizedBox(height: 6),
                ...item.aiGuidance.map((g) => Text('• $g', style: const TextStyle(fontSize: 11.5, color: Color(0xFFD1F7C4), height: 1.4))),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Pro Tips
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.lightbulb, color: AppColors.primary, size: 16),
                    SizedBox(width: 6),
                    Text('Mẹo Thực Hiện (Pro-Tips):', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.primary)),
                  ],
                ),
                const SizedBox(height: 4),
                Text(item.proTips, style: const TextStyle(fontSize: 11.5, color: Color(0xFFFFD3B6), height: 1.4)),
              ],
            ),
          ),
          const SizedBox(height: 16),

          GradientButton(
            text: 'BẮT ĐẦU TẬP BÀI NÀY (CAMERA AI)',
            icon: Icons.play_arrow,
            onPressed: () {
              Navigator.pop(context);
              if (item.type == 'walking') {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const GPSWalkingPage()));
              } else {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ExerciseCameraPage(
                      exerciseType: item.type == 'pushup' ? ExerciseTypeEnum.pushup : ExerciseTypeEnum.pullup,
                    ),
                  ),
                );
              }
            },
          ),
        ],
      ),
    );
  }
}

// Micro Widgets
class _Chip extends StatelessWidget {
  final String label;
  final Color color;

  const _Chip({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
    );
  }
}

class _DarkStat extends StatelessWidget {
  final String label;
  final String value;

  const _DarkStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 10.5, color: Color(0xFF2C3E50), fontWeight: FontWeight.w600)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0D0E15))),
      ],
    );
  }
}
