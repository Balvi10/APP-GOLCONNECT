
export const spacing = {
  base: 4,
  xs: 8,
  sm: 16,
  md: 24,
  gutter: 24,
  lg: 40,
  xl: 64,
  marginMobile: 16,
  marginDesktop: 48,
} as const;

export const radius = {
  sm: 4,
  default: 6,
  lg: 8,
  xl: 12,
  xxl: 16,
  full: 9999,
} as const;

export { colors } from './colors';
export type { ColorToken } from './colors';
export { fonts, type } from './typography';
