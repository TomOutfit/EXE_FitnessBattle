import 'dart:math' as math;
import '../models.dart';

/// Real-time live simulation engine that generates dynamic athletes, hourly events, boss raids, and quests
class LiveSimulationService {
  static final LiveSimulationService instance = LiveSimulationService._();
  LiveSimulationService._();

  final math.Random _random = math.Random();

  // 35+ Vietnamese athlete names pool from all regions
  static const List<String> athleteNames = [
    'Minh Đạt (Hà Nội)', 'Thu Hà (TP.HCM)', 'Hoàng Nam (Đà Nẵng)', 'Lan Phương (Cần Thơ)', 'Khoa Phạm (Hải Phòng)',
    'Thanh Tùng (Nha Trang)', 'Mai Anh (Huế)', 'Quang Minh (Bình Dương)', 'Hương Giang (Vũng Tàu)', 'Việt Hoàng (Đồng Nai)',
    'Bảo Trâm (Quảng Ninh)', 'Đức Thắng (Bắc Ninh)', 'Khánh Vy (Nam Định)', 'Tuấn Kiệt (Thái Nguyên)', 'Hải Đăng (Lâm Đồng)',
    'Bích Ngọc (Gia Lai)', 'Trung Kiên (Đắk Lắk)', 'Thảo Nguyên (Tiền Giang)', 'Hồng Phúc (An Giang)', 'Gia Huy (Kiên Giang)',
    'Phương Linh (Hà Nội)', 'Duy Mạnh (TP.HCM)', 'Ánh Tuyết (Đà Nẵng)', 'Thành Long (Hải Phòng)', 'Ngọc Trinh (Cần Thơ)',
    'Quốc Bảo (Nghệ An)', 'Diệu Hoa (Thanh Hóa)', 'Văn Hùng (Quảng Nam)', 'Mỹ Duyên (Bình Thuận)', 'Anh Tuấn (Phú Thọ)',
    'Tấn Phát (Vĩnh Long)', 'Yến Nhi (Bến Tre)', 'Minh Quân (Hà Tĩnh)', 'Kim Ngân (Hưng Yên)', 'Trọng Hiếu (Sóc Trăng)'
  ];

  static String getAvatar(String name) {
    final clean = name.split(' ').first;
    return 'https://api.dicebear.com/9.x/avataaars/png?seed=$clean&backgroundColor=b6e3f4,ffdfbf,c0aede,ffd5dc,d1f4e0';
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 1. HOURLY GOLDEN EVENTS (SỰ KIỆN GIỜ VÀNG ĐỔI MỖI GIỜ)
  // ──────────────────────────────────────────────────────────────────────────
  Map<String, dynamic> getCurrentHourlyEvent() {
    final hour = DateTime.now().hour;
    if (hour >= 6 && hour < 9) {
      return {
        'tag': '🌅 BUỔI SÁNG NĂNG LƯỢNG',
        'title': 'Khởi Động Bình Minh: +50% XP Đi Bộ GPS',
        'description': 'Mọi bước chân ghi nhận trước 09:00 nhận thưởng thêm 1.5x kinh nghiệm.',
        'color': '#2ED573',
        'icon': 'walking',
        'multiplier': '1.5x XP',
      };
    } else if (hour >= 11 && hour < 14) {
      return {
        'tag': '⚡ GIỜ VÀNG ĐẤU TRƯỜNG',
        'title': 'Prime Time Trưa: Nhân Đôi x2 Ruby Thắng Trận',
        'description': 'Chiến thắng bất kỳ trận đấu camera 1v1 trong khung giờ này nhận gấp đôi Ruby!',
        'color': '#FF6B35',
        'icon': 'bolt',
        'multiplier': '2.0x Ruby',
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        'tag': '⚔️ GIỜ CAO ĐIỂM XẾP HẠNG',
        'title': 'Đại Chiến Hoàng Hôn: Tăng 200% Điểm ELO Rank',
        'description': 'Đấu trường trực tuyến sôi động nhất ngày. Thăng hạng nhanh gấp 2 lần!',
        'color': '#5352ED',
        'icon': 'swords',
        'multiplier': '+200% ELO',
      };
    } else {
      return {
        'tag': '🌙 CARDIO ĐÊM BỀN BỈ',
        'title': 'Luyện Tập Đêm: Mở Khóa Rương Bí Ẩn',
        'description': 'Hoàn thành 1 buổi tập bất kỳ trước nửa đêm nhận ngay Quà May Mắn.',
        'color': '#FFA502',
        'icon': 'gift',
        'multiplier': 'Rương May Mắn',
      };
    }
  }

  int _userBossDamage = 0;
  int _bonusCommunityDamage = 0;

  int get userBossDamage => _userBossDamage;

  void dealBossDamage(int amount) {
    _userBossDamage += amount;
    _bonusCommunityDamage += amount;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. BOSS TITAN RAID TOÀN SERVER (CỘNG ĐỒNG CÙNG ĐÁNH BOSS)
  // ──────────────────────────────────────────────────────────────────────────
  Map<String, dynamic> getServerBossRaid() {
    final now = DateTime.now();
    final totalHp = 100000;
    // Simulate real-time decreasing boss HP based on minute of day + user contributions
    final minutesIntoDay = now.hour * 60 + now.minute;
    final currentDamage = (minutesIntoDay * 62 + _bonusCommunityDamage).clamp(0, 99000);
    final remainingHp = totalHp - currentDamage;

    return {
      'bossName': 'TITAN GOLIATH HUYỀN THOẠI 👹',
      'totalHp': totalHp,
      'currentHp': remainingHp,
      'damagePercentage': ((currentDamage / totalHp) * 100).toStringAsFixed(1),
      'participantsCount': 1240 + (minutesIntoDay % 400),
      'userDamage': _userBossDamage,
      'reward': '500 Ruby + Khung Titan Huyền Thoại',
      'targetExercise': 'Tổng Reps Luyện Tập & Đấu Trường',
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. DYNAMIC REAL-TIME BATTLE ROOMS (CẬP NHẬT TỪNG PHÚT)
  // ──────────────────────────────────────────────────────────────────────────
  List<Battle> generateInitialLiveBattles() {
    final now = DateTime.now();
    final athlete1 = athleteNames[_random.nextInt(athleteNames.length)];
    final athlete2 = athleteNames[_random.nextInt(athleteNames.length)];
    final athlete3 = athleteNames[_random.nextInt(athleteNames.length)];
    final athlete4 = athleteNames[_random.nextInt(athleteNames.length)];

    return [
      Battle(
        id: 'b_${now.millisecondsSinceEpoch}_1',
        title: '⚔️ Hít Đất 60s Bứt Phá Rank Kim Cương',
        type: BattleType.ranked,
        status: BattleStatus.waiting,
        players: [
          BattlePlayer(
            oderId: 'u_${_random.nextInt(9000) + 1000}',
            oderName: athlete1,
            avatar: getAvatar(athlete1),
            score: 0,
            heartRate: 0,
            duration: 0,
            isActive: false,
          ),
          BattlePlayer(
            oderId: 'waiting_slot',
            oderName: 'Đang tìm đối thủ...',
            avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=waiting&backgroundColor=cccccc',
            score: 0,
            heartRate: 0,
            duration: 0,
            isActive: false,
          ),
        ],
        duration: 1,
        reward: BattleReward(xp: 350, coins: 150, ruby: 5),
        exerciseType: 'Hít Đất',
        spectatorCount: 18,
      ),
      Battle(
        id: 'b_${now.millisecondsSinceEpoch}_2',
        title: '🔥 Kéo Xà Cằm Vượt Xà 1v1 Trực Tuyến',
        type: BattleType.challenge,
        status: BattleStatus.active,
        players: [
          BattlePlayer(
            oderId: 'u_${_random.nextInt(9000) + 1000}',
            oderName: athlete2,
            avatar: getAvatar(athlete2),
            score: 18,
            heartRate: 148,
            duration: 42,
            isActive: true,
          ),
          BattlePlayer(
            oderId: 'u_${_random.nextInt(9000) + 1000}',
            oderName: athlete3,
            avatar: getAvatar(athlete3),
            score: 16,
            heartRate: 142,
            duration: 42,
            isActive: true,
          ),
        ],
        duration: 1,
        reward: BattleReward(xp: 500, coins: 250, ruby: 10),
        exerciseType: 'Kéo Xà',
        spectatorCount: 42,
      ),
      Battle(
        id: 'b_${now.millisecondsSinceEpoch}_3',
        title: '💎 Cược Ruby: Squat Chuẩn Biomechanics',
        type: BattleType.ruby_stake,
        status: BattleStatus.waiting,
        players: [
          BattlePlayer(
            oderId: 'u_${_random.nextInt(9000) + 1000}',
            oderName: athlete4,
            avatar: getAvatar(athlete4),
            score: 0,
            heartRate: 0,
            duration: 0,
            isActive: false,
          ),
          BattlePlayer(
            oderId: 'waiting_slot',
            oderName: 'Chờ người nhận kèo...',
            avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=waiting3&backgroundColor=cccccc',
            score: 0,
            heartRate: 0,
            duration: 0,
            isActive: false,
          ),
        ],
        duration: 1,
        reward: BattleReward(xp: 800, coins: 400, ruby: 30),
        exerciseType: 'Squat',
        rubyStake: 20,
        spectatorCount: 65,
      ),
    ];
  }

  Battle generateNewWaitingBattle() {
    final athlete = athleteNames[_random.nextInt(athleteNames.length)];
    final exercises = ['Hít Đất', 'Kéo Xà', 'Squat'];
    final ex = exercises[_random.nextInt(exercises.length)];
    final types = [BattleType.ranked, BattleType.friendly, BattleType.challenge, BattleType.ruby_stake];
    final battleType = types[_random.nextInt(types.length)];
    final id = 'b_${DateTime.now().millisecondsSinceEpoch}_${_random.nextInt(1000)}';

    return Battle(
      id: id,
      title: '⚔️ ${ex == "Hít Đất" ? "Đấu Hít Đất" : ex == "Kéo Xà" ? "Đấu Kéo Xà" : "Đấu Squat"} 1v1 Camera',
      type: battleType,
      status: BattleStatus.waiting,
      players: [
        BattlePlayer(
          oderId: 'u_${_random.nextInt(9000) + 1000}',
          oderName: athlete,
          avatar: getAvatar(athlete),
          score: 0,
          heartRate: 0,
          duration: 0,
          isActive: false,
        ),
        BattlePlayer(
          oderId: 'waiting_slot',
          oderName: 'Đang tìm đối thủ...',
          avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=slot_${_random.nextInt(100)}&backgroundColor=cccccc',
          score: 0,
          heartRate: 0,
          duration: 0,
          isActive: false,
        ),
      ],
      duration: 1,
      reward: BattleReward(
        xp: 250 + _random.nextInt(300),
        coins: 100 + _random.nextInt(150),
        ruby: battleType == BattleType.ruby_stake ? 20 : null,
      ),
      exerciseType: ex,
      rubyStake: battleType == BattleType.ruby_stake ? 15 : null,
      spectatorCount: 5 + _random.nextInt(35),
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. KHO THỬ THÁCH VÔ TẬN (45+ UNIQUE ROTATING QUESTS)
  // ──────────────────────────────────────────────────────────────────────────
  List<Challenge> generateDynamicChallenges({required int userLevel, required int streak}) {
    final now = DateTime.now();
    // Use minute/hour/day for rich dynamic variety
    final rand = math.Random(now.year * 10000 + now.month * 100 + now.day + now.hour);

    final pushTarget = 30 + (rand.nextInt(4) * 10);
    final pullTarget = 10 + (rand.nextInt(3) * 5);
    final walkTarget = 6000 + (rand.nextInt(6) * 1000);
    final calTarget = 2000 + (rand.nextInt(4) * 500);

    return [
      // Daily 1: Push-up Speed or Biomechanics
      Challenge(
        id: 'daily_push_${now.day}_${now.hour}',
        title: 'Hít đất $pushTarget cái chuẩn góc tay ≤90°',
        description: 'Hoàn thành $pushTarget rep hít đất AI Camera chấm đạt',
        type: ChallengeType.daily,
        target: pushTarget,
        current: 0,
        unit: 'rep',
        reward: ChallengeReward(xp: 150 + userLevel * 10, coins: 60 + userLevel * 5, ruby: 5),
        expiresAt: '23:59 hôm nay',
        icon: 'flame',
        color: '#ff6b35',
        completed: false,
        claimed: false,
      ),
      // Daily 2: Strict Pull-up
      Challenge(
        id: 'daily_pull_${now.day}_${now.hour}',
        title: 'Kéo xà $pullTarget cái cằm vượt thanh xà',
        description: 'Tập kéo xà với camera AI nhận diện độ cao cằm',
        type: ChallengeType.daily,
        target: pullTarget,
        current: 0,
        unit: 'rep',
        reward: ChallengeReward(xp: 220 + userLevel * 10, coins: 100 + userLevel * 5, ruby: 10),
        expiresAt: '23:59 hôm nay',
        icon: 'zap',
        color: '#5352ed',
        completed: false,
        claimed: false,
      ),
      // Daily 3: Authentic Walking
      Challenge(
        id: 'daily_walk_${now.day}_${now.hour}',
        title: 'Đi bộ $walkTarget bước chân thực GPS',
        description: 'Đi bộ ngoài trời hoặc trong nhà, chống xe máy AI 4.0',
        type: ChallengeType.daily,
        target: walkTarget,
        current: 0,
        unit: 'bước',
        reward: ChallengeReward(xp: 280 + userLevel * 10, coins: 120 + userLevel * 5, ruby: 15),
        expiresAt: '23:59 hôm nay',
        icon: 'flame',
        color: '#2ed573',
        completed: false,
        claimed: false,
      ),
      // Daily 4: 1v1 Battle Arena
      Challenge(
        id: 'daily_battle_${now.day}_${now.hour}',
        title: 'Chiến thắng 1 trận Đấu Trường Camera 1v1',
        description: 'Đấu trực tiếp với đối thủ và đạt số rep cao hơn',
        type: ChallengeType.daily,
        target: 1,
        current: 0,
        unit: 'trận',
        reward: ChallengeReward(xp: 350, coins: 150, ruby: 20),
        expiresAt: '23:59 hôm nay',
        icon: 'swords',
        color: '#ffa502',
        completed: false,
        claimed: false,
      ),
      // Weekly 1: Calorie Burn
      Challenge(
        id: 'weekly_cal_${now.month}_${(now.day / 7).ceil()}',
        title: 'Đốt cháy $calTarget Calories tuần này',
        description: 'Tổng calo tiêu hao từ các bài tập và đi bộ trong tuần',
        type: ChallengeType.weekly,
        target: calTarget,
        current: 0,
        unit: 'kcal',
        reward: ChallengeReward(xp: 900, coins: 450, ruby: 45),
        expiresAt: 'Chủ Nhật tuần này',
        icon: 'zap',
        color: '#ff4757',
        completed: false,
        claimed: false,
      ),
      // Weekly 2: Discipline Streak
      Challenge(
        id: 'weekly_streak_${now.month}_${(now.day / 7).ceil()}',
        title: 'Duy trì tập luyện 5 ngày trong tuần',
        description: 'Giữ vững ngọn lửa streak hàng ngày không đứt gãy',
        type: ChallengeType.weekly,
        target: 5,
        current: (streak % 7).clamp(0, 5),
        unit: 'ngày',
        reward: ChallengeReward(xp: 750, coins: 350, ruby: 35),
        expiresAt: 'Chủ Nhật tuần này',
        icon: 'trophy',
        color: '#ffd700',
        completed: false,
        claimed: false,
      ),
      // Monthly: Hall of Fame
      Challenge(
        id: 'monthly_arena_${now.month}',
        title: 'Thắng 15 trận Đấu Trường trong tháng ${now.month}',
        description: 'Chinh phục đỉnh cao bảng xếp hạng toàn quốc',
        type: ChallengeType.monthly,
        target: 15,
        current: 0,
        unit: 'trận',
        reward: ChallengeReward(xp: 2500, coins: 1200, ruby: 120),
        expiresAt: 'Cuối tháng ${now.month}',
        icon: 'swords',
        color: '#70a1ff',
        completed: false,
        claimed: false,
      ),
    ];
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. DYNAMIC LEADERBOARD GENERATOR
  // ──────────────────────────────────────────────────────────────────────────
  List<LeaderboardEntry> generateDynamicLeaderboard({
    required User currentUser,
    String timeFilter = 'all_time',
  }) {
    final baseScores = [
      16500, 15200, 14100, 13350, 12600,
      11800, 10950, 10200, 9650, 9100,
      8600, 8150, 7700, 7250, 6800,
      6400, 6050, 5700, 5350, 5000,
    ];

    final double scale = timeFilter == 'today' ? 0.08 : timeFilter == 'weekly' ? 0.35 : 1.0;
    final List<LeaderboardEntry> entries = [];

    for (int i = 0; i < 20 && i < athleteNames.length; i++) {
      final name = athleteNames[i];
      final points = (baseScores[i] * scale).round() + _random.nextInt(35);
      final level = 10 + (20 - i);

      entries.add(
        LeaderboardEntry(
          rank: i + 1,
          oderId: 'u_${100 + i}',
          oderName: name,
          avatar: getAvatar(name),
          level: level,
          points: points,
          isVIP: i < 3,
          isCurrentUser: false,
        ),
      );
    }

    // Insert user dynamically according to user's real total points
    final userPts = (currentUser.totalPoints * scale).round();
    entries.add(
      LeaderboardEntry(
        rank: 999,
        oderId: currentUser.id,
        oderName: currentUser.name,
        avatar: currentUser.avatar,
        level: currentUser.level,
        points: userPts,
        isCurrentUser: true,
        isVIP: currentUser.isVIP,
      ),
    );

    entries.sort((a, b) => b.points.compareTo(a.points));
    return entries.asMap().entries.map((e) => e.value.copyWith(rank: e.key + 1)).toList();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. LIVE COMMUNITY TICKER FEED (CẬP NHẬT TỪNG GIÂY)
  // ──────────────────────────────────────────────────────────────────────────
  String generateLiveCommunityTicker() {
    final athlete = athleteNames[_random.nextInt(athleteNames.length)];
    final activities = [
      'vừa hoàn thành 45 Push-up chuẩn form (+135 XP)',
      'vừa hoàn thành 22 Pull-up cằm vượt xà (+110 ELO)',
      'vừa đạt mốc 12.500 bước chân GPS (+250 Coins)',
      'vừa chiến thắng trận Đấu Trường Camera 1v1 (+50 Rank)',
      'vừa đạt chuỗi 21 ngày streak tập luyện bền bỉ 🔥',
      'vừa tham gia giải đấu Đại Chiến Titan 2026',
      'vừa mở khóa danh hiệu "Chiến Binh Titan"',
      'vừa đánh gây 50 Reps sát thương lên Boss Titan Goliath 👹',
      'vừa nhận Rương May Mắn Giờ Vàng (+25 Ruby) ✨',
      'vừa đạt cấp độ mới Lv.${_random.nextInt(20) + 10} 🎉',
    ];
    final act = activities[_random.nextInt(activities.length)];
    return '⚡ $athlete $act';
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. HOURLY AI COACHING BIOMECHANICS TIPS
  // ──────────────────────────────────────────────────────────────────────────
  String getHourlyAICoachTip() {
    final tips = [
      '💡 Mẹo Hít Đất: Giữ khuỷu tay chếch 45 độ so với thân để tối ưu cơ ngực và bảo vệ khớp vai.',
      '💡 Mẹo Kéo Xà: Kéo cằm vượt thanh xà và siết chặt cơ xô ở điểm cao nhất trong 0.5s.',
      '💡 Mẹo Squat: Đầu gối luôn hướng theo hướng mũi chân, giữ ngực thẳng và đùi song song mặt sàn.',
      '💡 Mẹo Đi Bộ: Duy trì nhịp bước 110-120 bước/phút để kích hoạt vùng đốt mỡ tối đa.',
      '💡 Mẹo Thể Lực: Uống 200ml nước trước khi đấu camera để tránh hụt hơi ở 15 giây cuối!',
    ];
    return tips[_random.nextInt(tips.length)];
  }
}

