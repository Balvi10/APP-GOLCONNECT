import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen, Card, PrimaryButton, OutlineButton } from '../components/primitives';
import { BottomNav, Modal } from '../components/chrome';
import Icon from '../components/Icon';
import { useNavigate } from '../navigation/useNavigate';
import { useAuth } from '../context/AuthContext';
import { jugador as apiJugador } from '../api';
import { colors, fonts, type } from '../theme';

export default function Inicio() {
  const onNavigate    = useNavigate();
  const { user, logout } = useAuth();
  const [logoutModal, setLogoutModal] = useState(false);
  const [datos, setDatos]             = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    apiJugador.inicio()
      .then(setDatos)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const nombre = datos?.nombre || user?.nombre || 'Jugador';

  const STATS = [
    { label: 'Vistas al Perfil',    value: String(datos?.visitas_perfil     ?? 0), icon: 'visibility'    },
    { label: 'Clubes Interesados',  value: String(datos?.clubes_interesados  ?? 0), icon: 'stadium'        },
    { label: 'Scouts Activos',      value: String(datos?.scouts_activos       ?? 0), icon: 'person_search'  },
  ];

  const esPro = datos?.plan === 'pro';

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primaryFixed} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen>
        {/* Hero */}
        <View style={styles.heroOverlay}>
          <Text style={styles.hi}>Hola, {nombre}!</Text>
          <Text style={styles.hiAccent}>Tu carrera no se detiene.</Text>
          <Text style={styles.heroSub}>
            Mantené tu perfil actualizado para no perder ninguna oportunidad de ser visto por los
            mejores clubes del mundo.
          </Text>
          <PrimaryButton label="Editar Perfil" onPress={() => onNavigate('profile')} style={{ alignSelf: 'flex-start', marginTop: 16 }} />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <Card key={s.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <View style={styles.statIcon}>
                <Icon name={s.icon} size={20} color={colors.primaryFixed} />
              </View>
            </Card>
          ))}
        </View>

        {/* Suscripción */}
        {!esPro && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LLEVÁ TU CARRERA AL SIGUIENTE NIVEL</Text>
            <Text style={styles.sectionSub}>Elegí el plan que mejor se adapte a tus ambiciones.</Text>

            <Card style={{ marginTop: 24 }}>
              <Text style={styles.planName}>Plan Amateur</Text>
              <Text style={styles.planPrice}>$0<Text style={styles.planPer}>/mes</Text></Text>
              {['Perfil básico de jugador', '1 solo video de 60 segundos', 'Aparición estándar en el buscador'].map((f) => (
                <View key={f} style={styles.featRow}>
                  <Icon name="check_circle" size={20} color={colors.outline} />
                  <Text style={styles.featText}>{f}</Text>
                </View>
              ))}
              <OutlineButton label="Mantener Gratis" color={colors.primary} style={{ marginTop: 16 }} />
            </Card>

            <Card style={[styles.planPro, { marginTop: 24 }]}>
              <View style={styles.recBadge}><Text style={styles.recBadgeText}>RECOMENDADO</Text></View>
              <Text style={styles.planName}>Plan PRO</Text>
              <Text style={styles.planPrice}>$19.99<Text style={styles.planPer}>/mes</Text></Text>
              {['Videos Ilimitados', 'Radar de Ojeadores', 'Insignia Pro en Perfil', 'Métricas avanzadas de visitas'].map((f) => (
                <View key={f} style={styles.featRow}>
                  <Icon name="verified" size={20} color={colors.primaryFixed} />
                  <Text style={[styles.featText, { fontFamily: fonts.interBold }]}>{f}</Text>
                </View>
              ))}
              <PrimaryButton label="Empezar Mi Mes Pro" onPress={() => onNavigate('pro')} style={{ marginTop: 16 }} />
            </Card>
          </View>
        )}

        {esPro && (
          <View style={styles.section}>
            <Card style={[styles.planPro, { marginTop: 24 }]}>
              <View style={styles.recBadge}><Text style={styles.recBadgeText}>PLAN ACTIVO</Text></View>
              <Text style={styles.planName}>Plan PRO ✓</Text>
              <Text style={styles.sectionSub}>
                Tu plan expira el {datos?.pro_expira_en ? new Date(datos.pro_expira_en).toLocaleDateString('es-AR') : '—'}
              </Text>
            </Card>
          </View>
        )}
      </Screen>

      <BottomNav
        active="inicio"
        variant="jugador"
        onNavigate={(v) => {
          if (v === 'logout') { setLogoutModal(true); return; }
          if (v !== 'inicio') onNavigate(v);
        }}
      />

      <Modal visible={logoutModal} onClose={() => setLogoutModal(false)} maxWidth={340}>
        <Text style={styles.modalTitle}>¿Cerrar sesión?</Text>
        <PrimaryButton
          label="Cerrar Sesión"
          onPress={async () => { await logout(); setLogoutModal(false); onNavigate('landing'); }}
          style={{ marginTop: 16 }}
        />
        <OutlineButton label="Cancelar" onPress={() => setLogoutModal(false)} style={{ marginTop: 8 }} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  heroOverlay:  { padding: 16, paddingTop: 48, backgroundColor: colors.surfaceContainerLow },
  hi:           { fontFamily: fonts.oswaldBold, fontSize: 44, lineHeight: 44, color: colors.white, textTransform: 'uppercase' },
  hiAccent:     { fontFamily: fonts.oswaldBold, fontSize: 30, lineHeight: 34, color: colors.primaryFixed, textTransform: 'uppercase', marginTop: 4 },
  heroSub:      { ...type.bodyMd, color: colors.onSurfaceVariant, marginTop: 12 },
  statsRow:     { paddingHorizontal: 16, gap: 16, marginTop: 24 },
  statCard:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statLabel:    { ...type.labelSm, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue:    { ...type.headlineLg, color: colors.primary, marginTop: 4 },
  statIcon:     { backgroundColor: 'rgba(195,244,0,0.2)', padding: 14, borderRadius: 999 },
  section:      { paddingHorizontal: 16, paddingTop: 40, paddingBottom: 16 },
  sectionTitle: { ...type.headlineLgMobile, color: colors.primaryFixed, textTransform: 'uppercase', textAlign: 'center' },
  sectionSub:   { ...type.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 },
  planName:     { fontFamily: fonts.oswaldMedium, fontSize: 24, color: colors.primary, marginBottom: 4 },
  planPrice:    { fontFamily: fonts.interBold, fontSize: 32, color: colors.primaryFixed, marginBottom: 16 },
  planPer:      { fontFamily: fonts.inter, fontSize: 14, color: colors.onSurfaceVariant },
  planPro:      { borderWidth: 2, borderColor: colors.primaryFixed, backgroundColor: colors.surfaceContainerHighest },
  recBadge:     { alignSelf: 'center', backgroundColor: colors.primaryFixed, paddingHorizontal: 16, paddingVertical: 4, borderRadius: 999, marginBottom: 12 },
  recBadgeText: { fontFamily: fonts.interBold, fontSize: 11, color: colors.onPrimaryFixed, letterSpacing: 1.5 },
  featRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  featText:     { ...type.bodyMd, fontSize: 14, color: colors.onSurface, flex: 1 },
  modalTitle:   { fontFamily: fonts.oswaldMedium, fontSize: 22, color: colors.onSurface, textTransform: 'uppercase', textAlign: 'center', letterSpacing: 2 },
});
