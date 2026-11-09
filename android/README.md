<!-- coderabbit-ai-generated:v1 -->

# Sonora for Android

This Android app packages the Sonora interface in a WebView. Its UI and artwork are bundled in the APK; the demo audio, video and fonts need an internet connection. Favorites are stored on the device.

## Build a debug APK

Install JDK 17 and Android SDK Platform 35, then from this directory run:

```sh
./gradlew assembleDebug
```

The installable debug APK is written to `app/build/outputs/apk/debug/app-debug.apk`. A debug build uses the local Android debug signing key; it is not a Play Store release. Android 7.0 (API 24) or newer and a current Android System WebView are required.
