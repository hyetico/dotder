export const iconSize = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 18,
  xl: 28,
} as const;

export const iconStroke = 2;

export type IconSize = keyof typeof iconSize;
