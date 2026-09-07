import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/providers.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/models.dart'; // For SkinRarity enum
import '../../../../core/models_exercise.dart';

class ShopPage extends ConsumerStatefulWidget {
  const ShopPage({super.key});

  @override
  ConsumerState<ShopPage> createState() => _ShopPageState();
}

class _ShopPageState extends ConsumerState<ShopPage> {
  ShopCategory? _selectedCategory;

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(userProvider);
    final shopItems = ref.watch(shopItemsProvider);
    final userPoints = user.totalPoints;
    final userRank = RankTier.getTierByPoints(userPoints);

    final filteredItems = _selectedCategory == null
        ? shopItems
        : shopItems.where((item) => item.category == _selectedCategory).toList();

    return SafeArea(
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Text(
                  '🛒 Cửa Hàng',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.diamond, color: Color(0xFFFF4757), size: 18),
                      const SizedBox(width: 4),
                      Text(
                        '${user.ruby}',
                        style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // User Rank Info
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Text(
                  userRank.emoji,
                  style: const TextStyle(fontSize: 40),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Hạng: ${userRank.name}',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        '${userPoints} điểm • ${RankTier.getPointsToNextTier(userPoints)} đến hạng tiếp',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'Cấp ${userRank.minPoints ~/ 1000}+',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Category Filter
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _CategoryChip(
                  label: 'Tất cả',
                  emoji: '🎁',
                  isSelected: _selectedCategory == null,
                  onTap: () => setState(() => _selectedCategory = null),
                ),
                _CategoryChip(
                  label: 'Khung',
                  emoji: '🖼️',
                  isSelected: _selectedCategory == ShopCategory.frames,
                  onTap: () => setState(() => _selectedCategory = ShopCategory.frames),
                ),
                _CategoryChip(
                  label: 'Danh hiệu',
                  emoji: '🏷️',
                  isSelected: _selectedCategory == ShopCategory.titles,
                  onTap: () => setState(() => _selectedCategory = ShopCategory.titles),
                ),
                _CategoryChip(
                  label: 'Hiệu ứng',
                  emoji: '✨',
                  isSelected: _selectedCategory == ShopCategory.effects,
                  onTap: () => setState(() => _selectedCategory = ShopCategory.effects),
                ),
                _CategoryChip(
                  label: 'Huy hiệu',
                  emoji: '🏅',
                  isSelected: _selectedCategory == ShopCategory.badges,
                  onTap: () => setState(() => _selectedCategory = ShopCategory.badges),
                ),
                _CategoryChip(
                  label: 'Vật phẩm',
                  emoji: '⚡',
                  isSelected: _selectedCategory == ShopCategory.consumables,
                  onTap: () => setState(() => _selectedCategory = ShopCategory.consumables),
                ),
                _CategoryChip(
                  label: 'Bộ combo',
                  emoji: '📦',
                  isSelected: _selectedCategory == ShopCategory.bundles,
                  onTap: () => setState(() => _selectedCategory = ShopCategory.bundles),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Shop Items Grid
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.75,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: filteredItems.length,
              itemBuilder: (context, index) {
                final item = filteredItems[index];
                return _ShopItemCard(
                  item: item,
                  userPoints: userPoints,
                  onBuy: () => _showPurchaseDialog(context, ref, item),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showPurchaseDialog(BuildContext context, WidgetRef ref, ShopItem item) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Mua ${item.name}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              item.preview,
              style: const TextStyle(fontSize: 64),
            ),
            const SizedBox(height: 16),
            Text(
              item.description,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surfaceLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    item.currency == 'ruby' ? Icons.diamond : Icons.monetization_on,
                    color: item.currency == 'ruby' ? const Color(0xFFFF4757) : AppColors.accent,
                    size: 20,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '${item.price}',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            if (item.requiredRankMin != null && item.requiredRankMin! > 0) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.warning.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.lock, size: 16, color: AppColors.warning),
                    const SizedBox(width: 4),
                    Text(
                      'Yêu cầu: ${item.requiredRankMin} điểm',
                      style: const TextStyle(
                        color: AppColors.warning,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () {
              // Handle purchase
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Đã mua ${item.name}!'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: item.currency == 'ruby' ? const Color(0xFFFF4757) : AppColors.accent,
            ),
            child: const Text('Mua ngay'),
          ),
        ],
      ),
    );
  }
}

class _CategoryChip extends StatelessWidget {
  final String label;
  final String emoji;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryChip({
    required this.label,
    required this.emoji,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : AppColors.surface,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 16)),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ShopItemCard extends StatelessWidget {
  final ShopItem item;
  final int userPoints;
  final VoidCallback onBuy;

  const _ShopItemCard({
    required this.item,
    required this.userPoints,
    required this.onBuy,
  });

  Color _getRarityColor() {
    switch (item.rarity) {
      case SkinRarity.common:
        return AppColors.textMuted;
      case SkinRarity.rare:
        return const Color(0xFF3498db);
      case SkinRarity.epic:
        return const Color(0xFF9b59b6);
      case SkinRarity.legendary:
        return const Color(0xFFf39c12);
    }
  }

  String _getRarityName() {
    switch (item.rarity) {
      case SkinRarity.common:
        return 'Thường';
      case SkinRarity.rare:
        return 'Hiếm';
      case SkinRarity.epic:
        return 'Sắc thái';
      case SkinRarity.legendary:
        return 'Huyền thoại';
    }
  }

  @override
  Widget build(BuildContext context) {
    final canBuy = item.requiredRankMin == null || userPoints >= item.requiredRankMin!;

    return GestureDetector(
      onTap: item.owned ? null : onBuy,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _getRarityColor().withValues(alpha: 0.3),
            width: 2,
          ),
        ),
        child: Column(
          children: [
            // Header with Rarity
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: _getRarityColor().withValues(alpha: 0.1),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _getRarityName(),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: _getRarityColor(),
                    ),
                  ),
                  if (item.limited)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.error.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'LIMITED',
                        style: TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                          color: AppColors.error,
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Preview
            Expanded(
              child: Center(
                child: item.owned
                    ? Stack(
                        alignment: Alignment.center,
                        children: [
                          Text(item.preview, style: const TextStyle(fontSize: 48)),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.success.withValues(alpha: 0.9),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.check, color: Colors.white, size: 20),
                          ),
                        ],
                      )
                    : Text(item.preview, style: const TextStyle(fontSize: 48)),
              ),
            ),

            // Info
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surfaceLight.withValues(alpha: 0.5),
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(14)),
              ),
              child: Column(
                children: [
                  Text(
                    item.name,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  if (item.owned)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.success.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Đã sở hữu',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: AppColors.success,
                        ),
                      ),
                    )
                  else if (!canBuy)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.warning.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.lock, size: 12, color: AppColors.warning),
                          const SizedBox(width: 4),
                          Text(
                            '${item.requiredRankMin}',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: AppColors.warning,
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          item.currency == 'ruby' ? Icons.diamond : Icons.monetization_on,
                          size: 14,
                          color: item.currency == 'ruby' ? const Color(0xFFFF4757) : AppColors.accent,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${item.price}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
