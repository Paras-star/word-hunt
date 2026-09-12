import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

// Central sound manager. All calls are best-effort and never throw / block the
// UI: if an asset fails to load or audio is unavailable (e.g. web autoplay
// restrictions), playback is silently skipped.

export type SoundName =
  | 'tap'
  | 'correct'
  | 'wrong'
  | 'level_complete'
  | 'tick'
  | 'swoosh'
  | 'bonus'
  | 'game_over'
  | 'steamer'
  | 'peel'
  | 'lid'
  | 'steam'
  | 'suspense'
  | 'reveal'
  | 'rarity'
  | 'new_discovery'
  | 'duplicate'
  | 'collection';

const SOURCES: Record<SoundName, number> = {
  tap: require('../assets/sounds/tap.wav'),
  correct: require('../assets/sounds/correct.wav'),
  wrong: require('../assets/sounds/wrong.wav'),
  level_complete: require('../assets/sounds/level_complete.wav'),
  tick: require('../assets/sounds/tick.wav'),
  swoosh: require('../assets/sounds/swoosh.wav'),
  bonus: require('../assets/sounds/bonus.wav'),
  game_over: require('../assets/sounds/game_over.wav'),
  steamer: require('../assets/sounds/steamer.wav'),
  peel: require('../assets/sounds/peel.wav'),
  lid: require('../assets/sounds/lid.wav'),
  steam: require('../assets/sounds/steam.wav'),
  suspense: require('../assets/sounds/suspense.wav'),
  reveal: require('../assets/sounds/reveal.wav'),
  rarity: require('../assets/sounds/rarity.wav'),
  new_discovery: require('../assets/sounds/new_discovery.wav'),
  duplicate: require('../assets/sounds/duplicate.wav'),
  collection: require('../assets/sounds/collection.wav'),
};

const players: Partial<Record<SoundName, AudioPlayer>> = {};
let enabled = true;
let initialized = false;

function ensureInit() {
  if (initialized) return;
  initialized = true;
  try {
    void setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
  } catch {
    // ignore
  }
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function playSound(name: SoundName): void {
  if (!enabled) return;
  ensureInit();
  try {
    let player = players[name];
    if (!player) {
      player = createAudioPlayer(SOURCES[name]);
      players[name] = player;
    }
    player.seekTo(0);
    player.play();
  } catch {
    // Best-effort: ignore audio failures entirely.
  }
}

/** Frees all cached players. */
export function releaseSounds(): void {
  (Object.keys(players) as SoundName[]).forEach((name) => {
    try {
      players[name]?.remove();
    } catch {
      // ignore
    }
    delete players[name];
  });
}
