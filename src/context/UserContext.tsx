import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Battle, Challenge, ActivitySession, SkinItem, LeaderboardEntry, ExerciseInfo } from '../types';
import {
  initialUserSeed as defaultUser,
  initialExercisesSeed as defaultExercises,
  initialChallengesSeed as defaultChallenges,
  initialBattlesSeed as defaultBattles,
  initialActivitiesSeed as defaultActivities,
  initialSkinItemsSeed as defaultSkinItems,
  initialLeaderboardSeed as defaultLeaderboard
} from '../data/seedData';
import type { ToastData } from '../components/ui';

export interface OnboardingData {
  name: string;
  avatarSeed: string;
  avatarColor: string;
  avatarEmoji: string;
  email?: string;
  password?: string;
}

export interface StoredAccount {
  user: User;
  email: string;
  password?: string;
  avatarSeed?: string;
  avatarColor?: string;
  avatarEmoji?: string;
}

export interface UserMembershipData {
  tier: 'free' | 'basic' | 'premium' | 'vip';
  expiryDate?: string;
  dailyBonusPercent: number;
  battleCostReduction: number;
  unlimitedSync: boolean;
  perks: string[];
}

interface UserContextValue {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  exercises: ExerciseInfo[];
  setExercises: React.Dispatch<React.SetStateAction<ExerciseInfo[]>>;
  challenges: Challenge[];
  setChallenges: React.Dispatch<React.SetStateAction<Challenge[]>>;
  battles: Battle[];
  setBattles: React.Dispatch<React.SetStateAction<Battle[]>>;
  recentActivities: ActivitySession[];
  setRecentActivities: React.Dispatch<React.SetStateAction<ActivitySession[]>>;
  skinItems: SkinItem[];
  setSkinItems: React.Dispatch<React.SetStateAction<SkinItem[]>>;
  leaderboard: LeaderboardEntry[];
  membership: UserMembershipData;
  setMembership: React.Dispatch<React.SetStateAction<UserMembershipData>>;
  onboardingData: OnboardingData | null;
  isOnboarded: boolean;
  // Account & DB
  accounts: StoredAccount[];
  switchAccount: (emailOrId: string) => void;
  resetDatabase: () => void;
  // Core dynamic actions
  recordExerciseSession: (type: 'pushup' | 'pullup' | 'walking', count: number, durationMinutes?: number, caloriesBurned?: number) => void;
  addManualSteps: (steps: number) => void;
  claimChallenge: (challengeId: string) => void;
  buyShopItem: (itemId: string) => boolean;
  joinBattle: (battleId: string) => void;
  upgradeMembership: (tier: 'basic' | 'premium' | 'vip') => void;
  completeOnboarding: (data: OnboardingData) => void;
  updateBattleResult: (myScore: number, oppScore: number, result: 'win' | 'lose' | 'cheat' | 'opp_cheat') => void;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  resetOnboarding: () => void;
  upgradeToVIP: () => void;
  deductStamina: (amount: number) => boolean;
  refillStamina: () => void;
  buyRuby: (amount: number) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  // Toast
  toasts: ToastData[];
  showToast: (message: string, type?: ToastData['type']) => void;
  dismissToast: (id: string) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
};

const ONBOARDED_KEY = 'fb_onboarded';
const ACCOUNTS_KEY = 'fb_accounts';
const CURRENT_ACCOUNT_KEY = 'fb_current_account';
const USER_KEY = 'fb_user';
const EXERCISES_KEY = 'fb_exercises';
const CHALLENGES_KEY = 'fb_challenges';
const BATTLES_KEY = 'fb_battles';
const ACTIVITIES_KEY = 'fb_activities';
const SHOP_ITEMS_KEY = 'fb_shop_items';
const MEMBERSHIP_KEY = 'fb_membership';

const DEFAULT_PRESET_ACCOUNTS: Record<string, StoredAccount> = {
  'demo@fitnessbattle.vn': {
    email: 'demo@fitnessbattle.vn',
    password: 'demo123456',
    avatarSeed: 'Warrior',
    avatarColor: 'b6e3f4',
    avatarEmoji: '🏃',
    user: {
      ...defaultUser,
      id: 'demo_user_1',
      name: 'Demo User',
      email: 'demo@fitnessbattle.vn',
      level: 15,
      xp: 4250,
      xpToNextLevel: 6000,
      streak: 18,
      totalPoints: 6850,
      rank: 28,
      ruby: 350,
      stamina: 200,
      maxStamina: 200,
      coins: 5800,
      isVIP: false,
    }
  },
  'vip@fitnessbattle.vn': {
    email: 'vip@fitnessbattle.vn',
    password: 'vip123456',
    avatarSeed: 'Champion',
    avatarColor: 'ffd5dc',
    avatarEmoji: '👑',
    user: {
      ...defaultUser,
      id: 'vip_pro_user',
      name: 'VIP Pro Master',
      email: 'vip@fitnessbattle.vn',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      level: 45,
      xp: 12800,
      xpToNextLevel: 18000,
      streak: 68,
      totalPoints: 24500,
      rank: 3,
      ruby: 1850,
      stamina: 500,
      maxStamina: 500,
      coins: 38500,
      isVIP: true,
      equippedSkinFrame: '🐉 Rồng Lửa Frame VIP',
      equippedTitle: '👑 VIP Battle Master',
    }
  }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Accounts initialize
  const [accountsMap, setAccountsMap] = useState<Record<string, StoredAccount>>(() => {
    try {
      const saved = localStorage.getItem(ACCOUNTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PRESET_ACCOUNTS, ...parsed };
      }
    } catch {}
    return { ...DEFAULT_PRESET_ACCOUNTS };
  });

  // 1. User
  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { ...DEFAULT_PRESET_ACCOUNTS['demo@fitnessbattle.vn'].user };
  });

  // 2. Exercises
  const [exercises, setExercises] = useState<ExerciseInfo[]>(() => {
    try {
      const saved = localStorage.getItem(EXERCISES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [...defaultExercises];
  });

  // 3. Challenges
  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    try {
      const saved = localStorage.getItem(CHALLENGES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [...defaultChallenges];
  });

  // 4. Battles
  const [battles, setBattles] = useState<Battle[]>(() => {
    try {
      const saved = localStorage.getItem(BATTLES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [...defaultBattles];
  });

  // 5. Recent Activities
  const [recentActivities, setRecentActivities] = useState<ActivitySession[]>(() => {
    try {
      const saved = localStorage.getItem(ACTIVITIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [...defaultActivities];
  });

  // 6. Shop Items
  const [skinItems, setSkinItems] = useState<SkinItem[]>(() => {
    try {
      const saved = localStorage.getItem(SHOP_ITEMS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [...defaultSkinItems];
  });

  // 7. Membership
  const [membership, setMembership] = useState<UserMembershipData>(() => {
    try {
      const saved = localStorage.getItem(MEMBERSHIP_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      tier: 'free',
      dailyBonusPercent: 0,
      battleCostReduction: 0,
      unlimitedSync: false,
      perks: [
        'Nhận diện AI tối đa 3 bài/ngày',
        'Tham gia trận đấu thường',
        'Lưu lịch sử tập 7 ngày'
      ]
    };
  });

  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Toast
  const showToast = useCallback((message: string, type: ToastData['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => dismissToast(id), 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    const onboarded = localStorage.getItem(ONBOARDED_KEY);
    setIsOnboarded(onboarded !== 'false');
  }, []);

  useEffect(() => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accountsMap));
  }, [accountsMap]);

  useEffect(() => {
    localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem(BATTLES_KEY, JSON.stringify(battles));
  }, [battles]);

  useEffect(() => {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(recentActivities));
  }, [recentActivities]);

  useEffect(() => {
    localStorage.setItem(SHOP_ITEMS_KEY, JSON.stringify(skinItems));
  }, [skinItems]);

  useEffect(() => {
    localStorage.setItem(MEMBERSHIP_KEY, JSON.stringify(membership));
  }, [membership]);

  // Periodic Stamina Auto-Regeneration Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setUser(prev => {
        const max = prev.maxStamina || 100;
        if (prev.stamina >= max) return prev;
        const now = new Date();
        const lastRefill = prev.lastStaminaRefillAt ? new Date(prev.lastStaminaRefillAt) : now;
        const secondsElapsed = Math.floor((now.getTime() - lastRefill.getTime()) / 1000);
        if (secondsElapsed >= 180) {
          const points = Math.floor(secondsElapsed / 180);
          const newStamina = Math.min(max, prev.stamina + points);
          const remaining = new Date(lastRefill.getTime() + points * 180 * 1000);
          return {
            ...prev,
            stamina: newStamina,
            lastStaminaRefillAt: newStamina >= max ? now.toISOString() : remaining.toISOString(),
          };
        }
        return prev;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Switch Account
  const switchAccount = (emailOrId: string) => {
    const key = Object.keys(accountsMap).find(k => k.toLowerCase() === emailOrId.toLowerCase() || accountsMap[k].user.id === emailOrId);
    if (key && accountsMap[key]) {
      const acc = accountsMap[key];
      setUser(acc.user);
      localStorage.setItem(USER_KEY, JSON.stringify(acc.user));
      localStorage.setItem(CURRENT_ACCOUNT_KEY, acc.email);
      showToast(`Đã chuyển sang tài khoản: ${acc.user.name}`, 'success');
    }
  };

  // Reset Database
  const resetDatabase = () => {
    localStorage.clear();
    setUser({ ...defaultUser });
    setExercises([...defaultExercises]);
    setChallenges([...defaultChallenges]);
    setBattles([...defaultBattles]);
    setRecentActivities([...defaultActivities]);
    setSkinItems([...defaultSkinItems]);
    setAccountsMap({ ...DEFAULT_PRESET_ACCOUNTS });
    setIsOnboarded(true);
    showToast('Đã đặt lại toàn bộ Cơ Sở Dữ Liệu về mặc định!', 'success');
  };

  // Record Exercise Action (Pushup, Pullup, Walking)
  const recordExerciseSession = (
    type: 'pushup' | 'pullup' | 'walking',
    count: number,
    durationMinutes: number = 10,
    caloriesBurned?: number
  ) => {
    const cal = caloriesBurned || (type === 'pushup' ? Math.round(count * 0.5) : type === 'pullup' ? Math.round(count * 1.2) : Math.round(count * 0.04));
    const xpGained = Math.round(count * (type === 'walking' ? 0.05 : 2.5));
    const pointsGained = Math.round(count * (type === 'walking' ? 0.02 : 1.5));

    // 1. Update Exercises
    setExercises(prev =>
      prev.map(ex => {
        if (ex.type === type) {
          return { ...ex, todayCount: ex.todayCount + count };
        }
        return ex;
      })
    );

    // 2. Add Activity
    const newAct: ActivitySession = {
      id: `act_${Date.now()}`,
      date: 'Vừa xong',
      duration: durationMinutes,
      calories: cal,
      heartRate: 135 + Math.floor(Math.random() * 20),
      type: type === 'pushup' ? 'Hít Đất' : type === 'pullup' ? 'Kéo Xà' : 'Đi Bộ',
      xp: xpGained
    };
    setRecentActivities(prev => [newAct, ...prev.slice(0, 19)]);

    // 3. Update User State
    setUser(prev => {
      const newXp = prev.xp + xpGained;
      const xpToNext = prev.xpToNextLevel;
      const levelUp = newXp >= xpToNext;
      const newLevel = levelUp ? prev.level + 1 : prev.level;
      const remainingXp = levelUp ? newXp - xpToNext : newXp;

      const weeklyMinutes = [...(prev.stats?.weeklyMinutes || [45, 60, 30, 90, 0, 75, 55])];
      weeklyMinutes[weeklyMinutes.length - 1] += durationMinutes;

      const weeklyCalories = [...(prev.stats?.weeklyCalories || [320, 410, 220, 580, 0, 490, 380])];
      weeklyCalories[weeklyCalories.length - 1] += cal;

      return {
        ...prev,
        xp: remainingXp,
        level: newLevel,
        xpToNextLevel: levelUp ? Math.floor(xpToNext * 1.5) : xpToNext,
        totalPoints: prev.totalPoints + pointsGained,
        coins: prev.coins + Math.round(xpGained / 2),
        stats: {
          ...prev.stats,
          totalWorkouts: (prev.stats?.totalWorkouts || 89) + 1,
          totalMinutes: (prev.stats?.totalMinutes || 2840) + durationMinutes,
          totalCalories: (prev.stats?.totalCalories || 42500) + cal,
          weeklyMinutes,
          weeklyCalories,
          avgHeartRate: Math.round(((prev.stats?.avgHeartRate || 135) + newAct.heartRate) / 2)
        }
      };
    });

    // 4. Update Challenges progress
    setChallenges(prev =>
      prev.map(ch => {
        if (ch.type === 'daily' && !ch.completed) {
          const newCur = ch.current + 1;
          const completed = newCur >= ch.target;
          return { ...ch, current: newCur, completed };
        }
        return ch;
      })
    );

    showToast(`Đã ghi nhận ${count} ${type === 'walking' ? 'bước' : 'lần'} (+${xpGained} XP, +${cal} kcal)!`, 'success');
  };

  // Add Manual Steps
  const addManualSteps = (steps: number) => {
    recordExerciseSession('walking', steps, Math.max(5, Math.round(steps / 100)));
  };

  // Claim Challenge Reward
  const claimChallenge = (challengeId: string) => {
    const ch = challenges.find(c => c.id === challengeId);
    if (!ch) return;
    if (!ch.completed || ch.claimed) return;

    setChallenges(prev =>
      prev.map(item => (item.id === challengeId ? { ...item, claimed: true } : item))
    );

    addXP(ch.reward.xp);
    addCoins(ch.reward.coins);
    showToast(`Đã nhận +${ch.reward.xp} XP và +${ch.reward.coins} Coins!`, 'success');
  };

  // Buy Shop Item
  const buyShopItem = (itemId: string): boolean => {
    const item = skinItems.find(i => i.id === itemId);
    if (!item) return false;
    if (item.owned) {
      showToast('Bạn đã sở hữu vật phẩm này!', 'info');
      return false;
    }

    if (user.ruby < item.price) {
      showToast('Bạn không đủ Ruby để mua vật phẩm này!', 'error');
      return false;
    }

    // Deduct ruby and mark owned
    setUser(prev => ({
      ...prev,
      ruby: prev.ruby - item.price,
      equippedSkinFrame: item.type === 'avatar_frame' ? item.name : prev.equippedSkinFrame,
      equippedTitle: item.type === 'title' ? item.name : prev.equippedTitle
    }));

    setSkinItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, owned: true } : i))
    );

    showToast(`Mua thành công ${item.name}!`, 'success');
    return true;
  };

  // Join Battle
  const joinBattle = (battleId: string) => {
    setBattles(prev =>
      prev.map(b => {
        if (b.id === battleId && b.status === 'waiting') {
          return {
            ...b,
            status: 'active',
            players: [
              b.players[0],
              {
                userId: user.id,
                userName: user.name,
                avatar: user.avatar,
                score: 0,
                heartRate: 138,
                duration: 0,
                isActive: true
              }
            ]
          };
        }
        return b;
      })
    );
    showToast('Đã tham gia phòng chờ thi đấu!', 'success');
  };

  // Upgrade Membership
  const upgradeMembership = (tier: 'basic' | 'premium' | 'vip') => {
    const isVip = tier === 'vip' || tier === 'premium';
    const bonus = tier === 'vip' ? 35 : tier === 'premium' ? 20 : 10;
    const reduction = tier === 'vip' ? 50 : tier === 'premium' ? 25 : 10;

    setMembership({
      tier,
      expiryDate: '2026-12-31',
      dailyBonusPercent: bonus,
      battleCostReduction: reduction,
      unlimitedSync: true,
      perks: [
        `+${bonus}% điểm thưởng toàn hệ thống`,
        `Giảm ${reduction}% phí tham gia đấu trường`,
        'Đồng bộ dữ liệu thời gian thực',
        'Phân tích góc khớp AI chuẩn thi đấu',
        'Mở khóa toàn bộ Khung Avatar & Danh hiệu'
      ]
    });

    setUser(prev => ({
      ...prev,
      isVIP: isVip,
      maxStamina: isVip ? 500 : 200,
      stamina: isVip ? 500 : 200,
      ruby: prev.ruby + (tier === 'vip' ? 100 : tier === 'premium' ? 50 : 20),
      equippedSkinFrame: tier === 'vip' ? '🐉 Rồng Lửa Frame VIP' : prev.equippedSkinFrame,
      equippedTitle: tier === 'vip' ? '👑 VIP Battle Master' : prev.equippedTitle
    }));

    showToast(`Nâng cấp thành công gói ${tier.toUpperCase()} Member!`, 'success');
  };

  // Battle Result
  const updateBattleResult = (
    myScore: number,
    _oppScore: number,
    result: 'win' | 'lose' | 'cheat' | 'opp_cheat'
  ) => {
    const isWin = result === 'win' || result === 'opp_cheat';
    const xpGained = result === 'cheat' ? 0 : Math.floor(myScore * 3.5 + (isWin ? 50 : 15));
    const pointsGained = result === 'cheat' ? -50 : result === 'lose' ? Math.floor(myScore * 1.5) : Math.floor(myScore * 4 + 30);
    const streakChange = isWin ? 1 : result === 'lose' ? -Math.min(user.streak, 2) : 0;

    // Deduct stamina
    setUser(prev => {
      const newXp = prev.xp + xpGained;
      const xpToNext = prev.xpToNextLevel;
      const levelUp = newXp >= xpToNext;
      const newLevel = levelUp ? prev.level + 1 : prev.level;
      const remainingXp = levelUp ? newXp - xpToNext : newXp;

      const newWin = isWin ? prev.winCount + 1 : prev.winCount;
      const newLose = result === 'lose' ? prev.loseCount + 1 : prev.loseCount;
      const newStreak = Math.max(0, prev.streak + streakChange);

      const updatedBadges = prev.badges?.map(b => {
        if (b.id === 'b6' && (newWin >= 5 || newStreak >= 3)) return { ...b, earned: true };
        if (b.id === 'b5' && newWin + newLose >= 5) return { ...b, earned: true };
        return b;
      });

      return {
        ...prev,
        xp: remainingXp,
        level: newLevel,
        xpToNextLevel: levelUp ? Math.floor(xpToNext * 1.5) : xpToNext,
        totalPoints: Math.max(0, prev.totalPoints + pointsGained),
        streak: newStreak,
        winCount: newWin,
        loseCount: newLose,
        stamina: Math.max(0, prev.stamina - 10),
        badges: updatedBadges,
      };
    });

    // Add Battle to Activity Feed
    const newAct: ActivitySession = {
      id: `act_battle_${Date.now()}`,
      date: 'Vừa xong',
      duration: 1,
      calories: Math.round(myScore * 0.6),
      heartRate: 145,
      type: `⚔️ Đấu (${isWin ? 'Thắng' : 'Thua'})`,
      xp: xpGained
    };
    setRecentActivities(prev => [newAct, ...prev.slice(0, 19)]);

    // Update Challenges for battle
    if (isWin) {
      setChallenges(prev =>
        prev.map(ch => {
          if (ch.title.toLowerCase().includes('thắng') || ch.title.toLowerCase().includes('đấu')) {
            const newCur = ch.current + 1;
            return { ...ch, current: newCur, completed: newCur >= ch.target };
          }
          return ch;
        })
      );
    }
  };

  const upgradeToVIP = () => {
    upgradeMembership('vip');
  };

  const deductStamina = (amount: number): boolean => {
    if (user.stamina < amount) return false;
    setUser(prev => ({ ...prev, stamina: prev.stamina - amount }));
    return true;
  };

  const refillStamina = () => {
    setUser(prev => ({ ...prev, stamina: prev.maxStamina }));
    showToast('Đã hồi phục toàn bộ Stamina!', 'success');
  };

  const buyRuby = (amount: number) => {
    setUser(prev => ({ ...prev, ruby: Math.max(0, prev.ruby + amount) }));
  };

  const addXP = (amount: number) => {
    setUser(prev => {
      const newXp = prev.xp + amount;
      const xpToNext = prev.xpToNextLevel;
      const levelUp = newXp >= xpToNext;
      return {
        ...prev,
        xp: levelUp ? newXp - xpToNext : newXp,
        level: levelUp ? prev.level + 1 : prev.level,
        xpToNextLevel: levelUp ? Math.floor(xpToNext * 1.5) : xpToNext,
      };
    });
  };

  const addCoins = (amount: number) => {
    setUser(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  const completeOnboarding = (data: OnboardingData) => {
    const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(data.avatarSeed)}&backgroundColor=${data.avatarColor}`;

    const updated: User = {
      ...user,
      name: data.name,
      email: data.email,
      avatar: avatarUrl,
      level: 1,
      xp: 0,
      xpToNextLevel: 500,
      streak: 0,
      totalPoints: 0,
      rank: 999,
      winCount: 0,
      loseCount: 0,
      ruby: 10,
      stamina: 100,
      maxStamina: 100,
      coins: 200,
      coinsExpiringDays: 14,
      hasBattlePass: true,
      battlePassTier: 0,
      isVIP: false,
    };

    setUser(updated);
    setOnboardingData(data);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    localStorage.setItem(ONBOARDED_KEY, 'true');
    setIsOnboarded(true);

    if (data.email) {
      setAccountsMap(prev => ({
        ...prev,
        [data.email!.toLowerCase()]: {
          user: updated,
          email: data.email!.toLowerCase(),
          password: data.password,
          avatarSeed: data.avatarSeed,
          avatarColor: data.avatarColor,
          avatarEmoji: data.avatarEmoji,
        }
      }));
      localStorage.setItem(CURRENT_ACCOUNT_KEY, data.email.toLowerCase());
    }
  };

  const register = (name: string, email: string, password: string): { success: boolean; error?: string } => {
    const emailKey = email.toLowerCase().trim();
    if (accountsMap[emailKey]) {
      return { success: false, error: 'Email này đã được đăng ký.' };
    }

    const newUser: User = {
      ...defaultUser,
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: emailKey,
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`,
      level: 1,
      xp: 0,
      xpToNextLevel: 500,
      streak: 1,
      totalPoints: 100,
      rank: 500,
      winCount: 0,
      loseCount: 0,
      ruby: 20,
      stamina: 100,
      maxStamina: 100,
      coins: 300,
      isVIP: false,
      joinDate: new Date().toISOString().split('T')[0],
    };

    const newAccount: StoredAccount = {
      email: emailKey,
      password,
      user: newUser,
    };

    setAccountsMap(prev => ({ ...prev, [emailKey]: newAccount }));
    setUser(newUser);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(ONBOARDED_KEY, 'true');
    localStorage.setItem(CURRENT_ACCOUNT_KEY, emailKey);
    setIsOnboarded(true);
    showToast('🎉 Tạo tài khoản thành công! Đã đăng nhập.', 'success');
    return { success: true };
  };

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const emailKey = email.toLowerCase().trim();
    const account = accountsMap[emailKey];

    if (!account) {
      return { success: false, error: 'Tài khoản không tồn tại. Vui lòng đăng ký.' };
    }

    if (account.password && account.password !== password) {
      return { success: false, error: 'Sai mật khẩu. Vui lòng thử lại.' };
    }

    setUser(account.user);
    setOnboardingData({
      name: account.user.name,
      avatarSeed: account.avatarSeed || 'Warrior',
      avatarColor: account.avatarColor || 'b6e3f4',
      avatarEmoji: account.avatarEmoji || '🏃',
      email: account.email,
    });
    localStorage.setItem(USER_KEY, JSON.stringify(account.user));
    localStorage.setItem(ONBOARDED_KEY, 'true');
    localStorage.setItem(CURRENT_ACCOUNT_KEY, emailKey);
    setIsOnboarded(true);
    showToast(`Chào mừng trở lại, ${account.user.name}!`, 'success');
    return { success: true };
  };

  const resetOnboarding = () => {
    localStorage.setItem(ONBOARDED_KEY, 'false');
    setIsOnboarded(false);
  };

  // Dynamic leaderboard computed with current user rank position
  const leaderboard: LeaderboardEntry[] = React.useMemo(() => {
    const base = defaultLeaderboard.filter(e => e.userId !== user.id && !e.isCurrentUser);
    const userEntry: LeaderboardEntry = {
      rank: user.rank,
      userId: user.id,
      userName: user.name,
      avatar: user.avatar,
      level: user.level,
      points: user.totalPoints,
      isVIP: user.isVIP,
      isCurrentUser: true
    };
    const combined = [...base, userEntry].sort((a, b) => b.points - a.points);
    return combined.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  }, [user]);

  const accountsList = Object.values(accountsMap);

  return (
    <UserContext.Provider value={{
      user, setUser,
      exercises, setExercises,
      challenges, setChallenges,
      battles, setBattles,
      recentActivities, setRecentActivities,
      skinItems, setSkinItems,
      leaderboard, membership, setMembership,
      onboardingData, isOnboarded,
      accounts: accountsList,
      switchAccount,
      resetDatabase,
      recordExerciseSession, addManualSteps, claimChallenge, buyShopItem, joinBattle, upgradeMembership,
      completeOnboarding, updateBattleResult, login, register, resetOnboarding,
      upgradeToVIP, deductStamina, refillStamina, buyRuby, addXP, addCoins,
      toasts, showToast, dismissToast
    }}>
      {children}
    </UserContext.Provider>
  );
};
