import { ChevronRight, Zap, Trophy, ShoppingBag, Crown, Play, Flame, Dumbbell, Footprints, Target } from 'lucide-react';
import { leaderboard, exercises } from '../data/mockData';
import { Avatar } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  const dayPart = hour < 12 ? '👋' : hour < 18 ? '💪' : '🌙';

  return (
    <div style={{ paddingBottom: 90, maxWidth: 680, margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ background: 'linear-gradient(180deg, #14141e, var(--bg))', padding: '16px 20px 0', position: 'sticky', top: 0, zIndex: 50 }}>
        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => navigate('/profile')}
          >
            <Avatar src={user.avatar} alt={user.name} size={46} online level={user.level} isVIP={user.isVIP} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {greeting} {dayPart}
                {user.isVIP && (
                  <span style={{ fontSize: 10, padding: '2px 8px', background: 'linear-gradient(135deg, #ffd700, #ff6b35)', borderRadius: 10, color: '#000', fontWeight: 900 }}>
                    VIP
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                {user.name} • Cấp {user.level} • {user.totalPoints.toLocaleString()} pts
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/profile')} 
            style={{ 
              width: 38, 
              height: 38, 
              borderRadius: 12, 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer' 
            }}
          >
            <span style={{ fontSize: 18 }}>👤</span>
          </button>
        </div>

        {/* Currency & Stamina Resource Bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {/* Stamina Bar */}
          <div 
            style={{ 
              flex: 1.2, 
              padding: '8px 10px', 
              background: 'rgba(255,107,53,0.1)', 
              border: '1px solid rgba(255,107,53,0.25)', 
              borderRadius: 14, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={15} color="var(--primary)" />
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)' }}>
                {user.stamina}/{user.maxStamina} HP
              </span>
            </div>
            {!user.isVIP && (
              <button 
                onClick={() => navigate('/membership')} 
                style={{ 
                  fontSize: 10, 
                  padding: '2px 8px', 
                  background: 'var(--gradient-primary)', 
                  border: 'none', 
                  borderRadius: 8, 
                  color: '#fff', 
                  fontWeight: 800, 
                  cursor: 'pointer' 
                }}
              >
                +VIP
              </button>
            )}
          </div>

          {/* Ruby Currency */}
          <div 
            style={{ 
              flex: 1, 
              padding: '8px 10px', 
              background: 'rgba(83,82,237,0.1)', 
              border: '1px solid rgba(83,82,237,0.25)', 
              borderRadius: 14, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              cursor: 'pointer' 
            }} 
            onClick={() => navigate('/shop')}
          >
            <span style={{ fontSize: 14 }}>💎</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#5352ed' }}>{user.ruby} Ruby</span>
          </div>

          {/* Coins / Points */}
          <div 
            style={{ 
              flex: 1, 
              padding: '8px 10px', 
              background: 'rgba(255,215,0,0.1)', 
              border: '1px solid rgba(255,215,0,0.25)', 
              borderRadius: 14, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/shop')}
          >
            <span style={{ fontSize: 14 }}>🪙</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#ffd700' }}>{user.coins} Xu</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px', marginTop: 14 }}>
        {/* CORE ACTION BANNER: START 1V1 BATTLE */}
        <div 
          style={{ 
            marginBottom: 20, 
            padding: '18px 20px', 
            background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(83,82,237,0.15))', 
            border: '2px solid rgba(255,107,53,0.4)', 
            borderRadius: 20, 
            cursor: 'pointer', 
            boxShadow: '0 8px 24px rgba(255,107,53,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }} 
          onClick={() => navigate('/battle')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div 
              style={{ 
                width: 48, 
                height: 48, 
                borderRadius: 16, 
                background: 'var(--gradient-primary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: 24, 
                boxShadow: '0 0 16px rgba(255,107,53,0.5)' 
              }}
            >
              ⚔️
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', marginBottom: 2 }}>
                Đấu Trường Camera 1v1 (60s)
              </div>
              <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>
                Ghép đối thủ trực tiếp & so tài đếm số lần chuẩn xác
              </div>
            </div>
          </div>
          <ChevronRight size={24} color="var(--primary)" />
        </div>

        {/* 3 LIVE EXERCISE CARDS */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={18} color="var(--primary)" /> Luyện Tập Cùng AI Camera
            </h2>
            <button 
              onClick={() => navigate('/exercise')} 
              style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Xem tất cả
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {exercises.map(exercise => {
              const pct = Math.round((exercise.todayCount / exercise.targetCount) * 100);
              const isPushup = exercise.type === 'pushup';
              const isPullup = exercise.type === 'pullup';

              return (
                <div
                  key={exercise.type}
                  onClick={() => {
                    if (exercise.type === 'walking') {
                      navigate('/exercise');
                    } else {
                      navigate(`/exercise-camera?type=${exercise.type}`);
                    }
                  }}
                  style={{
                    background: 'linear-gradient(145deg, #14141e, #1a1a28)',
                    border: '1px solid var(--border)',
                    borderRadius: 18,
                    padding: 16,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          background: `${exercise.color}20`,
                          border: `1px solid ${exercise.color}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 22
                        }}
                      >
                        {isPushup ? <Flame size={22} color={exercise.color} /> : isPullup ? <Dumbbell size={22} color={exercise.color} /> : <Footprints size={22} color={exercise.color} />}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                          {exercise.name}
                        </h3>
                        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                          Mục tiêu: {exercise.targetCount} {exercise.unit}/ngày
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: exercise.color }}>
                        {exercise.todayCount.toLocaleString()} <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>/ {exercise.targetCount.toLocaleString()} {exercise.unit}</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text4)', marginTop: 2 }}>{pct}% hoàn thành</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${Math.min(pct, 100)}%`, 
                        background: exercise.gradient, 
                        borderRadius: 3,
                        transition: 'width 0.6s ease-out'
                      }} 
                    />
                  </div>

                  {/* Action button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                      🔥 Đốt ~{(exercise.todayCount * exercise.caloriesPerRep).toFixed(0)} kcal
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (exercise.type === 'walking') {
                          navigate('/exercise');
                        } else {
                          navigate(`/exercise-camera?type=${exercise.type}`);
                        }
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 10,
                        background: exercise.type === 'walking' ? 'rgba(46,213,115,0.15)' : 'var(--gradient-primary)',
                        border: exercise.type === 'walking' ? '1px solid rgba(46,213,115,0.3)' : 'none',
                        color: exercise.type === 'walking' ? '#2ed573' : '#fff',
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {exercise.type === 'walking' ? <span>Ghi nhận</span> : <><Play size={11} fill="#fff" /> Bật Camera</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Shortcut Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          <button 
            onClick={() => navigate('/challenge')} 
            style={{ padding: '14px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          >
            <span style={{ fontSize: 22 }}>🎯</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>Thử Thách</span>
          </button>
          <button 
            onClick={() => navigate('/shop')} 
            style={{ padding: '14px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          >
            <ShoppingBag size={22} color="#ffd700" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>Cửa Hàng</span>
          </button>
          <button 
            onClick={() => navigate('/ranking')} 
            style={{ padding: '14px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          >
            <Trophy size={22} color="#5352ed" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>Xếp Hạng</span>
          </button>
          <button 
            onClick={() => navigate('/membership')} 
            style={{ padding: '14px 8px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          >
            <Crown size={22} color="#ff6b35" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>Gói VIP</span>
          </button>
        </div>

        {/* Ranking Preview */}
        <div style={{ padding: 18, background: 'linear-gradient(145deg, #1a1a28, #14141e)', border: '1px solid var(--border)', borderRadius: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Trophy size={16} color="#ffd700" /> Bảng Xếp Hạng Mùa #7
            </h3>
            <button 
              onClick={() => navigate('/ranking')} 
              style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Xem chi tiết →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leaderboard.slice(0, 3).map((entry) => (
              <div 
                key={entry.userId} 
                onClick={() => navigate('/ranking')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  padding: '10px 14px', 
                  background: entry.rank === 1 ? 'rgba(255,215,0,0.08)' : 'var(--bg-card2)', 
                  borderRadius: 12,
                  cursor: 'pointer',
                  border: entry.rank === 1 ? '1px solid rgba(255,215,0,0.2)' : '1px solid transparent'
                }}
              >
                <span style={{ fontSize: 18, width: 26, textAlign: 'center' }}>
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                </span>
                <Avatar src={entry.avatar} alt={entry.userName} size={36} isVIP={entry.isVIP} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{entry.userName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Cấp {entry.level}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#ffd700' }}>
                  {entry.points.toLocaleString()} pts
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
