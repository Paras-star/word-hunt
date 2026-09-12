import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getCategory } from '@/data/categories';
import { makeRewardId, rollReward } from '@/lib/rewards';
import {
  loadActiveReward,
  loadCoins,
  loadCollection,
  loadCompletedLevels,
  loadCompletedPuzzleIds,
  saveActiveReward,
  saveCoins,
  saveCollection,
  saveCompletedLevels,
  saveCompletedPuzzleIds,
} from '@/lib/storage';
import type {
  CollectionMap,
  Puzzle,
  RewardRecord,
  RewardStatus,
  RoundSummary,
} from '@/types';

export const START_COINS = 300;
export const COINS_PER_LEVEL = 50;

interface PlayerContextValue {
  ready: boolean;
  coins: number;
  completedLevels: string[];
  collection: CollectionMap;
  activeReward: RewardRecord | null;

  addCoins: (amount: number) => Promise<void>;
  spendCoins: (amount: number) => Promise<boolean>;

  /**
   * Idempotent: completing the same puzzle instance more than once (double tap,
   * remount, duplicated callback) returns the already-created reward instead of
   * generating a new one. Awards level coins + unlock exactly once.
   */
  completePuzzle: (puzzle: Puzzle, summary: RoundSummary) => Promise<RewardRecord | null>;
  updateRewardStatus: (status: RewardStatus) => Promise<void>;
  /** Idempotently applies the reward to the collection and marks it CLAIMED. */
  claimReward: () => Promise<RewardRecord | null>;
  /** Clears the finished reward after the player leaves the results/reward flow. */
  finalizeReward: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [coins, setCoins] = useState(START_COINS);
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  const [collection, setCollection] = useState<CollectionMap>({});
  const [activeReward, setActiveReward] = useState<RewardRecord | null>(null);

  // Guards against overlapping async reward mutations within a session.
  const rewardLock = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [c, levels, coll, reward] = await Promise.all([
        loadCoins(),
        loadCompletedLevels(),
        loadCollection(),
        loadActiveReward(),
      ]);
      if (!mounted) return;
      setCoins(c);
      setCompletedLevels(levels);
      setCollection(coll);
      setActiveReward(reward);
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const addCoins = useCallback(async (amount: number) => {
    setCoins((prev) => {
      const next = prev + amount;
      void saveCoins(next);
      return next;
    });
  }, []);

  const spendCoins = useCallback(async (amount: number) => {
    let ok = false;
    setCoins((prev) => {
      if (prev >= amount) {
        ok = true;
        const next = prev - amount;
        void saveCoins(next);
        return next;
      }
      return prev;
    });
    return ok;
  }, []);

  const completePuzzle = useCallback(
    async (puzzle: Puzzle, summary: RoundSummary): Promise<RewardRecord | null> => {
      if (rewardLock.current) return activeReward;
      rewardLock.current = true;
      try {
        const completedIds = await loadCompletedPuzzleIds();
        const existing = await loadActiveReward();

        // Resume an in-flight reward for the same puzzle instance.
        if (existing && existing.puzzleId === puzzle.puzzleId && existing.status !== 'CLAIMED') {
          setActiveReward(existing);
          return existing;
        }
        // This exact puzzle instance was already fully processed.
        if (completedIds.includes(puzzle.puzzleId)) {
          return null;
        }
        // A leftover, already-claimed reward from a previous round — finalize it.
        if (existing && existing.status === 'CLAIMED') {
          await saveActiveReward(null);
        }
        // A different, still-in-flight reward exists — resume that one first.
        if (existing && existing.status !== 'CLAIMED' && existing.puzzleId !== puzzle.puzzleId) {
          setActiveReward(existing);
          return existing;
        }

        // Commit the reward (rarity + dumpling) BEFORE any unboxing animation.
        const { rarity, dumpling } = rollReward();
        const existingEntry = collection[dumpling.id];
        const reward: RewardRecord = {
          rewardId: makeRewardId(),
          puzzleId: puzzle.puzzleId,
          categoryId: puzzle.categoryId,
          mode: puzzle.mode,
          dumplingId: dumpling.id,
          rarity,
          status: 'PENDING',
          isNewDiscovery: !existingEntry,
          collectionApplied: false,
          quantityAfter: (existingEntry?.count ?? 0) + 1,
          createdAt: Date.now(),
          summary,
        };
        await saveActiveReward(reward);
        setActiveReward(reward);

        // Award level coins + unlock exactly once, atomically with creation.
        setCoins((prev) => {
          const next = prev + summary.coinsEarned;
          void saveCoins(next);
          return next;
        });
        const category = getCategory(puzzle.categoryId);
        if (category) {
          setCompletedLevels((prev) => {
            if (prev.includes(category.id)) return prev;
            const next = [...prev, category.id];
            void saveCompletedLevels(next);
            return next;
          });
        }
        return reward;
      } finally {
        rewardLock.current = false;
      }
    },
    [activeReward, collection],
  );

  const updateRewardStatus = useCallback(async (status: RewardStatus) => {
    setActiveReward((prev) => {
      if (!prev) return prev;
      const next = { ...prev, status };
      void saveActiveReward(next);
      return next;
    });
  }, []);

  const claimReward = useCallback(async (): Promise<RewardRecord | null> => {
    const reward = await loadActiveReward();
    if (!reward) return null;

    let updated = reward;
    // Apply to collection exactly once.
    if (!reward.collectionApplied) {
      setCollection((prev) => {
        const existing = prev[reward.dumplingId];
        const next: CollectionMap = {
          ...prev,
          [reward.dumplingId]: {
            dumplingId: reward.dumplingId,
            count: (existing?.count ?? 0) + 1,
            firstUnlockedAt: existing?.firstUnlockedAt ?? Date.now(),
          },
        };
        void saveCollection(next);
        return next;
      });
    }
    updated = { ...reward, collectionApplied: true, status: 'CLAIMED' };
    await saveActiveReward(updated);
    setActiveReward(updated);

    const completedIds = await loadCompletedPuzzleIds();
    if (!completedIds.includes(reward.puzzleId)) {
      await saveCompletedPuzzleIds([...completedIds, reward.puzzleId]);
    }
    return updated;
  }, []);

  const finalizeReward = useCallback(async () => {
    await saveActiveReward(null);
    setActiveReward(null);
  }, []);

  const value = useMemo<PlayerContextValue>(
    () => ({
      ready,
      coins,
      completedLevels,
      collection,
      activeReward,
      addCoins,
      spendCoins,
      completePuzzle,
      updateRewardStatus,
      claimReward,
      finalizeReward,
    }),
    [
      ready,
      coins,
      completedLevels,
      collection,
      activeReward,
      addCoins,
      spendCoins,
      completePuzzle,
      updateRewardStatus,
      claimReward,
      finalizeReward,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider');
  return ctx;
}
