import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useUser } from '../context/UserContext';

export const BattleCameraPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const exercise = searchParams.get('exercise') || 'Hít Đất';

  const { user, updateBattleResult, recordExerciseSession, showToast } = useUser();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [timeLeft, setTimeLeft] = useState(60);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const opponent = {
    name: 'Thu Hà',
    avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=ThuHa&backgroundColor=c0aede',
    rank: '#2',
  };

  // Setup video stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(() => {});

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Match countdown loop & Simulated scoring
  useEffect(() => {
    if (isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // My score increments
    const myInterval = setInterval(() => {
      setMyScore((s) => s + 1);
    }, 2400);

    // Opponent score increments
    const oppInterval = setInterval(() => {
      setOppScore((s) => s + 1);
    }, 2700);

    return () => {
      clearInterval(timer);
      clearInterval(myInterval);
      clearInterval(oppInterval);
    };
  }, [isFinished]);

  const isWin = myScore >= oppScore;

  const handleClaimRewards = () => {
    const exType = exercise === 'Kéo Xà' ? 'pullup' : 'pushup';
    updateBattleResult(myScore, oppScore, isWin ? 'win' : 'lose');
    recordExerciseSession(exType, myScore, 1, Math.round(myScore * 0.5));

    if (isWin) {
      showToast('🎉 Nhận thưởng chiến thắng +500 XP và +200 Coins!', 'success');
    } else {
      showToast('Cố gắng ở trận sau! +100 XP an ủi', 'info');
    }
    navigate('/battle');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D0E15',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Top Floating Match Header */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(20, 20, 32, 0.95)',
        borderBottom: '1px solid var(--border)',
        zIndex: 50,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} />
        </button>

        {/* Match Timer */}
        <div style={{
          padding: '6px 16px', borderRadius: 20,
          background: 'var(--gradient-primary)',
          fontSize: 16, fontWeight: 900, color: '#fff',
          boxShadow: '0 0 16px rgba(255, 107, 53, 0.5)',
        }}>
          ⏱️ {timeLeft}s
        </div>

        <div style={{
          padding: '6px 12px', borderRadius: 20,
          background: 'rgba(46, 213, 115, 0.2)', border: '1px solid #2ED573',
          display: 'flex', alignItems: 'center', gap: 6,
          color: '#2ED573', fontSize: 11, fontWeight: 700,
        }}>
          <ShieldCheck size={14} />
          <span>Anti-Cheat AI</span>
        </div>
      </div>

      {/* Split-Screen 2 Player Battle Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Player 1 (You - Live Camera) */}
        <div style={{
          flex: 1, position: 'relative', background: '#12121e',
          borderBottom: '2px solid var(--primary)', overflow: 'hidden',
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: 'scaleX(-1)',
            }}
          />

          {/* Player 1 Overlay Info */}
          <div style={{
            position: 'absolute', top: 12, left: 12,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: 14,
            backdropFilter: 'blur(8px)',
          }}>
            <img
              src={user.avatar}
              alt="You"
              style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--primary)' }}
            />
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>Bạn (Player 1)</div>
              <div style={{ fontSize: 10, color: 'var(--primary)' }}>Level {user.level}</div>
            </div>
          </div>

          {/* Player 1 Score Badge */}
          <div style={{
            position: 'absolute', bottom: 16, right: 16,
            background: 'rgba(255, 107, 53, 0.9)', padding: '10px 18px', borderRadius: 16,
            textAlign: 'center', boxShadow: '0 4px 20px rgba(255,107,53,0.5)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Số Rep</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{myScore}</div>
          </div>
        </div>

        {/* VS Divider Badge */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF4757, #FFA502)',
          border: '3px solid #0D0E15',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: 14, color: '#fff',
          zIndex: 30, boxShadow: '0 0 20px rgba(255,71,87,0.8)',
        }}>
          VS
        </div>

        {/* Player 2 (Opponent - Live Feed Simulation) */}
        <div style={{
          flex: 1, position: 'relative', background: '#181828',
          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Simulated Opponent Video / Animation */}
          <div style={{ textAlign: 'center', opacity: 0.9 }}>
            <img
              src={opponent.avatar}
              alt={opponent.name}
              style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid #5352ED', marginBottom: 8 }}
            />
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{opponent.name}</div>
            <div style={{ fontSize: 11, color: '#5352ED' }}>Đang thi đấu trực tiếp qua Camera...</div>
          </div>

          {/* Player 2 Overlay Info */}
          <div style={{
            position: 'absolute', top: 12, left: 12,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: 14,
            backdropFilter: 'blur(8px)',
          }}>
            <img
              src={opponent.avatar}
              alt={opponent.name}
              style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #5352ED' }}
            />
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{opponent.name}</div>
              <div style={{ fontSize: 10, color: '#5352ED' }}>Hạng {opponent.rank} Server</div>
            </div>
          </div>

          {/* Player 2 Score Badge */}
          <div style={{
            position: 'absolute', bottom: 16, right: 16,
            background: 'rgba(83, 82, 237, 0.9)', padding: '10px 18px', borderRadius: 16,
            textAlign: 'center', boxShadow: '0 4px 20px rgba(83,82,237,0.5)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Số Rep</div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{oppScore}</div>
          </div>
        </div>
      </div>

      {/* Match Result Modal */}
      {isFinished && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)',
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            width: '100%', maxWidth: 400,
            background: 'linear-gradient(145deg, #1c1c2b, #12121e)',
            border: isWin ? '2px solid #2ED573' : '2px solid #FF4757',
            borderRadius: 24, padding: 24, textAlign: 'center',
            boxShadow: isWin ? '0 0 40px rgba(46, 213, 115, 0.4)' : '0 0 40px rgba(255, 71, 87, 0.4)',
          }}>
            <div style={{ fontSize: 54, marginBottom: 8 }}>{isWin ? '🏆' : '💔'}</div>
            <h2 style={{
              fontSize: 24, fontWeight: 900,
              color: isWin ? '#2ED573' : '#FF4757', marginBottom: 4,
            }}>
              {isWin ? 'CHIẾN THẮNG!' : 'THẤT BẠI!'}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>
              Trận đấu {exercise} 60s vs {opponent.name}
            </p>

            {/* Score Comparison */}
            <div style={{
              display: 'flex', justifyContent: 'space-around', alignItems: 'center',
              background: 'var(--bg-card)', padding: 16, borderRadius: 16, marginBottom: 20,
            }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Bạn</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)' }}>{myScore}</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text3)' }}>-</div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{opponent.name}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#5352ED' }}>{oppScore}</div>
              </div>
            </div>

            {/* Rewards */}
            <div style={{
              padding: 12, borderRadius: 14, background: 'rgba(255,215,0,0.1)',
              border: '1px solid rgba(255,215,0,0.3)', marginBottom: 20,
              display: 'flex', justifyContent: 'center', gap: 16,
            }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#FFD700' }}>
                +{isWin ? 500 : 100} XP
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#FF6B35' }}>
                +{isWin ? 200 : 50} Coins
              </span>
            </div>

            <button
              onClick={handleClaimRewards}
              style={{
                width: '100%', padding: '16px', borderRadius: 16,
                background: 'var(--gradient-primary)', border: 'none',
                color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
              }}
            >
              NHẬN THƯỞNG & HOÀN TẤT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
