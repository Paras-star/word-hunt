// Central theme tokens. The game uses a single cohesive light theme.

export const Colors = {
  background: '#f0f0f3',
  surface: '#ffffff',
  surfaceAlt: '#e8e8ee',
  blue: '#2f80ed',
  orange: '#ff8c1a',
  pink: '#f83f8f',
  textDark: '#1a1a1a',
  textMuted: '#6b6b76',
  foundWord: '#c0c0c8',
  danger: '#e53e3e',
  success: '#2f9e44',
  gridCell: '#ffffff',
  gridBorder: '#dcdce4',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 28,
  pill: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 24,
  xxl: 34,
  huge: 44,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#1a1a1a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  raised: {
    shadowColor: '#1a1a1a',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;
