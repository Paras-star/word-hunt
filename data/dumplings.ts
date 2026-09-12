import type { Dumpling, Rarity } from '@/types';

// 40 original dumpling characters. Names, descriptions, colors and expressions
// are original creations for this project (not copied from any commercial game).
// Distribution: Common 16, Rare 10, Epic 6, Legendary 4, Rainbow 2, Golden 1, Secret 1.

export const DUMPLINGS: Dumpling[] = [
  // ---- COMMON (16) ----
  { id: 'dumpling_001', name: 'Sleepy Bao', rarity: 'COMMON', description: 'A soft steamed bun that would rather be napping in the steamer.', color: '#f4ede0', accent: '#f6b8c8', expression: 'sleepy', collectionOrder: 1 },
  { id: 'dumpling_002', name: 'Bubble Puff', rarity: 'COMMON', description: 'Light and airy, it giggles whenever the steam tickles it.', color: '#eef3f7', accent: '#a7d3f0', expression: 'happy', collectionOrder: 2 },
  { id: 'dumpling_003', name: 'Doughlin', rarity: 'COMMON', description: 'A cheerful little dough ball with a big appetite for adventure.', color: '#f0e6cf', accent: '#e7b970', expression: 'happy', collectionOrder: 3 },
  { id: 'dumpling_004', name: 'Pillow Pao', rarity: 'COMMON', description: 'So plush you could rest your head on it after a long puzzle.', color: '#f7f0f0', accent: '#d6a9c9', expression: 'sleepy', collectionOrder: 4 },
  { id: 'dumpling_005', name: 'Nibbly', rarity: 'COMMON', description: 'Tiny teeth marks decorate its edge — it nibbles on itself.', color: '#f3e8d6', accent: '#c8926a', expression: 'shy', collectionOrder: 5 },
  { id: 'dumpling_006', name: 'Wobble', rarity: 'COMMON', description: 'Never quite sits still; it jiggles with pure joy.', color: '#eae4d3', accent: '#9fce8a', expression: 'happy', collectionOrder: 6 },
  { id: 'dumpling_007', name: 'Munchy', rarity: 'COMMON', description: 'Always mid-bite, always grinning.', color: '#f1e5cc', accent: '#f0a35e', expression: 'happy', collectionOrder: 7 },
  { id: 'dumpling_008', name: 'Dimple', rarity: 'COMMON', description: 'Two perfect dimples that appear whenever you solve a word.', color: '#f6efe2', accent: '#f2a9b8', expression: 'wink', collectionOrder: 8 },
  { id: 'dumpling_009', name: 'Snugglebun', rarity: 'COMMON', description: 'The coziest of the batch; loves warm steamer hugs.', color: '#f4e9df', accent: '#e3a17a', expression: 'love', collectionOrder: 9 },
  { id: 'dumpling_010', name: 'Tumtum', rarity: 'COMMON', description: 'A round tummy that rumbles happily.', color: '#efe6d0', accent: '#d9b06a', expression: 'happy', collectionOrder: 10 },
  { id: 'dumpling_011', name: 'Pockets', rarity: 'COMMON', description: 'Full of surprises — you never know what filling is inside.', color: '#eee7d8', accent: '#8fbfe0', expression: 'surprised', collectionOrder: 11 },
  { id: 'dumpling_012', name: 'Squishy', rarity: 'COMMON', description: 'Bounces back no matter how many times life squishes it.', color: '#f5eee0', accent: '#f0aac0', expression: 'happy', collectionOrder: 12 },
  { id: 'dumpling_013', name: 'Yumling', rarity: 'COMMON', description: 'Smells faintly of home cooking and good memories.', color: '#f2e7cf', accent: '#e6a95c', expression: 'love', collectionOrder: 13 },
  { id: 'dumpling_014', name: 'Peekabun', rarity: 'COMMON', description: 'Shy at first, peeks out once it trusts you.', color: '#f6efe4', accent: '#c9a4d6', expression: 'shy', collectionOrder: 14 },
  { id: 'dumpling_015', name: 'Chuckle Char', rarity: 'COMMON', description: 'A lightly toasted bun with a permanent chuckle.', color: '#eddcc0', accent: '#c08a4e', expression: 'happy', collectionOrder: 15 },
  { id: 'dumpling_016', name: 'Drowsy Dim', rarity: 'COMMON', description: 'Half-asleep, fully adorable.', color: '#f0e9dd', accent: '#a9c6e2', expression: 'sleepy', collectionOrder: 16 },

  // ---- RARE (10) ----
  { id: 'dumpling_017', name: 'Ginger Snap', rarity: 'RARE', description: 'Spicy-sweet and full of zing; leaves a warm tingle.', color: '#f0c27b', accent: '#c9702b', expression: 'cool', collectionOrder: 17 },
  { id: 'dumpling_018', name: 'Scarlet Siu', rarity: 'RARE', description: 'Wrapped in a bold red glaze, confident and bright.', color: '#f6b1b1', accent: '#d23b48', expression: 'wink', collectionOrder: 18 },
  { id: 'dumpling_019', name: 'Minty Mochi', rarity: 'RARE', description: 'Cool to the touch with a refreshing minty aura.', color: '#bfe6cf', accent: '#37a86b', expression: 'happy', collectionOrder: 19 },
  { id: 'dumpling_020', name: 'Berry Bun', rarity: 'RARE', description: 'Bursting with berry filling and cheerful energy.', color: '#e6b8de', accent: '#a63c8f', expression: 'love', collectionOrder: 20 },
  { id: 'dumpling_021', name: 'Honey Hum', rarity: 'RARE', description: 'Golden and glossy; hums a little tune when happy.', color: '#f7dd8f', accent: '#e0a02a', expression: 'happy', collectionOrder: 21 },
  { id: 'dumpling_022', name: 'Coco Cloud', rarity: 'RARE', description: 'A cocoa-dusted puff that floats just above the plate.', color: '#d9b48f', accent: '#7a4a24', expression: 'sleepy', collectionOrder: 22 },
  { id: 'dumpling_023', name: 'Peppermint Pao', rarity: 'RARE', description: 'Striped and sprightly, it tingles with peppermint.', color: '#eef6f3', accent: '#e0424b', expression: 'cool', collectionOrder: 23 },
  { id: 'dumpling_024', name: 'Blueberry Bao', rarity: 'RARE', description: 'Deep blue and a little dreamy.', color: '#a9c2f0', accent: '#3a4fb0', expression: 'shy', collectionOrder: 24 },
  { id: 'dumpling_025', name: 'Maple Momo', rarity: 'RARE', description: 'Drizzled in maple; endlessly cozy.', color: '#e7bd86', accent: '#a5602a', expression: 'love', collectionOrder: 25 },
  { id: 'dumpling_026', name: 'Rosy Roll', rarity: 'RARE', description: 'Blushes a lovely rose whenever complimented.', color: '#f6cdd8', accent: '#d16a90', expression: 'shy', collectionOrder: 26 },

  // ---- EPIC (6) ----
  { id: 'dumpling_027', name: 'Thunder Tum', rarity: 'EPIC', description: 'Crackles with static; its filling sparks with energy.', color: '#c9b6f2', accent: '#6a34c9', expression: 'surprised', collectionOrder: 27 },
  { id: 'dumpling_028', name: 'Frost Fold', rarity: 'EPIC', description: 'Pleated with frost that never melts in the steam.', color: '#c7ecf5', accent: '#2f9fc9', expression: 'cool', collectionOrder: 28 },
  { id: 'dumpling_029', name: 'Ember Bao', rarity: 'EPIC', description: 'Glows with a gentle inner ember. Warm, never burnt.', color: '#f6b28a', accent: '#d1441f', expression: 'cool', collectionOrder: 29 },
  { id: 'dumpling_030', name: 'Aqua Aria', rarity: 'EPIC', description: 'Sings a bubbling melody from the deep steam pools.', color: '#a6e3e0', accent: '#1f8f9e', expression: 'happy', collectionOrder: 30 },
  { id: 'dumpling_031', name: 'Storm Steam', rarity: 'EPIC', description: 'A swirling grey wrapper that rumbles with distant thunder.', color: '#b9c0cc', accent: '#4a5568', expression: 'surprised', collectionOrder: 31 },
  { id: 'dumpling_032', name: 'Blossom Bloom', rarity: 'EPIC', description: 'Petals unfurl from its crown when it feels loved.', color: '#f4c1dc', accent: '#c23c86', expression: 'love', collectionOrder: 32 },

  // ---- LEGENDARY (4) ----
  { id: 'dumpling_033', name: 'Draplin the Dumpling Dragon', rarity: 'LEGENDARY', description: 'An ancient dumpling with tiny dragon wings and a proud heart.', color: '#bff2c8', accent: '#1f9e5a', expression: 'cool', collectionOrder: 33 },
  { id: 'dumpling_034', name: 'Phoenix Puff', rarity: 'LEGENDARY', description: 'Reborn fresh from every steamer, blazing with warm light.', color: '#ffcf8a', accent: '#e05a1f', expression: 'happy', collectionOrder: 34 },
  { id: 'dumpling_035', name: 'Celestial Char', rarity: 'LEGENDARY', description: 'Its wrapper holds a tiny map of the night sky.', color: '#b3b8f0', accent: '#3b3f9e', expression: 'cool', collectionOrder: 35 },
  { id: 'dumpling_036', name: 'Ancient Aroma', rarity: 'LEGENDARY', description: 'Steeped in centuries of secret family recipes.', color: '#e6d3a1', accent: '#9c7a2e', expression: 'wink', collectionOrder: 36 },

  // ---- RAINBOW (2) ----
  { id: 'dumpling_037', name: 'Prism Pao', rarity: 'RAINBOW', description: 'Refracts the steam into a shimmering spectrum of color.', color: '#f6e6ff', accent: '#8a5cf0', expression: 'surprised', collectionOrder: 37 },
  { id: 'dumpling_038', name: 'Aurora Bun', rarity: 'RAINBOW', description: 'Dances with the colors of the northern lights.', color: '#dff6f0', accent: '#3fd0b0', expression: 'love', collectionOrder: 38 },

  // ---- GOLDEN (1) ----
  { id: 'dumpling_039', name: 'Golden Guardian', rarity: 'GOLDEN', description: 'A radiant golden dumpling said to bring great fortune.', color: '#ffe7a1', accent: '#e0a80f', expression: 'cool', collectionOrder: 39 },

  // ---- SECRET (1) ----
  { id: 'dumpling_040', name: 'The Enigma', rarity: 'SECRET', description: '???  No one knows what fills it. Perhaps it is best unopened.', color: '#3b3f4a', accent: '#8a90a0', expression: 'surprised', collectionOrder: 40 },
];

export const DUMPLINGS_BY_ID: Record<string, Dumpling> = DUMPLINGS.reduce(
  (acc, d) => {
    acc[d.id] = d;
    return acc;
  },
  {} as Record<string, Dumpling>,
);

export function getDumpling(id: string): Dumpling | undefined {
  return DUMPLINGS_BY_ID[id];
}

export const DUMPLINGS_BY_RARITY: Record<Rarity, Dumpling[]> = DUMPLINGS.reduce(
  (acc, d) => {
    (acc[d.rarity] ??= []).push(d);
    return acc;
  },
  {} as Record<Rarity, Dumpling[]>,
);

export const TOTAL_DUMPLINGS = DUMPLINGS.length;
