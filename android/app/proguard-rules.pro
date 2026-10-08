# R8 / ProGuard Optimization and Obfuscation Rules for Fitness Battle Android App

# 1. R8 Optimization Pass settings
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose

# 2. Preserve Line Numbers & Attributes for Crashlytics & Stack Traces
-keepattributes SourceFile,LineNumberTable,*Annotation*,Signature,EnclosingMethod,InnerClasses

# 3. Flutter Framework & Core Plugins Obfuscation Exceptions
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# 4. Native Methods & JNI Bridges (Camera, Pedometer, Sensors)
-keepclasseswithmembernames class * {
    native <methods>;
}

# 5. Google ML Kit Pose Detection & Camera Vision
-keep class com.google.mlkit.** { *; }
-keep class com.google.android.gms.** { *; }
-keep class androidx.camera.** { *; }

# 6. Firebase Services & Cloud Firestore Data Models
-keep class com.google.firebase.** { *; }
-keep class androidx.** { *; }
-keep class androidx.concurrent.futures.** { *; }
-dontwarn androidx.concurrent.futures.**
-dontwarn androidx.camera.**
-dontwarn org.jspecify.**
-dontwarn com.google.firebase.**
-dontwarn com.google.android.play.core.**
-dontwarn io.flutter.embedding.engine.deferredcomponents.**

# 7. Gson / Jackson JSON Deserialization Models
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# 8. Enum Classes Preservation
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
