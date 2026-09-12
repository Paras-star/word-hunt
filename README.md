# Word Hunt

A minimal, stable **React Native + Expo (SDK 57)** foundation for the Word Hunt
mobile game. **Android-first**, TypeScript, and [Expo Router](https://docs.expo.dev/router/introduction/).

> This repository is the clean environment foundation only. The game itself
> (categories, puzzles, scoring, dumplings, etc.) is implemented in a later phase.

## Requirements

- Node.js 20 LTS or newer (validated on Node 22 LTS)
- npm (this project uses **npm** exclusively — do not use Yarn/pnpm/Bun)

## Getting started

```bash
npm ci          # install exact, reproducible dependencies from package-lock.json
npm run start   # start the Expo dev server (press a=Android, w=web)
npm run android # run on Android (primary target)
npm run web     # run in the browser
```

## Quality checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npx expo-doctor     # validate Expo project config
```

## Structure

```text
word-hunt/
├── app/            # Expo Router routes
│   ├── _layout.tsx # root Stack layout
│   └── index.tsx   # home screen
├── assets/         # app icons / images
├── components/     # (added during implementation)
├── constants/      # (added during implementation)
├── data/           # (added during implementation)
├── hooks/          # (added during implementation)
├── lib/            # (added during implementation)
├── types/          # (added during implementation)
├── utils/          # (added during implementation)
├── app.json
├── babel.config.js
├── metro.config.js
├── tsconfig.json
├── package.json
└── package-lock.json
```

The `components/`, `constants/`, `data/`, `hooks/`, `lib/`, `types/`, and
`utils/` directories are intentionally empty (kept via `.gitkeep`) and will be
populated when the game is implemented.
