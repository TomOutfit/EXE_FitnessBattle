import type {
  User, Challenge, Battle, ActivitySession, SkinItem,
  LeaderboardEntry, ExerciseInfo, AppAccount, AuthResult,
  ExerciseLeaderboardEntry, Voucher, PremiumArena, BattlePassSeason
} from '../types';
import {
  initialUserSeed as defaultUser,
  initialExercisesSeed as defaultExercises,
  initialChallengesSeed as defaultChallenges,
  initialBattlesSeed as defaultBattles,
  initialActivitiesSeed as defaultActivities,
  initialSkinItemsSeed as defaultSkinItems,
  initialLeaderboardSeed as defaultLeaderboard,
  initialPushupLeaderboardSeed as defaultPushupLeaderboard,
  initialPullupLeaderboardSeed as defaultPullupLeaderboard,
  initialWalkingLeaderboardSeed as defaultWalkingLeaderboard,
  initialVouchersSeed as defaultVouchers,
  initialPremiumArenasSeed as defaultArenas,
  initialBattlePassSeasonSeed as defaultBattlePass
} from '../data/seedData';

const KEY_USER = 'fb_db_user';
const KEY_ACCOUNTS = 'fb_db_accounts';
const KEY_CURRENT_EMAIL = 'fb_db_current_email';
const KEY_EXERCISES = 'fb_db_exercises';
const KEY_CHALLENGES = 'fb_db_challenges';
const KEY_BATTLES = 'fb_db_battles';
const KEY_ACTIVITIES = 'fb_db_activities';
const KEY_SHOP_ITEMS = 'fb_db_shop_items';
const KEY_LEADERBOARD = 'fb_db_leaderboard';
const KEY_PUSHUP_LEADERBOARD = 'fb_db_pushup_leaderboard';
const KEY_PULLUP_LEADERBOARD = 'fb_db_pullup_leaderboard';
const KEY_WALKING_LEADERBOARD = 'fb_db_walking_leaderboard';
const KEY_EXERCISE_SESSIONS = 'fb_db_exercise_sessions';
const KEY_VOUCHERS = 'fb_db_vouchers';
const KEY_ARENAS = 'fb_db_arenas';
const KEY_BATTLE_PASS = 'fb_db_battle_pass';
const KEY_INITIALIZED = 'fb_db_initialized';

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public initialize(): void {
    try {
      const isInit = localStorage.getItem(KEY_INITIALIZED);
      if (!isInit) {
        this.seedInitialData();
      }
    } catch (e) {
      console.error('Database initialization error:', e);
    }
  }

  public seedInitialData(): void {
    const demoUser = { ...defaultUser, email: 'demo@fitnessbattle.vn' };
    const vipUser: User = {
      ...defaultUser,
      id: 'user-vip-001',
      name: 'Võ Sĩ Huyền Thoại (VIP Pro)',
      email: 'vip@fitnessbattle.vn',
      level: 50,
      xp: 4500,
      xpToNextLevel: 5000,
      ruby: 2500,
      coins: 35000,
      stamina: 500,
      maxStamina: 500,
      streak: 45,
      totalPoints: 28500,
      winCount: 156,
      loseCount: 12,
      isVIP: true,
      hasBattlePass: true,
      battlePassTier: 30,
    };

    const initialAccounts: AppAccount[] = [
      {
        email: 'demo@fitnessbattle.vn',
        passwordHash: this.hashPassword('demo123456', 'salt_demo_fb'),
        salt: 'salt_demo_fb',
        user: demoUser,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
      {
        email: 'vip@fitnessbattle.vn',
        passwordHash: this.hashPassword('vip123456', 'salt_vip_fb'),
        salt: 'salt_vip_fb',
        user: vipUser,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem(KEY_USER, JSON.stringify(demoUser));
    localStorage.setItem(KEY_ACCOUNTS, JSON.stringify(initialAccounts));
    localStorage.setItem(KEY_CURRENT_EMAIL, 'demo@fitnessbattle.vn');
    localStorage.setItem(KEY_EXERCISES, JSON.stringify(defaultExercises));
    localStorage.setItem(KEY_CHALLENGES, JSON.stringify(defaultChallenges));
    localStorage.setItem(KEY_BATTLES, JSON.stringify(defaultBattles));
    localStorage.setItem(KEY_ACTIVITIES, JSON.stringify(defaultActivities));
    localStorage.setItem(KEY_SHOP_ITEMS, JSON.stringify(defaultSkinItems));
    localStorage.setItem(KEY_LEADERBOARD, JSON.stringify(defaultLeaderboard));
    localStorage.setItem(KEY_INITIALIZED, 'true');
  }

  public hashPassword(password: string, salt: string): string {
    let hash = 0;
    const str = `${salt}#FitnessBattle#${password}#${salt}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `sha256_${Math.abs(hash).toString(16)}_${str.length}`;
  }

  public getAllAccounts(): AppAccount[] {
    try {
      const raw = localStorage.getItem(KEY_ACCOUNTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public register(name: string, email: string, password: string): AuthResult {
    const trimmedEmail = email.trim().toLowerCase();
    const accounts = this.getAllAccounts();

    if (accounts.some(a => a.email.toLowerCase() === trimmedEmail)) {
      return { success: false, message: 'Email đã tồn tại trong hệ thống!' };
    }

    const salt = `salt_${Date.now()}`;
    const hash = this.hashPassword(password, salt);

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      avatar: `https://api.dicebear.com/9.x/avataaars/png?seed=${encodeURIComponent(name.trim())}&backgroundColor=b6e3f4`,
      level: 1,
      xp: 0,
      xpToNextLevel: 500,
      totalPoints: 0,
      rank: 0,
      winCount: 0,
      loseCount: 0,
      heartRate: 72,
      calories: 0,
      ruby: 200,
      coins: 1500,
      stamina: 100,
      maxStamina: 100,
      coinsExpiringDays: 30,
      hasBattlePass: false,
      battlePassTier: 1,
      isVIP: false,
      streak: 1,
      joinDate: 'Hôm nay',
      lastStaminaRefillAt: new Date().toISOString(),
      badges: [
        { id: 'b1', name: 'Tân Binh', icon: 'shield', color: '#00f5d4', earned: true },
        { id: 'b2', name: 'Chuỗi 7 Ngày', icon: 'flame', color: '#f7c948', earned: false },
        { id: 'b3', name: 'Top 50', icon: 'trophy', color: '#ffd700', earned: false },
        { id: 'b4', name: 'Vua Cardio', icon: 'heart-pulse', color: '#ff4757', earned: false },
        { id: 'b5', name: 'Giao Lưu', icon: 'users', color: '#5352ed', earned: false },
        { id: 'b6', name: 'Quán Quân', icon: 'crown', color: '#ff6b81', earned: false },
      ],
      stats: {
        totalWorkouts: 0,
        totalMinutes: 0,
        avgHeartRate: 72,
        totalCalories: 0,
        weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
        weeklyCalories: [0, 0, 0, 0, 0, 0, 0],
      },
    };

    const newAccount: AppAccount = {
      email: trimmedEmail,
      passwordHash: hash,
      salt,
      user: newUser,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    localStorage.setItem(KEY_ACCOUNTS, JSON.stringify(accounts));
    this.saveUser(newUser);
    localStorage.setItem(KEY_CURRENT_EMAIL, trimmedEmail);

    return { success: true, message: 'Đăng ký tài khoản thành công!', user: newUser };
  }

  public login(email: string, password: string): AuthResult {
    const trimmedEmail = email.trim().toLowerCase();
    const accounts = this.getAllAccounts();
    const acc = accounts.find(a => a.email.toLowerCase() === trimmedEmail);

    if (!acc) {
      return { success: false, message: 'Tài khoản không tồn tại!' };
    }

    const computed = this.hashPassword(password, acc.salt);
    if (computed !== acc.passwordHash) {
      return { success: false, message: 'Mật khẩu không chính xác!' };
    }

    acc.lastLoginAt = new Date().toISOString();
    localStorage.setItem(KEY_ACCOUNTS, JSON.stringify(accounts));
    this.saveUser(acc.user);
    localStorage.setItem(KEY_CURRENT_EMAIL, trimmedEmail);

    return { success: true, message: 'Đăng nhập thành công!', user: acc.user };
  }

  public switchAccount(email: string): boolean {
    const accounts = this.getAllAccounts();
    const acc = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (acc) {
      this.saveUser(acc.user);
      localStorage.setItem(KEY_CURRENT_EMAIL, acc.email);
      return true;
    }
    return false;
  }

  public logout(): void {
    localStorage.removeItem(KEY_CURRENT_EMAIL);
  }

  public isLoggedIn(): boolean {
    return localStorage.getItem(KEY_CURRENT_EMAIL) !== null;
  }

  public applyStaminaRegeneration(user: User): User {
    const max = user.maxStamina || 100;
    const now = new Date();
    if (user.stamina >= max) {
      return { ...user, lastStaminaRefillAt: now.toISOString() };
    }

    const lastRefill = user.lastStaminaRefillAt ? new Date(user.lastStaminaRefillAt) : now;
    const secondsElapsed = Math.floor((now.getTime() - lastRefill.getTime()) / 1000);
    const refillIntervalSeconds = 180; // 3 mins per 1 Stamina

    if (secondsElapsed >= refillIntervalSeconds) {
      const pointsToAdd = Math.floor(secondsElapsed / refillIntervalSeconds);
      const newStamina = Math.min(max, user.stamina + pointsToAdd);
      const remainingTime = new Date(lastRefill.getTime() + pointsToAdd * refillIntervalSeconds * 1000);
      return {
        ...user,
        stamina: newStamina,
        lastStaminaRefillAt: newStamina >= max ? now.toISOString() : remainingTime.toISOString(),
      };
    }

    return user;
  }

  public getUser(): User {
    try {
      const saved = localStorage.getItem(KEY_USER);
      const user = saved ? JSON.parse(saved) : { ...defaultUser };
      return this.applyStaminaRegeneration(user);
    } catch {
      return this.applyStaminaRegeneration({ ...defaultUser });
    }
  }

  public saveUser(user: User): void {
    const updated = this.applyStaminaRegeneration(user);
    localStorage.setItem(KEY_USER, JSON.stringify(updated));
  }

  public getExercises(): ExerciseInfo[] {
    try {
      const saved = localStorage.getItem(KEY_EXERCISES);
      return saved ? JSON.parse(saved) : [...defaultExercises];
    } catch {
      return [...defaultExercises];
    }
  }

  public saveExercises(exercises: ExerciseInfo[]): void {
    localStorage.setItem(KEY_EXERCISES, JSON.stringify(exercises));
  }

  public getChallenges(): Challenge[] {
    try {
      const saved = localStorage.getItem(KEY_CHALLENGES);
      return saved ? JSON.parse(saved) : [...defaultChallenges];
    } catch {
      return [...defaultChallenges];
    }
  }

  public saveChallenges(challenges: Challenge[]): void {
    localStorage.setItem(KEY_CHALLENGES, JSON.stringify(challenges));
  }

  public getBattles(): Battle[] {
    try {
      const saved = localStorage.getItem(KEY_BATTLES);
      return saved ? JSON.parse(saved) : [...defaultBattles];
    } catch {
      return [...defaultBattles];
    }
  }

  public saveBattles(battles: Battle[]): void {
    localStorage.setItem(KEY_BATTLES, JSON.stringify(battles));
  }

  public getActivities(): ActivitySession[] {
    try {
      const saved = localStorage.getItem(KEY_ACTIVITIES);
      return saved ? JSON.parse(saved) : [...defaultActivities];
    } catch {
      return [...defaultActivities];
    }
  }

  public saveActivities(activities: ActivitySession[]): void {
    localStorage.setItem(KEY_ACTIVITIES, JSON.stringify(activities));
  }

  public getShopItems(): SkinItem[] {
    try {
      const saved = localStorage.getItem(KEY_SHOP_ITEMS);
      return saved ? JSON.parse(saved) : [...defaultSkinItems];
    } catch {
      return [...defaultSkinItems];
    }
  }

  public saveShopItems(items: SkinItem[]): void {
    localStorage.setItem(KEY_SHOP_ITEMS, JSON.stringify(items));
  }

  public getLeaderboard(): LeaderboardEntry[] {
    try {
      const saved = localStorage.getItem(KEY_LEADERBOARD);
      return saved ? JSON.parse(saved) : [...defaultLeaderboard];
    } catch {
      return [...defaultLeaderboard];
    }
  }

  public saveLeaderboard(leaderboard: LeaderboardEntry[]): void {
    localStorage.setItem(KEY_LEADERBOARD, JSON.stringify(leaderboard));
  }

  public getPushupLeaderboard(): ExerciseLeaderboardEntry[] {
    try {
      const saved = localStorage.getItem(KEY_PUSHUP_LEADERBOARD);
      return saved ? JSON.parse(saved) : [...defaultPushupLeaderboard];
    } catch {
      return [...defaultPushupLeaderboard];
    }
  }

  public savePushupLeaderboard(entries: ExerciseLeaderboardEntry[]): void {
    localStorage.setItem(KEY_PUSHUP_LEADERBOARD, JSON.stringify(entries));
  }

  public getPullupLeaderboard(): ExerciseLeaderboardEntry[] {
    try {
      const saved = localStorage.getItem(KEY_PULLUP_LEADERBOARD);
      return saved ? JSON.parse(saved) : [...defaultPullupLeaderboard];
    } catch {
      return [...defaultPullupLeaderboard];
    }
  }

  public savePullupLeaderboard(entries: ExerciseLeaderboardEntry[]): void {
    localStorage.setItem(KEY_PULLUP_LEADERBOARD, JSON.stringify(entries));
  }

  public getWalkingLeaderboard(): ExerciseLeaderboardEntry[] {
    try {
      const saved = localStorage.getItem(KEY_WALKING_LEADERBOARD);
      return saved ? JSON.parse(saved) : [...defaultWalkingLeaderboard];
    } catch {
      return [...defaultWalkingLeaderboard];
    }
  }

  public saveWalkingLeaderboard(entries: ExerciseLeaderboardEntry[]): void {
    localStorage.setItem(KEY_WALKING_LEADERBOARD, JSON.stringify(entries));
  }

  public getVouchers(): Voucher[] {
    try {
      const saved = localStorage.getItem(KEY_VOUCHERS);
      return saved ? JSON.parse(saved) : [...defaultVouchers];
    } catch {
      return [...defaultVouchers];
    }
  }

  public saveVouchers(vouchers: Voucher[]): void {
    localStorage.setItem(KEY_VOUCHERS, JSON.stringify(vouchers));
  }

  public getArenas(): PremiumArena[] {
    try {
      const saved = localStorage.getItem(KEY_ARENAS);
      return saved ? JSON.parse(saved) : [...defaultArenas];
    } catch {
      return [...defaultArenas];
    }
  }

  public saveArenas(arenas: PremiumArena[]): void {
    localStorage.setItem(KEY_ARENAS, JSON.stringify(arenas));
  }

  public getBattlePass(): BattlePassSeason {
    try {
      const saved = localStorage.getItem(KEY_BATTLE_PASS);
      return saved ? JSON.parse(saved) : { ...defaultBattlePass };
    } catch {
      return { ...defaultBattlePass };
    }
  }

  public saveBattlePass(season: BattlePassSeason): void {
    localStorage.setItem(KEY_BATTLE_PASS, JSON.stringify(season));
  }

  public getStatsSummary(): Record<string, number> {
    return {
      'Tài khoản (Users)': this.getAllAccounts().length || 1,
      'Bài tập (Exercises)': this.getExercises().length,
      'Nhiệm vụ (Challenges)': this.getChallenges().length,
      'Phòng đấu (Battles)': this.getBattles().length,
      'Lịch sử tập (Activities)': this.getActivities().length,
      'Vật phẩm (Shop Items)': this.getShopItems().length,
      'Bảng xếp hạng (Leaderboard)': this.getLeaderboard().length,
      'BXH Động tác (Exercise Rankings)': this.getPushupLeaderboard().length + this.getPullupLeaderboard().length + this.getWalkingLeaderboard().length,
      'Đấu trường Ruby (Arenas)': this.getArenas().length,
      'Vouchers đối tác': this.getVouchers().length,
    };
  }

  public resetDatabase(): void {
    localStorage.removeItem(KEY_USER);
    localStorage.removeItem(KEY_EXERCISES);
    localStorage.removeItem(KEY_CHALLENGES);
    localStorage.removeItem(KEY_BATTLES);
    localStorage.removeItem(KEY_ACTIVITIES);
    localStorage.removeItem(KEY_SHOP_ITEMS);
    localStorage.removeItem(KEY_LEADERBOARD);
    localStorage.removeItem(KEY_PUSHUP_LEADERBOARD);
    localStorage.removeItem(KEY_PULLUP_LEADERBOARD);
    localStorage.removeItem(KEY_WALKING_LEADERBOARD);
    localStorage.removeItem(KEY_EXERCISE_SESSIONS);
    localStorage.removeItem(KEY_VOUCHERS);
    localStorage.removeItem(KEY_ARENAS);
    localStorage.removeItem(KEY_BATTLE_PASS);
    localStorage.removeItem(KEY_INITIALIZED);
    this.seedInitialData();
  }
}

export const dbService = DatabaseService.getInstance();
