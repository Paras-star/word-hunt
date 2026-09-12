import { DUMPLINGS_BY_RARITY } from '@/data/dumplings';
import { RARITY, RARITY_ORDER } from '@/constants/rarity';
import type { Dumpling, Rarity } from '@/types';

/** Rolls a rarity tier using the central probability configuration. */
export function rollRarity(rng: () => number = Math.random): Rarity {
  const r = rng();
  let cumulative = 0;
  for (const rarity of RARITY_ORDER) {
    cumulative += RARITY[rarity].probability;
    if (r < cumulative) return rarity;
  }
  return 'COMMON';
}

/** Picks a random dumpling of the given rarity (falls back to COMMON). */
export function pickDumpling(rarity: Rarity, rng: () => number = Math.random): Dumpling {
  const pool = DUMPLINGS_BY_RARITY[rarity] ?? [];
  if (pool.length === 0) {
    const commons = DUMPLINGS_BY_RARITY.COMMON;
    return commons[Math.floor(rng() * commons.length)];
  }
  return pool[Math.floor(rng() * pool.length)];
}

/** Rolls the complete reward (rarity + dumpling), committed before unboxing. */
export function rollReward(rng: () => number = Math.random): {
  rarity: Rarity;
  dumpling: Dumpling;
} {
  const rarity = rollRarity(rng);
  const dumpling = pickDumpling(rarity, rng);
  return { rarity, dumpling };
}

export function makeRewardId(): string {
  return `reward_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
}
