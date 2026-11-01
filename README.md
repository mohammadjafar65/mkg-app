# Mansuri Khidmat Group - Mobile Application (React Native)

A production-ready mobile application for Android and iOS built with React Native and TypeScript, providing a polished, native app experience for the Mansuri Khidmat Group platform (`https://mkg.wecreatedesign.co/login/`).

---

## 📱 Features

- **Native App-Like Experience**
  - Custom branded animated splash screen on app launch.
  - Smooth loading bar overlay and initial launch screen.
  - Native gesture support and disabled browser-like artifacts (long-press menus, selection callouts, visible scrollbars).
  - Safe-area inset handling across modern Android devices and iPhones with notches / Dynamic Island.
  - Android hardware back button integration (WebView history back navigation with double-tap to exit).
  - Pull-to-refresh functionality.
  - Responsive keyboard management (`adjustResize`) for smooth login form interactions.

- **Intelligent Navigation & Deep Linking**
  - Internal navigation kept smoothly within WebView.
  - External links (e.g. WhatsApp, phone dialer `tel:`, email `mailto:`, external domains) automatically opened via the device's native handlers.
  - Android Intent filters configured for universal linking (`https://mkg.wecreatedesign.co`).

- **Robust Session & Cookie Persistence**
  - Shared cookies and third-party cookies enabled for persistent login sessions.
  - Automatic session expiration detection and handling.
  - Device-level cookie flushing.

- **Offline & Error Resilience**
  - Real-time network reachability detection via `@react-native-community/netinfo`.
  - Dedicated native error screens for:
    - No internet connection
    - Website loading failure
    - Server unavailable (5xx)
    - Unexpected errors
  - Retry mechanism with automatic reconnection detection.
  - Floating offline banner when connection drops during an active session.

---

## 🏗️ Architecture & Project Structure

```
MansuriKhidmatGroup/
├── App.tsx                        # App entry point wrapped in SafeAreaProvider
├── index.js                       # React Native app registration
├── app.json                       # App identity & metadata
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── SplashScreen.tsx       # Branded animated splash screen
│   │   ├── LoadingOverlay.tsx     # Animated progress bar overlay
│   │   ├── InitialLoadingScreen.tsx # First-time loading screen
│   │   ├── ErrorScreen.tsx        # Native error screens with retry button
│   │   ├── OfflineBanner.tsx      # Animated offline status banner
│   │   └── index.ts
│   ├── screens/                   # Screen controllers
│   │   ├── HomeScreen.tsx         # Main WebView screen & state orchestration
│   │   └── index.ts
│   ├── hooks/                     # Custom React hooks
│   │   ├── useWebView.ts          # Navigation, progress & error handling logic
│   │   ├── useNetworkStatus.ts    # NetInfo connectivity listener
│   │   ├── useBackHandler.ts      # Android back button interceptor
│   │   └── index.ts
│   ├── services/                  # Platform services
│   │   ├── cookieManager.ts       # Cookie & session persistence
│   │   └── index.ts
│   ├── utils/                     # Utility helpers
│   │   ├── url.ts                 # Domain validation, external link detection
│   │   ├── platform.ts            # Screen dimensions, notch detection
│   │   └── index.ts
│   ├── constants/                 # Theme colors, URLs, strings
│   │   └── index.ts
│   └── types/                     # TypeScript definitions
│       ├── index.ts
│       └── react-native-webview.d.ts # TypeScript definitions for WebView
├── android/                       # Native Android project
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml    # Permissions, deep links, orientation
│   │   ├── res/values/styles.xml  # Splash theme, status bar colors
│   │   ├── res/values/strings.xml # App display name
│   │   ├── res/values/colors.xml  # Brand color definitions
│   │   ├── res/drawable/splash_background.xml # Native layer drawable
│   │   └── res/xml/network_security_config.xml # Domain security config
└── ios/                           # Native iOS project
    ├── Podfile
    └── MansuriKhidmatGroup/
        ├── Info.plist             # iOS permissions, display name, status bar
        └── LaunchScreen.storyboard# Native launch screen
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 22.11.0
- **npm** or **yarn**
- **Android Studio**: Android SDK (Platform 34/35), Android SDK Build-Tools, Android Emulator or physical device with USB debugging.
- **Xcode** (macOS only, for iOS): iOS 17/18 SDK, CocoaPods.

### Installation

1. Navigate to the project directory:
   ```bash
   cd "MansuriKhidmatGroup"
   ```

2. Install dependencies (already pre-installed):
   ```bash
   npm install
   ```

3. (iOS only) Install CocoaPods:
   ```bash
   cd ios && pod install && cd ..
   ```

4. Verify TypeScript compilation:
   ```bash
   npm run typecheck
   ```

---

## 🏃 Running Locally

### Start Metro Bundler
```bash
npm start
```

### Run on Android
Ensure an Android emulator is running or a physical device is connected via USB:
```bash
npm run android
```

### Run on iOS (macOS only)
```bash
npm run ios
```

---

## 📦 Generating Android Release (APK & AAB)

### 1. Generate a Release Keystore
If you don't already have a production keystore:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore android/app/release.keystore -alias mkg-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure Gradle Properties
Add the following lines to `android/gradle.properties` (or your user-level `~/.gradle/gradle.properties`):
```properties
MKG_UPLOAD_STORE_FILE=release.keystore
MKG_UPLOAD_KEY_ALIAS=mkg-key-alias
MKG_UPLOAD_STORE_PASSWORD=your_keystore_password
MKG_UPLOAD_KEY_PASSWORD=your_key_password
```

### 3. Update `android/app/build.gradle` Signing Config
In `android/app/build.gradle`, update the `release` signing config:
```groovy
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        if (project.hasProperty('MKG_UPLOAD_STORE_FILE')) {
            storeFile file(MKG_UPLOAD_STORE_FILE)
            storePassword MKG_UPLOAD_STORE_PASSWORD
            keyAlias MKG_UPLOAD_KEY_ALIAS
            keyPassword MKG_UPLOAD_KEY_PASSWORD
        }
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro"
    }
}
```

### 4. Build Production APK
To generate a standalone `.apk` for direct distribution or testing:
```bash
npm run build:android
```
The generated APK will be at:
`android/app/build/outputs/apk/release/app-release.apk`

### 5. Build Production AAB (Google Play Store)
To generate an `.aab` (Android App Bundle) for upload to the Google Play Console:
```bash
npm run bundle:android
```
The generated AAB will be at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 🍎 Building & Submitting for iOS (App Store)

1. **Set Up Apple Developer Account**:
   - Register an App ID with bundle identifier `com.mansurikhidmatgroup` in Apple Developer Portal.
   - Create Provisioning Profiles (App Store Distribution).

2. **Open the Project in Xcode**:
   ```bash
   open ios/MansuriKhidmatGroup.xcworkspace
   ```

3. **Configure Signing**:
   - Select the `MansuriKhidmatGroup` project in Xcode navigator.
   - Under `Signing & Capabilities`, select your Apple Team.
   - Ensure `Automatically manage signing` is enabled or specify your provisioning profile.

4. **Verify App Icons**:
   - Add app icon assets to `ios/MansuriKhidmatGroup/Images.xcassets/AppIcon.appiconset`.

5. **Archive the Build**:
   - In Xcode, select `Any iOS Device (arm64)` as build destination.
   - Go to `Product` > `Archive`.
   - Once archive is created, click `Distribute App` in the Organizer window.
   - Select `App Store Connect` > `Upload` to send the build to TestFlight & App Store Review.

---

## 🔒 Security & Privacy

- **Transport Security**: Strict HTTPS configured in `network_security_config.xml` (Android) and `Info.plist` (iOS) prohibiting arbitrary cleartext loads.
- **Permissions**: Minimized manifest permissions with clear descriptions in iOS `Info.plist`.
- **Session Privacy**: Login credentials and cookies are isolated to the app sandbox and cannot be accessed by external mobile browsers.
