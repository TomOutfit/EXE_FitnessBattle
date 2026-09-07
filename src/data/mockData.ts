import type {
  User, Battle, Challenge, LeaderboardEntry,
  ActivitySession, Friend, PremiumArena, SkinItem,
  ExerciseInfo, ExerciseLeaderboardEntry, VoucherItem, MembershipPlan,
  BattlePassSeason, Voucher,
} from '../types';

// ─── USER ─────────────────────────────────────────────────────────────────────

export const currentUser: User = {
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
  joinDate: '2026-01-15',
  badges: [
    { id: 'b1', name: 'Chiến Binh', icon: 'shield', color: '#ff6b35', earned: true },
    { id: 'b2', name: 'Chuỗi 7 Ngày', icon: 'flame', color: '#f7c948', earned: true },
    { id: 'b3', name: 'Top 50 Server', icon: 'trophy', color: '#ffd700', earned: true },
    { id: 'b4', name: 'Vua Cardio', icon: 'heart-pulse', color: '#ff4757', earned: true },
    { id: 'b5', name: 'Giao Lưu Tích Cực', icon: 'users', color: '#5352ed', earned: false },
    { id: 'b6', name: 'Quán Quân Mùa', icon: 'crown', color: '#ff6b81', earned: false },
  ],
  stats: {
    totalWorkouts: 89,
    totalMinutes: 2840,
    avgHeartRate: 135,
    totalCalories: 42500,
    weeklyMinutes: [45, 60, 30, 90, 0, 75, 55],
    weeklyCalories: [320, 410, 220, 580, 0, 490, 380],
  },
  ruby: 85,
  stamina: 100,
  maxStamina: 100,
  coins: 1250,
  coinsExpiringDays: 14,
  hasBattlePass: true,
  battlePassTier: 14,
  isVIP: false,
  equippedSkinFrame: '🔮 Neon Frame',
  equippedTitle: '⚡ Titan Warrior',
};

// ─── EXERCISES ────────────────────────────────────────────────────────────────

export const exercises: ExerciseInfo[] = [
  {
    type: 'pushup',
    name: 'Hít Đất',
    icon: '💪',
    todayCount: 35,
    targetCount: 50,
    unit: 'lần',
    caloriesPerRep: 0.5,
    color: '#FF6B35',
    gradient: 'linear-gradient(135deg, #FF6B35, #FF4757)',
  },
  {
    type: 'pullup',
    name: 'Kéo Xà',
    icon: '🏋️',
    todayCount: 12,
    targetCount: 20,
    unit: 'lần',
    caloriesPerRep: 1.2,
    color: '#5352ED',
    gradient: 'linear-gradient(135deg, #5352ED, #7070FF)',
  },
  {
    type: 'walking',
    name: 'Đi Bộ',
    icon: '🚶',
    todayCount: 7500,
    targetCount: 10000,
    unit: 'bước',
    caloriesPerRep: 0.04,
    color: '#2ED573',
    gradient: 'linear-gradient(135deg, #2ED573, #7BED9F)',
  },
];

// ─── EXERCISE LEADERBOARDS ───────────────────────────────────────────────────

export const pushupLeaderboard: ExerciseLeaderboardEntry[] = [
  { rank: 1, userId: 'u1', userName: 'Minh Đạt', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=MinhDat', bestScore: 105, totalSessions: 245, avgAccuracy: 92.5, type: 'pushup' },
  { rank: 2, userId: 'u2', userName: 'Thu Hà', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=ThuHa', bestScore: 98, totalSessions: 198, avgAccuracy: 89.2, type: 'pushup' },
  { rank: 3, userId: 'u3', userName: 'Hoàng Nam', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=HoangNam', bestScore: 87, totalSessions: 156, avgAccuracy: 85.7, type: 'pushup' },
  { rank: 47, userId: 'user-1', userName: 'Bạn', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=You', bestScore: 52, totalSessions: 89, avgAccuracy: 78.3, type: 'pushup', isCurrentUser: true },
];

export const pullupLeaderboard: ExerciseLeaderboardEntry[] = [
  { rank: 1, userId: 'u1', userName: 'Minh Đạt', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=MinhDat', bestScore: 42, totalSessions: 312, avgAccuracy: 95.2, type: 'pullup' },
  { rank: 2, userId: 'u4', userName: 'Lan Phương', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=LanPhuong', bestScore: 38, totalSessions: 178, avgAccuracy: 91.8, type: 'pullup' },
  { rank: 3, userId: 'u5', userName: 'Khoa Phạm', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=KhoaPham', bestScore: 35, totalSessions: 134, avgAccuracy: 88.4, type: 'pullup' },
  { rank: 52, userId: 'user-1', userName: 'Bạn', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=You', bestScore: 18, totalSessions: 67, avgAccuracy: 76.5, type: 'pullup', isCurrentUser: true },
];

export const walkingLeaderboard: ExerciseLeaderboardEntry[] = [
  { rank: 1, userId: 'u3', userName: 'Hoàng Nam', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=HoangNam', bestScore: 25000, totalSessions: 89, avgAccuracy: 100.0, type: 'walking' },
  { rank: 2, userId: 'u2', userName: 'Thu Hà', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=ThuHa', bestScore: 23000, totalSessions: 76, avgAccuracy: 100.0, type: 'walking' },
  { rank: 3, userId: 'u1', userName: 'Minh Đạt', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=MinhDat', bestScore: 21500, totalSessions: 92, avgAccuracy: 100.0, type: 'walking' },
  { rank: 38, userId: 'user-1', userName: 'Bạn', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=You', bestScore: 8500, totalSessions: 45, avgAccuracy: 100.0, type: 'walking', isCurrentUser: true },
];

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: 'u1', userName: 'Minh Đạt', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=MinhDat&backgroundColor=ffdfbf', level: 28, points: 15200, isVIP: true },
  { rank: 2, userId: 'u2', userName: 'Thu Hà', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=ThuHa&backgroundColor=c0aede', level: 25, points: 13800, isVIP: true },
  { rank: 3, userId: 'u3', userName: 'Hoàng Nam', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=HoangNam&backgroundColor=b6e3f4', level: 24, points: 12100 },
  { rank: 4, userId: 'u4', userName: 'Lan Phương', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=LanPhuong&backgroundColor=ffd5dc', level: 22, points: 10500 },
  { rank: 5, userId: 'u5', userName: 'Khoa Phạm', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=KhoaPham&backgroundColor=d1f4e0', level: 20, points: 9400 },
  { rank: 6, userId: 'u6', userName: 'Thanh Tùng', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=ThanhTung&backgroundColor=ffdfbf', level: 18, points: 8200 },
  { rank: 7, userId: 'u7', userName: 'Mai Anh', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=MaiAnh&backgroundColor=c0aede', level: 17, points: 7600 },
  { rank: 8, userId: 'u8', userName: 'Quang Minh', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=QuangMinh&backgroundColor=b6e3f4', level: 16, points: 6900 },
  { rank: 9, userId: 'u9', userName: 'Hương Giang', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=huonggiang&backgroundColor=ffd5dc', level: 15, points: 6100 },
  { rank: 10, userId: 'u10', userName: 'Việt Hoàng', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=VietHoang&backgroundColor=d1f4e0', level: 14, points: 5500 },
  { rank: 47, userId: 'user-1', userName: 'Bạn', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=You&backgroundColor=b6e3f4', level: 12, points: 4820, isCurrentUser: true },
];

// ─── BATTLES ─────────────────────────────────────────────────────────────────

export const battles: Battle[] = [
  {
    id: 'b1', title: 'Cuộc Chiến Rank Sắt', type: 'ranked', status: 'waiting',
    players: [
      { userId: 'u3', userName: 'Hoàng Nam', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=HoangNam&backgroundColor=b6e3f4', score: 0, heartRate: 0, duration: 0, isActive: false },
      { userId: 'u4', userName: 'Lan Phương', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=LanPhuong&backgroundColor=ffd5dc', score: 0, heartRate: 0, duration: 0, isActive: false },
    ],
    duration: 15, reward: { xp: 500, coins: 200 }, exerciseType: 'Chạy bộ',
  },
  {
    id: 'b2', title: 'Trận Giao Hữu Gym', type: 'friendly', status: 'active',
    players: [
      { userId: 'user-1', userName: 'Bạn', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=You&backgroundColor=b6e3f4', score: 0, heartRate: 142, duration: 420, isActive: true },
      { userId: 'u2', userName: 'Thu Hà', avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=ThuHa&backgroundColor=c0aede', score: 0, heartRate: 138, duration: 420, isActive: true },
    ],
    duration: 15, startedAt: new Date(Date.now() - 7 * 60000).toISOString(),
    reward: { xp: 300, coins: 100 }, exerciseType: 'Gym',
  },
];

// ─── CHALLENGES ──────────────────────────────────────────────────────────────

export const challenges: Challenge[] = [
  {
    id: 'c1', title: 'Thử thách 14 ngày liên tiếp',
    description: 'Tập luyện mỗi ngày trong 14 ngày liên tiếp',
    type: 'daily', target: 14, current: 14, unit: 'ngày',
    reward: { xp: 1000, coins: 500 },
    expiresAt: new Date(Date.now() + 1 * 86400000).toISOString(),
    icon: 'flame', color: '#ff6b35', completed: true, claimed: false,
  },
  {
    id: 'c2', title: 'Đốt 3000 Calories',
    description: 'Đốt cháy 3000 calories trong tuần này',
    type: 'weekly', target: 3000, current: 2400, unit: 'calories',
    reward: { xp: 800, coins: 300 },
    expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    icon: 'zap', color: '#f7c948', completed: false, claimed: false,
  },
  {
    id: 'c3', title: 'Thắng 10 trận Battle',
    description: 'Thắng 10 trận Battle trong tháng',
    type: 'monthly', target: 10, current: 6, unit: 'trận',
    reward: { xp: 1500, coins: 800 },
    expiresAt: new Date(Date.now() + 15 * 86400000).toISOString(),
    icon: 'swords', color: '#ff4757', completed: false, claimed: false,
  },
];

// ─── VOUCHERS (SHOP) ─────────────────────────────────────────────────────────

export const shopVouchers: VoucherItem[] = [
  {
    id: 'v1',
    title: 'Thẻ Tập Gym 7 Ngày Free',
    partner: 'California Fitness & Yoga',
    partnerLogo: '🏋️',
    category: 'gym',
    discountText: '100% OFF (Trị giá 500.000đ)',
    coinPrice: 500,
    originalPrice: '500.000đ',
    expiresInDays: 30,
    claimed: false,
  },
  {
    id: 'v2',
    title: 'Voucher Giảm 30% Đồ Thể Thao',
    partner: 'Decathlon Vietnam',
    partnerLogo: '👟',
    category: 'clothing',
    discountText: 'Giảm 30% đơn từ 500k',
    coinPrice: 350,
    originalPrice: '150.000đ',
    expiresInDays: 14,
    claimed: false,
  },
  {
    id: 'v3',
    title: 'Tặng Hộp Whey Protein 1kg',
    partner: 'Wheystore VN',
    partnerLogo: '🥤',
    category: 'nutrition',
    discountText: 'Giảm 200.000đ đơn Whey',
    coinPrice: 800,
    originalPrice: '200.000đ',
    expiresInDays: 45,
    claimed: false,
  },
  {
    id: 'v4',
    title: '1 Bình Nước Thể Thao Cao Cấp',
    partner: 'Lock&Lock Sports',
    partnerLogo: '🍶',
    category: 'drink',
    discountText: 'Quà tặng miễn phí',
    coinPrice: 400,
    originalPrice: '180.000đ',
    expiresInDays: 20,
    claimed: false,
  },
];

// ─── MEMBERSHIP PLANS ────────────────────────────────────────────────────────

export const membershipPlans: MembershipPlan[] = [
  {
    id: 'free',
    name: 'Gói Miễn Phí',
    badge: 'Standard',
    priceMonthly: '0đ',
    priceYearly: '0đ',
    color: '#8A8A9E',
    features: [
      'Nhận diện AI tối đa 3 bài/ngày',
      'Tham gia trận đấu thường',
      'Đổi voucher cơ bản',
      'Lưu lịch sử tập 7 ngày',
    ],
  },
  {
    id: 'vip',
    name: 'Gói VIP Pro',
    badge: 'Khuyên Dùng',
    priceMonthly: '99.000đ/tháng',
    priceYearly: '899.000đ/năm (Tiết kiệm 25%)',
    color: '#FF6B35',
    isPopular: true,
    features: [
      'Không giới hạn bài tập AI & phân tích form',
      'x1.5 Điểm XP & Coins mỗi trận đấu',
      'Mở khóa Đấu Trường Đặt Cược Ruby',
      'Phân tích chi tiết góc khớp & Chống gian lận',
      'Khung Avatar Neon & Danh hiệu VIP Pro',
    ],
  },
  {
    id: 'titan',
    name: 'Titan Clan VIP',
    badge: 'Đẳng Cấp',
    priceMonthly: '249.000đ/tháng',
    priceYearly: '2.190.000đ/năm',
    color: '#5352ED',
    features: [
      'Tất cả quyền lợi của gói VIP Pro',
      'x2.0 Điểm XP & Coins toàn bộ hệ thống',
      'Vé tham dự Giải Đấu Titan Doanh Nghiệp độc quyền',
      'Huấn luyện viên AI chuyên biệt theo thể trạng',
      'Huy hiệu và Hiệu ứng Vinh Quang Titan độc quyền',
    ],
  },
];

// ─── FRIENDS ─────────────────────────────────────────────────────────────────

export const friends: Friend[] = [
  { id: 'u2', name: 'Thu Hà', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=ThuHa&backgroundColor=c0aede', level: 25, streak: 21, isOnline: true, lastActive: 'now' },
  { id: 'u3', name: 'Hoàng Nam', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=HoangNam&backgroundColor=b6e3f4', level: 24, streak: 8, isOnline: true, lastActive: 'now' },
  { id: 'u4', name: 'Lan Phương', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=LanPhuong&backgroundColor=ffd5dc', level: 22, streak: 15, isOnline: false, lastActive: '2 giờ trước' },
  { id: 'u5', name: 'Khoa Phạm', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=KhoaPham&backgroundColor=d1f4e0', level: 20, streak: 3, isOnline: false, lastActive: '1 ngày trước' },
];

// ─── ACTIVITIES ──────────────────────────────────────────────────────────────

export const recentActivities: ActivitySession[] = [
  { id: 'a1', date: 'Hôm nay, 17:30', duration: 45, calories: 380, heartRate: 142, type: 'Gym', xp: 220 },
  { id: 'a2', date: 'Hôm qua, 18:00', duration: 30, calories: 280, heartRate: 155, type: 'HIIT', xp: 180 },
  { id: 'a3', date: '19/7, 07:00', duration: 60, calories: 420, heartRate: 138, type: 'Chạy bộ', xp: 300 },
  { id: 'a4', date: '18/7, 18:30', duration: 40, calories: 320, heartRate: 148, type: 'Gym', xp: 200 },
  { id: 'a5', date: '17/7, 07:15', duration: 55, calories: 490, heartRate: 135, type: 'Đạp xe', xp: 270 },
];

export const exerciseTypes = [
  { id: 'gym', name: 'Gym', duration: '45-60 phút', color: '#ff6b35' },
  { id: 'run', name: 'Chạy bộ', duration: '20-40 phút', color: '#5352ed' },
  { id: 'hiit', name: 'HIIT', duration: '20-30 phút', color: '#f7c948' },
  { id: 'bike', name: 'Đạp xe', duration: '30-60 phút', color: '#2ed573' },
  { id: 'yoga', name: 'Yoga', duration: '30-45 phút', color: '#a55eea' },
  { id: 'swim', name: 'Bơi lội', duration: '30-45 phút', color: '#1e90ff' },
];

// ─── BATTLE PASS ─────────────────────────────────────────────────────────────

function makeLevels(): import('../types').BattlePassLevel[] {
  const levels: import('../types').BattlePassLevel[] = [];
  const rewards: Array<{ free: import('../types').BattlePassReward; premium: import('../types').BattlePassReward }> = [
    { free: { type: 'xp', amount: 100, label: '+100 XP' }, premium: { type: 'coins', amount: 50, label: '+50 Coins' } },
    { free: { type: 'coins', amount: 30, label: '+30 Coins' }, premium: { type: 'ruby', amount: 5, label: '+5 Ruby' } },
    { free: { type: 'xp', amount: 150, label: '+150 XP' }, premium: { type: 'skin', skinId: 'frame_neon', label: '🔮 Khung Neon' } },
    { free: { type: 'coins', amount: 40, label: '+40 Coins' }, premium: { type: 'ruby', amount: 8, label: '+8 Ruby' } },
    { free: { type: 'xp', amount: 200, label: '+200 XP' }, premium: { type: 'voucher', voucherPartner: 'phuclong', label: '☕ Voucher Phúc Long 20K' } },
    { free: { type: 'coins', amount: 50, label: '+50 Coins' }, premium: { type: 'ruby', amount: 10, label: '+10 Ruby' } },
    { free: { type: 'xp', amount: 250, label: '+250 XP' }, premium: { type: 'skin', skinId: 'title_titan', label: '⚡ Danh hiệu Titan' } },
    { free: { type: 'coins', amount: 60, label: '+60 Coins' }, premium: { type: 'ruby', amount: 12, label: '+12 Ruby' } },
    { free: { type: 'xp', amount: 300, label: '+300 XP' }, premium: { type: 'voucher', voucherPartner: 'shopee', label: '🛒 Voucher Shopee 30K' } },
    { free: { type: 'coins', amount: 70, label: '+70 Coins' }, premium: { type: 'ruby', amount: 15, label: '+15 Ruby' } },
    { free: { type: 'xp', amount: 350, label: '+350 XP' }, premium: { type: 'skin', skinId: 'effect_firework', label: '🎆 Hiệu ứng Pháo Hoa' } },
    { free: { type: 'coins', amount: 80, label: '+80 Coins' }, premium: { type: 'ruby', amount: 18, label: '+18 Ruby' } },
    { free: { type: 'xp', amount: 400, label: '+400 XP' }, premium: { type: 'voucher', voucherPartner: 'tiki', label: '🎬 Voucher Tiki 50K' } },
    { free: { type: 'coins', amount: 100, label: '+100 Coins' }, premium: { type: 'ruby', amount: 20, label: '+20 Ruby' } },
    { free: { type: 'xp', amount: 450, label: '+450 XP' }, premium: { type: 'badge', label: '🏅 Huy hiệu Titan Runner' } },
    { free: { type: 'coins', amount: 120, label: '+120 Coins' }, premium: { type: 'ruby', amount: 25, label: '+25 Ruby' } },
    { free: { type: 'xp', amount: 500, label: '+500 XP' }, premium: { type: 'voucher', voucherPartner: 'grab', label: '🚗 Voucher Grab 40K' } },
    { free: { type: 'coins', amount: 150, label: '+150 Coins' }, premium: { type: 'ruby', amount: 30, label: '+30 Ruby' } },
    { free: { type: 'xp', amount: 600, label: '+600 XP' }, premium: { type: 'skin', skinId: 'frame_dragon', label: '🐉 Khung Rồng Lửa' } },
    { free: { type: 'coins', amount: 200, label: '+200 Coins' }, premium: { type: 'ruby', amount: 50, label: '+50 Ruby' } },
    { free: { type: 'xp', amount: 700, label: '+700 XP' }, premium: { type: 'badge', label: '👑 Huy hiệu Cyber Speedster' } },
    { free: { type: 'coins', amount: 250, label: '+250 Coins' }, premium: { type: 'ruby', amount: 60, label: '+60 Ruby' } },
    { free: { type: 'xp', amount: 800, label: '+800 XP' }, premium: { type: 'voucher', voucherPartner: 'phuclong', label: '☕ Voucher Phúc Long 50K' } },
    { free: { type: 'coins', amount: 300, label: '+300 Coins' }, premium: { type: 'ruby', amount: 80, label: '+80 Ruby' } },
    { free: { type: 'xp', amount: 1000, label: '+1000 XP' }, premium: { type: 'skin', skinId: 'effect_3d', label: '✨ Hiệu ứng 3D Chanh Sả' } },
    { free: { type: 'coins', amount: 350, label: '+350 Coins' }, premium: { type: 'ruby', amount: 100, label: '+100 Ruby' } },
    { free: { type: 'xp', amount: 1200, label: '+1200 XP' }, premium: { type: 'badge', label: '🏆 Huy hiệu Champion' } },
    { free: { type: 'coins', amount: 400, label: '+400 Coins' }, premium: { type: 'ruby', amount: 150, label: '+150 Ruby' } },
    { free: { type: 'xp', amount: 1500, label: '+1500 XP' }, premium: { type: 'voucher', voucherPartner: 'tiki', label: '🎁 Bundle Quà Tặng 200K' } },
  ];

  const missions = [
    'Thắng 3 trận Battle', 'Chạy bộ 5km', 'Đốt 500 calories', 'Hoàn thành 1 trận Rank',
    'Chạy bộ 8km', 'Thắng 5 trận Rank', 'Tập Gym 3 buổi', 'Đốt 1000 calories',
    'Chạy bộ 10km', 'Thắng 8 trận', 'Đạp xe 15km', 'Hoàn thành 5 trận',
    'Thắng 10 trận Rank', 'Chạy bộ 15km', 'Đốt 2000 calories',
  ];

  for (let i = 0; i < 30; i++) {
    const xpBase = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250,
      3850, 4500, 5200, 6000, 6850, 7750, 8700, 9700, 10800, 11900, 13100,
      14400, 15800, 17300, 18900, 20600, 22400, 24300, 26300][i];
    levels.push({
      level: i + 1,
      xpRequired: xpBase,
      freeReward: rewards[i % rewards.length].free,
      premiumReward: rewards[i % rewards.length].premium,
      mission: missions[i % missions.length],
    });
  }
  return levels;
}

export const battlePassSeason: BattlePassSeason = {
  id: 's1',
  name: 'Mùa Giải #7 — Cyber Sprint',
  startDate: '2026-07-01',
  endDate: '2026-08-01',
  daysRemaining: 12,
  totalLevels: 30,
  currentLevel: 14,
  currentXP: 6850,
  xpToNextLevel: 7750,
  isPremium: false,
  levels: makeLevels(),
  prizesClaimed: 18,
  totalPrizes: 60,
};

// ─── VOUCHERS ────────────────────────────────────────────────────────────────

export const vouchers: Voucher[] = [
  { id: 'v1', partner: 'Phúc Long', partnerLogo: '☕', value: '20K', description: 'Giảm 20K cho đơn từ 60K', expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(), claimed: false },
  { id: 'v2', partner: 'Shopee', partnerLogo: '🛒', value: '30K', description: 'Miễn phí vận chuyển ShopeeFood', expiresAt: new Date(Date.now() + 10 * 86400000).toISOString(), claimed: true, claimedAt: '20/7/2026' },
  { id: 'v3', partner: 'Tiki', partnerLogo: '🎬', value: '50K', description: 'Giảm 50K cho đơn sách/thể thao', expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(), claimed: false },
  { id: 'v4', partner: 'Grab', partnerLogo: '🚗', value: '40K', description: 'Voucher GrabBike 40K', expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(), claimed: false },
];

// ─── PREMIUM ARENA ───────────────────────────────────────────────────────────

export const premiumArenas: PremiumArena[] = [
  {
    id: 'pa1', name: 'Đấu Trường Titan', description: 'Giải đấu 1v1 cao cấp nhất mùa giải',
    entryRuby: 20, prizePool: 1000, prizePoolBreakdown: [
      { position: '🥇 Nhất', reward: '400 Ruby + Tay nghe Bluetooth' },
      { position: '🥈 Nhì', reward: '250 Ruby + Voucher Tiki 100K' },
      { position: '🥉 Ba', reward: '150 Ruby + Voucher Phúc Long 50K' },
      { position: '4️⃣–8️⃣', reward: '50 Ruby mỗi người' },
    ],
    participants: 64, maxParticipants: 64, status: 'open', exerciseType: 'Chạy bộ', duration: 20,
  },
  {
    id: 'pa2', name: 'Giải Đua Sức Bền', description: 'Thách đấu 5 vòng — ai trụ được lâu nhất',
    entryRuby: 10, prizePool: 500, prizePoolBreakdown: [
      { position: '🥇 Nhất', reward: '200 Ruby + Giày chạy bộ' },
      { position: '🥈 Nhì', reward: '120 Ruby + Voucher Shopee 80K' },
      { position: '🥉 Ba', reward: '80 Ruby' },
      { position: '4️⃣–8️⃣', reward: '25 Ruby' },
    ],
    participants: 28, maxParticipants: 32, status: 'countdown', startTime: new Date(Date.now() + 3600000).toISOString(), exerciseType: 'HIIT', duration: 15,
  },
  {
    id: 'pa3', name: 'Trận Cược Ruby', description: 'Mỗi trận tốn 5 Ruby — thắng ăn 8 Ruby',
    entryRuby: 5, prizePool: 0, prizePoolBreakdown: [],
    participants: 15, maxParticipants: 999, status: 'live', exerciseType: 'Gym', duration: 10,
  },
];

// ─── SHOP / SKINS ────────────────────────────────────────────────────────────

export const skinItems: SkinItem[] = [
  { id: 'frame_neon', name: 'Khung Neon', type: 'avatar_frame', preview: '🔮', price: 50, rarity: 'rare', owned: false, limited: true, season: 'Mùa #7' },
  { id: 'frame_dragon', name: 'Khung Rồng Lửa', type: 'avatar_frame', preview: '🐉', price: 150, rarity: 'legendary', owned: false, limited: true, season: 'Mùa #7' },
  { id: 'title_titan', name: 'Titan Runner', type: 'title', preview: '⚡', price: 30, rarity: 'epic', owned: false },
  { id: 'effect_firework', name: 'Hiệu ứng Pháo Hoa', type: 'victory_effect', preview: '🎆', price: 80, rarity: 'rare', owned: false, limited: true, season: 'Mùa #7' },
  { id: 'effect_3d', name: 'Hiệu ứng 3D Chanh Sả', type: 'victory_effect', preview: '✨', price: 200, rarity: 'legendary', owned: false },
  { id: 'badge_titan', name: 'Huy hiệu Titan Runner', type: 'badge', preview: '🏅', price: 100, rarity: 'epic', owned: false },
  { id: 'badge_cyber', name: 'Huy hiệu Cyber Speedster', type: 'badge', preview: '👑', price: 120, rarity: 'legendary', owned: false, limited: true },
];
