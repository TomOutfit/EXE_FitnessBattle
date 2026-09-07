import 'dart:async';
import 'dart:math' as math;
import 'dart:ui';
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
}
