import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/home/presentation/pages/home_page.dart';
import '../features/battle/presentation/pages/battle_page.dart';
import '../features/challenge/presentation/pages/challenge_page.dart';
import '../features/leaderboard/presentation/pages/ranking_page.dart';
import '../features/profile/presentation/pages/profile_page.dart';
import '../features/exercise/presentation/pages/exercise_track_page.dart';
import '../features/exercise/presentation/pages/exercise_camera_page.dart';
import '../features/exercise/presentation/pages/gps_walking_page.dart';
import '../features/exercise/presentation/pages/battle_camera_page.dart';
import '../features/exercise_leaderboard/presentation/pages/exercise_leaderboard_page.dart';
import '../features/shop/presentation/pages/shop_page.dart';
import '../features/membership/presentation/pages/membership_page.dart';
import '../core/widgets/bottom_nav_bar.dart';
import '../core/theme/app_theme.dart';
import '../core/models_exercise.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final router = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/home',
  routes: [
    // GPS Walking Live Page
    GoRoute(
      path: '/gps-walking',
      builder: (context, state) => const GPSWalkingPage(),
    ),
    // Exercise Camera Page
    GoRoute(
      path: '/exercise-camera',
      builder: (context, state) {
        final exerciseTypeStr = state.uri.queryParameters['type'] ?? 'pushup';
        final exerciseType = ExerciseTypeEnum.values.firstWhere(
          (e) => e.id == exerciseTypeStr,
          orElse: () => ExerciseTypeEnum.pushup,
        );
        return ExerciseCameraPage(exerciseType: exerciseType);
      },
    ),
    // Battle Camera Page - Full screen route (outside shell for camera access)
    GoRoute(
      path: '/battle-camera',
      builder: (context, state) {
        final exerciseTypeStr = state.uri.queryParameters['type'] ?? 'pushup';
        final exerciseType = ExerciseTypeEnum.values.firstWhere(
          (e) => e.id == exerciseTypeStr,
          orElse: () => ExerciseTypeEnum.pushup,
        );
        return BattleCameraPage(
          exerciseType: exerciseType,
        );
      },
    ),
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) {
        return ScaffoldWithNav(child: child);
      },
      routes: [
        GoRoute(
          path: '/home',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: HomePage(),
          ),
        ),
        GoRoute(
          path: '/exercise',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: ExerciseTrackPage(),
          ),
        ),
        GoRoute(
          path: '/battle',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: BattlePage(),
          ),
        ),
        GoRoute(
          path: '/challenge',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: ChallengePage(),
          ),
        ),
        GoRoute(
          path: '/ranking',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: RankingPage(),
          ),
        ),
        GoRoute(
          path: '/exercise-ranking',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: ExerciseLeaderboardPage(),
          ),
        ),
        GoRoute(
          path: '/shop',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: ShopPage(),
          ),
        ),
        GoRoute(
          path: '/membership',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: MembershipPage(),
          ),
        ),
        GoRoute(
          path: '/profile',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: ProfilePage(),
          ),
        ),
      ],
    ),
  ],
);

class ScaffoldWithNav extends StatelessWidget {
  final Widget child;

  const ScaffoldWithNav({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: child,
      bottomNavigationBar: const BottomNavBar(),
    );
  }
}
