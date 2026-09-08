import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Check, CheckCircle, X, Sparkles, Percent, RefreshCw } from 'lucide-react';

interface PlanDetail {
  id: string;
  name: string;
  emoji: string;
  durationDays: number;
  price: number;
  priceFormatted: string;
  color: string;
  isPopular?: boolean;
  features: string[];
  notIncluded: string[];
}

export const MembershipPage: React.FC = () => {
  const { user, upgradeToVIP, showToast } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<PlanDetail | null>(null);

  const plans: PlanDetail[] = [
    {
      id: 'basic',
      name: 'Basic',
      emoji: '🥉',
      durationDays: 30,
      price: 49000,
      priceFormatted: '49.000',
      color: '#3498DB',
      features: [
        '+10% điểm thưởng mỗi ngày',
        'Giảm 10% phí tham gia đấu trường',
        'Mở khóa phòng chờ riêng',
        'Lưu lịch sử tập 30 ngày'
      ],
      notIncluded: [
        'Không giới hạn đồng bộ thiết bị',
        'Phân tích góc khớp AI chuyên sâu'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      emoji: '🥈',
      durationDays: 90,
      price: 129000,
      priceFormatted: '129.000',
      color: '#9B59B6',
      isPopular: true,
      features: [
        '+20% điểm thưởng mỗi ngày',
        'Giảm 25% phí tham gia đấu trường',
        'Đồng bộ dữ liệu không giới hạn',
        'Phân tích tư thế AI thời gian thực',
        'Khung avatar & hiệu ứng riêng'
      ],
      notIncluded: [
        'Huấn luyện viên cá nhân AI 1v1'
      ]
    },
    {
      id: 'vip',
      name: 'VIP',
      emoji: '👑',
      durationDays: 365,
      price: 399000,
      priceFormatted: '399.000',
      color: '#F39C12',
      features: [
        '+35% điểm thưởng toàn hệ thống',
        'Giảm 50% phí tham gia đấu trường',
        'Đồng bộ dữ liệu thời gian thực',
        'Phân tích góc khớp AI chuẩn thi đấu',
        'Mở khóa toàn bộ Khung Avatar & Danh hiệu',
        'Hỗ trợ ưu tiên 24/7'
      ],
      notIncluded: []
    }
  ];

  const handleSubscribe = (plan: PlanDetail) => {
    upgradeToVIP();
    setSelectedPlan(null);
    showToast?.(`Chúc mừng bạn đã nâng cấp gói ${plan.name} thành công!`, 'success');
  };

  return (
    <div style={{ padding: 16, maxWidth: 640, margin: '0 auto', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
          👑 Membership
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: user.isVIP ? 'rgba(243, 156, 18, 0.2)' : '#1A1A2E',
            padding: '6px 12px',
            borderRadius: 20,
            border: user.isVIP ? '1px solid #F39C12' : '1px solid #25253D'
          }}
        >
          <span style={{ fontSize: 16 }}>{user.isVIP ? '👑' : '🌱'}</span>
          <span style={{ fontWeight: 600, color: user.isVIP ? '#F39C12' : '#B0B0C3', fontSize: 13 }}>
            {user.isVIP ? 'VIP Member' : 'Free Member'}
          </span>
        </div>
      </div>

      {/* Current Membership Status Banner */}
      {user.isVIP ? (
        <div
          style={{
            background: 'linear-gradient(135deg, #F39C12 0%, #E67E22 100%)',
            borderRadius: 20,
            padding: 20,
            color: '#FFFFFF',
            marginBottom: 24,
            boxShadow: '0 8px 24px rgba(243, 156, 18, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
                marginRight: 16
              }}
            >
              👑
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>VIP Member</div>
              <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', marginTop: 2 }}>
                Hết hạn: 31/12/2026
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 12,
              padding: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              textAlign: 'center'
            }}
          >
            <div>
              <Sparkles size={18} style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: 16, fontWeight: 700 }}>+35%</div>
              <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.8)' }}>Bonus Điểm</div>
            </div>
            <div style={{ width: 1, height: 30, background: 'rgba(255, 255, 255, 0.25)' }} />
            <div>
              <Percent size={18} style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: 16, fontWeight: 700 }}>-50%</div>
              <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.8)' }}>Giảm Phí</div>
            </div>
            <div style={{ width: 1, height: 30, background: 'rgba(255, 255, 255, 0.25)' }} />
            <div>
              <RefreshCw size={18} style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: 16, fontWeight: 700 }}>∞</div>
              <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.8)' }}>Sync</div>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: '#1A1A2E',
            borderRadius: 20,
            padding: 20,
            border: '1px solid #25253D',
            display: 'flex',
            alignItems: 'center',
            marginBottom: 24
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: '#25253D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              marginRight: 16
            }}
          >
            🌱
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
              Free Member
            </div>
            <div style={{ fontSize: 13, color: '#B0B0C3', marginTop: 2 }}>
              Nâng cấp để nhận nhiều ưu đãi độc quyền!
            </div>
          </div>
        </div>
      )}

      {/* Membership Plans List */}
      <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>
        📦 Gói Membership
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {plans.map((plan) => {
          const isCurrent = (plan.id === 'vip' && user.isVIP);

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              style={{
                background: '#1A1A2E',
                borderRadius: 16,
                padding: 16,
                border: plan.isPopular
                  ? `2px solid ${plan.color}`
                  : isCurrent
                    ? '2px solid #2ED573'
                    : '1px solid #25253D',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    background: `${plan.color}25`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    marginRight: 14,
                    flexShrink: 0
                  }}
                >
                  {plan.emoji}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
                      {plan.name}
                    </span>
                    {isCurrent && (
                      <span
                        style={{
                          background: 'rgba(46, 213, 115, 0.2)',
                          color: '#2ED573',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 8
                        }}
                      >
                        ĐANG DÙNG
                      </span>
                    )}
                    {plan.isPopular && (
                      <span
                        style={{
                          background: `${plan.color}25`,
                          color: plan.color,
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 8
                        }}
                      >
                        PHỔ BIẾN
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#B0B0C3', marginTop: 2 }}>
                    {plan.durationDays} ngày
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: plan.color }}>
                    {plan.priceFormatted}đ
                  </div>
                  <div style={{ fontSize: 11, color: '#6B6B80' }}>
                    /{plan.durationDays} ngày
                  </div>
                </div>
              </div>

              {/* Mini feature tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {plan.features.slice(0, 3).map((feat, i) => (
                  <span
                    key={i}
                    style={{
                      background: '#25253D',
                      color: '#B0B0C3',
                      fontSize: 11,
                      padding: '4px 8px',
                      borderRadius: 8
                    }}
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Perks section */}
      {user.isVIP && (
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>
            ✨ Quyền lợi của bạn
          </div>

          <div
            style={{
              background: '#1A1A2E',
              borderRadius: 16,
              padding: 16,
              border: '1px solid #25253D'
            }}
          >
            {[
              '+35% điểm thưởng toàn hệ thống',
              'Giảm 50% phí tham gia đấu trường',
              'Đồng bộ dữ liệu thời gian thực',
              'Phân tích góc khớp AI chuẩn thi đấu',
              'Mở khóa toàn bộ Khung Avatar & Danh hiệu',
              'Hỗ trợ ưu tiên 24/7'
            ].map((perk, i, arr) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'rgba(46, 213, 115, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Check size={14} color="#2ED573" />
                  </div>
                  <span style={{ fontSize: 14, color: '#FFFFFF' }}>{perk}</span>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ height: 1, background: '#25253D', margin: '6px 0' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Plan Details Modal Sheet */}
      {selectedPlan && (
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
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          onClick={() => setSelectedPlan(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 640,
              background: '#0F0F23',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: '16px 20px 32px',
              borderTop: '1px solid #25253D',
              boxShadow: '0 -8px 24px rgba(0,0,0,0.5)'
            }}
          >
            {/* Handle bar */}
            <div
              style={{
                width: 40,
                height: 4,
                background: '#6B6B80',
                borderRadius: 2,
                margin: '0 auto 16px'
              }}
            />

            {/* Plan Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: `${selectedPlan.color}25`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  marginRight: 16
                }}
              >
                {selectedPlan.emoji}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
                  {selectedPlan.name} Membership
                </div>
                <div style={{ fontSize: 13, color: '#B0B0C3' }}>
                  {selectedPlan.durationDays} ngày
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: selectedPlan.color }}>
                  {selectedPlan.priceFormatted}đ
                </div>
                <div style={{ fontSize: 11, color: '#6B6B80' }}>
                  /{selectedPlan.durationDays} ngày
                </div>
              </div>
            </div>

            {/* Features list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {selectedPlan.features.map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle size={18} color="#2ED573" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#FFFFFF' }}>{feature}</span>
                </div>
              ))}

              {selectedPlan.notIncluded.map((feature, idx) => (
                <div key={`not-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <X size={18} color="#6B6B80" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#6B6B80' }}>{feature}</span>
                </div>
              ))}
            </div>

            {/* Buy button */}
            <button
              onClick={() => handleSubscribe(selectedPlan)}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${selectedPlan.color} 0%, #FF6B35 100%)`,
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                marginBottom: 12,
                boxShadow: `0 4px 16px ${selectedPlan.color}40`
              }}
            >
              MUA NGAY
            </button>

            <button
              onClick={() => setSelectedPlan(null)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#6B6B80',
                fontSize: 15,
                cursor: 'pointer'
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
