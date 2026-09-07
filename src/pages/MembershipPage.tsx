import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, ArrowLeft, Zap, Star } from 'lucide-react';
import { membershipPlans } from '../data/mockData';
import { useUser } from '../context/UserContext';

export const MembershipPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, upgradeToVIP, showToast } = useUser();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>(user.isVIP ? 'vip' : 'vip');

  const handleSubscribe = (planId: string) => {
    if (planId === 'free') {
      showToast('Bạn đang sử dụng Gói Miễn Phí', 'info');
      return;
    }
    upgradeToVIP();
    showToast('🎉 Nâng cấp Gói VIP Pro thành công! Thể lực tối đa tăng lên 500 & Nhận ngay +100 Ruby!', 'success');
  };

  return (
    <div style={{ padding: '0 0 80px', maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px 20px', background: 'linear-gradient(180deg, #14141e, var(--bg))', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text)'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Crown size={22} color="#ffd700" /> Gói Hội Viên VIP
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Mở khóa toàn bộ tiềm năng tập luyện cùng AI</p>
          </div>
        </div>

        {/* Current VIP Status Card */}
        {user.isVIP && (
          <div
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,107,53,0.1))',
              border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Crown size={20} color="#ffd700" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#ffd700' }}>Bạn đang là Hội Viên VIP Pro</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Hạn sử dụng: Vĩnh viễn (Bản MVP Demo)</div>
              </div>
            </div>
            <div style={{ padding: '4px 10px', background: 'rgba(255,215,0,0.2)', borderRadius: 20, fontSize: 11, fontWeight: 800, color: '#ffd700' }}>
              ĐANG HOẠT ĐỘNG
            </div>
          </div>
        )}

        {/* Billing Cycle Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: !isYearly ? 'var(--text)' : 'var(--text3)' }}>Theo Tháng</span>
          <button
            onClick={() => setIsYearly(prev => !prev)}
            style={{
              width: 50,
              height: 26,
              borderRadius: 14,
              background: isYearly ? 'var(--gradient-primary)' : 'var(--bg4)',
              border: 'none',
              padding: 3,
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s'
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transform: isYearly ? 'translateX(24px)' : 'translateX(0)',
                transition: 'transform 0.2s'
              }}
            />
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, color: isYearly ? 'var(--text)' : 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
            Theo Năm <span style={{ fontSize: 10, background: 'rgba(46,213,115,0.2)', color: '#2ed573', padding: '2px 6px', borderRadius: 6 }}>-25%</span>
          </span>
        </div>
      </div>

      {/* Plan Cards */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {membershipPlans.map(plan => {
          const isSelected = selectedPlan === plan.id;
          const isCurrentActive = (plan.id === 'vip' && user.isVIP) || (plan.id === 'free' && !user.isVIP);

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                background: isSelected ? 'linear-gradient(145deg, #181826, #222238)' : 'linear-gradient(145deg, #14141e, #1a1a28)',
                border: isSelected ? `2px solid ${plan.color}` : '1px solid var(--border)',
                borderRadius: 20,
                padding: 20,
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isSelected ? `0 8px 24px ${plan.color}25` : 'none'
              }}
            >
              {plan.isPopular && (
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    background: 'linear-gradient(135deg, #ff6b35, #ff4757)',
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 800,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Star size={10} fill="#fff" /> KHUYÊN DÙNG
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>{plan.name}</h3>
                <span style={{ fontSize: 11, color: plan.color, fontWeight: 800, textTransform: 'uppercase' }}>{plan.badge}</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: plan.color }}>
                  {isYearly ? plan.priceYearly : plan.priceMonthly}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {plan.features.map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text2)' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${plan.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={12} color={plan.color} />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubscribe(plan.id);
                }}
                disabled={isCurrentActive}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 14,
                  background: isCurrentActive ? 'var(--bg4)' : plan.id === 'free' ? 'var(--bg3)' : `linear-gradient(135deg, ${plan.color}, #ff4757)`,
                  border: 'none',
                  color: isCurrentActive ? 'var(--text4)' : '#fff',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: isCurrentActive ? 'default' : 'pointer',
                  boxShadow: !isCurrentActive && plan.id !== 'free' ? `0 4px 16px ${plan.color}40` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                {isCurrentActive ? (
                  <span>Gói Hiện Tại</span>
                ) : plan.id === 'free' ? (
                  <span>Chọn Gói Này</span>
                ) : (
                  <>
                    <Zap size={16} fill="#fff" /> Nâng Cấp Ngay
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
