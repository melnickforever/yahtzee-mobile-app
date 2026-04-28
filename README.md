# Yahtzee

A free and open-source Yahtzee scorecard and dice roller for Android. No ads, no tracking, no internet permission required.

Available in Ukrainian and English.

---

## Features

- **Interactive dice game** — 5 SVG dice, tap to keep, up to 3 rolls per turn
- **Full scorecard** — 13 categories with auto-calculated subtotals, upper bonus, and Yahtzee bonus
- **Save / Load** — export and import game state as a JSON file via the system share sheet
- **Auto-save** — game state persists across app restarts (24-hour sliding expiry)
- **Bilingual** — Ukrainian (`uk`, default) and English (`en`), switchable at any time
- **Offline** — works entirely on-device; no network access needed

---

## Screenshots

<!-- Add screenshots to fastlane/metadata/android/en-US/images/phoneScreenshots/ -->

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 54 + React Native 0.81 |
| Language | TypeScript (strict) |
| Persistence | `@react-native-async-storage/async-storage` |
| File I/O | `expo-file-system` + `expo-sharing` + `expo-document-picker` |
| SVG | `react-native-svg` |
| Animations | `react-native` `Animated` API |

---

## Building from source

### Prerequisites

- Node.js 20+
- [Expo CLI](https://docs.expo.dev/more/expo-cli/): `npm install -g expo-cli`

### Development (Expo Go)

```bash
npm install
npx expo start --clear
# Scan the QR code with the Expo Go app on your device
```

### Run on Android emulator

```bash
npm run android
```

### Type-check

```bash
# Note: use this form — npx tsc is broken due to a symlink issue in this project
node node_modules/typescript/bin/tsc --noEmit
```

### Build a local APK (EAS)

```bash
npm install -g eas-cli
eas build --platform android --profile preview --local
```

### Build without EAS (native Gradle — for F-Droid)

F-Droid builds must not rely on Expo's hosted EAS service. Use `expo prebuild` to generate the native Android project, then build with Gradle directly:

```bash
npm install
npx expo prebuild --platform android --clean
cd android
./gradlew assembleRelease
# Output APK: android/app/build/outputs/apk/release/app-release.apk
```

For a reproducible release build, pin the `EXPO_SDK_VERSION` and `NODE_VERSION` environment variables and ensure the generated `android/` directory matches what is checked into the repo (if committed).

---

## F-Droid metadata

Store listing text lives in `fastlane/metadata/android/`. The structure follows the [fastlane supply](https://docs.fastlane.tools/actions/supply/) convention that F-Droid recognises:

```
fastlane/metadata/android/
├── en-US/
│   ├── title.txt
│   ├── short_description.txt
│   ├── full_description.txt
│   └── images/
│       └── phoneScreenshots/
└── uk/
    ├── title.txt
    ├── short_description.txt
    └── full_description.txt
```

**Anti-features:** none — this app contains no ads, no tracking SDKs, no proprietary network services, and requires no special permissions beyond storage access for file import/export.

---

## Project structure

```
App.tsx               # Root: owns all state, AsyncStorage hydration, ScrollView
index.ts              # Expo entry point
src/
  i18n.ts             # All UI strings (uk / en)
  types.ts            # Shared TypeScript types
  scoring.ts          # Pure score calculation helpers
  storage.ts          # AsyncStorage wrapper (24 h expiry)
  fileIO.ts           # JSON save / open (expo-sharing + expo-document-picker)
  components/
    DiceLogo.tsx      # Animated dice logo, tap to enter game
    DiceGame.tsx      # Full dice game: roll, keep, new turn, exit
    ScoreTable.tsx    # Score grid, totals, clear, save/open buttons
    ScoreCell.tsx     # Free-numeric input or fixed-value modal picker
    YahtzeeBonusCell.tsx
    RulesReference.tsx
    PlayerNameSection.tsx
    LanguageSwitcher.tsx
```

---

## Privacy

- No internet permission declared in `AndroidManifest.xml`
- No analytics, crash reporting, or telemetry of any kind
- All data stays on-device (AsyncStorage) or in files the user explicitly exports

---

## License

[GPL](LICENSE)
