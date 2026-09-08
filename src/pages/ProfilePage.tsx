import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
  Trophy,
  Swords,
  Flame,
  Dumbbell,
  Clock,
  Heart,
  Calendar,
  ChevronRight,
  Shield,
  Users,
  Award,
  Crown,
  Gift,
  ShoppingBag,
  Settings,
  X
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, buyRuby, resetOnboarding } = useUser();
  const [showBuyRubyModal, setShowBuyRubyModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const getBadgeIcon = (icon: string, color: string) => {
    switch (icon) {
      case 'shield':
        return <Shield size={24} color={color} />;
      case 'flame':
        return <Flame size={24} color={color} />;
      case 'trophy':
        return <Trophy size={24} color={color} />;
      case 'heart-pulse':
        return <Heart size={24} color={color} />;
      case 'users':
        return <Users size={24} color={color} />;
      case 'crown':
        return <Crown size={24} color={color} />;
      default:
        return <Award size={24} color={color} />;
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 640, margin: '0 auto', paddingBottom: 90 }}>
      {/* Profile Header Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
          borderRadius: 20,
          padding: 20,
          color: '#FFFFFF',
          marginBottom: 16,
          boxShadow: '0 8px 24px rgba(255, 107, 53, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          {/* Avatar with Level Badge */}
          <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
            <img
              src={user.avatar}
              alt={user.name}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                objectFit: 'cover',
                background: '#25253D',
                border: '3px solid rgba(255,255,255,0.4)'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#FF6B35',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: 26,
                height: 26,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 800,
                border: '2px solid #FFFFFF'
              }}
            >
              {user.level}
            </div>
          </div>

          {/* User Info */}
          <div style={{ marginLeft: 16, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 700 }}>{user.name}</span>
              {user.isVIP && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'rgba(255,255,255,0.2)',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 800
                  }}
                >
                  <span>💎</span> VIP
                </div>
              )}
            </div>

            {user.equippedTitle && (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
                {user.equippedTitle}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
              <Calendar size={14} />
              <span>Tham gia: {user.joinDate}</span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.9)', marginBottom: 6 }}>
            <span>Cấp {user.level}</span>
            <span>{user.xp} / {user.xpToNextLevel} XP</span>
          </div>
          <div style={{ height: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100))}%`,
                background: '#FFFFFF',
                borderRadius: 4,
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid (3 columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {/* Total Points */}
        <div
          style={{
            background: '#1A1A2E',
            borderRadius: 16,
            padding: 16,
            textAlign: 'center',
            border: '1px solid #25253D'
          }}
        >
          <Trophy size={28} color="#F7C948" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
            {user.totalPoints}
          </div>
          <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
            Tổng điểm
          </div>
        </div>

        {/* Matches */}
        <div
          style={{
            background: '#1A1A2E',
            borderRadius: 16,
            padding: 16,
            textAlign: 'center',
            border: '1px solid #25253D'
          }}
        >
          <Swords size={28} color="#FF6B35" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
            {user.winCount}W - {user.loseCount}L
          </div>
          <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
            Trận đấu
          </div>
        </div>

        {/* Streak */}
        <div
          style={{
            background: '#1A1A2E',
            borderRadius: 16,
            padding: 16,
            textAlign: 'center',
            border: '1px solid #25253D'
          }}
        >
          <Flame size={28} color="#FF4757" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
            {user.streak}
          </div>
          <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
            Streak
          </div>
        </div>
      </div>

      {/* Overview Stats Card */}
      <div
        style={{
          background: '#1A1A2E',
          borderRadius: 16,
          padding: 16,
          border: '1px solid #25253D',
          marginBottom: 16
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>
          📈 Thống kê tổng quan
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Workouts */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255, 107, 53, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}
            >
              <Dumbbell size={20} color="#FF6B35" />
            </div>
            <span style={{ fontSize: 14, color: '#B0B0C3', flex: 1 }}>
              Tổng bài tập
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>
              {user.stats?.totalWorkouts || 89}
            </span>
          </div>

          {/* Time */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(83, 82, 237, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}
            >
              <Clock size={20} color="#5352ED" />
            </div>
            <span style={{ fontSize: 14, color: '#B0B0C3', flex: 1 }}>
              Tổng thời gian
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>
              {user.stats?.totalMinutes || 2840} phút
            </span>
          </div>

          {/* Calories */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255, 71, 87, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}
            >
              <Flame size={20} color="#FF4757" />
            </div>
            <span style={{ fontSize: 14, color: '#B0B0C3', flex: 1 }}>
              Calories đốt
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>
              {user.stats?.totalCalories?.toLocaleString() || '42,500'}
            </span>
          </div>

          {/* Heart Rate */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(46, 213, 115, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}
            >
              <Heart size={20} color="#2ED573" />
            </div>
            <span style={{ fontSize: 14, color: '#B0B0C3', flex: 1 }}>
              Nhịp tim TB
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>
              {user.stats?.avgHeartRate || 135} BPM
            </span>
          </div>
        </div>
      </div>

      {/* Badges Card */}
      <div
        style={{
          background: '#1A1A2E',
          borderRadius: 16,
          padding: 16,
          border: '1px solid #25253D',
          marginBottom: 16
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>
          🏅 Huy hiệu
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {user.badges?.map((badge) => {
            const color = badge.color || '#FF6B35';
            return (
              <div
                key={badge.id}
                style={{
                  width: 82,
                  padding: 12,
                  borderRadius: 12,
                  background: badge.earned ? `${color}25` : '#25253D',
                  border: `1px solid ${badge.earned ? color : '#6B6B80'}`,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {getBadgeIcon(badge.icon, badge.earned ? color : '#6B6B80')}
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: badge.earned ? '#FFFFFF' : '#6B6B80',
                    marginTop: 6,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 70
                  }}
                >
                  {badge.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Menu List */}
      <div
        style={{
          background: '#1A1A2E',
          borderRadius: 16,
          border: '1px solid #25253D',
          overflow: 'hidden',
          marginBottom: 16
        }}
      >
        {/* Battle Pass */}
        <MenuItem
          icon={<Award size={22} color="#FF6B35" />}
          title="Battle Pass"
          subtitle="Mùa #7 — Cyber Sprint"
          onTap={() => navigate('/battlepass')}
        />
        <div style={{ height: 1, background: '#25253D' }} />

        {/* Vouchers */}
        <MenuItem
          icon={<Gift size={22} color="#FF6B35" />}
          title="Voucher của tôi"
          subtitle="3 voucher đang có"
          onTap={() => navigate('/shop')}
        />
        <div style={{ height: 1, background: '#25253D' }} />

        {/* Shop */}
        <MenuItem
          icon={<ShoppingBag size={22} color="#FF6B35" />}
          title="Cửa hàng"
          subtitle="Skin & Items"
          onTap={() => navigate('/shop')}
        />
        <div style={{ height: 1, background: '#25253D' }} />

        {/* Membership */}
        <MenuItem
          icon={<Crown size={22} color="#FF6B35" />}
          title="Membership"
          subtitle="Nâng cấp tài khoản"
          onTap={() => navigate('/membership')}
        />
        <div style={{ height: 1, background: '#25253D' }} />

        {/* Settings */}
        <MenuItem
          icon={<Settings size={22} color="#FF6B35" />}
          title="Cài đặt"
          subtitle="Tài khoản & Thông báo"
          onTap={() => setShowSettingsModal(true)}
        />
      </div>

      {/* Ruby Section */}
      <div
        style={{
          background: '#1A1A2E',
          borderRadius: 16,
          padding: 16,
          border: '1px solid #25253D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>💎</span>
          <div>
            <div style={{ fontSize: 12, color: '#B0B0C3' }}>Ruby</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
              {user.ruby}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowBuyRubyModal(true)}
          style={{
            background: 'linear-gradient(135deg, #FF4757 0%, #FF6B81 100%)',
            border: 'none',
            borderRadius: 10,
            padding: '8px 20px',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 71, 87, 0.3)'
          }}
        >
          Mua
        </button>
      </div>

      {/* Buy Ruby Modal */}
      {showBuyRubyModal && (
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
          onClick={() => setShowBuyRubyModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1A1A2E',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 380,
              border: '1px solid #25253D'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>💎 Mua Ruby</span>
              <button
                onClick={() => setShowBuyRubyModal(false)}
                style={{ background: 'none', border: 'none', color: '#6B6B80', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {[
                { amount: 50, price: '25.000đ' },
                { amount: 120, price: '59.000đ' },
                { amount: 300, price: '129.000đ' },
                { amount: 800, price: '299.000đ' }
              ].map((pack) => (
                <div
                  key={pack.amount}
                  onClick={() => {
                    buyRuby(pack.amount);
                    setShowBuyRubyModal(false);
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: '#25253D',
                    borderRadius: 12,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>💎</span>
                    <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{pack.amount} Ruby</span>
                  </div>
                  <span style={{ color: '#FF6B35', fontWeight: 600 }}>{pack.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
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
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1A1A2E',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 380,
              border: '1px solid #25253D'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>⚙️ Cài Đặt</span>
              <button
                onClick={() => setShowSettingsModal(false)}
                style={{ background: 'none', border: 'none', color: '#6B6B80', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <button
              onClick={() => {
                resetOnboarding();
                setShowSettingsModal(false);
                navigate('/onboarding');
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 71, 87, 0.15)',
                border: '1px solid rgba(255, 71, 87, 0.4)',
                borderRadius: 12,
                color: '#FF4757',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Đăng xuất / Reset tài khoản
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onTap: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, onTap }) => {
  return (
    <div
      onClick={onTap}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: 16,
        cursor: 'pointer'
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: '#25253D',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
          flexShrink: 0
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>{subtitle}</div>
      </div>

      <ChevronRight size={18} color="#6B6B80" />
    </div>
  );
};
