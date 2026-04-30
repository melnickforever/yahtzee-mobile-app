# Yahtzee Mobile

A React Native / Expo scorekeeper for playing Yahtzee with real dice — built together with my sons **Pavlo** and **Mykhailo**. Many thanks, guys, for the ideas, testing, and development spirit that shaped this app!

> **Tip:** Tap the app logo to enter **mini dice game mode** and roll dice right inside the app.

---

## Screenshots

<img src="docs/yahtzee1.jpg" width="260" alt="Screenshot"> <img src="docs/Yathzee3.jpg" width="260" alt="Screenshot"> <img src="docs/Yahtzee2.jpg" width="260" alt="Screenshot">

<img src="docs/Yahtzee4.jpg" width="260" alt="Screenshot"> <img src="docs/Yathzee5.jpg" width="260" alt="Screenshot"> <img src="docs/Yahtzee6.jpg" width="260" alt="Screenshot">

---

## Features

- Score table  with automatic totals and bonuses
- Upper section bonus, Yahtzee bonus picker (0–1000 in steps of 100)
- Save / open game state as a JSON file (share or restore any session)
- 24-hour auto-save via AsyncStorage — pick up where you left off
- Built-in dice roller with roll animation and kept/free zones (up to 3 rolls per turn)
- Ukrainian and English UI (toggle in the top-right corner)
- Lexend font for improved readability

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native 0.81 + Expo SDK 54 |
| Language | TypeScript 5.9 |
| Persistence | AsyncStorage (24 h sliding expiry) |
| File I/O | expo-sharing, expo-document-picker, expo-file-system/legacy |
| Graphics | react-native-svg |
| Font | @expo-google-fonts/lexend |
| Build | EAS Build |

## Getting Started

### Prerequisites

- Node.js 18+
- [Expo Go](https://expo.dev/go) on your Android device

### Run locally

```bash
npm install
npx expo start --clear
```

Scan the QR code with Expo Go to open the app on your device.

### Run on Android emulator

```bash
npm run android
```


## Building for Production

This project uses [EAS Build](https://docs.expo.dev/build/introduction/).

```bash
npx eas build --platform android
```

## Releases

Pre-built Android APKs are available in `RELEASE/Android/` and can be sideloaded directly without the Play Store.

## Languages

The app ships with two UI languages:

| Code | Language | Notes |
|---|---|---|
| `uk` | Ukrainian | Default language |
| `en` | English | |

Switch languages using the toggle in the top-right corner of the app. All UI strings — category names, labels, buttons, and rules — are fully translated. The selected language is persisted between sessions.

## License

GPL
