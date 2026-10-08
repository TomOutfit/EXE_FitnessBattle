import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { useUser } from '../context/UserContext';
import {
  usePoseDetection,
  drawPose,
  LANDMARKS,
  validateHumanPose
} from '../hooks/usePoseDetection';
import type { Results, PoseData } from '../hooks/usePoseDetection';

export const BattleCameraPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const exercise = searchParams.get('exercise') || 'Hít Đất';

  const { user, updateBattleResult, recordExerciseSession, showToast } = useUser();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [timeLeft, setTimeLeft] = useState(60);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Real AI Pose Detection State
  const [currentAngle, setCurrentAngle] = useState<number>(160);
  const [formFeedback, setFormFeedback] = useState<string>('Sẵn sàng thi đấu! Đứng trước camera');
  const [hasPerson, setHasPerson] = useState<boolean>(false);
  const [aiConfidence, setAiConfidence] = useState<number>(0);

  // Rep tracking ref state machine
  const repPhaseRef = useRef<'up' | 'down'>('up');
  const reachedDepthRef = useRef<boolean>(false);

  const opponent = {
    name: 'Thu Hà',
    avatar: 'https://api.dicebear.com/9.x/avataaars/png?seed=ThuHa&backgroundColor=c0aede',
    rank: '#2',
  };

  // Helper function to calculate angle between 3 points
  const calculateAngle = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number }
  ) => {
    const rad = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs((rad * 180) / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return Math.round(angle);
  };

  // Real-time AI Pose Data Callback
  const handlePoseData = useCallback((poseData: PoseData) => {
    if (!poseData.hasPose || !poseData.landmarks || poseData.landmarks.length < 33) {
      setHasPerson(false);
      setFormFeedback('Đang tìm đấu thủ trước camera...');
      return;
    }

    setHasPerson(true);
    const lm = poseData.landmarks;

    const leftShoulder = lm[LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = lm[LANDMARKS.RIGHT_SHOULDER];
    const leftElbow = lm[LANDMARKS.LEFT_ELBOW];
    const rightElbow = lm[LANDMARKS.RIGHT_ELBOW];
    const leftWrist = lm[LANDMARKS.LEFT_WRIST];
    const rightWrist = lm[LANDMARKS.RIGHT_WRIST];

    if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow || !leftWrist || !rightWrist) return;

    // Calculate elbow angles
    const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const avgAngle = Math.round((leftAngle + rightAngle) / 2);

    setCurrentAngle(avgAngle);

    // Dynamic Rep State Machine based on Exercise Type
    const isPushup = exercise.toLowerCase().includes('hít đất') || exercise.toLowerCase().includes('pushup');
    const targetDepth = isPushup ? 95 : 85;
    const returnThreshold = isPushup ? 145 : 140;

    if (repPhaseRef.current === 'up') {
      if (avgAngle <= targetDepth) {
        repPhaseRef.current = 'down';
        reachedDepthRef.current = true;
        setFormFeedback('Đạt độ sâu! Đang đẩy lên...');
      } else if (avgAngle < 130) {
        setFormFeedback('Hạ thấp hơn nữa!');
      } else {
        setFormFeedback('Giữ tư thế chuẩn & Bắt đầu làm rep!');
      }
    } else if (repPhaseRef.current === 'down') {
      if (avgAngle >= returnThreshold && reachedDepthRef.current) {
        // REP COMPLETED SUCCESSFULLY BY AI VISION!
        repPhaseRef.current = 'up';
        reachedDepthRef.current = false;
        setMyScore((prev) => prev + 1);
        setFormFeedback('✨ 1 Rep chuẩn AI!');
      }
    }
  }, [exercise]);

  // Canvas Skeleton Rendering Callback
  const handleResults = useCallback((results: Results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const video = videoRef.current;
    if (video && video.videoWidth > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    if (results.poseLandmarks) {
      const check = validateHumanPose(results.poseLandmarks);
      setAiConfidence(check.confidence);

      drawPose(ctx, results, {
        color: check.isHuman ? '#00E5FF' : '#FF4757',
        lineWidth: 4,
        pointRadius: 6,
        mirror: true,
      });
    }
  }, []);

  const { detectPose } = usePoseDetection({
    onResults: handleResults,
    onPoseData: handlePoseData,
    enableSmoothing: true,
  });

  // Camera Setup
  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch((err) => {
        console.warn('Camera stream error in Battle mode:', err);
      });

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Frame Loop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animId: number;
    const loop = () => {
      if (video.readyState >= 2) {
        detectPose(video);
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [detectPose]);

  // Match Countdown Timer & Realistic Opponent AI Counter
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

    // Opponent score increments realistically based on human rep rhythm (~2.8s per rep)
    const oppInterval = setInterval(() => {
      setOppScore((s) => s + 1);
    }, 2800 + Math.random() * 400);

    return () => {
      clearInterval(timer);
      clearInterval(oppInterval);
    };
  }, [isFinished]);

  const isWin = myScore >= oppScore;

  const handleClaimRewards = () => {
    const exType = exercise.toLowerCase().includes('kéo xà') ? 'pullup' : 'pushup';
    updateBattleResult(myScore, oppScore, isWin ? 'win' : 'lose');
    recordExerciseSession(exType, myScore, 1, Math.round(myScore * 0.5));

    if (isWin) {
      showToast('🎉 Nhận thưởng chiến thắng +500 XP và +200 Coins!', 'success');
    } else {
      showToast('Cố gắng ở trận sau! +100 XP an ủi', 'info');
    }
    navigate('/battle');
  };

  const handleManualRep = () => {
    setMyScore((s) => s + 1);
    setFormFeedback('✨ Thêm 1 Rep (Test Thủ Công)');
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
          <span>AI Vision Active ({aiConfidence > 0 ? `${aiConfidence}%` : 'Đang quét...'})</span>
        </div>
      </div>

      {/* Split-Screen 2 Player Battle Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Player 1 (You - Real MediaPipe Camera) */}
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

          {/* Player 1 AI Pose Skeleton Overlay */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%', height: '100%',
              pointerEvents: 'none',
            }}
          />

          {/* Player 1 Overlay Info & AI Gauges */}
          <div style={{
            position: 'absolute', top: 12, left: 12,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(0,0,0,0.7)', padding: '6px 12px', borderRadius: 14,
            backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <img
              src={user.avatar}
              alt="You"
              style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--primary)' }}
            />
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>Bạn (Player 1)</div>
              <div style={{ fontSize: 10, color: hasPerson ? '#00E5FF' : '#FF4757', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={12} /> {hasPerson ? `Angle: ${currentAngle}°` : 'Chờ người tập...'}
              </div>
            </div>
          </div>

          {/* Live AI Form Feedback Pill */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(0,0,0,0.75)', padding: '6px 12px', borderRadius: 20,
            fontSize: 11, fontWeight: 700, color: '#00E5FF',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            backdropFilter: 'blur(8px)'
          }}>
            {formFeedback}
          </div>

          {/* Test Manual Rep Button floating */}
          <button
            onClick={handleManualRep}
            style={{
              position: 'absolute', bottom: 16, left: 16,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', fontSize: 11, fontWeight: 700,
              padding: '6px 12px', borderRadius: 12, cursor: 'pointer',
              backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <RefreshCw size={12} /> Test +1 Rep
          </button>

          {/* Player 1 Score Badge */}
          <div style={{
            position: 'absolute', bottom: 16, right: 16,
            background: 'rgba(255, 107, 53, 0.95)', padding: '10px 18px', borderRadius: 16,
            textAlign: 'center', boxShadow: '0 4px 20px rgba(255,107,53,0.5)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Rep AI Đếm</div>
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
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Bạn (AI Vision)</div>
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
