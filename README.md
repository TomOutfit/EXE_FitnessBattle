# Fitness Battle App 🏆💪

<p align="center">
  <img src="https://img.shields.io/badge/Flutter-3.47.0-02569B?style=flat-square&logo=flutter" alt="Flutter">
  <img src="https://img.shields.io/badge/Dart-3.13.0-0175C2?style=flat-square&logo=dart" alt="Dart">
  <img src="https://img.shields.io/badge/State-Riverpod-2.6.1-green?style=flat-square" alt="Riverpod">
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS-blue?style=flat-square" alt="Platform">
</p>

> 🚀 **Fitness Battle** - Ứng dụng di động gamified fitness tracking với hệ thống Battle Arena, Challenges, và Leaderboard.

## ✨ Tính năng nổi bật

### ⚔️ Battle Arena
- **Ranked Battles** - Thi đấu xếp hạng với người chơi khác
- **Friendly Battles** - Trận giao hữu với bạn bè
- **Premium Arenas** - Đấu trường VIP với phần thưởng hấp dẫn
- **Ruby Stakes** - Cược Ruby để nhận thưởng cao hơn

### 🏆 Hệ thống Challenges
- **Daily Challenges** - Thử thách hàng ngày với phần thưởng tức thì
- **Weekly Challenges** - Thử thách tuần với phần thưởng lớn
- **Monthly Challenges** - Thử thách tháng với phần thưởng VIP

### 📊 Thống kê & Theo dõi
- Theo dõi nhịp tim real-time
- Đếm calories đốt cháy
- Đo thời gian tập luyện
- Biểu đồ tiến độ hàng tuần

### 🎮 Gamification
- **Level System** - Thăng cấp với XP
- **Streak Tracking** - Theo dõi chuỗi ngày tập
- **Achievement Badges** - Huy hiệu thành tích
- **Battle Pass** - Mùa giải với phần thưởng độc quyền

### 💎 Shop & Items
- Avatar Frames độc đáo
- Victory Effects
- Custom Titles
- Achievement Badges

## 📱 Screenshots

```
┌─────────────────────────────────────┐
│     🏠 Home                        │
│  ┌─────────────────────────────┐   │
│  │ 👋 Xin chào, User! 🔥       │   │
│  │    14 ngày liên tiếp        │   │
│  └─────────────────────────────┘   │
│                                     │
│  Level 12  ████████░░  3450 XP    │
│                                     │
│  ┌───────┐┌───────┐┌───────┐      │
│  │ 💰    ││ ⚡     ││ 🏆    │      │
│  │ 1250  ││100/100││  #47   │      │
│  │Coins  ││Stamina││  Rank  │      │
│  └───────┘└───────┘└───────┘      │
│                                     │
│  ⚔️ Trận đấu đang diễn ra          │
│  ┌─────────────────────────────┐   │
│  │ 🥇 Trận Giao Hữu Gym   LIVE │   │
│  │ Bạn(142BPM) VS Thu Hà     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Công nghệ | Mô tả |
|-----------|--------|
| **Flutter 3.47** | Cross-platform UI framework |
| **Dart 3.13** | Programming language |
| **Riverpod** | State management |
| **GoRouter** | Navigation & routing |
| **fl_chart** | Charts & graphs |
| **Google Fonts** | Typography (Inter font family) |

## 📂 Project Structure

```
lib/
├── core/
│   ├── models.dart          # Data models
│   ├── mock_data.dart       # Sample data
│   ├── providers.dart        # Riverpod providers
│   ├── theme/
│   │   └── app_theme.dart   # App theming
│   └── widgets/
│       ├── common_widgets.dart   # Reusable widgets
│       └── bottom_nav_bar.dart   # Navigation bar
├── features/
│   ├── home/                # Home screen
│   ├── battle/              # Battle arena
│   ├── challenge/           # Challenges
│   ├── leaderboard/         # Rankings
│   └── profile/             # User profile
├── router/
│   └── app_router.dart      # GoRouter config
└── main.dart                # Entry point
```

## 🚀 Getting Started

### Prerequisites
- Flutter SDK 3.47+
- Dart SDK 3.13+
- Android Studio / Xcode (for respective platforms)

### Installation

```bash
# Clone the repository
git clone https://github.com/TomOutfit/EXE_FitnessBattle.git

# Navigate to project
cd EXE_FitnessBattle/fitness_battle

# Install dependencies
flutter pub get

# Run the app
flutter run
```

### Build APK

```bash
# Debug APK
flutter build apk --debug

# Release APK
flutter build apk --release
```

### Build iOS

```bash
# For iOS simulator
flutter build ios --simulator --no-codesign

# For iOS device (requires signing)
flutter build ios --release
```

## 🎯 Roadmap

- [ ] **Authentication System** - Login/Register with Firebase
- [ ] **Real-time Battle** - WebSocket-based live battles
- [ ] **Health Device Integration** - Apple Health, Google Fit
- [ ] **Social Features** - Friends list, chat, challenges
- [ ] **Push Notifications** - Reminders, battle invites
- [ ] **Admin Dashboard** - Manage battles, events
- [ ] **Analytics** - User behavior tracking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**TomOutfit**
- GitHub: [@TomOutfit](https://github.com/TomOutfit)
- Project Link: [https://github.com/TomOutfit/EXE_FitnessBattle](https://github.com/TomOutfit/EXE_FitnessBattle)

## 🙏 Acknowledgments

- [DiceBear API](https://www.dicebear.com/) - For avatar generation
- [Google Fonts](https://fonts.google.com/) - For Inter font family
- Flutter Community - For amazing packages and support

---

<p align="center">
  Made with ❤️ using Flutter
  <br>
  © 2026 Fitness Battle. All rights reserved.
</p>
