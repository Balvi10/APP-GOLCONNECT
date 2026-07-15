
export const colors = {
  // Superficies
  background: '#121414',
  surface: '#121414',
  surfaceDim: '#121414',
  surfaceContainerLowest: '#0c0f0f',
  surfaceContainerLow: '#1a1c1c',
  surfaceContainer: '#1e2020',
  surfaceContainerHigh: '#282a2b',
  surfaceContainerHighest: '#333535',
  surfaceVariant: '#333535',
  surfaceBright: '#38393a',

  // Acento (lima)
  primaryContainer: '#c3f400',
  primaryFixed: '#c3f400',
  primaryFixedDim: '#abd600',
  surfaceTint: '#abd600',
  onPrimaryContainer: '#556d00',
  onPrimaryFixed: '#161e00',
  onPrimary: '#283500',

  // Texto
  primary: '#ffffff',
  onBackground: '#e2e2e2',
  onSurface: '#e2e2e2',
  onSurfaceVariant: '#c4c9ac',
  secondary: '#c8c6c5',

  // Bordes
  outline: '#8e9379',
  outlineVariant: '#444933',

  // Estados
  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',

  // Utilidades
  white: '#ffffff',
  black: '#000000',
} as const;

export type ColorToken = keyof typeof colors;

export default colors;
