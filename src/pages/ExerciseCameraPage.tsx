import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Trophy,
  CheckCircle2,
  ScanLine,
  Lock,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { initialExercisesSeed as exercises } from '../data/seedData';
import type { ExerciseType } from '../types';
import { useUser } from '../context/UserContext';
import {
  usePoseDetection,
  drawPose,
  PUSHUP_CONFIG,
  PULLUP_CONFIG,
  validateHumanPose,
  extractBiometricSignature,
  compareBiometricSignatures,
} from '../hooks/usePoseDetection';
import type { Results, BiometricSignature } from '../hooks/usePoseDetection';

// App phase state machine
type AppPhase = 'loading' | 'waiting_pose' | 'countdown' | 'exercising' | 'paused' | 'completed';

export const ExerciseCameraPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = (searchParams.get('type') as ExerciseType) || 'pushup';
  const { recordExerciseSession } = useUser();

  const exercise = exercises.find((e) => e.type === typeParam) || exercises[0];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── App Phase State Machine ──────────────────────────────────────────────
  const [phase, setPhase] = useState<AppPhase>('loading');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Pose / camera state
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const [hasPerson, setHasPerson] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [demoMode, setDemoMode] = useState<boolean>(false);

  // Auto-detection state
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0);
  const [detectionDetails, setDetectionDetails] = useState<string>('Đang khởi động AI...');
  const [detectionChecks, setDetectionChecks] = useState<Record<string, boolean>>({});
  const [countdown, setCountdown] = useState<number>(0);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoDetectionFramesRef = useRef<number>(0);
  const isCountingDownRef = useRef<boolean>(false);

  // Demo mode animation ref
  const demoAnimationRef = useRef<number | null>(null);
  const demoAngleRef = useRef<number>(160);

  // ── Metrics & Biomechanical State ─────────────────────────────────────────
  const [reps, setReps] = useState<number>(0);
  const [validReps, setValidReps] = useState<number>(0);
  const [currentJointAngle, setCurrentJointAngle] = useState<number>(160);
  const [formAccuracy, setFormAccuracy] = useState<number>(98);
  const [feedback, setFeedback] = useState<string>('Giữ nguyên tư thế!');
  const [antiCheatAlert, setAntiCheatAlert] = useState<string>('');
  const [seconds, setSeconds] = useState<number>(0);

  // ── Single-Subject Lock State (Khóa đối tượng duy nhất) ────────────────────
  const [subjectStatus, setSubjectStatus] = useState<'locking' | 'matched' | 'user_away' | 'stranger_detected'>('locking');
  const [subjectMatchScore, setSubjectMatchScore] = useState<number>(100);

  const lockedSignatureRef = useRef<BiometricSignature | null>(null);
  const lockFramesCountRef = useRef<number>(0);
  const lastSeenUserTimeRef = useRef<number>(Date.now());
  const isUserAwayRef = useRef<boolean>(false);
  const strangerAlertCooldownRef = useRef<boolean>(false);

  // Rep tracking state & refs
  const [reachedDepth, setReachedDepth] = useState<boolean>(false);
  const [depthStatus, setDepthStatus] = useState<'ready' | 'going_down' | 'depth_passed'>('ready');

  const repPhaseRef = useRef<'up' | 'down'>('up');
  const reachedDepthRef = useRef<boolean>(false);
  const minAngleInRepRef = useRef<number>(180);
  const repCooldownRef = useRef<boolean>(false);

  // Convenience derived booleans
  const isExercising = phase === 'exercising';
  const isPaused = phase === 'paused';
  const isCompleted = phase === 'completed';

  // Calculate angle helper (defined before use)
  const calculateAngle = (
    point1: { x: number; y: number },
    point2: { x: number; y: number },
    point3: { x: number; y: number }
  ) => {
    const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) -
      Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let angle = Math.abs(radians * 180 / Math.PI);
    if (angle > 180) {
      angle = 360 - angle;
    }
    return angle;
  };

  const virtualBarYRef = useRef<number>(0.25);

  // Pose detection hook (defined before handlePoseResults that uses it)
  const { detectPose, isLoading: poseLoading, error: poseHookError, isModelReady, checkPushupPosition, checkPullupPosition } = usePoseDetection({
    onResults: (results: Results) => handlePoseResultsRef.current?.(results),
    enableSmoothing: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  // Start the countdown → exercising transition
  const startCountdown = useCallback(() => {
    if (isCountingDownRef.current) return;
    isCountingDownRef.current = true;
    setPhase('countdown');
    setCountdown(3);
    speakVoice(
      typeParam === 'pullup'
        ? 'Đã nhận diện xà và tư thế bám xà! Bắt đầu sau 3 giây. Kéo đầu vượt qua tay nhé!'
        : 'Phát hiện tư thế hít đất! Bắt đầu sau 3 giây.'
    );
    let count: number = 3;
    countdownTimerRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownTimerRef.current!);
        countdownTimerRef.current = null;
        isCountingDownRef.current = false;
        setCountdown(0);
        setPhase('exercising');
        speakVoice(
          typeParam === 'pullup'
            ? 'Bắt đầu hít xà! Kéo đầu vượt qua tay để tính rep!'
            : 'Bắt đầu! AI Pose tracking đã kích hoạt!'
        );
      }
    }, 1000);
  }, [typeParam]);

  // Ref to store the latest handlePoseResults function
  const handlePoseResultsRef = useRef<((results: Results) => void) | null>(null);

  // Handle pose detection results
  const handlePoseResults = useCallback((results: Results) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sync canvas size to video
    const video = videoRef.current;
    if (video) {
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 480;
    }

    // ── PHASE: waiting_pose – scan for exercise position ───────────────────
    if ((phase === 'waiting_pose' || phase === 'loading') && results.poseLandmarks) {
      if (typeParam === 'pullup') {
        const detection = checkPullupPosition(results.poseLandmarks);
        setDetectionConfidence(detection.confidence);
        setDetectionDetails(detection.details);
        setDetectionChecks(detection.checks);

        if (detection.barY > 0) {
          virtualBarYRef.current = detection.barY;
        }

        if (detection.isInPosition) {
          autoDetectionFramesRef.current++;
          if (autoDetectionFramesRef.current >= 15 && !isCountingDownRef.current) {
            startCountdown();
          }
        } else {
          autoDetectionFramesRef.current = 0;
          if (isCountingDownRef.current && countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
            isCountingDownRef.current = false;
            setCountdown(0);
            setPhase('waiting_pose');
          }
        }

        // Draw virtual pullup bar (dashed during scan with glowing badge)
        const barPixelY = virtualBarYRef.current * canvas.height;
        ctx.save();
        const scanBarColor = detection.isInPosition ? '#2ED573' : '#FFA502';
        ctx.strokeStyle = scanBarColor;
        ctx.lineWidth = 5;
        ctx.shadowColor = scanBarColor;
        ctx.shadowBlur = 14;
        ctx.setLineDash([12, 8]);
        ctx.beginPath();
        ctx.moveTo(20, barPixelY);
        ctx.lineTo(canvas.width - 20, barPixelY);
        ctx.stroke();

        // Solid high-contrast label badge
        const scanLabelText = '📏 MỐC THANH XÀ (CHECK XÀ TRƯỚC)';
        ctx.font = 'bold 13px Inter, sans-serif';
        const textMetrics = ctx.measureText(scanLabelText);
        const badgeWidth = textMetrics.width + 24;
        const badgeHeight = 28;
        const badgeX = 24;
        const badgeY = Math.max(10, barPixelY - 36);

        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.strokeStyle = scanBarColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = scanBarColor;
        ctx.fillText(scanLabelText, badgeX + 12, badgeY + 19);
        ctx.restore();

        // Draw skeleton with color feedback
        drawPose(ctx, results, {
          color: detection.isInPosition ? '#2ED573' : '#FFA502',
          lineWidth: 4,
          pointRadius: 6,
          mirror: true,
        });

        setHasPerson(true);
        return;
      } else if (typeParam === 'pushup') {
        const detection = checkPushupPosition(results.poseLandmarks);
        setDetectionConfidence(detection.confidence);
        setDetectionDetails(detection.details);
        setDetectionChecks(detection.checks);

        if (detection.isInPosition) {
          autoDetectionFramesRef.current++;
          // Require 15 consecutive frames (~0.5s) before confirming
          if (autoDetectionFramesRef.current >= 15 && !isCountingDownRef.current) {
            startCountdown();
          }
        } else {
          // Lost position – reset counter & cancel countdown if still running
          autoDetectionFramesRef.current = 0;
          if (isCountingDownRef.current && countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
            isCountingDownRef.current = false;
            setCountdown(0);
            setPhase('waiting_pose');
          }
        }

        // Draw skeleton with color feedback
        drawPose(ctx, results, {
          color: detection.isInPosition ? '#2ED573' : '#FFA502',
          lineWidth: 4,
          pointRadius: 6,
          mirror: true,
        });

        setHasPerson(true);
        return;
      }
    }

    // ── PHASE: countdown – keep drawing skeleton ───────────────────────────
    if (phase === 'countdown' && results.poseLandmarks) {
      if (typeParam === 'pullup') {
        const barPixelY = virtualBarYRef.current * canvas.height;
        ctx.save();
        ctx.strokeStyle = '#2ED573';
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.moveTo(25, barPixelY);
        ctx.lineTo(canvas.width - 25, barPixelY);
        ctx.stroke();

        ctx.fillStyle = '#2ED573';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText('🎯 VỊ TRÍ XÀ ĐÃ XÁC NHẬN - SẴN SÀNG!', 30, Math.max(22, barPixelY - 10));
        ctx.restore();
      }
      drawPose(ctx, results, { color: '#2ED573', lineWidth: 4, pointRadius: 6, mirror: true });
      return;
    }

    // ── PHASE: exercising / paused ────────────────────────────────────────
    if (phase !== 'exercising') return;

    if (!results.poseLandmarks || results.poseLandmarks.length < 33) {
      setHasPerson(false);
      // Nếu đã khóa đối tượng và người dùng rời khỏi camera > 1.2s -> chuyển sang user_away
      if (lockedSignatureRef.current && (Date.now() - lastSeenUserTimeRef.current > 1200)) {
        if (!isUserAwayRef.current) {
          isUserAwayRef.current = true;
          speakVoice('Bạn đã rời khỏi camera. Đang tạm dừng bài tập.');
        }
        setSubjectStatus('user_away');
        setAntiCheatAlert('⚠️ Bạn đã rời khỏi camera – Hệ thống đang khóa với bạn và tạm dừng');
        setFeedback('⚠️ Đang đợi người tập ban đầu quay lại camera...');
      } else if (!lockedSignatureRef.current) {
        setAntiCheatAlert('Không phát hiện người trong khung hình');
      }
      return;
    }

    // ── KIỂM TRA CHỈ TÍNH CON NGƯỜI (HUMAN VERIFICATION) ───────────────────
    const humanCheck = validateHumanPose(results.poseLandmarks);
    if (!humanCheck.isHuman) {
      setHasPerson(false);
      setAntiCheatAlert(`🚫 AI chỉ tính con người: ${humanCheck.reason}`);
      setFeedback(`⚠️ ${humanCheck.reason} – vui lòng để camera thấy người thật`);

      // Vẽ skeleton cảnh báo màu đỏ
      drawPose(ctx, results, {
        color: '#FF4757',
        lineWidth: 3,
        pointRadius: 5,
        mirror: true,
      });

      // Reset chu kỳ rep nếu có để không tính rep cho đối tượng không phải con người
      if (repPhaseRef.current === 'down') {
        repPhaseRef.current = 'up';
        reachedDepthRef.current = false;
        setReachedDepth(false);
        setDepthStatus('ready');
      }
      return; // CHẶN HOÀN TOÀN: CHỈ TÍNH CON NGƯỜI
    }

    // ── BIOMETRIC SUBJECT LOCK (ĐỐI TƯỢNG DUY NHẤT - KHÔNG CHUYỂN SANG NGƯỜI KHÁC) ──
    const currentSig = extractBiometricSignature(results.poseLandmarks);

    // BƯỚC 1: Khóa đối tượng ban đầu nếu chưa khóa
    if (!lockedSignatureRef.current && currentSig) {
      lockFramesCountRef.current++;
      if (lockFramesCountRef.current >= 6) {
        lockedSignatureRef.current = currentSig;
        setSubjectStatus('matched');
        setSubjectMatchScore(100);
        lastSeenUserTimeRef.current = Date.now();
        isUserAwayRef.current = false;
        speakVoice('Đã khóa nhận diện người tập duy nhất.');
      } else {
        setSubjectStatus('locking');
      }
    }

    // BƯỚC 2: Đối chiếu chữ ký sinh trắc khi đã khóa
    if (lockedSignatureRef.current && currentSig) {
      const match = compareBiometricSignatures(lockedSignatureRef.current, currentSig);
      setSubjectMatchScore(match.similarity);

      // TRƯỜNG HỢP 2A: PHÁT HIỆN NGƯỜI KHÁC BƯỚC VÀO -> CHẶN TUYỆT ĐỐI!
      if (!match.isSamePerson) {
        setSubjectStatus('stranger_detected');
        setAntiCheatAlert(`🚫 PHÁT HIỆN NGƯỜI KHÁC: Hệ thống đã khóa với người tập ban đầu! (Độ khớp: ${match.similarity}%)`);
        setFeedback(`🚫 Không phải người tập ban đầu! Đang khóa với bạn (Độ khớp: ${match.similarity}% < 68%)`);

        // Vẽ khung xương cảnh báo màu đỏ
        drawPose(ctx, results, {
          color: '#FF4757',
          lineWidth: 4,
          pointRadius: 6,
          mirror: true,
        });

        if (!strangerAlertCooldownRef.current) {
          speakVoice('Phát hiện người khác. Hệ thống đã khóa với người tập ban đầu.');
          strangerAlertCooldownRef.current = true;
          setTimeout(() => { strangerAlertCooldownRef.current = false; }, 4000);
        }

        // Hủy chu kỳ rep dở dang
        if (repPhaseRef.current === 'down') {
          repPhaseRef.current = 'up';
          reachedDepthRef.current = false;
          setReachedDepth(false);
          setDepthStatus('ready');
        }

        return; // CHẶN HOÀN TOÀN: TUYỆT ĐỐI KHÔNG THIẾT LẬP LÊN NGƯỜI KHÁC & KHÔNG ĐẾM REP
      }

      // TRƯỜNG HỢP 2B: ĐÚNG LÀ NGƯỜI BAN ĐẦU
      lastSeenUserTimeRef.current = Date.now();
      if (isUserAwayRef.current) {
        isUserAwayRef.current = false;
        speakVoice('Chào mừng bạn quay lại!');
      }
      setSubjectStatus('matched');
      setAntiCheatAlert('');
    }

    // Đã xác nhận là con người thật VÀ đúng đối tượng duy nhất đã khóa
    setHasPerson(true);

    drawPose(ctx, results, {
      color: reachedDepthRef.current ? '#2ED573' : '#FFA502',
      lineWidth: 4,
      pointRadius: 6,
      mirror: true,
    });

    // Calculate elbow angle & shoulder depth for pushup rep tracking
    if (typeParam === 'pushup' && results.poseLandmarks) {
      const landmarks = results.poseLandmarks;
      const LEFT_SHOULDER = 11, LEFT_ELBOW = 13, LEFT_WRIST = 15;
      const RIGHT_SHOULDER = 12, RIGHT_ELBOW = 14, RIGHT_WRIST = 16;

      const leftShoulder = landmarks[LEFT_SHOULDER];
      const leftElbow = landmarks[LEFT_ELBOW];
      const leftWrist = landmarks[LEFT_WRIST];

      const rightShoulder = landmarks[RIGHT_SHOULDER];
      const rightElbow = landmarks[RIGHT_ELBOW];
      const rightWrist = landmarks[RIGHT_WRIST];

      // Visibility assessment
      const leftVis = ((leftShoulder?.visibility || 0) + (leftElbow?.visibility || 0) + (leftWrist?.visibility || 0)) / 3;
      const rightVis = ((rightShoulder?.visibility || 0) + (rightElbow?.visibility || 0) + (rightWrist?.visibility || 0)) / 3;

      let leftAngle: number = 0;
      let rightAngle: number = 0;
      let hasLeftAngle: boolean = false;
      let hasRightAngle: boolean = false;

      if (leftShoulder && leftElbow && leftWrist && leftVis >= 0.35) {
        leftAngle = calculateAngle(
          { x: leftShoulder.x, y: leftShoulder.y },
          { x: leftElbow.x, y: leftElbow.y },
          { x: leftWrist.x, y: leftWrist.y }
        );
        hasLeftAngle = true;
      }

      if (rightShoulder && rightElbow && rightWrist && rightVis >= 0.35) {
        rightAngle = calculateAngle(
          { x: rightShoulder.x, y: rightShoulder.y },
          { x: rightElbow.x, y: rightElbow.y },
          { x: rightWrist.x, y: rightWrist.y }
        );
        hasRightAngle = true;
      }

      // Check if shoulder has reached or gone past elbow height (Y >= elbow.Y in screen space)
      let isShoulderPastElbow: boolean = false;
      let angle: number = 0;
      let hasAngle: boolean = false;

      if (hasLeftAngle && hasRightAngle) {
        angle = (leftAngle + rightAngle) / 2;
        hasAngle = true;
        // In MediaPipe screen space, Y increases downwards towards floor
        const leftPast: boolean = leftShoulder.y >= leftElbow.y - 0.015;
        const rightPast: boolean = rightShoulder.y >= rightElbow.y - 0.015;
        isShoulderPastElbow = leftPast || rightPast;
      } else if (hasLeftAngle && leftShoulder && leftElbow) {
        angle = leftAngle;
        hasAngle = true;
        isShoulderPastElbow = leftShoulder.y >= leftElbow.y - 0.015;
      } else if (hasRightAngle && rightShoulder && rightElbow) {
        angle = rightAngle;
        hasAngle = true;
        isShoulderPastElbow = rightShoulder.y >= rightElbow.y - 0.015;
      }

      if (hasAngle) {
        const roundedAngle = Math.round(angle);
        setCurrentJointAngle(roundedAngle);

        // Quy tắc: Tính đạt chuẩn khi góc khuỷu tay <= 90° HOẶC vai hạ ngang/qua khuỷu tay
        const isDepthMet = angle <= PUSHUP_CONFIG.MAX_DEPTH_ANGLE || isShoulderPastElbow;

        if (!repCooldownRef.current) {
          // --- BẮT ĐẦU HẠ NGƯỜI (DOWN PHASE) ---
          if (angle < PUSHUP_CONFIG.DOWN_START && repPhaseRef.current === 'up') {
            repPhaseRef.current = 'down';
            reachedDepthRef.current = false;
            setReachedDepth(false);
            minAngleInRepRef.current = angle;
            setDepthStatus('going_down');
            setFeedback(`Đang hạ người... Hạ vai ngang hoặc qua khuỷu tay (≤${PUSHUP_CONFIG.MAX_DEPTH_ANGLE}°)`);
          }

          // --- TRONG PHA HẠ NGƯỜI (DOWN PHASE) ---
          if (repPhaseRef.current === 'down') {
            minAngleInRepRef.current = Math.min(minAngleInRepRef.current, angle);

            // Kiểm tra đạt độ sâu chuẩn (vai = hoặc qua khuỷu tay)
            if (isDepthMet) {
              reachedDepthRef.current = true;
              setReachedDepth(true);
              setDepthStatus('depth_passed');
              setFeedback('✅ Đã đạt độ sâu chuẩn (vai qua khuỷu tay)! Hãy đẩy thẳng tay lên!');
            } else if (!reachedDepthRef.current) {
              setDepthStatus('going_down');
              setFeedback(`Hạ vai thêm một chút... (${roundedAngle}° → cần ≤${PUSHUP_CONFIG.MAX_DEPTH_ANGLE}°)`);
            }

            // --- PHA ĐẨY LÊN HOÀN TẤT REP (UP PHASE) ---
            if (angle >= PUSHUP_CONFIG.EXTENDED_ANGLE) {
              if (reachedDepthRef.current) {
                // ✅ HỢP LỆ: ĐÃ ĐẠT ĐỘ SÂU (VAI = HOẶC QUA KHUỶU TAY)
                setReps(prev => prev + 1);
                setValidReps(prev => prev + 1);
                const score = Math.min(100, Math.max(90, Math.round(100 - (minAngleInRepRef.current - 65) * 0.3)));
                setFormAccuracy(score);
                speakVoice(`${reps + 1}. Chuẩn form!`);
                setFeedback('🎉 Tuyệt vời! 1 Rep chuẩn form (vai đã qua khuỷu tay)!');
              } else {
                // ❌ KHÔNG HỢP LỆ: CHƯA ĐẠT ĐỘ SÂU (CHƯA QUA HOẶC KHÔNG BẰNG KHUỶU TAY)
                setFeedback(`⚠️ Không tính rep: Vai chưa hạ ngang hoặc qua khuỷu tay (đạt ${Math.round(minAngleInRepRef.current)}°, cần ≤90°)!`);
                speakVoice('Chưa đủ sâu! Cần hạ vai ngang hoặc qua khuỷu tay.');
                setFormAccuracy(prev => Math.max(65, prev - 6));
              }

              // Reset trạng thái cho rep tiếp theo
              repPhaseRef.current = 'up';
              reachedDepthRef.current = false;
              setReachedDepth(false);
              setDepthStatus('ready');
              minAngleInRepRef.current = 180;

              repCooldownRef.current = true;
              setTimeout(() => {
                repCooldownRef.current = false;
              }, 450);
            }
          } else if (repPhaseRef.current === 'up' && angle >= 155) {
            setDepthStatus('ready');
            setFeedback('Tư thế chuẩn! Tay duỗi thẳng, sẵn sàng cho rep tiếp theo');
          }
        }
      }
    } else if (typeParam === 'pullup' && results.poseLandmarks) {
      const landmarks = results.poseLandmarks;
      const nose = landmarks[0];
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftElbow = landmarks[13];
      const rightElbow = landmarks[14];
      const leftWrist = landmarks[15];
      const rightWrist = landmarks[16];

      // Cập nhật vị trí thanh xà theo 2 cổ tay
      let wristMidY: number = virtualBarYRef.current;
      if (leftWrist && rightWrist && (leftWrist.visibility || 0) > 0.3 && (rightWrist.visibility || 0) > 0.3) {
        wristMidY = (leftWrist.y + rightWrist.y) / 2;
        virtualBarYRef.current = virtualBarYRef.current * 0.85 + wristMidY * 0.15;
      } else if (leftWrist && (leftWrist.visibility || 0) > 0.3) {
        wristMidY = leftWrist.y;
        virtualBarYRef.current = virtualBarYRef.current * 0.85 + wristMidY * 0.15;
      } else if (rightWrist && (rightWrist.visibility || 0) > 0.3) {
        wristMidY = rightWrist.y;
        virtualBarYRef.current = virtualBarYRef.current * 0.85 + wristMidY * 0.15;
      }

      const barY = virtualBarYRef.current;

      // Vẽ thanh xà phát sáng trên canvas khi đang tập với badge nổi bật
      const barPixelY = barY * canvas.height;
      ctx.save();
      const liveBarColor = reachedDepthRef.current ? '#2ED573' : '#00E5FF';
      ctx.strokeStyle = liveBarColor;
      ctx.lineWidth = 6;
      ctx.shadowColor = liveBarColor;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(20, barPixelY);
      ctx.lineTo(canvas.width - 20, barPixelY);
      ctx.stroke();

      const liveLabelText = reachedDepthRef.current ? '✨ ĐÃ VƯỢT XÀ (ĐẠT CHUẨN)' : '🎯 VỊ TRÍ XÀ - KÉO ĐẦU VƯỢT QUA';
      ctx.font = 'bold 13px Inter, sans-serif';
      const liveMetrics = ctx.measureText(liveLabelText);
      const liveBadgeW = liveMetrics.width + 24;
      const liveBadgeH = 28;
      const liveBadgeX = 24;
      const liveBadgeY = Math.max(10, barPixelY - 36);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = liveBarColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(liveBadgeX, liveBadgeY, liveBadgeW, liveBadgeH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = liveBarColor;
      ctx.fillText(liveLabelText, liveBadgeX + 12, liveBadgeY + 19);
      ctx.restore();

      // Đo góc khuỷu tay 2 bên
      let leftAngle: number = 0;
      let rightAngle: number = 0;
      let hasLeftAngle: boolean = false;
      let hasRightAngle: boolean = false;

      if (leftShoulder && leftElbow && leftWrist && (leftShoulder.visibility || 0) > 0.3) {
        leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
        hasLeftAngle = true;
      }
      if (rightShoulder && rightElbow && rightWrist && (rightShoulder.visibility || 0) > 0.3) {
        rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
        hasRightAngle = true;
      }

      let angle: number = 0;
      let hasAngle: boolean = false;

      if (hasLeftAngle && hasRightAngle) {
        angle = (leftAngle + rightAngle) / 2;
        hasAngle = true;
      } else if (hasLeftAngle) {
        angle = leftAngle;
        hasAngle = true;
      } else if (hasRightAngle) {
        angle = rightAngle;
        hasAngle = true;
      }

      if (hasAngle) {
        const roundedAngle = Math.round(angle);
        setCurrentJointAngle(roundedAngle);

        // QUY TẮC: ĐẦU VƯỢT QUA TAY LÀ TÍNH HÍT XÀ
        // Trong hệ tọa độ Y: 0 ở trên đỉnh, 1 ở dưới đáy.
        // Khi đầu/mũi kéo cao hơn thanh xà: nose.y <= barY + tolerance
        const isHeadOverHands = nose && (nose.visibility || 0) > 0.35
          ? (nose.y <= barY + PULLUP_CONFIG.HEAD_OVER_BAR_TOLERANCE)
          : (angle <= PULLUP_CONFIG.ARM_FLEXED_ANGLE); // Dự phòng khi khuôn mặt che khuất

        if (!repCooldownRef.current) {
          // --- BẮT ĐẦU KÉO LÊN (PULL PHASE) ---
          if (angle < 125 && repPhaseRef.current === 'up') {
            repPhaseRef.current = 'down'; // 'down' đại diện trạng thái đang co tay kéo lên
            reachedDepthRef.current = false;
            setReachedDepth(false);
            setDepthStatus('going_down');
            setFeedback('Đang kéo lên... Hãy đưa đầu vượt qua tay!');
          }

          // --- TRONG PHA KÉO LÊN ---
          if (repPhaseRef.current === 'down') {
            // Kiểm tra xem đầu đã vượt qua tay/xà chưa
            if (isHeadOverHands) {
              reachedDepthRef.current = true;
              setReachedDepth(true);
              setDepthStatus('depth_passed');
              setFeedback('✅ ĐẦU ĐÃ VƯỢT QUA TAY! Hãy hạ thẳng tay để hoàn tất rep!');
            } else if (!reachedDepthRef.current) {
              setDepthStatus('going_down');
              setFeedback(`Kéo cao thêm! Đưa đầu vượt qua tay! (Khuỷu: ${roundedAngle}°)`);
            }

            // --- PHA HẠ NGƯỜI VỀ DEAD HANG HOÀN TẤT REP ---
            if (angle >= PULLUP_CONFIG.ARM_EXTENDED_ANGLE) {
              if (reachedDepthRef.current) {
                // ✅ HỢP LỆ: ĐẦU ĐÃ VƯỢT QUA TAY
                setReps(prev => prev + 1);
                setValidReps(prev => prev + 1);
                setFormAccuracy(97);
                speakVoice(`${reps + 1}. Tốt! Đầu đã qua xà!`);
                setFeedback('🎉 Tuyệt vời! 1 Rep hít xà chuẩn (đầu đã vượt qua tay)!');
              } else {
                // ❌ KHÔNG HỢP LỆ: ĐẦU CHƯA VƯỢT QUA TAY
                setFeedback('⚠️ Không tính rep: Đầu chưa vượt qua tay! Hãy kéo đầu vượt qua xà!');
                speakVoice('Chưa tính rep: Đầu chưa vượt qua tay!');
                setFormAccuracy(prev => Math.max(65, prev - 8));
              }

              // Reset trạng thái cho rep tiếp theo
              repPhaseRef.current = 'up';
              reachedDepthRef.current = false;
              setReachedDepth(false);
              setDepthStatus('ready');

              repCooldownRef.current = true;
              setTimeout(() => {
                repCooldownRef.current = false;
              }, 500);
            }
          } else if (repPhaseRef.current === 'up' && angle >= 135) {
            setDepthStatus('ready');
            setFeedback('Treo người thẳng tay! Sẵn sàng kéo rep tiếp theo');
          }
        }
      }
    }
  }, [phase, typeParam, antiCheatAlert, reps, checkPushupPosition, checkPullupPosition, startCountdown]);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    handlePoseResultsRef.current = handlePoseResults;
  }, [handlePoseResults]);

  // Handle pose detection errors → enable demo mode
  useEffect(() => {
    if (poseHookError) {
      console.warn('Pose detection error, enabling demo mode:', poseHookError);
      setDemoMode(true);
      setPhase('waiting_pose'); // Stay on waiting screen but allow manual start
    }
  }, [poseHookError]);

  // Initialize camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
            setIsCameraReady(true);
          };
          try {
            await videoRef.current.play();
          } catch {}
          setIsCameraReady(true);
        }
        setCameraError('');
      } catch (err) {
        console.error('Camera error:', err);
        setCameraError('Không thể truy cập camera. Vui lòng cho phép truy cập camera.');
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Pose detection loop – starts when video element is ready
  useEffect(() => {
    if (!isCameraReady) return;
    const video = videoRef.current;
    if (!video) return;

    let isRunning = true;
    const detectFrame = () => {
      if (!isRunning) return;
      if (video && video.readyState >= 2) {
        detectPose(video);
      }
      animationFrameRef.current = requestAnimationFrame(detectFrame);
    };

    animationFrameRef.current = requestAnimationFrame(detectFrame);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCameraReady, detectPose]);

  // Transition loading → waiting_pose once model is ready
  useEffect(() => {
    if (isModelReady && phase === 'loading') {
      setPhase('waiting_pose');
      setDetectionDetails('Đang quét tư thế...');
    }
  }, [isModelReady, phase]);

  // Demo mode skeleton animation (only while exercising)
  useEffect(() => {
    if (!demoMode || !isExercising) {
      if (demoAnimationRef.current) cancelAnimationFrame(demoAnimationRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawDemoSkeleton = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now() / 600;
      const w = canvas.width, h = canvas.height;

      if (typeParam === 'pullup') {
        const pullProgress = (Math.sin(t) + 1) / 2; // 0: dead hang, 1: top
        const barY = h * 0.22;
        const headY = barY + 22 - pullProgress * 38;
        const isOver = headY < barY;

        demoAngleRef.current = 145 - pullProgress * 75;
        setCurrentJointAngle(Math.round(demoAngleRef.current));

        // Draw bar
        ctx.strokeStyle = isOver ? '#2ED573' : '#00E5FF';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(w * 0.2, barY);
        ctx.lineTo(w * 0.8, barY);
        ctx.stroke();

        // Draw stick figure
        ctx.strokeStyle = isOver ? '#2ED573' : '#FFA502';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const shoulderY = headY + 22;
        const leftHand = { x: w * 0.38, y: barY };
        const rightHand = { x: w * 0.62, y: barY };
        const leftShoulder = { x: w * 0.42, y: shoulderY };
        const rightShoulder = { x: w * 0.58, y: shoulderY };
        const hips = { x: w * 0.5, y: shoulderY + 50 };

        // Head
        ctx.beginPath();
        ctx.arc(w * 0.5, headY, 13, 0, Math.PI * 2);
        ctx.stroke();

        // Arms
        ctx.beginPath();
        ctx.moveTo(leftHand.x, leftHand.y);
        ctx.lineTo(w * 0.35, (barY + shoulderY) / 2);
        ctx.lineTo(leftShoulder.x, leftShoulder.y);
        ctx.moveTo(rightHand.x, rightHand.y);
        ctx.lineTo(w * 0.65, (barY + shoulderY) / 2);
        ctx.lineTo(rightShoulder.x, rightShoulder.y);

        // Shoulders & torso
        ctx.moveTo(leftShoulder.x, leftShoulder.y);
        ctx.lineTo(rightShoulder.x, rightShoulder.y);
        ctx.moveTo(w * 0.5, shoulderY);
        ctx.lineTo(hips.x, hips.y);

        // Legs
        ctx.lineTo(w * 0.46, hips.y + 55);
        ctx.moveTo(hips.x, hips.y);
        ctx.lineTo(w * 0.54, hips.y + 55);
        ctx.stroke();

        demoAnimationRef.current = requestAnimationFrame(drawDemoSkeleton);
        return;
      }

      const offsetY = Math.sin(t) * 18;

      demoAngleRef.current = 160 + Math.sin(t * 0.5) * 70;
      setCurrentJointAngle(Math.round(demoAngleRef.current));

      ctx.strokeStyle = '#2ED573';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = '#FF6B35';

      const pts = [
        { x: w * 0.5,  y: h * 0.28 + offsetY },
        { x: w * 0.42, y: h * 0.42 + offsetY },
        { x: w * 0.58, y: h * 0.42 + offsetY },
        { x: w * 0.36, y: h * 0.56 + offsetY * 0.8 },
        { x: w * 0.64, y: h * 0.56 + offsetY * 0.8 },
        { x: w * 0.44, y: h * 0.7  + offsetY * 0.5 },
        { x: w * 0.56, y: h * 0.7  + offsetY * 0.5 },
        { x: w * 0.44, y: h * 0.88 + offsetY * 0.3 },
        { x: w * 0.56, y: h * 0.88 + offsetY * 0.3 },
      ];

      ctx.beginPath();
      ctx.moveTo(pts[1].x, pts[1].y); ctx.lineTo(pts[2].x, pts[2].y);
      ctx.lineTo(pts[6].x, pts[6].y); ctx.lineTo(pts[5].x, pts[5].y);
      ctx.closePath(); ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pts[1].x, pts[1].y); ctx.lineTo(pts[3].x, pts[3].y);
      ctx.moveTo(pts[2].x, pts[2].y); ctx.lineTo(pts[4].x, pts[4].y);
      ctx.moveTo(pts[5].x, pts[5].y); ctx.lineTo(pts[7].x, pts[7].y);
      ctx.moveTo(pts[6].x, pts[6].y); ctx.lineTo(pts[8].x, pts[8].y);
      ctx.stroke();

      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5.5, 0, Math.PI * 2);
        ctx.fill();
      });

      demoAnimationRef.current = requestAnimationFrame(drawDemoSkeleton);
    };

    drawDemoSkeleton();
    return () => { if (demoAnimationRef.current) cancelAnimationFrame(demoAnimationRef.current); };
  }, [demoMode, isExercising]);

  // Voice coaching
  const speakVoice = (text: string) => {
    if (!soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  };

  // Cleanup countdown timer on unmount
  useEffect(() => () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
  }, []);

  // Timer loop – only while exercising
  useEffect(() => {
    if (!isExercising) return;
    const timer = setInterval(() => setSeconds(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isExercising]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    setPhase('completed');
    const durationMin = Math.max(1, Math.round(seconds / 60));
    const cal = Math.round(validReps * exercise.caloriesPerRep);
    recordExerciseSession(typeParam, validReps, durationMin, cal);
    speakVoice(`Tuyệt vời! Bạn đã hoàn thành ${validReps} lần chuẩn form.`);
  };

  const handleManualStart = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    isCountingDownRef.current = false;
    setCountdown(0);
    setPhase('exercising');
    speakVoice('Bắt đầu! AI Pose tracking đã kích hoạt!');
  };

  return (
    <div style={{
      height: '100vh',
      maxHeight: '100vh',
      background: '#0B0D14',
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
        minHeight: 0,
        background: '#121622',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={() => setIsCameraReady(true)}
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
          top: 12, left: 12, right: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 20,
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', cursor: 'pointer',
            }}
          >
            <ArrowLeft size={18} />
          </button>

            {/* Single-Subject Lock Status Pill - High Contrast */}
            <div style={{
              padding: '6px 14px', borderRadius: 20,
              background: 'rgba(15, 23, 42, 0.94)',
              backdropFilter: 'blur(16px)',
              border: `2px solid ${
                subjectStatus === 'matched'
                  ? '#2ED573'
                  : subjectStatus === 'stranger_detected'
                  ? '#FF4757'
                  : subjectStatus === 'user_away'
                  ? '#FFA502'
                  : '#00E5FF'
              }`,
              boxShadow: `0 4px 20px rgba(0, 0, 0, 0.6), 0 0 16px ${
                subjectStatus === 'matched'
                  ? 'rgba(46, 213, 115, 0.35)'
                  : subjectStatus === 'stranger_detected'
                  ? 'rgba(255, 71, 87, 0.45)'
                  : subjectStatus === 'user_away'
                  ? 'rgba(255, 165, 2, 0.35)'
                  : 'rgba(0, 229, 255, 0.3)'
              }`,
              display: 'flex', alignItems: 'center', gap: 7,
              color: '#FFFFFF',
              fontSize: 11.5, fontWeight: 800,
            }}>
              {subjectStatus === 'matched' ? (
                <Lock size={14} color="#2ED573" />
              ) : subjectStatus === 'stranger_detected' ? (
                <UserX size={14} color="#FF4757" />
              ) : (
                <UserCheck size={14} color="#00E5FF" />
              )}
              <span>
                {subjectStatus === 'matched'
                  ? `🛡️ ĐÃ KHÓA: BẠN (${subjectMatchScore || 100}%)`
                  : subjectStatus === 'stranger_detected'
                  ? `🚫 CHẶN: NGƯỜI LẠ (${subjectMatchScore || 0}%)`
                  : subjectStatus === 'user_away'
                  ? '⚠️ BẠN ĐANG RỜI CAMERA (TẠM DỪNG)'
                  : '🔒 ĐANG KHÓA DUY NHẤT BẠN...'}
              </span>
            </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', cursor: 'pointer',
              }}
            >
              {soundEnabled ? <Volume2 size={18} color="#2ED573" /> : <VolumeX size={18} color="#ff4757" />}
            </button>

            {/* Quick End Workout Button on Top Right */}
            <button
              onClick={isExercising ? handleFinish : () => navigate('/exercise')}
              style={{
                padding: '6px 12px',
                borderRadius: 10,
                background: isExercising ? 'rgba(255, 71, 87, 0.35)' : 'rgba(255, 255, 255, 0.12)',
                border: `1px solid ${isExercising ? '#FF4757' : 'rgba(255, 255, 255, 0.3)'}`,
                color: isExercising ? '#FF6B81' : '#FFFFFF',
                fontSize: 11.5,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                backdropFilter: 'blur(10px)',
                boxShadow: isExercising ? '0 0 12px rgba(255, 71, 87, 0.4)' : 'none',
              }}
            >
              {isExercising ? <CheckCircle2 size={14} color="#FF6B81" /> : <X size={14} />}
              <span>{isExercising ? 'KẾT THÚC' : 'THOÁT'}</span>
            </button>
          </div>
        </div>

        {/* ── LOADING OVERLAY ───────────────────────────────────────────── */}
        {phase === 'loading' && (poseLoading || !isModelReady) && !cameraError && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 50, gap: 16,
          }}>
            <div style={{ width: 200, height: 300, position: 'relative' }}>
              <svg viewBox="0 0 200 300" style={{ width: '100%', height: '100%' }}>
                <circle cx="100" cy="40" r="25" fill="none" stroke="#2ED573" strokeWidth="3" opacity="0.7">
                  <animate attributeName="r" values="23;27;23" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <line x1="100" y1="65" x2="100" y2="160" stroke="#2ED573" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                <line x1="100" y1="80" x2="60" y2="130" stroke="#2ED573" strokeWidth="3" strokeLinecap="round" opacity="0.7">
                  <animate attributeName="x2" values="55;65;55" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="y2" values="125;135;125" dur="2s" repeatCount="indefinite" />
                </line>
                <line x1="100" y1="80" x2="140" y2="130" stroke="#2ED573" strokeWidth="3" strokeLinecap="round" opacity="0.7">
                  <animate attributeName="x2" values="135;145;135" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="y2" values="125;135;125" dur="2s" repeatCount="indefinite" />
                </line>
                <line x1="100" y1="160" x2="70" y2="250" stroke="#2ED573" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                <line x1="100" y1="160" x2="130" y2="250" stroke="#2ED573" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                <circle cx="100" cy="80" r="6" fill="#FF6B35" opacity="0.8">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
            <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Đang tải AI Pose...</div>
            <div style={{ color: '#8E94A5', fontSize: 12, textAlign: 'center', maxWidth: 200 }}>
              Nhận diện khung xương &amp; đếm rep tự động
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#2ED573',
                  animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* ── WAITING POSE OVERLAY - ULTRA COMPACT STREAMLINED HUD ────────── */}
        {(phase === 'waiting_pose') && !cameraError && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 22%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'flex-end',
            zIndex: 40,
            paddingBottom: 10,
            pointerEvents: 'none',
          }}>
            {/* Scan frame corners - Framed near outer borders so face/body are 100% visible */}
            {['topleft','topright','bottomleft','bottomright'].map(corner => {
              const isTop = corner.startsWith('top');
              const isLeft = corner.endsWith('left');
              return (
                <div key={corner} style={{
                  position: 'absolute',
                  top: isTop ? 62 : undefined,
                  bottom: !isTop ? 14 : undefined,
                  left: isLeft ? 16 : undefined,
                  right: !isLeft ? 16 : undefined,
                  width: 24, height: 24,
                  borderTop: isTop ? '3px solid #2ED573' : 'none',
                  borderBottom: !isTop ? '3px solid #2ED573' : 'none',
                  borderLeft: isLeft ? '3px solid #2ED573' : 'none',
                  borderRight: !isLeft ? '3px solid #2ED573' : 'none',
                  borderRadius: isTop && isLeft ? '6px 0 0 0' : isTop && !isLeft ? '0 6px 0 0' : !isTop && isLeft ? '0 0 0 6px' : '0 0 6px 0',
                  boxShadow: '0 0 10px rgba(46, 213, 115, 0.4)',
                  opacity: 0.8,
                }} />
              );
            })}

            {/* Compact Bottom HUD Bar - Sleek, low-profile, non-obtrusive */}
            <div style={{
              width: 'calc(100% - 24px)',
              maxWidth: 460,
              background: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(16px)',
              border: `1.5px solid ${detectionConfidence >= 70 ? 'rgba(46, 213, 115, 0.7)' : 'rgba(0, 229, 255, 0.5)'}`,
              borderRadius: 16,
              padding: '10px 14px',
              display: 'flex', flexDirection: 'column', gap: 6,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
              pointerEvents: 'auto',
            }}>
              {/* Row 1: Header + Confidence + Quick Skip */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <ScanLine size={17} color="#00E5FF" style={{ flexShrink: 0, animation: 'pulse 1.8s ease-in-out infinite' }} />
                  <div style={{
                    fontSize: 12, fontWeight: 900, color: '#FFFFFF',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {typeParam === 'pullup' ? 'CHỐT MỐC XÀ & NHẬN DIỆN BẠN' : 'NHẬN DIỆN NGƯỜI TẬP'}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 900,
                    padding: '1px 6px', borderRadius: 6,
                    background: detectionConfidence >= 70 ? 'rgba(46,213,115,0.25)' : 'rgba(255,165,2,0.25)',
                    border: `1px solid ${detectionConfidence >= 70 ? '#2ED573' : '#FFA502'}`,
                    color: detectionConfidence >= 70 ? '#2ED573' : '#FFA502',
                    flexShrink: 0,
                  }}>
                    {demoMode ? '--' : `${detectionConfidence}%`}
                  </span>
                </div>

                {/* Compact Skip Button */}
                <button
                  onClick={handleManualStart}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#FFFFFF', fontSize: 11, fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                    flexShrink: 0,
                  }}
                >
                  <Play size={11} fill="#FFFFFF" />
                  <span>Vào tập ngay</span>
                </button>
              </div>

              {/* Row 2: Slim Progress Bar */}
              {!demoMode && (
                <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${detectionConfidence}%`,
                    background: detectionConfidence >= 70
                      ? 'linear-gradient(90deg, #2ED573, #7BED9F)'
                      : 'linear-gradient(90deg, #00E5FF, #3B82F6)',
                    transition: 'width 0.25s ease',
                  }} />
                </div>
              )}

              {/* Row 3: Horizontal Micro-Chips (Single Row) */}
              {!demoMode && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  {(typeParam === 'pullup' ? [
                    { key: 'isHuman',      label: 'Người thật', icon: '👤' },
                    { key: 'isVisible',    label: 'Thấy xà',    icon: '👁' },
                    { key: 'isHandsOnBar', label: 'Bám xà',     icon: '🖐' },
                    { key: 'isHanging',    label: 'Treo người', icon: '↕️' },
                  ] : [
                    { key: 'isVisible',    label: 'Toàn thân',  icon: '👁' },
                    { key: 'isHorizontal', label: 'Phẳng sàn',  icon: '📐' },
                    { key: 'isArmReady',   label: 'Hai tay',    icon: '💪' },
                    { key: 'isFaceDown',   label: 'Mặt úp',     icon: '👇' },
                  ]).map(({ key, label, icon }) => {
                    const ok = !!detectionChecks[key];
                    return (
                      <div key={key} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 8px', borderRadius: 8,
                        background: ok ? 'rgba(46, 213, 115, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                        border: `1px solid ${ok ? '#2ED573' : 'rgba(148, 163, 184, 0.3)'}`,
                        fontSize: 10.5, fontWeight: 700,
                        color: ok ? '#FFFFFF' : '#CBD5E1',
                      }}>
                        <span style={{ fontSize: 11 }}>{icon}</span>
                        <span>{label}:</span>
                        <span style={{
                          fontSize: 9.5, fontWeight: 900,
                          padding: '1px 4px', borderRadius: 4,
                          background: ok ? 'rgba(46, 213, 115, 0.35)' : 'rgba(148, 163, 184, 0.2)',
                          color: ok ? '#2ED573' : '#94A3B8',
                        }}>
                          {ok ? 'Đạt' : 'Chờ'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Row 4: 1-Line Dynamic Detection Status */}
              <div style={{
                fontSize: 10.5, fontWeight: 700, color: '#FFEAA7',
                display: 'flex', alignItems: 'center', gap: 5,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                <span style={{ fontSize: 11 }}>💡</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {demoMode ? 'Chế độ mô phỏng thủ công' : detectionDetails}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Camera Error */}
        {cameraError && (
          <div style={{
            position: 'absolute',
            top: '50%', left: 16, right: 16,
            transform: 'translateY(-50%)',
            padding: 20, borderRadius: 16,
            background: 'rgba(255,71,87,0.2)',
            border: '1px solid #FF4757',
            color: '#FF4757', textAlign: 'center',
            fontSize: 14, zIndex: 30,
          }}>
            {cameraError}
          </div>
        )}

        {/* ── COUNTDOWN OVERLAY ────────────────────────────────────────────── */}
        {phase === 'countdown' && countdown > 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 60,
            gap: 16,
          }}>
            {/* Pulsing ring */}
            <div style={{
              position: 'relative',
              width: 140, height: 140,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '3px solid #2ED573',
                animation: 'countdownRing 1s ease-out infinite',
                opacity: 0.5,
              }} />
              <div style={{
                width: 120, height: 120, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(46,213,115,0.25), rgba(123,237,159,0.05))',
                border: '3px solid #2ED573',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 50px rgba(46,213,115,0.6)',
              }}>
                <span
                  key={countdown}
                  style={{
                    fontSize: 56, fontWeight: 900, color: '#2ED573',
                    textShadow: '0 0 24px rgba(46,213,115,0.9)',
                    animation: 'countdownPop 1s ease-out',
                  }}
                >{countdown}</span>
              </div>
            </div>

            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: 2 }}>
              BẮT ĐẦU TỰ ĐỘNG!
            </div>
            <div style={{
              padding: '8px 20px', borderRadius: 20,
              background: 'rgba(46,213,115,0.15)',
              border: '1px solid rgba(46,213,115,0.3)',
              fontSize: 12, color: '#2ED573', fontWeight: 700,
            }}>
              {typeParam === 'pullup' ? '✅ Vị trí xà & tư thế bám xà được xác nhận' : '✅ Tư thế hít đất được xác nhận'}
            </div>
            <div style={{ fontSize: 12, color: '#8E94A5' }}>
              Giữ nguyên tư thế!
            </div>
          </div>
        )}

        {/* Person Detection & Subject Lock Status */}
        {isExercising && (
          <div style={{
            position: 'absolute', top: 70, left: '50%',
            transform: 'translateX(-50%)',
            padding: '7px 16px', borderRadius: 20,
            background: subjectStatus === 'stranger_detected'
              ? 'rgba(255, 71, 87, 0.9)'
              : subjectStatus === 'user_away'
              ? 'rgba(255, 165, 2, 0.9)'
              : hasPerson
              ? 'rgba(46, 213, 115, 0.25)'
              : 'rgba(255, 71, 87, 0.25)',
            border: `1px solid ${
              subjectStatus === 'stranger_detected'
                ? '#FF4757'
                : subjectStatus === 'user_away'
                ? '#FFA502'
                : hasPerson
                ? '#2ED573'
                : '#FF4757'
            }`,
            color: subjectStatus === 'stranger_detected' || subjectStatus === 'user_away' ? '#fff' : (hasPerson ? '#2ED573' : '#FF4757'),
            fontSize: 12, fontWeight: 800, zIndex: 20,
            display: 'flex', alignItems: 'center', gap: 6,
            whiteSpace: 'nowrap',
            boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: subjectStatus === 'stranger_detected' ? '#fff' : (hasPerson ? '#2ED573' : '#FF4757'),
              animation: hasPerson ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }} />
            {subjectStatus === 'stranger_detected'
              ? '🚫 PHÁT HIỆN NGƯỜI KHÁC – KHÔNG ĐẾM REP'
              : subjectStatus === 'user_away'
              ? '⚠️ BẠN ĐÃ RỜI CAMERA – ĐANG TẠM DỪNG'
              : hasPerson
              ? '🔒 Đã xác thực: Đúng người tập duy nhất'
              : 'Không phát hiện người'}
          </div>
        )}

        {/* Live Real-Time Coaching & Angle Banner */}
        <div style={{
          position: 'absolute',
          bottom: 20, left: 16, right: 16,
          padding: '12px 18px',
          borderRadius: 16,
          background: 'rgba(14, 18, 28, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(46, 213, 115, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'linear-gradient(135deg, #2ED573, #7BED9F)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
            color: '#000',
          }}>
            {exercise.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 11, color: '#2ED573', fontWeight: 800, textTransform: 'uppercase' }}>
                🦴 AI Pose | Góc: {currentJointAngle}°
              </span>
              {/* Depth Status Pill */}
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 12,
                background: reachedDepth
                  ? 'rgba(46, 213, 115, 0.25)'
                  : depthStatus === 'going_down'
                  ? 'rgba(255, 165, 2, 0.25)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: reachedDepth
                  ? '#2ED573'
                  : depthStatus === 'going_down'
                  ? '#FFA502'
                  : '#8E94A5',
                border: `1px solid ${
                  reachedDepth
                    ? '#2ED573'
                    : depthStatus === 'going_down'
                    ? '#FFA502'
                    : 'rgba(255, 255, 255, 0.2)'
                }`,
              }}>
                {typeParam === 'pullup' ? (
                  reachedDepth
                    ? '✅ ĐẦU VƯỢT QUA XÀ'
                    : depthStatus === 'going_down'
                    ? '⚠️ KÉO ĐẦU QUA TAY'
                    : '🏋️ TREO NGƯỜI DUỖI TAY'
                ) : (
                  reachedDepth
                    ? '✅ VAI QUA KHUỶU (ĐẠT CHUẨN)'
                    : depthStatus === 'going_down'
                    ? '⚠️ HẠ SÂU THÊM (≤90°)'
                    : '💪 VỊ TRÍ CAO'
                )}
              </span>
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

      {/* Bottom Workout Dashboard Controls - Compact & Always Visible */}
      <div style={{
        padding: '8px 16px',
        background: '#121622',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        zIndex: 10,
        flexShrink: 0,
      }}>
        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
          {/* Rep Count Box */}
          <div style={{
            padding: '6px 4px',
            background: 'rgba(46, 213, 115, 0.1)',
            border: '1px solid rgba(46, 213, 115, 0.3)',
            borderRadius: 12,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: '#8E94A5', fontWeight: 600 }}>SỐ REP</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#2ED573', lineHeight: 1.1 }}>{reps}</div>
            <div style={{ fontSize: 9.5, color: '#2ED573', fontWeight: 700 }}>{validReps} chuẩn</div>
          </div>

          {/* Time Box */}
          <div style={{
            padding: '6px 4px',
            background: 'rgba(112, 161, 255, 0.1)',
            border: '1px solid rgba(112, 161, 255, 0.3)',
            borderRadius: 12,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: '#8E94A5', fontWeight: 600 }}>THỜI GIAN</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#70A1FF', marginTop: 1, lineHeight: 1.1 }}>
              {formatTime(seconds)}
            </div>
            <div style={{ fontSize: 9.5, color: '#8E94A5' }}>phút:giây</div>
          </div>

          {/* Calories Box */}
          <div style={{
            padding: '6px 4px',
            background: 'rgba(255, 71, 87, 0.1)',
            border: '1px solid rgba(255, 71, 87, 0.3)',
            borderRadius: 12,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: '#8E94A5', fontWeight: 600 }}>CALORIES</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#FF4757', marginTop: 1, lineHeight: 1.1 }}>
              {(validReps * exercise.caloriesPerRep).toFixed(0)}
            </div>
            <div style={{ fontSize: 9.5, color: '#FF4757' }}>kcal</div>
          </div>
        </div>

        {/* Action Buttons - Always Visible */}
        {phase === 'waiting_pose' || phase === 'loading' || phase === 'countdown' ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleManualStart}
              style={{
                flex: 1.8,
                padding: '10px 14px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #2ED573 0%, #7BED9F 100%)',
                border: 'none',
                color: '#0D0E15',
                fontSize: 13.5,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 4px 14px rgba(46, 213, 115, 0.35)',
              }}
            >
              <Play size={16} fill="#0D0E15" />
              <span>VÀO TẬP NGAY</span>
            </button>

            <button
              onClick={() => navigate('/exercise')}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#E2E8F0',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              <X size={15} />
              <span>THOÁT</span>
            </button>
          </div>
        ) : isExercising || isPaused ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setPhase(isPaused ? 'exercising' : 'paused')}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 12,
                background: '#1E2333',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
              <span>{isPaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
            </button>

            <button
              onClick={handleFinish}
              style={{
                flex: 1.8,
                padding: '10px 14px',
                borderRadius: 12,
                background: '#FF4757',
                border: 'none',
                color: '#fff',
                fontSize: 13.5,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 4px 16px rgba(255, 71, 87, 0.4)',
              }}
            >
              <CheckCircle2 size={16} />
              <span>KẾT THÚC & NHẬN THƯỞNG</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* Completion Modal */}
      {isCompleted && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 7, 12, 0.88)',
          backdropFilter: 'blur(16px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            background: '#161B29',
            borderRadius: 24,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            border: '1px solid rgba(46, 213, 115, 0.3)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
            textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'linear-gradient(135deg, #2ED573 0%, #7BED9F 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Trophy size={32} color="#0D0E15" />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>
              🎉 Hoàn Thành Buổi Tập!
            </h2>
            <p style={{ fontSize: 12, color: '#8E94A5', marginTop: 6, marginBottom: 18 }}>
              Số rep đã được xác minh qua AI Pose Biomechanics.
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 16,
              padding: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              marginBottom: 18,
            }}>
              <div>
                <div style={{ fontSize: 10, color: '#8E94A5' }}>Tổng Rep</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>{reps}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#8E94A5' }}>Chuẩn Form</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#2ED573' }}>{validReps}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#8E94A5' }}>Độ Chuẩn</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#FFA502' }}>{formAccuracy}%</div>
              </div>
            </div>

            <button
              onClick={() => navigate('/exercise')}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #2ED573 0%, #7BED9F 100%)',
                border: 'none',
                color: '#000',
                fontWeight: 900,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              Xác Nhận & Về Trang Tập Luyện
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
