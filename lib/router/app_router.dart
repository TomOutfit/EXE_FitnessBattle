import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/home/presentation/pages/home_page.dart';
import '../features/battle/presentation/pages/battle_page.dart';
import '../features/challenge/presentation/pages/challenge_page.dart';
import '../features/leaderboard/presentation/pages/ranking_page.dart';
import '../features/profile/presentation/pages/profile_page.dart';
import '../core/widgets/bottom_nav_bar.dart';
import '../core/theme/app_theme.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final router = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/home',
  routes: [
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
