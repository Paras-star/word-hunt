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
  | 'collection'
  | 'sparkle';

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
  sparkle: require('../assets/sounds/sparkle.wav'),
};

const MUSIC_SOURCE = require('../assets/sounds/music_ambient.wav');

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
    const result = player.play() as unknown as Promise<void> | void;
    if (result && typeof (result as Promise<void>).catch === 'function') {
      (result as Promise<void>).catch(() => {});
    }
  } catch {
    // Best-effort: ignore audio failures entirely.
  }
}

// ---- Soothing ambient background music ----

let musicPlayer: AudioPlayer | null = null;
let musicEnabled = true;

export function setMusicEnabled(value: boolean) {
  musicEnabled = value;
  if (!value) stopMusic();
}

/** Starts the looping ambient pad at a low, relaxing volume. Idempotent. */
export function startMusic(): void {
  if (!musicEnabled) return;
  ensureInit();
  try {
    if (!musicPlayer) {
      musicPlayer = createAudioPlayer(MUSIC_SOURCE);
      musicPlayer.loop = true;
      musicPlayer.volume = 0.35;
    }
    const result = musicPlayer.play() as unknown as Promise<void> | void;
    if (result && typeof (result as Promise<void>).catch === 'function') {
      (result as Promise<void>).catch(() => {});
    }
  } catch {
    // Best-effort.
  }
}

/** Pauses the ambient music (kept for quick resume). */
export function stopMusic(): void {
  try {
    musicPlayer?.pause();
  } catch {
    // ignore
  }
}

/** Frees all cached players. */
export function releaseSounds(): void {
  try {
    musicPlayer?.remove();
  } catch {
    // ignore
  }
  musicPlayer = null;
  (Object.keys(players) as SoundName[]).forEach((name) => {
    try {
      players[name]?.remove();
    } catch {
      // ignore
    }
    delete players[name];
  });
}
