import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Screen, GlowBackground } from '../components/primitives';
import Icon from '../components/Icon';
import { useNavigate } from '../navigation/useNavigate';
import { colors, fonts, type } from '../theme';

const HERO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrU_0klvSuT6DHP5wVphepe6xGXXvh8m2yqzvn1nXjJeM80BDZAj6QATqjipp19XmzrzLo9a4uCfJQs1ki3Bu5WigyI7wawUZbsWFe33e-LvcxH4r6arq-ocT2cEBMJxcQYHVaB89uz6Z_ty3k8N1Ab94MKIwnTLniNWyclJjG6bAUDWgXY6kwmD5Qq4qkdpjiuQNovK9Gdyn8cJK-pAe_hkePvIvNqJzA2oAeUMjl_B-rO5RP5YbrvPL8SWkOBnenWbtCWgNHjpA';

export default function Landing() {
  const onNavigate = useNavigate();

  return (
    <Screen contentStyle={{ flexGrow: 1 }}>
      <GlowBackground />
      <Image source={{ uri: HERO }} style={styles.hero} />

      <View style={styles.body}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>GOLCONNECT</Text>
            <Text style={styles.tagline}>ELITE PERFORMANCE SCOUTING</Text>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>
            Tu vidriera <Text style={{ color: colors.primaryFixed }}>al éxito</Text>
          </Text>
          <Text style={styles.subtitle}>
            La plataforma definitiva para deportistas de élite y cazatalentos profesionales.
            Mide, compite y escala posiciones en el radar global.
          </Text>
        </View>

        {/* Tarjeta Jugador */}
        <Pressable
          onPress={() => onNavigate('login', 'jugador')}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
          <View style={styles.cardIcon}>
            <Icon name="sports_soccer" size={32} color={colors.primaryFixed} />
          </View>
          <Text style={styles.cardTitle}>SOY JUGADOR</Text>
          <Text style={styles.cardBody}>
            Crea tu portafolio dinámico, sube tus mejores jugadas y accede a pruebas exclusivas
            con los mejores clubes del mundo.
          </Text>
          <View style={styles.cardCtaPrimary}>
            <Text style={styles.cardCtaPrimaryText}>EMPEZAR MI CARRERA</Text>
            <Icon name="trending_up" size={16} color={colors.onPrimaryFixed} />
          </View>
        </Pressable>

        {/* Tarjeta Club/Scout */}
        <Pressable
          onPress={() => onNavigate('login', 'reclutador')}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
          <View style={[styles.cardIcon, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <Icon name="query_stats" size={32} color={colors.white} />
          </View>
          <Text style={styles.cardTitle}>SOY CLUB/SCOUT</Text>
          <Text style={styles.cardBody}>
            Accede a una base de datos global filtrada por IA. Encuentra el talento que tu equipo
            necesita con precisión quirúrgica.
          </Text>
          <View style={styles.cardCtaOutline}>
            <Text style={styles.cardCtaOutlineText}>BUSCAR TALENTOS</Text>
            <Icon name="person_search" size={16} color={colors.white} />
          </View>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>+5000 profesionales ya están dentro</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { position: 'absolute', top: 0, left: 0, right: 0, height: 360, opacity: 0.5, backgroundColor: colors.surfaceContainer },
  body: { paddingHorizontal: 16, paddingTop: 24, gap: 24 },
  header: { marginBottom: 8 },
  brand: { fontFamily: fonts.oswaldBold, fontSize: 26, color: colors.primaryFixed, letterSpacing: -0.5 },
  tagline: { ...type.labelSm, color: colors.onSurfaceVariant, letterSpacing: 2, marginTop: 2, fontFamily: fonts.interBold },
  titleBlock: { gap: 12 },
  title: { fontFamily: fonts.oswaldBold, fontSize: 40, lineHeight: 44, color: colors.white, textTransform: 'uppercase' },
  subtitle: { ...type.bodyMd, color: colors.onSurfaceVariant },
  card: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    padding: 24,
    gap: 12,
  },
  cardPressed: { borderColor: colors.primaryFixed, transform: [{ scale: 0.99 }] },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(195,244,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cardTitle: { fontFamily: fonts.oswald, fontSize: 24, color: colors.white, textTransform: 'uppercase' },
  cardBody: { ...type.bodyMd, fontSize: 14, color: colors.onSurfaceVariant },
  cardCtaPrimary: {
    marginTop: 8,
    backgroundColor: colors.primaryFixed,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardCtaPrimaryText: { fontFamily: fonts.interBold, fontSize: 13, color: colors.onPrimaryFixed, letterSpacing: 0.8, textTransform: 'uppercase' },
  cardCtaOutline: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardCtaOutlineText: { fontFamily: fonts.interBold, fontSize: 13, color: colors.white, letterSpacing: 0.8, textTransform: 'uppercase' },
  footer: { borderTopWidth: 1, borderTopColor: 'rgba(68,73,51,0.3)', paddingTop: 16, alignItems: 'center' },
  footerText: { ...type.labelSm, color: colors.onSurfaceVariant, fontFamily: fonts.interBold },
});
