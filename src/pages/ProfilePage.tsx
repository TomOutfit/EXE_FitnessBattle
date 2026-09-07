import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, LogOut, Crown, Flame, Zap, Award, Trophy, ShoppingBag, ChevronRight, ShieldCheck } from 'lucide-react';
import { Avatar, XpBar, BadgeIcon } from '../components/ui';
import { useUser } from '../context/UserContext';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, resetOnboarding, showToast } = useUser();
  const earnedBadges = user.badges.filter(b => b.earned);

  const totalBattles = user.winCount + user.loseCount;
  const winRate = totalBattles > 0 ? Math.round((user.winCount / totalBattles) * 100) : 100;

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'share':
        showToast('Link hồ sơ cá nhân đã được sao chép!', 'success');
        navigator.clipboard?.writeText('https://fitnessbattle.app/u/' + user.id);
        break;
      case 'logout':
        showToast('Đã đăng xuất. Hẹn gặp lại bạn!', 'info');
        setTimeout(() => resetOnboarding(), 1200);
        break;
      default:
        showToast('Tính năng đang được cập nhật', 'info');
    }
  };

  return (
    <div style={{ padding: '0 0 100px', maxWidth: 680, margin: '0 auto' }}>
      {/* Cover Banner */}
      <div style={{ background: 'linear-gradient(180deg, #14141e, var(--bg))', padding: '16px 20px 0', position: 'relative' }}>
        <div 
          style={{ 
            height: 120, 
            background: 'linear-gradient(135deg, #ff6b35, #ff4757, #5352ed)', 
            borderRadius: '20px', 
            position: 'relative', 
            overflow: 'hidden', 
            border: '1px solid rgba(255,107,53,0.3)', 
            boxShadow: '0 8px 24px rgba(255,107,53,0.2)' 
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(255,255,255,0.06) 12px, rgba(255,255,255,0.06) 24px)' }} />
          <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', borderRadius: 12, fontSize: 10, fontWeight: 800, color: '#ffd700', border: '1px solid rgba(255,215,0,0.3)' }}>
            🔥 CHIẾN BINH ID #{user.id || '88412'}
          </div>
        </div>

        {/* Avatar & Action Button */}
        <div style={{ marginTop: -45, padding: '0 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ position: 'relative' }}>
            <div 
              style={{
                padding: 4, 
                borderRadius: '50%',
                background: user.isVIP ? 'linear-gradient(135deg, #ffd700, #ff6b35)' : 'var(--gradient-primary)',
                boxShadow: '0 0 20px rgba(255,107,53,0.5)'
              }}
            >
              <Avatar src={user.avatar} alt={user.name} size={78} ring="transparent" />
            </div>
            {user.isVIP && (
              <div 
                style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  right: 0, 
                  width: 28, 
                  height: 28, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #ffd700, #ff6b35)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  border: '2px solid #0e0e1a', 
                  boxShadow: '0 0 10px #ffd700' 
                }}
              >
                <Crown size={15} color="#000" />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={() => handleMenuAction('share')} 
              style={{ 
                padding: '8px 14px', 
                borderRadius: 12, 
                background: 'rgba(255,215,0,0.12)', 
                border: '1px solid rgba(255,215,0,0.3)', 
                fontSize: 12, 
                fontWeight: 800, 
                color: '#ffd700', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6 
              }}
            >
              <Share2 size={14} /> Chia Sẻ
            </button>
          </div>
        </div>

        {/* Name, Title & Level XP */}
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>{user.name}</h1>
            {user.isVIP ? (
              <span style={{ fontSize: 10, padding: '2px 8px', background: 'linear-gradient(135deg, #ffd700, #ff6b35)', borderRadius: 10, color: '#000', fontWeight: 900 }}>
                HỘI VIÊN VIP
              </span>
            ) : (
              <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--text3)', fontWeight: 700 }}>
                MIỄN PHÍ
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, marginBottom: 12 }}>
            {user.equippedTitle || '⚔️ Đấu Sĩ Thể Lực Real-Time'}
          </div>

          <XpBar xp={user.xp} xpToNext={user.xpToNextLevel} level={user.level} />
        </div>
      </div>

      {/* Stats HUD */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Hạng Server', value: `#${user.rank}`, icon: Trophy, color: '#ffd700' },
            { label: 'Tỉ Lệ Thắng', value: `${winRate}%`, icon: Flame, color: '#ff6b35' },
            { label: 'Thắng/Thua', value: `${user.winCount}W-${user.loseCount}L`, icon: Award, color: '#2ed573' },
            { label: 'Thể Lực HP', value: `${user.stamina}⚡`, icon: Zap, color: '#5352ed' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div 
                key={i} 
                style={{ 
                  padding: '12px 6px', 
                  textAlign: 'center', 
                  background: 'linear-gradient(145deg, #181826, #10101a)', 
                  border: `1px solid ${stat.color}30`, 
                  borderRadius: 16 
                }}
              >
                <Icon size={16} color={stat.color} style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: 14, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 9, color: 'var(--text4)', marginTop: 2 }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Menu Shortcuts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          <div 
            onClick={() => navigate('/membership')}
            style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,107,53,0.08))',
              border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Crown size={20} color="#ffd700" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>Nâng Cấp VIP Pro</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Tăng thể lực 500 HP, mở khóa AI phân tích & đấu trường ruby</div>
              </div>
            </div>
            <ChevronRight size={18} color="#ffd700" />
          </div>

          <div 
            onClick={() => navigate('/shop')}
            style={{
              padding: '14px 16px',
              background: 'linear-gradient(135deg, rgba(83,82,237,0.12), rgba(46,213,115,0.08))',
              border: '1px solid rgba(83,82,237,0.3)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ShoppingBag size={20} color="#5352ed" />
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>Cửa Hàng Quà Tặng & Voucher</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Đổi {user.coins} Xu lấy voucher Gym, Thời trang, Dinh dưỡng</div>
              </div>
            </div>
            <ChevronRight size={18} color="#5352ed" />
          </div>
        </div>

        {/* Badges Collection */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>🏅 Bộ Sưu Tập Huy Hiệu ({earnedBadges.length}/{user.badges.length})</span>
          </div>
          <div style={{ padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, display: 'flex', gap: 14, overflowX: 'auto' }}>
            {earnedBadges.map(badge => (
              <div key={badge.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <BadgeIcon badgeId={badge.id} name={badge.name} color={badge.color} earned={true} size={40} />
                <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700 }}>{badge.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings & Logout */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={() => handleMenuAction('security')} 
            style={{ 
              flex: 1, 
              padding: '12px', 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border)', 
              borderRadius: 14, 
              fontSize: 13, 
              fontWeight: 700, 
              color: 'var(--text2)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 6 
            }}
          >
            <ShieldCheck size={16} color="#2ed573" /> Bảo Mật
          </button>

          <button 
            onClick={() => handleMenuAction('logout')} 
            style={{ 
              flex: 1, 
              padding: '12px', 
              background: 'rgba(255,71,87,0.1)', 
              border: '1px solid rgba(255,71,87,0.25)', 
              borderRadius: 14, 
              fontSize: 13, 
              fontWeight: 800, 
              color: '#ff4757', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 6 
            }}
          >
            <LogOut size={16} color="#ff4757" /> Đăng Xuất
          </button>
        </div>

      </div>
    </div>
  );
};
