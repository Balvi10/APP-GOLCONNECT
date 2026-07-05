/**
 * Tipografía GolConnect.
 * Display/Headlines = Oswald · Body/Labels = Inter.
 * Los nombres de familia coinciden con los que carga useFonts en App.js.
 */
export const fonts = {
  oswald: 'Oswald_600SemiBold',
  oswaldMedium: 'Oswald_500Medium',
  oswaldBold: 'Oswald_700Bold',
  inter: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interBold: 'Inter_700Bold',
};

/**
 * Escala tipográfica portada desde el fontSize del Tailwind original.
 * Cada token devuelve props listas para <Text style={...}>.
 */
export const type = {
  displayLg: { fontFamily: fonts.oswaldBold, fontSize: 56, lineHeight: 60, letterSpacing: -1 },
  headlineLg: { fontFamily: fonts.oswald, fontSize: 40, lineHeight: 46 },
  headlineLgMobile: { fontFamily: fonts.oswald, fontSize: 32, lineHeight: 40 },
  headlineMd: { fontFamily: fonts.oswaldMedium, fontSize: 24, lineHeight: 32 },
  bodyLg: { fontFamily: fonts.inter, fontSize: 18, lineHeight: 28 },
  bodyMd: { fontFamily: fonts.inter, fontSize: 16, lineHeight: 24 },
  labelBold: { fontFamily: fonts.interBold, fontSize: 14, lineHeight: 20, letterSpacing: 0.7 },
  labelSm: { fontFamily: fonts.interMedium, fontSize: 12, lineHeight: 16 },
};

export default type;
