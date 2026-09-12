import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  Navigation,
  Flame,
  Clock,
  Zap,
  Volume2,
  VolumeX,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  Trophy,
  Footprints,
  Compass,
  Sparkles,
  MapPin,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { useUser } from '../context/UserContext';

interface GPSCoordinate {
  lat: number;
  lng: number;
  timestamp: number;
  speed: number | null; // m/s
  accuracy: number;
}

export const GPSWalkingPage: React.FC = () => {
  const navigate = useNavigate();
  const { recordExerciseSession, showToast } = useUser();

  // Tracking state
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Mode: 'outdoor' (GPS + Motion Sensor Fusion) or 'indoor' (Pedometer Motion only)
  const [trackMode, setTrackMode] = useState<'outdoor' | 'indoor'>('outdoor');
  const [targetType, setTargetType] = useState<'steps' | 'distance' | 'free'>('steps');
  const [targetValue, setTargetValue] = useState<number>(3000); // 3000 steps or 2.0 km

  // Metrics
  const [steps, setSteps] = useState(0);
  const [distanceMeters, setDistanceMeters] = useState(0); // in meters
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0);
  const [avgSpeedKmh, setAvgSpeedKmh] = useState(0);
  const [currentPace, setCurrentPace] = useState<string>('00:00'); // min/km
  const [calories, setCalories] = useState(0);
  const [cadence, setCadence] = useState(0); // steps per minute (SPM)
  const [heartRate, setHeartRate] = useState(80);

  // GPS Status & Anti-Cheat State
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'good' | 'medium' | 'poor' | 'simulated'>('searching');
  const [coordinates, setCoordinates] = useState<GPSCoordinate[]>([]);
  const [antiCheatWarning, setAntiCheatWarning] = useState<string | null>(null);
  const [motionSensorActive, setMotionSensorActive] = useState(false);
  const [userMovementState, setUserMovementState] = useState<'walking' | 'stationary' | 'fake_shaking' | 'vehicle'>('stationary');

  // Settings & Enhancements
  const [voiceGuidance, setVoiceGuidance] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const mapTheme = 'dark';

  // Refs for background loops & sensors
  const watchIdRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const simIntervalRef = useRef<any>(null);
  const lastAnnouncedKmRef = useRef<number>(0);
  const lastAnnouncedStepRef = useRef<number>(0);
  const wakeLockRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ── Smart Pedometer & Anti-Handshake Shaking Algorithm Refs ──
  const lastAccelMagnitudeRef = useRef<number>(9.8);
  const lastAccelPeakRef = useRef<number>(0);
  const accelStateRef = useRef<'rising' | 'falling'>('falling');
  const lastStepTimestampRef = useRef<number>(Date.now());
  const stepCandidateBufferRef = useRef<number[]>([]); // timestamps of candidate steps
  const isStepTrainConfirmedRef = useRef<boolean>(false);
  const recentStepsWindowRef = useRef<number[]>([]); // steps in the last 10 seconds

  // ── GPS Noise, Jitter Suppression & Fusion Refs ──
  const lastAcceptedGpsPointRef = useRef<GPSCoordinate | null>(null);
  const recentGpsDisplacementsRef = useRef<{ timestamp: number; distance: number }[]>([]); // GPS movement in last 10 seconds
  const lastGpsUpdateTimeRef = useRef<number>(Date.now());
  const consecutiveStationaryDriftsRef = useRef<number>(0);

  // -------------------------------------------------------------
  // 1. Text-to-Speech Voice Guidance
  // -------------------------------------------------------------
  const speakVoice = useCallback(
    (text: string) => {
      if (!voiceGuidance || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Voice speech fallback
      }
    },
    [voiceGuidance]
  );

  // -------------------------------------------------------------
  // 2. WakeLock (Screen keeps on while walking)
  // -------------------------------------------------------------
  useEffect(() => {
    if (isStarted && !isPaused && 'wakeLock' in navigator) {
      (navigator as any).wakeLock
        ?.request('screen')
        .then((lock: any) => {
          wakeLockRef.current = lock;
        })
        .catch(() => {});
    } else {
      if (wakeLockRef.current) {
        wakeLockRef.current.release?.();
        wakeLockRef.current = null;
      }
    }
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release?.();
      }
    };
  }, [isStarted, isPaused]);

  // -------------------------------------------------------------
  // 3. Haversine Distance Formula (Precise to millimeter)
  // -------------------------------------------------------------
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  };

  // -------------------------------------------------------------
  // 4. Biomechanical Step Detection & Anti-Handshake Anti-Cheat
  // -------------------------------------------------------------
  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    if (!isStarted || isPaused || isCompleted) return;

    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    setMotionSensorActive(true);
    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    // Biomechanical Walking Impact Thresholds:
    // Human walking impacts create a vertical oscillation with peak ~11.6 m/s^2 and trough ~8.4 m/s^2
    const PEAK_THRESHOLD = 11.5;
    const VALLEY_THRESHOLD = 8.5;
    const MIN_STEP_INTERVAL_MS = 280; // max ~3.5 steps/sec (fast sprint)
    const MAX_STEP_INTERVAL_MS = 1400; // min ~42 SPM (slow walk)

    // Clean rolling step & GPS movement windows (last 8 seconds)
    recentStepsWindowRef.current = recentStepsWindowRef.current.filter((t) => now - t < 8000);
    recentGpsDisplacementsRef.current = recentGpsDisplacementsRef.current.filter((g) => now - g.timestamp < 8000);

    if (accelStateRef.current === 'falling' && magnitude > PEAK_THRESHOLD) {
      accelStateRef.current = 'rising';
      lastAccelPeakRef.current = magnitude;
    } else if (accelStateRef.current === 'rising' && magnitude < VALLEY_THRESHOLD) {
      accelStateRef.current = 'falling';
      const intervalSinceLastStep = now - lastStepTimestampRef.current;

      // Check valid human stepping interval
      if (intervalSinceLastStep >= MIN_STEP_INTERVAL_MS) {
        lastStepTimestampRef.current = now;

        // Reset step candidate train if interval was too long (> 1.8s pause)
        if (intervalSinceLastStep > 1800) {
          stepCandidateBufferRef.current = [];
          isStepTrainConfirmedRef.current = false;
        }

        stepCandidateBufferRef.current.push(now);
        recentStepsWindowRef.current.push(now);

        // ── Anti-Cheat Layer 1: High Frequency Hand Shaking Check (> 3.5 Hz) ──
        const stepsInLast8s = recentStepsWindowRef.current.length;
        const currentCadenceSpm = (stepsInLast8s / 8) * 60;

        if (currentCadenceSpm > 215) {
          setUserMovementState('fake_shaking');
          setAntiCheatWarning('🚫 PHÁT HIỆN LẮC TAY BẤT THƯỜNG (>215 SPM): Tạm dừng tích lũy bước chân!');
          return; // REJECT FAKE SHAKE STEP
        }

        // ── Anti-Cheat Layer 2: Sensor Fusion in Outdoor GPS Mode (Standing Still & Shaking Arm) ──
        if (trackMode === 'outdoor' && gpsStatus !== 'poor') {
          // Calculate total GPS displacement in the last 8 seconds
          const totalGpsDistInWindow = recentGpsDisplacementsRef.current.reduce((sum, g) => sum + g.distance, 0);

          // If user generates >= 5 steps in 8s but GPS displacement is < 2.5m AND speed is negligible
          if (stepsInLast8s >= 5 && totalGpsDistInWindow < 2.5 && currentSpeedKmh < 0.9) {
            setUserMovementState('fake_shaking');
            setAntiCheatWarning('🚫 PHÁT HIỆN LẮC TAY TẠI CHỖ: Người dùng đang đứng yên (GPS không di chuyển). Chặn cộng bước!');
            return; // REJECT STATIONARY ARM SHAKING
          }
        }

        // ── Biomechanical Step Train Confirmation (Require 3-4 consistent rhythmic steps before confirming walk) ──
        if (!isStepTrainConfirmedRef.current) {
          if (stepCandidateBufferRef.current.length >= 3) {
            // Check rhythm consistency: interval variance
            const intervals = [];
            for (let i = 1; i < stepCandidateBufferRef.current.length; i++) {
              intervals.push(stepCandidateBufferRef.current[i] - stepCandidateBufferRef.current[i - 1]);
            }
            const avgInt = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const isRhythmic = intervals.every((int) => Math.abs(int - avgInt) < avgInt * 0.5);

            if (isRhythmic && avgInt >= MIN_STEP_INTERVAL_MS && avgInt <= MAX_STEP_INTERVAL_MS) {
              isStepTrainConfirmedRef.current = true;
              setUserMovementState('walking');
              setAntiCheatWarning(null);

              // Commit buffered steps
              const bufferedCount = stepCandidateBufferRef.current.length;
              setSteps((prev) => prev + bufferedCount);

              // In Indoor mode: Distance comes strictly from verified steps
              if (trackMode === 'indoor') {
                setDistanceMeters((prev) => prev + bufferedCount * 0.74);
              }
            }
          }
          return;
        }

        // ── Real Continuous Step Verified ──
        setUserMovementState('walking');
        setAntiCheatWarning(null);
        setSteps((prev) => prev + 1);

        // Distance in indoor mode increments per step
        if (trackMode === 'indoor') {
          setDistanceMeters((prev) => prev + 0.74); // 0.74m per step
        }
      }
    }

    lastAccelMagnitudeRef.current = magnitude;
  }, [isStarted, isPaused, isCompleted, trackMode, gpsStatus, currentSpeedKmh]);

  // Request iOS / Mobile Motion Sensor Permission
  const requestMotionPermission = async () => {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const res = await (DeviceMotionEvent as any).requestPermission();
        if (res === 'granted') {
          window.addEventListener('devicemotion', handleDeviceMotion);
          setMotionSensorActive(true);
          showToast?.('Đã kích hoạt cảm biến bước chân & Anti-Cheat AI!', 'success');
        }
      } catch (err) {
        console.warn('Motion permission request failed', err);
      }
    } else if (typeof window !== 'undefined' && 'ondevicemotion' in window) {
      window.addEventListener('devicemotion', handleDeviceMotion);
      setMotionSensorActive(true);
    }
  };

  // -------------------------------------------------------------
  // 5. Real-Time Geolocation Tracking & GPS Jitter Suppressor
  // -------------------------------------------------------------
  const handleGPSPosition = useCallback(
    (position: GeolocationPosition) => {
      if (!isStarted || isPaused || isCompleted) return;

      const { latitude, longitude, accuracy, speed } = position.coords;
      const now = position.timestamp || Date.now();
      lastGpsUpdateTimeRef.current = now;

      setGpsAccuracy(accuracy);
      if (accuracy <= 15) setGpsStatus('good');
      else if (accuracy <= 32) setGpsStatus('medium');
      else {
        setGpsStatus('poor');
      }

      // Discard highly inaccurate GPS readings (accuracy > 38m)
      if (accuracy > 38) {
        return;
      }

      setCoordinates((prevCoords) => {
        // First coordinate initialization
        if (!lastAcceptedGpsPointRef.current || prevCoords.length === 0) {
          const firstPoint: GPSCoordinate = {
            lat: latitude,
            lng: longitude,
            timestamp: now,
            speed: speed !== null && speed >= 0 ? speed : 0,
            accuracy,
          };
          lastAcceptedGpsPointRef.current = firstPoint;
          return [firstPoint];
        }

        const last = lastAcceptedGpsPointRef.current;
        const distDelta = calculateDistance(last.lat, last.lng, latitude, longitude);
        const timeDelta = (now - last.timestamp) / 1000; // in seconds

        if (timeDelta <= 0.2) return prevCoords; // ignore redundant duplicate ticks

        // Calculate speed in km/h
        let speedKmh = 0;
        if (speed !== null && speed >= 0) {
          speedKmh = speed * 3.6;
        } else {
          speedKmh = (distDelta / timeDelta) * 3.6;
        }

        // ── GPS Jitter & Stationary Deadzone Filter ──
        // When stationary, mobile GPS drifts 1.5 - 6m randomly due to multipath / satellite noise.
        // Minimum displacement threshold proportional to GPS accuracy:
        const minPhysicalMoveThreshold = Math.max(3.8, Math.min(10, accuracy * 0.42));

        if (distDelta < minPhysicalMoveThreshold || speedKmh < 1.0) {
          // Confirmed stationary drift: DO NOT ACCUMULATE DISTANCE!
          consecutiveStationaryDriftsRef.current += 1;
          setCurrentSpeedKmh(0);

          if (recentStepsWindowRef.current.length === 0) {
            setUserMovementState('stationary');
            if (consecutiveStationaryDriftsRef.current >= 4) {
              setAntiCheatWarning(null); // normal resting state
            }
          }
          return prevCoords; // Return unchanged coords, ignore drift
        }

        // ── Anti-Cheat: High Speed Vehicle Filter (> 24 km/h) ──
        if (speedKmh > 24) {
          setUserMovementState('vehicle');
          setAntiCheatWarning('⚠️ TỐC ĐỘ QUÁ NHANH (>24km/h): Đã tạm dừng tính quãng đường do nghi vấn đi xe máy/ô tô!');
          return prevCoords; // REJECT VEHICLE
        }

        // ── Anti-Cheat: Passive Transport (GPS moves fast but ZERO steps over 12s) ──
        const stepsInLast10s = recentStepsWindowRef.current.length;
        if (speedKmh > 11 && stepsInLast10s === 0 && timeDelta > 3) {
          setUserMovementState('vehicle');
          setAntiCheatWarning('🚗 PHÁT HIỆN ĐANG ĐI XE: Toạ độ GPS di chuyển nhưng không có bước chân người!');
          return prevCoords; // REJECT PASSIVE VEHICLE
        }

        // ── Valid Physical Walking / Running Movement Detected! ──
        consecutiveStationaryDriftsRef.current = 0;
        setUserMovementState('walking');
        setAntiCheatWarning(null);

        // Update verified speed (capped at human running max 20 km/h)
        const validSpeedKmh = Math.min(20, Math.max(1.2, Number(speedKmh.toFixed(1))));
        setCurrentSpeedKmh(validSpeedKmh);

        // Record GPS movement for Sensor Fusion validation window
        recentGpsDisplacementsRef.current.push({ timestamp: now, distance: distDelta });

        // In Outdoor Mode: Accumulate physical GPS distance strictly once
        if (trackMode === 'outdoor') {
          setDistanceMeters((prev) => prev + distDelta);

          // Fallback step calculation ONLY if motion sensor is unavailable
          if (!motionSensorActive) {
            const estimatedSteps = Math.round(distDelta / 0.74);
            if (estimatedSteps > 0) {
              setSteps((prev) => prev + estimatedSteps);
            }
          }
        }

        const validPoint: GPSCoordinate = {
          lat: latitude,
          lng: longitude,
          timestamp: now,
          speed: validSpeedKmh / 3.6,
          accuracy,
        };
        lastAcceptedGpsPointRef.current = validPoint;

        return [...prevCoords, validPoint];
      });
    },
    [isStarted, isPaused, isCompleted, trackMode, motionSensorActive]
  );

  // -------------------------------------------------------------
  // 6. Start / Pause / Resume / Stop Controls
  // -------------------------------------------------------------
  const startTracking = () => {
    // Reset state & buffers
    stepCandidateBufferRef.current = [];
    isStepTrainConfirmedRef.current = false;
    recentStepsWindowRef.current = [];
    recentGpsDisplacementsRef.current = [];
    lastAcceptedGpsPointRef.current = null;
    consecutiveStationaryDriftsRef.current = 0;

    requestMotionPermission();
    setIsStarted(true);
    setIsPaused(false);
    setIsCompleted(false);
    setAntiCheatWarning(null);
    setUserMovementState('stationary');
    speakVoice('Bắt đầu buổi tập đi bộ. Thuật toán Anti-Cheat và chống trôi GPS đã sẵn sàng!');
    showToast?.('Đã kích hoạt Bộ lọc trôi GPS & Cảm biến chống gian lận!', 'success');

    // Start Geolocation watch for outdoor mode
    if (trackMode === 'outdoor' && 'geolocation' in navigator) {
      try {
        const id = navigator.geolocation.watchPosition(
          handleGPSPosition,
          (err) => {
            console.warn('GPS error, switching to sensor simulation', err);
            setGpsStatus('simulated');
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000,
          }
        );
        watchIdRef.current = id;
      } catch {
        setGpsStatus('simulated');
      }
    }
  };

  const pauseTracking = () => {
    setIsPaused(true);
    speakVoice('Đã tạm dừng buổi tập');
    showToast?.('Đã tạm dừng theo dõi', 'info');
  };

  const resumeTracking = () => {
    setIsPaused(false);
    speakVoice('Tiếp tục luyện tập');
    showToast?.('Đã tiếp tục luyện tập', 'success');
  };

  const finishTracking = () => {
    setIsStarted(false);
    setIsPaused(false);
    setIsCompleted(true);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    window.removeEventListener('devicemotion', handleDeviceMotion);

    // Record verified session into User Context
    const finalSteps = Math.max(steps, Math.round(distanceMeters / 0.74));
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const finalCalories = Math.max(calories, Math.round(finalSteps * 0.043));

    recordExerciseSession('walking', finalSteps, durationMinutes, finalCalories);
    speakVoice(`Tuyệt vời! Bạn đã hoàn thành ${finalSteps} bước chân và đốt cháy ${finalCalories} calo.`);
  };

  // -------------------------------------------------------------
  // 7. Simulation Mode for testing on Desktop or Indoors
  // -------------------------------------------------------------
  const toggleSimulation = () => {
    if (isSimulating) {
      setIsSimulating(false);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      showToast?.('Đã tắt chế độ mô phỏng GPS', 'info');
    } else {
      setIsSimulating(true);
      showToast?.('Đang chạy chế độ mô phỏng GPS ngoài trời (5.2 km/h)', 'success');
    }
  };

  useEffect(() => {
    if (isSimulating && isStarted && !isPaused && !isCompleted) {
      const baseLat = 10.7769; // HCMC Center
      const baseLng = 106.7009;
      let angle = (elapsedSeconds * 4 * Math.PI) / 180;

      simIntervalRef.current = setInterval(() => {
        angle += 0.04;
        const radius = 0.0018 + Math.sin(angle * 0.5) * 0.0006;
        const newLat = baseLat + radius * Math.cos(angle);
        const newLng = baseLng + radius * Math.sin(angle);

        const simulatedSpeed = 5.0 + Math.sin(angle) * 0.6; // ~5.0 km/h
        const simulatedStepsDelta = 2;
        const distDelta = (simulatedSpeed * 1000) / 3600; // ~1.4 meters/sec

        setUserMovementState('walking');
        setAntiCheatWarning(null);
        setSteps((s) => s + simulatedStepsDelta);
        setDistanceMeters((d) => d + distDelta);
        setCurrentSpeedKmh(Number(simulatedSpeed.toFixed(1)));
        setGpsStatus('good');
        setGpsAccuracy(3.8);

        setCoordinates((prev) => [
          ...prev,
          {
            lat: newLat,
            lng: newLng,
            timestamp: Date.now(),
            speed: simulatedSpeed / 3.6,
            accuracy: 4,
          },
        ]);
      }, 1000);

      return () => {
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      };
    }
  }, [isSimulating, isStarted, isPaused, isCompleted, elapsedSeconds]);

  // -------------------------------------------------------------
  // 8. Main Timer & Metric Calculations Loop
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isStarted || isPaused || isCompleted) return;

    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((sec) => {
        const next = sec + 1;

        // Calculate average pace (min/km)
        if (distanceMeters > 30) {
          const totalKm = distanceMeters / 1000;
          const paceMinutes = next / 60 / totalKm;
          const pMin = Math.floor(paceMinutes);
          const pSec = Math.floor((paceMinutes - pMin) * 60);
          if (pMin < 60) {
            setCurrentPace(`${pMin.toString().padStart(2, '0')}'${pSec.toString().padStart(2, '0')}"`);
          } else {
            setCurrentPace('>60\'00"');
          }

          const avgSpd = totalKm / (next / 3600);
          setAvgSpeedKmh(Number(avgSpd.toFixed(1)));
        }

        // Calculate Calories: 0.043 kcal per step + MET factor
        const calculatedCal = Math.round(steps * 0.043 + (distanceMeters / 1000) * 22);
        setCalories(calculatedCal);

        // Calculate Cadence (Steps per Minute)
        if (next > 4) {
          const spm = Math.round((steps / next) * 60);
          setCadence(spm);
        }

        // Heart rate estimation based on cadence & speed
        const dynamicHR = Math.min(155, Math.max(76, 78 + Math.round((currentSpeedKmh || 4.2) * 8.2)));
        setHeartRate(dynamicHR);

        // Voice announcements every 500m
        const currentKm = Math.floor(distanceMeters / 500) * 0.5;
        if (currentKm > 0 && currentKm > lastAnnouncedKmRef.current) {
          lastAnnouncedKmRef.current = currentKm;
          speakVoice(`Bạn đã hoàn thành ${currentKm} kilômét. Duy trì phong độ rất tốt!`);
        }

        // Voice announcement for every 1000 steps
        const currentStepMilestone = Math.floor(steps / 1000) * 1000;
        if (currentStepMilestone > 0 && currentStepMilestone > lastAnnouncedStepRef.current) {
          lastAnnouncedStepRef.current = currentStepMilestone;
          speakVoice(`Chúc mừng! Đạt mốc ${currentStepMilestone.toLocaleString()} bước chân!`);
        }

        return next;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isStarted, isPaused, isCompleted, distanceMeters, steps, currentSpeedKmh, speakVoice]);

  // -------------------------------------------------------------
  // 9. Canvas Route Visualizer (Radar GPS Track Map)
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw background
    ctx.fillStyle = mapTheme === 'dark' ? '#0E111A' : '#141E28';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (coordinates.length === 0) {
      // Draw radar scanning pulse when searching GPS
      const t = Date.now() / 800;
      const cx = width / 2;
      const cy = height / 2;

      ctx.save();
      ctx.strokeStyle = 'rgba(46, 213, 115, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, (t % 3) * 35, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#2ED573';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = '#A0A5B5';
      ctx.textAlign = 'center';
      ctx.fillText(
        trackMode === 'outdoor'
          ? 'Đang kết nối tín hiệu vệ tinh GPS (Lọc nhiễu Active)...'
          : 'Đang theo dõi bước chân Pedometer trong nhà...',
        cx,
        cy + 30
      );
      ctx.restore();
      return;
    }

    // Determine bounding box to scale coordinates to canvas
    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;
    coordinates.forEach((c) => {
      if (c.lat < minLat) minLat = c.lat;
      if (c.lat > maxLat) maxLat = c.lat;
      if (c.lng < minLng) minLng = c.lng;
      if (c.lng > maxLng) maxLng = c.lng;
    });

    const latSpan = Math.max(0.0004, maxLat - minLat);
    const lngSpan = Math.max(0.0004, maxLng - minLng);
    const padding = 35;

    const toScreenX = (lng: number) => padding + ((lng - minLng) / lngSpan) * (width - padding * 2);
    const toScreenY = (lat: number) => height - (padding + ((lat - minLat) / latSpan) * (height - padding * 2));

    // Draw GPS Path with Neon Glow
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#2ED573';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(46, 213, 115, 0.8)';
    ctx.shadowBlur = 12;

    coordinates.forEach((pt, idx) => {
      const sx = toScreenX(pt.lng);
      const sy = toScreenY(pt.lat);
      if (idx === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });
    ctx.stroke();
    ctx.restore();

    // Draw Start Marker
    if (coordinates.length > 0) {
      const startPt = coordinates[0];
      const sx = toScreenX(startPt.lng);
      const sy = toScreenY(startPt.lat);

      ctx.fillStyle = '#FF4757';
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('START', sx, sy - 10);
    }

    // Draw Current Position Beacon with Pulsing Halo
    if (coordinates.length > 0) {
      const cur = coordinates[coordinates.length - 1];
      const cx = toScreenX(cur.lng);
      const cy = toScreenY(cur.lat);

      const pulse = (Date.now() % 1500) / 1500;
      ctx.save();
      ctx.fillStyle = `rgba(46, 213, 115, ${1 - pulse})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 10 + pulse * 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2ED573';
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }
  }, [coordinates, mapTheme, trackMode]);

  // Format elapsed time hh:mm:ss
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Target Progress Percentage
  const progressPercent =
    targetType === 'steps'
      ? Math.min(100, Math.round((steps / (targetValue || 1)) * 100))
      : targetType === 'distance'
      ? Math.min(100, Math.round(((distanceMeters / 1000) / (targetValue || 1)) * 100))
      : 100;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0D14',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        paddingBottom: 40,
      }}
    >
      {/* ── Top Header Navigation ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'rgba(17, 20, 30, 0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <button
          onClick={() => {
            if (isStarted && !isCompleted) {
              if (window.confirm('Bạn có muốn dừng buổi tập đi bộ hiện tại không?')) {
                finishTracking();
                navigate('/exercise');
              }
            } else {
              navigate('/exercise');
            }
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: 12,
            padding: 8,
            color: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Footprints size={18} color="#2ED573" />
            <span>Theo Dõi GPS & Bước Chân</span>
          </div>
          <div style={{ fontSize: 11, color: '#8E94A5', marginTop: 2 }}>
            {trackMode === 'outdoor' ? '🛰️ Lọc nhiễu GPS + Cảm biến Gia Tốc' : '👟 Cảm biến bước chân Pedometer'}
          </div>
        </div>

        <button
          onClick={() => setVoiceGuidance(!voiceGuidance)}
          title={voiceGuidance ? 'Tắt giọng nói hướng dẫn' : 'Bật giọng nói hướng dẫn'}
          style={{
            background: voiceGuidance ? 'rgba(46, 213, 115, 0.15)' : 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${voiceGuidance ? '#2ED573' : 'transparent'}`,
            borderRadius: 12,
            padding: 8,
            color: voiceGuidance ? '#2ED573' : '#8E94A5',
            cursor: 'pointer',
          }}
        >
          {voiceGuidance ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* ── Status Badges Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: '#121622',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: 11,
        }}
      >
        {/* GPS Signal Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background:
                gpsStatus === 'good'
                  ? '#2ED573'
                  : gpsStatus === 'medium'
                  ? '#FFA502'
                  : gpsStatus === 'simulated'
                  ? '#70A1FF'
                  : '#FF4757',
              boxShadow: `0 0 8px ${
                gpsStatus === 'good' ? '#2ED573' : gpsStatus === 'simulated' ? '#70A1FF' : '#FF4757'
              }`,
              animation: isStarted ? 'pulse 1.5s infinite' : 'none',
            }}
          />
          <span style={{ color: '#A0A5B5', fontWeight: 600 }}>
            {trackMode === 'indoor'
              ? 'Chế độ Trong Nhà'
              : gpsStatus === 'good'
              ? `GPS Độ chính xác cao (±${gpsAccuracy ? gpsAccuracy.toFixed(0) : 5}m)`
              : gpsStatus === 'medium'
              ? 'GPS Vừa phải (Khử nhiễu ON)'
              : gpsStatus === 'simulated'
              ? 'GPS Mô phỏng Studio'
              : 'Đang bắt GPS...'}
          </span>
        </div>

        {/* Anti-Cheat & Sensor Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: motionSensorActive ? '#2ED573' : '#8E94A5',
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            <Smartphone size={12} />
            <span>{motionSensorActive ? 'Cảm biến OK' : 'Sẵn sàng'}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: '#2ED573',
              fontSize: 10,
              fontWeight: 700,
              background: 'rgba(46, 213, 115, 0.1)',
              padding: '3px 8px',
              borderRadius: 8,
            }}
          >
            <ShieldCheck size={12} />
            <span>Anti-Cheat AI</span>
          </div>
        </div>
      </div>

      {/* ── Real-Time User Movement State Badge ── */}
      <div
        style={{
          margin: '10px 16px 0',
          padding: '10px 14px',
          borderRadius: 14,
          background:
            userMovementState === 'walking'
              ? 'rgba(46, 213, 115, 0.12)'
              : userMovementState === 'fake_shaking'
              ? 'rgba(255, 71, 87, 0.2)'
              : userMovementState === 'vehicle'
              ? 'rgba(255, 165, 2, 0.2)'
              : 'rgba(247, 201, 72, 0.12)',
          border: `1px solid ${
            userMovementState === 'walking'
              ? 'rgba(46, 213, 115, 0.4)'
              : userMovementState === 'fake_shaking'
              ? '#FF4757'
              : userMovementState === 'vehicle'
              ? '#FFA502'
              : 'rgba(247, 201, 72, 0.4)'
          }`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background:
                userMovementState === 'walking'
                  ? '#2ED573'
                  : userMovementState === 'fake_shaking'
                  ? '#FF4757'
                  : userMovementState === 'vehicle'
                  ? '#FFA502'
                  : '#F7C948',
              boxShadow: `0 0 10px ${
                userMovementState === 'walking'
                  ? '#2ED573'
                  : userMovementState === 'fake_shaking'
                  ? '#FF4757'
                  : userMovementState === 'vehicle'
                  ? '#FFA502'
                  : '#F7C948'
              }`,
            }}
          />
          <span
            style={{
              color:
                userMovementState === 'walking'
                  ? '#2ED573'
                  : userMovementState === 'fake_shaking'
                  ? '#FF4757'
                  : userMovementState === 'vehicle'
                  ? '#FFA502'
                  : '#F7C948',
            }}
          >
            {userMovementState === 'walking'
              ? '🟢 Đang di chuyển thực tế (Đang tính điểm)'
              : userMovementState === 'fake_shaking'
              ? '🚫 Phát hiện rung lắc tay tại chỗ (Chặn tính điểm)'
              : userMovementState === 'vehicle'
              ? '🚗 Phát hiện di chuyển bằng phương tiện (Chặn)'
              : '⏸️ Đang đứng yên (Chống trôi GPS - Dừng cộng số)'}
          </span>
        </div>
        <span style={{ fontSize: 10, color: '#A0A5B5' }}>
          {userMovementState === 'walking' ? 'Hợp lệ' : 'Đóng băng'}
        </span>
      </div>

      {/* ── Anti-Cheat Alert Banner ── */}
      {antiCheatWarning && (
        <div
          style={{
            margin: '10px 16px 0',
            padding: '10px 14px',
            background: 'rgba(255, 71, 87, 0.15)',
            border: '1px solid #FF4757',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#FF4757',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{antiCheatWarning}</span>
        </div>
      )}

      {/* ── Anti-Cheat Diagnostic Status Hub (Explaining algorithm protection to user) ── */}
      <div
        style={{
          margin: '10px 16px 0',
          padding: '10px 14px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
          fontSize: 10,
          color: '#8E94A5',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ color: '#2ED573', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
            <CheckCircle2 size={11} /> Khử Trôi GPS
          </div>
          <span>Chống tăng khi đứng yên</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ color: '#2ED573', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
            <CheckCircle2 size={11} /> Chống Lắc Tay
          </div>
          <span>Nhịp bước sinh học</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ color: '#2ED573', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
            <CheckCircle2 size={11} /> Sensor Fusion
          </div>
          <span>Đối chiếu GPS + Gia tốc</span>
        </div>
      </div>

      {/* ── Live Route Radar Map Canvas ── */}
      <div
        style={{
          position: 'relative',
          margin: '12px 16px 0',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <canvas
          ref={canvasRef}
          width={440}
          height={200}
          style={{ width: '100%', height: 200, display: 'block', background: '#0E111A' }}
        />

        {/* Overlay Badges on Map */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(15, 18, 28, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '4px 10px',
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 700,
            color: '#2ED573',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid rgba(46, 213, 115, 0.3)',
          }}
        >
          <Compass size={13} />
          <span>{isStarted ? (isPaused ? 'TẠM DỪNG' : 'LIVE GPS TRACK') : 'SẴN SÀNG'}</span>
        </div>

        {/* Speed Float Bubble */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(15, 18, 28, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '4px 10px',
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 700,
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          ⚡ {currentSpeedKmh.toFixed(1)} km/h
        </div>

        {/* Simulation Mode Toggle Button (Useful on PC/Testing) */}
        <button
          onClick={toggleSimulation}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            background: isSimulating ? '#2ED573' : 'rgba(255, 255, 255, 0.15)',
            color: isSimulating ? '#000000' : '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            padding: '4px 8px',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Sparkles size={12} />
          {isSimulating ? 'Mô phỏng ON' : 'Test Mô Phỏng'}
        </button>
      </div>

      {/* ── Main Big Counter Hero Card ── */}
      <div
        style={{
          margin: '14px 16px 0',
          background: 'linear-gradient(145deg, #161B29 0%, #111520 100%)',
          borderRadius: 24,
          padding: '18px 18px',
          border: '1px solid rgba(46, 213, 115, 0.25)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(46, 213, 115, 0.08)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Step Counter Label */}
        <div style={{ fontSize: 12, fontWeight: 700, color: '#A0A5B5', textTransform: 'uppercase', letterSpacing: 1 }}>
          Số Bước Chân Thực Tế
        </div>

        {/* Big Step Number */}
        <div
          style={{
            fontSize: 54,
            fontWeight: 900,
            lineHeight: 1.1,
            color: '#2ED573',
            textShadow: '0 0 30px rgba(46, 213, 115, 0.4)',
            margin: '6px 0',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {steps.toLocaleString()}
        </div>

        {/* Target Progress Bar */}
        {targetType !== 'free' && (
          <div style={{ marginTop: 6, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#A0A5B5', marginBottom: 4 }}>
              <span>
                Mục tiêu: {targetValue.toLocaleString()} {targetType === 'steps' ? 'bước' : 'km'}
              </span>
              <span style={{ color: '#2ED573', fontWeight: 700 }}>{progressPercent}%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #2ED573, #7BED9F)',
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            marginTop: 14,
            paddingTop: 14,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Distance */}
          <div>
            <div style={{ fontSize: 10, color: '#8E94A5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              <MapPin size={11} color="#FF6B35" /> Quãng đường
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginTop: 3 }}>
              {(distanceMeters / 1000).toFixed(2)}
            </div>
            <div style={{ fontSize: 9, color: '#8E94A5' }}>km</div>
          </div>

          {/* Time Duration */}
          <div>
            <div style={{ fontSize: 10, color: '#8E94A5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              <Clock size={11} color="#70A1FF" /> Thời gian
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(elapsedSeconds)}
            </div>
            <div style={{ fontSize: 9, color: '#8E94A5' }}>phút:giây</div>
          </div>

          {/* Calories */}
          <div>
            <div style={{ fontSize: 10, color: '#8E94A5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              <Flame size={11} color="#FF4757" /> Calo
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginTop: 3 }}>
              {calories}
            </div>
            <div style={{ fontSize: 9, color: '#8E94A5' }}>kcal</div>
          </div>

          {/* Pace */}
          <div>
            <div style={{ fontSize: 10, color: '#8E94A5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              <TrendingUp size={11} color="#FFA502" /> Pace
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF', marginTop: 3 }}>
              {currentPace}
            </div>
            <div style={{ fontSize: 9, color: '#8E94A5' }}>/km</div>
          </div>
        </div>

        {/* Secondary Metrics Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px dashed rgba(255, 255, 255, 0.05)',
            fontSize: 11,
            color: '#8E94A5',
          }}
        >
          <div>
            Nhịp bước: <strong style={{ color: '#FFFFFF' }}>{cadence} SPM</strong>
          </div>
          <div>
            Tốc độ TB: <strong style={{ color: '#FFFFFF' }}>{avgSpeedKmh} km/h</strong>
          </div>
          <div>
            Nhịp tim ước tính: <strong style={{ color: '#FF4757' }}>{heartRate} BPM</strong>
          </div>
        </div>
      </div>

      {/* ── Mode Selection & Target Presets (When not started) ── */}
      {!isStarted && !isCompleted && (
        <div style={{ margin: '14px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Outdoor vs Indoor Switch */}
          <div
            style={{
              display: 'flex',
              background: '#161B29',
              borderRadius: 14,
              padding: 4,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              onClick={() => setTrackMode('outdoor')}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderRadius: 10,
                background: trackMode === 'outdoor' ? '#2ED573' : 'transparent',
                color: trackMode === 'outdoor' ? '#000000' : '#A0A5B5',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Navigation size={14} />
              Ngoài trời (GPS + Cảm biến)
            </button>
            <button
              onClick={() => setTrackMode('indoor')}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderRadius: 10,
                background: trackMode === 'indoor' ? '#2ED573' : 'transparent',
                color: trackMode === 'indoor' ? '#000000' : '#A0A5B5',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Smartphone size={14} />
              Trong nhà / Máy chạy
            </button>
          </div>

          {/* Target Selection Pills */}
          <div
            style={{
              background: '#161B29',
              borderRadius: 16,
              padding: 14,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#A0A5B5', marginBottom: 10 }}>
              🎯 Chọn mục tiêu buổi tập:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { label: '1.000 bước', type: 'steps', val: 1000 },
                { label: '3.000 bước', type: 'steps', val: 3000 },
                { label: '5.000 bước', type: 'steps', val: 5000 },
                { label: '10.000 bước', type: 'steps', val: 10000 },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTargetType('steps');
                    setTargetValue(item.val);
                  }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 10,
                    border:
                      targetValue === item.val && targetType === 'steps'
                        ? '1px solid #2ED573'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                    background:
                      targetValue === item.val && targetType === 'steps'
                        ? 'rgba(46, 213, 115, 0.15)'
                        : 'rgba(255, 255, 255, 0.04)',
                    color: targetValue === item.val && targetType === 'steps' ? '#2ED573' : '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Floating Controls Bar (Bottom) ── */}
      <div
        style={{
          margin: '18px 16px 0',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        {!isStarted && !isCompleted && (
          <button
            onClick={startTracking}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: 18,
              background: 'linear-gradient(135deg, #2ED573 0%, #7BED9F 100%)',
              border: 'none',
              color: '#0D0E15',
              fontWeight: 900,
              fontSize: 17,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 8px 25px rgba(46, 213, 115, 0.4)',
              letterSpacing: 0.5,
            }}
          >
            <Play size={22} fill="#0D0E15" />
            BẮT ĐẦU ĐI BỘ (GPS LIVE)
          </button>
        )}

        {isStarted && !isCompleted && (
          <>
            {isPaused ? (
              <button
                onClick={resumeTracking}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: 18,
                  background: 'linear-gradient(135deg, #2ED573 0%, #7BED9F 100%)',
                  border: 'none',
                  color: '#0D0E15',
                  fontWeight: 900,
                  fontSize: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 6px 20px rgba(46, 213, 115, 0.35)',
                }}
              >
                <Play size={20} fill="#0D0E15" /> TIẾP TỤC
              </button>
            ) : (
              <button
                onClick={pauseTracking}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: 18,
                  background: '#FFA502',
                  border: 'none',
                  color: '#0D0E15',
                  fontWeight: 900,
                  fontSize: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 6px 20px rgba(255, 165, 2, 0.35)',
                }}
              >
                <Pause size={20} fill="#0D0E15" /> TẠM DỪNG
              </button>
            )}

            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn kết thúc buổi tập này để nhận thưởng không?')) {
                  finishTracking();
                }
              }}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: 18,
                background: '#FF4757',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 6px 20px rgba(255, 71, 87, 0.35)',
              }}
            >
              <Square size={18} fill="#FFFFFF" /> KẾT THÚC
            </button>
          </>
        )}
      </div>

      {/* ── Completion Modal Summary ── */}
      {isCompleted && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(5, 7, 12, 0.88)',
            backdropFilter: 'blur(16px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#161B29',
              borderRadius: 24,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              border: '1px solid rgba(46, 213, 115, 0.3)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(46, 213, 115, 0.15)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 22,
                background: 'linear-gradient(135deg, #2ED573 0%, #7BED9F 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 25px rgba(46, 213, 115, 0.4)',
              }}
            >
              <Trophy size={36} color="#0D0E15" />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
              🎉 Hoàn Thành Xuất Sắc!
            </h2>
            <p style={{ fontSize: 13, color: '#A0A5B5', marginTop: 6, marginBottom: 20 }}>
              Buổi tập đi bộ đã được xác minh qua Bộ lọc chống trôi GPS & Anti-Cheat AI.
            </p>

            {/* Results Grid */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 16,
                padding: 16,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                marginBottom: 20,
                textAlign: 'left',
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: '#8E94A5' }}>Tổng số bước</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#2ED573' }}>
                  {steps.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8E94A5' }}>Quãng đường</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF' }}>
                  {(distanceMeters / 1000).toFixed(2)} km
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8E94A5' }}>Thời gian</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>
                  {formatTime(elapsedSeconds)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8E94A5' }}>Calo tiêu thụ</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#FF4757' }}>
                  {calories} kcal
                </div>
              </div>
            </div>

            {/* Rewards Card */}
            <div
              style={{
                background: 'linear-gradient(90deg, rgba(255, 107, 53, 0.15), rgba(83, 82, 237, 0.15))',
                border: '1px solid rgba(255, 107, 53, 0.3)',
                borderRadius: 14,
                padding: 12,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Zap size={18} color="#FF6B35" />
                <span style={{ fontSize: 14, fontWeight: 800, color: '#FF6B35' }}>
                  +{Math.max(50, Math.round(steps / 10))} XP
                </span>
              </div>
              <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.15)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Trophy size={18} color="#FFA502" />
                <span style={{ fontSize: 14, fontWeight: 800, color: '#FFA502' }}>
                  +{Math.max(20, Math.round(steps / 25))} Coins
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/exercise')}
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #2ED573 0%, #7BED9F 100%)',
                border: 'none',
                color: '#000000',
                fontWeight: 900,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(46, 213, 115, 0.4)',
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
