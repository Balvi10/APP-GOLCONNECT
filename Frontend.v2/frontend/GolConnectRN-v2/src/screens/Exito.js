import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen, Card, PrimaryButton, GlowBackground } from '../components/primitives';
import Icon from '../components/Icon';
import { useNavigate } from '../navigation/useNavigate';
import { useAuth } from '../context/AuthContext';
import { jugador as apiJugador } from '../api';
import { colors, fonts, type } from '../theme';

export default function Exito() {
  const onNavigate = useNavigate();
  const { user }   = useAuth();
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    apiJugador.inicio().then(setPerfil).catch(() => {});
  }, []);

  const nombre   = perfil?.nombre   ?? user?.nombre   ?? '—';
  const apellido = perfil?.apellido ?? user?.apellido ?? '';
  const posicion = user?.perfilJugador?.posicion_principal ?? '—';
  const club     = user?.perfilJugador?.club_actual ?? '';

  const metaTexto = [posicion, club].filter(Boolean).join(' · ') || 'Jugador GolConnect';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <GlowBackground />
      <Screen contentStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View style={{ alignItems: 'center' }}>
          <View style={styles.trophyRing}>
            <View style={styles.trophyInner}>
              <Icon name="trophy" size={56} color={colors.onPrimaryFixed} />
            </View>
          </View>

          <Text style={styles.kicker}>Pago confirmado</Text>
          <Text style={styles.title}>¡BIENVENIDO A LAS GRANDES LIGAS!</Text>
          <Text style={styles.subtitle}>Tu pago fue procesado con éxito. Tu perfil PRO ya está activo.</Text>

          <Card style={styles.snapshot}>
            <View style={styles.snapRow}>
              <View style={styles.snapAvatar}>
                <Icon name="person" size={32} color={colors.onSurfaceVariant} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.snapName}>{`${nombre} ${apellido}`.trim()}</Text>
                <Text style={styles.snapMeta}>{metaTexto}</Text>
              </View>
              <View style={styles.proPill}>
                <Icon name="workspace_premium" size={14} color={colors.onPrimaryFixed} />
                <Text style={styles.proPillText}>PRO</Text>
              </View>
            </View>
            <View style={styles.snapStats}>
              {[
                ['Partidos',    perfil?.temporada_partidos    ?? 0],
                ['Goles',       perfil?.temporada_goles       ?? 0],
                ['Asist.',      perfil?.temporada_asistencias ?? 0],
              ].map(([k, v]) => (
                <View key={k} style={styles.snapStat}>
                  <Text style={styles.snapStatValue}>{v}</Text>
                  <Text style={styles.snapStatLabel}>{k}</Text>
                </View>
              ))}
            </View>
          </Card>

          <PrimaryButton
            label="Ver mi perfil"
            icon="arrow_forward_ios"
            onPress={() => onNavigate('profile')}
            style={{ marginTop: 28, alignSelf: 'stretch' }}
          />
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  trophyRing:      { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(195,244,0,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  trophyInner:     { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  kicker:          { ...type.labelBold, color: colors.primaryFixed, textTransform: 'uppercase', letterSpacing: 2 },
  title:           { ...type.headlineLgMobile, color: colors.white, textTransform: 'uppercase', textAlign: 'center', marginTop: 8 },
  subtitle:        { ...type.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 12, maxWidth: 320 },
  snapshot:        { alignSelf: 'stretch', marginTop: 32 },
  snapRow:         { flexDirection: 'row', alignItems: 'center', gap: 12 },
  snapAvatar:      { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  snapName:        { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.white },
  snapMeta:        { ...type.labelSm, color: colors.onSurfaceVariant, marginTop: 2 },
  proPill:         { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryFixed, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  proPillText:     { fontFamily: fonts.interBold, fontSize: 11, color: colors.onPrimaryFixed, letterSpacing: 1 },
  snapStats:       { flexDirection: 'row', marginTop: 20, borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: 16 },
  snapStat:        { flex: 1, alignItems: 'center' },
  snapStatValue:   { fontFamily: fonts.oswaldBold, fontSize: 24, color: colors.primaryFixed },
  snapStatLabel:   { ...type.labelSm, color: colors.onSurfaceVariant, textTransform: 'uppercase', marginTop: 2 },
});
