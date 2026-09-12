import 'dart:async';
import 'dart:math' as math;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'models.dart';
import 'models_exercise.dart';
import 'seed_data.dart';
import 'exercise_providers.dart';
import 'services/step_tracking_service.dart';
import 'services/app_database.dart';
import 'firebase_sync_service.dart';

// Re-export exercise providers
export 'exercise_providers.dart' show 
  userExerciseStatsProvider,
  dailyExerciseGoalsProvider,
  dailyWalkingGoalProvider,
  recentExerciseSessionsProvider,
  userMembershipProvider,
  pushupLeaderboardProvider,
  pullupLeaderboardProvider,
  walkingLeaderboardProvider,
  shopItemsProvider,
  membershipPlansProvider,
  userOwnedItemsProvider;

// =============================================================
// USER STATE NOTIFIER
// =============================================================
class UserNotifier extends StateNotifier<User> {
  Timer? _regenTimer;
  StreamSubscription? _remoteSub;

  UserNotifier() : super(AppDatabase.instance.getUser().applyStaminaRegeneration()) {
    _startStaminaRegenTimer();
    _startRemoteSync();
  }

  void _startRemoteSync() {
    try {
      _remoteSub = FirebaseSyncService.streamUser(state.id).listen((snap) {
        if (snap.exists && snap.data() != null) {
          final data = snap.data()!;
          state = state.copyWith(
            coins: data['coins'] is int ? data['coins'] : state.coins,
            ruby: data['ruby'] is int ? data['ruby'] : state.ruby,
            stamina: data['stamina'] is int ? data['stamina'] : state.stamina,
            xp: data['xp'] is int ? data['xp'] : state.xp,
            level: data['level'] is int ? data['level'] : state.level,
            streak: data['streak'] is int ? data['streak'] : state.streak,
            calories: data['calories'] is int ? data['calories'] : state.calories,
            totalPoints: data['totalPoints'] is int ? data['totalPoints'] : state.totalPoints,
          );
          AppDatabase.instance.saveUser(state);
        }
      }, onError: (e) {
        // Safe fallback if offline
      });
    } catch (_) {}
  }

  void _startStaminaRegenTimer() {
    _regenTimer?.cancel();
    _regenTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      regenerateStamina();
    });
  }

  @override
  void dispose() {
    _regenTimer?.cancel();
    _remoteSub?.cancel();
    super.dispose();
  }

  void regenerateStamina() {
    final regenerated = state.applyStaminaRegeneration();
    if (regenerated.stamina != state.stamina || regenerated.lastStaminaRefillAt != state.lastStaminaRefillAt) {
      state = regenerated;
      AppDatabase.instance.saveUser(state);
    }
  }

  void updateUser(User user) {
    state = user.applyStaminaRegeneration();
    AppDatabase.instance.saveUser(state);
  }

  /// Sync workout completion rewards into user profile
  void recordWorkoutReward({
    required int xpGained,
    required int coinsGained,
    required int pointsGained,
    required int durationMinutes,
    required int caloriesBurned,
    required String exerciseType,
    required int reps,
  }) {
    final newXp = state.xp + xpGained;
    final levelUp = newXp >= state.xpToNextLevel;
    final newLevel = levelUp ? state.level + 1 : state.level;
    final remainingXp = levelUp ? newXp - state.xpToNextLevel : newXp;

    final currentWeeklyMin = List<int>.from(state.stats.weeklyMinutes);
    if (currentWeeklyMin.isNotEmpty) {
      currentWeeklyMin[currentWeeklyMin.length - 1] += durationMinutes;
    }

    final currentWeeklyCal = List<int>.from(state.stats.weeklyCalories);
    if (currentWeeklyCal.isNotEmpty) {
      currentWeeklyCal[currentWeeklyCal.length - 1] += caloriesBurned;
    }

    final updatedTotalWorkouts = state.stats.totalWorkouts + 1;
    final updatedTotalMinutes = state.stats.totalMinutes + durationMinutes;
    final updatedTotalCalories = state.stats.totalCalories + caloriesBurned;
    final updatedAvgHeartRate = math.min(165, math.max(120, ((state.stats.avgHeartRate * 4 + 140) / 5).round()));

    // Auto-unlock badges if conditions are met
    final updatedBadges = state.badges.map((b) {
      if (b.id == 'b1' && updatedTotalWorkouts >= 1) {
        return b.copyWith(earned: true);
      }
      if (b.id == 'b2' && exerciseType == 'pushup' && reps >= 20) {
        return b.copyWith(earned: true);
      }
      if (b.id == 'b3' && exerciseType == 'pullup' && reps >= 10) {
        return b.copyWith(earned: true);
      }
      if (b.id == 'b4' && exerciseType == 'walking' && reps >= 5000) {
        return b.copyWith(earned: true);
      }
      return b;
    }).toList();

    state = state.copyWith(
      xp: remainingXp,
      level: newLevel,
      xpToNextLevel: levelUp ? (state.xpToNextLevel * 1.5).floor() : state.xpToNextLevel,
      totalPoints: state.totalPoints + pointsGained,
      coins: state.coins + coinsGained,
      badges: updatedBadges,
      stats: UserStats(
        totalWorkouts: updatedTotalWorkouts,
        totalMinutes: updatedTotalMinutes,
        avgHeartRate: updatedAvgHeartRate,
        totalCalories: updatedTotalCalories,
        weeklyMinutes: currentWeeklyMin,
        weeklyCalories: currentWeeklyCal,
      ),
    );
    AppDatabase.instance.saveUser(state);
  }

  /// Sync battle completion rewards and stamina into user profile
  void recordBattleReward({
    required int myScore,
    required int oppScore,
    required String result, // 'win', 'lose', 'draw', 'cheat', 'opp_cheat'
    required int durationSeconds,
    required int staminaCost,
    required String exerciseType,
  }) {
    final isWin = result == 'win' || result == 'opp_cheat';
    final xpGained = result == 'cheat' ? 0 : (myScore * 3.5 + (isWin ? 50 : 15)).round();
    final pointsGained = result == 'cheat'
        ? -50
        : result == 'lose'
            ? (myScore * 1.5).round()
            : (myScore * 4.0 + 30).round();
    final streakChange = isWin
        ? 1
        : result == 'lose'
            ? -state.streak.clamp(0, 2)
            : 0;

    final newXp = state.xp + xpGained;
    final levelUp = newXp >= state.xpToNextLevel;
    final newLevel = levelUp ? state.level + 1 : state.level;
    final remainingXp = levelUp ? newXp - state.xpToNextLevel : newXp;

    final newStreak = (state.streak + streakChange).clamp(0, 999);
    final newWinCount = isWin ? state.winCount + 1 : state.winCount;
    final newLoseCount = result == 'lose' ? state.loseCount + 1 : state.loseCount;

    // Deduct stamina
    final newStamina = math.max(0, state.stamina - staminaCost);

    // Dynamic badge unlock
    final updatedBadges = state.badges.map((b) {
      if (b.id == 'b6' && (newWinCount >= 5 || newStreak >= 3)) {
        return b.copyWith(earned: true);
      }
      if (b.id == 'b5' && (newWinCount + newLoseCount >= 5)) {
        return b.copyWith(earned: true);
      }
      return b;
    }).toList();

    state = state.copyWith(
      xp: remainingXp,
      level: newLevel,
      xpToNextLevel: levelUp ? (state.xpToNextLevel * 1.5).floor() : state.xpToNextLevel,
      totalPoints: (state.totalPoints + pointsGained).clamp(0, 99999999),
      streak: newStreak,
      winCount: newWinCount,
      loseCount: newLoseCount,
      stamina: newStamina,
      badges: updatedBadges,
    );
    AppDatabase.instance.saveUser(state);
  }

  void updateBattleResult(int myScore, int oppScore, String result) {
    recordBattleReward(
      myScore: myScore,
      oppScore: oppScore,
      result: result,
      durationSeconds: 60,
      staminaCost: 10,
      exerciseType: 'pushup',
    );
  }

  void upgradeToVIP() {
    state = state.copyWith(
      isVIP: true,
      maxStamina: 500,
      stamina: 500,
      ruby: state.ruby + 100,
      equippedSkinFrame: '🐉 Rồng Lửa Frame VIP',
      equippedTitle: '👑 VIP Battle Master',
    );
  }

  bool deductStamina(int amount) {
    if (state.stamina < amount) return false;
    final now = DateTime.now();
    final wasFull = state.stamina >= state.maxStamina;
    state = state.copyWith(
      stamina: state.stamina - amount,
      lastStaminaRefillAt: wasFull ? now : state.lastStaminaRefillAt,
    );
    AppDatabase.instance.saveUser(state);
    return true;
  }

  void refillStamina() {
    state = state.copyWith(
      stamina: state.maxStamina,
      lastStaminaRefillAt: DateTime.now(),
    );
    AppDatabase.instance.saveUser(state);
  }

  void addRuby(int amount) {
    state = state.copyWith(ruby: state.ruby + amount);
    AppDatabase.instance.saveUser(state);
  }

  void buyRuby(int amount) => addRuby(amount);

  bool spendRuby(int amount) {
    if (state.ruby < amount) return false;
    state = state.copyWith(ruby: state.ruby - amount);
    AppDatabase.instance.saveUser(state);
    return true;
  }

  void addXP(int amount) {
    final newXp = state.xp + amount;
    final levelUp = newXp >= state.xpToNextLevel;
    final newLevel = levelUp ? state.level + 1 : state.level;
    final remainingXp = levelUp ? newXp - state.xpToNextLevel : newXp;
    state = state.copyWith(
      xp: remainingXp,
      level: newLevel,
      xpToNextLevel: levelUp ? (state.xpToNextLevel * 1.5).floor() : state.xpToNextLevel,
    );
    AppDatabase.instance.saveUser(state);
  }

  void addCoins(int amount) {
    state = state.copyWith(coins: state.coins + amount);
    AppDatabase.instance.saveUser(state);
  }

  bool spendCoins(int amount) {
    if (state.coins < amount) return false;
    state = state.copyWith(coins: state.coins - amount);
    AppDatabase.instance.saveUser(state);
    return true;
  }
}

final userProvider = StateNotifierProvider<UserNotifier, User>((ref) {
  return UserNotifier();
});

// =============================================================
// BATTLE HISTORY STATE
// =============================================================
class BattleHistoryNotifier extends StateNotifier<List<BattleHistoryItem>> {
  BattleHistoryNotifier() : super(AppDatabase.instance.getBattleHistory());

  void addHistory(BattleHistoryItem item) {
    state = [item, ...state];
    AppDatabase.instance.addBattleHistory(item);
  }
}

final battleHistoryProvider = StateNotifierProvider<BattleHistoryNotifier, List<BattleHistoryItem>>((ref) {
  return BattleHistoryNotifier();
});

// =============================================================
// STEP TRACKING STATE
// =============================================================
class StepTrackingNotifier extends StateNotifier<StepState> {
  final _stepService = StepTrackingService();
  
  StepTrackingNotifier() : super(StepState()) {
    _stepService.onStepUpdate = (newState) {
      state = newState;
    };
  }
  
  Future<void> startTracking() async {
    await _stepService.startTracking();
  }
  
  void stopTracking() {
    _stepService.stopTracking();
  }
  
  @override
  void dispose() {
    _stepService.dispose();
    super.dispose();
  }
}

final stepTrackingProvider = StateNotifierProvider<StepTrackingNotifier, StepState>((ref) {
  return StepTrackingNotifier();
});

// =============================================================
// LEADERBOARD STATE
// =============================================================
class LeaderboardNotifier extends StateNotifier<List<LeaderboardEntry>> {
  LeaderboardNotifier() : super(AppDatabase.instance.getLeaderboard());

  void updateUserPoints(String userId, int newPoints) {
    final updated = state.map((entry) {
      if (entry.oderId == userId || entry.isCurrentUser == true) {
        return entry.copyWith(points: newPoints);
      }
      return entry;
    }).toList();
    updated.sort((a, b) => b.points.compareTo(a.points));
    state = updated.asMap().entries.map((e) => e.value.copyWith(rank: e.key + 1)).toList();
    AppDatabase.instance.saveLeaderboard(state);
  }
}

final leaderboardProvider = StateNotifierProvider<LeaderboardNotifier, List<LeaderboardEntry>>((ref) {
  return LeaderboardNotifier();
});

// =============================================================
// BATTLES STATE
// =============================================================
class BattlesNotifier extends StateNotifier<List<Battle>> {
  BattlesNotifier() : super(initialBattlesSeed);

  void joinBattle(String battleId, User user) {
    state = state.map((b) {
      if (b.id == battleId && b.status == BattleStatus.waiting) {
        return b.copyWith(
          status: BattleStatus.active,
          players: [
            b.players[0],
            BattlePlayer(
              oderId: user.id,
              oderName: user.name,
              avatar: user.avatar,
              score: 0,
              heartRate: 138,
              duration: 0,
              isActive: true,
            ),
          ],
        );
      }
      return b;
    }).toList();
  }

  void addBattle(Battle newBattle) {
    state = [newBattle, ...state];
  }
}

final battlesProvider = StateNotifierProvider<BattlesNotifier, List<Battle>>((ref) {
  return BattlesNotifier();
});

// =============================================================
// CHALLENGES STATE (DAILY / WEEKLY QUESTS)
// =============================================================
class ChallengesNotifier extends StateNotifier<List<Challenge>> {
  StreamSubscription? _remoteSub;

  ChallengesNotifier() : super(AppDatabase.instance.getChallenges()) {
    _startRemoteSync();
  }

  void _startRemoteSync() {
    try {
      final user = AppDatabase.instance.getUser();
      _remoteSub = FirebaseSyncService.streamChallenges(user.id).listen((snap) {
        if (snap.exists && snap.data() != null) {
          final data = snap.data()!;
          if (data['items'] is List) {
            final list = (data['items'] as List)
                .map((item) => Challenge.fromJson(Map<String, dynamic>.from(item as Map)))
                .toList();
            if (list.isNotEmpty) {
              state = list;
              AppDatabase.instance.saveChallenges(state);
            }
          }
        }
      }, onError: (e) {
        // Safe fallback
      });
    } catch (_) {}
  }

  @override
  void dispose() {
    _remoteSub?.cancel();
    super.dispose();
  }

  void updateProgress(String challengeId, int increment) {
    state = state.map((c) {
      if (c.id == challengeId) {
        final newCur = c.current + increment;
        return c.copyWith(
          current: newCur,
          completed: newCur >= c.target,
        );
      }
      return c;
    }).toList();
    AppDatabase.instance.saveChallenges(state);
  }

  void progressChallenges({
    String? exerciseType,
    int reps = 0,
    int calories = 0,
    int durationMinutes = 0,
    bool isBattleWin = false,
  }) {
    state = state.map((c) {
      if (c.completed) return c;
      int inc = 0;
      final desc = c.description.toLowerCase();
      final title = c.title.toLowerCase();

      if (exerciseType == 'pushup' && (title.contains('hít đất') || desc.contains('hít đất') || title.contains('push'))) {
        inc = reps;
      } else if (exerciseType == 'pullup' && (title.contains('kéo xà') || desc.contains('kéo xà') || title.contains('pull'))) {
        inc = reps;
      } else if (exerciseType == 'walking' && (title.contains('bước') || desc.contains('bước') || title.contains('đi bộ') || title.contains('walk'))) {
        inc = reps;
      } else if (title.contains('calo') || desc.contains('calo') || title.contains('kcal') || desc.contains('kcal')) {
        inc = calories;
      } else if (isBattleWin && (title.contains('thắng') || title.contains('đấu') || title.contains('battle') || title.contains('trận'))) {
        inc = 1;
      } else if (title.contains('luyện tập') || desc.contains('buổi tập') || title.contains('hoàn thành')) {
        inc = 1;
      }

      if (inc > 0) {
        final newCur = c.current + inc;
        return c.copyWith(
          current: newCur,
          completed: newCur >= c.target,
        );
      }
      return c;
    }).toList();
    AppDatabase.instance.saveChallenges(state);
  }

  void claimReward(String challengeId) {
    Challenge? targetCh;
    state = state.map((c) {
      if (c.id == challengeId) {
        targetCh = c;
        return c.copyWith(completed: true, claimed: true);
      }
      return c;
    }).toList();
    AppDatabase.instance.saveChallenges(state);

    // Đồng bộ lên Firebase Cloud Firestore
    if (targetCh != null) {
      final user = AppDatabase.instance.getUser();
      FirebaseSyncService.claimChallenge(
        userId: user.id,
        challengeId: challengeId,
        allChallenges: state,
        rewardXp: targetCh!.reward.xp,
        rewardCoins: targetCh!.reward.coins,
        rewardRuby: targetCh!.reward.ruby ?? 0,
      );
    }
  }
}

final challengesProvider = StateNotifierProvider<ChallengesNotifier, List<Challenge>>((ref) {
  return ChallengesNotifier();
});

// Friends Provider
final friendsProvider = Provider<List<Friend>>((ref) {
  return initialFriendsSeed;
});

// =============================================================
// ACTIVITIES STATE (RECENT ACTIVITY FEED)
// =============================================================
class ActivitiesNotifier extends StateNotifier<List<ActivitySession>> {
  ActivitiesNotifier() : super(initialActivitiesSeed);

  void addActivity(ActivitySession session) {
    state = [session, ...state];
  }
}

final activitiesProvider = StateNotifierProvider<ActivitiesNotifier, List<ActivitySession>>((ref) {
  return ActivitiesNotifier();
});

// Exercise Types Provider
final exerciseTypesProvider = Provider<List<ExerciseType>>((ref) {
  return initialExerciseTypesSeed;
});

// Battle Pass Provider
final battlePassProvider = Provider<BattlePassSeason>((ref) {
  return initialBattlePassSeasonSeed;
});

// Vouchers Provider
final vouchersProvider = Provider<List<Voucher>>((ref) {
  return initialVouchersSeed;
});

// Premium Arenas Provider
final premiumArenasProvider = Provider<List<PremiumArena>>((ref) {
  return AppDatabase.instance.getArenas();
});

// Skin Items State
class SkinItemsNotifier extends StateNotifier<List<SkinItem>> {
  SkinItemsNotifier() : super(initialSkinItemsSeed);

  void buyItem(String itemId) {
    state = state.map((item) {
      if (item.id == itemId) {
        return item.copyWith(owned: true);
      }
      return item;
    }).toList();
  }
}

final skinItemsProvider = StateNotifierProvider<SkinItemsNotifier, List<SkinItem>>((ref) {
  return SkinItemsNotifier();
});

// Navigation State
final selectedIndexProvider = StateProvider<int>((ref) => 0);

// Onboarding State
final isOnboardedProvider = StateProvider<bool>((ref) => true);

// Battle Result State
class BattleResultState {
  final bool? isWin;
  final int? myScore;
  final int? oppScore;

  BattleResultState({this.isWin, this.myScore, this.oppScore});
}

final battleResultProvider = StateProvider<BattleResultState?>((ref) => null);

// =============================================================
// WORKOUT & BATTLE UNIFIED SYNC SERVICE
// =============================================================
class WorkoutSyncService {
  static void syncWorkout({
    required WidgetRef ref,
    required String exerciseType, // 'pushup', 'pullup', 'walking', 'squat'
    required int totalReps,
    required int validReps,
    required int durationMinutes,
    required int caloriesBurned,
    double accuracy = 100.0,
    List<String> formIssues = const [],
  }) {
    int xpGained = 0;
    int coinsGained = 0;
    int pointsGained = 0;

    final exTypeEnum = exerciseType == 'pushup'
        ? ExerciseTypeEnum.pushup
        : exerciseType == 'pullup'
            ? ExerciseTypeEnum.pullup
            : ExerciseTypeEnum.walking;

    if (exerciseType == 'pushup') {
      xpGained = (validReps * 3.0).round();
      coinsGained = (validReps * 1.0).round();
      pointsGained = (validReps * 2.0).round();
      ref.read(userExerciseStatsProvider.notifier).addPushups(validReps);
      ref.read(userExerciseStatsProvider.notifier).updateBestPushup(validReps);
      final currentPush = ref.read(dailyExerciseGoalsProvider).pushupCompleted;
      ref.read(dailyExerciseGoalsProvider.notifier).updatePushupProgress(currentPush + validReps);
    } else if (exerciseType == 'pullup') {
      xpGained = (validReps * 5.0).round();
      coinsGained = (validReps * 2.0).round();
      pointsGained = (validReps * 3.5).round();
      ref.read(userExerciseStatsProvider.notifier).addPullups(validReps);
      ref.read(userExerciseStatsProvider.notifier).updateBestPullup(validReps);
      final currentPull = ref.read(dailyExerciseGoalsProvider).pullupCompleted;
      ref.read(dailyExerciseGoalsProvider.notifier).updatePullupProgress(currentPull + validReps);
    } else if (exerciseType == 'walking') {
      xpGained = (validReps * 0.05).round().clamp(10, 500);
      coinsGained = (validReps * 0.02).round().clamp(5, 200);
      pointsGained = (validReps * 0.03).round().clamp(5, 300);
      ref.read(userExerciseStatsProvider.notifier).addWalkingSteps(validReps);
      ref.read(dailyWalkingGoalProvider.notifier).updateSteps(
        ref.read(dailyWalkingGoalProvider).currentSteps + validReps,
      );
      final currentWalk = ref.read(dailyExerciseGoalsProvider).walkingCompleted;
      ref.read(dailyExerciseGoalsProvider.notifier).updateWalkingProgress(currentWalk + validReps);
    } else {
      xpGained = (validReps * 2.5).round();
      coinsGained = (validReps * 1.0).round();
      pointsGained = (validReps * 1.5).round();
    }

    if (xpGained < 10 && validReps > 0) xpGained = 10;
    if (coinsGained < 5 && validReps > 0) coinsGained = 5;

    // 1. Update User Profile & XP & Stats & Badges
    ref.read(userProvider.notifier).recordWorkoutReward(
      xpGained: xpGained,
      coinsGained: coinsGained,
      pointsGained: pointsGained,
      durationMinutes: durationMinutes,
      caloriesBurned: caloriesBurned,
      exerciseType: exerciseType,
      reps: validReps,
    );

    // 2. Update Quests
    ref.read(challengesProvider.notifier).progressChallenges(
      exerciseType: exerciseType,
      reps: validReps,
      calories: caloriesBurned,
      durationMinutes: durationMinutes,
    );

    // 3. Add to Activity Feed
    String exerciseDisplayName = exerciseType == 'pushup'
        ? 'Hít Đất'
        : exerciseType == 'pullup'
            ? 'Kéo Xà'
            : exerciseType == 'walking'
                ? 'Đi Bộ GPS'
                : 'Squat';

    ref.read(activitiesProvider.notifier).addActivity(
      ActivitySession(
        id: 'act_${DateTime.now().millisecondsSinceEpoch}',
        date: 'Vừa xong',
        duration: durationMinutes,
        calories: caloriesBurned,
        heartRate: 138,
        type: exerciseDisplayName,
        xp: xpGained,
      ),
    );

    // 4. Add to Recent Exercise Sessions
    ref.read(recentExerciseSessionsProvider.notifier).addSession(
      ExerciseSession(
        id: 'sess_${DateTime.now().millisecondsSinceEpoch}',
        oderId: 'user-1',
        type: exTypeEnum,
        count: totalReps,
        correctFormCount: validReps,
        durationSeconds: durationMinutes * 60,
        startedAt: DateTime.now().subtract(Duration(minutes: durationMinutes)),
        completedAt: DateTime.now(),
        caloriesBurned: caloriesBurned,
        xpEarned: xpGained,
        pointsEarned: pointsGained,
        accuracy: ExerciseAccuracy(
          percentage: accuracy,
          correctReps: validReps,
          totalReps: totalReps,
          incorrectReps: totalReps - validReps,
          warningReps: 0,
        ),
      ),
    );
  }

  static void syncBattle({
    required WidgetRef ref,
    required ExerciseTypeEnum exerciseType,
    required int myScore,
    required int myCorrectScore,
    required int oppScore,
    required String result, // 'win', 'lose', 'draw', 'cheat', 'opp_cheat'
    required int durationSeconds,
  }) {
    final durationMinutes = (durationSeconds / 60).ceil().clamp(1, 60);
    final isWin = result == 'win' || result == 'opp_cheat';
    final cal = (myCorrectScore * (exerciseType == ExerciseTypeEnum.pushup ? 0.5 : 1.2)).round();

    final xpGained = result == 'cheat' ? 0 : (myCorrectScore * 3.5 + (isWin ? 50 : 15)).round();
    final pointsGained = result == 'cheat'
        ? -50
        : result == 'lose'
            ? (myCorrectScore * 1.5).round()
            : (myCorrectScore * 4.0 + 30).round();

    // 1. Update User Stats & Stamina
    ref.read(userProvider.notifier).recordBattleReward(
      myScore: myCorrectScore,
      oppScore: oppScore,
      result: result,
      durationSeconds: durationSeconds,
      staminaCost: 10,
      exerciseType: exerciseType.id,
    );

    // 2. Update Exercise Stats
    if (exerciseType == ExerciseTypeEnum.pushup) {
      ref.read(userExerciseStatsProvider.notifier).addPushups(myCorrectScore);
      ref.read(userExerciseStatsProvider.notifier).updateBestPushup(myCorrectScore);
      final cur = ref.read(dailyExerciseGoalsProvider).pushupCompleted;
      ref.read(dailyExerciseGoalsProvider.notifier).updatePushupProgress(cur + myCorrectScore);
    } else if (exerciseType == ExerciseTypeEnum.pullup) {
      ref.read(userExerciseStatsProvider.notifier).addPullups(myCorrectScore);
      ref.read(userExerciseStatsProvider.notifier).updateBestPullup(myCorrectScore);
      final cur = ref.read(dailyExerciseGoalsProvider).pullupCompleted;
      ref.read(dailyExerciseGoalsProvider.notifier).updatePullupProgress(cur + myCorrectScore);
    }

    // 3. Update Quests
    ref.read(challengesProvider.notifier).progressChallenges(
      exerciseType: exerciseType.id,
      reps: myCorrectScore,
      calories: cal,
      durationMinutes: durationMinutes,
      isBattleWin: isWin,
    );

    // 4. Add to Battle History
    ref.read(battleHistoryProvider.notifier).addHistory(
      BattleHistoryItem(
        id: 'bh_${DateTime.now().millisecondsSinceEpoch}',
        battleType: 'Đấu Camera 1v1',
        exerciseName: exerciseType.name,
        opponentName: 'Đối thủ Trực tuyến',
        opponentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        myScore: myCorrectScore,
        opponentScore: oppScore,
        result: result,
        xpGained: xpGained,
        pointsGained: pointsGained,
        timestamp: DateTime.now(),
      ),
    );

    // 5. Add to Activity Feed
    ref.read(activitiesProvider.notifier).addActivity(
      ActivitySession(
        id: 'act_battle_${DateTime.now().millisecondsSinceEpoch}',
        date: 'Vừa xong',
        duration: durationMinutes,
        calories: cal,
        heartRate: 145,
        type: '⚔️ Đấu ${exerciseType.name} (${isWin ? "Thắng" : "Thua"})',
        xp: xpGained,
      ),
    );
  }
}
