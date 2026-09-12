import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'models.dart';
import 'models_exercise.dart';
import 'seed_data.dart';
import 'services/app_database.dart';

// ============================================
// EXERCISE STATE & DATABASE NOTIFIERS
// ============================================

// Dynamic User Exercise Stats from Database
UserExerciseStats get userExerciseStats => AppDatabase.instance.getExerciseStats();

// User Exercise Stats Provider
class UserExerciseStatsNotifier extends StateNotifier<UserExerciseStats> {
  UserExerciseStatsNotifier() : super(AppDatabase.instance.getExerciseStats());

  void addPushups(int count) {
    state = state.copyWith(
      totalPushups: state.totalPushups + count,
      totalExerciseSessions: state.totalExerciseSessions + 1,
    );
    AppDatabase.instance.saveExerciseStats(state);
  }

  void addPullups(int count) {
    state = state.copyWith(
      totalPullups: state.totalPullups + count,
      totalExerciseSessions: state.totalExerciseSessions + 1,
    );
    AppDatabase.instance.saveExerciseStats(state);
  }

  void addWalkingSteps(int steps) {
    state = state.copyWith(
      totalWalkingSteps: state.totalWalkingSteps + steps,
    );
    AppDatabase.instance.saveExerciseStats(state);
  }

  void updateBestPushup(int count) {
    if (count > state.bestPushupCount) {
      state = state.copyWith(bestPushupCount: count);
      AppDatabase.instance.saveExerciseStats(state);
    }
  }

  void updateBestPullup(int count) {
    if (count > state.bestPullupCount) {
      state = state.copyWith(bestPullupCount: count);
      AppDatabase.instance.saveExerciseStats(state);
    }
  }
}

final userExerciseStatsProvider = StateNotifierProvider<UserExerciseStatsNotifier, UserExerciseStats>((ref) {
  return UserExerciseStatsNotifier();
});

// Daily Goals State
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

// Daily Walking Goal State
final dailyWalkingGoal = DailyWalkingGoal(
  oderId: 'user-1',
  targetSteps: 10000,
  currentSteps: 7500,
  date: DateTime.now(),
  completed: false,
  bonusPoints: 0,
);

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

// Recent Exercise Sessions Provider (Loads dynamically from AppDatabase)
final recentExerciseSessionsProvider = StateNotifierProvider<RecentSessionsNotifier, List<ExerciseSession>>((ref) {
  return RecentSessionsNotifier();
});

class RecentSessionsNotifier extends StateNotifier<List<ExerciseSession>> {
  RecentSessionsNotifier() : super(AppDatabase.instance.getExerciseSessions());

  void addSession(ExerciseSession session) {
    state = [session, ...state];
    AppDatabase.instance.addExerciseSession(session);
  }
}

// User Membership State
final userMembership = Membership(
  oderId: 'user-1',
  tier: MembershipTier.free,
  perks: ['Theo dõi cơ bản', 'Thử thách hàng ngày', 'Vật phẩm cơ bản'],
  dailyBonusPercent: 0,
  battleCostReduction: 0,
  unlimitedSync: false,
);

final userMembershipProvider = StateNotifierProvider<UserMembershipNotifier, Membership>((ref) {
  return UserMembershipNotifier();
});

class UserMembershipNotifier extends StateNotifier<Membership> {
  UserMembershipNotifier() : super(userMembership);

  void upgrade(MembershipTier tier) {
    state = state.copyWith(tier: tier);
  }
}

// Exercise Leaderboards
final pushupLeaderboard = [
  ExerciseLeaderboardEntry(rank: 1, oderId: 'u1', oderName: 'Minh Đạt', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=MinhDat', bestScore: 105, totalSessions: 245, avgAccuracy: 92.5, type: ExerciseTypeEnum.pushup),
  ExerciseLeaderboardEntry(rank: 2, oderId: 'u2', oderName: 'Thu Hà', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=ThuHa', bestScore: 98, totalSessions: 198, avgAccuracy: 89.2, type: ExerciseTypeEnum.pushup),
  ExerciseLeaderboardEntry(rank: 3, oderId: 'u3', oderName: 'Hoàng Nam', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=HoangNam', bestScore: 87, totalSessions: 156, avgAccuracy: 85.7, type: ExerciseTypeEnum.pushup),
  ExerciseLeaderboardEntry(rank: 47, oderId: 'user-1', oderName: 'Bạn', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=You', bestScore: 52, totalSessions: 89, avgAccuracy: 78.3, type: ExerciseTypeEnum.pushup, isCurrentUser: true),
];

final pullupLeaderboard = [
  ExerciseLeaderboardEntry(rank: 1, oderId: 'u1', oderName: 'Minh Đạt', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=MinhDat', bestScore: 42, totalSessions: 312, avgAccuracy: 95.2, type: ExerciseTypeEnum.pullup),
  ExerciseLeaderboardEntry(rank: 2, oderId: 'u4', oderName: 'Lan Phương', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=LanPhuong', bestScore: 38, totalSessions: 178, avgAccuracy: 91.8, type: ExerciseTypeEnum.pullup),
  ExerciseLeaderboardEntry(rank: 3, oderId: 'u5', oderName: 'Khoa Phạm', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=KhoaPham', bestScore: 35, totalSessions: 134, avgAccuracy: 88.4, type: ExerciseTypeEnum.pullup),
  ExerciseLeaderboardEntry(rank: 52, oderId: 'user-1', oderName: 'Bạn', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=You', bestScore: 18, totalSessions: 67, avgAccuracy: 76.5, type: ExerciseTypeEnum.pullup, isCurrentUser: true),
];

final walkingLeaderboard = [
  ExerciseLeaderboardEntry(rank: 1, oderId: 'u3', oderName: 'Hoàng Nam', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=HoangNam', bestScore: 25000, totalSessions: 89, avgAccuracy: 100.0, type: ExerciseTypeEnum.walking),
  ExerciseLeaderboardEntry(rank: 2, oderId: 'u2', oderName: 'Thu Hà', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=ThuHa', bestScore: 23000, totalSessions: 76, avgAccuracy: 100.0, type: ExerciseTypeEnum.walking),
  ExerciseLeaderboardEntry(rank: 3, oderId: 'u1', oderName: 'Minh Đạt', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=MinhDat', bestScore: 21500, totalSessions: 92, avgAccuracy: 100.0, type: ExerciseTypeEnum.walking),
  ExerciseLeaderboardEntry(rank: 38, oderId: 'user-1', oderName: 'Bạn', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=You', bestScore: 8500, totalSessions: 45, avgAccuracy: 100.0, type: ExerciseTypeEnum.walking, isCurrentUser: true),
];

final pushupLeaderboardProvider = Provider<List<ExerciseLeaderboardEntry>>((ref) => pushupLeaderboard);
final pullupLeaderboardProvider = Provider<List<ExerciseLeaderboardEntry>>((ref) => pullupLeaderboard);
final walkingLeaderboardProvider = Provider<List<ExerciseLeaderboardEntry>>((ref) => walkingLeaderboard);

// Shop Items Provider (Loads dynamically from AppDatabase)
final shopItemsProvider = StateNotifierProvider<ShopItemsNotifier, List<ShopItem>>((ref) {
  return ShopItemsNotifier();
});

class ShopItemsNotifier extends StateNotifier<List<ShopItem>> {
  ShopItemsNotifier() : super(AppDatabase.instance.getShopItems());

  void purchaseItem(String itemId) {
    state = state.map((item) {
      if (item.id == itemId) {
        return item.copyWith(owned: true);
      }
      return item;
    }).toList();
    AppDatabase.instance.saveShopItems(state);
  }

  void buyItem(String itemId) => purchaseItem(itemId);
}

// Membership Plans & User Owned Items
final membershipPlans = initialMembershipPlansSeed;
final membershipPlansProvider = Provider<List<MembershipPlan>>((ref) => membershipPlans);
final userOwnedItems = ['frame_neon'];
final userOwnedItemsProvider = StateProvider<List<String>>((ref) => userOwnedItems);
