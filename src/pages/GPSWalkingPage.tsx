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
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useUser } from '../context/UserContext';

// ── GPS Coordinate & Km Split Interfaces ───────────────────────────────────
interface GPSCoordinate {
  lat: number;
  lng: number;
  timestamp: number;
  speed: number;
  accuracy: number;
}

interface KmSplit {
  km: number;
  timeSeconds: number;     // Thời gian chạy km này
  totalSeconds: number;    // Tổng thời gian tích lũy
  pace: string;            // Pace km này (VD: 07'45")
  avgSpeedKmh: number;     // Tốc độ TB km này
  cadence: number;         // Nhịp bước TB
}

// ── 2D Kalman Filter for Latitude/Longitude Smoothing ──────────────────────
/**
 * Lớp Kalman Filter 2D tối ưu hóa cho tọa độ GPS di động:
 * - Triệt tiêu rung giật zigzag (GPS jitter).
 * - Cân bằng ma trận nhiễu đo lường theo tham số accuracy thực tế của vệ tinh.
 * - Khi accuracy lớn (nhiễu), bộ lọc tăng độ mượt; khi accuracy nhỏ, phản ứng nhanh theo quỹ đạo thật.
 */
class KalmanLatLong {
  private minAccuracy: number = 1;
  private variance: number = -1; // P (ước lượng phương sai)
  private lat: number = 0;
  private lng: number = 0;
  private timestampMs: number = 0;
  private qMetersPerSecond: number = 2.5; // Nhiễu quá trình (process noise)

  constructor(qMetersPerSecond: number = 2.5) {
    this.qMetersPerSecond = qMetersPerSecond;
  }

  public setState(lat: number, lng: number, accuracy: number, timestampMs: number): void {
    this.lat = lat;
    this.lng = lng;
    this.variance = accuracy * accuracy;
    this.timestampMs = timestampMs;
  }

  public process(
    latMeasurement: number,
    lngMeasurement: number,
    accuracy: number,
    timestampMs: number
  ): { lat: number; lng: number } {
    if (accuracy < this.minAccuracy) accuracy = this.minAccuracy;

    if (this.variance < 0) {
      // Điểm khởi đầu
      this.setState(latMeasurement, lngMeasurement, accuracy, timestampMs);
      return { lat: this.lat, lng: this.lng };
    }

    const timeDeltaMs: number = timestampMs - this.timestampMs;
    if (timeDeltaMs > 0) {
      // Dự đoán phương sai tăng theo thời gian
      this.variance += (timeDeltaMs / 1000) * this.qMetersPerSecond * this.qMetersPerSecond;
      this.timestampMs = timestampMs;
    }

    // Nhiễu đo lường (R) tỷ lệ thuận với sai số vệ tinh
    const measurementVariance: number = accuracy * accuracy;

    // Hệ số Kalman Gain K = P / (P + R)
    const k: number = this.variance / (this.variance + measurementVariance);

    // Hiệu chỉnh tọa độ
    this.lat += k * (latMeasurement - this.lat);
    this.lng += k * (lngMeasurement - this.lng);

    // Cập nhật phương sai ước lượng P = (1 - K) * P
    this.variance = (1 - k) * this.variance;

    return { lat: this.lat, lng: this.lng };
  }
}

export const GPSWalkingPage: React.FC = () => {
  const navigate = useNavigate();
  const { recordExerciseSession, showToast } = useUser();

  // Tracking state
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Mode: 'outdoor' (GPS + Motion Sensor Fusion) or 'indoor' (Pedometer Motion only)
  const [trackMode, setTrackMode] = useState<'outdoor' | 'indoor'>('outdoor');
  const [targetType, setTargetType] = useState<'steps' | 'distance' | 'free'>('steps');
  const [targetValue, setTargetValue] = useState<number>(3000); // 3000 steps or 2.0 km

  // Auto-Pause toggle & state
  const [autoPauseEnabled, setAutoPauseEnabled] = useState<boolean>(true);
  const [isAutoPaused, setIsAutoPaused] = useState<boolean>(false);

  // Metrics
  const [steps, setSteps] = useState<number>(0);
  const [distanceMeters, setDistanceMeters] = useState<number>(0); // in meters
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(0);
  const [avgSpeedKmh, setAvgSpeedKmh] = useState<number>(0);
  const [currentPace, setCurrentPace] = useState<string>('00:00'); // min/km
  const [calories, setCalories] = useState<number>(0);
  const [cadence, setCadence] = useState<number>(0); // steps per minute (SPM)
  const [heartRate, setHeartRate] = useState<number>(80);
  const [calibratedStride, setCalibratedStride] = useState<number>(0.74); // sải chân m

  // Kilometer Splits Tracking
  const [splits, setSplits] = useState<KmSplit[]>([]);
  const [showSplitsDrawer, setShowSplitsDrawer] = useState<boolean>(false);

  // GPS Status & Anti-Cheat State
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(5);
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'good' | 'medium' | 'poor' | 'simulated'>('searching');
  const [coordinates, setCoordinates] = useState<GPSCoordinate[]>([]);
  const [antiCheatWarning, setAntiCheatWarning] = useState<string>('');
  const [motionSensorActive, setMotionSensorActive] = useState<boolean>(false);
  const [userMovementState, setUserMovementState] = useState<'walking' | 'stationary' | 'fake_shaking' | 'vehicle'>('stationary');

  // Settings & Enhancements
  const [voiceGuidance, setVoiceGuidance] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const mapTheme: string = 'dark';

  // ── Refs for Algorithms, Background Loops & Sensors ──────────────────────
  const watchIdRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAnnouncedKmRef = useRef<number>(0);
  const lastAnnouncedStepRef = useRef<number>(0);
  const wakeLockRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Kalman filter instance
  const kalmanFilterRef = useRef<KalmanLatLong>(new KalmanLatLong(2.5));

  // Smart Pedometer & Anti-Cheat Refs
  const lastAccelMagnitudeRef = useRef<number>(9.8);
  const lastAccelPeakRef = useRef<number>(0);
  const accelStateRef = useRef<'rising' | 'falling'>('falling');
  const lastStepTimestampRef = useRef<number>(Date.now());
  const stepCandidateBufferRef = useRef<number[]>([]);
  const isStepTrainConfirmedRef = useRef<boolean>(false);
  const recentStepsWindowRef = useRef<number[]>([]);

  // GPS Noise, Zero-Velocity Update (ZUPT) & Fusion Refs
  const lastAcceptedGpsPointRef = useRef<GPSCoordinate | null>(null);
  const recentGpsDisplacementsRef = useRef<{ timestamp: number; distance: number }[]>([]);
  const lastGpsUpdateTimeRef = useRef<number>(Date.now());
  const consecutiveStationaryDriftsRef = useRef<number>(0);
  const stationaryDurationSecondsRef = useRef<number>(0);

  // Dynamic Stride Length & Dead Reckoning
  const calibratedStrideRef = useRef<number>(0.74);
  const lastStrideCalibStepsRef = useRef<number>(0);

  // Kilometer Split tracking refs
  const lastSplitKmRef = useRef<number>(0);
  const lastSplitTimeRef = useRef<number>(0);

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
  // 3. Haversine Distance Formula (Chính xác từng milimet)
  // -------------------------------------------------------------
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R: number = 6371e3; // metres
    const φ1: number = (lat1 * Math.PI) / 180;
    const φ2: number = (lat2 * Math.PI) / 180;
    const Δφ: number = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ: number = ((lon2 - lon1) * Math.PI) / 180;

    const a: number =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  };

  // -------------------------------------------------------------
  // 4. Biomechanical Step Detection & Sensor Fusion Dead Reckoning
  // -------------------------------------------------------------
  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    if (!isStarted || isPaused || isCompleted) return;

    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    setMotionSensorActive(true);
    const x: number = acc.x || 0;
    const y: number = acc.y || 0;
    const z: number = acc.z || 0;
    const magnitude: number = Math.sqrt(x * x + y * y + z * z);
    const now: number = Date.now();

    // Ngưỡng xung dao động bước chân người:
    const PEAK_THRESHOLD: number = 11.4;
    const VALLEY_THRESHOLD: number = 8.6;
    const MIN_STEP_INTERVAL_MS: number = 280; // max ~3.5 Hz
    const MAX_STEP_INTERVAL_MS: number = 1400; // min ~42 SPM

    // Làm sạch rolling window (8s gần nhất)
    recentStepsWindowRef.current = recentStepsWindowRef.current.filter((t) => now - t < 8000);
    recentGpsDisplacementsRef.current = recentGpsDisplacementsRef.current.filter((g) => now - g.timestamp < 8000);

    if (accelStateRef.current === 'falling' && magnitude > PEAK_THRESHOLD) {
      accelStateRef.current = 'rising';
      lastAccelPeakRef.current = magnitude;
    } else if (accelStateRef.current === 'rising' && magnitude < VALLEY_THRESHOLD) {
      accelStateRef.current = 'falling';
      const intervalSinceLastStep = now - lastStepTimestampRef.current;

      if (intervalSinceLastStep >= MIN_STEP_INTERVAL_MS) {
        lastStepTimestampRef.current = now;

        // Nếu nghỉ quá 1.8s -> reset chuỗi nhịp bước
        if (intervalSinceLastStep > 1800) {
          stepCandidateBufferRef.current = [];
          isStepTrainConfirmedRef.current = false;
        }

        stepCandidateBufferRef.current.push(now);
        recentStepsWindowRef.current.push(now);

        // ── Tự động hủy Auto-Pause khi phát hiện bước chân thật ──
        if (isAutoPaused) {
          setIsAutoPaused(false);
          stationaryDurationSecondsRef.current = 0;
          speakVoice('Tiếp tục đếm!');
        }

        // ── Chống gian lận tầng 1: Tần số lắc tay bất thường (> 215 SPM) ──
        const stepsInLast8s = recentStepsWindowRef.current.length;
        const currentCadenceSpm = (stepsInLast8s / 8) * 60;

        if (currentCadenceSpm > 215) {
          setUserMovementState('fake_shaking');
          setAntiCheatWarning('🚫 PHÁT HIỆN LẮC TAY BẤT THƯỜNG (>215 SPM): Tạm dừng tích lũy bước chân!');
          return;
        }

        // ── Chống gian lận tầng 2: Sensor Fusion - Lắc tay khi đứng yên ngoài trời ──
        if (trackMode === 'outdoor' && gpsStatus !== 'poor') {
          const totalGpsDistInWindow = recentGpsDisplacementsRef.current.reduce((sum, g) => sum + g.distance, 0);
          if (stepsInLast8s >= 5 && totalGpsDistInWindow < 2.5 && currentSpeedKmh < 0.9) {
            setUserMovementState('fake_shaking');
            setAntiCheatWarning('🚫 PHÁT HIỆN LẮC TAY TẠI CHỖ: Đang đứng yên (GPS không di chuyển). Chặn tích lũy!');
            return;
          }
        }

        // ── Xác thực chuỗi nhịp bước sinh học (3 nhịp đều đặn trước khi kích hoạt) ──
        if (!isStepTrainConfirmedRef.current) {
          if (stepCandidateBufferRef.current.length >= 3) {
            const intervals: number[] = [];
            for (let i = 1; i < stepCandidateBufferRef.current.length; i++) {
              intervals.push(stepCandidateBufferRef.current[i] - stepCandidateBufferRef.current[i - 1]);
            }
            const avgInt: number = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
            const isRhythmic: boolean = intervals.every((int) => Math.abs(int - avgInt) < avgInt * 0.5);

            if (isRhythmic && avgInt >= MIN_STEP_INTERVAL_MS && avgInt <= MAX_STEP_INTERVAL_MS) {
              isStepTrainConfirmedRef.current = true;
              setUserMovementState('walking');
              setAntiCheatWarning('');

              const bufferedCount: number = stepCandidateBufferRef.current.length;
              setSteps((prev) => prev + bufferedCount);

              // Trong nhà hoặc khi GPS yếu: dùng sải chân hiệu chuẩn
              if (trackMode === 'indoor' || gpsStatus === 'poor') {
                const addDist: number = bufferedCount * calibratedStrideRef.current;
                setDistanceMeters((prev) => prev + addDist);
              }
            }
          }
          return;
        }

        // ── Bước chân liên tục đã xác nhận hợp lệ ──
        setUserMovementState('walking');
        setAntiCheatWarning('');
        setSteps((prev) => prev + 1);

        // Chế độ trong nhà hoặc mất sóng GPS: Dead Reckoning bù trừ tức thì
        if (trackMode === 'indoor' || gpsStatus === 'poor') {
          setDistanceMeters((prev) => prev + calibratedStrideRef.current);
        }
      }
    }

    lastAccelMagnitudeRef.current = magnitude;
  }, [isStarted, isPaused, isCompleted, isAutoPaused, trackMode, gpsStatus, currentSpeedKmh, speakVoice]);

  // Yêu cầu quyền cảm biến gia tốc trên thiết bị di động
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
          showToast?.('Đã kích hoạt Cảm biến Bước Chân & Anti-Cheat AI!', 'success');
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
  // 5. Bộ lọc Kalman 2D + Khóa Đứng Yên ZUPT + Xử lý Toạ độ GPS
  // -------------------------------------------------------------
  const handleGPSPosition = useCallback(
    (position: GeolocationPosition) => {
      if (!isStarted || isPaused || isCompleted) return;

      const { latitude, longitude, accuracy, speed } = position.coords;
      const now = position.timestamp || Date.now();
      lastGpsUpdateTimeRef.current = now;

      setGpsAccuracy(accuracy);
      if (accuracy <= 6) setGpsStatus('good');
      else if (accuracy <= 16) setGpsStatus('medium');
      else setGpsStatus('poor');

      // Loại bỏ dữ liệu quá nhiễu (sai số > 35m)
      if (accuracy > 35) return;

      // ── BỘ LỌC KALMAN 2D: Lọc mịn toạ độ trước khi tính toán ──
      const filtered = kalmanFilterRef.current.process(latitude, longitude, accuracy, now);

      setCoordinates((prevCoords) => {
        if (!lastAcceptedGpsPointRef.current || prevCoords.length === 0) {
          const firstPoint: GPSCoordinate = {
            lat: filtered.lat,
            lng: filtered.lng,
            timestamp: now,
            speed: speed !== null && speed >= 0 ? speed : 0,
            accuracy: accuracy > 0 ? accuracy : 5,
          };
          lastAcceptedGpsPointRef.current = firstPoint;
          return [firstPoint];
        }

        const last: GPSCoordinate = lastAcceptedGpsPointRef.current;
        const distDelta: number = calculateDistance(last.lat, last.lng, filtered.lat, filtered.lng);
        const timeDelta: number = (now - last.timestamp) / 1000;

        if (timeDelta <= 0.25) return prevCoords; // Loại bỏ xung nhịp trùng lặp

        // Tính tốc độ di chuyển
        let speedKmh: number = 0;
        if (speed !== null && speed >= 0) {
          speedKmh = speed * 3.6;
        } else {
          speedKmh = (distDelta / timeDelta) * 3.6;
        }

        // ── KHÓA ĐỨNG YÊN ZUPT & BỘ LỌC CHỐNG TRÔI GPS KHI DỪNG ──
        // Ngưỡng dịch chuyển tối thiểu phụ thuộc vào độ chính xác vệ tinh
        const minMoveThreshold: number = Math.max(3.2, Math.min(8.5, accuracy * 0.38));

        if (distDelta < minMoveThreshold || speedKmh < 0.8) {
          // XÁC NHẬN ĐỨNG YÊN: TUYỆT ĐỐI KHÔNG CỘNG DỒN QUÃNG ĐƯỜNG!
          consecutiveStationaryDriftsRef.current += 1;
          setCurrentSpeedKmh(0);

          if (recentStepsWindowRef.current.length === 0) {
            setUserMovementState('stationary');
            stationaryDurationSecondsRef.current += timeDelta;

            // Kích hoạt Auto-Pause nếu đứng yên quá 3.5s
            if (autoPauseEnabled && stationaryDurationSecondsRef.current >= 3.5 && !isAutoPaused) {
              setIsAutoPaused(true);
              speakVoice('Tự động tạm dừng');
            }
          }
          return prevCoords; // Trả về tọa độ cũ, không làm trôi bản đồ
        }

        // ── Chống gian lận: Xe cơ giới (> 22 km/h) ──
        if (speedKmh > 22) {
          setUserMovementState('vehicle');
          setAntiCheatWarning('⚠️ TỐC ĐỘ QUÁ NHANH (>22km/h): Nghi vấn đi xe máy/ô tô. Đã tạm dừng cộng điểm!');
          return prevCoords;
        }

        // ── Chống gian lận: Di chuyển nhanh nhưng 0 có bước chân người ──
        const stepsInLast8s: number = recentStepsWindowRef.current.length;
        if (speedKmh > 11 && stepsInLast8s === 0 && timeDelta > 2.5) {
          setUserMovementState('vehicle');
          setAntiCheatWarning('🚗 PHÁT HIỆN ĐI XE: GPS di chuyển nhưng không có bước chân người!');
          return prevCoords;
        }

        // ── DI CHUYỂN HỢP LỆ ĐƯỢC XÁC NHẬN! ──
        consecutiveStationaryDriftsRef.current = 0;
        stationaryDurationSecondsRef.current = 0;
        setUserMovementState('walking');
        setAntiCheatWarning('');

        if (isAutoPaused) {
          setIsAutoPaused(false);
          speakVoice('Tiếp tục');
        }

        const validSpeedKmh: number = Math.min(18, Math.max(1.2, Number(speedKmh.toFixed(1))));
        setCurrentSpeedKmh(validSpeedKmh);

        recentGpsDisplacementsRef.current.push({ timestamp: now, distance: distDelta });

        // TÍCH LŨY QUÃNG ĐƯỜNG CHUẨN XÁC NGOÀI TRỜI
        if (trackMode === 'outdoor') {
          setDistanceMeters((prev) => prev + distDelta);

          // Tự động hiệu chuẩn sải chân khi GPS chuẩn (Accuracy <= 7m)
          if (accuracy <= 7 && validSpeedKmh >= 2.5 && validSpeedKmh <= 7.0) {
            const deltaDist: number = distDelta;
            const deltaSteps: number = steps - lastStrideCalibStepsRef.current;
            if (deltaSteps >= 10 && deltaDist > 6) {
              const currentStepLength: number = deltaDist / deltaSteps;
              if (currentStepLength >= 0.55 && currentStepLength <= 0.95) {
                const newStride: number = Number((calibratedStrideRef.current * 0.75 + currentStepLength * 0.25).toFixed(2));
                calibratedStrideRef.current = newStride;
                setCalibratedStride(newStride);
              }
              lastStrideCalibStepsRef.current = steps;
            }
          }

          // Dự phòng tính bước nếu không có cảm biến gia tốc
          if (!motionSensorActive) {
            const estimatedSteps: number = Math.round(distDelta / calibratedStrideRef.current);
            if (estimatedSteps > 0) {
              setSteps((prev) => prev + estimatedSteps);
            }
          }
        }

        const validPoint: GPSCoordinate = {
          lat: filtered.lat,
          lng: filtered.lng,
          timestamp: now,
          speed: validSpeedKmh / 3.6,
          accuracy: accuracy > 0 ? accuracy : 5,
        };
        lastAcceptedGpsPointRef.current = validPoint;

        return [...prevCoords, validPoint];
      });
    },
    [isStarted, isPaused, isCompleted, isAutoPaused, autoPauseEnabled, trackMode, motionSensorActive, steps, speakVoice]
  );

  // -------------------------------------------------------------
  // 6. Điều khiển Bắt đầu / Tạm dừng / Kết thúc
  // -------------------------------------------------------------
  const startTracking = () => {
    stepCandidateBufferRef.current = [];
    isStepTrainConfirmedRef.current = false;
    recentStepsWindowRef.current = [];
    recentGpsDisplacementsRef.current = [];
    lastAcceptedGpsPointRef.current = null;
    consecutiveStationaryDriftsRef.current = 0;
    stationaryDurationSecondsRef.current = 0;
    lastSplitKmRef.current = 0;
    lastSplitTimeRef.current = 0;
    setSplits([]);

    // Khởi tạo lại Kalman Filter
    kalmanFilterRef.current = new KalmanLatLong(2.5);

    requestMotionPermission();
    setIsStarted(true);
    setIsPaused(false);
    setIsAutoPaused(false);
    setIsCompleted(false);
    setAntiCheatWarning('');
    setUserMovementState('stationary');
    speakVoice('Bắt đầu buổi tập đi bộ. Bộ lọc Kalman 2D và khóa chống trôi GPS đã kích hoạt!');
    showToast?.('Đã kích hoạt Bộ lọc Kalman 2D & Chống trôi GPS ZUPT!', 'success');

    // Kích hoạt Geolocation watch ngoài trời
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
            maximumAge: 500,
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
    setIsAutoPaused(false);
    speakVoice('Tiếp tục luyện tập');
    showToast?.('Đã tiếp tục luyện tập', 'success');
  };

  const finishTracking = () => {
    setIsStarted(false);
    setIsPaused(false);
    setIsAutoPaused(false);
    setIsCompleted(true);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    window.removeEventListener('devicemotion', handleDeviceMotion);

    // Lưu session đã xác thực vào UserContext
    const finalSteps = Math.max(steps, Math.round(distanceMeters / calibratedStrideRef.current));
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const finalCalories = Math.max(calories, Math.round(finalSteps * 0.043));

    recordExerciseSession('walking', finalSteps, durationMinutes, finalCalories);
    speakVoice(`Chúc mừng! Bạn đã hoàn thành ${finalSteps.toLocaleString()} bước chân chuẩn xác và đốt cháy ${finalCalories} calo.`);
  };

  // -------------------------------------------------------------
  // 7. Chế độ Mô Phỏng (Test Studio / Desktop)
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
    if (isSimulating && isStarted && !isPaused && !isAutoPaused && !isCompleted) {
      const baseLat: number = 10.7769; // HCMC Center
      const baseLng: number = 106.7009;
      let angle: number = (elapsedSeconds * 4 * Math.PI) / 180;

      simIntervalRef.current = setInterval(() => {
        angle += 0.04;
        const radius: number = 0.0018 + Math.sin(angle * 0.5) * 0.0006;
        const newLat: number = baseLat + radius * Math.cos(angle);
        const newLng: number = baseLng + radius * Math.sin(angle);

        const simulatedSpeed: number = 5.2 + Math.sin(angle) * 0.5;
        const simulatedStepsDelta: number = 2;
        const distDelta: number = (simulatedSpeed * 1000) / 3600;

        setUserMovementState('walking');
        setAntiCheatWarning('');
        setSteps((s) => s + simulatedStepsDelta);
        setDistanceMeters((d) => d + distDelta);
        setCurrentSpeedKmh(Number(simulatedSpeed.toFixed(1)));
        setGpsStatus('good');
        setGpsAccuracy(3.5);

        setCoordinates((prev) => [
          ...prev,
          {
            lat: newLat,
            lng: newLng,
            timestamp: Date.now(),
            speed: simulatedSpeed / 3.6,
            accuracy: 3.5,
          },
        ]);
      }, 1000);

      return () => {
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      };
    }
  }, [isSimulating, isStarted, isPaused, isAutoPaused, isCompleted, elapsedSeconds]);

  // -------------------------------------------------------------
  // 8. Vòng Lặp Tính Toán Chỉ Số & Kilometer Splits
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isStarted || isPaused || isAutoPaused || isCompleted) return;

    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((sec) => {
        const next = sec + 1;

        // Tính Pace trung bình (phút/km)
        if (distanceMeters > 30) {
          const totalKm: number = distanceMeters / 1000;
          const paceMinutes: number = next / 60 / totalKm;
          const pMin: number = Math.floor(paceMinutes);
          const pSec: number = Math.floor((paceMinutes - pMin) * 60);
          if (pMin < 60) {
            setCurrentPace(`${pMin.toString().padStart(2, '0')}'${pSec.toString().padStart(2, '0')}"`);
          } else {
            setCurrentPace('>60\'00"');
          }

          const avgSpd: number = totalKm / (next / 3600);
          setAvgSpeedKmh(Number(avgSpd.toFixed(1)));
        }

        // Tính Calo: 0.043 kcal/bước + hệ số MET
        const calculatedCal: number = Math.round(steps * 0.043 + (distanceMeters / 1000) * 22);
        setCalories(calculatedCal);

        // Nhịp bước (SPM)
        if (next > 4) {
          const spm: number = Math.round((steps / next) * 60);
          setCadence(spm);
        }

        // Nhịp tim ước tính
        const dynamicHR: number = Math.min(155, Math.max(76, 78 + Math.round((currentSpeedKmh || 4.2) * 8.2)));
        setHeartRate(dynamicHR);

        // ── GHI NHẬN KILOMETER SPLITS (TỪNG KM CHUẨN STRAVA) ──
        const currentKmIndex: number = Math.floor(distanceMeters / 1000);
        if (currentKmIndex > 0 && currentKmIndex > lastSplitKmRef.current) {
          const splitDuration: number = next - lastSplitTimeRef.current;
          const splitPaceMinutes: number = splitDuration / 60;
          const sMin: number = Math.floor(splitPaceMinutes);
          const sSec: number = Math.floor((splitPaceMinutes - sMin) * 60);
          const splitPaceStr: string = `${sMin.toString().padStart(2, '0')}'${sSec.toString().padStart(2, '0')}"`;
          const splitAvgSpeed: number = Number((1 / (splitDuration / 3600)).toFixed(1));

          const newSplit: KmSplit = {
            km: currentKmIndex,
            timeSeconds: splitDuration,
            totalSeconds: next,
            pace: splitPaceStr,
            avgSpeedKmh: splitAvgSpeed,
            cadence: cadence || 110,
          };

          setSplits((prev) => [...prev, newSplit]);
          lastSplitKmRef.current = currentKmIndex;
          lastSplitTimeRef.current = next;

          speakVoice(`Kilômét ${currentKmIndex}: ${sMin} phút ${sSec} giây. Nhịp bước rất tốt!`);
        }

        // Thông báo mỗi 500m
        const current500m: number = Math.floor(distanceMeters / 500) * 0.5;
        if (current500m > 0 && current500m > lastAnnouncedKmRef.current && current500m !== currentKmIndex) {
          lastAnnouncedKmRef.current = current500m;
          speakVoice(`Đã đi được ${current500m} kilômét.`);
        }

        // Thông báo mỗi 1000 bước
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
  }, [isStarted, isPaused, isAutoPaused, isCompleted, distanceMeters, steps, currentSpeedKmh, cadence, speakVoice]);

  // -------------------------------------------------------------
  // 9. Canvas Radar GPS Map: Vẽ Đường Cong Mịn & Cột Mốc Kilomet
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Nền Dark Cyber
    ctx.fillStyle = mapTheme === 'dark' ? '#0E111A' : '#141E28';
    ctx.fillRect(0, 0, width, height);

    // Lưới tọa độ Radar
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
      // Vòng quét radar khi đang tìm GPS
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
          ? 'Đang kết nối GPS (Bộ lọc Kalman 2D Active)...'
          : 'Đang theo dõi bước chân Pedometer trong nhà...',
        cx,
        cy + 30
      );
      ctx.restore();
      return;
    }

    // Xác định Bounding Box để cân chỉnh tỷ lệ màn hình
    let minLat: number = coordinates.length > 0 ? coordinates[0].lat : 10.7769;
    let maxLat: number = coordinates.length > 0 ? coordinates[0].lat : 10.7769;
    let minLng: number = coordinates.length > 0 ? coordinates[0].lng : 106.7009;
    let maxLng: number = coordinates.length > 0 ? coordinates[0].lng : 106.7009;
    coordinates.forEach((c) => {
      if (c.lat < minLat) minLat = c.lat;
      if (c.lat > maxLat) maxLat = c.lat;
      if (c.lng < minLng) minLng = c.lng;
      if (c.lng > maxLng) maxLng = c.lng;
    });

    const latSpan = Math.max(0.0004, maxLat - minLat);
    const lngSpan = Math.max(0.0004, maxLng - minLng);
    const padding = 40;

    const toScreenX = (lng: number) => padding + ((lng - minLng) / lngSpan) * (width - padding * 2);
    const toScreenY = (lat: number) => height - (padding + ((lat - minLat) / latSpan) * (height - padding * 2));

    // Vẽ cung đường GPS Neon mềm mại (Spline Smoothing)
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#2ED573';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(46, 213, 115, 0.8)';
    ctx.shadowBlur = 14;

    if (coordinates.length === 1) {
      const p = coordinates[0];
      ctx.arc(toScreenX(p.lng), toScreenY(p.lat), 3, 0, Math.PI * 2);
    } else {
      ctx.moveTo(toScreenX(coordinates[0].lng), toScreenY(coordinates[0].lat));
      for (let i = 1; i < coordinates.length - 1; i++) {
        const xc = (toScreenX(coordinates[i].lng) + toScreenX(coordinates[i + 1].lng)) / 2;
        const yc = (toScreenY(coordinates[i].lat) + toScreenY(coordinates[i + 1].lat)) / 2;
        ctx.quadraticCurveTo(toScreenX(coordinates[i].lng), toScreenY(coordinates[i].lat), xc, yc);
      }
      const lastPt = coordinates[coordinates.length - 1];
      ctx.lineTo(toScreenX(lastPt.lng), toScreenY(lastPt.lat));
    }
    ctx.stroke();
    ctx.restore();

    // Điểm Xuất Phát (START PIN)
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

    // Vẽ Vòng Tròn Sai Số Vệ Tinh (Accuracy Halo) & Điểm Hiện Tại
    if (coordinates.length > 0) {
      const cur = coordinates[coordinates.length - 1];
      const cx = toScreenX(cur.lng);
      const cy = toScreenY(cur.lat);

      // Bán kính sai số thực tế (tối thiểu 12px, tối đa 35px)
      const accuracyRadius = Math.max(12, Math.min(35, (cur.accuracy || 5) * 1.8));

      // Accuracy circle
      ctx.save();
      ctx.fillStyle = 'rgba(46, 213, 115, 0.15)';
      ctx.strokeStyle = 'rgba(46, 213, 115, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, accuracyRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Pulsing current dot
      const pulse = (Date.now() % 1500) / 1500;
      ctx.save();
      ctx.fillStyle = `rgba(46, 213, 115, ${1 - pulse})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 8 + pulse * 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2ED573';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }
  }, [coordinates, mapTheme, trackMode]);

  // Format thời gian hh:mm:ss
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Thông tin vạch sóng GPS
  const getGpsSignalInfo = () => {
    if (trackMode === 'indoor') return { bars: 5, label: 'Trong Nhà (Cảm biến)', color: '#7BED9F' };
    if (gpsStatus === 'simulated') return { bars: 5, label: 'Mô phỏng Studio', color: '#70A1FF' };
    if (!gpsAccuracy) return { bars: 1, label: 'Đang kết nối GPS...', color: '#8E94A5' };
    if (gpsAccuracy <= 6) return { bars: 5, label: `Xuất sắc (±${gpsAccuracy.toFixed(0)}m)`, color: '#2ED573' };
    if (gpsAccuracy <= 12) return { bars: 4, label: `Rất tốt (±${gpsAccuracy.toFixed(0)}m)`, color: '#2ED573' };
    if (gpsAccuracy <= 20) return { bars: 3, label: `Khá (±${gpsAccuracy.toFixed(0)}m) - Kalman ON`, color: '#FFA502' };
    if (gpsAccuracy <= 32) return { bars: 2, label: `Yếu (±${gpsAccuracy.toFixed(0)}m) - Bù Pedometer`, color: '#FF7F50' };
    return { bars: 1, label: `Rất yếu (±${gpsAccuracy.toFixed(0)}m)`, color: '#FF4757' };
  };

  const signalInfo = getGpsSignalInfo();

  // Phần trăm hoàn thành mục tiêu
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
              if (window.confirm('Bạn có muốn kết thúc và lưu buổi tập đi bộ hiện tại không?')) {
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
            <span>GPS Live & Tracking Chuẩn Xác</span>
          </div>
          <div style={{ fontSize: 11, color: '#8E94A5', marginTop: 2 }}>
            {trackMode === 'outdoor' ? '🛰️ Kalman 2D + Khóa Đứng Yên ZUPT' : '👟 Cảm biến bước chân Pedometer'}
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

      {/* ── GPS Signal 5-Bar Quality Bar & Anti-Cheat Hub ── */}
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
        {/* GPS 5-Bar Signal Meter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 14 }}>
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                style={{
                  width: 3,
                  height: bar * 2.8,
                  borderRadius: 1.5,
                  background: bar <= signalInfo.bars ? signalInfo.color : 'rgba(255, 255, 255, 0.15)',
                  transition: 'background 0.3s ease',
                }}
              />
            ))}
          </div>
          <span style={{ color: signalInfo.color, fontWeight: 700 }}>
            {signalInfo.label}
          </span>
        </div>

        {/* Auto-Pause Status & Anti-Cheat */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setAutoPauseEnabled(!autoPauseEnabled)}
            style={{
              background: autoPauseEnabled ? 'rgba(46, 213, 115, 0.12)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${autoPauseEnabled ? '#2ED573' : 'rgba(255,255,255,0.1)'}`,
              color: autoPauseEnabled ? '#2ED573' : '#8E94A5',
              borderRadius: 8,
              padding: '2px 8px',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Auto-Pause: {autoPauseEnabled ? 'BẬT' : 'TẮT'}
          </button>

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

      {/* ── Trạng Thái Di Chuyển Thời Gian Thực ── */}
      <div
        style={{
          margin: '10px 16px 0',
          padding: '10px 14px',
          borderRadius: 14,
          background: isAutoPaused
            ? 'rgba(255, 165, 2, 0.2)'
            : userMovementState === 'walking'
            ? 'rgba(46, 213, 115, 0.12)'
            : userMovementState === 'fake_shaking'
            ? 'rgba(255, 71, 87, 0.2)'
            : userMovementState === 'vehicle'
            ? 'rgba(255, 165, 2, 0.2)'
            : 'rgba(247, 201, 72, 0.12)',
          border: `1px solid ${
            isAutoPaused
              ? '#FFA502'
              : userMovementState === 'walking'
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
              background: isAutoPaused
                ? '#FFA502'
                : userMovementState === 'walking'
                ? '#2ED573'
                : userMovementState === 'fake_shaking'
                ? '#FF4757'
                : userMovementState === 'vehicle'
                ? '#FFA502'
                : '#F7C948',
              boxShadow: `0 0 10px ${
                isAutoPaused
                  ? '#FFA502'
                  : userMovementState === 'walking'
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
              color: isAutoPaused
                ? '#FFA502'
                : userMovementState === 'walking'
                ? '#2ED573'
                : userMovementState === 'fake_shaking'
                ? '#FF4757'
                : userMovementState === 'vehicle'
                ? '#FFA502'
                : '#F7C948',
            }}
          >
            {isAutoPaused
              ? '⏸️ Đang Auto-Pause (Dừng đèn đỏ/nghỉ ngơi - Ngắt đếm giờ)'
              : userMovementState === 'walking'
              ? '🟢 Đang di chuyển thực tế (Bộ lọc Kalman đang nắn thẳng quỹ đạo)'
              : userMovementState === 'fake_shaking'
              ? '🚫 Phát hiện rung lắc tay tại chỗ (Đã chặn tính điểm)'
              : userMovementState === 'vehicle'
              ? '🚗 Phát hiện di chuyển bằng phương tiện (Chặn)'
              : '⏸️ Đang đứng yên (Khóa ZUPT chống trôi GPS - Quãng đường giữ nguyên)'}
          </span>
        </div>
        <span style={{ fontSize: 10, color: '#A0A5B5' }}>
          {isAutoPaused ? 'Tạm dừng' : userMovementState === 'walking' ? 'Hợp lệ' : 'Đóng băng'}
        </span>
      </div>

      {/* ── Cảnh Báo Anti-Cheat ── */}
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
          <span>{isStarted ? (isPaused ? 'TẠM DỪNG' : isAutoPaused ? 'AUTO-PAUSE' : 'LIVE GPS TRACK') : 'SẴN SÀNG'}</span>
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
            <div style={{ fontSize: 16, fontWeight: 800, color: '#FF4757', marginTop: 3 }}>
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

        {/* Secondary Metrics Row: Stride, Cadence, HR */}
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
            TB: <strong style={{ color: '#FFFFFF' }}>{avgSpeedKmh} km/h</strong>
          </div>
          <div>
            Tim: <strong style={{ color: '#FF4757' }}>{heartRate} BPM</strong>
          </div>
          <div>
            Sải: <strong style={{ color: '#2ED573' }}>{calibratedStride}m</strong>
          </div>
        </div>
      </div>

      {/* ── Bảng Thành Tích Từng Kilomet (Pace Splits) ── */}
      {splits.length > 0 && (
        <div
          style={{
            margin: '12px 16px 0',
            background: '#161B29',
            borderRadius: 16,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            onClick={() => setShowSplitsDrawer(!showSplitsDrawer)}
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={16} color="#2ED573" />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
                Bảng Pace Từng Km ({splits.length} km hoàn thành)
              </span>
            </div>
            {showSplitsDrawer ? <ChevronUp size={18} color="#8E94A5" /> : <ChevronDown size={18} color="#8E94A5" />}
          </div>

          {showSplitsDrawer && (
            <div style={{ padding: '8px 16px 14px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 1fr 1fr',
                  fontSize: 10,
                  color: '#8E94A5',
                  fontWeight: 700,
                  paddingBottom: 6,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <span>KM</span>
                <span style={{ textAlign: 'center' }}>PACE</span>
                <span style={{ textAlign: 'center' }}>THỜI GIAN</span>
                <span style={{ textAlign: 'right' }}>TỐC ĐỘ</span>
              </div>
              {splits.map((s) => (
                <div
                  key={s.km}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 1fr 1fr',
                    fontSize: 12,
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontWeight: 800, color: '#2ED573' }}>{s.km}</span>
                  <span style={{ textAlign: 'center', fontWeight: 700, color: '#FFFFFF' }}>{s.pace}</span>
                  <span style={{ textAlign: 'center', color: '#8E94A5' }}>{formatTime(s.timeSeconds)}</span>
                  <span style={{ textAlign: 'right', fontWeight: 700, color: '#70A1FF' }}>{s.avgSpeedKmh} km/h</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
              Ngoài trời (Kalman 2D GPS)
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
            BẮT ĐẦU ĐI BỘ (GPS CHUẨN XÁC)
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
              Buổi tập đã được lọc mịn qua Bộ lọc Kalman 2D &amp; Anti-Cheat AI.
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
              Xác Nhận &amp; Về Trang Tập Luyện
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
