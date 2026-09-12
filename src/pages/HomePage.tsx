import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Flame, Zap, Trophy, CheckCircle, Flag, Dumbbell } from 'lucide-react';
import { AppCard, AvatarWidget, XpProgressBar, ProgressBar } from '../components/ui';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, exercises, challenges, recentActivities, battles } = useUser();

  const pushupEx = exercises.find(e => e.type === 'pushup') || exercises[0];
  const pullupEx = exercises.find(e => e.type === 'pullup') || exercises[1];
  const walkingEx = exercises.find(e => e.type === 'walking') || exercises[2];

  const activeBattles = battles.filter(b => b.status === 'active' || b.status === 'waiting');

  return (
    <div style={{ padding: 16, maxWidth: 640, margin: '0 auto', paddingBottom: 90 }}>
      {/* Top Brand Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src="/Logo.png"
            alt="Fitness Battle"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              objectFit: 'contain',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span style={{ fontSize: 16, fontWeight: 900, color: '#FF6B35', letterSpacing: 0.5 }}>
            FITNESS BATTLE
          </span>
        </div>

        {/* Ruby Counter */}
        <div
          onClick={() => navigate('/shop')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: '#1A1A2E',
            padding: '6px 12px',
            borderRadius: 20,
            border: '1px solid #25253D',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 14 }}>💎</span>
          <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 13 }}>
            {user.ruby}
          </span>
        </div>
      </div>

      {/* Header User Info */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <AvatarWidget
          avatarUrl={user.avatar}
          size={56}
          onClick={() => navigate('/profile')}
        />
        <div style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Xin chào, {user.name}! 👋
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Flame size={16} color="#FF6B35" />
            <span style={{ fontSize: 13, color: '#B0B0C3' }}>
              {user.streak} ngày liên tiếp
            </span>
          </div>
        </div>
      </div>

      {/* XP Progress Card */}
      <AppCard style={{ marginBottom: 20 }}>
        <XpProgressBar
          currentXp={user.xp}
          xpToNextLevel={user.xpToNextLevel}
          level={user.level}
        />
      </AppCard>

      {/* Quick Stats Grid (3 columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {/* Coins */}
        <AppCard
          onTap={() => navigate('/shop')}
          style={{ textAlign: 'center', padding: '16px 12px' }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: '#F7C948',
            color: '#1A1A2E', fontWeight: 900, fontSize: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px'
          }}>
            $
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
            {user.coins.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
            Coins
          </div>
        </AppCard>

        {/* Stamina */}
        <AppCard style={{ textAlign: 'center', padding: '16px 12px' }}>
          <Zap size={28} color="#5352ED" style={{ margin: '0 auto 8px', display: 'block' }} />
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
            {user.stamina}/{user.maxStamina}
          </div>
          <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
            Stamina
          </div>
        </AppCard>

        {/* Rank */}
        <AppCard
          onTap={() => navigate('/ranking')}
          style={{ textAlign: 'center', padding: '16px 12px' }}
        >
          <Trophy size={28} color="#FF6B35" style={{ margin: '0 auto 8px', display: 'block' }} />
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
            #{user.rank}
          </div>
          <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
            Hạng
          </div>
        </AppCard>
      </div>

      {/* Exercise Quick Access */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
          💪 Tập Luyện Hôm Nay
        </span>
        <button
          onClick={() => navigate('/exercise')}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6B35',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Xem tất cả
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {/* Pushup */}
        <ExerciseQuickCard
          emoji="💪"
          name="Hít Đất"
          current={pushupEx?.todayCount || 35}
          target={pushupEx?.targetCount || 50}
          color="#FF6B35"
          onTap={() => navigate('/exercise')}
        />
        {/* Pullup */}
        <ExerciseQuickCard
          emoji="🏋️"
          name="Kéo Xà"
          current={pullupEx?.todayCount || 12}
          target={pullupEx?.targetCount || 20}
          color="#5352ED"
          onTap={() => navigate('/exercise')}
        />
        {/* Walking */}
        <ExerciseQuickCard
          emoji="🚶"
          name="Đi Bộ"
          current={walkingEx?.todayCount || 7500}
          target={walkingEx?.targetCount || 10000}
          color="#2ED573"
          onTap={() => navigate('/exercise')}
        />
      </div>

      {/* Weekly Stats Summary Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          color: '#FFFFFF',
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
            📊 Thống kê tuần này
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 2 }}>
            890 lần hít đất
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
            197 lần kéo xà
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 12,
            padding: '10px 14px',
            textAlign: 'center',
          }}
        >
          <Flame size={24} color="#FFFFFF" style={{ margin: '0 auto 4px', display: 'block' }} />
          <div style={{ fontWeight: 700, fontSize: 18 }}>14</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>Streak</div>
        </div>
      </div>

      {/* Active Battles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
          ⚔️ Trận đấu đang diễn ra
        </span>
        <button
          onClick={() => navigate('/battle')}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6B35',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Xem tất cả
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 24,
          scrollbarWidth: 'none',
        }}
      >
        {activeBattles.map((battle) => (
          <div
            key={battle.id}
            onClick={() => navigate('/battle')}
            style={{
              minWidth: 260,
              flex: '0 0 auto',
              background: 'linear-gradient(135deg, #FF4757 0%, #FF6B81 100%)',
              borderRadius: 16,
              padding: 16,
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{battle.title}</span>
              <span
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                LIVE
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{battle.players[0]?.userName || 'Bạn'}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
                  {battle.players[0]?.heartRate || 142} BPM
                </div>
              </div>

              <span style={{ fontWeight: 900, fontSize: 15, opacity: 0.9 }}>VS</span>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{battle.players[1]?.userName || 'Đối thủ'}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
                  {battle.players[1]?.heartRate || 138} BPM
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Challenges Today */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
          🏆 Thử thách hôm nay
        </span>
        <button
          onClick={() => navigate('/challenge')}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6B35',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Xem tất cả
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {challenges.slice(0, 3).map((ch) => {
          const color = ch.color || '#FF6B35';
          return (
            <AppCard key={ch.id} onTap={() => navigate('/challenge')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${color}25`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {ch.completed ? (
                    <CheckCircle size={24} color={color} />
                  ) : (
                    <Flag size={24} color={color} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF', marginBottom: 6 }}>
                    {ch.title}
                  </div>
                  <ProgressBar
                    progress={ch.current / Math.max(1, ch.target)}
                    color={color}
                    height={6}
                  />
                  <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 4 }}>
                    {ch.current}/{ch.target} {ch.unit}
                  </div>
                </div>
              </div>
            </AppCard>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>
        📊 Hoạt động gần đây
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {recentActivities.slice(0, 3).map((act) => (
          <AppCard key={act.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: '#25253D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Dumbbell size={22} color="#FF6B35" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#FFFFFF' }}>
                  {act.type}
                </div>
                <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
                  {act.duration} phút • {act.calories} cal
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#FF6B35' }}>
                  +{act.xp} XP
                </div>
                <div style={{ fontSize: 11, color: '#6B6B80', marginTop: 2 }}>
                  {act.date}
                </div>
              </div>
            </div>
          </AppCard>
        ))}
      </div>
    </div>
  );
};

interface ExerciseQuickCardProps {
  emoji: string;
  name: string;
  current: number;
  target: number;
  color: string;
  onTap: () => void;
}

const ExerciseQuickCard: React.FC<ExerciseQuickCardProps> = ({
  emoji,
  name,
  current,
  target,
  color,
  onTap,
}) => {
  const progress = Math.min(1, current / Math.max(1, target));

  return (
    <div
      onClick={onTap}
      style={{
        background: `${color}15`,
        borderRadius: 16,
        padding: 12,
        border: `1px solid ${color}45`,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'transform 0.15s ease',
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 4 }}>{emoji}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color, marginBottom: 4 }}>
        {name}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color }}>
        {current}
      </div>
      <div style={{ fontSize: 10, color: '#6B6B80', marginBottom: 6 }}>
        /{target}
      </div>
      {/* Progress Line */}
      <div style={{ height: 4, background: '#25253D', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${Math.round(progress * 100)}%`,
            background: color,
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
};
