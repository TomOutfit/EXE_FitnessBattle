import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models.dart';
import '../models_exercise.dart';
import '../seed_data.dart';

/// AppDatabase - Dynamic Persistent Database Engine for Mobile App
/// Stores and manages all collections dynamically with persistent local storage
class AppDatabase {
  static const String _keyDbVersion = 'fb_db_version_v2';
  static const String _keyUser = 'fb_db_user';
  static const String _keyAccounts = 'fb_db_accounts';
  static const String _keyCurrentAccountId = 'fb_db_current_account_id';
  static const String _keyIsLoggedIn = 'fb_db_is_logged_in';
  static const String _keyBadges = 'fb_db_badges';
  static const String _keyChallenges = 'fb_db_challenges';
  static const String _keyExerciseStats = 'fb_db_exercise_stats';
  static const String _keyExerciseSessions = 'fb_db_exercise_sessions';
  static const String _keyBattleHistory = 'fb_db_battle_history';
  static const String _keyArenas = 'fb_db_arenas';
  static const String _keyShopItems = 'fb_db_shop_items';
  static const String _keyLeaderboard = 'fb_db_leaderboard';

  static AppDatabase? _instance;
  static AppDatabase get instance => _instance ??= AppDatabase._();

  AppDatabase._();

  SharedPreferences? _prefs;

  Future<void> initialize() async {
    _prefs ??= await SharedPreferences.getInstance();
    
    // Check if database is already initialized
    final bool isInitialized = _prefs?.getBool(_keyDbVersion) ?? false;
    if (!isInitialized) {
      await seedInitialData();
    }
  }

  /// Hash password using Salted SHA-256 for secure DB storage
  static String hashPassword(String password, String salt) {
    final bytes = utf8.encode('$salt#FitnessBattle#$password#$salt');
    return sha256.convert(bytes).toString();
  }

  /// Seed rich, realistic initial Vietnamese data into database
  Future<void> seedInitialData() async {
    _prefs ??= await SharedPreferences.getInstance();

    // 1. Seed Accounts & User
    final demoSalt = 'fb_salt_demo_2026';
    final vipSalt = 'fb_salt_vip_2026';
    final initialAccounts = [
      AppAccount(
        id: 'user-tomoutfit',
        name: 'TomOutfit',
        email: 'tomoutfit@fitnessbattle.vn',
        passwordHash: hashPassword('tomoutfit123', demoSalt),
        salt: demoSalt,
        createdAt: DateTime.now().subtract(const Duration(days: 30)),
        isVIP: false,
      ),
      AppAccount(
        id: 'user-vip',
        name: 'VIP Pro Master',
        email: 'vip@fitnessbattle.vn',
        passwordHash: hashPassword('vip123456', vipSalt),
        salt: vipSalt,
        createdAt: DateTime.now().subtract(const Duration(days: 60)),
        isVIP: true,
      ),
    ];
    await _saveAccountsList(initialAccounts);
    await _prefs?.setString(_keyCurrentAccountId, 'user-tomoutfit');
    await _prefs?.setBool(_keyIsLoggedIn, true);

    await saveUser(initialUserSeed);

    // 2. Seed Challenges
    await saveChallenges(initialChallengesSeed);

    // 3. Seed Exercise Stats
    await saveExerciseStats(initialExerciseStatsSeed);

    // 4. Seed Exercise Sessions
    final initialSessions = [
      ExerciseSession(
        id: 'sess_seed_1',
        oderId: 'user-1',
        type: ExerciseTypeEnum.pushup,
        count: 45,
        correctFormCount: 42,
        durationSeconds: 360,
        startedAt: DateTime.now().subtract(const Duration(hours: 5)),
        completedAt: DateTime.now().subtract(const Duration(hours: 5, minutes: -6)),
        caloriesBurned: 180,
        xpEarned: 120,
        pointsEarned: 85,
        accuracy: ExerciseAccuracy(percentage: 93.3, correctReps: 42, totalReps: 45, incorrectReps: 3, warningReps: 0),
      ),
      ExerciseSession(
        id: 'sess_seed_2',
        oderId: 'user-1',
        type: ExerciseTypeEnum.pullup,
        count: 15,
        correctFormCount: 12,
        durationSeconds: 300,
        startedAt: DateTime.now().subtract(const Duration(days: 1, hours: 3)),
        completedAt: DateTime.now().subtract(const Duration(days: 1, hours: 3, minutes: -5)),
        caloriesBurned: 120,
        xpEarned: 75,
        pointsEarned: 45,
        accuracy: ExerciseAccuracy(percentage: 80.0, correctReps: 12, totalReps: 15, incorrectReps: 3, warningReps: 0),
      ),
    ];
    await _saveExerciseSessionsList(initialSessions);

    // 5. Seed Battle History
    final initialHistory = [
      BattleHistoryItem(
        id: 'bh_seed_1',
        battleType: 'Xếp Hạng',
        exerciseName: 'Hít Đất',
        opponentName: 'Tuấn Titan',
        opponentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        myScore: 42,
        opponentScore: 38,
        result: 'win',
        xpGained: 65,
        pointsGained: 84,
        timestamp: DateTime.now().subtract(const Duration(hours: 3)),
      ),
      BattleHistoryItem(
        id: 'bh_seed_2',
        battleType: 'Giao Hữu',
        exerciseName: 'Kéo Xà',
        opponentName: 'Minh Vũ',
        opponentAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
        myScore: 16,
        opponentScore: 18,
        result: 'lose',
        xpGained: 24,
        pointsGained: 15,
        timestamp: DateTime.now().subtract(const Duration(days: 1)),
      ),
      BattleHistoryItem(
        id: 'bh_seed_3',
        battleType: 'Đấu Camera 1v1',
        exerciseName: 'Hít Đất',
        opponentName: 'Hoàng Long',
        opponentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        myScore: 35,
        opponentScore: 30,
        result: 'win',
        xpGained: 55,
        pointsGained: 70,
        timestamp: DateTime.now().subtract(const Duration(days: 2)),
      ),
    ];
    await _saveBattleHistoryList(initialHistory);

    // 6. Seed Shop Items
    await saveShopItems(initialShopItemsSeed);

    // 7. Seed Arenas
    await saveArenas(initialArenasSeed);

    // 8. Seed Leaderboard
    await saveLeaderboard(initialLeaderboardSeed);

    await _prefs?.setBool(_keyDbVersion, true);
  }

  // ============================================================
  // AUTHENTICATION & MULTI-ACCOUNT METHODS
  // ============================================================
  bool isLoggedIn() {
    return _prefs?.getBool(_keyIsLoggedIn) ?? true;
  }

  String getCurrentAccountId() {
    return _prefs?.getString(_keyCurrentAccountId) ?? 'user-1';
  }

  List<AppAccount> getAllAccounts() {
    try {
      final raw = _prefs?.getString(_keyAccounts);
      if (raw == null) return [];
      final list = jsonDecode(raw) as List<dynamic>;
      return list.map<AppAccount>((item) => AppAccount.fromJson(item as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> _saveAccountsList(List<AppAccount> accounts) async {
    _prefs ??= await SharedPreferences.getInstance();
    final jsonList = accounts.map((a) => a.toJson()).toList();
    await _prefs?.setString(_keyAccounts, jsonEncode(jsonList));
  }

  /// Register new user account with secure password hashing
  Future<AuthResult> register({
    required String name,
    required String email,
    required String password,
  }) async {
    _prefs ??= await SharedPreferences.getInstance();
    final cleanEmail = email.trim().toLowerCase();
    final accounts = getAllAccounts();

    if (accounts.any((a) => a.email.toLowerCase() == cleanEmail)) {
      return AuthResult(success: false, errorMessage: 'Email này đã được đăng ký tài khoản!');
    }

    final newId = 'user_${DateTime.now().millisecondsSinceEpoch}';
    final salt = 'salt_${DateTime.now().millisecondsSinceEpoch}';
    final passwordHash = hashPassword(password, salt);

    final newAccount = AppAccount(
      id: newId,
      name: name.trim(),
      email: cleanEmail,
      passwordHash: passwordHash,
      salt: salt,
      createdAt: DateTime.now(),
      isVIP: false,
    );

    accounts.add(newAccount);
    await _saveAccountsList(accounts);
    await _prefs?.setString(_keyCurrentAccountId, newId);
    await _prefs?.setBool(_keyIsLoggedIn, true);
    final newUser = createNewcomerUser(
      id: newId,
      name: name.trim(),
      email: cleanEmail,
    );
    await saveUser(newUser);

    return AuthResult(success: true, user: newUser, account: newAccount);
  }

  /// Login with email and password
  Future<AuthResult> login({
    required String email,
    required String password,
  }) async {
    _prefs ??= await SharedPreferences.getInstance();
    final cleanEmail = email.trim().toLowerCase();
    final accounts = getAllAccounts();

    final match = accounts.cast<AppAccount?>().firstWhere(
      (a) => a?.email.toLowerCase() == cleanEmail,
      orElse: () => null,
    );

    if (match == null) {
      return AuthResult(success: false, errorMessage: 'Tài khoản không tồn tại!');
    }

    final computedHash = hashPassword(password, match.salt);
    if (computedHash != match.passwordHash) {
      return AuthResult(success: false, errorMessage: 'Mật khẩu không chính xác!');
    }

    await _prefs?.setString(_keyCurrentAccountId, match.id);
    await _prefs?.setBool(_keyIsLoggedIn, true);

    var user = getUser();
    if (user.id != match.id) {
      user = user.copyWith(
        id: match.id,
        name: match.name,
        email: match.email,
        isVIP: match.isVIP,
      );
      await saveUser(user);
    }

    return AuthResult(success: true, user: user, account: match);
  }

  /// Logout current session
  Future<void> logout() async {
    _prefs ??= await SharedPreferences.getInstance();
    await _prefs?.setBool(_keyIsLoggedIn, false);
  }

  /// Quick Switch to another existing account (e.g. VIP or Demo)
  Future<User> switchAccount(String accountId) async {
    _prefs ??= await SharedPreferences.getInstance();
    final accounts = getAllAccounts();
    final target = accounts.firstWhere((a) => a.id == accountId, orElse: () => accounts.first);

    await _prefs?.setString(_keyCurrentAccountId, target.id);
    await _prefs?.setBool(_keyIsLoggedIn, true);

    if (target.isVIP) {
      final vipUser = initialUserSeed.copyWith(
        id: target.id,
        name: target.name,
        email: target.email,
        level: 25,
        xp: 12500,
        xpToNextLevel: 15000,
        streak: 35,
        totalPoints: 24500,
        ruby: 1200,
        coins: 25000,
        stamina: 500,
        maxStamina: 500,
        isVIP: true,
        equippedSkinFrame: '🐉 Rồng Lửa Frame VIP',
        equippedTitle: '👑 VIP Battle Master',
      );
      await saveUser(vipUser);
      return vipUser;
    } else {
      final demoUser = initialUserSeed.copyWith(
        id: target.id,
        name: target.name,
        email: target.email,
      );
      await saveUser(demoUser);
      return demoUser;
    }
  }

  // ============================================================
  // USER CRUD
  // ============================================================
  Future<void> saveUser(User user) async {
    _prefs ??= await SharedPreferences.getInstance();
    final jsonMap = {
      'id': user.id,
      'name': user.name,
      'avatar': user.avatar,
      'level': user.level,
      'xp': user.xp,
      'xpToNextLevel': user.xpToNextLevel,
      'streak': user.streak,
      'totalPoints': user.totalPoints,
      'rank': user.rank,
      'winCount': user.winCount,
      'loseCount': user.loseCount,
      'heartRate': user.heartRate,
      'calories': user.calories,
      'joinDate': user.joinDate,
      'ruby': user.ruby,
      'stamina': user.stamina,
      'maxStamina': user.maxStamina,
      'coins': user.coins,
      'coinsExpiringDays': user.coinsExpiringDays,
      'hasBattlePass': user.hasBattlePass,
      'battlePassTier': user.battlePassTier,
      'isVIP': user.isVIP,
      'equippedSkinFrame': user.equippedSkinFrame,
      'equippedTitle': user.equippedTitle,
      'lastStaminaRefillAt': user.lastStaminaRefillAt?.toIso8601String(),
      'badges': user.badges.map((b) => {
        'id': b.id,
        'name': b.name,
        'icon': b.icon,
        'color': b.color,
        'earned': b.earned,
      }).toList(),
      'stats': {
        'totalWorkouts': user.stats.totalWorkouts,
        'totalMinutes': user.stats.totalMinutes,
        'avgHeartRate': user.stats.avgHeartRate,
        'totalCalories': user.stats.totalCalories,
        'weeklyMinutes': user.stats.weeklyMinutes,
        'weeklyCalories': user.stats.weeklyCalories,
      },
    };
    await _prefs?.setString(_keyUser, jsonEncode(jsonMap));
  }

  User getUser() {
    try {
      final raw = _prefs?.getString(_keyUser);
      if (raw == null) return initialUserSeed.applyStaminaRegeneration();
      final map = jsonDecode(raw) as Map<String, dynamic>;

      final rawBadges = (map['badges'] as List<dynamic>?) ?? [];
      final badges = rawBadges.map<Badge>((b) => Badge(
        id: b['id'] ?? '',
        name: b['name'] ?? '',
        icon: b['icon'] ?? '',
        color: b['color'] ?? '#FF6B35',
        earned: b['earned'] ?? false,
      )).toList();

      final rawStats = (map['stats'] as Map<String, dynamic>?) ?? {};
      final stats = UserStats(
        totalWorkouts: rawStats['totalWorkouts'] ?? 89,
        totalMinutes: rawStats['totalMinutes'] ?? 2840,
        avgHeartRate: rawStats['avgHeartRate'] ?? 135,
        totalCalories: rawStats['totalCalories'] ?? 42500,
        weeklyMinutes: List<int>.from(rawStats['weeklyMinutes'] ?? [45, 60, 30, 90, 0, 75, 55]),
        weeklyCalories: List<int>.from(rawStats['weeklyCalories'] ?? [320, 410, 220, 580, 0, 490, 380]),
      );

      final isOldDefault = map['name'] == 'Bạn' || map['name'] == 'Chiến Binh Titan';
      final loadedUser = User(
        id: isOldDefault ? 'user-tomoutfit' : (map['id'] ?? initialUserSeed.id),
        name: isOldDefault ? 'TomOutfit' : (map['name'] ?? initialUserSeed.name),
        avatar: isOldDefault ? initialUserSeed.avatar : (map['avatar'] ?? initialUserSeed.avatar),
        level: map['level'] ?? initialUserSeed.level,
        xp: map['xp'] ?? initialUserSeed.xp,
        xpToNextLevel: map['xpToNextLevel'] ?? initialUserSeed.xpToNextLevel,
        streak: map['streak'] ?? initialUserSeed.streak,
        totalPoints: map['totalPoints'] ?? initialUserSeed.totalPoints,
        rank: map['rank'] ?? initialUserSeed.rank,
        winCount: map['winCount'] ?? initialUserSeed.winCount,
        loseCount: map['loseCount'] ?? initialUserSeed.loseCount,
        heartRate: map['heartRate'] ?? initialUserSeed.heartRate,
        calories: map['calories'] ?? initialUserSeed.calories,
        joinDate: map['joinDate'] ?? initialUserSeed.joinDate,
        badges: badges.isNotEmpty ? badges : initialUserSeed.badges,
        stats: stats,
        ruby: map['ruby'] ?? initialUserSeed.ruby,
        stamina: map['stamina'] ?? initialUserSeed.stamina,
        maxStamina: map['maxStamina'] ?? initialUserSeed.maxStamina,
        coins: map['coins'] ?? initialUserSeed.coins,
        coinsExpiringDays: map['coinsExpiringDays'] ?? initialUserSeed.coinsExpiringDays,
        hasBattlePass: map['hasBattlePass'] ?? initialUserSeed.hasBattlePass,
        battlePassTier: map['battlePassTier'] ?? initialUserSeed.battlePassTier,
        isVIP: map['isVIP'] ?? initialUserSeed.isVIP,
        equippedSkinFrame: map['equippedSkinFrame'] ?? initialUserSeed.equippedSkinFrame,
        equippedTitle: map['equippedTitle'] ?? initialUserSeed.equippedTitle,
        lastStaminaRefillAt: map['lastStaminaRefillAt'] != null
            ? DateTime.tryParse(map['lastStaminaRefillAt'])
            : null,
      );

      return loadedUser.applyStaminaRegeneration();
    } catch (_) {
      return initialUserSeed.applyStaminaRegeneration();
    }
  }

  // ============================================================
  // CHALLENGES CRUD
  // ============================================================
  Future<void> saveChallenges(List<Challenge> items) async {
    _prefs ??= await SharedPreferences.getInstance();
    final jsonList = items.map((c) => {
      'id': c.id,
      'title': c.title,
      'description': c.description,
      'type': c.type.name,
      'target': c.target,
      'current': c.current,
      'unit': c.unit,
      'reward': {
        'xp': c.reward.xp,
        'coins': c.reward.coins,
        'ruby': c.reward.ruby,
      },
      'expiresAt': c.expiresAt,
      'completed': c.completed,
      'icon': c.icon,
      'color': c.color,
    }).toList();
    await _prefs?.setString(_keyChallenges, jsonEncode(jsonList));
  }

  List<Challenge> getChallenges() {
    try {
      final raw = _prefs?.getString(_keyChallenges);
      if (raw == null) return initialChallengesSeed;
      final list = jsonDecode(raw) as List<dynamic>;
      return list.map<Challenge>((c) {
        final rew = c['reward'] ?? {};
        return Challenge(
          id: c['id'] ?? '',
          title: c['title'] ?? '',
          description: c['description'] ?? '',
          type: c['type'] == 'weekly' ? ChallengeType.weekly : ChallengeType.daily,
          target: c['target'] ?? 10,
          current: c['current'] ?? 0,
          unit: c['unit'] ?? 'lần',
          reward: ChallengeReward(
            xp: rew['xp'] ?? 100,
            coins: rew['coins'] ?? 50,
            ruby: rew['ruby'],
          ),
          expiresAt: c['expiresAt'] ?? '1 ngày',
          completed: c['completed'] ?? false,
          icon: c['icon'] ?? '🔥',
          color: c['color'] ?? '#FF6B35',
        );
      }).toList();
    } catch (_) {
      return initialChallengesSeed;
    }
  }

  // ============================================================
  // EXERCISE STATS CRUD
  // ============================================================
  Future<void> saveExerciseStats(UserExerciseStats stats) async {
    _prefs ??= await SharedPreferences.getInstance();
    final map = {
      'oderId': stats.oderId,
      'totalPushups': stats.totalPushups,
      'totalPullups': stats.totalPullups,
      'totalWalkingSteps': stats.totalWalkingSteps,
      'currentStreak': stats.currentStreak,
      'longestStreak': stats.longestStreak,
      'bestPushupCount': stats.bestPushupCount,
      'bestPullupCount': stats.bestPullupCount,
      'totalExerciseSessions': stats.totalExerciseSessions,
      'totalCaloriesBurned': stats.totalCaloriesBurned,
      'weeklyPushups': stats.weeklyPushups,
      'weeklyPullups': stats.weeklyPullups,
    };
    await _prefs?.setString(_keyExerciseStats, jsonEncode(map));
  }

  UserExerciseStats getExerciseStats() {
    try {
      final raw = _prefs?.getString(_keyExerciseStats);
      if (raw == null) return initialExerciseStatsSeed;
      final map = jsonDecode(raw) as Map<String, dynamic>;
      return UserExerciseStats(
        oderId: map['oderId'] ?? 'user-1',
        totalPushups: map['totalPushups'] ?? 1245,
        totalPullups: map['totalPullups'] ?? 320,
        totalWalkingSteps: map['totalWalkingSteps'] ?? 456789,
        currentStreak: map['currentStreak'] ?? 14,
        longestStreak: map['longestStreak'] ?? 28,
        bestPushupCount: map['bestPushupCount'] ?? 52,
        bestPullupCount: map['bestPullupCount'] ?? 18,
        totalExerciseSessions: map['totalExerciseSessions'] ?? 89,
        totalCaloriesBurned: map['totalCaloriesBurned'] ?? 42500,
        weeklyPushups: List<int>.from(map['weeklyPushups'] ?? [120, 135, 100, 150, 80, 160, 145]),
        weeklyPullups: List<int>.from(map['weeklyPullups'] ?? [25, 30, 20, 35, 15, 40, 32]),
      );
    } catch (_) {
      return initialExerciseStatsSeed;
    }
  }

  // ============================================================
  // BATTLE HISTORY CRUD
  // ============================================================
  Future<void> _saveBattleHistoryList(List<BattleHistoryItem> items) async {
    _prefs ??= await SharedPreferences.getInstance();
    final jsonList = items.map((h) => {
      'id': h.id,
      'battleType': h.battleType,
      'exerciseName': h.exerciseName,
      'opponentName': h.opponentName,
      'opponentAvatar': h.opponentAvatar,
      'myScore': h.myScore,
      'opponentScore': h.opponentScore,
      'result': h.result,
      'xpGained': h.xpGained,
      'pointsGained': h.pointsGained,
      'timestamp': h.timestamp.toIso8601String(),
    }).toList();
    await _prefs?.setString(_keyBattleHistory, jsonEncode(jsonList));
  }

  Future<void> addBattleHistory(BattleHistoryItem item) async {
    final list = getBattleHistory();
    list.insert(0, item);
    await _saveBattleHistoryList(list.take(50).toList());
  }

  List<BattleHistoryItem> getBattleHistory() {
    try {
      final raw = _prefs?.getString(_keyBattleHistory);
      if (raw == null) return [];
      final list = jsonDecode(raw) as List<dynamic>;
      return list.map<BattleHistoryItem>((h) => BattleHistoryItem(
        id: h['id'] ?? '',
        battleType: h['battleType'] ?? 'Xếp Hạng',
        exerciseName: h['exerciseName'] ?? 'Hít Đất',
        opponentName: h['opponentName'] ?? 'Đối thủ',
        opponentAvatar: h['opponentAvatar'] ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        myScore: h['myScore'] ?? 0,
        opponentScore: h['opponentScore'] ?? 0,
        result: h['result'] ?? 'win',
        xpGained: h['xpGained'] ?? 50,
        pointsGained: h['pointsGained'] ?? 60,
        timestamp: DateTime.tryParse(h['timestamp'] ?? '') ?? DateTime.now(),
      )).toList();
    } catch (_) {
      return [];
    }
  }

  // ============================================================
  // EXERCISE SESSIONS CRUD
  // ============================================================
  Future<void> _saveExerciseSessionsList(List<ExerciseSession> sessions) async {
    _prefs ??= await SharedPreferences.getInstance();
    final jsonList = sessions.map((s) => {
      'id': s.id,
      'oderId': s.oderId,
      'type': s.type.id,
      'count': s.count,
      'correctFormCount': s.correctFormCount,
      'durationSeconds': s.durationSeconds,
      'startedAt': s.startedAt.toIso8601String(),
      'completedAt': s.completedAt?.toIso8601String(),
      'caloriesBurned': s.caloriesBurned,
      'xpEarned': s.xpEarned,
      'pointsEarned': s.pointsEarned,
      'accuracy': {
        'percentage': s.accuracy.percentage,
        'correctReps': s.accuracy.correctReps,
        'totalReps': s.accuracy.totalReps,
        'incorrectReps': s.accuracy.incorrectReps,
      },
    }).toList();
    await _prefs?.setString(_keyExerciseSessions, jsonEncode(jsonList));
  }

  Future<void> addExerciseSession(ExerciseSession session) async {
    final list = getExerciseSessions();
    list.insert(0, session);
    await _saveExerciseSessionsList(list.take(50).toList());
  }

  List<ExerciseSession> getExerciseSessions() {
    try {
      final raw = _prefs?.getString(_keyExerciseSessions);
      if (raw == null) return [];
      final list = jsonDecode(raw) as List<dynamic>;
      return list.map<ExerciseSession>((s) {
        final acc = s['accuracy'] ?? {};
        final exType = s['type'] == 'pullup'
            ? ExerciseTypeEnum.pullup
            : s['type'] == 'walking'
                ? ExerciseTypeEnum.walking
                : ExerciseTypeEnum.pushup;

        return ExerciseSession(
          id: s['id'] ?? '',
          oderId: s['oderId'] ?? 'user-1',
          type: exType,
          count: s['count'] ?? 20,
          correctFormCount: s['correctFormCount'] ?? 18,
          durationSeconds: s['durationSeconds'] ?? 300,
          startedAt: DateTime.tryParse(s['startedAt'] ?? '') ?? DateTime.now(),
          completedAt: DateTime.tryParse(s['completedAt'] ?? '') ?? DateTime.now(),
          caloriesBurned: s['caloriesBurned'] ?? 100,
          xpEarned: s['xpEarned'] ?? 50,
          pointsEarned: s['pointsEarned'] ?? 35,
          accuracy: ExerciseAccuracy(
            percentage: (acc['percentage'] ?? 90.0).toDouble(),
            correctReps: acc['correctReps'] ?? 18,
            totalReps: acc['totalReps'] ?? 20,
            incorrectReps: acc['incorrectReps'] ?? 2,
            warningReps: 0,
          ),
        );
      }).toList();
    } catch (_) {
      return [];
    }
  }

  // ============================================================
  // SHOP ITEMS CRUD
  // ============================================================
  Future<void> saveShopItems(List<ShopItem> items) async {
    _prefs ??= await SharedPreferences.getInstance();
    final jsonList = items.map((i) => {
      'id': i.id,
      'name': i.name,
      'description': i.description,
      'category': i.category.name,
      'price': i.price,
      'currency': i.currency,
      'rarity': i.rarity.name,
      'owned': i.owned,
      'preview': i.preview,
    }).toList();
    await _prefs?.setString(_keyShopItems, jsonEncode(jsonList));
  }

  List<ShopItem> getShopItems() {
    try {
      final raw = _prefs?.getString(_keyShopItems);
      if (raw == null) return initialShopItemsSeed;
      final list = jsonDecode(raw) as List<dynamic>;
      return list.map<ShopItem>((i) => ShopItem(
        id: i['id'] ?? '',
        name: i['name'] ?? '',
        description: i['description'] ?? '',
        category: ShopCategory.values.firstWhere((c) => c.name == i['category'], orElse: () => ShopCategory.frames),
        price: i['price'] ?? 50,
        currency: i['currency'] ?? 'coins',
        rarity: SkinRarity.values.firstWhere((r) => r.name == i['rarity'], orElse: () => SkinRarity.rare),
        owned: i['owned'] ?? false,
        preview: i['preview'] ?? '✨',
      )).toList();
    } catch (_) {
      return initialShopItemsSeed;
    }
  }

  // ============================================================
  // ARENAS CRUD
  // ============================================================
  Future<void> saveArenas(List<PremiumArena> list) async {
    _prefs ??= await SharedPreferences.getInstance();
    final jsonList = list.map((a) => {
      'id': a.id,
      'name': a.name,
      'description': a.description,
      'status': a.status.name,
      'prizePool': a.prizePool,
      'entryRuby': a.entryRuby,
      'participants': a.participants,
      'maxParticipants': a.maxParticipants,
      'exerciseType': a.exerciseType,
      'duration': a.duration,
    }).toList();
    await _prefs?.setString(_keyArenas, jsonEncode(jsonList));
  }

  List<PremiumArena> getArenas() {
    try {
      final raw = _prefs?.getString(_keyArenas);
      if (raw == null) return initialArenasSeed;
      final list = jsonDecode(raw) as List<dynamic>;
      return list.map<PremiumArena>((a) => PremiumArena(
        id: a['id'] ?? '',
        name: a['name'] ?? '',
        description: a['description'] ?? '',
        status: ArenaStatus.values.firstWhere((s) => s.name == a['status'], orElse: () => ArenaStatus.open),
        prizePool: a['prizePool'] ?? 100,
        entryRuby: a['entryRuby'] ?? 10,
        participants: a['participants'] ?? 12,
        maxParticipants: a['maxParticipants'] ?? 100,
        exerciseType: a['exerciseType'] ?? 'pushup',
        duration: a['duration'] ?? 60,
        prizePoolBreakdown: const [],
      )).toList();
    } catch (_) {
      return initialArenasSeed;
    }
  }

  // ============================================================
  // LEADERBOARD CRUD
  // ============================================================
  Future<void> saveLeaderboard(List<LeaderboardEntry> list) async {
    _prefs ??= await SharedPreferences.getInstance();
    final jsonList = list.map((l) => {
      'rank': l.rank,
      'oderId': l.oderId,
      'oderName': l.oderName,
      'avatar': l.avatar,
      'level': l.level,
      'points': l.points,
      'isCurrentUser': l.isCurrentUser,
      'isVIP': l.isVIP,
    }).toList();
    await _prefs?.setString(_keyLeaderboard, jsonEncode(jsonList));
  }

  List<LeaderboardEntry> getLeaderboard() {
    try {
      final raw = _prefs?.getString(_keyLeaderboard);
      if (raw == null) return initialLeaderboardSeed;
      final list = jsonDecode(raw) as List<dynamic>;
      return list.map<LeaderboardEntry>((l) => LeaderboardEntry(
        rank: l['rank'] ?? 1,
        oderId: l['oderId'] ?? '',
        oderName: l['oderName'] ?? '',
        avatar: l['avatar'] ?? '',
        level: l['level'] ?? 10,
        points: l['points'] ?? 1000,
        isCurrentUser: l['isCurrentUser'] ?? false,
        isVIP: l['isVIP'] ?? false,
      )).toList();
    } catch (_) {
      return initialLeaderboardSeed;
    }
  }

  // ============================================================
  // DATABASE ADMIN / RESET / INSPECTION
  // ============================================================
  Future<void> resetDatabase() async {
    _prefs ??= await SharedPreferences.getInstance();
    await _prefs?.clear();
    await seedInitialData();
  }

  Map<String, int> getCollectionCounts() {
    return {
      'Tài khoản (Users)': 1,
      'Huy hiệu (Badges)': getUser().badges.length,
      'Nhiệm vụ (Challenges)': getChallenges().length,
      'Lịch sử tập (Sessions)': getExerciseSessions().length,
      'Lịch sử đấu (Battle History)': getBattleHistory().length,
      'Cửa hàng (Shop Items)': getShopItems().length,
      'Đấu trường (Arenas)': getArenas().length,
      'Xếp hạng (Leaderboard)': getLeaderboard().length,
    };
  }
}
