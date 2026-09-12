import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ArrowLeft, Check } from 'lucide-react';
import { AppCard } from '../components/ui';

export const MembershipPage: React.FC = () => {
  const navigate = useNavigate();
  const { membership, upgradeMembership } = useUser();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'vip':
        return '#FFD700';
      case 'premium':
        return '#9B59B6';
      case 'basic':
        return '#3498DB';
      default:
        return '#6B6B80';
    }
  };

  const getTierEmoji = (tier: string) => {
    switch (tier) {
      case 'vip':
        return '👑';
      case 'premium':
        return '💎';
      case 'basic':
        return '⚡';
      default:
        return '🌱';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'vip':
        return 'VIP Pro';
      case 'premium':
        return 'Premium';
      case 'basic':
        return 'Cơ Bản';
      default:
        return 'Miễn Phí';
    }
  };

  const plans = [
    {
      id: 'free',
      tier: 'free' as const,
      name: 'Gói Miễn Phí',
      badge: 'Standard',
      price: '0đ',
      period: '/mãi mãi',
      color: '#6B6B80',
      bonus: 0,
      reduction: 0,
      perks: [
        'Nhận diện AI tối đa 3 bài/ngày',
        'Tham gia trận đấu thường',
        'Lưu lịch sử tập 7 ngày'
      ]
    },
    {
      id: 'basic',
      tier: 'basic' as const,
      name: 'Gói Cơ Bản',
      badge: 'Phổ biến',
      price: '49.000đ',
      period: '/tháng',
      color: '#3498DB',
      bonus: 10,
      reduction: 10,
      perks: [
        '+10% điểm thưởng toàn hệ thống',
        'Giảm 10% phí đấu trường',
        'Nhận diện AI không giới hạn',
        'Lưu lịch sử tập 30 ngày',
        '+20 Ruby tặng kèm'
      ]
    },
    {
      id: 'premium',
      tier: 'premium' as const,
      name: 'Gói Nâng Cao',
      badge: 'Nhiều Người Chọn',
      price: '99.000đ',
      period: '/tháng',
      color: '#9B59B6',
      bonus: 20,
      reduction: 25,
      perks: [
        '+20% điểm thưởng toàn hệ thống',
        'Giảm 25% phí đấu trường',
        'Phân tích góc khớp AI chuyên sâu',
        'Đồng bộ dữ liệu thời gian thực',
        '+50 Ruby tặng kèm',
        'Mở khóa Khung Avatar Tím'
      ]
    },
    {
      id: 'vip',
      tier: 'vip' as const,
      name: 'Gói VIP Pro',
      badge: '👑 Khuyên Dùng',
      price: '199.000đ',
      period: '/tháng',
      color: '#FF6B35',
      isPopular: true,
      bonus: 35,
      reduction: 50,
      perks: [
        '+35% điểm thưởng toàn hệ thống',
        'Giảm 50% phí đấu trường',
        'Mở khóa toàn bộ Khung Avatar & Danh hiệu VIP',
        'Phân tích góc khớp AI chuẩn thi đấu',
        'Tăng Stamina tối đa lên 500',
        '+100 Ruby tặng ngay lập tức',
        'Ưu tiên xếp trận với Master'
      ]
    }
  ];

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
            👑 Membership
          </h1>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: `${getTierColor(membership.tier)}20`,
            padding: '6px 14px',
            borderRadius: 20,
            border: `1px solid ${getTierColor(membership.tier)}50`
          }}
        >
          <span style={{ fontSize: 14 }}>{getTierEmoji(membership.tier)}</span>
          <span style={{ fontWeight: 700, color: getTierColor(membership.tier), fontSize: 13 }}>
            {getTierName(membership.tier)}
          </span>
        </div>
      </div>

      {/* Current Status Card */}
      <div
        style={{
          background: membership.tier !== 'free'
            ? 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)'
            : '#1A1A2E',
          borderRadius: 20,
          padding: 20,
          marginBottom: 24,
          color: '#FFFFFF',
          border: '1px solid #25253D',
          boxShadow: membership.tier !== 'free' ? '0 8px 24px rgba(255, 107, 53, 0.3)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              marginRight: 16
            }}
          >
            {getTierEmoji(membership.tier)}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              {getTierName(membership.tier)} Member
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)', marginTop: 2 }}>
              {membership.tier === 'free'
                ? 'Nâng cấp để mở khóa tính năng AI & bonus không giới hạn'
                : `Hạn sử dụng đến: ${membership.expiryDate || '2026-12-31'}`}
            </div>
          </div>
        </div>

        {/* Perks overview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            background: 'rgba(0, 0, 0, 0.2)',
            padding: 12,
            borderRadius: 12,
            textAlign: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.7)' }}>Bonus Điểm</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#FFD700', marginTop: 2 }}>
              +{membership.dailyBonusPercent}%
            </div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.15)', borderRight: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.7)' }}>Giảm Phí</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#2ED573', marginTop: 2 }}>
              -{membership.battleCostReduction}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.7)' }}>Sync AI</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>
              {membership.unlimitedSync ? 'Không giới hạn' : '3 bài/ngày'}
            </div>
          </div>
        </div>
      </div>

      {/* Plan List */}
      <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 14 }}>
        📦 Chọn Gói Membership
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {plans.map((p) => {
          const isCurrent = membership.tier === p.tier;

          return (
            <AppCard
              key={p.id}
              style={{
                border: p.isPopular ? '2px solid #FF6B35' : isCurrent ? `2px solid ${p.color}` : '1px solid #25253D',
                position: 'relative',
                padding: 20
              }}
            >
              {p.isPopular && (
                <div
                  style={{
                    position: 'absolute',
                    top: -12,
                    right: 16,
                    background: 'linear-gradient(135deg, #FF6B35, #FFD700)',
                    color: '#000000',
                    fontSize: 11,
                    fontWeight: 900,
                    padding: '3px 10px',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(255, 107, 53, 0.4)'
                  }}
                >
                  {p.badge}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
                    {p.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: p.color }}>
                      {p.price}
                    </span>
                    <span style={{ fontSize: 12, color: '#B0B0C3' }}>
                      {p.period}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${p.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22
                  }}
                >
                  {getTierEmoji(p.tier)}
                </div>
              </div>

              {/* Perks Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                {p.perks.map((perk, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Check size={16} color="#2ED573" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#B0B0C3' }}>{perk}</span>
                  </div>
                ))}
              </div>

              {/* Upgrade Button */}
              {isCurrent ? (
                <button
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#25253D',
                    border: 'none',
                    borderRadius: 12,
                    color: '#2ED573',
                    fontWeight: 700,
                    fontSize: 13
                  }}
                >
                  ✓ GÓI HIỆN TẠI
                </button>
              ) : (
                <button
                  onClick={() => upgradeMembership(p.tier as any)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: p.isPopular
                      ? 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)'
                      : 'linear-gradient(135deg, #5352ED 0%, #7070FF 100%)',
                    border: 'none',
                    borderRadius: 12,
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: p.isPopular ? '0 4px 14px rgba(255, 107, 53, 0.4)' : 'none'
                  }}
                >
                  NÂNG CẤP NGAY ({p.price})
                </button>
              )}
            </AppCard>
          );
        })}
      </div>
    </div>
  );
};
