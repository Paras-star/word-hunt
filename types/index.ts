// Shared domain types for Word Hunt: Mystery Dumplings.

export type GameMode = 'classic' | 'time';

export interface Category {
  id: string;
  name: string;
  emoji: string;
  words: string[];
}

// ---- Puzzle ----

export type Direction = {
  dr: -1 | 0 | 1;
  dc: -1 | 0 | 1;
};

export interface PlacedWord {
  word: string;
  cells: GridPosition[];
}

export interface GridPosition {
  row: number;
  col: number;
}

export interface Puzzle {
  /** Unique per play instance — used as the idempotency key for rewards. */
  puzzleId: string;
  categoryId: string;
  mode: GameMode;
  size: number;
  grid: string[][];
  words: string[];
  placements: PlacedWord[];
}

// ---- Dumplings / rarity ----

export type Rarity =
  | 'COMMON'
  | 'RARE'
  | 'EPIC'
  | 'LEGENDARY'
  | 'RAINBOW'
  | 'GOLDEN'
  | 'SECRET';

export type DumplingExpression =
  | 'happy'
  | 'sleepy'
  | 'surprised'
  | 'wink'
  | 'love'
  | 'cool'
  | 'shy';

export interface Dumpling {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  /** Primary body color used by the vector-style renderer. */
  color: string;
  /** Accent color (cheeks / belly / decoration). */
  accent: string;
  expression: DumplingExpression;
  collectionOrder: number;
}

// ---- Collection / persistence ----

export interface CollectionEntry {
  dumplingId: string;
  count: number;
  firstUnlockedAt: number;
}

export type CollectionMap = Record<string, CollectionEntry>;

export interface PlayerData {
  coins: number;
  completedLevels: string[];
  collection: CollectionMap;
}

// ---- Reward transaction ----

export type RewardStatus = 'PENDING' | 'UNBOXING' | 'REVEALED' | 'CLAIMED';

export interface RoundSummary {
  score: number;
  coinsEarned: number;
  timeTakenSec: number;
  bonusWords: number;
  puzzleWordsFound: number;
}

export interface RewardRecord {
  rewardId: string;
  puzzleId: string;
  categoryId: string;
  mode: GameMode;
  dumplingId: string;
  rarity: Rarity;
  status: RewardStatus;
  /** Committed at creation time, before the unboxing animation begins. */
  isNewDiscovery: boolean;
  /** Guards the collection mutation so a reward can only ever apply once. */
  collectionApplied: boolean;
  /** Quantity of this dumpling owned after this reward is applied. */
  quantityAfter: number;
  createdAt: number;
  summary: RoundSummary;
}

// ---- Unboxing state machine ----

export type UnboxingState =
  | 'IDLE'
  | 'STEAMER_PRESENT'
  | 'PEELING_WRAPPER'
  | 'LID_READY'
  | 'OPENING_LID'
  | 'STEAM_REVEAL'
  | 'SILHOUETTE_REVEAL'
  | 'FINAL_REVEAL'
  | 'RARITY_REVEAL'
  | 'CHARACTER_ANIMATION'
  | 'COLLECTION_UPDATE'
  | 'COMPLETE';
