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
  Shield,
  Users,
  Award,
  Crown,
  Gift,
  ShoppingBag,
  X,
  Mail,
  Database,
  UserCheck,
  LogOut
} from 'lucide-react';
import { AppCard, AvatarWidget, XpProgressBar, StatRow, MenuItem } from '../components/ui';
import { SwitchAccountModal } from '../components/modals/SwitchAccountModal';
import { DatabaseManagerModal } from '../components/modals/DatabaseManagerModal';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, buyRuby, resetOnboarding, showToast } = useUser();

  const [showBuyRubyModal, setShowBuyRubyModal] = useState(false);
  const [showSwitchAccountModal, setShowSwitchAccountModal] = useState(false);
  const [showDatabaseManagerModal, setShowDatabaseManagerModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  const handleLogout = () => {
    resetOnboarding();
    setShowLogoutConfirm(false);
    showToast('Đã đăng xuất thành công', 'info');
    navigate('/auth');
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
          boxShadow: '0 8px 24px rgba(255, 107, 53, 0.35)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          {/* Avatar with Level Badge */}
          <AvatarWidget
            avatarUrl={user.avatar}
            size={80}
            level={user.level}
            isVIP={user.isVIP}
            showBorder
            borderColor="#FFFFFF"
          />

          {/* User Info */}
          <div style={{ marginLeft: 16, flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </span>
              {user.isVIP && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    background: 'rgba(255, 255, 255, 0.25)',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 10,
                    fontWeight: 900
                  }}
                >
                  <span>💎</span> VIP
                </div>
              )}
            </div>

            {user.equippedTitle && (
              <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.9)', marginTop: 2 }}>
                {user.equippedTitle}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 11, color: 'rgba(255, 255, 255, 0.8)' }}>
              <Mail size={12} />
              <span>{user.email || 'demo@fitnessbattle.vn'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, fontSize: 11, color: 'rgba(255, 255, 255, 0.8)' }}>
              <Calendar size={12} />
              <span>Tham gia: {user.joinDate || '2026-01-15'}</span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <XpProgressBar
          currentXp={user.xp}
          xpToNextLevel={user.xpToNextLevel}
          level={user.level}
        />
      </div>

      {/* Stats Grid (3 columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {/* Total Points */}
        <AppCard style={{ textAlign: 'center', padding: 16 }}>
          <Trophy size={28} color="#F7C948" style={{ margin: '0 auto 8px', display: 'block' }} />
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
            {user.totalPoints.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
            Tổng điểm
          </div>
        </AppCard>

        {/* Matches */}
        <AppCard style={{ textAlign: 'center', padding: 16 }}>
          <Swords size={28} color="#FF6B35" style={{ margin: '0 auto 8px', display: 'block' }} />
          <div style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF' }}>
            {user.winCount}W - {user.loseCount}L
          </div>
          <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
            Trận đấu
          </div>
        </AppCard>

        {/* Streak */}
        <AppCard style={{ textAlign: 'center', padding: 16 }}>
          <Flame size={28} color="#FF4757" style={{ margin: '0 auto 8px', display: 'block' }} />
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
            {user.streak}
          </div>
          <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
            Streak
          </div>
        </AppCard>
      </div>

      {/* Overview Stats Card */}
      <AppCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>
          📈 Thống kê tổng quan
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <StatRow
            icon={<Dumbbell size={20} color="#FF6B35" />}
            label="Tổng bài tập"
            value={user.stats?.totalWorkouts || 89}
            color="#FF6B35"
          />
          <StatRow
            icon={<Clock size={20} color="#5352ED" />}
            label="Tổng thời gian"
            value={`${user.stats?.totalMinutes || 2840} phút`}
            color="#5352ED"
          />
          <StatRow
            icon={<Flame size={20} color="#FF4757" />}
            label="Calories đốt"
            value={user.stats?.totalCalories?.toLocaleString() || '42,500'}
            color="#FF4757"
          />
          <StatRow
            icon={<Heart size={20} color="#2ED573" />}
            label="Nhịp tim TB"
            value={`${user.stats?.avgHeartRate || 135} BPM`}
            color="#2ED573"
          />
        </div>
      </AppCard>

      {/* Badges Card */}
      <AppCard style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', marginBottom: 16 }}>
          🏅 Huy hiệu
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {user.badges?.map((badge) => {
            const color = badge.color || '#FF6B35';
            return (
              <div
                key={badge.id}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: badge.earned ? `${color}20` : '#25253D',
                  border: `1px solid ${badge.earned ? color : '#25253D'}`,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {getBadgeIcon(badge.icon, badge.earned ? color : '#6B6B80')}
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: badge.earned ? '#FFFFFF' : '#6B6B80',
                    marginTop: 6,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 80
                  }}
                >
                  {badge.name}
                </div>
              </div>
            );
          })}
        </div>
      </AppCard>

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
        <MenuItem
          icon={<Award size={22} color="#FF6B35" />}
          title="Battle Pass"
          subtitle="Mùa #7 — Cyber Sprint"
          onTap={() => navigate('/battle-pass')}
        />
        <div style={{ height: 1, background: '#25253D' }} />

        <MenuItem
          icon={<Gift size={22} color="#F7C948" />}
          title="Voucher của tôi"
          subtitle="3 voucher đang có"
          onTap={() => navigate('/shop')}
        />
        <div style={{ height: 1, background: '#25253D' }} />

        <MenuItem
          icon={<ShoppingBag size={22} color="#3498DB" />}
          title="Cửa hàng"
          subtitle="Skin & Items"
          onTap={() => navigate('/shop')}
        />
        <div style={{ height: 1, background: '#25253D' }} />

        <MenuItem
          icon={<Crown size={22} color="#FFD700" />}
          title="Membership"
          subtitle="Nâng cấp tài khoản"
          onTap={() => navigate('/membership')}
        />
        <div style={{ height: 1, background: '#25253D' }} />

        {/* Database Manager */}
        <MenuItem
          icon={<Database size={22} color="#2ED573" />}
          title="Quản lý Cơ Sở Dữ Liệu"
          subtitle="Xem bảng, chỉnh sửa & Đặt lại CSDL"
          onTap={() => setShowDatabaseManagerModal(true)}
        />
        <div style={{ height: 1, background: '#25253D' }} />

        {/* Switch Account */}
        <MenuItem
          icon={<UserCheck size={22} color="#5352ED" />}
          title="Chuyển Đổi Tài Khoản"
          subtitle="Chuyển nhanh giữa Demo & VIP Pro"
          onTap={() => setShowSwitchAccountModal(true)}
        />
        <div style={{ height: 1, background: '#25253D' }} />

        {/* Logout */}
        <MenuItem
          icon={<LogOut size={22} color="#FF4757" />}
          title="Đăng Xuất"
          subtitle="Thoát khỏi phiên đăng nhập hiện tại"
          textColor="#FF4757"
          onTap={() => setShowLogoutConfirm(true)}
        />
      </div>

      {/* Ruby Currency Section */}
      <AppCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 26 }}>💎</span>
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
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 71, 87, 0.35)'
          }}
        >
          Mua
        </button>
      </AppCard>

      {/* Buy Ruby Modal */}
      {showBuyRubyModal && (
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
            padding: 16
          }}
          onClick={() => setShowBuyRubyModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 380,
              background: '#1A1A2E',
              borderRadius: 20,
              padding: 24,
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
                    showToast(`Đã nạp thành công +${pack.amount} Ruby!`, 'success');
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
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
            padding: 16
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 360,
              background: '#1A1A2E',
              borderRadius: 20,
              padding: 24,
              border: '1px solid #25253D',
              textAlign: 'center'
            }}
          >
            <LogOut size={40} color="#FF4757" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>
              Đăng Xuất?
            </div>
            <div style={{ fontSize: 13, color: '#B0B0C3', marginBottom: 20 }}>
              Bạn có chắc chắn muốn thoát khỏi phiên đăng nhập hiện tại?
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#FF4757',
                  border: 'none',
                  borderRadius: 12,
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Đăng Xuất
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#25253D',
                  border: 'none',
                  borderRadius: 12,
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Switch Account Modal */}
      <SwitchAccountModal
        isOpen={showSwitchAccountModal}
        onClose={() => setShowSwitchAccountModal(false)}
      />

      {/* Database Manager Modal */}
      <DatabaseManagerModal
        isOpen={showDatabaseManagerModal}
        onClose={() => setShowDatabaseManagerModal(false)}
      />
    </div>
  );
};
