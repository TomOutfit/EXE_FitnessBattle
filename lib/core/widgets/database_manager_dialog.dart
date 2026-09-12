import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../theme/app_theme.dart';
import '../providers.dart';
import '../services/app_database.dart';

/// Database Manager Dialog - Allows inspection, editing stats, quick resource boosts, and resetting database
class DatabaseManagerDialog extends ConsumerStatefulWidget {
  const DatabaseManagerDialog({super.key});

  @override
  ConsumerState<DatabaseManagerDialog> createState() => _DatabaseManagerDialogState();
}

class _DatabaseManagerDialogState extends ConsumerState<DatabaseManagerDialog> {
  late TextEditingController _coinsController;
  late TextEditingController _rubyController;
  late TextEditingController _staminaController;
  late TextEditingController _levelController;
  late TextEditingController _pointsController;
  late TextEditingController _streakController;
  bool _isVIP = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(userProvider);
    _coinsController = TextEditingController(text: '${user.coins}');
    _rubyController = TextEditingController(text: '${user.ruby}');
    _staminaController = TextEditingController(text: '${user.stamina}');
    _levelController = TextEditingController(text: '${user.level}');
    _pointsController = TextEditingController(text: '${user.totalPoints}');
    _streakController = TextEditingController(text: '${user.streak}');
    _isVIP = user.isVIP;
  }

  @override
  void dispose() {
    _coinsController.dispose();
    _rubyController.dispose();
    _staminaController.dispose();
    _levelController.dispose();
    _pointsController.dispose();
    _streakController.dispose();
    super.dispose();
  }

  void _addCoins(int delta) {
    final current = int.tryParse(_coinsController.text) ?? 0;
    _coinsController.text = '${(current + delta).clamp(0, 99999999)}';
    setState(() {});
  }

  void _addRuby(int delta) {
    final current = int.tryParse(_rubyController.text) ?? 0;
    _rubyController.text = '${(current + delta).clamp(0, 99999999)}';
    setState(() {});
  }

  void _addStamina(int delta) {
    final current = int.tryParse(_staminaController.text) ?? 0;
    _staminaController.text = '${(current + delta).clamp(0, 500)}';
    setState(() {});
  }

  void _fullStamina() {
    _staminaController.text = _isVIP ? '500' : '200';
    setState(() {});
  }

  Future<void> _applyCustomStats() async {
    setState(() => _isSaving = true);
    final user = ref.read(userProvider);
    final newCoins = int.tryParse(_coinsController.text) ?? user.coins;
    final newRuby = int.tryParse(_rubyController.text) ?? user.ruby;
    final newStamina = int.tryParse(_staminaController.text) ?? user.stamina;
    final newLevel = int.tryParse(_levelController.text) ?? user.level;
    final newPoints = int.tryParse(_pointsController.text) ?? user.totalPoints;
    final newStreak = int.tryParse(_streakController.text) ?? user.streak;

    final updated = user.copyWith(
      coins: newCoins,
      ruby: newRuby,
      stamina: newStamina,
      level: newLevel,
      totalPoints: newPoints,
      streak: newStreak,
      isVIP: _isVIP,
    );

    ref.read(userProvider.notifier).updateUser(updated);
    await AppDatabase.instance.saveUser(updated);

    if (mounted) {
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('✓ Đã lưu thay đổi vào CSDL thành công!'),
          backgroundColor: Color(0xFF2ED573),
          duration: Duration(seconds: 2),
        ),
      );
      Navigator.pop(context);
    }
  }

  Future<void> _resetToSeedDatabase() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text('Xác nhận đặt lại CSDL?', style: TextStyle(color: AppColors.textPrimary)),
        content: const Text(
          'Toàn bộ dữ liệu sẽ được khôi phục về trạng thái Seed Data ban đầu với tài nguyên dồi dào.',
          style: TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('HỦY', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('ĐẶT LẠI'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      setState(() => _isSaving = true);
      await AppDatabase.instance.resetDatabase();
      final freshUser = AppDatabase.instance.getUser();
      ref.read(userProvider.notifier).updateUser(freshUser);
      ref.read(challengesProvider.notifier).state = AppDatabase.instance.getChallenges();
      ref.read(battleHistoryProvider.notifier).state = AppDatabase.instance.getBattleHistory();
      ref.read(userExerciseStatsProvider.notifier).state = AppDatabase.instance.getExerciseStats();

      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✓ Đã khôi phục CSDL mẫu thành công!'),
            backgroundColor: Color(0xFF2ED573),
            duration: Duration(seconds: 2),
          ),
        );
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final counts = AppDatabase.instance.getCollectionCounts();

    return Dialog(
      backgroundColor: AppColors.background,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: const BorderSide(color: AppColors.primary, width: 1.5),
      ),
      child: Container(
        padding: const EdgeInsets.all(20),
        constraints: const BoxConstraints(maxWidth: 480, maxHeight: 680),
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.storage, color: AppColors.primary, size: 24),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'QUẢN LÝ CƠ SỞ DỮ LIỆU',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          'Persistent Dynamic Database Engine',
                          style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close, color: AppColors.textMuted),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              const Divider(color: AppColors.border),
              const SizedBox(height: 10),

              // Collections Summary
              const Text(
                '📊 CÁC BẢNG DỮ LIỆU ĐỘNG',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.secondary),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: counts.entries.map((e) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 3),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(e.key, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                        Text('${e.value} records', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                      ],
                    ),
                  )).toList(),
                ),
              ),
              const SizedBox(height: 14),

              // Quick Boost Chips
              const Text(
                '⚡ TĂNG NHANH TÀI NGUYÊN',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildQuickChip('+100 💎', () => _addRuby(100), const Color(0xFFFF4757)),
                  _buildQuickChip('+500 💎', () => _addRuby(500), const Color(0xFFFF4757)),
                  _buildQuickChip('+1000 🪙', () => _addCoins(1000), const Color(0xFFF7C948)),
                  _buildQuickChip('+5000 🪙', () => _addCoins(5000), const Color(0xFFF7C948)),
                  _buildQuickChip('+50 ⚡', () => _addStamina(50), const Color(0xFF2ED573)),
                  _buildQuickChip('Hồi Đầy ⚡', _fullStamina, const Color(0xFF2ED573)),
                ],
              ),
              const SizedBox(height: 14),

              // Resource Fields
              const Text(
                '📝 CHỈNH SỬA THÔNG SỐ TÙY CHỌN',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField('🪙 Coins', _coinsController),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildTextField('💎 Ruby', _rubyController),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField('⚡ Stamina', _staminaController),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildTextField('⭐ Level', _levelController),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField('🏆 Điểm Thưởng', _pointsController),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildTextField('🔥 Chuỗi Ngày', _streakController),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // VIP Switch
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.workspace_premium, color: Color(0xFFFFD700), size: 20),
                        SizedBox(width: 8),
                        Text('Tài khoản VIP Pro', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                      ],
                    ),
                    Switch(
                      value: _isVIP,
                      activeColor: AppColors.primary,
                      onChanged: (val) => setState(() => _isVIP = val),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Action Buttons
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isSaving ? null : _applyCustomStats,
                  icon: const Icon(Icons.check, size: 18),
                  label: Text(_isSaving ? 'Đang lưu...' : 'LƯU & CẬP NHẬT CSDL'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _isSaving ? null : _resetToSeedDatabase,
                  icon: const Icon(Icons.refresh, color: AppColors.error, size: 18),
                  label: const Text('KHÔI PHỤC CSDL MẪU (RESET SEED)', style: TextStyle(color: AppColors.error)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.error),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickChip(String label, VoidCallback onTap, Color color) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withValues(alpha: 0.4)),
        ),
        child: Text(
          label,
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color),
        ),
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: TextField(
        controller: controller,
        keyboardType: TextInputType.number,
        style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.bold),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: AppColors.textMuted, fontSize: 11),
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          border: InputBorder.none,
        ),
      ),
    );
  }
}
