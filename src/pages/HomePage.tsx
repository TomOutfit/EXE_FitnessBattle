import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Flame, Coins, Zap, Trophy, CheckCircle, Flag, Dumbbell } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, exercises, challenges, recentActivities, battles } = useUser();

  const pushupEx = exercises.find(e => e.type === 'pushup') || exercises[0];
  const pullupEx = exercises.find(e => e.type === 'pullup') || exercises[1];
  const walkingEx = exercises.find(e => e.type === 'walking') || exercises[2];

  const activeBattles = battles.filter(b => b.status === 'active' || b.status === 'waiting');

  return (
    <div style={{ padding: '16px', maxWidth: 640, margin: '0 auto', paddingBottom: 90 }}>
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
              filter: 'drop-shadow(0 0 6px rgba(255, 107, 53, 0.4))'
            }} 
          />
          <span style={{ fontSize: 16, fontWeight: 900, background: 'linear-gradient(135deg, #FF6B35, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: 0.5 }}>
            FITNESS BATTLE
          </span>
        </div>
        {/* Ruby Counter */}
        <div
          onClick={() => navigate('/shop')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#1A1A2E',
            padding: '6px 14px',
            borderRadius: 20,
            cursor: 'pointer',
            border: '1px solid #25253D'
          }}
        >
          <span style={{ fontSize: 15 }}>💎</span>
          <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 13 }}>
            {user.ruby}
          </span>
        </div>
      </div>

      {/* User Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        {/* Avatar */}
        <div 
          style={{ position: 'relative', width: 56, height: 56, cursor: 'pointer', flexShrink: 0 }}
          onClick={() => navigate('/profile')}
        >
          <img
            src={user.avatar}
            alt={user.name}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #25253D',
              background: '#25253D'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: '#FF6B35',
              color: '#FFFFFF',
              borderRadius: 10,
              padding: '1px 5px',
              fontSize: 10,
              fontWeight: 800,
              border: '2px solid #0F0F23'
            }}
          >
            {user.level}
          </div>
        </div>

        {/* User Info */}
        <div style={{ marginLeft: 12, flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
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
      <div
        style={{
          background: '#1A1A2E',
          borderRadius: 16,
          padding: 16,
          border: '1px solid #25253D',
          marginBottom: 20
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B35, #FF8E53)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: 12
              }}
            >
              {user.level}
            </div>
            <span style={{ fontWeight: 600, color: '#FFFFFF', fontSize: 14 }}>
              Cấp {user.level}
            </span>
          </div>
          <span style={{ color: '#B0B0C3', fontSize: 12 }}>
            {user.xp} / {user.xpToNextLevel} XP
          </span>
        </div>
        {/* Progress Bar */}
        <div style={{ height: 8, background: '#25253D', borderRadius: 4, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100))}%`,
              background: 'linear-gradient(90deg, #FF6B35, #FF8E53)',
              borderRadius: 4,
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {/* Coins */}
        <div
          onClick={() => navigate('/shop')}
          style={{
            background: '#1A1A2E',
            borderRadius: 16,
            padding: 16,
            textAlign: 'center',
            border: '1px solid #25253D',
            cursor: 'pointer'
          }}
        >
          <Coins size={28} color="#F7C948" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
            {user.coins}
          </div>
          <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
            Coins
          </div>
        </div>

        {/* Stamina */}
        <div
          style={{
            background: '#1A1A2E',
            borderRadius: 16,
            padding: 16,
            textAlign: 'center',
            border: '1px solid #25253D'
          }}
        >
          <Zap size={28} color="#5352ED" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
            {user.stamina}/{user.maxStamina}
          </div>
          <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
            Stamina
          </div>
        </div>

        {/* Rank */}
        <div
          onClick={() => navigate('/ranking')}
          style={{
            background: '#1A1A2E',
            borderRadius: 16,
            padding: 16,
            textAlign: 'center',
            border: '1px solid #25253D',
            cursor: 'pointer'
          }}
        >
          <Trophy size={28} color="#FF6B35" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>
            #{user.rank}
          </div>
          <div style={{ fontSize: 12, color: '#B0B0C3', marginTop: 2 }}>
            Hạng
          </div>
        </div>
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
            cursor: 'pointer'
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
          current={pushupEx?.todayCount || 0}
          target={pushupEx?.targetCount || 50}
          color="#FF6B35"
          onTap={() => navigate('/exercise')}
        />
        {/* Pullup */}
        <ExerciseQuickCard
          emoji="🏋️"
          name="Kéo Xà"
          current={pullupEx?.todayCount || 0}
          target={pullupEx?.targetCount || 20}
          color="#5352ED"
          onTap={() => navigate('/exercise')}
        />
        {/* Walking */}
        <ExerciseQuickCard
          emoji="🚶"
          name="Đi Bộ"
          current={walkingEx?.todayCount || 0}
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
          color: '#FFFFFF'
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
            📊 Thống kê tuần này
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 2 }}>
            {(pushupEx?.todayCount || 0) + 120} lần hít đất
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
            {(pullupEx?.todayCount || 0) + 45} lần kéo xà
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 12,
            padding: '10px 14px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Flame size={24} color="#FFFFFF" />
          <div style={{ fontWeight: 700, fontSize: 18, color: '#FFFFFF', marginTop: 2 }}>
            {user.streak}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>
            Streak
          </div>
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
            cursor: 'pointer'
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
          scrollbarWidth: 'none'
        }}
      >
        {activeBattles.map((battle) => (
          <div
            key={battle.id}
            onClick={() => navigate('/battle')}
            style={{
              minWidth: 280,
              background: 'linear-gradient(135deg, #FF4757 0%, #FF6B81 100%)',
              borderRadius: 16,
              padding: 16,
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 14 }}>
                {battle.title}
              </span>
              <span
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#FFFFFF'
                }}
              >
                {battle.status === 'active' ? 'LIVE' : 'CHỜ'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: 13 }}>
                  {battle.players[0]?.userName || 'Người chơi 1'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
                  {battle.players[0]?.heartRate || 135} BPM
                </div>
              </div>

              <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 16, padding: '0 8px' }}>
                VS
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: 13 }}>
                  {battle.players[1]?.userName || 'Người chơi 2'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
                  {battle.players[1]?.heartRate || 140} BPM
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Challenges */}
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
            cursor: 'pointer'
          }}
        >
          Xem tất cả
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {challenges.slice(0, 3).map((ch) => {
          const pct = Math.min(100, Math.round((ch.current / ch.target) * 100));
          return (
            <div
              key={ch.id}
              onClick={() => navigate('/challenge')}
              style={{
                background: '#1A1A2E',
                borderRadius: 16,
                padding: 16,
                border: '1px solid #25253D',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${ch.color}25`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {ch.completed ? (
                  <CheckCircle size={24} color={ch.color} />
                ) : (
                  <Flag size={24} color={ch.color} />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: 14, marginBottom: 6 }}>
                  {ch.title}
                </div>
                <div style={{ height: 6, background: '#25253D', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: ch.color,
                      borderRadius: 3
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, color: '#B0B0C3' }}>
                  {ch.current}/{ch.target} {ch.unit}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>
        📊 Hoạt động gần đây
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {recentActivities.slice(0, 3).map((act) => (
          <div
            key={act.id}
            style={{
              background: '#1A1A2E',
              borderRadius: 16,
              padding: 16,
              border: '1px solid #25253D',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#25253D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Dumbbell size={22} color="#FF6B35" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: 14 }}>
                {act.type}
              </div>
              <div style={{ fontSize: 13, color: '#B0B0C3', marginTop: 2 }}>
                {act.duration} phút • {act.calories} cal
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, color: '#FF6B35', fontSize: 14 }}>
                +{act.xp} XP
              </div>
              <div style={{ fontSize: 11, color: '#6B6B80', marginTop: 2 }}>
                {act.date}
              </div>
            </div>
          </div>
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
  onTap
}) => {
  const pct = Math.min(1, current / target);

  return (
    <div
      onClick={onTap}
      style={{
        background: `${color}15`,
        border: `1px solid ${color}45`,
        borderRadius: 16,
        padding: 12,
        textAlign: 'center',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
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
      <div style={{ width: '100%', height: 4, background: '#25253D', borderRadius: 2, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct * 100}%`,
            background: color,
            borderRadius: 2
          }}
        />
      </div>
    </div>
  );
};
