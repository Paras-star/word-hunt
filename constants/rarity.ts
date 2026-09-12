import type { Rarity } from '@/types';

// Central rarity configuration: drop probabilities + presentation.
// Probabilities are the single source of truth (do not scatter elsewhere).

export const RARITY_ORDER: Rarity[] = [
  'COMMON',
  'RARE',
  'EPIC',
  'LEGENDARY',
  'RAINBOW',
  'GOLDEN',
  'SECRET',
];

export interface RarityConfig {
  /** Drop weight as a probability. All weights sum to 1.0. */
  probability: number;
  label: string;
  /** Primary glow / accent color for reveal presentation. */
  color: string;
  /** Secondary color, used for gradients / rainbow / particles. */
  colors: string[];
  /** Relative intensity of the reveal effect (particles, glow, duration). */
  intensity: number;
}

export const RARITY: Record<Rarity, RarityConfig> = {
  COMMON: {
    probability: 0.55,
    label: 'Common',
    color: '#9aa0aa',
    colors: ['#c4c9d2', '#9aa0aa'],
    intensity: 1,
  },
  RARE: {
    probability: 0.25,
    label: 'Rare',
    color: '#2f80ed',
    colors: ['#5fa8ff', '#2f80ed'],
    intensity: 2,
  },
  EPIC: {
    probability: 0.1,
    label: 'Epic',
    color: '#a855f7',
    colors: ['#c77dff', '#7b2ff7'],
    intensity: 3,
  },
  LEGENDARY: {
    probability: 0.05,
    label: 'Legendary',
    color: '#ff8c1a',
    colors: ['#ffd166', '#ff8c1a'],
    intensity: 4,
  },
  RAINBOW: {
    probability: 0.025,
    label: 'Rainbow',
    color: '#ff5fa2',
    colors: ['#ff5f6d', '#ffc371', '#47e5bc', '#4facfe', '#b067ff'],
    intensity: 5,
  },
  GOLDEN: {
    probability: 0.015,
    label: 'Golden',
    color: '#f5b301',
    colors: ['#fff3b0', '#f5b301'],
    intensity: 5,
  },
  SECRET: {
    probability: 0.01,
    label: 'Secret',
    color: '#111827',
    colors: ['#4b5563', '#111827'],
    intensity: 6,
  },
};

// Validate at module load in dev that probabilities sum to ~1.
const _sum = RARITY_ORDER.reduce((a, r) => a + RARITY[r].probability, 0);
if (Math.abs(_sum - 1) > 1e-9) {
  console.warn(`Rarity probabilities sum to ${_sum}, expected 1.0`);
}
