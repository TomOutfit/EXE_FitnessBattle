// User Models
class User {
  final String id;
  final String name;
  final String? email;
  final String avatar;
  final int level;
  final int xp;
  final int xpToNextLevel;
  final int streak;
  final int totalPoints;
  final int rank;
  final int winCount;
  final int loseCount;
  final int heartRate;
  final int calories;
  final String joinDate;
  final List<Badge> badges;
  final UserStats stats;
  final int ruby;
  final int stamina;
  final int maxStamina;
  final int coins;
  final int coinsExpiringDays;
  final bool hasBattlePass;
  final int battlePassTier;
  final bool isVIP;
  final String? vipSlot;
  final String? equippedSkinFrame;
  final String? equippedTitle;
  final DateTime? lastStaminaRefillAt;

  User({
    required this.id,
    required this.name,
    this.email,
    required this.avatar,
    required this.level,
    required this.xp,
    required this.xpToNextLevel,
    required this.streak,
    required this.totalPoints,
    required this.rank,
    required this.winCount,
    required this.loseCount,
    required this.heartRate,
    required this.calories,
    required this.joinDate,
    required this.badges,
    required this.stats,
    required this.ruby,
    required this.stamina,
    required this.maxStamina,
    required this.coins,
    required this.coinsExpiringDays,
    required this.hasBattlePass,
    required this.battlePassTier,
    required this.isVIP,
    this.vipSlot,
    this.equippedSkinFrame,
    this.equippedTitle,
    this.lastStaminaRefillAt,
  });

  /// Automatically computes and restores stamina based on real elapsed time
  /// Rate: 1 Stamina every 180 seconds (3 minutes) up to maxStamina
  User applyStaminaRegeneration({DateTime? now}) {
    final currentTime = now ?? DateTime.now();
    if (stamina >= maxStamina) {
      return copyWith(lastStaminaRefillAt: currentTime);
    }

    final lastRefill = lastStaminaRefillAt ?? currentTime;
    final secondsElapsed = currentTime.difference(lastRefill).inSeconds;
    const refillIntervalSeconds = 180; // 3 mins per 1 Stamina point

    if (secondsElapsed >= refillIntervalSeconds) {
      final pointsToAdd = secondsElapsed ~/ refillIntervalSeconds;
      final newStamina = (stamina + pointsToAdd).clamp(0, maxStamina);
      final remainingTime = lastRefill.add(Duration(seconds: pointsToAdd * refillIntervalSeconds));
      return copyWith(
        stamina: newStamina,
        lastStaminaRefillAt: newStamina >= maxStamina ? currentTime : remainingTime,
      );
    }

    return this;
  }

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? avatar,
    int? level,
    int? xp,
    int? xpToNextLevel,
    int? streak,
    int? totalPoints,
    int? rank,
    int? winCount,
    int? loseCount,
    int? heartRate,
    int? calories,
    String? joinDate,
    List<Badge>? badges,
    UserStats? stats,
    int? ruby,
    int? stamina,
    int? maxStamina,
    int? coins,
    int? coinsExpiringDays,
    bool? hasBattlePass,
    int? battlePassTier,
    bool? isVIP,
    String? vipSlot,
    String? equippedSkinFrame,
    String? equippedTitle,
    DateTime? lastStaminaRefillAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      avatar: avatar ?? this.avatar,
      level: level ?? this.level,
      xp: xp ?? this.xp,
      xpToNextLevel: xpToNextLevel ?? this.xpToNextLevel,
      streak: streak ?? this.streak,
      totalPoints: totalPoints ?? this.totalPoints,
      rank: rank ?? this.rank,
      winCount: winCount ?? this.winCount,
      loseCount: loseCount ?? this.loseCount,
      heartRate: heartRate ?? this.heartRate,
      calories: calories ?? this.calories,
      joinDate: joinDate ?? this.joinDate,
      badges: badges ?? this.badges,
      stats: stats ?? this.stats,
      ruby: ruby ?? this.ruby,
      stamina: stamina ?? this.stamina,
      maxStamina: maxStamina ?? this.maxStamina,
      coins: coins ?? this.coins,
      coinsExpiringDays: coinsExpiringDays ?? this.coinsExpiringDays,
      hasBattlePass: hasBattlePass ?? this.hasBattlePass,
      battlePassTier: battlePassTier ?? this.battlePassTier,
      isVIP: isVIP ?? this.isVIP,
      vipSlot: vipSlot ?? this.vipSlot,
      equippedSkinFrame: equippedSkinFrame ?? this.equippedSkinFrame,
      equippedTitle: equippedTitle ?? this.equippedTitle,
      lastStaminaRefillAt: lastStaminaRefillAt ?? this.lastStaminaRefillAt,
    );
  }
}

// Account Authentication Model
class AppAccount {
  final String id;
  final String name;
  final String email;
  final String passwordHash; // Salted SHA-256
  final String salt;
  final DateTime createdAt;
  final bool isVIP;

  AppAccount({
    required this.id,
    required this.name,
    required this.email,
    required this.passwordHash,
    required this.salt,
    required this.createdAt,
    this.isVIP = false,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'passwordHash': passwordHash,
    'salt': salt,
    'createdAt': createdAt.toIso8601String(),
    'isVIP': isVIP,
  };

  factory AppAccount.fromJson(Map<String, dynamic> map) => AppAccount(
    id: map['id'] ?? '',
    name: map['name'] ?? '',
    email: map['email'] ?? '',
    passwordHash: map['passwordHash'] ?? '',
    salt: map['salt'] ?? '',
    createdAt: DateTime.tryParse(map['createdAt'] ?? '') ?? DateTime.now(),
    isVIP: map['isVIP'] ?? false,
  );
}

class AuthResult {
  final bool success;
  final String? errorMessage;
  final User? user;
  final AppAccount? account;

  AuthResult({
    required this.success,
    this.errorMessage,
    this.user,
    this.account,
  });
}

class Badge {
  final String id;
  final String name;
  final String icon;
  final String color;
  final bool earned;

  Badge({
    required this.id,
    required this.name,
    required this.icon,
    required this.color,
    required this.earned,
  });

  Badge copyWith({
    String? id,
    String? name,
    String? icon,
    String? color,
    bool? earned,
  }) {
    return Badge(
      id: id ?? this.id,
      name: name ?? this.name,
      icon: icon ?? this.icon,
      color: color ?? this.color,
      earned: earned ?? this.earned,
    );
  }
}

class BattleHistoryItem {
  final String id;
  final String battleType;
  final String exerciseName;
  final String opponentName;
  final String opponentAvatar;
  final int myScore;
  final int opponentScore;
  final String result; // 'win', 'lose', 'draw', 'cheat'
  final int xpGained;
  final int pointsGained;
  final DateTime timestamp;

  BattleHistoryItem({
    required this.id,
    required this.battleType,
    required this.exerciseName,
    required this.opponentName,
    required this.opponentAvatar,
    required this.myScore,
    required this.opponentScore,
    required this.result,
    required this.xpGained,
    required this.pointsGained,
    required this.timestamp,
  });
}

class UserStats {
  final int totalWorkouts;
  final int totalMinutes;
  final int avgHeartRate;
  final int totalCalories;
  final List<int> weeklyMinutes;
  final List<int> weeklyCalories;

  UserStats({
    required this.totalWorkouts,
    required this.totalMinutes,
    required this.avgHeartRate,
    required this.totalCalories,
    required this.weeklyMinutes,
    required this.weeklyCalories,
  });
}

// Battle Models
class Battle {
  final String id;
  final String title;
  final BattleType type;
  final BattleStatus status;
  final List<BattlePlayer> players;
  final int duration;
  final String? startedAt;
  final String? endedAt;
  final BattleReward reward;
  final String exerciseType;
  final ArenaType? arenaType;
  final int? rubyStake;
  final int? staminaCost;
  final BrandPartner? brandPartner;
  final int? spectatorCount;

  Battle({
    required this.id,
    required this.title,
    required this.type,
    required this.status,
    required this.players,
    required this.duration,
    this.startedAt,
    this.endedAt,
    required this.reward,
    required this.exerciseType,
    this.arenaType,
    this.rubyStake,
    this.staminaCost,
    this.brandPartner,
    this.spectatorCount,
  });

  Battle copyWith({
    String? id,
    String? title,
    BattleType? type,
    BattleStatus? status,
    List<BattlePlayer>? players,
    int? duration,
    String? startedAt,
    String? endedAt,
    BattleReward? reward,
    String? exerciseType,
    ArenaType? arenaType,
    int? rubyStake,
    int? staminaCost,
    BrandPartner? brandPartner,
    int? spectatorCount,
  }) {
    return Battle(
      id: id ?? this.id,
      title: title ?? this.title,
      type: type ?? this.type,
      status: status ?? this.status,
      players: players ?? this.players,
      duration: duration ?? this.duration,
      startedAt: startedAt ?? this.startedAt,
      endedAt: endedAt ?? this.endedAt,
      reward: reward ?? this.reward,
      exerciseType: exerciseType ?? this.exerciseType,
      arenaType: arenaType ?? this.arenaType,
      rubyStake: rubyStake ?? this.rubyStake,
      staminaCost: staminaCost ?? this.staminaCost,
      brandPartner: brandPartner ?? this.brandPartner,
      spectatorCount: spectatorCount ?? this.spectatorCount,
    );
  }
}

enum BattleType { ranked, friendly, challenge, ruby_stake, titan, brand_spot }

enum BattleStatus { waiting, active, finished }

enum ArenaType { normal, premium, brand }

class BattlePlayer {
  final String oderId;
  final String oderName;
  final String avatar;
  final int score;
  final int heartRate;
  final int duration;
  final bool isActive;

  BattlePlayer({
    required this.oderId,
    required this.oderName,
    required this.avatar,
    required this.score,
    required this.heartRate,
    required this.duration,
    required this.isActive,
  });
}

class BattleReward {
  final int xp;
  final int coins;
  final int? ruby;
  final String? badgeId;

  BattleReward({
    required this.xp,
    required this.coins,
    this.ruby,
    this.badgeId,
  });
}

class BrandPartner {
  final String name;
  final String logo;
  final String location;
  final String sponsorBonus;

  BrandPartner({
    required this.name,
    required this.logo,
    required this.location,
    required this.sponsorBonus,
  });
}

// Challenge Models
class Challenge {
  final String id;
  final String title;
  final String description;
  final ChallengeType type;
  final int target;
  final int current;
  final String unit;
  final ChallengeReward reward;
  final String expiresAt;
  final String icon;
  final String color;
  final bool completed;

  Challenge({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.target,
    required this.current,
    required this.unit,
    required this.reward,
    required this.expiresAt,
    required this.icon,
    required this.color,
    required this.completed,
  });

  Challenge copyWith({
    String? id,
    String? title,
    String? description,
    ChallengeType? type,
    int? target,
    int? current,
    String? unit,
    ChallengeReward? reward,
    String? expiresAt,
    String? icon,
    String? color,
    bool? completed,
  }) {
    return Challenge(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      type: type ?? this.type,
      target: target ?? this.target,
      current: current ?? this.current,
      unit: unit ?? this.unit,
      reward: reward ?? this.reward,
      expiresAt: expiresAt ?? this.expiresAt,
      icon: icon ?? this.icon,
      color: color ?? this.color,
      completed: completed ?? this.completed,
    );
  }
}

enum ChallengeType { daily, weekly, monthly, special }

class ChallengeReward {
  final int xp;
  final int coins;
  final int? ruby;

  ChallengeReward({
    required this.xp,
    required this.coins,
    this.ruby,
  });
}

// Leaderboard Models
class LeaderboardEntry {
  final int rank;
  final String oderId;
  final String oderName;
  final String avatar;
  final int level;
  final int points;
  final bool? isCurrentUser;
  final bool? isVIP;

  LeaderboardEntry({
    required this.rank,
    required this.oderId,
    required this.oderName,
    required this.avatar,
    required this.level,
    required this.points,
    this.isCurrentUser,
    this.isVIP,
  });

  LeaderboardEntry copyWith({
    int? rank,
    String? oderId,
    String? oderName,
    String? avatar,
    int? level,
    int? points,
    bool? isCurrentUser,
    bool? isVIP,
  }) {
    return LeaderboardEntry(
      rank: rank ?? this.rank,
      oderId: oderId ?? this.oderId,
      oderName: oderName ?? this.oderName,
      avatar: avatar ?? this.avatar,
      level: level ?? this.level,
      points: points ?? this.points,
      isCurrentUser: isCurrentUser ?? this.isCurrentUser,
      isVIP: isVIP ?? this.isVIP,
    );
  }
}

// Activity Models
class ActivitySession {
  final String id;
  final String date;
  final int duration;
  final int calories;
  final int heartRate;
  final String type;
  final int xp;

  ActivitySession({
    required this.id,
    required this.date,
    required this.duration,
    required this.calories,
    required this.heartRate,
    required this.type,
    required this.xp,
  });
}

class Friend {
  final String id;
  final String name;
  final String avatar;
  final int level;
  final int streak;
  final bool isOnline;
  final String lastActive;

  Friend({
    required this.id,
    required this.name,
    required this.avatar,
    required this.level,
    required this.streak,
    required this.isOnline,
    required this.lastActive,
  });
}

class ExerciseType {
  final String id;
  final String name;
  final String duration;
  final String color;

  ExerciseType({
    required this.id,
    required this.name,
    required this.duration,
    required this.color,
  });
}

// Battle Pass Models
enum BattlePassRewardType { xp, coins, ruby, voucher, skin, badge }

class BattlePassReward {
  final BattlePassRewardType type;
  final int? amount;
  final String label;
  final String? description;
  final String? voucherPartner;

  BattlePassReward({
    required this.type,
    this.amount,
    required this.label,
    this.description,
    this.voucherPartner,
  });
}

class BattlePassLevel {
  final int level;
  final int xpRequired;
  final BattlePassReward freeReward;
  final BattlePassReward? premiumReward;
  final String? mission;

  BattlePassLevel({
    required this.level,
    required this.xpRequired,
    required this.freeReward,
    this.premiumReward,
    this.mission,
  });
}

class BattlePassSeason {
  final String id;
  final String name;
  final String startDate;
  final String endDate;
  final int daysRemaining;
  final int totalLevels;
  final int currentLevel;
  final int currentXP;
  final int xpToNextLevel;
  final bool isPremium;
  final List<BattlePassLevel> levels;
  final int prizesClaimed;
  final int totalPrizes;

  BattlePassSeason({
    required this.id,
    required this.name,
    required this.startDate,
    required this.endDate,
    required this.daysRemaining,
    required this.totalLevels,
    required this.currentLevel,
    required this.currentXP,
    required this.xpToNextLevel,
    required this.isPremium,
    required this.levels,
    required this.prizesClaimed,
    required this.totalPrizes,
  });
}

class Voucher {
  final String id;
  final String partner;
  final String partnerLogo;
  final String value;
  final String description;
  final String expiresAt;
  final String? code;
  final bool claimed;
  final String? claimedAt;

  Voucher({
    required this.id,
    required this.partner,
    required this.partnerLogo,
    required this.value,
    required this.description,
    required this.expiresAt,
    this.code,
    required this.claimed,
    this.claimedAt,
  });
}

class PremiumArena {
  final String id;
  final String name;
  final String description;
  final int entryRuby;
  final int prizePool;
  final List<PrizeBreakdown> prizePoolBreakdown;
  final int participants;
  final int maxParticipants;
  final ArenaStatus status;
  final String? startTime;
  final String exerciseType;
  final int duration;

  PremiumArena({
    required this.id,
    required this.name,
    required this.description,
    required this.entryRuby,
    required this.prizePool,
    required this.prizePoolBreakdown,
    required this.participants,
    required this.maxParticipants,
    required this.status,
    this.startTime,
    required this.exerciseType,
    required this.duration,
  });
}

enum ArenaStatus { open, countdown, live, finished }

class PrizeBreakdown {
  final String position;
  final String reward;

  PrizeBreakdown({
    required this.position,
    required this.reward,
  });
}

// Shop Models
enum SkinRarity { common, rare, epic, legendary }

class SkinItem {
  final String id;
  final String name;
  final SkinType type;
  final String preview;
  final int price;
  final SkinRarity rarity;
  final bool owned;
  final bool? limited;
  final String? season;

  SkinItem({
    required this.id,
    required this.name,
    required this.type,
    required this.preview,
    required this.price,
    required this.rarity,
    required this.owned,
    this.limited,
    this.season,
  });

  SkinItem copyWith({
    String? id,
    String? name,
    SkinType? type,
    String? preview,
    int? price,
    SkinRarity? rarity,
    bool? owned,
    bool? limited,
    String? season,
  }) {
    return SkinItem(
      id: id ?? this.id,
      name: name ?? this.name,
      type: type ?? this.type,
      preview: preview ?? this.preview,
      price: price ?? this.price,
      rarity: rarity ?? this.rarity,
      owned: owned ?? this.owned,
      limited: limited ?? this.limited,
      season: season ?? this.season,
    );
  }
}

enum SkinType { avatar_frame, victory_effect, title, badge }
