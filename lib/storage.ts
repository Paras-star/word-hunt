import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CollectionMap, RewardRecord } from '@/types';

export const StorageKeys = {
  coins: 'wh:coins',
  completedLevels: 'wh:completedLevels',
  collection: 'wh:collection',
  activeReward: 'wh:activeReward',
  completedPuzzleIds: 'wh:completedPuzzleIds',
} as const;

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function setJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is best-effort; never crash gameplay on a storage error.
  }
}

// ---- Player data ----

export const loadCoins = () => getJSON<number>(StorageKeys.coins, 300);
export const saveCoins = (coins: number) => setJSON(StorageKeys.coins, coins);

export const loadCompletedLevels = () =>
  getJSON<string[]>(StorageKeys.completedLevels, []);
export const saveCompletedLevels = (levels: string[]) =>
  setJSON(StorageKeys.completedLevels, levels);

export const loadCollection = () =>
  getJSON<CollectionMap>(StorageKeys.collection, {});
export const saveCollection = (collection: CollectionMap) =>
  setJSON(StorageKeys.collection, collection);

// ---- Reward transaction state ----

export const loadActiveReward = () =>
  getJSON<RewardRecord | null>(StorageKeys.activeReward, null);
export const saveActiveReward = (reward: RewardRecord | null) =>
  setJSON(StorageKeys.activeReward, reward);

export const loadCompletedPuzzleIds = () =>
  getJSON<string[]>(StorageKeys.completedPuzzleIds, []);
export const saveCompletedPuzzleIds = (ids: string[]) =>
  setJSON(StorageKeys.completedPuzzleIds, ids);

/** Test / debug helper — wipes all persisted state. */
export async function clearAllStorage(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(StorageKeys));
}
