import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Play, Pause, CheckCircle2, ShieldCheck, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { exercises } from '../data/mockData';
import type { ExerciseType } from '../types';

export const ExerciseCameraPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = (searchParams.get('type') as ExerciseType) || 'pushup';
  
  const exercise = exercises.find((e) => e.type === typeParam) || exercises[0];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [reps, setReps] = useState(0);
  const [validReps, setValidReps] = useState(0);
  const [formAccuracy, setFormAccuracy] = useState(95);
  const [feedback, setFeedback] = useState('Đứng vào khung hình để bắt đầu');
  const [seconds, setSeconds] = useState(0);

  // Initialize camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'user' } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(() => {
        // Fallback if camera denied or unavailable in environment
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Timer loop
  useEffect(() => {
    if (!isStarted || isPaused || isCompleted) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isPaused, isCompleted]);

  // AI Pose Detection Simulation / Real Rep loop
  useEffect(() => {
    if (!isStarted || isPaused || isCompleted) return;

    const coachingPhrases = [
      'Xuống sâu hơn một chút!',
      'Giữ lưng thẳng, siết cơ bụng!',
      'Tốt lắm! Đẩy người lên dứt khoát!',
      'Rep hoàn hảo! +1',
      'Duy trì nhịp thở đều đặn!',
    ];

    const repInterval = setInterval(() => {
      setReps((prev) => {
        const next = prev + 1;
        setValidReps((v) => v + 1);
        const randAccuracy = Math.floor(88 + Math.random() * 11);
        setFormAccuracy(randAccuracy);
        setFeedback(coachingPhrases[next % coachingPhrases.length]);
        return next;
      });
    }, 3200);

    return () => clearInterval(repInterval);
  }, [isStarted, isPaused, isCompleted]);

  // Simulated AI skeleton drawing on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isStarted && !isPaused) {
        // Draw simulated skeleton joints & lines
        const t = Date.now() / 600;
        const offsetY = Math.sin(t) * 15;

        ctx.strokeStyle = '#2ED573';
        ctx.lineWidth = 3;
        ctx.fillStyle = '#FF6B35';

        // Head, shoulders, elbows, wrists, hips, knees
        const points = [
          { x: canvas.width * 0.5, y: canvas.height * 0.3 + offsetY }, // Head
          { x: canvas.width * 0.42, y: canvas.height * 0.42 + offsetY }, // Left Shoulder
          { x: canvas.width * 0.58, y: canvas.height * 0.42 + offsetY }, // Right Shoulder
          { x: canvas.width * 0.35, y: canvas.height * 0.55 + offsetY }, // Left Elbow
          { x: canvas.width * 0.65, y: canvas.height * 0.55 + offsetY }, // Right Elbow
          { x: canvas.width * 0.45, y: canvas.height * 0.7 + offsetY * 0.5 }, // Left Hip
          { x: canvas.width * 0.55, y: canvas.height * 0.7 + offsetY * 0.5 }, // Right Hip
        ];

        // Draw connections
        ctx.beginPath();
        ctx.moveTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x, points[2].y);
        ctx.lineTo(points[6].x, points[6].y);
        ctx.lineTo(points[5].x, points[5].y);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(points[1].x, points[1].y);
        ctx.lineTo(points[3].x, points[3].y);
        ctx.moveTo(points[2].x, points[2].y);
        ctx.lineTo(points[4].x, points[4].y);
        ctx.stroke();

        // Draw joint dots
        points.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [isStarted, isPaused]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D0E15',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Camera & Skeleton Viewport */}
      <div style={{
        position: 'relative',
        flex: 1,
        minHeight: 440,
        background: '#141420',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
          }}
        />

        {/* Canvas overlay for AI skeleton */}
        <canvas
          ref={canvasRef}
          width={480}
          height={480}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none',
          }}
        />

        {/* Top Floating Controls */}
        <div style={{
          position: 'absolute',
          top: 16, left: 16, right: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 20,
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer',
            }}
          >
            <ArrowLeft size={20} />
          </button>

          {/* Anti-cheat status pill */}
          <div style={{
            padding: '6px 14px', borderRadius: 20,
            background: 'rgba(46, 213, 115, 0.2)', backdropFilter: 'blur(10px)',
            border: '1px solid #2ED573',
            display: 'flex', alignItems: 'center', gap: 6,
            color: '#2ED573', fontSize: 12, fontWeight: 700,
          }}>
            <ShieldCheck size={16} />
            <span>AI Giám Sát Chuẩn</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer',
            }}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} color="#ff4757" />}
          </button>
        </div>

        {/* Live Real-Time Coaching Banner */}
        <div style={{
          position: 'absolute',
          bottom: 20, left: 16, right: 16,
          padding: '12px 18px',
          borderRadius: 16,
          background: 'rgba(14, 14, 22, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 107, 53, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>
            {exercise.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase' }}>
              Huấn Luyện Viên AI
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
              {feedback}
            </div>
          </div>
          <div style={{
            padding: '4px 8px', borderRadius: 8,
            background: formAccuracy >= 90 ? 'rgba(46,213,115,0.2)' : 'rgba(255,165,2,0.2)',
            color: formAccuracy >= 90 ? '#2ED573' : '#FFA502',
            fontWeight: 800, fontSize: 12,
          }}>
            {formAccuracy}%
          </div>
        </div>
      </div>

      {/* Bottom Workout Dashboard Controls */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(180deg, #14141e, #0D0E15)',
        borderTop: '1px solid var(--border)',
        zIndex: 10,
      }}>
        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
          {/* Rep Count Box */}
          <div style={{
            padding: '14px 10px',
            background: 'rgba(255, 107, 53, 0.1)',
            border: '1px solid rgba(255, 107, 53, 0.3)',
            borderRadius: 16,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>SỐ REP</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)' }}>{reps}</div>
            <div style={{ fontSize: 10, color: '#2ED573', fontWeight: 700 }}>{validReps} chuẩn</div>
          </div>

          {/* Time Box */}
          <div style={{
            padding: '14px 10px',
            background: 'rgba(83, 82, 237, 0.1)',
            border: '1px solid rgba(83, 82, 237, 0.3)',
            borderRadius: 16,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>THỜI GIAN</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#5352ED', marginTop: 3 }}>
              {formatTime(seconds)}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text3)' }}>giây</div>
          </div>

          {/* Calories Box */}
          <div style={{
            padding: '14px 10px',
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            borderRadius: 16,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>CALORIES</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#FFD700', marginTop: 1 }}>
              {(reps * exercise.caloriesPerRep).toFixed(0)}
            </div>
            <div style={{ fontSize: 10, color: '#FFD700' }}>kcal</div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isStarted ? (
          <button
            onClick={() => setIsStarted(true)}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 16,
              background: 'var(--gradient-primary)',
              border: 'none',
              color: '#fff',
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 8px 24px rgba(255, 107, 53, 0.4)',
            }}
          >
            <Play size={20} fill="#fff" />
            <span>BẮT ĐẦU TẬP</span>
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setIsPaused(!isPaused)}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 14,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
              <span>{isPaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
            </button>

            <button
              onClick={() => setIsCompleted(true)}
              style={{
                flex: 1.5,
                padding: '14px',
                borderRadius: 14,
                background: 'var(--gradient-primary)',
                border: 'none',
                color: '#fff',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 6px 20px rgba(255, 107, 53, 0.3)',
              }}
            >
              <CheckCircle2 size={18} />
              <span>KẾT THÚC</span>
            </button>
          </div>
        )}
      </div>

      {/* Workout Complete Modal */}
      {isCompleted && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(16px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 400,
            background: 'linear-gradient(145deg, #1c1c2b, #12121e)',
            border: '2px solid var(--primary)',
            borderRadius: 24,
            padding: 24,
            textAlign: 'center',
            boxShadow: '0 0 40px rgba(255, 107, 53, 0.3)',
          }}>
            <div style={{ fontSize: 50, marginBottom: 8 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
              HOÀN THÀNH BÀI TẬP!
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>
              Bạn đã hoàn thành xuất sắc buổi tập {exercise.name} cùng AI
            </p>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10,
              background: 'var(--bg-card)', padding: 14, borderRadius: 16, marginBottom: 20,
            }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Tổng số Rep</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{reps} lần</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Độ chính xác</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#2ED573' }}>{formAccuracy}%</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Thời gian</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#5352ED' }}>{formatTime(seconds)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>Phần thưởng</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#FFD700' }}>+{(reps * 10)} XP</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  setReps(0);
                  setValidReps(0);
                  setSeconds(0);
                  setIsCompleted(false);
                  setIsStarted(true);
                }}
                style={{
                  flex: 1, padding: '14px', borderRadius: 14,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  color: '#fff', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <RotateCcw size={16} />
                <span>Tập lại</span>
              </button>

              <button
                onClick={() => navigate('/exercise')}
                style={{
                  flex: 1, padding: '14px', borderRadius: 14,
                  background: 'var(--gradient-primary)', border: 'none',
                  color: '#fff', fontWeight: 800, cursor: 'pointer',
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
