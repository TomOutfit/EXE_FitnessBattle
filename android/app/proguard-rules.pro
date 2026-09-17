# Flutter
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Google ML Kit & Play Services
-keep class com.google.mlkit.** { *; }
-keep class com.google.android.gms.** { *; }

# JNI & Camera Native Methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Firebase & Plugins
-keep class com.google.firebase.** { *; }
-keep class androidx.** { *; }
