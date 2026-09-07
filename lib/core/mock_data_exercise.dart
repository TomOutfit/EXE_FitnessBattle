import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'models.dart';
import 'models_exercise.dart';

// ============================================
// EXERCISE MOCK DATA - Fitness Battle
// ============================================

// User's Exercise Stats
final userExerciseStats = UserExerciseStats(
  oderId: 'user-1',
  totalPushups: 1245,
  totalPullups: 320,
  totalWalkingSteps: 456789,
  currentStreak: 14,
  longestStreak: 28,
  bestPushupCount: 52,
  bestPullupCount: 18,
  totalExerciseSessions: 89,
  totalCaloriesBurned: 42500,
  weeklyPushups: [120, 135, 100, 150, 80, 160, 145],
  weeklyPullups: [25, 30, 20, 35, 15, 40, 32],
);

// ============================================
// EXERCISE PROVIDERS
// ============================================

// User Exercise Stats Provider
class UserExerciseStatsNotifier extends StateNotifier<UserExerciseStats> {
  UserExerciseStatsNotifier() : super(userExerciseStats);

  void addPushups(int count) {
    state = state.copyWith(
      totalPushups: state.totalPushups + count,
      totalExerciseSessions: state.totalExerciseSessions + 1,
    );
  }

  void addPullups(int count) {
    state = state.copyWith(
      totalPullups: state.totalPullups + count,
      totalExerciseSessions: state.totalExerciseSessions + 1,
    );
  }

  void addWalkingSteps(int steps) {
    state = state.copyWith(
      totalWalkingSteps: state.totalWalkingSteps + steps,
    );
  }

  void updateBestPushup(int count) {
    if (count > state.bestPushupCount) {
      state = state.copyWith(bestPushupCount: count);
    }
  }

  void updateBestPullup(int count) {
    if (count > state.bestPullupCount) {
      state = state.copyWith(bestPullupCount: count);
    }
  }
}

final userExerciseStatsProvider = StateNotifierProvider<UserExerciseStatsNotifier, UserExerciseStats>((ref) {
  return UserExerciseStatsNotifier();
});

// Daily Exercise Goals Provider
class DailyExerciseGoalsNotifier extends StateNotifier<DailyExerciseGoals> {
  DailyExerciseGoalsNotifier() : super(dailyGoals);

  void updatePushupProgress(int completed) {
    state = state.copyWith(
      pushupCompleted: completed,
      allCompleted: completed >= state.pushupTarget && state.pullupCompleted >= state.pullupTarget,
    );
  }

  void updatePullupProgress(int completed) {
    state = state.copyWith(
      pullupCompleted: completed,
      allCompleted: state.pushupCompleted >= state.pushupTarget && completed >= state.pullupTarget,
    );
  }

  void updateWalkingProgress(int completed) {
    state = state.copyWith(walkingCompleted: completed);
  }
}

final dailyExerciseGoalsProvider = StateNotifierProvider<DailyExerciseGoalsNotifier, DailyExerciseGoals>((ref) {
  return DailyExerciseGoalsNotifier();
});

// Daily Walking Goal Provider
class DailyWalkingGoalNotifier extends StateNotifier<DailyWalkingGoal> {
  DailyWalkingGoalNotifier() : super(dailyWalkingGoal);

  void updateSteps(int currentSteps) {
    final completed = currentSteps >= state.targetSteps;
    final bonusPoints = completed ? 30 : 0;
    
    state = state.copyWith(
      currentSteps: currentSteps,
      completed: completed,
      bonusPoints: bonusPoints,
    );
  }

  void addBonusSteps(int bonus) {
    state = state.copyWith(
      currentSteps: state.currentSteps + bonus,
      bonusSteps: bonus,
    );
  }
}

final dailyWalkingGoalProvider = StateNotifierProvider<DailyWalkingGoalNotifier, DailyWalkingGoal>((ref) {
  return DailyWalkingGoalNotifier();
});

// Recent Exercise Sessions Provider
final recentExerciseSessionsProvider = StateNotifierProvider<RecentSessionsNotifier, List<ExerciseSession>>((ref) {
  return RecentSessionsNotifier();
});

class RecentSessionsNotifier extends StateNotifier<List<ExerciseSession>> {
  RecentSessionsNotifier() : super(recentExerciseSessions);

  void addSession(ExerciseSession session) {
    state = [session, ...state];
  }
}

// User Membership Provider
final userMembershipProvider = StateNotifierProvider<UserMembershipNotifier, Membership>((ref) {
  return UserMembershipNotifier();
});

class UserMembershipNotifier extends StateNotifier<Membership> {
  UserMembershipNotifier() : super(userMembership);

  void upgrade(MembershipTier tier) {
    state = state.copyWith(tier: tier);
  }
}

// Exercise Leaderboard Providers
final pushupLeaderboardProvider = Provider<List<ExerciseLeaderboardEntry>>((ref) {
  return pushupLeaderboard;
});

final pullupLeaderboardProvider = Provider<List<ExerciseLeaderboardEntry>>((ref) {
  return pullupLeaderboard;
});

final walkingLeaderboardProvider = Provider<List<ExerciseLeaderboardEntry>>((ref) {
  return walkingLeaderboard;
});

// Shop Items Provider
final shopItemsProvider = StateNotifierProvider<ShopItemsNotifier, List<ShopItem>>((ref) {
  return ShopItemsNotifier();
});

class ShopItemsNotifier extends StateNotifier<List<ShopItem>> {
  ShopItemsNotifier() : super(shopItems);

  void purchaseItem(String itemId) {
    state = state.map((item) {
      if (item.id == itemId) {
        return item.copyWith(owned: true);
      }
      return item;
    }).toList();
  }
}

// Membership Plans Provider
final membershipPlansProvider = Provider<List<MembershipPlan>>((ref) {
  return membershipPlans;
});

// User Owned Items Provider
final userOwnedItemsProvider = StateProvider<List<String>>((ref) => userOwnedItems);

// ============================================
// MOCK DATA DEFINITIONS
// ============================================

// Daily Goals
final dailyGoals = DailyExerciseGoals(
  oderId: 'user-1',
  date: DateTime.now(),
  pushupTarget: 50,
  pushupCompleted: 35,
  pullupTarget: 20,
  pullupCompleted: 12,
  walkingTarget: 10000,
  walkingCompleted: 7500,
  allCompleted: false,
);

// Daily Walking Goal
final dailyWalkingGoal = DailyWalkingGoal(
  oderId: 'user-1',
  targetSteps: 10000,
  currentSteps: 7500,
  date: DateTime.now(),
  completed: false,
  bonusPoints: 0,
);

// User Membership
final userMembership = Membership(
  oderId: 'user-1',
  tier: MembershipTier.free,
  perks: ['Theo dõi cơ bản', 'Thử thách hàng ngày', 'Vật phẩm cơ bản'],
  dailyBonusPercent: 0,
  battleCostReduction: 0,
  unlimitedSync: false,
);

// Push-up Leaderboard
final pushupLeaderboard = [
  ExerciseLeaderboardEntry(rank: 1, oderId: 'u1', oderName: 'Minh Đạt', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=MinhDat', bestScore: 105, totalSessions: 245, avgAccuracy: 92.5, type: ExerciseTypeEnum.pushup),
  ExerciseLeaderboardEntry(rank: 2, oderId: 'u2', oderName: 'Thu Hà', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=ThuHa', bestScore: 98, totalSessions: 198, avgAccuracy: 89.2, type: ExerciseTypeEnum.pushup),
  ExerciseLeaderboardEntry(rank: 3, oderId: 'u3', oderName: 'Hoàng Nam', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=HoangNam', bestScore: 87, totalSessions: 156, avgAccuracy: 85.7, type: ExerciseTypeEnum.pushup),
  ExerciseLeaderboardEntry(rank: 47, oderId: 'user-1', oderName: 'Bạn', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=You', bestScore: 52, totalSessions: 89, avgAccuracy: 78.3, type: ExerciseTypeEnum.pushup, isCurrentUser: true),
];

// Pull-up Leaderboard
final pullupLeaderboard = [
  ExerciseLeaderboardEntry(rank: 1, oderId: 'u1', oderName: 'Minh Đạt', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=MinhDat', bestScore: 42, totalSessions: 312, avgAccuracy: 95.2, type: ExerciseTypeEnum.pullup),
  ExerciseLeaderboardEntry(rank: 2, oderId: 'u4', oderName: 'Lan Phương', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=LanPhuong', bestScore: 38, totalSessions: 178, avgAccuracy: 91.8, type: ExerciseTypeEnum.pullup),
  ExerciseLeaderboardEntry(rank: 3, oderId: 'u5', oderName: 'Khoa Phạm', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=KhoaPham', bestScore: 35, totalSessions: 134, avgAccuracy: 88.4, type: ExerciseTypeEnum.pullup),
  ExerciseLeaderboardEntry(rank: 52, oderId: 'user-1', oderName: 'Bạn', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=You', bestScore: 18, totalSessions: 67, avgAccuracy: 76.5, type: ExerciseTypeEnum.pullup, isCurrentUser: true),
];

// Walking Leaderboard
final walkingLeaderboard = [
  ExerciseLeaderboardEntry(rank: 1, oderId: 'u3', oderName: 'Hoàng Nam', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=HoangNam', bestScore: 25000, totalSessions: 89, avgAccuracy: 100.0, type: ExerciseTypeEnum.walking),
  ExerciseLeaderboardEntry(rank: 2, oderId: 'u2', oderName: 'Thu Hà', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=ThuHa', bestScore: 23000, totalSessions: 76, avgAccuracy: 100.0, type: ExerciseTypeEnum.walking),
  ExerciseLeaderboardEntry(rank: 3, oderId: 'u1', oderName: 'Minh Đạt', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=MinhDat', bestScore: 21500, totalSessions: 92, avgAccuracy: 100.0, type: ExerciseTypeEnum.walking),
  ExerciseLeaderboardEntry(rank: 38, oderId: 'user-1', oderName: 'Bạn', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=You', bestScore: 8500, totalSessions: 45, avgAccuracy: 100.0, type: ExerciseTypeEnum.walking, isCurrentUser: true),
];

// Recent Exercise Sessions
final recentExerciseSessions = [
  ExerciseSession(
    id: 's1',
    oderId: 'user-1',
    type: ExerciseTypeEnum.pushup,
    count: 45,
    correctFormCount: 38,
    durationSeconds: 480,
    startedAt: DateTime.now().subtract(const Duration(hours: 3)),
    caloriesBurned: 180,
    xpEarned: 90,
    pointsEarned: 45,
    accuracy: ExerciseAccuracy(percentage: 84.4, correctReps: 38, totalReps: 45, incorrectReps: 7, warningReps: 0),
  ),
  ExerciseSession(
    id: 's2',
    oderId: 'user-1',
    type: ExerciseTypeEnum.pullup,
    count: 15,
    correctFormCount: 12,
    durationSeconds: 300,
    startedAt: DateTime.now().subtract(const Duration(days: 1, hours: 5)),
    caloriesBurned: 120,
    xpEarned: 45,
    pointsEarned: 30,
    accuracy: ExerciseAccuracy(percentage: 80.0, correctReps: 12, totalReps: 15, incorrectReps: 3, warningReps: 0),
  ),
];

// Shop Items
final shopItems = [
  ShopItem(id: 'frame_neon', name: 'Khung Neon', description: 'Khung avatar neon rực rỡ', category: ShopCategory.frames, price: 50, currency: 'coins', rarity: SkinRarity.rare, owned: true, preview: '🔮'),
  ShopItem(id: 'frame_dragon', name: 'Khung Rồng Lửa', description: 'Khung avatar rồng lửa huyền thoại', category: ShopCategory.frames, price: 150, currency: 'ruby', rarity: SkinRarity.legendary, owned: false, preview: '🐉'),
  ShopItem(id: 'title_titan', name: 'Chiến Binh Titan', description: 'Danh hiệu Titan chạy bộ', category: ShopCategory.titles, price: 30, currency: 'coins', rarity: SkinRarity.epic, owned: false, preview: '⚡'),
  ShopItem(id: 'effect_firework', name: 'Hiệu ứng Pháo Hoa', description: 'Hiệu ứng pháo hoa khi chiến thắng', category: ShopCategory.effects, price: 80, currency: 'coins', rarity: SkinRarity.rare, owned: false, preview: '🎆'),
  ShopItem(id: 'badge_titan', name: 'Huy hiệu Titan', description: 'Huy hiệu cho runner xuất sắc', category: ShopCategory.badges, price: 100, currency: 'coins', rarity: SkinRarity.epic, owned: false, preview: '🏅'),
];

// Membership Plans
final membershipPlans = [
  MembershipPlan(
    id: 'basic',
    name: 'Basic',
    description: 'Gói cơ bản với tính năng nâng cao',
    price: 50000,
    currency: 'vnd',
    durationDays: 30,
    features: ['Theo dõi nâng cao', 'Thử thách hàng tuần', '10% điểm thưởng hàng ngày'],
    dailyBonusPercent: 10,
    battleCostReduction: 5,
  ),
  MembershipPlan(
    id: 'premium',
    name: 'Premium',
    description: 'Gói cao cấp với tất cả tính năng',
    price: 99000,
    currency: 'vnd',
    durationDays: 30,
    features: ['AI phát hiện form', 'Tất cả thử thách', '25% điểm thưởng hàng ngày', 'Đồng bộ smartwatch'],
    dailyBonusPercent: 25,
    battleCostReduction: 15,
  ),
  MembershipPlan(
    id: 'vip',
    name: 'VIP',
    description: 'Gói VIP với đặc quyền tối đa',
    price: 199000,
    currency: 'vnd',
    durationDays: 30,
    features: ['AI Premium cao cấp', 'Thử thách độc quyền VIP', '50% điểm thưởng hàng ngày', 'Đồng bộ không giới hạn', 'Hỗ trợ ưu tiên'],
    dailyBonusPercent: 50,
    battleCostReduction: 30,
  ),
];

// User Owned Items
final userOwnedItems = ['frame_neon'];
