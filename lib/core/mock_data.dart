import 'models.dart';

// Current User
final currentUser = User(
  id: 'user-1',
  name: 'Bạn',
  avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=You&backgroundColor=b6e3f4',
  level: 12,
  xp: 3450,
  xpToNextLevel: 5000,
  streak: 14,
  totalPoints: 4820,
  rank: 47,
  winCount: 28,
  loseCount: 11,
  heartRate: 0,
  calories: 0,
  joinDate: '15/01/2026',
  badges: [
    Badge(id: 'b1', name: 'Chiến Binh', icon: 'shield', color: '#ff6b35', earned: true),
    Badge(id: 'b2', name: 'Chuỗi 7 Ngày', icon: 'flame', color: '#f7c948', earned: true),
    Badge(id: 'b3', name: 'Top 50', icon: 'trophy', color: '#ffd700', earned: true),
    Badge(id: 'b4', name: 'Vua Cardio', icon: 'heart-pulse', color: '#ff4757', earned: true),
    Badge(id: 'b5', name: 'Giao Lưu', icon: 'users', color: '#5352ed', earned: false),
    Badge(id: 'b6', name: 'Quán Quân', icon: 'crown', color: '#ff6b81', earned: false),
  ],
  stats: UserStats(
    totalWorkouts: 89,
    totalMinutes: 2840,
    avgHeartRate: 135,
    totalCalories: 42500,
    weeklyMinutes: [45, 60, 30, 90, 0, 75, 55],
    weeklyCalories: [320, 410, 220, 580, 0, 490, 380],
  ),
  ruby: 85,
  stamina: 100,
  maxStamina: 100,
  coins: 1250,
  coinsExpiringDays: 14,
  hasBattlePass: true,
  battlePassTier: 14,
  isVIP: false,
  equippedSkinFrame: 'Khung Neon',
  equippedTitle: 'Chiến Binh Titan',
);

// Leaderboard
final leaderboard = [
  LeaderboardEntry(rank: 1, oderId: 'u1', oderName: 'Minh Đạt', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=MinhDat&backgroundColor=ffdfbf', level: 28, points: 15200, isVIP: true),
  LeaderboardEntry(rank: 2, oderId: 'u2', oderName: 'Thu Hà', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=ThuHa&backgroundColor=c0aede', level: 25, points: 13800, isVIP: true),
  LeaderboardEntry(rank: 3, oderId: 'u3', oderName: 'Hoàng Nam', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=HoangNam&backgroundColor=b6e3f4', level: 24, points: 12100),
  LeaderboardEntry(rank: 4, oderId: 'u4', oderName: 'Lan Phương', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=LanPhuong&backgroundColor=ffd5dc', level: 22, points: 10500),
  LeaderboardEntry(rank: 5, oderId: 'u5', oderName: 'Khoa Phạm', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=KhoaPham&backgroundColor=d1f4e0', level: 20, points: 9400),
  LeaderboardEntry(rank: 6, oderId: 'u6', oderName: 'Thanh Tùng', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=ThanhTung&backgroundColor=ffdfbf', level: 18, points: 8200),
  LeaderboardEntry(rank: 7, oderId: 'u7', oderName: 'Mai Anh', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=MaiAnh&backgroundColor=c0aede', level: 17, points: 7600),
  LeaderboardEntry(rank: 8, oderId: 'u8', oderName: 'Quang Minh', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=QuangMinh&backgroundColor=b6e3f4', level: 16, points: 6900),
  LeaderboardEntry(rank: 9, oderId: 'u9', oderName: 'Hương Giang', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=huonggiang&backgroundColor=ffd5dc', level: 15, points: 6100),
  LeaderboardEntry(rank: 10, oderId: 'u10', oderName: 'Việt Hoàng', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=VietHoang&backgroundColor=d1f4e0', level: 14, points: 5500),
  LeaderboardEntry(rank: 47, oderId: 'user-1', oderName: 'Bạn', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=You&backgroundColor=b6e3f4', level: 12, points: 4820, isCurrentUser: true),
];

// Battles
final battles = [
  Battle(
    id: 'b1',
    title: 'Cuộc Chiến Rank Sắt',
    type: BattleType.ranked,
    status: BattleStatus.waiting,
    players: [
      BattlePlayer(oderId: 'u3', oderName: 'Hoàng Nam', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=HoangNam&backgroundColor=b6e3f4', score: 0, heartRate: 0, duration: 0, isActive: false),
      BattlePlayer(oderId: 'u4', oderName: 'Lan Phương', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=LanPhuong&backgroundColor=ffd5dc', score: 0, heartRate: 0, duration: 0, isActive: false),
    ],
    duration: 15,
    reward: BattleReward(xp: 500, coins: 200),
    exerciseType: 'Chạy bộ',
  ),
  Battle(
    id: 'b2',
    title: 'Trận Giao Hữu Gym',
    type: BattleType.friendly,
    status: BattleStatus.active,
    players: [
      BattlePlayer(oderId: 'user-1', oderName: 'Bạn', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=You&backgroundColor=b6e3f4', score: 0, heartRate: 142, duration: 420, isActive: true),
      BattlePlayer(oderId: 'u2', oderName: 'Thu Hà', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=ThuHa&backgroundColor=c0aede', score: 0, heartRate: 138, duration: 420, isActive: true),
    ],
    duration: 15,
    reward: BattleReward(xp: 300, coins: 100),
    exerciseType: 'Gym',
  ),
];

// Challenges
final challenges = [
  Challenge(
    id: 'c1',
    title: 'Thử thách 14 ngày liên tiếp',
    description: 'Tập luyện mỗi ngày trong 14 ngày liên tiếp',
    type: ChallengeType.daily,
    target: 14,
    current: 14,
    unit: 'ngày',
    reward: ChallengeReward(xp: 1000, coins: 500),
    expiresAt: DateTime.now().add(const Duration(days: 1)).toIso8601String(),
    icon: 'flame',
    color: '#ff6b35',
    completed: true,
  ),
  Challenge(
    id: 'c2',
    title: 'Đốt 3000 Calories',
    description: 'Đốt cháy 3000 calories trong tuần này',
    type: ChallengeType.weekly,
    target: 3000,
    current: 2400,
    unit: 'cal',
    reward: ChallengeReward(xp: 800, coins: 300),
    expiresAt: DateTime.now().add(const Duration(days: 5)).toIso8601String(),
    icon: 'zap',
    color: '#f7c948',
    completed: false,
  ),
  Challenge(
    id: 'c3',
    title: 'Thắng 10 trận Battle',
    description: 'Thắng 10 trận Battle trong tháng này',
    type: ChallengeType.monthly,
    target: 10,
    current: 6,
    unit: 'trận',
    reward: ChallengeReward(xp: 1500, coins: 800),
    expiresAt: DateTime.now().add(const Duration(days: 15)).toIso8601String(),
    icon: 'swords',
    color: '#ff4757',
    completed: false,
  ),
];

// Friends
final friends = [
  Friend(id: 'u2', name: 'Thu Hà', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=ThuHa&backgroundColor=c0aede', level: 25, streak: 21, isOnline: true, lastActive: 'Vừa xong'),
  Friend(id: 'u3', name: 'Hoàng Nam', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=HoangNam&backgroundColor=b6e3f4', level: 24, streak: 8, isOnline: true, lastActive: 'Vừa xong'),
  Friend(id: 'u4', name: 'Lan Phương', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=LanPhuong&backgroundColor=ffd5dc', level: 22, streak: 15, isOnline: false, lastActive: '2 giờ trước'),
  Friend(id: 'u5', name: 'Khoa Phạm', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=KhoaPham&backgroundColor=d1f4e0', level: 20, streak: 3, isOnline: false, lastActive: '1 ngày trước'),
];

// Recent Activities
final recentActivities = [
  ActivitySession(id: 'a1', date: 'Hôm nay, 17:30', duration: 45, calories: 380, heartRate: 142, type: 'Gym', xp: 220),
  ActivitySession(id: 'a2', date: 'Hôm qua, 18:00', duration: 30, calories: 280, heartRate: 155, type: 'HIIT', xp: 180),
  ActivitySession(id: 'a3', date: '19/07, 07:00', duration: 60, calories: 420, heartRate: 138, type: 'Chạy bộ', xp: 300),
  ActivitySession(id: 'a4', date: '18/07, 18:30', duration: 40, calories: 320, heartRate: 148, type: 'Gym', xp: 200),
  ActivitySession(id: 'a5', date: '17/07, 07:15', duration: 55, calories: 490, heartRate: 135, type: 'Đạp xe', xp: 270),
];

// Exercise Types
final exerciseTypes = [
  ExerciseType(id: 'gym', name: 'Gym', duration: '45-60 phút', color: '#ff6b35'),
  ExerciseType(id: 'run', name: 'Chạy bộ', duration: '20-40 phút', color: '#5352ed'),
  ExerciseType(id: 'hiit', name: 'HIIT', duration: '20-30 phút', color: '#f7c948'),
  ExerciseType(id: 'bike', name: 'Đạp xe', duration: '30-60 phút', color: '#2ed573'),
  ExerciseType(id: 'yoga', name: 'Yoga', duration: '30-45 phút', color: '#a55eea'),
  ExerciseType(id: 'swim', name: 'Bơi lội', duration: '30-45 phút', color: '#1e90ff'),
];

// Battle Pass
List<BattlePassLevel> _makeLevels() {
  final levels = <BattlePassLevel>[];
  final missions = [
    'Thắng 3 trận Battle', 'Chạy bộ 5km', 'Đốt 500 calories', 'Hoàn thành 1 trận Rank',
    'Chạy bộ 8km', 'Thắng 5 trận Rank', 'Tập Gym 3 buổi', 'Đốt 1000 calories',
    'Chạy bộ 10km', 'Thắng 8 trận', 'Đạp xe 15km', 'Hoàn thành 5 trận',
    'Thắng 10 trận Rank', 'Chạy bộ 15km', 'Đốt 2000 calories',
  ];

  final xpBases = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250,
    3850, 4500, 5200, 6000, 6850, 7750, 8700, 9700, 10800, 11900, 13100,
    14400, 15800, 17300, 18900, 20600, 22400, 24300, 26300];

  for (int i = 0; i < 30; i++) {
    levels.add(BattlePassLevel(
      level: i + 1,
      xpRequired: xpBases[i],
      freeReward: BattlePassReward(type: BattlePassRewardType.xp, amount: 100 + (i * 50), label: '+${100 + (i * 50)} XP'),
      premiumReward: BattlePassReward(type: BattlePassRewardType.ruby, amount: 5 + i, label: '+${5 + i} Ruby'),
      mission: missions[i % missions.length],
    ));
  }
  return levels;
}

final battlePassSeason = BattlePassSeason(
  id: 's1',
  name: 'Mùa Giải #7 - Cyber Sprint',
  startDate: '01/07/2026',
  endDate: '01/08/2026',
  daysRemaining: 12,
  totalLevels: 30,
  currentLevel: 14,
  currentXP: 6850,
  xpToNextLevel: 7750,
  isPremium: false,
  levels: _makeLevels(),
  prizesClaimed: 18,
  totalPrizes: 60,
);

// Vouchers
final vouchers = [
  Voucher(id: 'v1', partner: 'Phúc Long', partnerLogo: 'Coffee', value: '20K', description: 'Giảm 20K cho đơn từ 60K', expiresAt: DateTime.now().add(const Duration(days: 7)).toIso8601String(), claimed: false),
  Voucher(id: 'v2', partner: 'Shopee', partnerLogo: 'Shop', value: '30K', description: 'Miễn phí vận chuyển ShopeeFood', expiresAt: DateTime.now().add(const Duration(days: 10)).toIso8601String(), claimed: true, claimedAt: '20/07/2026'),
  Voucher(id: 'v3', partner: 'Tiki', partnerLogo: 'Book', value: '50K', description: 'Giảm 50K cho đơn sách/thể thao', expiresAt: DateTime.now().add(const Duration(days: 5)).toIso8601String(), claimed: false),
  Voucher(id: 'v4', partner: 'Grab', partnerLogo: 'Car', value: '40K', description: 'Voucher GrabBike 40K', expiresAt: DateTime.now().add(const Duration(days: 14)).toIso8601String(), claimed: false),
];

// Premium Arenas
final premiumArenas = [
  PremiumArena(
    id: 'pa1',
    name: 'Đấu Trường Titan',
    description: 'Giải đấu 1v1 cao cấp nhất mùa giải',
    entryRuby: 20,
    prizePool: 1000,
    prizePoolBreakdown: [
      PrizeBreakdown(position: 'Nhất', reward: '400 Ruby + Tai nghe Bluetooth'),
      PrizeBreakdown(position: 'Nhì', reward: '250 Ruby + Voucher Tiki 100K'),
      PrizeBreakdown(position: 'Ba', reward: '150 Ruby + Voucher Phúc Long 50K'),
      PrizeBreakdown(position: 'Top 4-8', reward: '50 Ruby mỗi người'),
    ],
    participants: 64,
    maxParticipants: 64,
    status: ArenaStatus.open,
    exerciseType: 'Chạy bộ',
    duration: 20,
  ),
  PremiumArena(
    id: 'pa2',
    name: 'Giải Đua Sức Bền',
    description: 'Thách đấu 5 vòng - ai trụ được lâu nhất',
    entryRuby: 10,
    prizePool: 500,
    prizePoolBreakdown: [
      PrizeBreakdown(position: 'Nhất', reward: '200 Ruby + Giày chạy bộ'),
      PrizeBreakdown(position: 'Nhì', reward: '120 Ruby + Voucher Shopee 80K'),
      PrizeBreakdown(position: 'Ba', reward: '80 Ruby'),
      PrizeBreakdown(position: 'Top 4-8', reward: '25 Ruby'),
    ],
    participants: 28,
    maxParticipants: 32,
    status: ArenaStatus.countdown,
    startTime: DateTime.now().add(const Duration(hours: 1)).toIso8601String(),
    exerciseType: 'HIIT',
    duration: 15,
  ),
  PremiumArena(
    id: 'pa3',
    name: 'Trận Cược Ruby',
    description: 'Mỗi trận tốn 5 Ruby - thắng ăn 8 Ruby',
    entryRuby: 5,
    prizePool: 0,
    prizePoolBreakdown: [],
    participants: 15,
    maxParticipants: 999,
    status: ArenaStatus.live,
    exerciseType: 'Gym',
    duration: 10,
  ),
];

// Skin Items
final skinItems = [
  SkinItem(id: 'frame_neon', name: 'Khung Neon', type: SkinType.avatar_frame, preview: '🔮', price: 50, rarity: SkinRarity.rare, owned: false, limited: true, season: 'Mùa #7'),
  SkinItem(id: 'frame_dragon', name: 'Khung Rồng Lửa', type: SkinType.avatar_frame, preview: '🐉', price: 150, rarity: SkinRarity.legendary, owned: false, limited: true, season: 'Mùa #7'),
  SkinItem(id: 'title_titan', name: 'Chiến Binh Titan', type: SkinType.title, preview: '⚡', price: 30, rarity: SkinRarity.epic, owned: false),
  SkinItem(id: 'effect_firework', name: 'Hiệu ứng Pháo Hoa', type: SkinType.victory_effect, preview: '🎆', price: 80, rarity: SkinRarity.rare, owned: false, limited: true, season: 'Mùa #7'),
  SkinItem(id: 'effect_3d', name: 'Hiệu ứng 3D Sang Chảnh', type: SkinType.victory_effect, preview: '✨', price: 200, rarity: SkinRarity.legendary, owned: false),
  SkinItem(id: 'badge_titan', name: 'Huy hiệu Titan', type: SkinType.badge, preview: '🏅', price: 100, rarity: SkinRarity.epic, owned: false),
  SkinItem(id: 'badge_cyber', name: 'Huy hiệu Siêu Tốc Cyber', type: SkinType.badge, preview: '⚡', price: 120, rarity: SkinRarity.legendary, owned: false, limited: true),
];
