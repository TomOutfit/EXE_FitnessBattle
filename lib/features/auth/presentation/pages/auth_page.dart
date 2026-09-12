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
  final _regNameController = TextEditingController();
  final _regEmailController = TextEditingController();
  final _regPasswordController = TextEditingController();
  final _regConfirmPasswordController = TextEditingController();
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

  Future<void> _handleRegister() async {
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
      _isRegistering = true;
      _regError = null;
    });

    final res = await AppDatabase.instance.register(
      name: name,
      email: email,
      password: password,
    );

    if (!mounted) return;
    setState(() => _isRegistering = false);

    if (res.success && res.user != null) {
      ref.read(userProvider.notifier).updateUser(res.user!);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🎉 Tạo tài khoản thành công! Đã đăng nhập.'),
          backgroundColor: Color(0xFF2ED573),
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
                            color: AppColors.primary.withValues(alpha: 0.4),
                            blurRadius: 20,
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
                      'Luyện tập thông minh • Đấu trường đỉnh cao',
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Tab Selector (Đăng Nhập / Đăng Ký)
              Container(
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
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

              // Tab Content
              SizedBox(
                height: 380,
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    // --- LOGIN TAB ---
                    _buildLoginTab(),

                    // --- REGISTER TAB ---
                    _buildRegisterTab(),
                  ],
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
                        Icon(Icons.flash_on, color: AppColors.secondary, size: 18),
                        SizedBox(width: 8),
                        Text(
                          'TRUY CẬP NHANH TÀI KHOẢN MẪU',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: () => _fillQuickAccount('demo@fitnessbattle.vn', 'demo123456'),
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                              ),
                              child: const Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('⚔️ Demo Warrior', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary)),
                                  SizedBox(height: 2),
                                  Text('Lv.15 • 350 💎 • 5800 🪙', style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: InkWell(
                            onTap: () => _fillQuickAccount('vip@fitnessbattle.vn', 'vip123456'),
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFFD700).withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: const Color(0xFFFFD700).withValues(alpha: 0.3)),
                              ),
                              child: const Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('👑 VIP Champion', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFFFD700))),
                                  SizedBox(height: 2),
                                  Text('Lv.25 • 1200 💎 • VIP Frame', style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                                ],
                              ),
                            ),
                          ),
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
          const SizedBox(height: 10),
        ],

        // Name
        _buildTextField(
          controller: _regNameController,
          label: 'Họ và tên',
          hint: 'Ví dụ: Tuấn Titan',
          icon: Icons.person_outline,
        ),
        const SizedBox(height: 10),

        // Email
        _buildTextField(
          controller: _regEmailController,
          label: 'Email',
          hint: 'Nhập địa chỉ email',
          icon: Icons.email_outlined,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 10),

        // Password
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

        // Confirm Password
        _buildTextField(
          controller: _regConfirmPasswordController,
          label: 'Xác nhận mật khẩu',
          hint: 'Nhập lại mật khẩu',
          icon: Icons.lock_outline,
          obscureText: _regObscure,
        ),
        const SizedBox(height: 16),

        // Submit Button
        ElevatedButton(
          onPressed: _isRegistering ? null : _handleRegister,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.secondary,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            elevation: 4,
          ),
          child: _isRegistering
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : const Text(
                  'TẠO TÀI KHOẢN MỚI',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                ),
        ),
      ],
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
