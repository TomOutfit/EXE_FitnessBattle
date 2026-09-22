import { useEffect, useRef, useCallback, useState } from 'react';

// Type definitions for MediaPipe Pose
export interface PoseKeypoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
  name: string;
}

export interface PoseData {
  landmarks: PoseKeypoint[];
  worldLandmarks: PoseKeypoint[];
  hasPose: boolean;
}

export interface Results {
  poseLandmarks?: any[];
  worldLandmarks?: any[];
}

// Push-up position & rep detection thresholds
export const PUSHUP_CONFIG = {
  // Elbow angle thresholds (degrees)
  EXTENDED_ANGLE: 150,     // Arms fully extended (up position) - hoàn tất 1 rep
  DOWN_START: 125,         // Bắt đầu đi xuống (down phase)
  MAX_DEPTH_ANGLE: 90,     // Ngưỡng tính rep: góc khuỷu tay <= 90° (vai ngang hoặc đi qua khuỷu tay)
  DOWN_MIN: 65,            // Hạ sâu tối đa an toàn
  // Form accuracy thresholds
  GOOD_VISIBILITY: 0.5,    // Minimum visibility for landmarks
  EXCELLENT_VISIBILITY: 0.6,
  // Body position thresholds
  SHOULDER_ABOVE_HIP_Y: 0.1, // Shoulder should be above hip (facing down)
  // Timing
  DETECTION_CONFIRM_FRAMES: 15, // Frames needed to confirm position (about 0.5s at 30fps)
  AUTO_START_DELAY_MS: 2000,    // Delay before auto-start after detection
};

// Pull-up (Hít xà) position & rep detection thresholds
export const PULLUP_CONFIG = {
  // Elbow angle thresholds (degrees)
  ARM_EXTENDED_ANGLE: 140,   // Tay duỗi thẳng khi treo người (dead hang / bottom)
  ARM_FLEXED_ANGLE: 85,      // Tay co gập khi kéo lên đỉnh xà
  // Head/Chin threshold
  HEAD_OVER_BAR_TOLERANCE: 0.02, // Đầu/cằm vượt qua tay (nose.y <= wrist.y + tolerance)
  // Form accuracy thresholds
  GOOD_VISIBILITY: 0.5,
  EXCELLENT_VISIBILITY: 0.6,
  // Timing
  DETECTION_CONFIRM_FRAMES: 15, // Số frame giữ tư thế bám xà để tự động bắt đầu
  AUTO_START_DELAY_MS: 2000,
};

// MediaPipe landmarks indices
export const LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1, LEFT_EYE: 2, LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4, RIGHT_EYE: 5, RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7, RIGHT_EAR: 8,
  LEFT_MOUTH: 9, RIGHT_MOUTH: 10,
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
  LEFT_WRIST: 15, RIGHT_WRIST: 16,
  LEFT_PINKY: 17, RIGHT_PINKY: 18,
  LEFT_INDEX: 19, RIGHT_INDEX: 20,
  LEFT_THUMB: 21, RIGHT_THUMB: 22,
  LEFT_HIP: 23, RIGHT_HIP: 24,
  LEFT_KNEE: 25, RIGHT_KNEE: 26,
  LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
  LEFT_HEEL: 29, RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31, RIGHT_FOOT_INDEX: 32,
};

export const POSE_LANDMARKS = LANDMARKS;

// Pose connections for drawing skeleton
export const POSE_CONNECTIONS = [
  // Torso
  [LANDMARKS.LEFT_SHOULDER, LANDMARKS.RIGHT_SHOULDER],
  [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_HIP],
  [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_HIP],
  [LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP],
  // Left arm
  [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW],
  [LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST],
  // Right arm
  [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW],
  [LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST],
  // Left leg
  [LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE],
  [LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE],
  // Right leg
  [LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE],
  [LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE],
];

export interface HumanValidationResult {
  isHuman: boolean;
  confidence: number;
  reason: string;
  details: {
    hasHead: boolean;
    hasShoulders: boolean;
    hasArms: boolean;
    hasTorso: boolean;
    anatomyRatioValid: boolean;
    avgVisibility: number;
    reliableCorePoints: number;
  };
}

/**
 * Thuật toán xác thực con người (Human Body Verification):
 * Kiểm tra giải phẫu học cơ thể người thực tế (đầu, vai, khớp cánh tay, thân mình, tỷ lệ xương).
 * Loại bỏ tuyệt đối: động vật, đồ vật vô tri, bóng mờ, ảnh giả, hoặc nhiễu hình ảnh.
 */
export function validateHumanPose(landmarks: any[]): HumanValidationResult {
  if (!landmarks || landmarks.length < 33) {
    return {
      isHuman: false,
      confidence: 0,
      reason: 'Không phát hiện đủ 33 điểm khung xương',
      details: {
        hasHead: false,
        hasShoulders: false,
        hasArms: false,
        hasTorso: false,
        anatomyRatioValid: false,
        avgVisibility: 0,
        reliableCorePoints: 0,
      },
    };
  }

  const nose = landmarks[LANDMARKS.NOSE];
  const leftEye = landmarks[LANDMARKS.LEFT_EYE];
  const rightEye = landmarks[LANDMARKS.RIGHT_EYE];
  const leftEar = landmarks[LANDMARKS.LEFT_EAR];
  const rightEar = landmarks[LANDMARKS.RIGHT_EAR];

  const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
  const leftElbow = landmarks[LANDMARKS.LEFT_ELBOW];
  const rightElbow = landmarks[LANDMARKS.RIGHT_ELBOW];
  const leftWrist = landmarks[LANDMARKS.LEFT_WRIST];
  const rightWrist = landmarks[LANDMARKS.RIGHT_WRIST];

  const leftHip = landmarks[LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[LANDMARKS.RIGHT_HIP];

  // 1. Kiểm tra phần đầu/khuôn mặt người (Head check)
  const headPoints = [nose, leftEye, rightEye, leftEar, rightEar].filter(Boolean);
  const headVisSum = headPoints.reduce((sum, p) => sum + (p?.visibility || 0), 0);
  const headAvgVis = headPoints.length > 0 ? headVisSum / headPoints.length : 0;
  const hasHead = headPoints.some(p => (p?.visibility || 0) >= 0.45);

  // 2. Kiểm tra bờ vai con người (Shoulders check)
  const leftShoulderVis = leftShoulder?.visibility || 0;
  const rightShoulderVis = rightShoulder?.visibility || 0;
  const hasShoulders = (leftShoulderVis >= 0.45 && rightShoulderVis >= 0.35) ||
                       (rightShoulderVis >= 0.45 && leftShoulderVis >= 0.35) ||
                       (leftShoulderVis >= 0.6) ||
                       (rightShoulderVis >= 0.6);

  // Khoảng cách 2 vai hợp lý trong khung hình (không phải 1 điểm chụm lại)
  let shoulderDistValid: boolean = true;
  if (leftShoulder && rightShoulder && leftShoulderVis >= 0.4 && rightShoulderVis >= 0.4) {
    const shoulderDist = Math.hypot(leftShoulder.x - rightShoulder.x, leftShoulder.y - rightShoulder.y);
    if (shoulderDist < 0.03 || shoulderDist > 0.85) {
      shoulderDistValid = false;
    }
  }

  // 3. Kiểm tra cấu trúc cánh tay người (Arms check: vai nối khuỷu tay nối cổ tay)
  const leftArmVis = (leftShoulderVis + (leftElbow?.visibility || 0) + (leftWrist?.visibility || 0)) / 3;
  const rightArmVis = (rightShoulderVis + (rightElbow?.visibility || 0) + (rightWrist?.visibility || 0)) / 3;
  const hasLeftArm = leftShoulderVis >= 0.4 && (leftElbow?.visibility || 0) >= 0.4 && (leftWrist?.visibility || 0) >= 0.35;
  const hasRightArm = rightShoulderVis >= 0.4 && (rightElbow?.visibility || 0) >= 0.4 && (rightWrist?.visibility || 0) >= 0.35;
  const hasArms = hasLeftArm || hasRightArm;

  // 4. Kiểm tra thân người (Torso check: hông)
  const leftHipVis = leftHip?.visibility || 0;
  const rightHipVis = rightHip?.visibility || 0;
  const hasTorso = leftHipVis >= 0.35 || rightHipVis >= 0.35;

  // 5. Kiểm tra tỷ lệ nhân trắc học giải phẫu người (Anatomy Proportion Check)
  let anatomyRatioValid: boolean = shoulderDistValid;
  if (hasLeftArm && leftShoulder && leftElbow && leftWrist) {
    const upperArm = Math.hypot(leftShoulder.x - leftElbow.x, leftShoulder.y - leftElbow.y);
    const foreArm = Math.hypot(leftElbow.x - leftWrist.x, leftElbow.y - leftWrist.y);
    if (upperArm > 0.02 && foreArm > 0.02) {
      const armRatio = upperArm / foreArm;
      if (armRatio < 0.35 || armRatio > 2.6) anatomyRatioValid = false;
    }
  }
  if (hasRightArm && rightShoulder && rightElbow && rightWrist && anatomyRatioValid) {
    const upperArm = Math.hypot(rightShoulder.x - rightElbow.x, rightShoulder.y - rightElbow.y);
    const foreArm = Math.hypot(rightElbow.x - rightWrist.x, rightElbow.y - rightWrist.y);
    if (upperArm > 0.02 && foreArm > 0.02) {
      const armRatio = upperArm / foreArm;
      if (armRatio < 0.35 || armRatio > 2.6) anatomyRatioValid = false;
    }
  }

  // 6. Điểm tin cậy các khớp trọng yếu cơ thể người (9 core human points)
  const coreLandmarks = [nose, leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist, leftHip, rightHip];
  const avgVisibility = coreLandmarks.reduce((sum, lm) => sum + (lm?.visibility || 0), 0) / coreLandmarks.length;
  const reliableCorePoints = coreLandmarks.filter(lm => (lm?.visibility || 0) >= 0.45).length;

  // Tiêu chí con người chuẩn: Đầy đủ đầu + vai + tay + thân + tỷ lệ hợp lý + >= 5 điểm mấu chốt tin cậy
  const isHuman = hasHead && hasShoulders && hasArms && hasTorso && anatomyRatioValid && reliableCorePoints >= 5 && avgVisibility >= 0.45;

  let reason: string = 'Đã xác thực con người';
  if (!hasHead) reason = 'Vui lòng đứng vào khung hình để camera nhận diện khuôn mặt';
  else if (!hasShoulders) reason = 'Vui lòng lùi lại một chút để camera nhận diện bờ vai';
  else if (!hasArms) reason = 'Vui lòng để camera nhìn thấy hai cánh tay của bạn';
  else if (!hasTorso) reason = 'Vui lòng lùi lại một chút để camera thấy rõ toàn thân';
  else if (!anatomyRatioValid) reason = 'Đang nhận diện tỷ lệ cơ thể người';
  else if (reliableCorePoints < 5 || avgVisibility < 0.45) reason = 'Vui lòng đứng ở nơi đủ ánh sáng rõ nét';

  const confidence = Math.round(
    (headAvgVis * 0.2 + Math.max(leftArmVis, rightArmVis) * 0.3 + ((leftShoulderVis + rightShoulderVis) / 2) * 0.25 + avgVisibility * 0.25) * 100
  );

  return {
    isHuman,
    confidence: Math.min(100, Math.max(0, confidence)),
    reason,
    details: {
      hasHead,
      hasShoulders,
      hasArms,
      hasTorso,
      anatomyRatioValid,
      avgVisibility,
      reliableCorePoints,
    },
  };
}

export interface BiometricSignature {
  shoulderWidth: number;
  torsoHeight: number;
  shoulderToTorso: number;      // Tỷ lệ vai / thân
  armToTorso: number;           // Tỷ lệ cánh tay / thân
  foreArmToUpperArm: number;    // Tỷ lệ cẳng tay / bắp tay
  headToTorso: number;          // Tỷ lệ đầu / thân
  bodyAspectRatio: number;      // Tỷ lệ ngang / dọc tổng thể
}

/**
 * Trích xuất chữ ký sinh trắc học nhân trắc của người dùng (Biometric Profile Extraction):
 * Chuẩn hóa các tỷ lệ kích thước khung xương bất biến theo khoảng cách xa gần tới camera.
 */
export function extractBiometricSignature(landmarks: any[]): BiometricSignature | null {
  if (!landmarks || landmarks.length < 33) return null;

  const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
  const leftHip = landmarks[LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[LANDMARKS.RIGHT_HIP];
  const nose = landmarks[LANDMARKS.NOSE];
  const leftElbow = landmarks[LANDMARKS.LEFT_ELBOW];
  const leftWrist = landmarks[LANDMARKS.LEFT_WRIST];
  const rightElbow = landmarks[LANDMARKS.RIGHT_ELBOW];
  const rightWrist = landmarks[LANDMARKS.RIGHT_WRIST];

  if (!leftShoulder || !rightShoulder) return null;

  const shoulderWidth = Math.hypot(leftShoulder.x - rightShoulder.x, leftShoulder.y - rightShoulder.y);
  if (shoulderWidth < 0.02) return null;

  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
  const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;

  // Torso height
  let torsoHeight: number = 0.2; // default fallback
  if (leftHip && rightHip && (leftHip.visibility || 0) > 0.3 && (rightHip.visibility || 0) > 0.3) {
    const hipMidX: number = (leftHip.x + rightHip.x) / 2;
    const hipMidY: number = (leftHip.y + rightHip.y) / 2;
    torsoHeight = Math.max(0.05, Math.hypot(shoulderMidX - hipMidX, shoulderMidY - hipMidY));
  } else if (leftHip && (leftHip.visibility || 0) > 0.3) {
    torsoHeight = Math.max(0.05, Math.hypot(leftShoulder.x - leftHip.x, leftShoulder.y - leftHip.y));
  } else if (rightHip && (rightHip.visibility || 0) > 0.3) {
    torsoHeight = Math.max(0.05, Math.hypot(rightShoulder.x - rightHip.x, rightShoulder.y - rightHip.y));
  }

  // Arm measurements
  let upperArmLength: number = 0;
  let foreArmLength: number = 0;
  let armCount: number = 0;

  if (leftElbow && leftWrist && (leftElbow.visibility || 0) > 0.35 && (leftWrist.visibility || 0) > 0.35) {
    upperArmLength += Math.hypot(leftShoulder.x - leftElbow.x, leftShoulder.y - leftElbow.y);
    foreArmLength += Math.hypot(leftElbow.x - leftWrist.x, leftElbow.y - leftWrist.y);
    armCount++;
  }
  if (rightElbow && rightWrist && (rightElbow.visibility || 0) > 0.35 && (rightWrist.visibility || 0) > 0.35) {
    upperArmLength += Math.hypot(rightShoulder.x - rightElbow.x, rightShoulder.y - rightElbow.y);
    foreArmLength += Math.hypot(rightElbow.x - rightWrist.x, rightElbow.y - rightWrist.y);
    armCount++;
  }

  if (armCount > 0) {
    upperArmLength /= armCount;
    foreArmLength /= armCount;
  } else {
    upperArmLength = shoulderWidth * 0.7;
    foreArmLength = shoulderWidth * 0.7;
  }

  // Head distance
  let headToTorso: number = 0.4;
  if (nose && (nose.visibility || 0) > 0.35) {
    const headDist: number = Math.hypot(nose.x - shoulderMidX, nose.y - shoulderMidY);
    headToTorso = headDist / torsoHeight;
  }

  const shoulderToTorso = shoulderWidth / torsoHeight;
  const armToTorso = (upperArmLength + foreArmLength) / torsoHeight;
  const foreArmToUpperArm = upperArmLength > 0.01 ? foreArmLength / upperArmLength : 1.0;
  const bodyAspectRatio = shoulderWidth / (torsoHeight + upperArmLength);

  return {
    shoulderWidth,
    torsoHeight,
    shoulderToTorso,
    armToTorso,
    foreArmToUpperArm,
    headToTorso,
    bodyAspectRatio,
  };
}

/**
 * So sánh 2 chữ ký sinh trắc học xem có phải cùng 1 người hay không:
 * Trả về similarity (0 - 100%) và isSamePerson (boolean).
 */
export function compareBiometricSignatures(
  sigA: BiometricSignature,
  sigB: BiometricSignature
): { similarity: number; isSamePerson: boolean } {
  // Tính độ lệch phần trăm tuyệt đối giữa các chỉ số nhân trắc học
  const diffShoulderTorso = Math.abs(sigA.shoulderToTorso - sigB.shoulderToTorso) / Math.max(0.1, (sigA.shoulderToTorso + sigB.shoulderToTorso) / 2);
  const diffArmTorso = Math.abs(sigA.armToTorso - sigB.armToTorso) / Math.max(0.1, (sigA.armToTorso + sigB.armToTorso) / 2);
  const diffForeArmUpper = Math.abs(sigA.foreArmToUpperArm - sigB.foreArmToUpperArm) / Math.max(0.1, (sigA.foreArmToUpperArm + sigB.foreArmToUpperArm) / 2);
  const diffHeadTorso = Math.abs(sigA.headToTorso - sigB.headToTorso) / Math.max(0.1, (sigA.headToTorso + sigB.headToTorso) / 2);
  const diffAspect = Math.abs(sigA.bodyAspectRatio - sigB.bodyAspectRatio) / Math.max(0.1, (sigA.bodyAspectRatio + sigB.bodyAspectRatio) / 2);

  // Trọng số các thành phần
  const totalDiff = (diffShoulderTorso * 0.3) + (diffArmTorso * 0.25) + (diffAspect * 0.25) + (diffForeArmUpper * 0.1) + (diffHeadTorso * 0.1);

  // Tính điểm similarity (100% khi trùng khớp hoàn toàn, giảm khi có sự khác biệt)
  const similarity = Math.max(0, Math.min(100, Math.round((1 - Math.min(1, totalDiff)) * 100)));

  // Ngưỡng: Nếu độ tương đồng >= 68% thì xác nhận là cùng 1 người.
  // Ngược lại nếu similarity < 68% -> Khẳng định là người khác (chặn nhận diện).
  const isSamePerson = similarity >= 68;

  return { similarity, isSamePerson };
}

interface UsePoseDetectionOptions {
  onResults?: (results: Results) => void;
  onPoseData?: (data: PoseData) => void;
  enableSmoothing?: boolean;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}

export function usePoseDetection(options: UsePoseDetectionOptions = {}) {
  const {
    onResults,
    onPoseData,
    enableSmoothing = true,
    minDetectionConfidence = 0.5,
    minTrackingConfidence = 0.5,
  } = options;

  const poseRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Store callbacks in refs so changing them never triggers re-init ──────
  const onResultsRef = useRef(onResults);
  const onPoseDataRef = useRef(onPoseData);
  useEffect(() => { onResultsRef.current = onResults; });
  useEffect(() => { onPoseDataRef.current = onPoseData; });

  // Calculate angle between three points
  const calculateAngle = useCallback(
    (point1: { x: number; y: number }, point2: { x: number; y: number }, point3: { x: number; y: number }) => {
      const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) -
        Math.atan2(point1.y - point2.y, point1.x - point2.x);
      let angle: number = Math.abs(radians * 180 / Math.PI);
      if (angle > 180) {
        angle = 360 - angle;
      }
      return angle;
    },
    []
  );

  // Initialize MediaPipe Pose with dynamic import
  useEffect(() => {
    let pose: any = null;
    let isMounted: boolean = true;

    const initPose = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamically import MediaPipe Pose
        const { Pose } = await import('@mediapipe/pose');

        if (!isMounted) return;

        pose = new Pose({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          },
        });

        pose.setOptions({
          modelComplexity: 0, // 0: Lite (fastest), 1: Full, 2: Heavy
          smoothLandmarks: enableSmoothing,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: minDetectionConfidence,
          minTrackingConfidence: minTrackingConfidence,
        });

        // Use refs so this closure never goes stale — no re-init on callback change
        pose.onResults((results: Results) => {
          if (!isMounted) return;
          setIsModelReady(true);
          onResultsRef.current?.(results);

          if (results.poseLandmarks) {
            const humanCheck = validateHumanPose(results.poseLandmarks);
            const poseData: PoseData = {
              landmarks: results.poseLandmarks.map((landmark: any, index: number) => ({
                x: landmark.x,
                y: landmark.y,
                z: landmark.z || 0,
                visibility: landmark.visibility || 0,
                name: `POINT_${index}`,
              })),
              worldLandmarks: [],
              hasPose: humanCheck.isHuman,
            };
            onPoseDataRef.current?.(poseData);
          } else {
            onPoseDataRef.current?.({ landmarks: [], worldLandmarks: [], hasPose: false });
          }
        });

        await pose.initialize();
        if (isMounted) {
          poseRef.current = pose;
          setIsLoading(false);
          setIsModelReady(true); // Model sẵn sàng nhận frame ngay sau khi initialize
        }
      } catch (err) {
        console.error('Failed to initialize MediaPipe Pose:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load AI Pose');
          setIsLoading(false);
        }
      }
    };

    initPose();

    return () => {
      isMounted = false;
      pose?.close();
      poseRef.current = null;
    };
  // ⚠️ onResults / onPoseData intentionally excluded — stored in refs above
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableSmoothing, minDetectionConfidence, minTrackingConfidence]);


  // Send frame to pose detection
  const detectPose = useCallback((video: HTMLVideoElement) => {
    if (poseRef.current && video.readyState >= 2) {
      videoRef.current = video;
      poseRef.current.send({ image: video });
    }
  }, []);

  // Helper functions for exercise tracking
  const getJointAngle = useCallback(
    (data: PoseData, joint: 'leftElbow' | 'rightElbow' | 'leftKnee' | 'rightKnee' | 'leftShoulder' | 'rightShoulder'): number | null => {
      if (!data.hasPose || data.landmarks.length < 33) return null;

      const landmarks = data.landmarks;

      const jointMap: Record<string, [number, number, number]> = {
        leftElbow: [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST],
        rightElbow: [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST],
        leftKnee: [LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE],
        rightKnee: [LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE],
        leftShoulder: [LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_HIP],
        rightShoulder: [LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_HIP],
      };

      const indices = jointMap[joint];
      if (!indices) return null;

      const [p1, p2, p3] = indices;
      if (!landmarks[p1] || !landmarks[p2] || !landmarks[p3]) return null;
      if (landmarks[p1].visibility < 0.5 || landmarks[p2].visibility < 0.5 || landmarks[p3].visibility < 0.5) return null;

      return calculateAngle(landmarks[p1], landmarks[p2], landmarks[p3]);
    },
    [calculateAngle]
  );

  // Check if person is in push-up position
  const checkPushupPosition = useCallback(
    (landmarks: any[]): { isInPosition: boolean; confidence: number; details: string; checks: Record<string, boolean> } => {
      if (!landmarks || landmarks.length < 33) {
        return { isInPosition: false, confidence: 0, details: 'Không phát hiện đủ landmarks', checks: {} };
      }

      // --- CHECK 0: Strict Human Verification (Chỉ tính con người) ---
      const humanValidation = validateHumanPose(landmarks);
      if (!humanValidation.isHuman) {
        return {
          isInPosition: false,
          confidence: Math.round(humanValidation.confidence * 0.5),
          details: humanValidation.reason,
          checks: { isHuman: false, isVisible: false, isHorizontal: false, isArmReady: false, isFaceDown: false },
        };
      }

      // Key landmarks for push-up detection
      const nose = landmarks[LANDMARKS.NOSE];
      const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
      const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
      const leftElbow = landmarks[LANDMARKS.LEFT_ELBOW];
      const rightElbow = landmarks[LANDMARKS.RIGHT_ELBOW];
      const leftWrist = landmarks[LANDMARKS.LEFT_WRIST];
      const rightWrist = landmarks[LANDMARKS.RIGHT_WRIST];
      const leftHip = landmarks[LANDMARKS.LEFT_HIP];
      const rightHip = landmarks[LANDMARKS.RIGHT_HIP];

      // --- CHECK 1: Visibility of upper-body landmarks (required) ---
      const upperBodyLandmarks = [leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist];
      const upperBodyVisibility = upperBodyLandmarks.reduce((sum, lm) => sum + (lm?.visibility || 0), 0) / upperBodyLandmarks.length;
      const isVisible = upperBodyVisibility >= PUSHUP_CONFIG.GOOD_VISIBILITY;

      if (!isVisible) {
        return {
          isInPosition: false,
          confidence: Math.round(upperBodyVisibility * 60),
          details: upperBodyVisibility < 0.2 ? 'Đứng vào khung hình của camera' : 'Bước ra xa hơn để camera thấy toàn thân',
          checks: { isVisible: false, isHorizontal: false, isArmReady: false, isFaceDown: false },
        };
      }

      // --- CHECK 2: Body is horizontal (push-up plank position) ---
      // Works with side-view and angled cameras.
      // For plank/push-up, shoulder Y ≈ hip Y (both at similar vertical position in frame)
      const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
      const hipMidY = leftHip && rightHip ? (leftHip.y + rightHip.y) / 2 : shoulderMidY;
      const wristMidY = (leftWrist.y + rightWrist.y) / 2;

      // Body horizontal: shoulder and hip should be close in Y (relaxed from 0.8 → 0.6 threshold)
      const shoulderHipDeltaY = Math.abs(shoulderMidY - hipMidY);
      const isHorizontal = shoulderHipDeltaY < 0.25; // Relaxed: was implicitly 0.2 before

      // --- CHECK 3: Arms are in push-up position (wrists below shoulders, elbows visible) ---
      // For plank/push-up starting position, arms should be mostly extended (angle 120-180°)
      // OR partially bent (angle 70-120° for mid-rep)
      const leftElbowAngle = calculateAngle(
        { x: leftShoulder.x, y: leftShoulder.y },
        { x: leftElbow.x, y: leftElbow.y },
        { x: leftWrist.x, y: leftWrist.y }
      );
      const rightElbowAngle = calculateAngle(
        { x: rightShoulder.x, y: rightShoulder.y },
        { x: rightElbow.x, y: rightElbow.y },
        { x: rightWrist.x, y: rightWrist.y }
      );
      const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

      // Wrists should be near or below shoulder height (hands on floor) – relaxed check
      const wristsLowEnough = wristMidY >= shoulderMidY - 0.15;
      const isArmReady = wristsLowEnough && avgElbowAngle >= PUSHUP_CONFIG.DOWN_MIN;

      // --- CHECK 4: Face toward ground (nose lower than or near shoulder level) ---
      const isFaceDown = nose ? (nose.y >= shoulderMidY - 0.05) : true; // lenient: allow slight above

      // --- Confidence Scoring (0-100) ---
      // Weighted: visibility 25, horizontal 30, arms 30, face 15
      const visScore    = Math.min(upperBodyVisibility / PUSHUP_CONFIG.EXCELLENT_VISIBILITY, 1) * 25;
      const horizScore  = isHorizontal ? 30 : Math.max(0, (0.25 - shoulderHipDeltaY) / 0.25) * 20;
      const armScore    = isArmReady ? 30 : (wristsLowEnough ? 15 : 0);
      const faceScore   = isFaceDown ? 15 : 5;

      const confidence = Math.round(visScore + horizScore + armScore + faceScore);

      // Position confirmed when all critical checks pass and confidence >= 60
      const isInPosition = isVisible && isHorizontal && isArmReady && isFaceDown && confidence >= 60;

      // --- Human-readable feedback ---
      let details: string = '';
      if (isInPosition) {
        details = avgElbowAngle < PUSHUP_CONFIG.DOWN_START
          ? `✅ Đang ở tư thế hít đất (khuỷu: ${Math.round(avgElbowAngle)}°)`
          : `✅ Sẵn sàng! Giữ thẳng người (khuỷu: ${Math.round(avgElbowAngle)}°)`;
      } else if (!isHorizontal) {
        details = shoulderMidY < hipMidY - 0.1
          ? '⬇️ Hạ vai xuống – nằm thẳng người theo chiều ngang'
          : '↔️ Giữ thẳng người – đừng cong lưng';
      } else if (!isArmReady) {
        details = !wristsLowEnough
          ? '🖐 Đặt tay xuống sàn ngang vai'
          : `💪 Điều chỉnh tay (khuỷu tay: ${Math.round(avgElbowAngle)}°)`;
      } else if (!isFaceDown) {
        details = '👇 Cúi mặt xuống – nhìn về phía sàn';
      } else {
        details = `🔍 Tiếp tục giữ tư thế... (${confidence}%)`;
      }

      return {
        isInPosition,
        confidence,
        details,
        checks: { isVisible, isHorizontal, isArmReady, isFaceDown },
      };
    },
    [calculateAngle]
  );

  // Check if person is in pull-up position (check xà trước khi bắt đầu)
  const checkPullupPosition = useCallback(
    (landmarks: any[]): { isInPosition: boolean; barY: number; confidence: number; details: string; checks: Record<string, boolean> } => {
      if (!landmarks || landmarks.length < 33) {
        return { isInPosition: false, barY: 0, confidence: 0, details: 'Không phát hiện đủ landmarks', checks: {} };
      }

      // --- CHECK 0: Strict Human Verification ---
      const humanValidation = validateHumanPose(landmarks);
      if (!humanValidation.isHuman) {
        return {
          isInPosition: false,
          barY: 0,
          confidence: Math.round(humanValidation.confidence * 0.5),
          details: humanValidation.reason,
          checks: { isHuman: false, isVisible: false, isHandsOnBar: false, isHanging: false },
        };
      }

      const nose = landmarks[LANDMARKS.NOSE];
      const leftShoulder = landmarks[LANDMARKS.LEFT_SHOULDER];
      const rightShoulder = landmarks[LANDMARKS.RIGHT_SHOULDER];
      const leftElbow = landmarks[LANDMARKS.LEFT_ELBOW];
      const rightElbow = landmarks[LANDMARKS.RIGHT_ELBOW];
      const leftWrist = landmarks[LANDMARKS.LEFT_WRIST];
      const rightWrist = landmarks[LANDMARKS.RIGHT_WRIST];
      const leftHip = landmarks[LANDMARKS.LEFT_HIP];
      const rightHip = landmarks[LANDMARKS.RIGHT_HIP];

      // Upper body visibility
      const upperBody = [leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist];
      const upperBodyVis = upperBody.reduce((sum, lm) => sum + (lm?.visibility || 0), 0) / upperBody.length;
      const isVisible = upperBodyVis >= PULLUP_CONFIG.GOOD_VISIBILITY;

      if (!isVisible) {
        return {
          isInPosition: false,
          barY: 0,
          confidence: Math.round(upperBodyVis * 50),
          details: 'Đứng lùi lại để camera thấy rõ thanh xà và cơ thể',
          checks: { isHuman: true, isVisible: false, isHandsOnBar: false, isHanging: false },
        };
      }

      const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
      const wristMidY = (leftWrist.y + rightWrist.y) / 2;
      const hipMidY = leftHip && rightHip ? (leftHip.y + rightHip.y) / 2 : shoulderMidY + 0.3;

      // 1. Kiểm tra vị trí xà & 2 tay bám xà:
      // Cả 2 cổ tay phải giơ cao hơn đầu (trong tọa độ Y, giá trị nhỏ hơn là cao hơn)
      // Cổ tay cao hơn vai (wristMidY < shoulderMidY - 0.08)
      const wristsAboveHead = nose ? (wristMidY < nose.y) : (wristMidY < shoulderMidY - 0.1);
      const wristsAboveShoulders = wristMidY < shoulderMidY - 0.08;
      const isHandsOnBar = wristsAboveHead && wristsAboveShoulders;

      // 2. Thân người ở tư thế treo thẳng (vai ở trên hông):
      const isHanging = shoulderMidY < hipMidY;

      // 3. Góc khuỷu tay: ở tư thế treo bắt đầu, tay duỗi thẳng hoặc gần thẳng (> 110°)
      const leftElbowAngle = calculateAngle(
        { x: leftShoulder.x, y: leftShoulder.y },
        { x: leftElbow.x, y: leftElbow.y },
        { x: leftWrist.x, y: leftWrist.y }
      );
      const rightElbowAngle = calculateAngle(
        { x: rightShoulder.x, y: rightShoulder.y },
        { x: rightElbow.x, y: rightElbow.y },
        { x: rightWrist.x, y: rightWrist.y }
      );
      const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

      // Tính điểm confidence
      const visScore = Math.min(1, upperBodyVis / PULLUP_CONFIG.EXCELLENT_VISIBILITY) * 30;
      const handsScore = isHandsOnBar ? 35 : (wristsAboveShoulders ? 15 : 0);
      const hangScore = isHanging ? 20 : 0;
      const armScore = avgElbowAngle > 110 ? 15 : 5;
      const confidence = Math.round(visScore + handsScore + hangScore + armScore);

      const isInPosition = isVisible && isHandsOnBar && isHanging && confidence >= 60;

      let details: string = '';
      if (isInPosition) {
        details = `✅ Đã nhận diện xà & tư thế bám xà! (Giữ yên để bắt đầu)`;
      } else if (!isHandsOnBar) {
        details = !wristsAboveShoulders
          ? '⬆️ Đưa hai tay lên bám vào thanh xà trên cao'
          : '⬆️ Bám chắc hai tay vào thanh xà';
      } else if (!isHanging) {
        details = '↕️ Treo thẳng người trên xà';
      } else {
        details = `🔍 Đang quét vị trí xà... (${confidence}%)`;
      }

      return {
        isInPosition,
        barY: wristMidY,
        confidence,
        details,
        checks: { isHuman: true, isVisible, isHandsOnBar, isHanging },
      };
    },
    [calculateAngle]
  );

  return {
    pose: poseRef.current,
    isModelReady,
    isLoading,
    error,
    detectPose,
    getJointAngle,
    checkPushupPosition,
    checkPullupPosition,
    validateHumanPose,
    extractBiometricSignature,
    compareBiometricSignatures,
    calculateAngle,
    POSE_CONNECTIONS,
    LANDMARKS,
    POSE_LANDMARKS,
  };
}

// Utility to draw pose on canvas
export function drawPose(
  ctx: CanvasRenderingContext2D,
  results: Results,
  options: {
    color?: string;
    lineWidth?: number;
    pointRadius?: number;
    mirror?: boolean;
  } = {}
) {
  const {
    color = '#2ED573',
    lineWidth = 4,
    pointRadius = 5,
    mirror = true,
  } = options;

  const { poseLandmarks, worldLandmarks } = results;
  const landmarks = poseLandmarks || worldLandmarks;

  if (!landmarks || landmarks.length === 0) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;

  // Draw connections
  POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];

    if (start && end && (start.visibility ?? 1) >= 0.25 && (end.visibility ?? 1) >= 0.25) {
      ctx.beginPath();
      const startX = (mirror ? 1 - start.x : start.x) * ctx.canvas.width;
      const startY = start.y * ctx.canvas.height;
      const endX   = (mirror ? 1 - end.x   : end.x)   * ctx.canvas.width;
      const endY   = end.y   * ctx.canvas.height;

      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  });

  // Draw landmark points
  landmarks.forEach((landmark) => {
    if ((landmark.visibility ?? 1) >= 0.25) {
      const x = mirror ? 1 - landmark.x : landmark.x;
      ctx.beginPath();
      ctx.arc(x * ctx.canvas.width, landmark.y * ctx.canvas.height, pointRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
  });
  ctx.restore();
}
