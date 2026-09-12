import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'models.dart';

class FirebaseSyncService {
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  static const String usersCollection = 'users';
  static const String challengesCollection = 'user_challenges';

  /// Lắng nghe stream User theo thời gian thực từ Firestore
  static Stream<DocumentSnapshot<Map<String, dynamic>>> streamUser(String userId) {
    return _firestore.collection(usersCollection).doc(userId).snapshots();
  }

  /// Lắng nghe stream Thử thách theo thời gian thực từ Firestore
  static Stream<DocumentSnapshot<Map<String, dynamic>>> streamChallenges(String userId) {
    return _firestore.collection(challengesCollection).doc(userId).snapshots();
  }

  /// Đồng bộ nhận thưởng thử thách lên Firestore
  static Future<void> claimChallenge({
    required String userId,
    required String challengeId,
    required List<Challenge> allChallenges,
    required int rewardXp,
    required int rewardCoins,
    int rewardRuby = 0,
  }) async {
    try {
      // 1. Cập nhật danh sách thử thách
      final challengeData = allChallenges.map((c) => c.toJson()).toList();
      await _firestore.collection(challengesCollection).doc(userId).set({
        'items': challengeData,
        'updatedAt': DateTime.now().toIso8601String(),
      }, SetOptions(merge: true));

      // 2. Cập nhật số dư User
      final userRef = _firestore.collection(usersCollection).doc(userId);
      await userRef.set({
        'xp': FieldValue.increment(rewardXp),
        'coins': FieldValue.increment(rewardCoins),
        'ruby': FieldValue.increment(rewardRuby),
      }, SetOptions(merge: true));
    } catch (e) {
      debugPrint('[FirebaseSyncService] Error claiming challenge: $e');
    }
  }

  /// Đồng bộ thông tin User
  static Future<void> syncUserData(User user) async {
    try {
      await _firestore.collection(usersCollection).doc(user.id).set({
        'name': user.name,
        'level': user.level,
        'xp': user.xp,
        'coins': user.coins,
        'ruby': user.ruby,
        'stamina': user.stamina,
        'streak': user.streak,
        'calories': user.calories,
        'winCount': user.winCount,
        'loseCount': user.loseCount,
      }, SetOptions(merge: true));
    } catch (e) {
      debugPrint('[FirebaseSyncService] Error syncing user: $e');
    }
  }
}
