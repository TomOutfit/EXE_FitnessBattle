import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ArrowLeft, X } from 'lucide-react';
import type { SkinItem } from '../types';
import { AppCard } from '../components/ui';

type ShopCategory = 'all' | 'frames' | 'titles' | 'effects' | 'badges' | 'consumables' | 'bundles';

export const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, skinItems, buyShopItem } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('all');
  const [selectedItem, setSelectedItem] = useState<SkinItem | null>(null);

  const getRankTier = (points: number) => {
    if (points >= 10000) return { name: 'Thần Thoại', emoji: '👑', minPoints: 10000, nextPoints: 20000 };
    if (points >= 5000) return { name: 'Kim Cương', emoji: '💎', minPoints: 5000, nextPoints: 10000 };
    if (points >= 2500) return { name: 'Bạch Kim', emoji: '🏆', minPoints: 2500, nextPoints: 5000 };
    if (points >= 1000) return { name: 'Vàng', emoji: '🥇', minPoints: 1000, nextPoints: 2500 };
    if (points >= 500) return { name: 'Bạc', emoji: '🥈', minPoints: 500, nextPoints: 1000 };
    return { name: 'Đồng', emoji: '🥉', minPoints: 0, nextPoints: 500 };
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

  const filteredItems = skinItems.filter((item) => {
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: '#1A1A2E',
              border: '1px solid #25253D',
              borderRadius: 10,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              marginRight: 12,
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            🛒 Cửa Hàng
          </h1>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: '#1A1A2E',
            padding: '6px 12px',
            borderRadius: 20,
            border: '1px solid #25253D',
          }}
        >
          <span style={{ fontSize: 14 }}>💎</span>
          <span style={{ fontWeight: 600, color: '#FFFFFF', fontSize: 13 }}>
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
          color: '#FFFFFF',
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
            {user.totalPoints.toLocaleString()} điểm • {Math.max(0, userRank.nextPoints - user.totalPoints)} đến hạng tiếp
          </div>
        </div>
        <div
          style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 20,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Cấp {Math.floor(userRank.minPoints / 1000)}+
        </div>
      </div>

      {/* Category Filter Horizontal Scroll */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 16,
          scrollbarWidth: 'none',
        }}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                flex: '0 0 auto',
                padding: '8px 14px',
                borderRadius: 20,
                background: isSelected ? '#FF6B35' : '#1A1A2E',
                color: isSelected ? '#FFFFFF' : '#B0B0C3',
                border: isSelected ? '1px solid #FF6B35' : '1px solid #25253D',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Shop Items Grid (2 columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {filteredItems.map((item) => {
          const rarity = getRarityConfig(item.rarity);

          return (
            <AppCard
              key={item.id}
              onTap={() => setSelectedItem(item)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 14,
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div>
                {/* Rarity Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span
                    style={{
                      background: `${rarity.color}25`,
                      color: rarity.color,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {rarity.name}
                  </span>
                  {item.owned && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#2ED573' }}>
                      ✓ ĐÃ CÓ
                    </span>
                  )}
                </div>

                {/* Item Icon / Preview */}
                <div
                  style={{
                    height: 80,
                    borderRadius: 12,
                    background: '#25253D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 36,
                    marginBottom: 10,
                    border: `1px dashed ${rarity.color}60`,
                  }}
                >
                  {item.preview || (item.type === 'avatar_frame' ? '🖼️' : item.type === 'title' ? '🏷️' : '✨')}
                </div>

                {/* Title & Desc */}
                <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 11, color: '#B0B0C3', lineHeight: 1.4, minHeight: 32 }}>
                  {item.rarity.toUpperCase()} • {item.type.replace('_', ' ')}
                </div>
              </div>

              {/* Price / Action */}
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #25253D', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FF4757', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>💎</span> {item.price}
                </span>

                {item.owned ? (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#2ED573',
                    }}
                  >
                    Đã sở hữu
                  </span>
                ) : (
                  <span
                    style={{
                      background: 'rgba(255, 107, 53, 0.2)',
                      color: '#FF6B35',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: 8,
                    }}
                  >
                    Mua ngay
                  </span>
                )}
              </div>
            </AppCard>
          );
        })}
      </div>

      {/* Item Details / Purchase Modal */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 380,
              background: '#1A1A2E',
              borderRadius: 20,
              padding: 24,
              border: '1px solid #25253D',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button
                onClick={() => setSelectedItem(null)}
                style={{ background: 'none', border: 'none', color: '#6B6B80', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: 20,
                background: '#25253D',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 44,
                border: `2px solid ${getRarityConfig(selectedItem.rarity).color}`,
              }}
            >
              {selectedItem.preview || '🎁'}
            </div>

            <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
              {selectedItem.name}
            </div>

            <div style={{ fontSize: 13, color: '#B0B0C3', marginBottom: 16 }}>
              Vật phẩm trang bị phong cách {getRarityConfig(selectedItem.rarity).name} dành riêng cho bạn.
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
                fontSize: 20,
                fontWeight: 800,
                color: '#FF4757',
                marginBottom: 20,
              }}
            >
              <span>💎</span> {selectedItem.price} Ruby
            </div>

            {selectedItem.owned ? (
              <button
                disabled
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#25253D',
                  border: 'none',
                  borderRadius: 12,
                  color: '#2ED573',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                ✓ BẠN ĐÃ SỞ HỮU VẬT PHẨM NÀY
              </button>
            ) : (
              <button
                onClick={() => handleBuy(selectedItem)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
                  border: 'none',
                  borderRadius: 12,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(255, 107, 53, 0.4)',
                }}
              >
                XÁC NHẬN MUA
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
