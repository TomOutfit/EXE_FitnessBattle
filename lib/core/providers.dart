import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'models.dart';
import 'mock_data.dart';
import 'services/step_tracking_service.dart';

// Re-export exercise providers
export 'mock_data_exercise.dart' show 
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

// User State
class UserNotifier extends StateNotifier<User> {
  UserNotifier() : super(currentUser);

  void updateUser(User user) {
    state = user;
  }

  void updateBattleResult(int myScore, int oppScore, String result) {
    final xpGained = result == 'cheat' ? 0 : (myScore * 1.5).floor();
    final pointsGained = result == 'cheat' 
        ? -50 
        : result == 'lose' 
            ? (myScore * 0.3).floor() 
            : (myScore * 2).floor();
    final streakChange = result == 'win' 
        ? 1 
        : result == 'lose' 
            ? -state.streak.clamp(0, 2) 
            : 0;

    final newXp = state.xp + xpGained;
    final levelUp = newXp >= state.xpToNextLevel;
    final newLevel = levelUp ? state.level + 1 : state.level;
    final remainingXp = levelUp ? newXp - state.xpToNextLevel : newXp;

    state = state.copyWith(
      xp: remainingXp,
      level: newLevel,
      xpToNextLevel: levelUp ? (state.xpToNextLevel * 1.5).floor() : state.xpToNextLevel,
      totalPoints: (state.totalPoints + pointsGained).clamp(0, 99999999),
      streak: (state.streak + streakChange).clamp(0, 999),
      winCount: (result == 'win' || result == 'opp_cheat') ? state.winCount + 1 : state.winCount,
      loseCount: result == 'lose' ? state.loseCount + 1 : state.loseCount,
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
    state = state.copyWith(stamina: state.stamina - amount);
    return true;
  }

  void refillStamina() {
    state = state.copyWith(stamina: state.maxStamina);
  }

  void buyRuby(int amount) {
    state = state.copyWith(ruby: state.ruby + amount);
  }
}

final userProvider = StateNotifierProvider<UserNotifier, User>((ref) {
  return UserNotifier();
});

// Step Tracking State
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

// Leaderboard State
class LeaderboardNotifier extends StateNotifier<List<LeaderboardEntry>> {
  LeaderboardNotifier() : super(leaderboard);

  void updateUserPoints(String userId, int newPoints) {
    final updated = state.map((entry) {
      if (entry.oderId == userId || entry.isCurrentUser == true) {
        return entry.copyWith(points: newPoints);
      }
      return entry;
    }).toList();
    updated.sort((a, b) => b.points.compareTo(a.points));
    state = updated.asMap().entries.map((e) => e.value.copyWith(rank: e.key + 1)).toList();
  }
}

final leaderboardProvider = StateNotifierProvider<LeaderboardNotifier, List<LeaderboardEntry>>((ref) {
  return LeaderboardNotifier();
});

// Battles State
class BattlesNotifier extends StateNotifier<List<Battle>> {
  BattlesNotifier() : super(battles);

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

// Challenges State
class ChallengesNotifier extends StateNotifier<List<Challenge>> {
  ChallengesNotifier() : super(challenges);

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
  }

  void claimReward(String challengeId) {
    state = state.map((c) {
      if (c.id == challengeId) {
        return c.copyWith(completed: true);
      }
      return c;
    }).toList();
  }
}

final challengesProvider = StateNotifierProvider<ChallengesNotifier, List<Challenge>>((ref) {
  return ChallengesNotifier();
});

// Friends Provider
final friendsProvider = Provider<List<Friend>>((ref) {
  return friends;
});

// Activities State
class ActivitiesNotifier extends StateNotifier<List<ActivitySession>> {
  ActivitiesNotifier() : super(recentActivities);

  void addActivity(ActivitySession session) {
    state = [session, ...state];
  }
}

final activitiesProvider = StateNotifierProvider<ActivitiesNotifier, List<ActivitySession>>((ref) {
  return ActivitiesNotifier();
});

// Exercise Types Provider
final exerciseTypesProvider = Provider<List<ExerciseType>>((ref) {
  return exerciseTypes;
});

// Battle Pass Provider
final battlePassProvider = Provider<BattlePassSeason>((ref) {
  return battlePassSeason;
});

// Vouchers Provider
final vouchersProvider = Provider<List<Voucher>>((ref) {
  return vouchers;
});

// Premium Arenas Provider
final premiumArenasProvider = Provider<List<PremiumArena>>((ref) {
  return premiumArenas;
});

// Skin Items State
class SkinItemsNotifier extends StateNotifier<List<SkinItem>> {
  SkinItemsNotifier() : super(skinItems);

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
