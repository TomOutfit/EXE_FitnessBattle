import React, { useState, useEffect, useRef } from 'react';
import { Activity, Shield, Zap, MapPin, AlertTriangle, CheckCircle, Timer } from 'lucide-react';
import { Avatar } from '../ui';
import { BattleResult, type BattleResultType } from './BattleResult';
import { useUser } from '../../context/UserContext';

interface BattleArenaProps {
  opponentName: string;
  opponentAvatar: string;
  exercise: string;
  onBattleEnd?: (result: BattleResultType, myScore: number, oppScore: number) => void;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  opponentName, opponentAvatar, exercise, onBattleEnd, onPlayAgain, onGoHome,
}) => {
  const { user, updateBattleResult } = useUser();
  const [seconds, setSeconds] = useState(60);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [phase, setPhase] = useState<'warmup' | 'battle' | 'anticheat' | 'result'>('warmup');
  const [anticheatFlag, setAnticheatFlag] = useState<BattleResultType | null>(null);
  const [myHeartRate, setMyHeartRate] = useState(0);
  const [oppHeartRate, setOppHeartRate] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const exerciseEmoji: Record<string, string> = {
    gym: '🏋️', run: '🏃', hiit: '⚡', bike: '🚴', yoga: '🧘', swim: '🏊',
  };

  const exerciseLabel: Record<string, string> = {
    gym: 'Gym', run: 'Chạy bộ', hiit: 'HIIT', bike: 'Đạp xe', yoga: 'Yoga', swim: 'Bơi lội',
  };

  const emoji = exerciseEmoji[exercise] || '⚡';
  const label = exerciseLabel[exercise] || exercise;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (scoreRef.current) clearInterval(scoreRef.current);
    };
  }, []);

  const finishBattle = (result: BattleResultType) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (scoreRef.current) clearInterval(scoreRef.current);

    const finalMy = myScore;
    const finalOpp = oppScore;

    // Update user stats
    updateBattleResult(finalMy, finalOpp, result);

    // Show anticheat screen briefly, then result
    setAnticheatFlag(result);
    setPhase('anticheat');
    setTimeout(() => setPhase('result'), 2500);
  };

  const startBattle = () => {
    setPhase('battle');
    setSeconds(60);
    setMyScore(0);
    setOppScore(0);
    setMyHeartRate(0);
    setOppHeartRate(0);
    setAnticheatFlag(null);

    let currentMyScore = 0;
    let currentOppScore = 0;

    scoreRef.current = setInterval(() => {
      setMyScore(s => {
        // Ensure myScore increases faster so we always win in normal demo
        const next = s + Math.floor(Math.random() * 4 + 4); 
        currentMyScore = next;
        return next;
      });
      setOppScore(s => {
        const next = s + Math.floor(Math.random() * 3 + 1);
        currentOppScore = next;
        return next;
      });
      setMyHeartRate(hr => Math.min(185, hr + Math.floor(Math.random() * 6 + 3)));
      setOppHeartRate(hr => Math.min(185, hr + Math.floor(Math.random() * 7 + 2)));
    }, 250); // Speed up tick rate for faster simulation

    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 4) {
          if (intervalRef.current) clearInterval(intervalRef.current!);
          if (scoreRef.current) clearInterval(scoreRef.current!);
          setTimeout(() => {
            finishBattle(currentMyScore > currentOppScore ? 'win' : 'lose');
          }, 100);
          return 0;
        }
        return s - 4; // Fast countdown
      });
    }, 250);
  };

  // Anti-Cheat trigger at 15 seconds
  useEffect(() => {
    if (phase === 'battle' && seconds === 15 && !anticheatFlag) {
      const isMeSuspicious = Math.random() < 0.15; // 15% chance me cheating
      const isOppSuspicious = Math.random() < 0.3; // 30% chance opponent cheating

      if (isOppSuspicious) {
        finishBattle('opp_cheat');
        return;
      }

      if (isMeSuspicious) {
        finishBattle('cheat');
        return;
      }
    }
  }, [phase, seconds, anticheatFlag]);

  const handlePlayAgainInternal = () => {
    setPhase('warmup');
    setMyScore(0);
    setOppScore(0);
    setAnticheatFlag(null);
    onPlayAgain();
  };

  // Show BattleResult when phase is 'result'
  if (phase === 'result') {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
        <BattleResult
          myScore={myScore}
          oppScore={oppScore}
          myAvatar={user.avatar}
          myName={user.name}
          oppAvatar={opponentAvatar}
          oppName={opponentName}
          result={anticheatFlag || 'lose'}
          onPlayAgain={handlePlayAgainInternal}
          onGoHome={() => {
            setPhase('warmup');
            setMyScore(0);
            setOppScore(0);
            setAnticheatFlag(null);
            onBattleEnd?.(anticheatFlag || 'lose', myScore, oppScore);
            onGoHome();
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
      {phase === 'warmup' && renderWarmup()}
      {phase === 'battle' && renderBattle()}
      {phase === 'anticheat' && renderAnticheat()}
    </div>
  );

  function renderWarmup() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '32px 20px' }}>
        <div style={{ fontSize: 64, animation: 'bounce 1s infinite' }}>{emoji}</div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', marginBottom: 6 }}>
            Sẵn sàng thi đấu {label}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text3)' }}>
            Kiểm tra GPS & Micro trước khi bắt đầu
          </p>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { icon: MapPin, label: 'GPS', ok: true },
            { icon: Activity, label: 'Micro', ok: true },
            { icon: Shield, label: 'Anti-Cheat', ok: true },
          ].map((check, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(46,213,115,0.1)', border: '1px solid rgba(46,213,115,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <check.icon size={20} color="#2ed573" />
              </div>
              <span style={{ fontSize: 11, color: '#2ed573', fontWeight: 600 }}>{check.label}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 24px', background: 'linear-gradient(90deg, rgba(255,107,53,0.15), rgba(83,82,237,0.1))', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 14 }}>
          <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
            🛡️ <strong style={{ color: 'var(--primary)' }}>Anti-Cheat AI</strong> sẽ theo dõi GPS & Micro trong suốt 60 giây. Nếu phát hiện gian lận — trận đấu sẽ bị hủy ngay lập tức.
          </p>
        </div>

        <button
          onClick={startBattle}
          style={{ padding: '16px 48px', background: 'var(--gradient-primary)', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 800, color: '#fff', cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,107,53,0.4)', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Zap size={18} /> BẮT ĐẦU — 60 GIÂY
        </button>
      </div>
    );
  }

  function renderBattle() {
    return (
      <div style={{ padding: '16px 20px' }}>
        {/* Timer */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', background: seconds <= 10 ? 'rgba(255,71,87,0.15)' : 'var(--bg-card)', border: `1px solid ${seconds <= 10 ? 'rgba(255,71,87,0.3)' : 'var(--border)'}`, borderRadius: 24 }}>
            <Timer size={16} color={seconds <= 10 ? '#ff4757' : 'var(--primary)'} />
            <span style={{ fontSize: 24, fontWeight: 900, color: seconds <= 10 ? '#ff4757' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
              {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
            </span>
            {seconds <= 10 && <span style={{ fontSize: 12, color: '#ff4757', fontWeight: 700, animation: 'pulse 0.5s infinite' }}>⚠️</span>}
          </div>
        </div>

        {/* Exercise */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 12 }}>
            <span style={{ fontSize: 24 }}>{emoji}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{label}</span>
          </div>
        </div>

        {/* VS Arena */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          {/* Me */}
          <div style={{ flex: 1, padding: 16, background: 'linear-gradient(145deg, rgba(255,107,53,0.12), rgba(255,107,53,0.04))', border: '1px solid rgba(255,107,53,0.25)', borderRadius: 16, textAlign: 'center' }}>
            <Avatar src={user.avatar} alt={user.name} size={52} online level={user.level} ring="var(--primary)" />
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginTop: 8, marginBottom: 4 }}>{user.name}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)' }}>{myScore}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>điểm</div>
            {myHeartRate > 0 && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Activity size={11} color="#ff4757" />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#ff4757' }}>{myHeartRate} BPM</span>
              </div>
            )}
          </div>

          {/* VS */}
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: 'var(--text3)', flexShrink: 0 }}>
            ⚔️
          </div>

          {/* Opponent */}
          <div style={{ flex: 1, padding: 16, background: 'linear-gradient(145deg, rgba(83,82,237,0.12), rgba(83,82,237,0.04))', border: '1px solid rgba(83,82,237,0.25)', borderRadius: 16, textAlign: 'center' }}>
            <Avatar src={opponentAvatar} alt={opponentName} size={52} online level={5} ring="#5352ed" />
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginTop: 8, marginBottom: 4 }}>{opponentName}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#5352ed' }}>{oppScore}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>điểm</div>
            {oppHeartRate > 0 && (
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Activity size={11} color="#ff4757" />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#ff4757' }}>{oppHeartRate} BPM</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Progress Bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>Tiến độ</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: myScore > oppScore ? '#2ed573' : myScore < oppScore ? '#ff4757' : 'var(--text3)' }}>
              {myScore > oppScore ? 'Đang dẫn trước!' : myScore < oppScore ? 'Đang bị dẫn' : 'Đang hòa'}
            </span>
          </div>
          <div style={{ height: 10, background: '#5352ed', borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${Math.max(5, Math.min(95, (myScore / (myScore + oppScore || 1)) * 100))}%`,
              background: 'linear-gradient(90deg, var(--primary), #ff4757)',
              borderRadius: 5, transition: 'width 0.5s ease-out',
              boxShadow: '0 0 8px rgba(255,107,53,0.5)',
            }} />
          </div>
        </div>

        {/* Anti-Cheat Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(46,213,115,0.08)', border: '1px solid rgba(46,213,115,0.2)', borderRadius: 10, marginBottom: 8 }}>
          <Shield size={13} color="#2ed573" />
          <span style={{ fontSize: 11, color: '#2ed573', fontWeight: 600 }}>Anti-Cheat AI: Đang theo dõi GPS & Micro...</span>
          <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#2ed573', boxShadow: '0 0 6px #2ed573', animation: 'pulse 1.5s infinite' }} />
        </div>

        {/* GPS + Location */}
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ flex: 1, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={11} color="var(--primary)" />
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>GPS: Đã xác minh</span>
          </div>
          <div style={{ flex: 1, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={11} color="var(--primary)" />
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>Micro: Hoạt động</span>
          </div>
        </div>
      </div>
    );
  }

  function renderAnticheat() {
    const isOppCheat = anticheatFlag === 'opp_cheat';
    const isMeCheat = anticheatFlag === 'cheat';
    const isNormal = !isOppCheat && !isMeCheat;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '32px 20px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: isOppCheat || isMeCheat ? 'rgba(255,71,87,0.15)' : 'rgba(46,213,115,0.15)', border: `2px solid ${isOppCheat || isMeCheat ? 'rgba(255,71,87,0.4)' : 'rgba(46,213,115,0.4)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1s infinite' }}>
          {isOppCheat || isMeCheat ? (
            <AlertTriangle size={36} color="#ff4757" />
          ) : (
            <CheckCircle size={36} color="#2ed573" />
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: isOppCheat || isMeCheat ? '#ff4757' : '#2ed573', marginBottom: 8 }}>
            {isOppCheat ? '⚠️ Đối thủ bị phát hiện!' : isMeCheat ? '⚠️ Phát hiện gian lận!' : '✓ Xác minh thành công'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text3)', maxWidth: 300, lineHeight: 1.5 }}>
            {isOppCheat ? 'Anti-Cheat đã phát hiện đối thủ gian lận. Bạn thắng!' : isMeCheat ? 'GPS của bạn không khớp Micro. Trận bị hủy!' : 'Đang tính toán kết quả trận đấu...'}
          </p>
        </div>

        {isOppCheat && (
          <div style={{ padding: '14px 20px', background: 'rgba(46,213,115,0.1)', border: '1px solid rgba(46,213,115,0.3)', borderRadius: 14, width: '100%', maxWidth: 320 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={20} color="#ff4757" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ff4757' }}>Đối thủ bị phát hiện gian lận!</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Vị trí GPS không khớp với tín hiệu Micro</div>
              </div>
            </div>
          </div>
        )}

        {isMeCheat && (
          <div style={{ padding: '14px 20px', background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 14, width: '100%', maxWidth: 320 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={20} color="#ff4757" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ff4757' }}>Phát hiện gian lận!</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Vị trí GPS không khớp với tín hiệu Micro</div>
              </div>
            </div>
          </div>
        )}

        {isNormal && (
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'GPS', ok: true },
              { label: 'Micro', ok: true },
              { label: 'GPS đối thủ', ok: true },
            ].map((check, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(46,213,115,0.1)', border: '1px solid rgba(46,213,115,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={20} color="#2ed573" />
                </div>
                <span style={{ fontSize: 11, color: '#2ed573', fontWeight: 600 }}>{check.label}</span>
              </div>
            ))}
          </div>
        )}

        {!isOppCheat && !isMeCheat && (
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'GPS', ok: !isMeCheat },
              { label: 'Micro', ok: !isMeCheat },
              { label: 'GPS đối thủ', ok: !isOppCheat },
            ].map((check, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: check.ok ? 'rgba(46,213,115,0.1)' : 'rgba(255,71,87,0.1)', border: `1px solid ${check.ok ? 'rgba(46,213,115,0.3)' : 'rgba(255,71,87,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {check.ok ? <CheckCircle size={20} color="#2ed573" /> : <AlertTriangle size={20} color="#ff4757" />}
                </div>
                <span style={{ fontSize: 11, color: check.ok ? '#2ed573' : '#ff4757', fontWeight: 600 }}>{check.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
};
