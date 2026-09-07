// ============================================
// EXERCISE MODELS - Fitness Battle
// ============================================

import 'models.dart'; // For SkinRarity enum

// Exercise Types
enum ExerciseTypeEnum {
  pushup('pushup', 'Hít đất', '💪', '#ff6b35'),
  pullup('pullup', 'Kéo xà', '🏋️', '#5352ed'),
  walking('walking', 'Đi bộ', '🚶', '#2ed573'),
  squat('squat', 'Squat', '🦵', '#ffa502'),
  plank('plank', 'Plank', '⏱️', '#a55eea');

  final String id;
  final String name;
  final String emoji;
  final String color;

  const ExerciseTypeEnum(this.id, this.name, this.emoji, this.color);
}

// Exercise Session - Track a single exercise session
class ExerciseSession {
  final String id;
  final String oderId;
  final ExerciseTypeEnum type;
  final int count; // Number of reps
  final int correctFormCount; // Reps with correct form
  final int durationSeconds;
  final DateTime startedAt;
  final DateTime? completedAt;
  final int caloriesBurned;
  final int xpEarned;
  final int pointsEarned;
  final bool isBattleMode;
  final String? battleId;
  final List<FormFeedback> formFeedbacks;
  final ExerciseAccuracy accuracy;

  ExerciseSession({
    required this.id,
    required this.oderId,
    required this.type,
    required this.count,
    required this.correctFormCount,
    required this.durationSeconds,
    required this.startedAt,
    this.completedAt,
    required this.caloriesBurned,
    required this.xpEarned,
    required this.pointsEarned,
    this.isBattleMode = false,
    this.battleId,
    this.formFeedbacks = const [],
    required this.accuracy,
  });

  ExerciseSession copyWith({
    String? id,
    String? oderId,
    ExerciseTypeEnum? type,
    int? count,
    int? correctFormCount,
    int? durationSeconds,
    DateTime? startedAt,
    DateTime? completedAt,
    int? caloriesBurned,
    int? xpEarned,
    int? pointsEarned,
    bool? isBattleMode,
    String? battleId,
    List<FormFeedback>? formFeedbacks,
    ExerciseAccuracy? accuracy,
  }) {
    return ExerciseSession(
      id: id ?? this.id,
      oderId: oderId ?? this.oderId,
      type: type ?? this.type,
      count: count ?? this.count,
      correctFormCount: correctFormCount ?? this.correctFormCount,
      durationSeconds: durationSeconds ?? this.durationSeconds,
      startedAt: startedAt ?? this.startedAt,
      completedAt: completedAt ?? this.completedAt,
      caloriesBurned: caloriesBurned ?? this.caloriesBurned,
      xpEarned: xpEarned ?? this.xpEarned,
      pointsEarned: pointsEarned ?? this.pointsEarned,
      isBattleMode: isBattleMode ?? this.isBattleMode,
      battleId: battleId ?? this.battleId,
      formFeedbacks: formFeedbacks ?? this.formFeedbacks,
      accuracy: accuracy ?? this.accuracy,
    );
  }
}

// Form Feedback for each rep
class FormFeedback {
  final int repNumber;
  final FormStatus status; // correct, incorrect, warning
  final String feedback; // e.g., "Lưng thẳng", "Khuỷu tay đúng góc"
  final List<String> issues; // List of form issues detected

  FormFeedback({
    required this.repNumber,
    required this.status,
    required this.feedback,
    required this.issues,
  });
}

enum FormStatus { correct, incorrect, warning }

// Exercise Accuracy
class ExerciseAccuracy {
  final double percentage;
  final int correctReps;
  final int totalReps;
  final int incorrectReps;
  final int warningReps;

  ExerciseAccuracy({
    required this.percentage,
    required this.correctReps,
    required this.totalReps,
    required this.incorrectReps,
    required this.warningReps,
  });

  String get grade {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'C+';
    if (percentage >= 65) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  String get gradeEmoji {
    if (percentage >= 90) return '🏆';
    if (percentage >= 85) return '🥇';
    if (percentage >= 80) return '🥈';
    if (percentage >= 75) return '🥉';
    if (percentage >= 70) return '👍';
    if (percentage >= 65) return '👌';
    if (percentage >= 60) return '🤔';
    return '💪';
  }
}

// Battle Exercise Session - For competitive mode
class BattleExerciseSession {
  final String id;
  final String battleId;
  final String oderId;
  final ExerciseTypeEnum type;
  final int count;
  final int correctFormCount;
  final int durationSeconds;
  final int heartRate;
  final DateTime startedAt;
  final DateTime? endedAt;
  final int rankPointsGained;
  final bool isCheating;

  BattleExerciseSession({
    required this.id,
    required this.battleId,
    required this.oderId,
    required this.type,
    required this.count,
    required this.correctFormCount,
    required this.durationSeconds,
    required this.heartRate,
    required this.startedAt,
    this.endedAt,
    required this.rankPointsGained,
    this.isCheating = false,
  });

  double get accuracy => totalReps > 0 ? (correctFormCount / totalReps) * 100 : 0;
  int get totalReps => count;
}

// Walking/Step Tracking
class WalkingSession {
  final String id;
  final String oderId;
  final int steps;
  final int distanceMeters;
  final int caloriesBurned;
  final int durationMinutes;
  final DateTime startedAt;
  final DateTime? completedAt;
  final int pointsEarned;
  final int xpEarned;
  final WalkingSource source;
  final bool isSynced;
  final String? syncedDevice;

  WalkingSession({
    required this.id,
    required this.oderId,
    required this.steps,
    required this.distanceMeters,
    required this.caloriesBurned,
    required this.durationMinutes,
    required this.startedAt,
    this.completedAt,
    required this.pointsEarned,
    required this.xpEarned,
    this.source = WalkingSource.manual,
    this.isSynced = false,
    this.syncedDevice,
  });

  // Points calculation: 10 steps = 1 point, bonus for distance
  static int calculatePoints(int steps, int distanceMeters) {
    final basePoints = steps ~/ 10;
    final distanceBonus = distanceMeters ~/ 100; // 100m = 1 bonus point
    return basePoints + distanceBonus;
  }
}

enum WalkingSource {
  manual, // Manual input
  phoneSensor, // Built-in pedometer
  smartwatch, // Synced from smartwatch
  gps, // GPS tracking
}

// Daily Walking Goal
class DailyWalkingGoal {
  final String oderId;
  final int targetSteps;
  final int currentSteps;
  final int bonusSteps; // Extra steps from streak
  final DateTime date;
  final bool completed;
  final int bonusPoints;

  DailyWalkingGoal({
    required this.oderId,
    required this.targetSteps,
    required this.currentSteps,
    this.bonusSteps = 0,
    required this.date,
    required this.completed,
    required this.bonusPoints,
  });

  double get progress => targetSteps > 0 ? (currentSteps / targetSteps).clamp(0.0, 1.0) : 0.0;

  DailyWalkingGoal copyWith({
    String? oderId,
    int? targetSteps,
    int? currentSteps,
    int? bonusSteps,
    DateTime? date,
    bool? completed,
    int? bonusPoints,
  }) {
    return DailyWalkingGoal(
      oderId: oderId ?? this.oderId,
      targetSteps: targetSteps ?? this.targetSteps,
      currentSteps: currentSteps ?? this.currentSteps,
      bonusSteps: bonusSteps ?? this.bonusSteps,
      date: date ?? this.date,
      completed: completed ?? this.completed,
      bonusPoints: bonusPoints ?? this.bonusPoints,
    );
  }
}

// ============================================
// POINTS & REWARDS SYSTEM
// ============================================

class ExerciseRewards {
  // Base rewards per exercise type
  static const Map<ExerciseTypeEnum, ExerciseRewardConfig> configs = {
    ExerciseTypeEnum.pushup: ExerciseRewardConfig(
      xpPerRep: 2,
      pointsPerRep: 1,
      caloriesPerRep: 0.5,
      streakBonusMultiplier: 0.1,
    ),
    ExerciseTypeEnum.pullup: ExerciseRewardConfig(
      xpPerRep: 3,
      pointsPerRep: 2,
      caloriesPerRep: 0.8,
      streakBonusMultiplier: 0.15,
    ),
    ExerciseTypeEnum.walking: ExerciseRewardConfig(
      xpPerRep: 0,
      pointsPerRep: 0,
      caloriesPerRep: 0.04,
      streakBonusMultiplier: 0.05,
    ),
    ExerciseTypeEnum.squat: ExerciseRewardConfig(
      xpPerRep: 1.5,
      pointsPerRep: 1,
      caloriesPerRep: 0.4,
      streakBonusMultiplier: 0.1,
    ),
    ExerciseTypeEnum.plank: ExerciseRewardConfig(
      xpPerRep: 0,
      pointsPerRep: 0,
      caloriesPerRep: 0.3,
      streakBonusMultiplier: 0.1,
    ),
  };

  static ExerciseRewardConfig getConfig(ExerciseTypeEnum type) {
    return configs[type] ?? ExerciseRewardConfig.defaultConfig();
  }

  static int calculateXP(ExerciseTypeEnum type, int count, int streak) {
    final config = getConfig(type);
    final baseXP = (count * config.xpPerRep).round();
    final streakBonus = (baseXP * config.streakBonusMultiplier * streak).round();
    return baseXP + streakBonus;
  }

  static int calculatePoints(ExerciseTypeEnum type, int count, int streak) {
    final config = getConfig(type);
    final basePoints = (count * config.pointsPerRep).round();
    final streakBonus = (basePoints * config.streakBonusMultiplier * streak).round();
    return basePoints + streakBonus;
  }

  static int calculateCalories(ExerciseTypeEnum type, int count) {
    final config = getConfig(type);
    return (count * config.caloriesPerRep).round();
  }
}

class ExerciseRewardConfig {
  final double xpPerRep;
  final double pointsPerRep;
  final double caloriesPerRep;
  final double streakBonusMultiplier;

  const ExerciseRewardConfig({
    required this.xpPerRep,
    required this.pointsPerRep,
    required this.caloriesPerRep,
    required this.streakBonusMultiplier,
  });

  factory ExerciseRewardConfig.defaultConfig() {
    return const ExerciseRewardConfig(
      xpPerRep: 1,
      pointsPerRep: 1,
      caloriesPerRep: 0.3,
      streakBonusMultiplier: 0.1,
    );
  }
}

// ============================================
// FORM DETECTION CONFIG
// ============================================

// Simple range class for angle thresholds
class AngleRange {
  final int min;
  final int max;

  const AngleRange(this.min, this.max);

  bool contains(int value) => value >= min && value <= max;
}

class FormDetectionConfig {
  // Push-up form requirements
  static final pushupRequirements = FormRequirements(
    keyPoints: ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle'],
    angleThresholds: {
      'elbow_flex': AngleRange(80, 100),
      'shoulder_align': AngleRange(15, 45),
      'back_straight': AngleRange(160, 180),
      'hip_alignment': AngleRange(150, 180),
    },
    forbiddenAngles: {
      'elbow_overextension': 200,
      'back_sag': 140,
      'hip_drop': 130,
    },
  );

  // Pull-up form requirements
  static final pullupRequirements = FormRequirements(
    keyPoints: ['shoulder', 'elbow', 'wrist', 'hip'],
    angleThresholds: {
      'elbow_flex_up': AngleRange(30, 60),
      'elbow_flex_down': AngleRange(160, 180),
      'shoulder_elevation': AngleRange(60, 90),
      'body_swing': AngleRange(10, 15),
    },
    forbiddenAngles: {
      'half_rep': 120,
      'excessive_swing': 30,
      'shoulder_shrug': 45,
    },
  );
}

class FormRequirements {
  final List<String> keyPoints;
  final Map<String, AngleRange> angleThresholds;
  final Map<String, int> forbiddenAngles;

  FormRequirements({
    required this.keyPoints,
    required this.angleThresholds,
    required this.forbiddenAngles,
  });
}

// ============================================
// BATTLE RANKING SYSTEM
// ============================================

class RankTier {
  final int minPoints;
  final int maxPoints;
  final String name;
  final String emoji;
  final List<String> unlockedItems;

  const RankTier({
    required this.minPoints,
    required this.maxPoints,
    required this.name,
    required this.emoji,
    required this.unlockedItems,
  });

  static const List<RankTier> tiers = [
    RankTier(
      minPoints: 0,
      maxPoints: 999,
      name: 'Tân Binh',
      emoji: '🌱',
      unlockedItems: ['basic_skin'],
    ),
    RankTier(
      minPoints: 1000,
      maxPoints: 4999,
      name: 'Chiến Binh',
      emoji: '⚔️',
      unlockedItems: ['warrior_skin', 'bronze_frame'],
    ),
    RankTier(
      minPoints: 5000,
      maxPoints: 14999,
      name: 'Chiến Sĩ',
      emoji: '🛡️',
      unlockedItems: ['fighter_skin', 'silver_frame', 'warrior_title'],
    ),
    RankTier(
      minPoints: 15000,
      maxPoints: 39999,
      name: 'Vệ Binh',
      emoji: '🛡️',
      unlockedItems: ['guardian_skin', 'gold_frame', 'guardian_title', 'battle_emoji'],
    ),
    RankTier(
      minPoints: 40000,
      maxPoints: 99999,
      name: 'Titan',
      emoji: '⚡',
      unlockedItems: ['titan_skin', 'platinum_frame', 'titan_title', 'legend_emoji'],
    ),
    RankTier(
      minPoints: 100000,
      maxPoints: 999999999,
      name: 'Huyền Thoại',
      emoji: '👑',
      unlockedItems: ['legend_skin', 'diamond_frame', 'legend_title', 'crown_badge'],
    ),
  ];

  static RankTier getTierByPoints(int points) {
    for (final tier in tiers.reversed) {
      if (points >= tier.minPoints) return tier;
    }
    return tiers.first;
  }

  static int getPointsToNextTier(int currentPoints) {
    for (final tier in tiers) {
      if (currentPoints < tier.maxPoints) {
        return tier.maxPoints - currentPoints + 1;
      }
    }
    return 0;
  }
}

// ============================================
// EXERCISE LEADERBOARD
// ============================================

class ExerciseLeaderboardEntry {
  final int rank;
  final String oderId;
  final String oderName;
  final String avatar;
  final int bestScore;
  final int totalSessions;
  final double avgAccuracy;
  final ExerciseTypeEnum type;
  final bool isCurrentUser;

  ExerciseLeaderboardEntry({
    required this.rank,
    required this.oderId,
    required this.oderName,
    required this.avatar,
    required this.bestScore,
    required this.totalSessions,
    required this.avgAccuracy,
    required this.type,
    this.isCurrentUser = false,
  });
}

// ============================================
// MEMBERSHIP SYSTEM
// ============================================

enum MembershipTier {
  free,
  basic,
  premium,
  vip,
}

class Membership {
  final String oderId;
  final MembershipTier tier;
  final DateTime? startDate;
  final DateTime? expiryDate;
  final List<String> perks;
  final int dailyBonusPercent;
  final int battleCostReduction;
  final bool unlimitedSync;

  Membership({
    required this.oderId,
    required this.tier,
    this.startDate,
    this.expiryDate,
    required this.perks,
    required this.dailyBonusPercent,
    required this.battleCostReduction,
    required this.unlimitedSync,
  });

  bool get isActive {
    if (tier == MembershipTier.free) return true;
    if (expiryDate == null) return true;
    return DateTime.now().isBefore(expiryDate!);
  }

  bool get isExpired {
    return !isActive;
  }

  Membership copyWith({
    String? oderId,
    MembershipTier? tier,
    DateTime? startDate,
    DateTime? expiryDate,
    List<String>? perks,
    int? dailyBonusPercent,
    int? battleCostReduction,
    bool? unlimitedSync,
  }) {
    return Membership(
      oderId: oderId ?? this.oderId,
      tier: tier ?? this.tier,
      startDate: startDate ?? this.startDate,
      expiryDate: expiryDate ?? this.expiryDate,
      perks: perks ?? this.perks,
      dailyBonusPercent: dailyBonusPercent ?? this.dailyBonusPercent,
      battleCostReduction: battleCostReduction ?? this.battleCostReduction,
      unlimitedSync: unlimitedSync ?? this.unlimitedSync,
    );
  }

  static Membership get freeMembership => Membership(
    oderId: '',
    tier: MembershipTier.free,
    perks: ['Basic tracking', 'Daily challenges', 'Basic shop items'],
    dailyBonusPercent: 0,
    battleCostReduction: 0,
    unlimitedSync: false,
  );

  static Membership get basicMembership => Membership(
    oderId: '',
    tier: MembershipTier.basic,
    startDate: DateTime.now(),
    expiryDate: DateTime.now().add(const Duration(days: 30)),
    perks: ['Advanced tracking', 'Weekly challenges', 'Basic + items', '10% daily bonus'],
    dailyBonusPercent: 10,
    battleCostReduction: 5,
    unlimitedSync: false,
  );

  static Membership get premiumMembership => Membership(
    oderId: '',
    tier: MembershipTier.premium,
    startDate: DateTime.now(),
    expiryDate: DateTime.now().add(const Duration(days: 30)),
    perks: ['AI Form detection', 'All challenges', 'Premium items', '25% daily bonus', 'Smart watch sync'],
    dailyBonusPercent: 25,
    battleCostReduction: 15,
    unlimitedSync: true,
  );

  static Membership get vipMembership => Membership(
    oderId: '',
    tier: MembershipTier.vip,
    startDate: DateTime.now(),
    expiryDate: DateTime.now().add(const Duration(days: 30)),
    perks: ['Premium AI Form', 'Exclusive VIP challenges', 'VIP items', '50% daily bonus', 'Unlimited sync', 'Priority support'],
    dailyBonusPercent: 50,
    battleCostReduction: 30,
    unlimitedSync: true,
  );
}

// ============================================
// SHOP SYSTEM
// ============================================

enum ShopCategory {
  frames,
  titles,
  effects,
  badges,
  consumables,
  bundles,
}

class ShopItem {
  final String id;
  final String name;
  final String description;
  final ShopCategory category;
  final int price;
  final String currency; // 'coins' or 'ruby'
  final SkinRarity rarity;
  final int? requiredRankMin;
  final String? requiredRankId;
  final bool owned;
  final bool limited;
  final String? season;
  final DateTime? limitedUntil;
  final String preview;
  final MembershipTier? requiredMembership;

  ShopItem({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.price,
    required this.currency,
    required this.rarity,
    this.requiredRankMin,
    this.requiredRankId,
    this.owned = false,
    this.limited = false,
    this.season,
    this.limitedUntil,
    required this.preview,
    this.requiredMembership,
  });

  bool get canPurchase {
    if (owned) return false;
    if (limited && limitedUntil != null && DateTime.now().isAfter(limitedUntil!)) return false;
    return true;
  }

  ShopItem copyWith({
    String? id,
    String? name,
    String? description,
    ShopCategory? category,
    int? price,
    String? currency,
    SkinRarity? rarity,
    int? requiredRankMin,
    String? requiredRankId,
    bool? owned,
    bool? limited,
    String? season,
    DateTime? limitedUntil,
    String? preview,
    MembershipTier? requiredMembership,
  }) {
    return ShopItem(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      category: category ?? this.category,
      price: price ?? this.price,
      currency: currency ?? this.currency,
      rarity: rarity ?? this.rarity,
      requiredRankMin: requiredRankMin ?? this.requiredRankMin,
      requiredRankId: requiredRankId ?? this.requiredRankId,
      owned: owned ?? this.owned,
      limited: limited ?? this.limited,
      season: season ?? this.season,
      limitedUntil: limitedUntil ?? this.limitedUntil,
      preview: preview ?? this.preview,
      requiredMembership: requiredMembership ?? this.requiredMembership,
    );
  }
}

// ============================================
// DAILY EXERCISE GOALS
// ============================================

class DailyExerciseGoals {
  final String oderId;
  final DateTime date;
  final int pushupTarget;
  final int pushupCompleted;
  final int pullupTarget;
  final int pullupCompleted;
  final int walkingTarget; // in steps
  final int walkingCompleted;
  final bool allCompleted;

  DailyExerciseGoals({
    required this.oderId,
    required this.date,
    required this.pushupTarget,
    required this.pushupCompleted,
    required this.pullupTarget,
    required this.pullupCompleted,
    required this.walkingTarget,
    required this.walkingCompleted,
    required this.allCompleted,
  });

  double get pushupProgress => pushupTarget > 0 ? (pushupCompleted / pushupTarget).clamp(0.0, 1.0) : 0.0;
  double get pullupProgress => pullupTarget > 0 ? (pullupCompleted / pullupTarget).clamp(0.0, 1.0) : 0.0;
  double get walkingProgress => walkingTarget > 0 ? (walkingCompleted / walkingTarget).clamp(0.0, 1.0) : 0.0;
  double get overallProgress => (pushupProgress + pullupProgress + walkingProgress) / 3;

  int get totalPointsEarned {
    int points = 0;
    if (pushupCompleted >= pushupTarget) points += 50;
    if (pullupCompleted >= pullupTarget) points += 75;
    if (walkingCompleted >= walkingTarget) points += 30;
    if (allCompleted) points += 100; // Bonus for completing all
    return points;
  }

  DailyExerciseGoals copyWith({
    String? oderId,
    DateTime? date,
    int? pushupTarget,
    int? pushupCompleted,
    int? pullupTarget,
    int? pullupCompleted,
    int? walkingTarget,
    int? walkingCompleted,
    bool? allCompleted,
  }) {
    return DailyExerciseGoals(
      oderId: oderId ?? this.oderId,
      date: date ?? this.date,
      pushupTarget: pushupTarget ?? this.pushupTarget,
      pushupCompleted: pushupCompleted ?? this.pushupCompleted,
      pullupTarget: pullupTarget ?? this.pullupTarget,
      pullupCompleted: pullupCompleted ?? this.pullupCompleted,
      walkingTarget: walkingTarget ?? this.walkingTarget,
      walkingCompleted: walkingCompleted ?? this.walkingCompleted,
      allCompleted: allCompleted ?? this.allCompleted,
    );
  }
}

// User Exercise Stats
class UserExerciseStats {
  final String oderId;
  final int totalPushups;
  final int totalPullups;
  final int totalWalkingSteps;
  final int currentStreak;
  final int longestStreak;
  final int bestPushupCount;
  final int bestPullupCount;
  final int totalExerciseSessions;
  final int totalCaloriesBurned;
  final List<int> weeklyPushups;
  final List<int> weeklyPullups;

  UserExerciseStats({
    required this.oderId,
    required this.totalPushups,
    required this.totalPullups,
    required this.totalWalkingSteps,
    required this.currentStreak,
    required this.longestStreak,
    required this.bestPushupCount,
    required this.bestPullupCount,
    required this.totalExerciseSessions,
    required this.totalCaloriesBurned,
    required this.weeklyPushups,
    required this.weeklyPullups,
  });

  UserExerciseStats copyWith({
    String? oderId,
    int? totalPushups,
    int? totalPullups,
    int? totalWalkingSteps,
    int? currentStreak,
    int? longestStreak,
    int? bestPushupCount,
    int? bestPullupCount,
    int? totalExerciseSessions,
    int? totalCaloriesBurned,
    List<int>? weeklyPushups,
    List<int>? weeklyPullups,
  }) {
    return UserExerciseStats(
      oderId: oderId ?? this.oderId,
      totalPushups: totalPushups ?? this.totalPushups,
      totalPullups: totalPullups ?? this.totalPullups,
      totalWalkingSteps: totalWalkingSteps ?? this.totalWalkingSteps,
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      bestPushupCount: bestPushupCount ?? this.bestPushupCount,
      bestPullupCount: bestPullupCount ?? this.bestPullupCount,
      totalExerciseSessions: totalExerciseSessions ?? this.totalExerciseSessions,
      totalCaloriesBurned: totalCaloriesBurned ?? this.totalCaloriesBurned,
      weeklyPushups: weeklyPushups ?? this.weeklyPushups,
      weeklyPullups: weeklyPullups ?? this.weeklyPullups,
    );
  }
}

// Membership Plan
class MembershipPlan {
  final String id;
  final String name;
  final String description;
  final int price;
  final String currency;
  final int durationDays;
  final List<String> features;
  final int dailyBonusPercent;
  final int battleCostReduction;

  MembershipPlan({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.currency,
    required this.durationDays,
    required this.features,
    required this.dailyBonusPercent,
    required this.battleCostReduction,
  });

  // Additional properties used in UI
  MembershipTier get tier {
    switch (id) {
      case 'basic': return MembershipTier.basic;
      case 'premium': return MembershipTier.premium;
      case 'vip': return MembershipTier.vip;
      default: return MembershipTier.free;
    }
  }

  String get priceFormatted => '$price $currency';

  List<String> get notIncluded {
    switch (id) {
      case 'basic':
        return ['AI Form Detection', 'Smartwatch Sync', 'VIP Challenges', 'Priority Support'];
      case 'premium':
        return ['VIP Challenges', 'Priority Support'];
      case 'vip':
        return [];
      default:
        return ['Advanced Tracking', 'Weekly Challenges', 'Daily Bonus'];
    }
  }

  bool get isPopular => id == 'premium';
}
