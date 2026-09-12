import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot, 
  updateDoc, 
  increment,
  type Unsubscribe 
} from 'firebase/firestore';

// Cấu hình Firebase Project: device-streaming-8b27ae6e
export const firebaseConfig = {
  apiKey: "AIzaSyBxRIIlL0MTTD6ajvYNhkRKsJ-E3qDRtZA",
  authDomain: "device-streaming-8b27ae6e.firebaseapp.com",
  projectId: "device-streaming-8b27ae6e",
  storageBucket: "device-streaming-8b27ae6e.firebasestorage.app",
  messagingSenderId: "1090023487618",
  appId: "1:1090023487618:web:2827e5df8a3b8a5076dc9b"
};

// Khởi tạo Firebase App & Firestore
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Collection names
export const USERS_COLLECTION = 'users';
export const CHALLENGES_COLLECTION = 'user_challenges';

/**
 * Khởi tạo dữ liệu người dùng ban đầu trên Firestore nếu chưa có
 */
export async function initUserInFirestore(user: any) {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, user.id);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      await setDoc(userDocRef, {
        id: user.id,
        name: user.name,
        email: user.email || '',
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        xpToNextLevel: user.xpToNextLevel,
        coins: user.coins,
        ruby: user.ruby,
        stamina: user.stamina,
        maxStamina: user.maxStamina,
        streak: user.streak,
        calories: user.calories,
        winCount: user.winCount,
        loseCount: user.loseCount,
        totalPoints: user.totalPoints,
        rank: user.rank,
        isVIP: user.isVIP || false,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (error) {
    console.warn('[Firebase] Init user warning:', error);
  }
}

/**
 * Lắng nghe dữ liệu User theo thời gian thực (Real-time Listener)
 */
export function subscribeToUser(userId: string, onUpdate: (data: any) => void): Unsubscribe {
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  return onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data());
    }
  }, (error) => {
    console.warn('[Firebase] User subscription error:', error.message);
  });
}

/**
 * Khởi tạo danh sách Thử thách trên Firestore nếu chưa có
 */
export async function initChallengesInFirestore(userId: string, defaultChallenges: any[]) {
  try {
    const userChallengesDocRef = doc(db, CHALLENGES_COLLECTION, userId);
    const snap = await getDoc(userChallengesDocRef);
    if (!snap.exists() || !snap.data()?.items || snap.data()?.items.length < defaultChallenges.length) {
      await setDoc(userChallengesDocRef, {
        userId,
        items: defaultChallenges,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (error) {
    console.warn('[Firebase] Init challenges warning:', error);
  }
}

/**
 * Lắng nghe danh sách Thử thách của User theo thời gian thực
 */
export function subscribeToUserChallenges(userId: string, onUpdate: (challenges: any[]) => void): Unsubscribe {
  const userChallengesDocRef = doc(db, CHALLENGES_COLLECTION, userId);
  return onSnapshot(userChallengesDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && Array.isArray(data.items)) {
        onUpdate(data.items);
      }
    }
  }, (error) => {
    console.warn('[Firebase] Challenge subscription error:', error.message);
  });
}

/**
 * Đồng bộ khi nhận thưởng Thử thách lên Firestore
 */
export async function syncChallengeClaim(
  userId: string, 
  updatedChallenges: any[], 
  reward: { xp?: number; coins?: number; ruby?: number }
) {
  try {
    // 1. Cập nhật danh sách thử thách
    const userChallengesDocRef = doc(db, CHALLENGES_COLLECTION, userId);
    await setDoc(userChallengesDocRef, {
      items: updatedChallenges,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // 2. Cập nhật số dư người dùng
    const userDocRef = doc(db, USERS_COLLECTION, userId);
    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString()
    };
    if (reward.xp) updates.xp = increment(reward.xp);
    if (reward.coins) updates.coins = increment(reward.coins);
    if (reward.ruby) updates.ruby = increment(reward.ruby);

    await updateDoc(userDocRef, updates);
  } catch (error) {
    console.error('[Firebase] Failed to sync challenge claim:', error);
  }
}

/**
 * Cập nhật toàn bộ thông tin User lên Firestore
 */
export async function syncUserFullData(user: any) {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(userDocRef, {
      ...user,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('[Firebase] Failed to sync user data:', error);
  }
}
