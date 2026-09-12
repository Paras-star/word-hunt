// 18 distinct highlight colors cycled through as words are found.
// Each is applied at ~35% opacity for cell backgrounds (see toCellBg).

export const HIGHLIGHT_COLORS: string[] = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#eab308', // Yellow
  '#ec4899', // Pink
  '#f97316', // Orange
  '#a855f7', // Purple
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#d946ef', // Fuchsia
  '#0ea5e9', // Sky
  '#4ade80', // Light-Green
  '#fdba74', // Light-Orange
];

export function highlightColorAt(index: number): string {
  return HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length];
}

/** Returns an rgba() string for the given hex at 35% opacity (cell background). */
export function toCellBg(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.35)`;
}
