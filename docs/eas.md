# EAS Build Guide

EAS (Expo Application Services) builds your app in the cloud — no local Android SDK or Xcode required.

## Prerequisites

```bash
npm install -g eas-cli
eas login
```

## Build Profiles

Defined in `eas.json`. Three standard profiles:

| Profile | Output | Use case |
|---|---|---|
| `development` | Debug APK/IPA with dev client | Local dev with custom native code |
| `preview` | Release APK / ad-hoc IPA | Testing on real devices |
| `production` | AAB (Android) / IPA (iOS) | Store submission |

## Android Builds

```bash
# Installable APK for testing on a real device
eas build --platform android --profile preview

# Store-ready AAB for Google Play
eas build --platform android --profile production

# Debug build
eas build --platform android --profile development
```

After the build finishes (~10-15 min), download the APK from the link in the terminal or from expo.dev, then:

```bash
# Install via ADB
adb install path/to/app.apk

# Or email the APK to yourself and tap it on the phone
```

## iOS Builds

> Requires an Apple Developer account ($99/year).

```bash
# Ad-hoc IPA for testing on registered devices
eas build --platform ios --profile preview

# App Store IPA
eas build --platform ios --profile production

# Debug build
eas build --platform ios --profile development
```

EAS will prompt you to log in to your Apple account on first run and handle provisioning profiles automatically.

## Both Platforms at Once

```bash
eas build --platform all --profile preview
```

## Submit to Stores

```bash
# Submit latest Android build to Google Play
eas submit --platform android

# Submit latest iOS build to App Store
eas submit --platform ios
```

## Useful Commands

```bash
# List all past builds
eas build:list

# Check build status
eas build:view

# Configure / regenerate eas.json
eas build:configure

# Run build locally (requires local SDK)
eas build --platform android --local
```

## eas.json Reference

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": { "buildType": "apk" },
      "ios": { "simulator": false, "distribution": "internal" }
    },
    "production": {
      "android": { "buildType": "app-bundle" },
      "ios": {}
    }
  }
}
```
