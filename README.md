# Word Hunt: Mystery Dumplings

A mobile **word-search puzzle game** built with React Native + Expo. Solve
puzzles to earn a **Mystery Dumpling** reward, then unbox and collect original
dumpling characters across seven rarity tiers. Fully playable **offline**.

- **Package ID:** `com.paras.wordhunt` · **Version:** 2.0
- **Primary target:** Android (iOS + web also supported)

## Core loop

```
HOME → CATEGORY → MODE → SOLVE PUZZLE → UNBOX DUMPLING → DISCOVER → COLLECT → PLAY AGAIN
```

The word-search puzzle is the primary game; the dumpling unboxing is the reward
layer and the collection is long-term progression.

## Features

- 15 categories, 8×8 / 10×10 / 12×12 grids, words placed in all 8 directions.
- Drag-to-select word finding (react-native-gesture-handler).
- Classic (count-up) and Time (2:00 countdown, time bonus) modes.
- Bonus words (600+ common word dictionary), scoring, 3 hints/puzzle (+ optional
  rewarded-ad hints), coins, and level-unlock progression.
- A 12-state Mystery Dumpling unboxing sequence with an idempotent, crash-safe
  reward transaction and app-restart recovery.
- 40 original dumplings across COMMON → SECRET rarities with a persistent
  collection screen.
- AdMob banner / interstitial (frequency-capped) / rewarded ads — never shown
  during the reward sequence. Ads degrade gracefully offline / on web.
- Sound effects via `expo-audio`; persistence via AsyncStorage.

## Tech stack

Expo SDK 57 · React Native 0.86 · React 19 · TypeScript · Expo Router ·
react-native-gesture-handler · expo-audio · react-native-google-mobile-ads ·
@react-native-async-storage/async-storage.

## Getting started

```bash
npm ci
npm run start      # a = Android, w = web
npm run android
```

## Checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npx expo-doctor
```

## Project structure

```
app/          Expo Router screens (home, category, mode, game, unboxing, results, collection)
components/    Reusable UI + original Dumpling renderer + banner slot
constants/     Theme, highlight colors, rarity config, AdMob config
data/          Categories, dumplings, bonus-word dictionary
hooks/         PlayerProvider (coins, levels, collection, reward transaction)
lib/           Puzzle generation, word-search, storage, rewards, ads, sound
assets/        Icons + generated sound effects
backend/       Minimal NestJS health-check service (GET /health)
```

## Backend

The game is fully offline. A minimal NestJS service (`backend/`) exposes only
`GET /health → { "status": "ok" }`. The app never depends on it. See
`backend/README.md`.

## AdMob

Real AdMob IDs are configured in `constants/ads.ts` and wired via the
`react-native-google-mobile-ads` config plugin in `app.json` (which injects the
`APPLICATION_ID` meta-data into `AndroidManifest.xml` at prebuild).
