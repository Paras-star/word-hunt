// Small color helpers for building layered shading from a single base color.

function clamp(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parse(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')}`;
}

/** Lightens a hex color toward white by `amount` (0..1). */
export function lighten(hex: string, amount: number): string {
  const [r, g, b] = parse(hex);
  return toHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
}

/** Darkens a hex color toward black by `amount` (0..1). */
export function darken(hex: string, amount: number): string {
  const [r, g, b] = parse(hex);
  return toHex(r * (1 - amount), g * (1 - amount), b * (1 - amount));
}

/** rgba() string from a hex + alpha. */
export function alpha(hex: string, a: number): string {
  const [r, g, b] = parse(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
