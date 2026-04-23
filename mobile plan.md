# Yahtzee Mobile App — Migration Plan (Next.js → Expo / Android)

This plan describes how to rewrite the existing Next.js Yahtzee web app
(`/Users/dmytromelnyk/projects/pets/yahtzee`) as a native Android mobile app
using the **Expo** framework (React Native). The web app will remain untouched;
the mobile app will live in a new repository.

The goal: 1:1 functional parity with the web version — same game rules, same
scoring logic, same bilingual UX, same save/load/auto-save behavior, same dice
game flow — adapted to mobile UI idioms and persistence APIs.

---

## 1. Source-of-truth feature inventory (what must be ported)

From the current web app, the following features exist and must all ship in v1
of the mobile app:

### 1.1 Score table
- 13 categories split into two sections:
  - **Upper** (6): Ones, Twos, Threes, Fours, Fives, Sixes
  - **Lower** (7): 3 of a Kind, 4 of a Kind, Full House, Small Straight, Large Straight, Yahtzee, Chance
- Editable cells per category (`ScoreCell`):
  - Upper + 3oaK + 4oaK + Chance: numeric input (free number)
  - Full House / Small Straight / Large Straight / Yahtzee: fixed-value picker
    (0 or the fixed points — 25 / 30 / 40 / 50)
- Auto-calculated subtotals: upper total, lower total
- **Upper bonus**: +35 if upper total ≥ 63
- **Yahtzee bonus**: selectable multiple of 100 (0 – 1000); locked to 0 when Yahtzee cell = 0
- **Grand total** = upperTotal + upperBonus + lowerTotal + yahtzeeBonus
- Clear-scores action with inline Yes/No confirmation
- Save game → JSON file (filename `yahtzee-YYYY-MM-DD_HH-MM-SS.json`)
- Open game → import JSON file with validation (5 s error banner on invalid)

### 1.2 Dice game mode
- 5 dice, rendered as SVG with pips
- Up to **3 rolls per turn**; counter shows `Roll X of 3`
- Tap a die to toggle "keep"; kept dice are not re-rolled
- Two zones on screen: **free dice** (top) and **kept dice** (bottom)
- Rolling animation: 8 frames × 80 ms = ~640 ms of randomization before settling
- "New Turn" resets keeps + roll counter and re-rolls all 5
- "Exit" returns to score table and smooth-scrolls to top
- Initial roll animation plays automatically on entering game

### 1.3 Dice logo / entry
- 5 tilted dice shown above title
- Bounces until first tap; tapping rolls animation then enters game mode

### 1.4 Rules reference
- Collapsible panel ("Show" / "Hide")
- Rules summary (objective, gameplay, Yahtzee bonus, Joker rule, Zero rule, key point, end of game)
- Table of 13 categories + both bonus rows, with combination / description / points

### 1.5 Player name
- Input → Save button
- When saved: display name + pencil ✎ edit button to re-open input
- Persisted with auto-save; included in exported JSON

### 1.6 Bilingual support
- Languages: Ukrainian (`uk`, default) and English (`en`)
- Switcher in top-right corner (select dropdown)
- All UI strings sourced from `translations` object in `app/i18n.ts`

### 1.7 Auto-save (persistence)
- LocalStorage key `yahtzee-game-state`
- 24 h sliding expiry (`expiresAt = Date.now() + 86_400_000` on every write)
- On app start: if stored state exists and not expired → restore `scores`,
  `yahtzeeBonus`, `playerName`, `language`
- Written on every change of any of those 4 fields

### 1.8 JSON save/load file schema
```json
{
  "version": 1,
  "name": "<player name>",
  "language": "uk" | "en",
  "scores": { "ones": number|null, ..., "chance": number|null },
  "yahtzeeBonus": number (0..1000, multiple of 100),
  "savedAt": "<ISO timestamp>"
}
```
Validation rules (keep identical to `validateGameData` in `ScoreTable.tsx`):
- `scores` present with all 13 keys; each value `null` or `number`
- `yahtzeeBonus` integer in `[0, 1000]`, multiple of 100
- `language`, if present, must be `uk` or `en`
- `name`, if present, must be string

---

## 2. Target stack (mobile)

| Concern                  | Choice                                                           |
| ------------------------ | ---------------------------------------------------------------- |
| Framework                | **Expo SDK (latest stable)** + React Native                      |
| Language                 | TypeScript (strict)                                              |
| Navigation               | Not required for v1 — single screen + modal-style game view. Use `expo-router` only if future screens are planned; otherwise one `App.tsx` with conditional rendering (matches current web structure) |
| Styling                  | `StyleSheet` from `react-native` (no CSS framework, mirrors web's inline/global CSS approach) |
| State                    | React hooks (`useState`, `useCallback`, `useEffect`) — same as web |
| Persistence              | `@react-native-async-storage/async-storage` (replaces `localStorage`) |
| File save (export)       | `expo-file-system` + `expo-sharing` (writes JSON to cache dir, opens share sheet) |
| File open (import)       | `expo-document-picker` (`type: 'application/json'`) + `expo-file-system` `readAsStringAsync` |
| SVG (dice rendering)     | `react-native-svg` (supports `<Svg>`, `<Rect>`, `<Circle>`, `<G>`) |
| Animations (dice roll)   | Same `setInterval` approach as web (simplest, matches existing code). Optional upgrade: `react-native-reanimated` for smoother rolling |
| Fonts                    | Load Georgia-equivalent serif via `expo-font` (e.g. `PT Serif` from Google Fonts) to preserve visual identity |
| Build                    | **EAS Build** for Android APK / AAB                              |
| Testing on device        | Expo Go during dev; development build for native modules if needed |

**Why Expo**: managed workflow eliminates native Android tooling setup;
`@react-native-async-storage/async-storage`, `react-native-svg`,
`expo-document-picker`, `expo-file-system`, `expo-sharing` are all first-class
and cover every web API the current app uses.

---

## 3. Project structure (new repo)

```
yahtzee-mobile/
├── app.json                       # Expo config (name, slug, android package, icon, splash)
├── eas.json                       # EAS Build profiles (development / preview / production)
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js                # if customization needed
├── App.tsx                        # Root component (replaces app/page.tsx + layout.tsx)
├── assets/
│   ├── icon.png                   # 1024x1024 app icon
│   ├── adaptive-icon.png          # Android adaptive icon foreground
│   ├── splash.png                 # Splash screen
│   └── fonts/                     # PT Serif or chosen serif fallback
├── src/
│   ├── i18n.ts                    # Copied ~1:1 from app/i18n.ts (plain TS, no React)
│   ├── storage.ts                 # AsyncStorage wrapper (load/save game state)
│   ├── fileIO.ts                  # Save/open JSON file (expo-file-system + picker)
│   ├── scoring.ts                 # Pure calculation helpers (upperTotal, grandTotal, etc.)
│   ├── types.ts                   # CategoryKey, ScoresData, SavedGame, Language
│   └── components/
│       ├── LanguageSwitcher.tsx
│       ├── DiceLogo.tsx
│       ├── DiceGame.tsx
│       ├── RulesReference.tsx
│       ├── ScoreTable.tsx
│       ├── ScoreCell.tsx
│       └── PlayerNameSection.tsx  # Extracted from page.tsx for clarity
└── __tests__/
    ├── scoring.test.ts
    └── fileIO.test.ts
```

---

## 4. Component-by-component migration map

The web codebase has 6 components plus `page.tsx` and `i18n.ts`. Each has a
direct mobile counterpart. The table below lists every web element that needs a
React Native replacement.

| Web element / API            | React Native replacement                                     | Notes                                                         |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| `<div>`                      | `<View>`                                                     |                                                               |
| `<span>`, `<p>`, `<h1..h3>`  | `<Text>` (all text MUST be wrapped in `<Text>`)              |                                                               |
| `<button onClick>`           | `<Pressable onPress>` (preferred) or `<TouchableOpacity>`    | Pressable gives better feedback control                       |
| `<input type="text">`        | `<TextInput>`                                                | Player name                                                   |
| `<input type="number">`      | `<TextInput keyboardType="number-pad">`                      | Score cells                                                   |
| `<select>`                   | `@react-native-picker/picker` **or** custom modal + FlatList | Recommend custom bottom-sheet picker for better mobile UX     |
| `<svg>` / `<rect>` / `<circle>` / `<g>` | `Svg`, `Rect`, `Circle`, `G` from `react-native-svg` | 1:1 JSX replacement                                           |
| `onClick`                    | `onPress`                                                    |                                                               |
| `className=`                 | `style={styles.xxx}`                                         | Convert `globals.css` to per-component `StyleSheet.create`    |
| `window.scrollY` / smooth scroll | `ScrollView` + `ref.scrollTo({ y, animated: true })`     | Use a root `<ScrollView>` in App.tsx                          |
| `localStorage`               | `AsyncStorage` (async API — use `useEffect` + `await`)       |                                                               |
| `window.showSaveFilePicker` / blob download | `FileSystem.writeAsStringAsync` + `Sharing.shareAsync` | Opens native Android share sheet |
| `<input type="file">`        | `DocumentPicker.getDocumentAsync({ type: 'application/json' })` |                                                            |
| `document.getElementById`    | `useRef` + `measure()` or `scrollTo` by tracked offset       | Avoid DOM queries entirely                                    |
| `dangerouslySetInnerHTML` (JSON-LD schema) | **Drop it.** SEO microdata has no value in a mobile app |                                                    |
| Keyboard `Enter` / `Escape`  | `onSubmitEditing` for Enter; no Escape on mobile             | Replace Escape with a visible Cancel button                   |

### 4.1 `App.tsx` (replaces `app/page.tsx` + `app/layout.tsx`)
- Owns the same state as web: `language`, `playerName`, `isPlayerNameSaved`,
  `gameActive`, `scores`, `yahtzeeBonus`, `isLoaded`
- On mount: `loadGameState()` from `storage.ts` → hydrate state → set `isLoaded`
- Effect: after `isLoaded`, persist on change of `scores`, `yahtzeeBonus`,
  `playerName`, `language` via `saveGameState()`
- Root layout: `SafeAreaView` → `ScrollView` → `LanguageSwitcher` absolute-positioned
  top-right → main content
- Keep `handleEnterGame` smooth-scroll behavior via ScrollView ref (track dice
  game `onLayout` y-position)

### 4.2 `ScoreTable.tsx`
- Replace CSS grid with nested `<View>` rows (`flexDirection: 'row'`). Two
  equal-flex columns per row (`flex: 2` for category name, `flex: 1` for score cell)
- Clear-scores: keep broom 🧹 button; show confirm row via conditional render
  (drop the CSS transition; a simple fade via `Animated.View` is optional polish)
- `Open Game` / `Save Game` → `fileIO.ts` helpers (see §4.8)
- `file-error` → inline red `<Text>` below buttons, auto-clear via the same
  5 s `setTimeout` ref pattern

### 4.3 `ScoreCell.tsx`
- Two render modes based on `fixedValue`:
  - **Fixed (Full House / Straights / Yahtzee)**: tap → open modal / bottom
    sheet with 3 options: "—", "0", fixedValue. Set value on select, close.
    On Android, `@react-native-picker/picker` also works but looks less modern
    than a bottom sheet.
  - **Free numeric (upper + 3oaK / 4oaK / Chance)**: tap → `TextInput` becomes
    visible with `keyboardType="number-pad"`; `onBlur` or `onSubmitEditing`
    parses and commits via `onChange`; empty string → `null`
- Display mode: `<Pressable><Text>{value ?? '—'}</Text></Pressable>`

### 4.4 `DiceGame.tsx`
- Port `pipPositions`, `randomFace`, `renderDie` directly — only the JSX tags
  change (`<rect>` → `<Rect>`, `<g>` → `<G>`, etc.)
- Replace `setInterval`-based roll animation as-is (works in React Native).
  Clean up with `clearInterval` in unmount effect to avoid state updates after
  exit.
- Dice press: wrap each `<G>` in `<G onPress={...}>` (react-native-svg supports
  `onPress` on `<G>`)
- Controls row: port buttons 1:1 (Roll / New Turn / Exit) using `Pressable`

### 4.5 `DiceLogo.tsx`
- Port the same SVG + randomization loop
- Replace CSS `bounce` animation with `Animated.Value` + `Animated.loop` on
  translateY, or `react-native-reanimated` for smoother animation
- `onPress` triggers roll sequence then calls `onEnterGame`

### 4.6 `RulesReference.tsx`
- Collapsible section via `useState<boolean>` — identical to web
- Replace the CSS grid with `<View>` rows. Since this is long read-only
  content, no interactivity changes needed

### 4.7 `LanguageSwitcher.tsx`
- Two-option picker: render as two small `Pressable` pills ("Укр" / "Eng")
  highlighted based on current language. Simpler and more native-feeling than
  `<select>` on mobile

### 4.8 `fileIO.ts` (new file)
```ts
// Save
async function saveGame(state: SavedGame): Promise<void> {
  const suggested = `yahtzee-${yyyymmdd}_${hhmmss}.json`;
  const uri = FileSystem.cacheDirectory + suggested;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(state, null, 2));
  await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Save Yahtzee game' });
}

// Open
async function openGame(): Promise<SavedGame | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (res.canceled) return null;
  const text = await FileSystem.readAsStringAsync(res.assets[0].uri);
  const data = JSON.parse(text);
  if (!validateGameData(data)) throw new InvalidGameFileError();
  return data;
}
```
- Port `validateGameData` exactly from `ScoreTable.tsx` (pure TS, reusable)
- Caller handles `InvalidGameFileError` → shows `t.invalidFile` banner

### 4.9 `storage.ts` (new file)
```ts
const KEY = 'yahtzee-game-state';
const EXPIRY_MS = 86_400_000;

async function loadGameState(): Promise<PersistedState | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  const data = JSON.parse(raw);
  if (data.expiresAt <= Date.now()) return null;
  return data;
}

async function saveGameState(state: PersistedState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify({
    ...state,
    expiresAt: Date.now() + EXPIRY_MS,
  }));
}
```

### 4.10 `scoring.ts` (new file)
Pure, testable functions extracted from `ScoreTable.tsx`:
- `upperTotal(scores)` → sum of upper 6
- `lowerTotal(scores)` → sum of lower 7
- `upperBonus(total)` → 35 if `total >= 63` else 0
- `grandTotal(scores, yahtzeeBonus)` → composition of above
- `getFixedValue(categoryKey)` → 25 / 30 / 40 / 50 / null

---

## 5. Styling strategy

The web app uses inline styles + `globals.css` (~900 lines). The mobile UI
must be a **pixel-accurate port** of the web design — same palette, same
spacing, same typography, same borders, same shadows, same animations. Every
value listed in §5a is taken directly from `app/globals.css` and must be
reproduced exactly.

General rules:
1. Convert each web CSS class to a `StyleSheet.create` entry **in the component
   that uses it** (avoid one global stylesheet). Style-object keys mirror CSS
   class names for traceability (`player-section` → `playerSection`, etc.).
2. Load **PT Serif** via `expo-font` (free Google font, nearest Georgia
   substitute). Register in `App.tsx` before first render. Apply as the default
   on all `<Text>` via a tiny `AppText` wrapper component — this replaces the
   global `font-family: 'Georgia', ...` rule from `html, body`.
3. Use `Platform.select` only where Android differs (shadows via `elevation`
   rather than `shadow*` props, fonts fallback chain).
4. Target **600 px max content width** via a `maxWidth: 600` style on the main
   content `View` (matches `.main-container`). Use `flex: 1` outer wrapper.

---

## 5a. Design system (exact tokens)

All values below are **required** — they define the visual identity.

### 5a.1 Color palette
| Token                    | Hex        | Used for                                           |
| ------------------------ | ---------- | -------------------------------------------------- |
| `bgPage`                 | `#f4efe6`  | App background (html/body)                         |
| `bgPanel`                | `#fdf6e3`  | Player section, rules container, game mode panel   |
| `bgPanelAlt`             | `#fffef8`  | Name display, inputs, odd table rows, game free area |
| `bgPanelAltEven`         | `#f8f1e1`  | Even table rows                                    |
| `bgPanelKept`            | `#f0e8d4`  | Kept-dice zone, hover row, exit btn hover          |
| `bgAccentLight`          | `#ede5d2`  | Score cell display default                         |
| `bgAccentLightHover`     | `#e0d5bc`  | Score cell display hover                           |
| `bgTotalCell`            | `#e8dcc6`  | Total cell, roll counter, kept-die body            |
| `bgSubtotalGreen`        | `#dce8d4`  | Subtotal rows                                      |
| `bgSubtotalGreenHover`   | `#cddfc2`  | Subtotal row hover                                 |
| `bgBonusPeach`           | `#f5e6d0`  | Bonus rows                                         |
| `bgBonusPeachHover`      | `#eddbc0`  | Bonus row hover                                    |
| `bgErrorLight`           | `#fde8e8`  | File-error banner background                       |
| **Text**                 |            |                                                    |
| `textPrimary`            | `#3b2f1e`  | Body text, category labels                         |
| `textDark`               | `#2c1810`  | H2/H3, total cells, name display                   |
| `textMedium`             | `#5c4a2e`  | Rules summary body, input label, score cell text   |
| `textMuted`              | `#a09680`  | Empty-state hint text, disabled border             |
| `textError`              | `#a02020`  | File-error text                                    |
| `textOnDark`             | `#fdf6e3`  | All light-on-dark buttons/headers                  |
| `textGreenDark`          | `#1e5430`  | Subtotal values                                    |
| **Browns (primary accent)** |         |                                                    |
| `brown`                  | `#8b4513`  | Primary brand (buttons, borders, dice border)      |
| `brownHover`             | `#a0522d`  | Brown button hover                                 |
| `brownHoverAlt`          | `#a0521a`  | Save-game button hover (subtly different)          |
| `brownDark`              | `#6b3410`  | Brown button border, kept dice border              |
| `brownPip`               | `#5a2d0c`  | Dice pip color                                     |
| **Greens (secondary accent)** |       |                                                    |
| `green`                  | `#2d6b3f`  | Save button, table header, roll button             |
| `greenHover`             | `#367a4a`  | Green button hover                                 |
| `greenDark`              | `#1e5430`  | Green button border                                |
| **Dice**                 |            |                                                    |
| `diceBodyFree`           | `#faf3e0`  | Active (free) dice body                            |
| `diceBorderFree`         | `#8b4513`  | Active dice border                                 |
| `diceBodyKept`           | `#e8dcc6`  | Kept dice body                                     |
| `diceBorderKept`         | `#6b3410`  | Kept dice border                                   |
| `dicePip`                | `#5a2d0c`  | Pips on both                                       |
| **Borders / neutrals**   |            |                                                    |
| `borderPanel`            | `#d4c5a0`  | Panel borders (rules, player section)              |
| `borderInput`            | `#c4b590`  | Inputs, game-area border, dashed free-area         |
| `borderRow`              | `#e0d5bc`  | Row separator                                      |
| `borderSubtotal`         | `#b5cfaa`  | Under-subtotal 2px border                          |
| `borderError`            | `#e0b0b0`  | File-error border                                  |
| `borderDisabled`         | `#a09680`  | Disabled button border                             |
| `bgDisabled`             | `#b5a88a`  | Disabled button background                         |
| **Hover neutral**        |            |                                                    |
| `bgHoverNeutral`         | `#f0e8d4`  | Broom/exit button hover                            |

### 5a.2 Typography
- Family: **`PT Serif`** (bundled via `expo-font`), fallback system serif
- Base size: `14px` (mobile default; was 12 px on narrow viewport — use 14 for consistency on Android)
- H1 `title`: keep component-level sizing; no explicit size in CSS → use React Native default ~24, bold weight
- H2: `fontSize: 20, fontWeight: '700', color: #2c1810`
- H3 (rules summary): `fontSize: 14, fontWeight: '700', color: #2c1810, textTransform: 'uppercase', letterSpacing: 0.42` (≈0.03em × 14)
- Rules body: `fontSize: 14, lineHeight: 24` (1.7 × 14 ≈ 23.8)
- Buttons general: `fontSize: 14–16, fontWeight: '600'`
- Roll counter: `fontSize: 16, fontWeight: '700'`
- Grand-total label: `fontSize: 20, fontWeight: '700', letterSpacing: 0.4`
- Table header cells: `fontSize: 13/14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.52 (0.04em)`
- Score cell input/display: `fontSize: 14, fontWeight: '500'`
- Game-area label ("Kept"): `fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.72 (0.06em)`
- File error: `fontSize: 14, fontWeight: '500'`, centered

### 5a.3 Spacing, radii, borders, shadows
| Concern           | Value                                                                       |
| ----------------- | --------------------------------------------------------------------------- |
| Page top padding  | 48 (mobile breakpoint; web uses 72 desktop / 48 mobile — mobile is the only target) |
| Main container    | `maxWidth: 600, paddingHorizontal: 12`                                      |
| Panel padding     | 20 (rules, player section, game mode = 16 — note game-mode uses 16)         |
| Panel border      | `2px solid #d4c5a0` (rules/player) or `2px solid #8b4513` (grids/game-mode) |
| Panel radius      | 10 (panels) / 8 (rules grid) / 12 (game mode) / 6 (small buttons/inputs)    |
| Panel shadow      | `0 2px 6px rgba(59,47,30,0.1)` → RN: `shadowColor:'#3b2f1e', shadowOffset:{0,2}, shadowOpacity:0.1, shadowRadius:6, elevation:2` |
| Grid shadow       | `0 2px 8px rgba(59,47,30,0.12)` → `shadowRadius:8, shadowOpacity:0.12, elevation:3` |
| Grand total shadow| `0 3px 10px rgba(107,52,16,0.25)` → `shadowColor:'#6b3410', shadowOffset:{0,3}, shadowOpacity:0.25, shadowRadius:10, elevation:4` |
| Game mode shadow  | `0 3px 12px rgba(59,47,30,0.15)` → `shadowRadius:12, shadowOpacity:0.15, elevation:4` |
| Button shadows    | Save: `0 2px 6px rgba(107,52,16,0.2)`; Open: `0 2px 6px rgba(30,84,48,0.2)` (green tint) |
| Row padding       | 10 vertical × 16 horizontal (score grid) / 12 × 14 (rules grid header) / 10 × 14 (rules body) |
| Cell radius       | 6 (score cells, buttons, inputs)                                            |
| Gaps              | 8 between buttons; 10 between confirm actions; 12 between game action buttons |

### 5a.4 Component-by-component style specs

Below are the exact styles each RN component must produce. Side-by-side with
the CSS classes they replace.

#### Language switcher (`.language-switcher` + `.language-select`)
- Wrapper: absolutely positioned `top: 8, right: 8, zIndex: 10` (mobile bp)
- Two pills (Укр / Eng) or single Picker:
  - Active pill: `bg #8b4513`, text `#fdf6e3`, `border: 2 solid #6b3410`, radius 6, padding `8px 16px`, `fontSize 14, fontWeight '600'`
  - Inactive pill: `bg transparent`, text `#8b4513`, `border: 2 solid #8b4513`
  - Pressed (active-like hover): `bg #a0522d`

#### Player section (`.player-section`)
- `bg #fdf6e3, border: 2 solid #d4c5a0, radius 10, padding 20, marginBottom 24, shadow panel-level`
- Input `.player-input`: `bg #fffef8, border: 2 solid #c4b590, radius 6, paddingV 10 paddingH 14, fontSize 16`. Focused state: border `#8b4513` + soft glow (`shadowColor:'#8b4513', shadowOpacity:0.15, shadowRadius:3`)
- Save button `.player-save-button`: `bg #2d6b3f, color #fdf6e3, border: 2 solid #1e5430, radius 6, padding 10/20, fontSize 16, fontWeight '600'`. Disabled: `bg #b5a88a, border #a09680, opacity 0.6`
- Name display `.player-name-display`: `bg #fffef8, border: 2 solid #c4b590, radius 6, padding 10/14, fontSize 16, fontWeight '600', color #2c1810`
- Edit ✎ button: same as brown button, `padding 10/16`

#### Rules container
- `.rules-container`: same panel style as player section (20 padding, 10 radius, 2 solid #d4c5a0)
- `.rules-button`: brown button, `padding 8/16, fontSize 13, fontWeight '600', radius 6`
- `.rules-summary` h3: uppercase, `color #2c1810, fontSize 14, fontWeight '700', letterSpacing 0.42`, margin-top 16, margin-bottom 6
- `.rules-summary` paragraphs / list: `fontSize 14, lineHeight 24, color #5c4a2e`
- `.rules-grid`: 3 columns `1fr 2fr 1fr` → RN: use `flex: 1 / 2 / 1`. Wrapper: `bg #fffef8, border: 2 solid #8b4513, radius 8, overflow: 'hidden', marginTop 16`
- Header row: `bg #2d6b3f, color #fdf6e3, padding 12/14, fontSize 13, fontWeight '600', textTransform uppercase, letterSpacing 0.52`
- Body rows: alternating `#fffef8` / `#f8f1e1`; bonus rows get no override — the `.rules-grid-bonus` class exists but only changes text slightly (keep same rendering)
- Body cell: `padding 10/14, fontSize 14, color #5c4a2e, borderBottomWidth 1, borderBottomColor #e0d5bc`

#### Score table
- Header `.score-table-header`: flex row, gap 10, align center. H2 `fontSize 20, fontWeight '700', color #2c1810`
- Broom 🧹: `fontSize 20, padding 2/6, radius 6`, no bg. On press: bg `#f0e8d4`. Web adds a `rotate(-15deg)` on hover — on mobile, use an `Animated` rotation to -15° on press, back on release (nice-to-have, skip if time-boxed)
- Clear confirm row: flex row, gap 10, marginTop 10 (visible). Label `fontSize 14, fontWeight '600', color #5c4a2e`. Yes button = `.game-btn-roll` (green). No button = `.rules-button` (brown, small) — `padding 8/16, fontSize 13`
- `.score-grid`: `bg #fffef8, border: 2 solid #8b4513, radius 10, marginTop 16, shadow 0/2/8 rgba(59,47,30,0.12)`
- Grid layout: two columns via flex. Category col `flex: 1`, score col fixed `width: 100` (mobile) or `120` (wider); use `width: 100` to match mobile breakpoint
- Header row: `bg #2d6b3f, color #fdf6e3, fontWeight '600', padding 14/16, fontSize 14, letterSpacing 0.28`. First cell left-aligned, second centered
- Body row: `padding 10/16`, alternating `#fffef8` / `#f8f1e1`, border-bottom 1 `#e0d5bc`
- `.score-grid-category`: `fontWeight '500', color #3b2f1e`
- Subtotal row `.score-grid-subtotal`: `bg #dce8d4, color #1e5430, fontWeight '700', fontSize 15, borderBottom 2 solid #b5cfaa`
- Bonus row `.score-grid-bonus`: `bg #f5e6d0, color #8b4513, fontWeight '600', borderBottom: 0`

#### Score cell
- `.score-cell-display`: `padding 8/12, bg #ede5d2, radius 6, minHeight 24, alignItems 'center', justifyContent 'center', fontWeight '500', color #5c4a2e, border: 1 solid #d4c5a0`
- Pressed state: `bg #e0d5bc`, `transform: [{ scale: 1.03 }]` (web uses `transform: scale(1.03)` on hover — on mobile, apply on press using `Pressable`'s `pressed` state)
- Locked (yahtzee-bonus-when-yahtzee=0): `opacity 0.5`, no press
- Input mode `.score-cell-input`: `width '100%', padding 8/12, border: 2 solid #8b4513, radius 6, fontSize 14, textAlign 'center', fontWeight '500', bg #fffef8`. Add a focus glow: `shadowColor '#8b4513', shadowOpacity 0.12, shadowRadius 3`

#### Grand total
- `.grand-total`: `bg #8b4513, border: 2 solid #6b3410, radius 10, padding 18, fontSize 20, fontWeight '700', color #fdf6e3, textAlign 'center', letterSpacing 0.4, marginTop 20, shadow grand-total-level`

#### Game action buttons
- `.game-actions`: flex row, gap 12, marginTop 16
- `.save-game-button` (brown): `flex 1, padding 14, radius 10, fontSize 16, fontWeight '600', bg #8b4513, color #fdf6e3, border: 2 solid #6b3410`, shadow `0 2px 6px rgba(107,52,16,0.2)`. Pressed: `bg #a0521a`
- `.open-game-button` (green): `flex 1, padding 14, radius 10, fontSize 16, fontWeight '600', bg #2d6b3f, color #fdf6e3, border: 2 solid #1e5430`, shadow `0 2px 6px rgba(30,84,48,0.2)`. Pressed: `bg #367a4a`
- `.file-error`: `marginTop 10, padding 10/14, color #a02020, bg #fde8e8, border: 1 solid #e0b0b0, radius 8, fontSize 14, fontWeight '500', textAlign 'center'`

#### Dice logo
- Wrapper: centered, `display: 'inline-block'` → RN: `alignSelf: 'center'`
- Hint text: `marginTop 4, fontSize 12, color #8b4513, opacity 0.7`, animate opacity 0.5 ↔ 1 over 2 s (use `Animated.loop`)
- Hint arrow ↑: animate translateY 0 ↔ -3 over 1 s
- Idle bounce on dice: animate translateY 0 ↔ -2 over 2.5 s before first tap (`Animated.loop`)

#### Dice game panel
- `.game-mode`: `bg #fdf6e3, border: 2 solid #8b4513, radius 12, padding 16, marginBottom 20`, shadow `0 3px 12px rgba(59,47,30,0.15)`
- `.game-controls`: on mobile, column layout with `alignItems: 'stretch', gap 8`
- `.game-roll-counter`: `fontSize 16, fontWeight '700', color #2c1810, bg #e8dcc6, padding 8/14, radius 8, border: 1 solid #d4c5a0, textAlign 'center'`
- `.game-buttons`: flex row, gap 8, `justifyContent 'center'`, each button `flex 1, padding 10/8, fontSize 13`
- Game buttons colors:
  - Roll (`.game-btn-roll`): bg `#2d6b3f`, color `#fdf6e3`, border 2 `#1e5430`. Pressed: `#367a4a`. Disabled: `bg #b5a88a, border #a09680, opacity 0.7`
  - New (`.game-btn-new`): brown — bg `#8b4513`, color `#fdf6e3`, border 2 `#6b3410`. Pressed: `#a0522d`
  - Exit (`.game-btn-exit`): outlined brown — bg `transparent`, color `#8b4513`, border 2 `#8b4513`. Pressed: bg `#f0e8d4`
  - All game buttons: `radius 8, fontWeight '600'`, `activeScale: 0.97` on press
- `.game-area`: `padding 10/6 (mobile), radius 10, minHeight 80, alignItems 'center'`
- `.game-area-free`: `bg #fffef8, border: 2 dashed #c4b590, marginBottom 12` — React Native dashed borders need `borderStyle: 'dashed'` (works on iOS; Android requires `borderWidth ≥ 2` to render — ours is fine)
- `.game-area-kept`: `bg #f0e8d4, border: 2 solid #c4b590`
- `.game-area-label` ("Kept"): `fontSize 12, fontWeight '700', color #8b4513, textTransform 'uppercase', letterSpacing 0.72, marginBottom 8`
- `.game-area-empty-text`: `fontSize 13, color #a09680, paddingVertical 12`

### 5a.5 Animations

| Animation            | Duration / Easing      | Target        | RN implementation                                              |
| -------------------- | ---------------------- | ------------- | -------------------------------------------------------------- |
| `dieShake`           | 0.1 s alternate inf    | Dice rolling  | `Animated.loop(Animated.sequence([translate 0→(1,-2), alternate]))`. Or simpler: use existing 80 ms `setInterval` face randomization — already covers perceived shake |
| `hintPulse`          | 2 s ease-in-out inf    | Hint text opacity | `Animated.loop(Animated.sequence([timing(1,1000), timing(0.5,1000)]))` |
| `hintBounce`         | 1 s ease-in-out inf    | Hint arrow ↑  | translateY 0 → -3 → 0                                          |
| `diceBounce`         | 2.5 s ease-in-out inf  | Dice logo (pre-roll) | translateY 0 → -2 → 0                                   |
| Clear-confirm reveal | 0.25 s ease, `max-height + opacity` | Clear confirm row | `Animated.timing` on opacity + layout height, or skip transition for simplicity |
| Button press scale   | instant (CSS `:active`) | Game buttons | `Pressable` + `{ pressed: { transform: [{ scale: 0.97 }] } }` |
| Score cell hover scale | 0.1 s                 | Score cell    | Same `Pressable.pressed` → `scale: 1.03`                       |
| Broom rotate         | 0.15 s to -15°         | Clear broom   | `Animated.spring` to rotation; optional polish                 |

All `hover` effects become **`pressed`** states on mobile (RN `Pressable` `style={({ pressed }) => ...}` or `hoverIn/Out` if supporting pointer devices later).

### 5a.6 Layout + responsiveness
- Target **portrait phone only** (lock in `app.json`). The web app's
  `@media (max-width: 768px)` rules are the source of truth since all phones
  fall under this breakpoint. The desktop rules (wider paddings, row paddings)
  should be **ignored**.
- Specifically use:
  - `main-container padding: 12, paddingTop: 48`
  - `language-switcher: position 'absolute', top 8, right 8`
  - `score-grid gridTemplateColumns: 1fr 100px` → score column `width: 100`
  - `.game-controls flexDirection: 'column', alignItems: 'stretch'`
  - `.game-buttons justifyContent: 'center'`, buttons `flex 1, padding 10/8, fontSize 13`
  - `.game-area padding: 10/6`
- Rules grid: on web mobile it horizontally scrolls (`min-width: 500px`).
  Same on RN: wrap `.rules-grid` in `<ScrollView horizontal>` so the 3-column
  table remains readable without line-wrapping.
- Score grid wrapper: same horizontal scroll (`overflow-x: auto`) — use
  `<ScrollView horizontal>` only if contents overflow; otherwise skip.

### 5a.7 Dice SVG geometry (already correct — keep)
From `DiceGame.tsx`:
- Dice size 52, gap 10, padding 4, corner radius 7, pip radius 52 × 0.08 = 4.16
- Pip grid `{0.25, 0.5, 0.75}` as fractions of dice size
- Free die colors: body `#faf3e0`, border `#8b4513`, pip `#5a2d0c`, stroke 1.5
- Kept die colors: body `#e8dcc6`, border `#6b3410`, pip `#5a2d0c`

From `DiceLogo.tsx`:
- Dice size 36, gap 6, padding 4, corner radius 5
- Rotation per die: `(i - 2) * 4` degrees → fan effect
- Colors: body `#faf3e0`, border `#8b4513`, pip `#5a2d0c`

Port these constants **verbatim** into the RN components.

### 5a.8 Design-parity QA checklist (add to §8)
- [ ] Screenshot compare: open web app in browser next to APK on device.
      Panels align, colors match, buttons match weight + radius.
- [ ] All text uses PT Serif (or fallback serif) — not system sans
- [ ] Green ("Save"/"Roll"/"Open") buttons: all use `#2d6b3f` with `#1e5430` border
- [ ] Brown ("Edit"/"New Turn"/"Save Game") buttons: all use `#8b4513` with `#6b3410` border
- [ ] Score rows alternate `#fffef8` / `#f8f1e1` exactly
- [ ] Subtotal rows are green-tinted (`#dce8d4`), bonus rows are peach (`#f5e6d0`)
- [ ] Grand total is a brown bar (`#8b4513`) with cream text
- [ ] Dice free zone has a dashed `#c4b590` 2px border; kept zone solid
- [ ] Clear-confirm row reveals below the title (not overlays it)
- [ ] Language switcher sits top-right, above the title
- [ ] All panel shadows visible on Android (set `elevation` — RN `shadow*`
      props alone don't render on Android)

---

## 6. Android-specific considerations

1. **Back button**: Android hardware back should:
   - If `gameActive` → exit to score table (call existing `onExit`)
   - Else → no-op (let OS background the app)
   - Implement via `BackHandler` + `useEffect` in `App.tsx`
2. **Safe area**: use `SafeAreaView` from `react-native-safe-area-context` to
   respect Android status bar and system nav
3. **Keyboard**: wrap `ScrollView` in `KeyboardAvoidingView` (behavior
   `height` on Android) so the player name / score input isn't covered
4. **File permissions**: `expo-sharing` uses the system share sheet → no runtime
   permissions needed. `expo-document-picker` also needs none on modern Android
   (uses Storage Access Framework).
5. **Adaptive icon**: provide `adaptive-icon.png` (foreground) + background
   color in `app.json`
6. **Orientation**: lock to `portrait` in `app.json` (dice table layout is
   portrait-first). Revisit later if tablet support is wanted
7. **Package name**: e.g. `com.melnickforever.yahtzee`

---

## 7. Step-by-step implementation order

Execute in this order. Each step should end with a runnable app on device/emulator.

### Step 1 — Scaffold
- `npx create-expo-app yahtzee-mobile -t` (blank TypeScript template)
- Initialize git, first commit
- Set `app.json`: name, slug, package `com.melnickforever.yahtzee`, orientation
  `portrait`, icon/splash placeholders
- Install core deps:
  ```
  npx expo install react-native-svg @react-native-async-storage/async-storage \
    expo-document-picker expo-file-system expo-sharing expo-font \
    react-native-safe-area-context
  ```
- Verify `npx expo start` launches on Expo Go / Android emulator

### Step 2 — i18n + types
- Copy `app/i18n.ts` → `src/i18n.ts` verbatim (no React dependencies — pure TS)
- Create `src/types.ts` with `Language`, `CategoryKey`, `ScoresData`, `SavedGame`

### Step 3 — Pure logic
- Create `src/scoring.ts` with the totals/bonus helpers
- Create `src/storage.ts` (AsyncStorage wrapper)
- Create `src/fileIO.ts` (save/open JSON, with `validateGameData`)
- Add `__tests__/scoring.test.ts` + `__tests__/fileIO.test.ts` using Jest
  (bundled with `jest-expo` preset)

### Step 4 — Static UI skeleton
- Build `App.tsx` with: header, title, `LanguageSwitcher` stub,
  `PlayerNameSection` stub, `RulesReference` stub, `ScoreTable` stub
- Wire language state + translations
- Confirm layout looks right in portrait on emulator

### Step 5 — Score table (the core)
- Implement `ScoreTable.tsx` full: 13 category rows, subtotals, bonuses,
  grand total, clear confirm
- Implement `ScoreCell.tsx` both modes (free numeric + fixed picker via
  modal/bottom-sheet)
- Unit-test scoring against a fixture from the web app

### Step 6 — Persistence
- Wire `storage.ts` load on mount + save on change in `App.tsx`
- Verify: fill cells → kill app → relaunch → state restored
- Verify: set system clock forward 25 h → relaunch → state cleared

### Step 7 — Save / Open JSON
- Implement Save button → `Sharing.shareAsync` flow
- Implement Open button → `DocumentPicker` → validate → load
- Test error path (malformed JSON → banner)
- Test round-trip: save from mobile, open in web (and vice-versa) — JSON
  schema must be byte-identical

### Step 8 — Rules reference
- Port full `RulesReference.tsx` with collapsible section and rules table
- Both languages render correctly

### Step 9 — Dice logo
- Port `DiceLogo.tsx` with SVG + bounce animation
- Tap triggers roll animation + `onEnterGame` callback

### Step 10 — Dice game
- Port `DiceGame.tsx`: 5 dice, kept/free zones, roll counter, 3-roll cap,
  keep toggling, New Turn, Exit
- Verify roll animation is smooth (bump to Reanimated if `setInterval`
  causes jank)

### Step 11 — Android back handler + smooth scroll
- `BackHandler` integration: in game → exit; else default
- ScrollView ref + `scrollTo` to replace `smoothScroll` on game enter/exit

### Step 12 — Polish (design parity)
- Load PT Serif font via `expo-font` (replaces Georgia)
- Verify every token in §5a matches on a real device by screenshot-comparing
  each screen to the web app side-by-side
- Adaptive icon + splash screen assets
- Status bar style (`expo-status-bar`) — light icons on the brown header, dark
  elsewhere
- Review all `Pressable` press-states for tactile feedback (scale 0.97 on game
  buttons, scale 1.03 on score cells)
- Confirm Android `elevation` values render the panel / grand-total shadows
  (pure `shadow*` props don't work on Android)

### Step 13 — QA
- Manual test plan (see §8)
- Fix any regressions
- Tag `v0.1.0`

### Step 14 — Build & ship
- Configure `eas.json` with `preview` (APK for sideload) and `production`
  (AAB for Play Store) profiles
- `eas build --platform android --profile preview` → install APK on device,
  full regression pass
- `eas build --platform android --profile production` → upload AAB to
  Play Console (internal testing track first)

---

## 8. Manual test plan (copy to QA checklist)

### Score table
- [ ] Enter values into all 6 upper categories → upper subtotal updates live
- [ ] Upper total ≥ 63 → bonus shows 35; < 63 → bonus shows 0
- [ ] Full House cell: tap → options "—", "0", "25"; select 25 → cell shows 25
- [ ] Small Straight → "—", "0", "30"
- [ ] Large Straight → "—", "0", "40"
- [ ] Yahtzee → "—", "0", "50"
- [ ] Set Yahtzee = 0 → Yahtzee bonus locks to 0 and becomes unselectable
- [ ] Set Yahtzee = 50 → Yahtzee bonus becomes selectable (0..1000 step 100)
- [ ] Grand total = upperTotal + upperBonus + lowerTotal + yahtzeeBonus
- [ ] Clear button → confirm "Yes" wipes all scores + yahtzeeBonus; "No" cancels

### Persistence
- [ ] Fill some cells → close app from recents → reopen → state intact
- [ ] Leave app 24 h → reopen → state cleared (hard to test; can mock clock)
- [ ] Change language → restart → language persisted

### Save / Open
- [ ] Save Game → share sheet → save to Files → filename matches
      `yahtzee-YYYY-MM-DD_HH-MM-SS.json`
- [ ] JSON content matches schema exactly (open in text editor)
- [ ] Open Game → pick file → scores / bonus / name / language restored
- [ ] Open malformed JSON → error banner appears, clears after 5 s
- [ ] Open JSON saved by web app → loads correctly (cross-platform schema)

### Rules
- [ ] "Show" → full rules + table visible in current language
- [ ] "Hide" → collapsed
- [ ] Switch language while expanded → content updates

### Player name
- [ ] Empty → Save disabled
- [ ] Typed + Save → displays as static name with ✎ button
- [ ] Tap ✎ → returns to input mode preserving value
- [ ] Name included in saved JSON

### Dice game
- [ ] Tap dice logo → enters game; smooth scroll into view
- [ ] Initial 5 dice render + auto roll animation
- [ ] Roll counter: starts at "1 of 3"
- [ ] Tap die → moves to Kept area; tap again → returns to Free
- [ ] Roll button: increments counter, only re-rolls Free dice
- [ ] After 3rd roll → Roll button disabled with "No rolls left"
- [ ] All 5 kept → Roll button disabled with "All dice kept"
- [ ] New Turn → resets keeps + counter, re-rolls all 5
- [ ] Exit → back to score table; Android hardware back does the same

### Language
- [ ] Switcher toggles every string across app
- [ ] Default is Ukrainian (`uk`) on fresh install

---

## 9. Follow-ups / explicit non-goals for v1

Explicit non-goals (do NOT migrate these web concerns):
- `application/ld+json` schema.org SEO microdata (`page.tsx`) — irrelevant on mobile
- Next.js routing / server components — single-screen app
- Web-only `showSaveFilePicker` fallback via `Blob` + anchor download — replaced by `Sharing.shareAsync`
- Web `Escape` keyboard dismissal — replaced by explicit close UI

Good v2 candidates (not required for parity):
- iOS build (same Expo codebase; just add `ios` target)
- Multi-player score tracking (current app is single-card)
- Cloud sync via Supabase / Firebase instead of local file
- Reanimated-powered dice physics

---

## 10. Repo setup checklist (day one of new repo)

- [ ] `git init yahtzee-mobile`
- [ ] `npx create-expo-app . -t` (blank TS)
- [ ] Copy this plan into `PLAN.md` at repo root
- [ ] Copy `app/i18n.ts` from web repo → `src/i18n.ts`
- [ ] Create `.github/workflows/ci.yml` for `npm run typecheck` + `npm test`
- [ ] Create `README.md` with dev run instructions (`npx expo start`), EAS
      build commands, and a link back to the web repo
- [ ] Configure ESLint + Prettier matching web repo style
- [ ] First commit: scaffold + plan

---

## 11. Risk register

| Risk                                                        | Mitigation                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `react-native-svg` perf during rapid dice re-render         | Profile on mid-range device; if jank, switch dice to `<Image>` per face or use Reanimated  |
| AsyncStorage write on every keystroke → contention          | Debounce saves by ~300 ms (web doesn't; mobile storage is slower)                          |
| `DocumentPicker` returns `file://` URI not readable directly on some Android versions | Always use `copyToCacheDirectory: true` + `FileSystem.readAsStringAsync`   |
| Font mismatch (Georgia unavailable on Android)              | Bundle PT Serif via `expo-font`; fall back to system serif only if load fails              |
| Bottom-sheet picker UX varies by Android version            | Use a library (`@gorhom/bottom-sheet`) if native `Modal` feels dated                       |
| Expo SDK upgrade churn                                      | Pin Expo SDK version; schedule upgrade once per quarter                                    |

---

## 12. Rough effort estimate

Assuming one developer familiar with React (the web author):

| Phase                    | Effort      |
| ------------------------ | ----------- |
| Steps 1–3 (scaffold + logic) | 0.5 day |
| Step 5 (score table)     | 1 day       |
| Step 6–7 (persistence + file IO) | 0.5 day |
| Step 8 (rules)           | 0.5 day     |
| Step 9–10 (dice logo + game) | 1 day   |
| Step 11–12 (polish)      | 0.5 day     |
| Step 13 (QA)             | 0.5 day     |
| Step 14 (EAS build + Play upload) | 0.5 day |
| **Total**                | **~5 dev days** to v0.1.0 on Play Store internal track |

---

*End of plan. Copy this file to the new `yahtzee-mobile` repo root as `PLAN.md`
before starting implementation.*
