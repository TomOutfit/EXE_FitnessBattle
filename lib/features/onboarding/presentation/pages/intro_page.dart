import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/services/app_database.dart';

class IntroPage extends StatefulWidget {
  const IntroPage({super.key});

  @override
  State<IntroPage> createState() => _IntroPageState();
}

class _IntroPageState extends State<IntroPage> with SingleTickerProviderStateMixin {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  late AnimationController _pulseController;

  final List<_IntroSlideData> _slides = const [
    _IntroSlideData(
      badge: 'CÔNG NGHỆ ĐỘT PHÁ',
      badgeIcon: Icons.auto_awesome,
      badgeColor: Color(0xFF00F2FE),
      accentGradient: [Color(0xFF00F2FE), Color(0xFF5352ED)],
      title: 'Tập Luyện Thông Minh\nCùng Camera AI',
      subtitle:
          'Không cần cảm biến đeo đắt tiền. AI Vision tự động phân tích 33 điểm khớp xương, đếm rep tự động và chỉnh tư thế chuẩn xác trong thời gian thực.',
      features: [
        _SlideFeature(icon: Icons.camera_alt_outlined, text: 'Đếm Rep Tự Động'),
        _SlideFeature(icon: Icons.record_voice_over_outlined, text: 'HLV Ảo Sửa Form'),
        _SlideFeature(icon: Icons.health_and_safety_outlined, text: 'An Toàn Chấn Thương'),
      ],
      slideType: _SlideVisualType.aiCamera,
    ),
    _IntroSlideData(
      badge: 'GAMIFICATION ĐỈNH CAO',
      badgeIcon: Icons.sports_mma,
      badgeColor: Color(0xFFFF6B35),
      accentGradient: [Color(0xFFFF6B35), Color(0xFFFF4757)],
      title: 'Đấu Trường PvP 1v1\nKịch Tính & Bùng Cháy',
      subtitle:
          'Thách đấu trực tiếp 1v1 cùng bạn bè và chiến binh khắp toàn quốc trong các màn so tài Push-up, Squat. Bứt phá giới hạn và vươn lên Top 1 BXH.',
      features: [
        _SlideFeature(icon: Icons.flash_on_rounded, text: 'So Tài Real-time 1v1'),
        _SlideFeature(icon: Icons.emoji_events_outlined, text: 'Đua Rank Mùa Giải'),
        _SlideFeature(icon: Icons.groups_outlined, text: 'Phòng Đấu Tùy Biến'),
      ],
      slideType: _SlideVisualType.pvpBattle,
    ),
    _IntroSlideData(
      badge: 'CHẠY BỘ & TÍCH ĐIỂM',
      badgeIcon: Icons.directions_run,
      badgeColor: Color(0xFF2ED573),
      accentGradient: [Color(0xFF2ED573), Color(0xFF00F5D4)],
      title: 'GPS Chạy Bộ\nSăn Thưởng & Đổi Quà',
      subtitle:
          'Ghi nhận lộ trình chạy vệ tinh chuẩn xác từng mét. Mỗi kilomet mồ hôi đều được quy đổi thành Xu Vàng và Ruby để đổi thẻ quà tặng và phụ kiện độc quyền.',
      features: [
        _SlideFeature(icon: Icons.near_me_outlined, text: 'GPS Lộ Trình Sắc Nét'),
        _SlideFeature(icon: Icons.card_giftcard, text: 'Tích Xu Đổi Quà Thật'),
        _SlideFeature(icon: Icons.speed_outlined, text: 'Phân Tích Pace & Calo'),
      ],
      slideType: _SlideVisualType.gpsRun,
    ),
    _IntroSlideData(
      badge: 'ĐAM MÊ & BỨT PHÁ',
      badgeIcon: Icons.workspace_premium,
      badgeColor: Color(0xFFF7C948),
      accentGradient: [Color(0xFFF7C948), Color(0xFFFF6B35)],
      title: 'Biến Tập Luyện Thành\nPhong Cách Sống Mới',
      subtitle:
          'Hệ thống cấp bậc nhân vật, chuỗi nhiệm vụ mỗi ngày, mở khóa danh hiệu độc bản và cùng hơn 50.000+ chiến binh duy trì lối sống tràn đầy năng lượng!',
      features: [
        _SlideFeature(icon: Icons.military_tech_outlined, text: 'Rank & Danh Hiệu VIP'),
        _SlideFeature(icon: Icons.assignment_outlined, text: 'Nhiệm Vụ Hằng Ngày'),
        _SlideFeature(icon: Icons.public_outlined, text: 'Cộng Đồng 50.000+'),
      ],
      slideType: _SlideVisualType.gamification,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pageController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _completeIntro({bool toAuth = false}) async {
    HapticFeedback.mediumImpact();
    await AppDatabase.instance.setHasSeenOnboarding(true);
    if (!mounted) return;
    if (toAuth) {
      context.go('/auth');
    } else {
      context.go('/home');
    }
  }

  void _onNext() {
    HapticFeedback.lightImpact();
    if (_currentPage < _slides.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOutCubic,
      );
    } else {
      _completeIntro();
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentSlide = _slides[_currentPage];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Dynamic Animated Ambient Background Orbs
          AnimatedBuilder(
            animation: _pulseController,
            builder: (context, child) {
              final scale = 1.0 + (_pulseController.value * 0.15);
              return Stack(
                children: [
                  Positioned(
                    top: -60,
                    right: -60,
                    child: Transform.scale(
                      scale: scale,
                      child: Container(
                        width: 280,
                        height: 280,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: RadialGradient(
                            colors: [
                              currentSlide.accentGradient.first.withValues(alpha: 0.28),
                              Colors.transparent,
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 120,
                    left: -80,
                    child: Transform.scale(
                      scale: scale,
                      child: Container(
                        width: 320,
                        height: 320,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: RadialGradient(
                            colors: [
                              currentSlide.accentGradient.last.withValues(alpha: 0.22),
                              Colors.transparent,
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),

          // Main Safe Area Content
          SafeArea(
            child: Column(
              children: [
                // Top App Bar: Brand Logo & Skip Button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Brand Logo & Title
                      Row(
                        children: [
                          Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              gradient: AppColors.primaryGradient,
                              borderRadius: BorderRadius.circular(10),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withValues(alpha: 0.4),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: const Center(
                              child: Icon(
                                Icons.local_fire_department,
                                color: Colors.white,
                                size: 22,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          RichText(
                            text: TextSpan(
                              children: [
                                TextSpan(
                                  text: 'FITNESS ',
                                  style: GoogleFonts.rajdhani(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 1.5,
                                    color: Colors.white,
                                  ),
                                ),
                                TextSpan(
                                  text: 'BATTLE',
                                  style: GoogleFonts.rajdhani(
                                    fontSize: 20,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 1.5,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      // "Bỏ qua" (Skip) Button
                      TextButton(
                        onPressed: () => _completeIntro(),
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          backgroundColor: AppColors.surfaceLight.withValues(alpha: 0.6),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                            side: BorderSide(
                              color: Colors.white.withValues(alpha: 0.12),
                            ),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Bỏ qua',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: Colors.white.withValues(alpha: 0.8),
                              ),
                            ),
                            const SizedBox(width: 4),
                            Icon(
                              Icons.arrow_forward_ios_rounded,
                              size: 11,
                              color: Colors.white.withValues(alpha: 0.8),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Slide Carousel PageView
                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    physics: const BouncingScrollPhysics(),
                    itemCount: _slides.length,
                    onPageChanged: (index) {
                      setState(() => _currentPage = index);
                    },
                    itemBuilder: (context, index) {
                      final slide = _slides[index];
                      return _buildSlideItem(context, slide);
                    },
                  ),
                ),

                // Bottom Action Area: Indicators, CTA Button & Login link
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 8, 24, 20),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Smooth Animated Page Indicators
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          _slides.length,
                          (index) => GestureDetector(
                            onTap: () {
                              _pageController.animateToPage(
                                index,
                                duration: const Duration(milliseconds: 350),
                                curve: Curves.easeInOut,
                              );
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              curve: Curves.easeOutCubic,
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              height: 8,
                              width: _currentPage == index ? 28 : 8,
                              decoration: BoxDecoration(
                                color: _currentPage == index
                                    ? currentSlide.accentGradient.first
                                    : Colors.white.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(10),
                                boxShadow: _currentPage == index
                                    ? [
                                        BoxShadow(
                                          color: currentSlide.accentGradient.first
                                              .withValues(alpha: 0.5),
                                          blurRadius: 8,
                                          offset: const Offset(0, 2),
                                        ),
                                      ]
                                    : null,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 22),

                      // Primary CTA Button
                      GestureDetector(
                        onTap: _onNext,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          width: double.infinity,
                          height: 54,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: _currentPage == _slides.length - 1
                                  ? const [Color(0xFFFF6B35), Color(0xFFFF4757)]
                                  : [
                                      currentSlide.accentGradient.first,
                                      currentSlide.accentGradient.last,
                                    ],
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                            ),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: (_currentPage == _slides.length - 1
                                        ? const Color(0xFFFF6B35)
                                        : currentSlide.accentGradient.first)
                                    .withValues(alpha: 0.45),
                                blurRadius: 20,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Center(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  _currentPage == _slides.length - 1
                                      ? 'BẮT ĐẦU TRẢI NGHIỆM'
                                      : 'TIẾP TỤC',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 1.2,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Icon(
                                  _currentPage == _slides.length - 1
                                      ? Icons.bolt_rounded
                                      : Icons.arrow_forward_rounded,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Already have account? Login quick link
                      GestureDetector(
                        onTap: () => _completeIntro(toAuth: true),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: RichText(
                            text: TextSpan(
                              children: [
                                TextSpan(
                                  text: 'Đã có tài khoản? ',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary.withValues(alpha: 0.9),
                                  ),
                                ),
                                const TextSpan(
                                  text: 'Đăng nhập ngay',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primary,
                                    decoration: TextDecoration.underline,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSlideItem(BuildContext context, _IntroSlideData slide) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          const SizedBox(height: 8),

          // Top Pill Tag Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: slide.badgeColor.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(30),
              border: Border.all(
                color: slide.badgeColor.withValues(alpha: 0.4),
                width: 1.2,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(slide.badgeIcon, size: 14, color: slide.badgeColor),
                const SizedBox(width: 6),
                Text(
                  slide.badge,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.1,
                    color: slide.badgeColor,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Hero Interactive Visual Container
          _buildHeroGraphic(slide),
          const SizedBox(height: 24),

          // Main Slide Title
          Text(
            slide.title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              height: 1.25,
              color: AppColors.textPrimary,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 12),

          // Subtitle description
          Text(
            slide.subtitle,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 13.5,
              height: 1.5,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 20),

          // Feature Highlight Badges Grid
          Wrap(
            spacing: 8,
            runSpacing: 8,
            alignment: WrapAlignment.center,
            children: slide.features.map((f) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.surfaceLight.withValues(alpha: 0.7),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.08),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(f.icon, size: 14, color: slide.badgeColor),
                    const SizedBox(width: 6),
                    Text(
                      f.text,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildHeroGraphic(_IntroSlideData slide) {
    switch (slide.slideType) {
      case _SlideVisualType.aiCamera:
        return _buildAiCameraMockup(slide);
      case _SlideVisualType.pvpBattle:
        return _buildPvpMockup(slide);
      case _SlideVisualType.gpsRun:
        return _buildGpsRunMockup(slide);
      case _SlideVisualType.gamification:
        return _buildGamificationMockup(slide);
    }
  }

  // --- MOCKUP 1: AI CAMERA VISION ---
  Widget _buildAiCameraMockup(_IntroSlideData slide) {
    return Container(
      height: 220,
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: slide.badgeColor.withValues(alpha: 0.35),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: slide.badgeColor.withValues(alpha: 0.15),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Background Tech Grid Lines
          CustomPaint(
            size: const Size(double.infinity, 220),
            painter: _TechGridPainter(color: slide.badgeColor.withValues(alpha: 0.08)),
          ),

          // Camera Viewfinder Corners
          Positioned(
            top: 14,
            left: 14,
            child: _buildCornerBracket(slide.badgeColor, isTop: true, isLeft: true),
          ),
          Positioned(
            top: 14,
            right: 14,
            child: _buildCornerBracket(slide.badgeColor, isTop: true, isLeft: false),
          ),
          Positioned(
            bottom: 14,
            left: 14,
            child: _buildCornerBracket(slide.badgeColor, isTop: false, isLeft: true),
          ),
          Positioned(
            bottom: 14,
            right: 14,
            child: _buildCornerBracket(slide.badgeColor, isTop: false, isLeft: false),
          ),

          // Central Pose Skeleton Mockup
          Center(
            child: SizedBox(
              width: 140,
              height: 170,
              child: CustomPaint(
                painter: _SkeletonPosePainter(color: slide.badgeColor),
              ),
            ),
          ),

          // Top Floating Badge: Live Rep Counter
          Positioned(
            top: 16,
            left: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.success.withValues(alpha: 0.6)),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check_circle_outline, color: AppColors.success, size: 14),
                  SizedBox(width: 4),
                  Text(
                    'REPS: 42',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.success,
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Top Floating Badge: AI Form Accuracy
          Positioned(
            top: 16,
            right: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: slide.badgeColor.withValues(alpha: 0.6)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.analytics_outlined, color: slide.badgeColor, size: 14),
                  const SizedBox(width: 4),
                  Text(
                    'FORM: 98%',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: slide.badgeColor,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Floating AI Audio Coach Feedback pill
          Positioned(
            bottom: 16,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.surfaceLight.withValues(alpha: 0.9),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: slide.badgeColor.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: slide.badgeColor.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.volume_up, size: 14, color: slide.badgeColor),
                  ),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'AI Coach: "Lưng thẳng, tiếp tục giữ nhịp thở!"',
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const Icon(Icons.graphic_eq, size: 16, color: AppColors.success),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- MOCKUP 2: PVP 1v1 BATTLE ARENA ---
  Widget _buildPvpMockup(_IntroSlideData slide) {
    return Container(
      height: 220,
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: slide.badgeColor.withValues(alpha: 0.35),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: slide.badgeColor.withValues(alpha: 0.15),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          // Battle Arena Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.error.withValues(alpha: 0.4)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.fiber_manual_record, color: AppColors.error, size: 10),
                    SizedBox(width: 5),
                    Text(
                      'LIVE PVP ARENA',
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.bold,
                        color: AppColors.error,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.timer_outlined, size: 12, color: AppColors.accent),
                    SizedBox(width: 4),
                    Text(
                      '00:24s',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: AppColors.accent,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // 1v1 Clash Card
          Expanded(
            child: Row(
              children: [
                // Player 1 (You)
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppColors.primary.withValues(alpha: 0.2),
                          AppColors.surfaceLight,
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.primary.withValues(alpha: 0.5)),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.primary, width: 2),
                            image: const DecorationImage(
                              image: NetworkImage(
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                              ),
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Bạn (TomOutfit)',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          '45 REPS',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // VS Emblem
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: AppColors.battleGradient,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.error.withValues(alpha: 0.5),
                          blurRadius: 10,
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        'VS',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ),
                  ),
                ),

                // Player 2 (Opponent)
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceLight.withValues(alpha: 0.8),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 42,
                          height: 42,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: AppColors.textMuted, width: 2),
                            image: const DecorationImage(
                              image: NetworkImage(
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                              ),
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Tuấn Titan',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          '41 REPS',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Victory Reward Tag
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.accent.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.military_tech, size: 14, color: AppColors.accent),
                SizedBox(width: 4),
                Text(
                  'Dẫn đầu +65 Điểm Xếp Hạng • Chuỗi Thắng x3',
                  style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: AppColors.accent),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // --- MOCKUP 3: GPS RUNNING & REWARDS ---
  Widget _buildGpsRunMockup(_IntroSlideData slide) {
    return Container(
      height: 220,
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: slide.badgeColor.withValues(alpha: 0.35),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: slide.badgeColor.withValues(alpha: 0.15),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          // Running Stats Header Grid
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildMetricItem('5.42', 'KM', 'Quãng đường', slide.badgeColor),
              Container(width: 1, height: 35, color: Colors.white.withValues(alpha: 0.1)),
              _buildMetricItem('5\'18"', '/KM', 'Tốc độ Pace', const Color(0xFF00F5D4)),
              Container(width: 1, height: 35, color: Colors.white.withValues(alpha: 0.1)),
              _buildMetricItem('380', 'KCAL', 'Calo đốt cháy', AppColors.accent),
            ],
          ),
          const SizedBox(height: 14),

          // Map Polyline Simulation
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
              ),
              child: Stack(
                children: [
                  CustomPaint(
                    size: const Size(double.infinity, double.infinity),
                    painter: _GpsRoutePainter(pathColor: slide.badgeColor),
                  ),
                  Positioned(
                    top: 10,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.gps_fixed, size: 10, color: AppColors.success),
                          SizedBox(width: 4),
                          Text(
                            'GPS Signal: Rất Tốt',
                            style: TextStyle(fontSize: 9.5, color: AppColors.success),
                          ),
                        ],
                      ),
                    ),
                  ),
                  // Reward Drop Box floating on track
                  Positioned(
                    bottom: 10,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        gradient: AppColors.coinGradient,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.accent.withValues(alpha: 0.4),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.monetization_on, size: 14, color: Colors.black87),
                          SizedBox(width: 4),
                          Text(
                            '+150 Xu & 5 Ruby',
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricItem(String val, String unit, String label, Color color) {
    return Column(
      children: [
        RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: val,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: color,
                ),
              ),
              TextSpan(
                text: ' $unit',
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
        ),
      ],
    );
  }

  // --- MOCKUP 4: GAMIFICATION & COMMUNITY ---
  Widget _buildGamificationMockup(_IntroSlideData slide) {
    return Container(
      height: 220,
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: slide.badgeColor.withValues(alpha: 0.35),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: slide.badgeColor.withValues(alpha: 0.15),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          // Profile Card Preview
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF7C4DFF).withValues(alpha: 0.25),
                  AppColors.surfaceLight,
                ],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF7C4DFF).withValues(alpha: 0.4)),
            ),
            child: Row(
              children: [
                Stack(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.accent, width: 2),
                        image: const DecorationImage(
                          image: NetworkImage(
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                          ),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: const BoxDecoration(
                          color: AppColors.accent,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.star, size: 10, color: Colors.black87),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Chiến Thần Tinh Anh',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          SizedBox(width: 6),
                          Icon(Icons.verified, size: 14, color: AppColors.accent),
                        ],
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Cấp 15 • Danh hiệu: Bất Bại',
                        style: TextStyle(fontSize: 11, color: AppColors.accent),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppColors.accent.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'VIP PRO',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: AppColors.accent,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Badges Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildBadgeItem(Icons.local_fire_department, 'Chuỗi 30 Ngày', AppColors.primary),
              _buildBadgeItem(Icons.sports_kabaddi, 'Top 10 Server', AppColors.error),
              _buildBadgeItem(Icons.card_giftcard, 'Thợ Săn Quà', AppColors.success),
              _buildBadgeItem(Icons.workspace_premium, 'Vua Squat', AppColors.accent),
            ],
          ),
          const Spacer(),

          // Daily Quest Progress
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.task_alt, size: 16, color: AppColors.success),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Nhiệm vụ tân thủ: Hoàn thành 1 bài tập (+100 XP)',
                    style: TextStyle(fontSize: 11, color: Colors.white),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    'SẴN SÀNG',
                    style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: AppColors.success),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBadgeItem(IconData icon, String label, Color color) {
    return Column(
      children: [
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            shape: BoxShape.circle,
            border: Border.all(color: color.withValues(alpha: 0.4)),
          ),
          child: Icon(icon, size: 18, color: color),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 9.5, color: AppColors.textSecondary),
        ),
      ],
    );
  }

  Widget _buildCornerBracket(Color color, {required bool isTop, required bool isLeft}) {
    return Container(
      width: 14,
      height: 14,
      decoration: BoxDecoration(
        border: Border(
          top: isTop ? BorderSide(color: color, width: 2.5) : BorderSide.none,
          bottom: !isTop ? BorderSide(color: color, width: 2.5) : BorderSide.none,
          left: isLeft ? BorderSide(color: color, width: 2.5) : BorderSide.none,
          right: !isLeft ? BorderSide(color: color, width: 2.5) : BorderSide.none,
        ),
      ),
    );
  }
}

// Data models for slides
enum _SlideVisualType { aiCamera, pvpBattle, gpsRun, gamification }

class _SlideFeature {
  final IconData icon;
  final String text;

  const _SlideFeature({required this.icon, required this.text});
}

class _IntroSlideData {
  final String badge;
  final IconData badgeIcon;
  final Color badgeColor;
  final List<Color> accentGradient;
  final String title;
  final String subtitle;
  final List<_SlideFeature> features;
  final _SlideVisualType slideType;

  const _IntroSlideData({
    required this.badge,
    required this.badgeIcon,
    required this.badgeColor,
    required this.accentGradient,
    required this.title,
    required this.subtitle,
    required this.features,
    required this.slideType,
  });
}

// Custom Painter for AI Tech Grid lines
class _TechGridPainter extends CustomPainter {
  final Color color;

  _TechGridPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1.0;

    const step = 26.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Custom Painter for Pose Skeleton simulation
class _SkeletonPosePainter extends CustomPainter {
  final Color color;

  _SkeletonPosePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final linePaint = Paint()
      ..color = color.withValues(alpha: 0.8)
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    final glowPaint = Paint()
      ..color = color.withValues(alpha: 0.3)
      ..strokeWidth = 6.0
      ..strokeCap = StrokeCap.round;

    final jointPaint = Paint()..color = Colors.white;
    final jointGlow = Paint()..color = color;

    final cx = size.width / 2;
    // Points
    final head = Offset(cx, 24);
    final neck = Offset(cx, 44);
    final leftShoulder = Offset(cx - 28, 52);
    final rightShoulder = Offset(cx + 28, 52);
    final leftElbow = Offset(cx - 40, 78);
    final rightElbow = Offset(cx + 40, 78);
    final leftHand = Offset(cx - 48, 102);
    final rightHand = Offset(cx + 48, 102);
    final midHip = Offset(cx, 106);
    final leftHip = Offset(cx - 20, 110);
    final rightHip = Offset(cx + 20, 110);
    final leftKnee = Offset(cx - 24, 140);
    final rightKnee = Offset(cx + 24, 140);
    final leftFoot = Offset(cx - 26, 164);
    final rightFoot = Offset(cx + 26, 164);

    final connections = [
      [head, neck],
      [neck, leftShoulder],
      [neck, rightShoulder],
      [leftShoulder, leftElbow],
      [leftElbow, leftHand],
      [rightShoulder, rightElbow],
      [rightElbow, rightHand],
      [neck, midHip],
      [midHip, leftHip],
      [midHip, rightHip],
      [leftHip, leftKnee],
      [leftKnee, leftFoot],
      [rightHip, rightKnee],
      [rightKnee, rightFoot],
    ];

    // Draw Glowing Lines
    for (final pair in connections) {
      canvas.drawLine(pair[0], pair[1], glowPaint);
      canvas.drawLine(pair[0], pair[1], linePaint);
    }

    // Draw Head circle
    canvas.drawCircle(head, 12, glowPaint);
    canvas.drawCircle(head, 10, linePaint);

    // Draw Joints
    final joints = [
      neck,
      leftShoulder,
      rightShoulder,
      leftElbow,
      rightElbow,
      leftHand,
      rightHand,
      leftHip,
      rightHip,
      leftKnee,
      rightKnee,
      leftFoot,
      rightFoot,
    ];

    for (final j in joints) {
      canvas.drawCircle(j, 4.5, jointGlow);
      canvas.drawCircle(j, 2.5, jointPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Custom Painter for GPS Running polyline
class _GpsRoutePainter extends CustomPainter {
  final Color pathColor;

  _GpsRoutePainter({required this.pathColor});

  @override
  void paint(Canvas canvas, Size size) {
    final routePaint = Paint()
      ..color = pathColor
      ..strokeWidth = 3.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final glowPaint = Paint()
      ..color = pathColor.withValues(alpha: 0.35)
      ..strokeWidth = 9.0
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path();
    path.moveTo(size.width * 0.15, size.height * 0.75);
    path.cubicTo(
      size.width * 0.25,
      size.height * 0.35,
      size.width * 0.45,
      size.height * 0.85,
      size.width * 0.60,
      size.height * 0.45,
    );
    path.cubicTo(
      size.width * 0.70,
      size.height * 0.20,
      size.width * 0.80,
      size.height * 0.60,
      size.width * 0.88,
      size.height * 0.30,
    );

    canvas.drawPath(path, glowPaint);
    canvas.drawPath(path, routePaint);

    // Start Pin
    canvas.drawCircle(
      Offset(size.width * 0.15, size.height * 0.75),
      6,
      Paint()..color = AppColors.success,
    );
    // End Pin (Current Location pulse)
    final endPoint = Offset(size.width * 0.88, size.height * 0.30);
    canvas.drawCircle(
      endPoint,
      9,
      Paint()..color = pathColor.withValues(alpha: 0.35),
    );
    canvas.drawCircle(
      endPoint,
      5,
      Paint()..color = Colors.white,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
