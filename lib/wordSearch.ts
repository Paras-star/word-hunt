import type { GridPosition } from '@/types';

export function posKey(p: GridPosition): string {
  return `${p.row},${p.col}`;
}

/**
 * Given an anchor cell and the current cell, returns the straight line of cells
 * between them (inclusive) if they lie on a valid 8-direction line; otherwise
 * null. This powers straight-line drag selection.
 */
export function lineBetween(
  start: GridPosition,
  end: GridPosition,
): GridPosition[] | null {
  const dr = end.row - start.row;
  const dc = end.col - start.col;

  const isStraight =
    dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
  if (!isStraight) return null;

  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const stepR = steps === 0 ? 0 : dr / steps;
  const stepC = steps === 0 ? 0 : dc / steps;

  const cells: GridPosition[] = [];
  for (let i = 0; i <= steps; i++) {
    cells.push({ row: start.row + stepR * i, col: start.col + stepC * i });
  }
  return cells;
}

export function wordFromCells(grid: string[][], cells: GridPosition[]): string {
  return cells.map((c) => grid[c.row][c.col]).join('');
}

/** Normalizes a set of cells to a stable, order-independent signature. */
export function cellsSignature(cells: GridPosition[]): string {
  return [...cells]
    .map(posKey)
    .sort()
    .join('|');
}
