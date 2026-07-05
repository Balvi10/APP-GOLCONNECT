import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { BottomNav, Modal } from '../components/chrome';
import Icon from '../components/Icon';
import { useNavigate } from '../navigation/useNavigate';
import { useAuth } from '../context/AuthContext';
import { reclutador as apiReclutador } from '../api';
import { colors, fonts, type } from '../theme';
import { Dimensions } from 'react-native';

const { width: SW } = Dimensions.get('window');

// ── Stat card panel ───────────────────────────────────────────────────────
function StatCard({ label, value, sub, subIcon, accent }) {
  return (
    <View style={[styles.statCard, accent && styles.statCardAccent]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && { color: colors.primaryFixed }]}>{value}</Text>
      <View style={styles.statFoot}>
        <Icon name={subIcon} size={14} color={accent ? colors.primaryFixed : colors.onSurfaceVariant} />
        <Text style={[styles.statSub, accent && { color: colors.primaryFixed }]}>{sub}</Text>
      </View>
    </View>
  );
}

// ── Card de aviso de búsqueda ─────────────────────────────────────────────
function AvisoCard({ aviso, onPress }) {
  const tags = [aviso.posicion_requerida].filter(Boolean);

  return (
    <Pressable style={styles.avisoCard} onPress={onPress}>
      {/* Imagen de fondo / placeholder */}
      <View style={styles.avisoImgWrap}>
        <View style={styles.avisoImgPlaceholder}>
          <Icon name="sports_soccer" size={32} color={colors.outlineVariant} />
        </View>
        {/* Badge EN VIVO */}
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EN VIVO</Text>
        </View>
      </View>

      {/* Contenido */}
      <View style={styles.avisoBody}>
        <View style={styles.avisoBadgesRow}>
          {tags.map(t => (
            <View key={t} style={styles.avisoBadge}>
              <Text style={styles.avisoBadgeText}>{t.toUpperCase()}</Text>
            </View>
          ))}
          {aviso.estado === 'activo' && (
            <View style={[styles.avisoBadge, { backgroundColor: colors.surfaceContainerHighest }]}>
              <Text style={[styles.avisoBadgeText, { color: colors.onSurface }]}>ACTIVO</Text>
            </View>
          )}
        </View>

        <Text style={styles.avisoNombre} numberOfLines={2}>{aviso.nombre?.toUpperCase()}</Text>

        {aviso.descripcion ? (
          <Text style={styles.avisoDesc} numberOfLines={2}>{aviso.descripcion}</Text>
        ) : null}

        {/* Métricas */}
        <View style={styles.avisoMetrics}>
          <View style={styles.avisoMetricBox}>
            <Text style={styles.avisoMetricValue}>{aviso.total_postulaciones ?? 0}</Text>
            <Text style={styles.avisoMetricLabel}>POSTULACIONES</Text>
          </View>
          <View style={styles.avisoMetricBox}>
            <Text style={styles.avisoMetricValue}>{aviso.preseleccionados ?? 0}</Text>
            <Text style={styles.avisoMetricLabel}>PRESELECCIONADOS</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function InicioReclutador() {
  const onNavigate       = useNavigate();
  const { user, logout } = useAuth();

  const [datos, setDatos]         = useState(null);
  const [avisos, setAvisos]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [logoutModal, setLogoutModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      apiReclutador.inicio()
        .then(d => {
          if (!activo) return;
          setDatos(d);
          setAvisos(d?.avisos_recientes ?? []);
        })
        .catch(() => {})
        .finally(() => { if (activo) setLoading(false); });

      return () => { activo = false; };
    }, [])
  );

  const nombre = datos?.nombre || user?.nombre || 'Reclutador';

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primaryFixed} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* ── TOP BAR ── */}
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <Text style={styles.topBarLogo}>GOLCONNECT</Text>
        <Pressable onPress={() => setLogoutModal(true)} style={styles.avatarBtn}>
          <Icon name="account_circle" size={26} color={colors.onSurfaceVariant} />
        </Pressable>
      </SafeAreaView>

      {/* ── GLOW ambiental ── */}
      <View style={styles.glowTopLeft} pointerEvents="none" />
      <View style={styles.glowBottomRight} pointerEvents="none" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── HEADER ── */}
        <View style={styles.dashHeader}>
          <View>
            <Text style={styles.dashTitle}>Panel de Control{'\n'}de Scouting</Text>
            <Text style={styles.dashSub}>Gestiona tus campañas de reclutamiento activas y realiza seguimiento en tiempo real.</Text>
          </View>
          <Pressable style={styles.crearBtn} onPress={() => onNavigate('crear-aviso')}>
            <Icon name="add" size={18} color={colors.onPrimaryFixed} />
            <Text style={styles.crearBtnText}>CREAR NUEVO AVISO</Text>
          </Pressable>
        </View>

        {/* ── STATS ── */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Anuncios Activos"
            value={String(datos?.total_avisos_activos ?? avisos.length).padStart(2, '0')}
            sub="+2 desde el mes pasado"
            subIcon="trending_up"
            accent
          />
          <StatCard
            label="Postulaciones Totales"
            value={String(datos?.total_postulaciones ?? 0)}
            sub="Pendientes de revisión"
            subIcon="bolt"
          />
          <StatCard
            label="Región Objetivo"
            value="Sudamérica"
            sub="/ Brasil"
            subIcon="public"
          />
        </View>

        {/* ── AVISOS ACTIVOS ── */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>AVISOS DE BÚSQUEDA ACTIVOS</Text>
            <View style={styles.sectionActions}>
              <Pressable hitSlop={8}><Icon name="filter_list" size={22} color={colors.onSurfaceVariant} /></Pressable>
              <Pressable hitSlop={8}><Icon name="sort" size={22} color={colors.onSurfaceVariant} /></Pressable>
            </View>
          </View>

          {avisos.length === 0 ? (
            <View style={styles.emptyAvisos}>
              <Icon name="campaign" size={44} color={colors.outlineVariant} />
              <Text style={styles.emptyText}>No tenés avisos activos todavía.</Text>
              <Pressable style={styles.crearBtn} onPress={() => onNavigate('crear-aviso')}>
                <Icon name="add" size={16} color={colors.onPrimaryFixed} />
                <Text style={styles.crearBtnText}>CREAR PRIMER AVISO</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.avisosGrid}>
              {avisos.map(aviso => (
                <AvisoCard
                  key={aviso.id}
                  aviso={aviso}
                  onPress={() => onNavigate('candidatos-activos', { avisoId: aviso.id })}
                />
              ))}

              {/* Placeholder para crear nuevo */}
              <Pressable style={styles.newAvisoPlaceholder} onPress={() => onNavigate('crear-aviso')}>
                <View style={styles.newAvisoIcon}>
                  <Icon name="add" size={28} color={colors.onSurfaceVariant} />
                </View>
                <Text style={styles.newAvisoText}>CREAR NUEVO AVISO DE BÚSQUEDA</Text>
              </Pressable>
            </View>
          )}
        </View>

      </ScrollView>

      <BottomNav
        active="inicio"
        variant="reclutador"
        onNavigate={v => {
          if (v === 'logout') { setLogoutModal(true); return; }
          if (v !== 'inicio') onNavigate(v);
        }}
      />

      <Modal visible={logoutModal} onClose={() => setLogoutModal(false)} maxWidth={340}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <View style={styles.logoutIconBox}>
            <Icon name="logout" size={32} color={colors.primaryFixed} />
          </View>
          <Text style={styles.logoutTitle}>¿CERRAR SESIÓN?</Text>
          <Text style={styles.logoutBody}>¿Estás seguro que querés cerrar tu perfil? Tendrás que volver a ingresar tus credenciales.</Text>
          <Pressable style={[styles.crearBtn, { width: '100%', marginTop: 8 }]}
            onPress={async () => { await logout(); setLogoutModal(false); onNavigate('landing'); }}>
            <Text style={styles.crearBtnText}>CERRAR SESIÓN</Text>
          </Pressable>
          <Pressable style={styles.cancelLogoutBtn} onPress={() => setLogoutModal(false)}>
            <Text style={styles.cancelLogoutText}>CANCELAR</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: 'rgba(18,20,20,0.97)' },
  topBarLogo:    { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.primaryFixed, letterSpacing: 1 },
  avatarBtn:     { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceContainer, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },

  glowTopLeft:    { position: 'absolute', top: -60, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: colors.primaryFixed, opacity: 0.04 },
  glowBottomRight:{ position: 'absolute', bottom: 100, right: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: colors.primaryFixed, opacity: 0.03 },

  dashHeader:    { padding: 16, paddingTop: 28, gap: 16 },
  dashTitle:     { fontFamily: fonts.oswaldBold, fontSize: 32, color: colors.white, textTransform: 'uppercase', lineHeight: 36 },
  dashSub:       { fontFamily: fonts.inter, fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 20, marginTop: 6 },

  crearBtn:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primaryFixed, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 10, justifyContent: 'center' },
  crearBtnText:  { fontFamily: fonts.interBold, fontSize: 13, color: colors.onPrimaryFixed, textTransform: 'uppercase', letterSpacing: 1 },

  statsGrid:     { paddingHorizontal: 16, gap: 12, marginTop: 8 },
  statCard:      { backgroundColor: 'rgba(30,32,32,0.7)', borderWidth: 1, borderColor: 'rgba(68,73,51,0.5)', borderRadius: 14, padding: 20 },
  statCardAccent:{ borderLeftWidth: 4, borderLeftColor: colors.primaryFixed },
  statLabel:     { fontFamily: fonts.interBold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1.5 },
  statValue:     { fontFamily: fonts.oswaldBold, fontSize: 40, color: colors.white, marginTop: 4 },
  statFoot:      { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(68,73,51,0.3)' },
  statSub:       { fontFamily: fonts.inter, fontSize: 12, color: colors.onSurfaceVariant },

  section:       { paddingHorizontal: 16, marginTop: 28, paddingBottom: 8 },
  sectionHead:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle:  { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.white, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionActions:{ flexDirection: 'row', gap: 8 },

  emptyAvisos:   { alignItems: 'center', gap: 14, paddingVertical: 40, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.outlineVariant, borderRadius: 16 },
  emptyText:     { fontFamily: fonts.inter, fontSize: 14, color: colors.onSurfaceVariant },

  avisosGrid:    { gap: 14 },
  avisoCard:     { backgroundColor: 'rgba(30,32,32,0.7)', borderWidth: 1, borderColor: 'rgba(68,73,51,0.5)', borderRadius: 16, flexDirection: 'row', gap: 14, padding: 14, overflow: 'hidden' },
  avisoImgWrap:  { width: 100, height: 100, borderRadius: 10, overflow: 'hidden', backgroundColor: colors.surfaceContainerHighest, flexShrink: 0 },
  avisoImgPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  liveRow:       { position: 'absolute', bottom: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(18,20,20,0.9)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  liveDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primaryFixed },
  liveText:      { fontFamily: fonts.interBold, fontSize: 9, color: colors.white, letterSpacing: 0.5 },
  avisoBody:     { flex: 1 },
  avisoBadgesRow:{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 6 },
  avisoBadge:    { backgroundColor: 'rgba(195,244,0,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  avisoBadgeText:{ fontFamily: fonts.interBold, fontSize: 9, color: colors.primaryFixed, letterSpacing: 0.5 },
  avisoNombre:   { fontFamily: fonts.oswaldMedium, fontSize: 16, color: colors.white, textTransform: 'uppercase', lineHeight: 20, marginBottom: 4 },
  avisoDesc:     { fontFamily: fonts.inter, fontSize: 12, color: colors.onSurfaceVariant, lineHeight: 17 },
  avisoMetrics:  { flexDirection: 'row', gap: 12, marginTop: 10 },
  avisoMetricBox:{ backgroundColor: colors.surfaceContainer, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, borderLeftWidth: 2, borderLeftColor: colors.primaryFixed },
  avisoMetricValue:{ fontFamily: fonts.oswaldMedium, fontSize: 18, color: colors.white },
  avisoMetricLabel:{ fontFamily: fonts.interBold, fontSize: 9, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },

  newAvisoPlaceholder:{ borderWidth: 2, borderStyle: 'dashed', borderColor: colors.outlineVariant, borderRadius: 16, padding: 32, alignItems: 'center', gap: 10 },
  newAvisoIcon:  { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  newAvisoText:  { fontFamily: fonts.interBold, fontSize: 12, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },

  logoutIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  logoutTitle:   { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.white, textTransform: 'uppercase', letterSpacing: 1 },
  logoutBody:    { fontFamily: fonts.inter, fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
  cancelLogoutBtn:{ paddingVertical: 14, width: '100%', alignItems: 'center' },
  cancelLogoutText:{ fontFamily: fonts.interBold, fontSize: 12, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8 },
});
