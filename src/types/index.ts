export interface User {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  totalPoints: number;
  rank: number;
  winCount: number;
  loseCount: number;
  heartRate: number;
  calories: number;
  joinDate: string;
  badges: Badge[];
  stats: UserStats;
  ruby: number;
  stamina: number;
  maxStamina: number;
  coins: number;
  coinsExpiringDays: number;
  hasBattlePass: boolean;
  battlePassTier: number;
  isVIP: boolean;
  vipSlot?: number;
  equippedSkinFrame?: string;
  equippedTitle?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  earned: boolean;
}

export interface UserStats {
  totalWorkouts: number;
  totalMinutes: number;
  avgHeartRate: number;
  totalCalories: number;
  weeklyMinutes: number[];
  weeklyCalories: number[];
}

export type ExerciseType = 'pushup' | 'pullup' | 'walking';

export interface ExerciseInfo {
  type: ExerciseType;
  name: string;
  icon: string;
  todayCount: number;
  targetCount: number;
  unit: string;
  caloriesPerRep: number;
  color: string;
  gradient: string;
}

export interface ExerciseSession {
  id: string;
  type: ExerciseType;
  startTime: string;
  durationSeconds: number;
  repsCount: number;
  validRepsCount: number;
  caloriesBurned: number;
  avgAccuracy: number;
  antiCheatScore: number;
  isCheatSuspected: boolean;
  notes?: string;
}

export interface ExerciseLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar: string;
  bestScore: number;
  totalSessions: number;
  avgAccuracy: number;
  type: ExerciseType;
  isCurrentUser?: boolean;
}

export interface Battle {
  id: string;
  title: string;
  type: 'ranked' | 'friendly' | 'challenge' | 'ruby_stake' | 'titan' | 'brand_spot';
  status: 'waiting' | 'active' | 'finished';
  players: BattlePlayer[];
  duration: number;
  startedAt?: string;
  endedAt?: string;
  reward: BattleReward;
  exerciseType: string;
  arenaType?: 'normal' | 'premium' | 'brand';
  rubyStake?: number;
  staminaCost?: number;
  brandPartner?: {
    name: string;
    logo: string;
    location: string;
    sponsorBonus: string;
  };
  spectatorCount?: number;
}

export interface BattlePlayer {
  userId: string;
  userName: string;
  avatar: string;
  score: number;
  heartRate: number;
  duration: number;
  isActive: boolean;
}

export interface BattleReward {
  xp: number;
  coins: number;
  ruby?: number;
  badgeId?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  target: number;
  current: number;
  unit: string;
  reward: { xp: number; coins: number; ruby?: number };
  expiresAt: string;
  icon: string;
  color: string;
  completed: boolean;
  claimed?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar: string;
  level: number;
  points: number;
  isCurrentUser?: boolean;
  isVIP?: boolean;
}

export interface ActivitySession {
  id: string;
  date: string;
  duration: number;
  calories: number;
  heartRate: number;
  type: string;
  xp: number;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  level: number;
  streak: number;
  isOnline: boolean;
  lastActive: string;
}

export interface Voucher {
  id: string;
  partner: string;
  partnerLogo: string;
  value: string;
  description: string;
  expiresAt: string;
  code?: string;
  claimed: boolean;
  claimedAt?: string;
}

export type BattlePassRewardType = 'xp' | 'coins' | 'ruby' | 'voucher' | 'skin' | 'badge';

export interface BattlePassReward {
  type: BattlePassRewardType;
  amount?: number;
  label: string;
  description?: string;
  voucherPartner?: string;
  skinId?: string;
}

export interface BattlePassLevel {
  level: number;
  xpRequired: number;
  freeReward: BattlePassReward;
  premiumReward?: BattlePassReward;
  mission?: string;
}

export interface BattlePassSeason {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  totalLevels: number;
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  isPremium: boolean;
  levels: BattlePassLevel[];
  prizesClaimed: number;
  totalPrizes: number;
}

export interface VoucherItem {
  id: string;
  title: string;
  partner: string;
  partnerLogo: string;
  category: 'gym' | 'clothing' | 'nutrition' | 'drink';
  discountText: string;
  coinPrice: number;
  originalPrice: string;
  expiresInDays: number;
  claimed: boolean;
  code?: string;
}

export interface MembershipPlan {
  id: 'free' | 'vip' | 'titan';
  name: string;
  badge: string;
  priceMonthly: string;
  priceYearly: string;
  color: string;
  isPopular?: boolean;
  features: string[];
}

export interface PremiumArena {
  id: string;
  name: string;
  description: string;
  entryRuby: number;
  prizePool: number;
  prizePoolBreakdown: { position: string; reward: string }[];
  participants: number;
  maxParticipants: number;
  status: 'open' | 'countdown' | 'live' | 'finished';
  startTime?: string;
  exerciseType: string;
  duration: number;
}

export interface SkinItem {
  id: string;
  name: string;
  type: 'avatar_frame' | 'victory_effect' | 'title' | 'badge';
  preview: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  owned: boolean;
  limited?: boolean;
  season?: string;
}
