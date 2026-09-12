import type { Category, GameMode, GridPosition, PlacedWord, Puzzle } from '@/types';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// All 8 directions: horizontal, vertical, both diagonals, and reverses.
const DIRECTIONS: { dr: number; dc: number }[] = [
  { dr: 0, dc: 1 }, // →
  { dr: 0, dc: -1 }, // ←
  { dr: 1, dc: 0 }, // ↓
  { dr: -1, dc: 0 }, // ↑
  { dr: 1, dc: 1 }, // ↘
  { dr: -1, dc: -1 }, // ↖
  { dr: 1, dc: -1 }, // ↙
  { dr: -1, dc: 1 }, // ↗
];

function randInt(n: number): number {
  return Math.floor(Math.random() * n);
}

function randomLetter(): string {
  return ALPHABET[randInt(26)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Chooses the grid size per the specification rules. */
export function chooseGridSize(words: string[]): number {
  const longest = words.reduce((m, w) => Math.max(m, w.length), 0);
  if (words.length >= 16 || longest >= 10) return 12;
  if (words.length >= 12 || longest >= 7) return 10;
  return 8;
}

function tryPlaceWord(
  grid: (string | null)[][],
  word: string,
  size: number,
): GridPosition[] | null {
  const dirs = shuffle(DIRECTIONS);
  for (const dir of dirs) {
    // Compute valid starting-row/col ranges for this direction.
    const rowStarts = shuffle(range(size));
    const colStarts = shuffle(range(size));
    for (const r0 of rowStarts) {
      for (const c0 of colStarts) {
        const endR = r0 + dir.dr * (word.length - 1);
        const endC = c0 + dir.dc * (word.length - 1);
        if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;
        let ok = true;
        const cells: GridPosition[] = [];
        for (let i = 0; i < word.length; i++) {
          const r = r0 + dir.dr * i;
          const c = c0 + dir.dc * i;
          const existing = grid[r][c];
          if (existing !== null && existing !== word[i]) {
            ok = false;
            break;
          }
          cells.push({ row: r, col: c });
        }
        if (ok) return cells;
      }
    }
  }
  return null;
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

function attemptGeneration(
  words: string[],
  size: number,
): { grid: string[][]; placements: PlacedWord[] } | null {
  const grid: (string | null)[][] = Array.from({ length: size }, () =>
    new Array<string | null>(size).fill(null),
  );
  const placements: PlacedWord[] = [];

  // Place longer words first — they are the hardest to fit.
  const ordered = [...words].sort((a, b) => b.length - a.length);
  for (const word of ordered) {
    const cells = tryPlaceWord(grid, word, size);
    if (!cells) return null;
    cells.forEach((cell, i) => {
      grid[cell.row][cell.col] = word[i];
    });
    placements.push({ word, cells });
  }

  // Fill remaining cells with random letters.
  const filled: string[][] = grid.map((row) =>
    row.map((cell) => cell ?? randomLetter()),
  );
  return { grid: filled, placements };
}

let puzzleCounter = 0;

/** Generates a unique, stable id for a single play instance. */
export function makePuzzleId(categoryId: string, mode: GameMode): string {
  puzzleCounter += 1;
  return `${categoryId}:${mode}:${Date.now()}:${puzzleCounter}:${randInt(1e6)}`;
}

/**
 * Generates a solvable puzzle where every target word is placed in the grid.
 * Bumps the grid size as a fallback if placement repeatedly fails so generation
 * always succeeds.
 */
export function generatePuzzle(category: Category, mode: GameMode): Puzzle {
  const words = category.words.map((w) => w.toUpperCase());
  let size = chooseGridSize(words);

  for (let sizeBump = 0; sizeBump <= 4; sizeBump++) {
    for (let attempt = 0; attempt < 80; attempt++) {
      const result = attemptGeneration(words, size);
      if (result) {
        return {
          puzzleId: makePuzzleId(category.id, mode),
          categoryId: category.id,
          mode,
          size,
          grid: result.grid,
          words,
          placements: result.placements,
        };
      }
    }
    size += 1; // give the packer more room and retry
  }

  // Extremely defensive fallback (should never be reached for spec data).
  const size2 = Math.max(size, 16);
  const result = attemptGeneration(words, size2)!;
  return {
    puzzleId: makePuzzleId(category.id, mode),
    categoryId: category.id,
    mode,
    size: size2,
    grid: result.grid,
    words,
    placements: result.placements,
  };
}
