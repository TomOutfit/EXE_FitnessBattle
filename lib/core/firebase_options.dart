import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Cấu hình Firebase cho project: device-streaming-8b27ae6e
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      default:
        return android;
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyBxRIIlL0MTTD6ajvYNhkRKsJ-E3qDRtZA',
    appId: '1:1090023487618:web:2827e5df8a3b8a5076dc9b',
    messagingSenderId: '1090023487618',
    projectId: 'device-streaming-8b27ae6e',
    authDomain: 'device-streaming-8b27ae6e.firebaseapp.com',
    storageBucket: 'device-streaming-8b27ae6e.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyBxRIIlL0MTTD6ajvYNhkRKsJ-E3qDRtZA',
    appId: '1:1090023487618:android:2827e5df8a3b8a5076dc9b',
    messagingSenderId: '1090023487618',
    projectId: 'device-streaming-8b27ae6e',
    storageBucket: 'device-streaming-8b27ae6e.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyBxRIIlL0MTTD6ajvYNhkRKsJ-E3qDRtZA',
    appId: '1:1090023487618:ios:2827e5df8a3b8a5076dc9b',
    messagingSenderId: '1090023487618',
    projectId: 'device-streaming-8b27ae6e',
    storageBucket: 'device-streaming-8b27ae6e.firebasestorage.app',
    iosBundleId: 'com.fitnessbattle.app',
  );
}
