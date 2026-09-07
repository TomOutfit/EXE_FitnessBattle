import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { currentUser as defaultUser } from '../data/mockData';

interface OnboardingData {
  name: string;
  avatarSeed: string;
  avatarColor: string;
  avatarEmoji: string;
  email?: string;
  password?: string;
}

interface StoredAccount {
  user: User;
  email: string;
  password: string;
  avatarSeed: string;
  avatarColor: string;
  avatarEmoji: string;
}

interface UserContextValue {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  onboardingData: OnboardingData | null;
  isOnboarded: boolean;
  completeOnboarding: (data: OnboardingData) => void;
  updateBattleResult: (myScore: number, oppScore: number, result: 'win' | 'lose' | 'cheat' | 'opp_cheat') => void;
  login: (email: string, password: string) => { success: boolean; error?: string };
  resetOnboarding: () => void;
  upgradeToVIP: () => void;
  deductStamina: (amount: number) => boolean;
  refillStamina: () => void;
  buyRuby: (amount: number) => void;
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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('fb_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { ...defaultUser };
  });

  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    setIsOnboarded(localStorage.getItem(ONBOARDED_KEY) === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('fb_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    const onReset = () => setIsOnboarded(localStorage.getItem(ONBOARDED_KEY) === 'true');
    window.addEventListener('fb_reset', onReset);
    return () => window.removeEventListener('fb_reset', onReset);
  }, []);

  const getAccounts = (): Record<string, StoredAccount> => {
    try {
      const saved = localStorage.getItem(ACCOUNTS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const saveAccounts = (accounts: Record<string, StoredAccount>) => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  };

  const updateBattleResult = (
    myScore: number,
    _oppScore: number,
    result: 'win' | 'lose' | 'cheat' | 'opp_cheat'
  ) => {
    const xpGained = result === 'cheat' ? 0 : Math.floor(myScore * 1.5);
    const pointsGained = result === 'cheat' ? -50 : result === 'lose' ? Math.floor(myScore * 0.3) : Math.floor(myScore * 2);
    const streakChange = result === 'win' ? 1 : result === 'lose' ? -Math.min(user.streak, 2) : 0;

    setUser(prev => {
      const newXp = prev.xp + xpGained;
      const xpToNext = prev.xpToNextLevel;
      const levelUp = newXp >= xpToNext;
      const newLevel = levelUp ? prev.level + 1 : prev.level;
      const remainingXp = levelUp ? newXp - xpToNext : newXp;

      return {
        ...prev,
        xp: remainingXp,
        level: newLevel,
        xpToNextLevel: levelUp ? Math.floor(xpToNext * 1.5) : xpToNext,
        totalPoints: Math.max(0, prev.totalPoints + pointsGained),
        streak: Math.max(0, prev.streak + streakChange),
        winCount: result === 'win' || result === 'opp_cheat' ? prev.winCount + 1 : prev.winCount,
        loseCount: result === 'lose' ? prev.loseCount + 1 : prev.loseCount,
      };
    });
  };

  const upgradeToVIP = () => {
    setUser(prev => ({
      ...prev,
      isVIP: true,
      maxStamina: 500,
      stamina: 500,
      ruby: prev.ruby + 100,
      equippedSkinFrame: '🐉 Rồng Lửa Frame VIP',
      equippedTitle: '👑 VIP Battle Master'
    }));
  };

  const deductStamina = (amount: number): boolean => {
    if (user.stamina < amount) return false;
    setUser(prev => ({ ...prev, stamina: prev.stamina - amount }));
    return true;
  };

  const refillStamina = () => {
    setUser(prev => ({ ...prev, stamina: prev.maxStamina }));
  };

  const buyRuby = (amount: number) => {
    setUser(prev => ({ ...prev, ruby: prev.ruby + amount }));
  };

  const completeOnboarding = (data: OnboardingData) => {
    const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(data.avatarSeed)}&backgroundColor=${data.avatarColor}`;

    const updated: User = {
      ...user,
      name: data.name,
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
    localStorage.setItem('fb_user', JSON.stringify(updated));
    localStorage.setItem(ONBOARDED_KEY, 'true');
    setIsOnboarded(true);

    if (data.email && data.password) {
      const accounts = getAccounts();
      accounts[data.email.toLowerCase()] = {
        user: updated,
        email: data.email.toLowerCase(),
        password: data.password,
        avatarSeed: data.avatarSeed,
        avatarColor: data.avatarColor,
        avatarEmoji: data.avatarEmoji,
      };
      saveAccounts(accounts);
      localStorage.setItem(CURRENT_ACCOUNT_KEY, data.email.toLowerCase());
    }
  };

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const accounts = getAccounts();
    const account = accounts[email.toLowerCase()];

    if (!account) {
      return { success: false, error: 'Tài khoản không tồn tại. Vui lòng đăng ký.' };
    }

    if (account.password !== password) {
      return { success: false, error: 'Sai mật khẩu. Vui lòng thử lại.' };
    }

    setUser(account.user);
    setOnboardingData({
      name: account.user.name,
      avatarSeed: account.avatarSeed,
      avatarColor: account.avatarColor,
      avatarEmoji: account.avatarEmoji,
      email: account.email,
    });
    localStorage.setItem('fb_user', JSON.stringify(account.user));
    localStorage.setItem(ONBOARDED_KEY, 'true');
    localStorage.setItem(CURRENT_ACCOUNT_KEY, email.toLowerCase());
    setIsOnboarded(true);
    return { success: true };
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDED_KEY);
    localStorage.removeItem('fb_user');
    setUser({ ...defaultUser });
    setOnboardingData(null);
    setIsOnboarded(false);
    window.dispatchEvent(new Event('fb_reset'));
  };

  return (
    <UserContext.Provider value={{
      user, setUser, onboardingData, isOnboarded,
      completeOnboarding, updateBattleResult, login, resetOnboarding,
      upgradeToVIP, deductStamina, refillStamina, buyRuby
    }}>
      {children}
    </UserContext.Provider>
  );
};
