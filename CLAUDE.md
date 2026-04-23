# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Key rules

- **Do not commit anything.** The user commits all changes themselves.

## Commands

```bash
# Start dev server (scan QR with Expo Go)
npx expo start --clear

# Type-check (no emit)
node node_modules/typescript/bin/tsc --noEmit

# Run on Android emulator
npm run android
```

> `npx tsc` is broken due to a symlink issue — always use the `node node_modules/typescript/bin/tsc` form.

## Architecture

This is a React Native / Expo port of a Next.js Yahtzee web app (`/Users/dmytromelnyk/projects/pets/yahtzee`). Feature parity with the web version is the goal.

**Entry point:** `index.ts` → `App.tsx`

`App.tsx` owns all top-level state (`language`, `playerName`, `scores`, `yahtzeeBonus`, `gameActive`, `isLoaded`) and wires together the components. It handles AsyncStorage hydration on mount and persistence on every state change.

### `src/` layout

| File | Role |
|---|---|
| `types.ts` | Shared types: `CategoryKey`, `ScoresData`, `SavedGame`, `PersistedState`, `Language` |
| `i18n.ts` | All UI strings for `uk` (default) and `en`. Pure TS, no React. |
| `scoring.ts` | Pure functions: `upperTotal`, `lowerTotal`, `upperBonus`, `grandTotal`, `getFixedValue` |
| `storage.ts` | AsyncStorage wrapper — 24 h sliding expiry on key `yahtzee-game-state` |
| `fileIO.ts` | Save (expo-sharing) and open (expo-document-picker + expo-file-system/legacy) JSON game files. Contains `validateGameData`. |

### Components

- **`ScoreTable`** — renders both score grids, computes totals via `scoring.ts`, calls `fileIO.ts` for save/open. Each row uses `ScoreCell`; the Yahtzee bonus row uses `YahtzeeBonusCell`.
- **`ScoreCell`** — two modes: free numeric (`TextInput`) or fixed-value (`Modal` with 3 options). Determined by the `fixedValue` prop (`null` = free).
- **`YahtzeeBonusCell`** — `Modal` picker for 0–1000 in steps of 100.
- **`DiceGame`** — 5 dice via `react-native-svg`, kept/free zones, max 3 rolls per turn. Registers `BackHandler` so Android back button exits the game. Uses `setInterval` (8 × 80 ms) for roll animation.
- **`DiceLogo`** — same SVG dice with fan rotation, `Animated` bounce loop before first tap.
- **`RulesReference`** — collapsible panel; rules table wrapped in `<ScrollView horizontal>`.
- **`PlayerNameSection`** — input + save or name + edit button.
- **`LanguageSwitcher`** — two `Pressable` pills, absolutely positioned top-right (`zIndex: 10`).

### Design system

All colors, spacing, radii, and shadows are defined inline per component via `StyleSheet.create`. The canonical token values live in `mobile plan.md` (§5a). Android shadows require `elevation` — `shadow*` props alone do not render on Android.

### File IO notes

`expo-file-system` v55 split its API. Use `expo-file-system/legacy` for `readAsStringAsync`, `writeAsStringAsync`, and `cacheDirectory`. The default import is the new API and does not have these.

### Known setup quirks

- `newArchEnabled` is `false` in `app.json` — new arch crashes Expo Go; re-enable only for EAS builds.
- `babel.config.js` and `metro.config.js` are required; without them Metro fails to bundle.
- The web app source lives at `/Users/dmytromelnyk/projects/pets/yahtzee` and is the reference for game logic and JSON schema.
