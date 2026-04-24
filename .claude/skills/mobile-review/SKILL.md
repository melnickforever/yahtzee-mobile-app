---
name: mobile-review
description: Code-review the Yahtzee Expo / React Native mobile app. Use when the user asks to "review", "code review", "mobile review", "check my changes", audit uncommitted work, or vet a diff in this repo. Checks Expo Go / RN pitfalls, CLAUDE.md adherence, AsyncStorage persistence correctness, and feature parity with the web reference at /Users/dmytromelnyk/projects/pets/yahtzee.
version: 1.0.0
---

# Mobile code review — Yahtzee (Expo / React Native)

Review the currently changed code in this repo against the conventions in `CLAUDE.md`, common Expo / React Native pitfalls, and feature parity with the web reference app at `/Users/dmytromelnyk/projects/pets/yahtzee`.

## Scope

Default scope is the working-tree diff vs. `main`. If the user names a specific commit range, branch, or PR, use that instead. If there are no changes, say so and stop — don't invent things to review.

## Procedure

1. **Collect the diff.** Run `git status`, `git diff main...HEAD`, and `git diff` (unstaged). List the changed files. If nothing changed, stop and report that.
2. **Read `CLAUDE.md`** at the repo root so the review is grounded in this project's rules.
3. **Read every changed file in full** — not just the diff hunks. RN bugs often live in surrounding lifecycle / effect code.
4. **Type-check.** Run `node node_modules/typescript/bin/tsc --noEmit` (the `npx tsc` form is broken per `CLAUDE.md`). Surface any new errors introduced by the diff; ignore pre-existing ones.
5. **Cross-check with the web reference** at `/Users/dmytromelnyk/projects/pets/yahtzee` whenever the diff touches scoring, i18n strings, JSON schema, or persisted state — feature parity is the stated goal.
6. **Walk the checklist below.** For each issue, cite the file and line, explain briefly, and rate confidence (low / medium / high). Suppress nitpicks and pre-existing issues — only flag what the diff introduces or makes worse.
7. **Report.** Keep output brief. Group by severity. End with a one-line verdict: ship / fix-first / needs-discussion.

Do not commit. Do not run `git add`, `git commit`, or push. `CLAUDE.md` says the user commits everything themselves.

## Checklist

### Expo / React Native pitfalls
- **Android shadows.** `shadow*` props alone don't render on Android — `elevation` must also be set. Flag any new `shadowColor` / `shadowOpacity` etc. without a sibling `elevation`.
- **`BackHandler` leaks.** Any `BackHandler.addEventListener` must return its subscription's `.remove()` from the `useEffect` cleanup. Missing cleanup = double-registration across remounts.
- **`setInterval` / `setTimeout` leaks.** Must be cleared in the effect cleanup or on early returns. `DiceGame` already does this for its 8×80 ms roll animation — copy that pattern.
- **`Animated` loops.** `Animated.loop(...).start()` needs a matching `.stop()` in cleanup, otherwise it keeps animating after unmount and can hold refs.
- **`expo-file-system` v55 split.** Legacy APIs (`readAsStringAsync`, `writeAsStringAsync`, `cacheDirectory`) must be imported from `expo-file-system/legacy`. The default import does NOT have these — flag any use of them from the default import.
- **`newArchEnabled`.** Must stay `false` in `app.json` for Expo Go. Flag any change to `true` unless the diff explicitly targets an EAS build.
- **`babel.config.js` / `metro.config.js`.** These are load-bearing — don't delete them, and don't add plugins that break Metro bundling without verifying.
- **Modal / Pressable on Android.** `Modal` needs `transparent` and usually `animationType`. `Pressable` with absolute positioning needs `zIndex` to be tappable on iOS — `LanguageSwitcher` is the reference pattern (`zIndex: 10`).
- **`TextInput` numeric input.** Use `keyboardType="numeric"` and sanitize — RN does not enforce numeric on Android even with that prop.

### State & persistence (AsyncStorage)
- `App.tsx` owns all top-level state and persists on every change. New top-level state must be added to `PersistedState` in `types.ts`, serialized in `storage.ts`, AND hydrated on mount — all three or the feature silently resets between launches.
- AsyncStorage is async — never read it synchronously in render. `isLoaded` gates the first render; new async reads need the same guard.
- The storage key is `yahtzee-game-state` with 24 h sliding expiry. Don't change the key without a migration.
- JSON file IO (`fileIO.ts`) has `validateGameData` — any new persisted field needs matching validation or a bad file will crash the app.

### Scoring & game logic
- `src/scoring.ts` is pure. Keep it pure — no React, no AsyncStorage, no I/O. Flag any new side effects.
- Upper / lower totals, upper bonus, Yahtzee bonus, and grand total must match the web app. If the diff changes any of these, diff-check against `/Users/dmytromelnyk/projects/pets/yahtzee`.
- `getFixedValue` returns a fixed-score category value — the three-option modal in `ScoreCell` must stay in sync with it.
- Max 3 rolls per turn in `DiceGame`. Kept / free dice zones are the canonical model — don't invent a third zone.

### i18n
- `src/i18n.ts` defines strings for `uk` (default) and `en`. New user-visible strings must exist in BOTH languages. Flag any string literal in JSX that isn't routed through `i18n`.
- `Language` type changes ripple — check `types.ts`, `LanguageSwitcher`, and every `t(...)` call site.

### Design system
- Colors, spacing, radii, shadows are inline via `StyleSheet.create` per component. Canonical token values live in `mobile plan.md` §5a. Flag any new ad-hoc color not drawn from those tokens.
- Do NOT introduce a shared theme file / context unless the user asks for it — the project has deliberately stayed inline.

### Code style (per `CLAUDE.md`)
- No emojis unless the user asked for them.
- Minimal comments. Only comment non-obvious *why*, never *what*.
- No speculative error handling, feature flags, or backwards-compat shims.
- No new files when editing an existing one suffices.
- No `README`s or docs files unless requested.

## Output format

```
# Code review — <branch or range>

Files changed: N

## High-confidence issues
- [file.tsx:line] <one-line issue>. <why it matters>.

## Medium-confidence / possible issues
- [file.tsx:line] <issue>. <uncertainty>.

## Nits (optional, omit if empty)
- [file.tsx:line] <nit>.

## Type-check
<pass / N new errors — list them>

## Parity with web app
<checked: yes/no — note any drift>

**Verdict:** ship / fix-first / needs-discussion
```

Keep the whole report tight. If there's nothing to flag, say so in one line and stop.
