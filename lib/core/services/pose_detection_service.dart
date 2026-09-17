import 'dart:async';
import 'dart:math' as math;
import 'package:camera/camera.dart';
import 'package:google_mlkit_pose_detection/google_mlkit_pose_detection.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

/// Pose Detection Service using Google ML Kit
/// Handles camera input and real-time pose landmark detection
class PoseDetectionService {
  CameraController? _cameraController;
  PoseDetector? _poseDetector;
  bool _isInitialized = false;
  bool _isDetecting = false;
  
  // Callbacks
  Function(Pose)? onPoseDetected;
  Function(List<PoseLandmark>)? onLandmarksDetected;
  Function(String)? onError;
  
  // Camera state
  bool get isInitialized => _isInitialized;
  CameraController? get cameraController => _cameraController;
  
  // Available cameras
  static Future<List<CameraDescription>> getAvailableCameras() async {
    try {
      return await availableCameras();
    } catch (e) {
      debugPrint('Error getting cameras: $e');
      return [];
    }
  }
  
  CameraDescription? _cameraDescription;
  bool _isProcessingFrame = false;

  /// Initialize camera and pose detector
  Future<bool> initialize({bool useFrontCamera = true}) async {
    try {
      // Get available cameras
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        onError?.call('No cameras available');
        return false;
      }
      
      // Select camera (front for selfies/exercise tracking)
      final camera = useFrontCamera
          ? cameras.firstWhere(
              (c) => c.lensDirection == CameraLensDirection.front,
              orElse: () => cameras.first,
            )
          : cameras.firstWhere(
              (c) => c.lensDirection == CameraLensDirection.back,
              orElse: () => cameras.first,
            );
      
      _cameraDescription = camera;

      // Initialize camera controller
      _cameraController = CameraController(
        camera,
        ResolutionPreset.medium, // Balance quality and performance
        enableAudio: false,
        imageFormatGroup: ImageFormatGroup.yuv420,
      );
      
      await _cameraController!.initialize();
      
      // Initialize pose detector
      final options = PoseDetectorOptions(
        mode: PoseDetectionMode.stream, // Real-time detection
        model: PoseDetectionModel.accurate, // More accurate model
      );
      _poseDetector = PoseDetector(options: options);
      
      _isInitialized = true;
      debugPrint('PoseDetectionService initialized successfully');
      return true;
      
    } catch (e) {
      debugPrint('Error initializing PoseDetectionService: $e');
      onError?.call('Failed to initialize: $e');
      return false;
    }
  }
  
  /// Start real-time pose detection
  Future<void> startDetection() async {
    if (!_isInitialized || _isDetecting) return;
    
    _isDetecting = true;
    _processCameraFrames();
  }
  
  /// Stop pose detection
  void stopDetection() {
    _isDetecting = false;
  }
  
  /// Process camera frames for pose detection
  void _processCameraFrames() async {
    if (!_isDetecting || _cameraController == null || _poseDetector == null) return;
    
    // Listen to camera frames
    _cameraController!.startImageStream((CameraImage image) async {
      if (!_isDetecting || _isProcessingFrame) return;
      _isProcessingFrame = true;
      
      try {
        final inputImage = _convertCameraImage(image);
        if (inputImage == null) return;
        
        // Detect poses
        final poses = await _poseDetector!.processImage(inputImage);
        
        if (poses.isNotEmpty) {
          final pose = poses.first;
          onPoseDetected?.call(pose);
          onLandmarksDetected?.call(pose.landmarks.values.toList());
        }
        
      } catch (e) {
        debugPrint('Error processing frame: $e');
      } finally {
        _isProcessingFrame = false;
      }
    });
  }
  
  /// Convert CameraImage to InputImage for ML Kit
  InputImage? _convertCameraImage(CameraImage image) {
    try {
      final camera = _cameraDescription;
      final sensorOrientation = camera?.sensorOrientation ?? 0;
      final rotation = InputImageRotationValue.fromRawValue(sensorOrientation) ??
          InputImageRotation.rotation0deg;

      final format = InputImageFormatValue.fromRawValue(image.format.raw) ??
          (image.format.group == ImageFormatGroup.yuv420
              ? InputImageFormat.nv21
              : InputImageFormat.yuv420);

      // Concatenate all planes for YUV420
      final WriteBuffer allBytes = WriteBuffer();
      for (final Plane plane in image.planes) {
        allBytes.putUint8List(plane.bytes);
      }
      final bytes = allBytes.done().buffer.asUint8List();

      final inputImage = InputImage.fromBytes(
        bytes: bytes,
        metadata: InputImageMetadata(
          size: Size(image.width.toDouble(), image.height.toDouble()),
          rotation: rotation,
          format: format,
          bytesPerRow: image.planes.first.bytesPerRow,
        ),
      );
      
      return inputImage;
    } catch (e) {
      debugPrint('Error converting camera image: $e');
      return null;
    }
  }
  
  /// Get camera preview size
  Size? getPreviewSize() {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return null;
    }
    return Size(
      _cameraController!.value.previewSize!.height,
      _cameraController!.value.previewSize!.width,
    );
  }
  
  /// Dispose resources
  Future<void> dispose() async {
    _isDetecting = false;
    _cameraController?.dispose();
    _cameraController = null;
    _poseDetector?.close();
    _poseDetector = null;
    _isInitialized = false;
  }
}

/// Pose landmark utility functions
class PoseUtils {
  /// Calculate angle between three points
  static double calculateAngle(
    PoseLandmark first,
    PoseLandmark middle,
    PoseLandmark last,
  ) {
    final radians = math.atan2(
      last.y - middle.y,
      last.x - middle.x,
    ) - math.atan2(
      first.y - middle.y,
      first.x - middle.x,
    );
    
    var angle = radians.abs() * 180 / math.pi;
    if (angle > 180) angle = 360 - angle;
    return angle;
  }
  
  /// Check if landmark is visible/confident
  static bool isLandmarkConfident(PoseLandmark landmark, {double minConfidence = 0.5}) {
    return landmark.likelihood > minConfidence;
  }
  
  /// Get key body landmarks for exercises
  static Map<String, PoseLandmark?> getExerciseLandmarks(Pose pose) {
    final landmarks = pose.landmarks;
    
    return {
      // Left side
      'leftShoulder': landmarks[PoseLandmarkType.leftShoulder],
      'leftElbow': landmarks[PoseLandmarkType.leftElbow],
      'leftWrist': landmarks[PoseLandmarkType.leftWrist],
      'leftHip': landmarks[PoseLandmarkType.leftHip],
      'leftKnee': landmarks[PoseLandmarkType.leftKnee],
      'leftAnkle': landmarks[PoseLandmarkType.leftAnkle],
      
      // Right side
      'rightShoulder': landmarks[PoseLandmarkType.rightShoulder],
      'rightElbow': landmarks[PoseLandmarkType.rightElbow],
      'rightWrist': landmarks[PoseLandmarkType.rightWrist],
      'rightHip': landmarks[PoseLandmarkType.rightHip],
      'rightKnee': landmarks[PoseLandmarkType.rightKnee],
      'rightAnkle': landmarks[PoseLandmarkType.rightAnkle],
      
      // Head
      'nose': landmarks[PoseLandmarkType.nose],
      'leftEar': landmarks[PoseLandmarkType.leftEar],
      'rightEar': landmarks[PoseLandmarkType.rightEar],
    };
  }

  /// 1. Xác thực con người thật (Human Only Verification)
  /// Kiểm tra giải phẫu học cơ thể người thực tế (đầu, vai, khuỷu, cổ tay, thân, tỷ lệ chi)
  /// Loại bỏ tuyệt đối: vật thể vô tri, động vật, bóng mờ, tranh ảnh giả
  static HumanValidationResult validateHumanPose(Pose pose) {
    final landmarks = pose.landmarks;
    if (landmarks.isEmpty || landmarks.length < 20) {
      return const HumanValidationResult(
        isHuman: false,
        confidence: 0,
        reason: 'Không phát hiện đủ điểm khung xương',
      );
    }

    final nose = landmarks[PoseLandmarkType.nose];
    final leftEye = landmarks[PoseLandmarkType.leftEye];
    final rightEye = landmarks[PoseLandmarkType.rightEye];
    final leftEar = landmarks[PoseLandmarkType.leftEar];
    final rightEar = landmarks[PoseLandmarkType.rightEar];

    final leftShoulder = landmarks[PoseLandmarkType.leftShoulder];
    final rightShoulder = landmarks[PoseLandmarkType.rightShoulder];
    final leftElbow = landmarks[PoseLandmarkType.leftElbow];
    final rightElbow = landmarks[PoseLandmarkType.rightElbow];
    final leftWrist = landmarks[PoseLandmarkType.leftWrist];
    final rightWrist = landmarks[PoseLandmarkType.rightWrist];

    final leftHip = landmarks[PoseLandmarkType.leftHip];
    final rightHip = landmarks[PoseLandmarkType.rightHip];

    // 1. Kiểm tra đầu / khuôn mặt
    final headPoints = [nose, leftEye, rightEye, leftEar, rightEar].whereType<PoseLandmark>().toList();
    final bool hasHead = headPoints.any((p) => p.likelihood >= 0.40);

    // 2. Kiểm tra bờ vai con người
    final double leftShoulderVis = leftShoulder?.likelihood ?? 0.0;
    final double rightShoulderVis = rightShoulder?.likelihood ?? 0.0;
    final bool hasShoulders = (leftShoulderVis >= 0.40 && rightShoulderVis >= 0.30) ||
                             (rightShoulderVis >= 0.40 && leftShoulderVis >= 0.30) ||
                             (leftShoulderVis >= 0.55) || (rightShoulderVis >= 0.55);

    // Khoảng cách 2 vai không được chụm lại thành 1 điểm
    bool shoulderDistValid = true;
    if (leftShoulder != null && rightShoulder != null && leftShoulderVis >= 0.35 && rightShoulderVis >= 0.35) {
      final double sDist = math.sqrt(
        math.pow(leftShoulder.x - rightShoulder.x, 2) +
        math.pow(leftShoulder.y - rightShoulder.y, 2),
      );
      if (sDist < 15.0) {
        shoulderDistValid = false;
      }
    }

    // 3. Kiểm tra cấu trúc cánh tay người
    final bool hasLeftArm = leftShoulderVis >= 0.35 &&
        (leftElbow?.likelihood ?? 0) >= 0.35 &&
        (leftWrist?.likelihood ?? 0) >= 0.30;
    final bool hasRightArm = rightShoulderVis >= 0.35 &&
        (rightElbow?.likelihood ?? 0) >= 0.35 &&
        (rightWrist?.likelihood ?? 0) >= 0.30;
    final bool hasArms = hasLeftArm || hasRightArm;

    // 4. Kiểm tra thân người (vùng hông)
    final bool hasTorso = (leftHip?.likelihood ?? 0) >= 0.30 || (rightHip?.likelihood ?? 0) >= 0.30;

    // 5. Tỷ lệ giải phẫu học cơ thể người
    bool anatomyRatioValid = shoulderDistValid;
    if (hasLeftArm && leftShoulder != null && leftElbow != null && leftWrist != null) {
      final double upperArm = math.sqrt(math.pow(leftShoulder.x - leftElbow.x, 2) + math.pow(leftShoulder.y - leftElbow.y, 2));
      final double foreArm = math.sqrt(math.pow(leftElbow.x - leftWrist.x, 2) + math.pow(leftElbow.y - leftWrist.y, 2));
      if (upperArm > 5 && foreArm > 5) {
        final double ratio = upperArm / foreArm;
        if (ratio < 0.35 || ratio > 2.6) anatomyRatioValid = false;
      }
    }
    if (hasRightArm && rightShoulder != null && rightElbow != null && rightWrist != null && anatomyRatioValid) {
      final double upperArm = math.sqrt(math.pow(rightShoulder.x - rightElbow.x, 2) + math.pow(rightShoulder.y - rightElbow.y, 2));
      final double foreArm = math.sqrt(math.pow(rightElbow.x - rightWrist.x, 2) + math.pow(rightElbow.y - rightWrist.y, 2));
      if (upperArm > 5 && foreArm > 5) {
        final double ratio = upperArm / foreArm;
        if (ratio < 0.35 || ratio > 2.6) anatomyRatioValid = false;
      }
    }

    // 6. Điểm tin cậy các khớp cốt lõi
    final coreLandmarks = [nose, leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist, leftHip, rightHip]
        .whereType<PoseLandmark>().toList();
    final double avgVis = coreLandmarks.isNotEmpty
        ? coreLandmarks.map((lm) => lm.likelihood).reduce((a, b) => a + b) / coreLandmarks.length
        : 0.0;
    final int reliableCount = coreLandmarks.where((lm) => lm.likelihood >= 0.40).length;

    final bool isHuman = hasHead && hasShoulders && hasArms && hasTorso && anatomyRatioValid && reliableCount >= 4;

    String reason = 'Đã xác thực con người';
    if (!hasHead) {
      reason = 'Vui lòng đứng vào khung hình để camera nhận diện khuôn mặt';
    } else if (!hasShoulders) {
      reason = 'Vui lòng đứng lùi lại để camera thấy rõ hai vai';
    } else if (!hasArms) {
      reason = 'Vui lòng để lộ hai cánh tay trước camera';
    } else if (!hasTorso) {
      reason = 'Vui lòng đứng lùi lại để camera thấy toàn thân (từ vai đến hông)';
    } else if (!anatomyRatioValid) {
      reason = 'Tư thế chưa chuẩn, vui lòng xoay người về phía camera';
    } else if (reliableCount < 4) {
      reason = 'Hình ảnh mờ, vui lòng đứng đủ sáng hoặc lại gần hơn';
    }

    final int confidence = (avgVis * 100).round().clamp(0, 100);

    return HumanValidationResult(
      isHuman: isHuman,
      confidence: confidence,
      reason: reason,
    );
  }

  /// 2. Trích xuất chữ ký sinh trắc học nhân trắc (Biometric Signature)
  /// Chuẩn hóa tỷ lệ kích thước xương bất biến theo khoảng cách xa gần tới camera
  static BiometricSignature? extractBiometricSignature(Pose pose) {
    final landmarks = pose.landmarks;
    final leftShoulder = landmarks[PoseLandmarkType.leftShoulder];
    final rightShoulder = landmarks[PoseLandmarkType.rightShoulder];
    final leftHip = landmarks[PoseLandmarkType.leftHip];
    final rightHip = landmarks[PoseLandmarkType.rightHip];
    final nose = landmarks[PoseLandmarkType.nose];
    final leftElbow = landmarks[PoseLandmarkType.leftElbow];
    final leftWrist = landmarks[PoseLandmarkType.leftWrist];
    final rightElbow = landmarks[PoseLandmarkType.rightElbow];
    final rightWrist = landmarks[PoseLandmarkType.rightWrist];

    if (leftShoulder == null || rightShoulder == null) return null;

    final double shoulderWidth = math.sqrt(
      math.pow(leftShoulder.x - rightShoulder.x, 2) +
      math.pow(leftShoulder.y - rightShoulder.y, 2),
    );
    if (shoulderWidth < 15.0) return null;

    final double shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2.0;
    final double shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2.0;

    // Chiều cao thân người (vai đến hông)
    double torsoHeight = shoulderWidth * 1.3;
    if (leftHip != null && rightHip != null && leftHip.likelihood > 0.3 && rightHip.likelihood > 0.3) {
      final double hipMidX = (leftHip.x + rightHip.x) / 2.0;
      final double hipMidY = (leftHip.y + rightHip.y) / 2.0;
      torsoHeight = math.max(20.0, math.sqrt(math.pow(shoulderMidX - hipMidX, 2) + math.pow(shoulderMidY - hipMidY, 2)));
    } else if (leftHip != null && leftHip.likelihood > 0.3) {
      torsoHeight = math.max(20.0, math.sqrt(math.pow(leftShoulder.x - leftHip.x, 2) + math.pow(leftShoulder.y - leftHip.y, 2)));
    } else if (rightHip != null && rightHip.likelihood > 0.3) {
      torsoHeight = math.max(20.0, math.sqrt(math.pow(rightShoulder.x - rightHip.x, 2) + math.pow(rightShoulder.y - rightHip.y, 2)));
    }

    // Chiều dài cánh tay
    double upperArmLength = 0.0;
    double foreArmLength = 0.0;
    int armCount = 0;

    if (leftElbow != null && leftWrist != null && leftElbow.likelihood > 0.35 && leftWrist.likelihood > 0.3) {
      upperArmLength += math.sqrt(math.pow(leftShoulder.x - leftElbow.x, 2) + math.pow(leftShoulder.y - leftElbow.y, 2));
      foreArmLength += math.sqrt(math.pow(leftElbow.x - leftWrist.x, 2) + math.pow(leftElbow.y - leftWrist.y, 2));
      armCount++;
    }
    if (rightElbow != null && rightWrist != null && rightElbow.likelihood > 0.35 && rightWrist.likelihood > 0.3) {
      upperArmLength += math.sqrt(math.pow(rightShoulder.x - rightElbow.x, 2) + math.pow(rightShoulder.y - rightElbow.y, 2));
      foreArmLength += math.sqrt(math.pow(rightElbow.x - rightWrist.x, 2) + math.pow(rightElbow.y - rightWrist.y, 2));
      armCount++;
    }

    if (armCount > 0) {
      upperArmLength /= armCount;
      foreArmLength /= armCount;
    } else {
      upperArmLength = shoulderWidth * 0.7;
      foreArmLength = shoulderWidth * 0.7;
    }

    double headToTorso = 0.35;
    if (nose != null && nose.likelihood > 0.35) {
      final double headDist = math.sqrt(math.pow(nose.x - shoulderMidX, 2) + math.pow(nose.y - shoulderMidY, 2));
      headToTorso = headDist / torsoHeight;
    }

    final double shoulderToTorso = shoulderWidth / torsoHeight;
    final double armToTorso = (upperArmLength + foreArmLength) / torsoHeight;
    final double foreArmToUpperArm = upperArmLength > 1.0 ? foreArmLength / upperArmLength : 1.0;
    final double bodyAspectRatio = shoulderWidth / (torsoHeight + upperArmLength);

    return BiometricSignature(
      shoulderWidth: shoulderWidth,
      torsoHeight: torsoHeight,
      shoulderToTorso: shoulderToTorso,
      armToTorso: armToTorso,
      foreArmToUpperArm: foreArmToUpperArm,
      headToTorso: headToTorso,
      bodyAspectRatio: bodyAspectRatio,
    );
  }

  /// 3. So sánh 2 chữ ký sinh trắc học xem có phải cùng một người hay không
  /// Ngưỡng: similarity >= 68% -> Cùng 1 người; < 68% -> Người khác (chặn nhận diện)
  static ({int similarity, bool isSamePerson}) compareBiometricSignatures(
    BiometricSignature a,
    BiometricSignature b,
  ) {
    final double diffShoulderTorso = (a.shoulderToTorso - b.shoulderToTorso).abs() /
        math.max(0.1, (a.shoulderToTorso + b.shoulderToTorso) / 2.0);
    final double diffArmTorso = (a.armToTorso - b.armToTorso).abs() /
        math.max(0.1, (a.armToTorso + b.armToTorso) / 2.0);
    final double diffForeArmUpper = (a.foreArmToUpperArm - b.foreArmToUpperArm).abs() /
        math.max(0.1, (a.foreArmToUpperArm + b.foreArmToUpperArm) / 2.0);
    final double diffHeadTorso = (a.headToTorso - b.headToTorso).abs() /
        math.max(0.1, (a.headToTorso + b.headToTorso) / 2.0);
    final double diffAspect = (a.bodyAspectRatio - b.bodyAspectRatio).abs() /
        math.max(0.1, (a.bodyAspectRatio + b.bodyAspectRatio) / 2.0);

    final double totalDiff = (diffShoulderTorso * 0.3) +
        (diffArmTorso * 0.25) +
        (diffAspect * 0.25) +
        (diffForeArmUpper * 0.1) +
        (diffHeadTorso * 0.1);

    final int similarity = math.max(0, math.min(100, ((1.0 - math.min(1.0, totalDiff)) * 100).round()));
    final bool isSamePerson = similarity >= 68;

    return (similarity: similarity, isSamePerson: isSamePerson);
  }

  /// 4. Check vị trí xà đơn trước khi bắt đầu (Check xà trước)
  static ({bool isInPosition, double barY, int confidence, String details}) checkPullupPosition(Pose pose) {
    final human = validateHumanPose(pose);
    if (!human.isHuman) {
      return (isInPosition: false, barY: 0.0, confidence: (human.confidence * 0.5).round(), details: '🚫 ${human.reason}');
    }

    final landmarks = pose.landmarks;
    final nose = landmarks[PoseLandmarkType.nose];
    final leftShoulder = landmarks[PoseLandmarkType.leftShoulder];
    final rightShoulder = landmarks[PoseLandmarkType.rightShoulder];
    final leftWrist = landmarks[PoseLandmarkType.leftWrist];
    final rightWrist = landmarks[PoseLandmarkType.rightWrist];
    final leftHip = landmarks[PoseLandmarkType.leftHip];
    final rightHip = landmarks[PoseLandmarkType.rightHip];

    if (leftShoulder == null || rightShoulder == null) {
      return (isInPosition: false, barY: 0.0, confidence: 0, details: 'Đứng lùi lại để camera thấy toàn thân');
    }

    final double shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2.0;
    double wristMidY = shoulderMidY - 30.0;
    if (leftWrist != null && rightWrist != null && leftWrist.likelihood > 0.3 && rightWrist.likelihood > 0.3) {
      wristMidY = (leftWrist.y + rightWrist.y) / 2.0;
    } else if (leftWrist != null && leftWrist.likelihood > 0.3) {
      wristMidY = leftWrist.y;
    } else if (rightWrist != null && rightWrist.likelihood > 0.3) {
      wristMidY = rightWrist.y;
    }

    // 1. Tay bám xà: Cổ tay giơ cao hơn đầu & cao hơn vai
    final bool wristsAboveHead = nose != null ? (wristMidY < nose.y) : (wristMidY < shoulderMidY - 20.0);
    final bool wristsAboveShoulder = wristMidY < shoulderMidY - 15.0;
    final bool isHandsOnBar = wristsAboveHead && wristsAboveShoulder;

    // 2. Thân người treo thẳng
    final double hipMidY = (leftHip != null && rightHip != null)
        ? (leftHip.y + rightHip.y) / 2.0
        : shoulderMidY + 40.0;
    final bool isHanging = shoulderMidY < hipMidY;

    final int confidence = (isHandsOnBar ? 50 : 20) + (isHanging ? 30 : 0) + (human.confidence >= 60 ? 20 : 10);
    final bool isInPosition = isHandsOnBar && isHanging && confidence >= 60;

    String details = '🔍 Đang quét vị trí xà...';
    if (isInPosition) {
      details = '✅ Đã nhận diện vị trí xà! (Giữ yên để bắt đầu)';
    } else if (!isHandsOnBar) {
      details = '⬆️ Giơ 2 tay lên bám vào thanh xà trên cao';
    } else if (!isHanging) {
      details = '↕️ Treo người thẳng trên xà';
    }

    return (isInPosition: isInPosition, barY: wristMidY, confidence: confidence, details: details);
  }

  /// 5. Check tư thế hít đất trước khi bắt đầu
  static ({bool isInPosition, int confidence, String details}) checkPushupPosition(Pose pose) {
    final human = validateHumanPose(pose);
    if (!human.isHuman) {
      return (isInPosition: false, confidence: (human.confidence * 0.5).round(), details: '🚫 ${human.reason}');
    }

    final landmarks = pose.landmarks;
    final leftShoulder = landmarks[PoseLandmarkType.leftShoulder];
    final rightShoulder = landmarks[PoseLandmarkType.rightShoulder];
    final leftHip = landmarks[PoseLandmarkType.leftHip];
    final rightHip = landmarks[PoseLandmarkType.rightHip];
    final leftWrist = landmarks[PoseLandmarkType.leftWrist];
    final rightWrist = landmarks[PoseLandmarkType.rightWrist];

    if (leftShoulder == null && rightShoulder == null) {
      return (isInPosition: false, confidence: 0, details: 'Đứng/nằm vào khung hình camera');
    }

    final double sY = (leftShoulder?.y ?? rightShoulder!.y);
    final double hY = (leftHip?.y ?? rightHip?.y ?? sY);
    final double wY = (leftWrist?.y ?? rightWrist?.y ?? sY + 20.0);

    // Thân người nằm ngang (vai và hông độ cao gần nhau)
    final bool isHorizontal = (sY - hY).abs() < 50.0;
    // Tay đặt dưới sàn
    final bool isArmReady = wY >= sY - 15.0;

    final int confidence = (isHorizontal ? 40 : 15) + (isArmReady ? 40 : 15) + 20;
    final bool isInPosition = isHorizontal && isArmReady && confidence >= 60;

    String details = '🔍 Đang quét tư thế hít đất...';
    if (isInPosition) {
      details = '✅ Sẵn sàng! Giữ thẳng người';
    } else if (!isHorizontal) {
      details = '↔️ Nằm thẳng người theo chiều ngang sàn';
    } else if (!isArmReady) {
      details = '🖐 Đặt hai tay chống xuống sàn';
    }

    return (isInPosition: isInPosition, confidence: confidence, details: details);
  }
}

/// Kết quả xác thực con người thật
class HumanValidationResult {
  final bool isHuman;
  final int confidence;
  final String reason;

  const HumanValidationResult({
    required this.isHuman,
    required this.confidence,
    required this.reason,
  });
}

/// Chữ ký sinh trắc học nhân trắc (Biometric Signature)
class BiometricSignature {
  final double shoulderWidth;
  final double torsoHeight;
  final double shoulderToTorso;
  final double armToTorso;
  final double foreArmToUpperArm;
  final double headToTorso;
  final double bodyAspectRatio;

  const BiometricSignature({
    required this.shoulderWidth,
    required this.torsoHeight,
    required this.shoulderToTorso,
    required this.armToTorso,
    required this.foreArmToUpperArm,
    required this.headToTorso,
    required this.bodyAspectRatio,
  });
}
