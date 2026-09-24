import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/providers.dart';
import '../../../../core/services/app_database.dart';

class AuthPage extends ConsumerStatefulWidget {
  const AuthPage({super.key});

  @override
  ConsumerState<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends ConsumerState<AuthPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  // Login Controllers
  final _loginEmailController = TextEditingController(text: 'demo@fitnessbattle.vn');
  final _loginPasswordController = TextEditingController(text: 'demo123456');
  bool _loginObscure = true;
  bool _rememberMe = true;
  bool _isLoggingIn = false;
  String? _loginError;

  // Register Controllers
  int _regStep = 1; // 1: Info, 2: Fitness Level Survey
  final _regNameController = TextEditingController();
  final _regEmailController = TextEditingController();
  final _regPasswordController = TextEditingController();
  final _regConfirmPasswordController = TextEditingController();
  String _fitnessLevel = 'beginner'; // 'beginner' | 'intermediate' | 'advanced'
  bool _regObscure = true;
  bool _isRegistering = false;
  String? _regError;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _loginEmailController.dispose();
    _loginPasswordController.dispose();
    _regNameController.dispose();
    _regEmailController.dispose();
    _regPasswordController.dispose();
    _regConfirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final email = _loginEmailController.text.trim();
    final password = _loginPasswordController.text;

    if (email.isEmpty || password.isEmpty) {
      setState(() => _loginError = 'Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }

    setState(() {
      _isLoggingIn = true;
      _loginError = null;
    });

    final res = await AppDatabase.instance.login(email: email, password: password);

    if (!mounted) return;
    setState(() => _isLoggingIn = false);

    if (res.success && res.user != null) {
      ref.read(userProvider.notifier).updateUser(res.user!);
      context.go('/home');
    } else {
      setState(() => _loginError = res.errorMessage ?? 'Đăng nhập thất bại');
    }
  }

  void _handleNextRegisterStep() {
    final name = _regNameController.text.trim();
    final email = _regEmailController.text.trim();
    final password = _regPasswordController.text;
    final confirm = _regConfirmPasswordController.text;

    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      setState(() => _regError = 'Vui lòng điền đầy đủ các thông tin');
      return;
    }

    if (password.length < 6) {
      setState(() => _regError = 'Mật khẩu phải có tối thiểu 6 ký tự');
      return;
    }

    if (password != confirm) {
      setState(() => _regError = 'Mật khẩu xác nhận không khớp');
      return;
    }

    setState(() {
      _regError = null;
      _regStep = 2;
    });
  }

  Future<void> _handleRegister() async {
    final name = _regNameController.text.trim();
    final email = _regEmailController.text.trim();
    final password = _regPasswordController.text;

    setState(() {
      _isRegistering = true;
      _regError = null;
    });

    final res = await AppDatabase.instance.register(
      name: name,
      email: email,
      password: password,
      fitnessLevel: _fitnessLevel,
    );

    if (!mounted) return;
    setState(() => _isRegistering = false);

    if (res.success && res.user != null) {
      ref.read(userProvider.notifier).updateUser(res.user!);
      final lvlLabel = _fitnessLevel == 'advanced'
          ? 'Đã tập lâu năm'
          : _fitnessLevel == 'intermediate'
              ? 'Đã tập một thời gian'
              : 'Mới bắt đầu';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🎉 Tạo tài khoản thành công ($lvlLabel)! Đã đăng nhập.'),
          backgroundColor: const Color(0xFF2ED573),
        ),
      );
      context.go('/home');
    } else {
      setState(() => _regError = res.errorMessage ?? 'Đăng ký thất bại');
    }
  }

  void _fillQuickAccount(String email, String password) {
    _loginEmailController.text = email;
    _loginPasswordController.text = password;
    setState(() => _loginError = null);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 12),

              // Logo & App Name
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        gradient: AppColors.battleGradient,
                        borderRadius: BorderRadius.circular(22),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.45),
                            blurRadius: 22,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text(
                          '⚡',
                          style: TextStyle(fontSize: 36),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    const Text(
                      'FITNESS BATTLE',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.5,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Đấu Trường Thể Lực 1v1 • Trọng Tài AI Vision',
                      style: TextStyle(fontSize: 12, color: AppColors.secondary, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 22),

              // Tab Selector (Đăng Nhập / Đăng Ký)
              Container(
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                ),
                child: TabBar(
                  controller: _tabController,
                  indicator: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  indicatorSize: TabBarIndicatorSize.tab,
                  dividerColor: Colors.transparent,
                  labelColor: Colors.white,
                  unselectedLabelColor: AppColors.textMuted,
                  labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  tabs: const [
                    Tab(text: 'ĐĂNG NHẬP'),
                    Tab(text: 'ĐĂNG KÝ MỚI'),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Tab Content with Adaptive Height
              AnimatedSize(
                duration: const Duration(milliseconds: 250),
                child: SizedBox(
                  child: [
                    // --- LOGIN TAB ---
                    _buildLoginTab(),

                    // --- REGISTER TAB ---
                    _buildRegisterTab(),
                  ][_tabController.index],
                ),
              ),

              const SizedBox(height: 16),

              // Quick Demo Accounts Box
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.flash_on, color: AppColors.primary, size: 18),
                        SizedBox(width: 8),
                        Text(
                          'TRUY CẬP NHANH THEO CẤP ĐỘ (1-CLICK DEMO)',
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Column(
                      children: [
                        // Beginner
                        _buildQuickAccountTile(
                          icon: '🌱',
                          title: 'Người Mới Bắt Đầu (Newbie)',
                          subtitle: 'demo@fitnessbattle.vn • Level 1 • 200 💎',
                          color: const Color(0xFF2ED573),
                          onTap: () {
                            _tabController.animateTo(0);
                            _fillQuickAccount('demo@fitnessbattle.vn', 'demo123456');
                          },
                        ),
                        const SizedBox(height: 8),

                        // Intermediate
                        _buildQuickAccountTile(
                          icon: '⚡',
                          title: 'Trung Cấp - TomOutfit',
                          subtitle: 'tomoutfit@fitnessbattle.vn • Level 15 • 350 💎',
                          color: AppColors.primary,
                          onTap: () {
                            _tabController.animateTo(0);
                            _fillQuickAccount('tomoutfit@fitnessbattle.vn', 'tomoutfit123');
                          },
                        ),
                        const SizedBox(height: 8),

                        // VIP Master
                        _buildQuickAccountTile(
                          icon: '👑',
                          title: 'Tập Lâu Năm - VIP Master',
                          subtitle: 'vip@fitnessbattle.vn • Level 25 • 1200 💎',
                          color: const Color(0xFFFFD700),
                          onTap: () {
                            _tabController.animateTo(0);
                            _fillQuickAccount('vip@fitnessbattle.vn', 'vip123456');
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickAccountTile({
    required String icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            Text(icon, style: const TextStyle(fontSize: 18)),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: color)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(fontSize: 10.5, color: AppColors.textSecondary)),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 12, color: color),
          ],
        ),
      ),
    );
  }

  Widget _buildLoginTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (_loginError != null) ...[
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.error.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.error.withValues(alpha: 0.5)),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline, color: AppColors.error, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _loginError!,
                    style: const TextStyle(color: AppColors.error, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
        ],

        // Email Field
        _buildTextField(
          controller: _loginEmailController,
          label: 'Email',
          hint: 'Nhập email của bạn',
          icon: Icons.email_outlined,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 12),

        // Password Field
        _buildTextField(
          controller: _loginPasswordController,
          label: 'Mật khẩu',
          hint: 'Nhập mật khẩu',
          icon: Icons.lock_outline,
          obscureText: _loginObscure,
          suffixIcon: IconButton(
            icon: Icon(
              _loginObscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
              color: AppColors.textMuted,
              size: 20,
            ),
            onPressed: () => setState(() => _loginObscure = !_loginObscure),
          ),
        ),
        const SizedBox(height: 8),

        // Remember Me & Forgot Password
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                SizedBox(
                  height: 24,
                  width: 24,
                  child: Checkbox(
                    value: _rememberMe,
                    activeColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                    onChanged: (v) => setState(() => _rememberMe = v ?? true),
                  ),
                ),
                const SizedBox(width: 8),
                const Text('Ghi nhớ đăng nhập', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              ],
            ),
            TextButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Vui lòng sử dụng tài khoản Demo hoặc VIP mẫu để trải nghiệm!'),
                    backgroundColor: AppColors.primary,
                  ),
                );
              },
              child: const Text('Quên mật khẩu?', style: TextStyle(fontSize: 12, color: AppColors.primary)),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Submit Button
        ElevatedButton(
          onPressed: _isLoggingIn ? null : _handleLogin,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            elevation: 4,
          ),
          child: _isLoggingIn
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : const Text(
                  'ĐĂNG NHẬP NGAY',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                ),
        ),
      ],
    );
  }

  Widget _buildRegisterTab() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Step Indicator Breadcrumbs
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildStepIndicator(step: 1, title: 'Tài Khoản', isActive: _regStep == 1, isCompleted: _regStep > 1),
            Container(width: 30, height: 2, color: _regStep > 1 ? const Color(0xFF2ED573) : AppColors.border),
            _buildStepIndicator(step: 2, title: 'Trình Độ Thể Lực', isActive: _regStep == 2, isCompleted: false),
          ],
        ),
        const SizedBox(height: 16),

        if (_regError != null) ...[
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.error.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.error.withValues(alpha: 0.5)),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline, color: AppColors.error, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _regError!,
                    style: const TextStyle(color: AppColors.error, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
        ],

        // STEP 1: Account Credentials
        if (_regStep == 1) ...[
          _buildTextField(
            controller: _regNameController,
            label: 'Họ và tên',
            hint: 'Ví dụ: Tuấn Titan',
            icon: Icons.person_outline,
          ),
          const SizedBox(height: 10),

          _buildTextField(
            controller: _regEmailController,
            label: 'Email',
            hint: 'Nhập địa chỉ email',
            icon: Icons.email_outlined,
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 10),

          _buildTextField(
            controller: _regPasswordController,
            label: 'Mật khẩu',
            hint: 'Tối thiểu 6 ký tự',
            icon: Icons.lock_outline,
            obscureText: _regObscure,
            suffixIcon: IconButton(
              icon: Icon(
                _regObscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                color: AppColors.textMuted,
                size: 20,
              ),
              onPressed: () => setState(() => _regObscure = !_regObscure),
            ),
          ),
          const SizedBox(height: 10),

          _buildTextField(
            controller: _regConfirmPasswordController,
            label: 'Xác nhận mật khẩu',
            hint: 'Nhập lại mật khẩu',
            icon: Icons.lock_outline,
            obscureText: _regObscure,
          ),
          const SizedBox(height: 16),

          ElevatedButton(
            onPressed: _handleNextRegisterStep,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: const Text(
              'TIẾP TỤC: CHỌN TRÌNH ĐỘ ➔',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
            ),
          ),
        ],

        // STEP 2: Fitness Level Selection
        if (_regStep == 2) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
            ),
            child: const Text(
              '🎯 Chọn trình độ tập luyện để AI thiết lập số lượng reps, độ khó bài tập và ghép đối thủ 1v1 phù hợp:',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
            ),
          ),
          const SizedBox(height: 12),

          // Option 1: Beginner
          _buildFitnessLevelCard(
            id: 'beginner',
            icon: '🌱',
            title: 'Chưa Từng Tập / Mới Bắt Đầu',
            desc: 'Mục tiêu xây dựng thói quen, bài tập nhẹ nhàng, AI hướng dẫn chi tiết.',
            badge: 'Khởi đầu Level 1 • 5-10 Reps',
            color: const Color(0xFF2ED573),
          ),
          const SizedBox(height: 10),

          // Option 2: Intermediate
          _buildFitnessLevelCard(
            id: 'intermediate',
            icon: '⚡',
            title: 'Đã Tập Một Thời Gian',
            desc: 'Đã có nền tảng thể lực, sẵn sàng đấu 1v1 PvP 60s và leo rank.',
            badge: 'Tặng Level 5 • 15-25 Reps',
            color: AppColors.primary,
          ),
          const SizedBox(height: 10),

          // Option 3: Advanced
          _buildFitnessLevelCard(
            id: 'advanced',
            icon: '👑',
            title: 'Đã Tập Lâu Năm / Vận Động Viên',
            desc: 'Thể lực dồi dào, chuyên nghiệp, săn Titan Boss và Top BXH Toàn Quốc.',
            badge: 'Mở khóa Level 15 • 40+ Reps',
            color: const Color(0xFFFFD700),
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                flex: 1,
                child: OutlinedButton(
                  onPressed: () => setState(() => _regStep = 1),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.border),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: const Text('Quay Lại', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  onPressed: _isRegistering ? null : _handleRegister,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2ED573),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _isRegistering
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text(
                          'HOÀN TẤT & BẮT ĐẦU ⚡',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildStepIndicator({
    required int step,
    required String title,
    required bool isActive,
    required bool isCompleted,
  }) {
    final color = isCompleted
        ? const Color(0xFF2ED573)
        : isActive
            ? AppColors.primary
            : AppColors.textMuted;

    return Row(
      children: [
        Container(
          width: 22,
          height: 22,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color.withValues(alpha: 0.2),
            border: Border.all(color: color, width: 1.5),
          ),
          child: Center(
            child: isCompleted
                ? const Icon(Icons.check, size: 14, color: Color(0xFF2ED573))
                : Text('$step', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color)),
          ),
        ),
        const SizedBox(width: 6),
        Text(title, style: TextStyle(fontSize: 11.5, fontWeight: isActive ? FontWeight.bold : FontWeight.w500, color: color)),
      ],
    );
  }

  Widget _buildFitnessLevelCard({
    required String id,
    required String icon,
    required String title,
    required String desc,
    required String badge,
    required Color color,
  }) {
    final isSelected = _fitnessLevel == id;
    return InkWell(
      onTap: () => setState(() => _fitnessLevel = id),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? color.withValues(alpha: 0.15) : AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? color : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(icon, style: const TextStyle(fontSize: 22)),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: isSelected ? color : AppColors.textPrimary)),
                      if (isSelected)
                        Container(
                          padding: const EdgeInsets.all(2),
                          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                          child: const Icon(Icons.check, size: 12, color: Colors.black),
                        ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(desc, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(badge, style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: color)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    bool obscureText = false,
    Widget? suffixIcon,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: TextField(
        controller: controller,
        obscureText: obscureText,
        keyboardType: keyboardType,
        style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
          hintText: hint,
          hintStyle: TextStyle(color: AppColors.textMuted.withValues(alpha: 0.5), fontSize: 12),
          prefixIcon: Icon(icon, color: AppColors.primary, size: 20),
          suffixIcon: suffixIcon,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          border: InputBorder.none,
        ),
      ),
    );
  }
}
