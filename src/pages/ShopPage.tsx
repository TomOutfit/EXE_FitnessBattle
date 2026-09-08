import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Check } from 'lucide-react';
import type { SkinItem } from '../types';

type ShopCategory = 'all' | 'frames' | 'titles' | 'effects' | 'badges' | 'consumables' | 'bundles';

export const ShopPage: React.FC = () => {
  const { user, skinItems, buyShopItem } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('all');
  const [selectedItem, setSelectedItem] = useState<SkinItem | null>(null);

  const getRankTier = (points: number) => {
    if (points >= 10000) return { name: 'Thần Thoại', emoji: '👑', minPoints: 10000 };
    if (points >= 5000) return { name: 'Kim Cương', emoji: '💎', minPoints: 5000 };
    if (points >= 2500) return { name: 'Bạch Kim', emoji: '🏆', minPoints: 2500 };
    if (points >= 1000) return { name: 'Vàng', emoji: '🥇', minPoints: 1000 };
    if (points >= 500) return { name: 'Bạc', emoji: '🥈', minPoints: 500 };
    return { name: 'Đồng', emoji: '🥉', minPoints: 0 };
  };

  const userRank = getRankTier(user.totalPoints);

  const categories: Array<{ id: ShopCategory; label: string; emoji: string }> = [
    { id: 'all', label: 'Tất cả', emoji: '🎁' },
    { id: 'frames', label: 'Khung', emoji: '🖼️' },
    { id: 'titles', label: 'Danh hiệu', emoji: '🏷️' },
    { id: 'effects', label: 'Hiệu ứng', emoji: '✨' },
    { id: 'badges', label: 'Huy hiệu', emoji: '🏅' },
    { id: 'consumables', label: 'Vật phẩm', emoji: '⚡' },
    { id: 'bundles', label: 'Bộ combo', emoji: '📦' },
  ];

  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case 'rare':
        return { name: 'Hiếm', color: '#3498DB' };
      case 'epic':
        return { name: 'Sắc thái', color: '#9B59B6' };
      case 'legendary':
        return { name: 'Huyền thoại', color: '#F39C12' };
      default:
        return { name: 'Thường', color: '#6B6B80' };
    }
  };

  const filteredItems = skinItems.filter(item => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'frames') return item.type === 'avatar_frame';
    if (selectedCategory === 'titles') return item.type === 'title';
    if (selectedCategory === 'effects') return item.type === 'victory_effect';
    if (selectedCategory === 'badges') return item.type === 'badge';
    return true;
  });

  const handleBuy = (item: SkinItem) => {
    const success = buyShopItem(item.id);
    if (success) {
      setSelectedItem(null);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 640, margin: '0 auto', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          🛒 Cửa Hàng
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#1A1A2E',
            padding: '6px 12px',
            borderRadius: 20,
            border: '1px solid #25253D'
          }}
        >
          <span style={{ fontSize: 16 }}>💎</span>
          <span style={{ fontWeight: 600, color: '#FFFFFF', fontSize: 14 }}>
            {user.ruby}
          </span>
        </div>
      </div>

      {/* User Rank Info Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          marginBottom: 16,
          color: '#FFFFFF'
        }}
      >
        <div style={{ fontSize: 40, marginRight: 16 }}>
          {userRank.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            Hạng: {userRank.name}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
            {user.totalPoints} điểm • Cần thêm để lên hạng tiếp
          </div>
        </div>
        <div
          style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '6px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700
          }}
        >
          Cấp {Math.floor(userRank.minPoints / 1000)}+
        </div>
      </div>

      {/* Category Chips Scroll */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 16,
          scrollbarWidth: 'none'
        }}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 20,
                background: isSelected ? '#FF6B35' : '#1A1A2E',
                color: isSelected ? '#FFFFFF' : '#B0B0C3',
                fontWeight: isSelected ? 600 : 400,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                border: isSelected ? 'none' : '1px solid #25253D',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: 16 }}>{cat.emoji}</span>
              <span>{cat.label}</span>
            </div>
          );
        })}
      </div>

      {/* Shop Items 2-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12
        }}
      >
        {filteredItems.map((item) => {
          const rarity = getRarityConfig(item.rarity);

          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              style={{
                background: '#1A1A2E',
                borderRadius: 16,
                border: `2px solid ${rarity.color}45`,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
            >
              {/* Header Rarity Banner */}
              <div
                style={{
                  background: `${rarity.color}20`,
                  padding: '4px 8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 600, color: rarity.color }}>
                  {rarity.name}
                </span>
                {item.limited && (
                  <span
                    style={{
                      background: 'rgba(255, 71, 87, 0.2)',
                      color: '#FF4757',
                      fontSize: 8,
                      fontWeight: 800,
                      padding: '2px 4px',
                      borderRadius: 4
                    }}
                  >
                    LIMITED
                  </span>
                )}
              </div>

              {/* Preview Emoji */}
              <div
                style={{
                  height: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <span style={{ fontSize: 48 }}>{item.preview}</span>
                {item.owned && (
                  <div
                    style={{
                      position: 'absolute',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'rgba(46, 213, 115, 0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={18} color="#FFFFFF" />
                  </div>
                )}
              </div>

              {/* Info Footer */}
              <div
                style={{
                  background: 'rgba(37, 37, 61, 0.5)',
                  padding: 12,
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: 4
                  }}
                >
                  {item.name}
                </div>

                {item.owned ? (
                  <div
                    style={{
                      display: 'inline-block',
                      background: 'rgba(46, 213, 115, 0.2)',
                      color: '#2ED573',
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 8
                    }}
                  >
                    Đã sở hữu
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4
                    }}
                  >
                    <span style={{ fontSize: 13 }}>💎</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>
                      {item.price}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Purchase Modal */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1A1A2E',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 360,
              border: '1px solid #25253D',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>
              Mua {selectedItem.name}
            </div>

            <div style={{ fontSize: 64, marginBottom: 16 }}>
              {selectedItem.preview}
            </div>

            <div style={{ fontSize: 13, color: '#B0B0C3', marginBottom: 16 }}>
              {selectedItem.owned ? 'Bạn đã sở hữu vật phẩm này!' : 'Vật phẩm trang trí cao cấp trong hệ thống Fitness Battle'}
            </div>

            {/* Price badge */}
            <div
              style={{
                background: '#25253D',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 20
              }}
            >
              <span style={{ fontSize: 20 }}>💎</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
                {selectedItem.price} Ruby
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  flex: 1,
                  padding: 12,
                  background: 'transparent',
                  border: '1px solid #25253D',
                  borderRadius: 12,
                  color: '#B0B0C3',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>

              {!selectedItem.owned && (
                <button
                  onClick={() => handleBuy(selectedItem)}
                  style={{
                    flex: 1,
                    padding: 12,
                    background: 'linear-gradient(135deg, #FF4757 0%, #FF6B81 100%)',
                    border: 'none',
                    borderRadius: 12,
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Mua ngay
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
