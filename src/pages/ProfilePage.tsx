import React, { useState } from 'react';
import { Share2, LogOut, Shield, Crown, Flame, Zap, Award, Trophy } from 'lucide-react';
import { Avatar, XpBar, BadgeIcon } from '../components/ui';
import { useUser } from '../context/UserContext';

export const ProfilePage: React.FC = () => {
  const { user, resetOnboarding } = useUser();
  const earnedBadges = user.badges.filter(b => b.earned);
  const [notification, setNotification] = useState<string | null>(null);

  const totalBattles = user.winCount + user.loseCount;
  const winRate = totalBattles > 0 ? Math.round((user.winCount / totalBattles) * 100) : 100;

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'share':
        setNotification('✅ Link Hồ Sơ Khoe Facebook đã sao chép!');
        navigator.clipboard?.writeText('https://fitnessbattle.app/u/' + user.id);
        break;
      case 'logout':
        if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
          resetOnboarding();
        }
        break;
      default:
        setNotification('Đang mở cài đặt...');
    }
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div style={{ padding: '0 0 100px' }}>
      {/* ── ESPORTS GAMER COVER BANNER ── */}
      <div style={{ background: 'linear-gradient(180deg, #14141e, var(--bg))', padding: '16px 20px 0', position: 'relative' }}>
        <div style={{ height: 110, background: 'linear-gradient(135deg, #ff6b35, #ff4757, #5352ed)', borderRadius: '20px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,107,53,0.3)', boxShadow: '0 8px 24px rgba(255,107,53,0.2)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(255,255,255,0.06) 12px, rgba(255,255,255,0.06) 24px)' }} />
          <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', borderRadius: 12, fontSize: 10, fontWeight: 800, color: '#ffd700', border: '1px solid rgba(255,215,0,0.3)' }}>
            🔥 GAMER ID #88412
          </div>
        </div>

        {/* Gamer Avatar & Flex Info */}
        <div style={{ marginTop: -40, padding: '0 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              padding: 4, borderRadius: '50%',
              background: user.isVIP ? 'linear-gradient(135deg, #ffd700, #ff6b35)' : 'var(--gradient-primary)',
              boxShadow: '0 0 20px rgba(255,107,53,0.5)'
            }}>
              <Avatar src={user.avatar} alt={user.name} size={76} ring="transparent" />
            </div>
            {user.isVIP && (
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #ffd700, #ff6b35)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0e0e1a', boxShadow: '0 0 10px #ffd700' }}>
                <Crown size={14} color="#000" />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => handleMenuAction('share')} style={{ padding: '8px 14px', borderRadius: 12, background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', fontSize: 11, fontWeight: 800, color: '#ffd700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Share2 size={14} /> Khoe Facebook
            </button>
          </div>
        </div>

        {/* Name & Title */}
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>{user.name}</h1>
            {user.isVIP ? (
              <span style={{ fontSize: 9, padding: '2px 8px', background: 'linear-gradient(135deg, #ffd700, #ff6b35)', borderRadius: 10, color: '#000', fontWeight: 900 }}>PRO VIP</span>
            ) : (
              <span style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: 10, color: 'var(--text3)', fontWeight: 700 }}>FREE USER</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, marginBottom: 10 }}>
            {user.equippedTitle || '⚔️ Đấu Sĩ Thể Thao Real-Time'}
          </div>

          <XpBar xp={user.xp} xpToNext={user.xpToNextLevel} level={user.level} />
        </div>
      </div>

      {/* ── ESPORTS STATS HUD ── */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Hạng Server', value: `#${user.rank}`, icon: Trophy, color: '#ffd700' },
            { label: 'Tỷ Lệ Thắng', value: `${winRate}%`, icon: Flame, color: '#ff6b35' },
            { label: 'Thắng/Thua', value: `${user.winCount}W-${user.loseCount}L`, icon: Award, color: '#2ed573' },
            { label: 'Thể Lực HP', value: `${user.stamina}⚡`, icon: Zap, color: '#5352ed' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} style={{ padding: '12px 8px', textAlign: 'center', background: 'linear-gradient(145deg, #181826, #10101a)', border: `1px solid ${stat.color}30`, borderRadius: 16 }}>
                <Icon size={16} color={stat.color} style={{ margin: '0 auto 4px' }} />
                <div style={{ fontSize: 15, fontWeight: 900, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 9, color: 'var(--text4)', marginTop: 2 }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── SKIN KHUNG AVATAR FLEX HUB ── */}
        <div style={{ marginBottom: 18, padding: 14, background: 'linear-gradient(145deg, rgba(255,107,53,0.08), rgba(83,82,237,0.08))', border: '1px solid rgba(255,107,53,0.25)', borderRadius: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🎨 Khung Avatar Flex Facebook:</span>
            <span style={{ fontSize: 9, color: 'var(--primary)', padding: '2px 6px', background: 'rgba(255,107,53,0.15)', borderRadius: 6 }}>VIP UNLOCKED</span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { name: '🔥 Rồng Lửa VIP', active: user.isVIP },
              { name: '⚡ Neon Cyber', active: true },
              { name: '🏆 Top 1 Hào Quang', active: false },
            ].map((skin, idx) => (
              <div key={idx} style={{
                flex: 1, padding: '8px 4px', textAlign: 'center', borderRadius: 12,
                background: skin.active ? 'rgba(255,107,53,0.18)' : 'var(--bg3)',
                border: `1px solid ${skin.active ? 'var(--primary)' : 'var(--border)'}`,
                fontSize: 10, fontWeight: 700, color: skin.active ? 'var(--primary)' : 'var(--text4)',
                cursor: 'pointer'
              }}>
                {skin.name}
              </div>
            ))}
          </div>
        </div>

        {/* ── HUY HIỆU ĐÃ ĐẠT ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>
            🏅 Huy Hiệu Game Đạt Được ({earnedBadges.length}/{user.badges.length})
          </div>
          <div style={{ padding: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, display: 'flex', gap: 12, overflowX: 'auto' }}>
            {earnedBadges.map(badge => (
              <div key={badge.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <BadgeIcon badgeId={badge.id} name={badge.name} color={badge.color} earned={true} size={36} />
                <span style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 600 }}>{badge.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CÀI ĐẶT & TÀI KHOẢN TINH GỌN ── */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => handleMenuAction('security')} style={{ flex: 1, padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, fontSize: 12, fontWeight: 700, color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Shield size={14} color="#2ed573" /> Bảo mật
          </button>

          <button onClick={() => handleMenuAction('logout')} style={{ flex: 1, padding: '12px', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.25)', borderRadius: 14, fontSize: 12, fontWeight: 800, color: '#ff4757', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <LogOut size={14} color="#ff4757" /> Đăng xuất
          </button>
        </div>

      </div>

      {/* Notification Toast */}
      {notification && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card3)', border: '1px solid var(--primary)', borderRadius: 14, padding: '12px 20px', zIndex: 300, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', animation: 'fadeInUp 0.3s ease-out', whiteSpace: 'nowrap', color: 'var(--text)', fontSize: 12, fontWeight: 700 }}>
          {notification}
        </div>
      )}
    </div>
  );
};

