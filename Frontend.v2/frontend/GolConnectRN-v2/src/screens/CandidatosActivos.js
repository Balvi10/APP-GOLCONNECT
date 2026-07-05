import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useNavigate } from '../navigation/useNavigate';
import { avisos as apiAvisos, postulaciones as apiPost, jugadores as apiJugadores } from '../api';
import { colors, fonts } from '../theme';

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - 16 * 2 - 12) / 2; // 2 columnas con gap

// ── Card de candidato (estilo bento/full-art) ─────────────────────────────
function CandidatoCard({ candidato, seleccionado, onSeleccionar, onVerPerfil }) {
  const jugador = candidato.jugador ?? {};
  const u       = jugador.user ?? {};
  const nombre  = `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim() || 'Jugador';
  const pierna  = jugador.pierna_habil
    ? jugador.pierna_habil.charAt(0).toUpperCase() + jugador.pierna_habil.slice(1)
    : '—';
  const verificado = jugador.plan === 'pro';

  return (
    <Pressable style={styles.card} onPress={onVerPerfil}>
      {/* Fondo placeholder */}
      <View style={styles.cardBg}>
        <Icon name="person" size={56} color="rgba(255,255,255,0.05)" />
      </View>

      {/* Gradiente inferior simulado */}
      <View style={styles.cardGrad} />

      {/* Badge verificado */}
      {verificado && (
        <View style={styles.verifiedBadge}>
          <Icon name="verified" size={12} color={colors.primaryFixedDim} />
          <Text style={styles.verifiedText}>Verificado</Text>
        </View>
      )}

      {/* Datos */}
      <View style={styles.cardBottom}>
        <Text style={styles.cardName} numberOfLines={1}>{nombre.toUpperCase()}</Text>
        <View style={styles.cardStats}>
          <View style={styles.cardStatItem}>
            <Text style={styles.cardStatLabel}>Altura</Text>
            <Text style={styles.cardStatValue}>{jugador.altura_cm ? `${jugador.altura_cm}m` : '—'}</Text>
          </View>
          <View style={styles.cardStatItem}>
            <Text style={styles.cardStatLabel}>Peso</Text>
            <Text style={styles.cardStatValue}>{jugador.peso_kg ? `${jugador.peso_kg}kg` : '—'}</Text>
          </View>
          <View style={styles.cardStatItem}>
            <Text style={styles.cardStatLabel}>Pie</Text>
            <Text style={[styles.cardStatValue, { color: colors.primaryFixedDim }]}>{pierna}</Text>
          </View>
        </View>
        <Pressable
          style={[styles.selectBtn, seleccionado && styles.selectBtnSel]}
          onPress={e => { e.stopPropagation?.(); onSeleccionar(); }}
        >
          <Text style={[styles.selectBtnText, seleccionado && styles.selectBtnTextSel]}>
            {seleccionado ? 'SELECCIONADO' : 'SELECCIONAR'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function CandidatosActivos() {
  const navigation  = useNavigation();
  const onNavigate  = useNavigate();
  const route       = useRoute();
  const avisoId     = route.params?.avisoId;

  const [candidatos, setCandidatos]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [seleccionados, setSeleccionados] = useState({}); // { postulacionId: true }
  const [selCount, setSelCount]           = useState(0);
  const [contactando, setContactando]     = useState(false);

  const cargar = () => {
    setLoading(true);
    if (!avisoId) {
      // Sin avisoId: mostrar todos los candidatos del reclutador
      setLoading(false);
      return;
    }
    apiAvisos.candidatos(avisoId)
      .then(data => setCandidatos(Array.isArray(data) ? data : []))
      .catch(() => setCandidatos([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [avisoId]);

  const toggleSeleccionar = (c) => {
    const id = c.id;
    setSeleccionados(prev => {
      const ya = !!prev[id];
      setSelCount(cnt => ya ? cnt - 1 : cnt + 1);
      return { ...prev, [id]: !ya };
    });
  };

  // Contactar jugadores seleccionados → los agrega a Mis Jugadores
  const contactarSeleccionados = async () => {
    const ids = Object.entries(seleccionados)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (ids.length === 0) return;
    setContactando(true);

    try {
      const promesas = candidatos
        .filter(c => seleccionados[c.id])
        .map(c => {
          const jugadorId = c.jugador?.id;
          if (!jugadorId) return Promise.resolve();
          return apiJugadores.contactar(jugadorId, { tipo: 'interes', canal: 'whatsapp', notas: 'Seleccionado desde Candidatos Activos' });
        });
      await Promise.all(promesas);
      Alert.alert('✓ Guardado', `${ids.length} jugador${ids.length > 1 ? 'es' : ''} agregado${ids.length > 1 ? 's' : ''} a Mis Jugadores.`, [
        { text: 'Ver Mis Jugadores', onPress: () => onNavigate('mis-jugadores-reclutador') },
        { text: 'Continuar', style: 'cancel' },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setContactando(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ── */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow_back" size={20} color={colors.primaryFixedDim} />
        </Pressable>
        <Text style={styles.headerLogo}>GOLCONNECT</Text>
        <View style={{ width: 44 }} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: selCount > 0 ? 120 : 40 }}>
        <View style={styles.pageHead}>
          <Text style={styles.pageTitle}>Candidatos Activos</Text>
          <Text style={styles.pageSub}>
            {candidatos.length > 0
              ? `Mostrando ${candidatos.length} resultado${candidatos.length !== 1 ? 's' : ''}`
              : 'Sin candidatos aún'}
          </Text>
          <View style={styles.activoPill}>
            <View style={styles.activoDot} />
            <Text style={styles.activoText}>Activos</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primaryFixed} style={{ marginTop: 60 }} size="large" />
        ) : candidatos.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="inbox" size={48} color={colors.outlineVariant} />
            <Text style={styles.emptyText}>Todavía no hay postulaciones{avisoId ? ' para este aviso' : ''}.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {candidatos.map(c => (
              <CandidatoCard
                key={c.id}
                candidato={c}
                seleccionado={!!seleccionados[c.id]}
                onSeleccionar={() => toggleSeleccionar(c)}
                onVerPerfil={() => {
                  const jugadorId = c.jugador?.id;
                  if (jugadorId) onNavigate('detalle-candidato', { jugadorId });
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Barra de comparación / acción flotante ── */}
      {selCount > 0 && (
        <View style={styles.compareBar}>
          <View style={styles.compareInfo}>
            <Text style={[styles.compareCount, { fontSize: 28 }]}>{selCount}</Text>
            <Text style={styles.compareLabel}>seleccionado{selCount !== 1 ? 's' : ''}</Text>
          </View>
          <Pressable
            style={[styles.compareBtn, contactando && { opacity: 0.7 }]}
            onPress={contactarSeleccionados}
            disabled={contactando}
          >
            <Icon name="group_add" size={18} color={colors.onPrimaryFixed} />
            <Text style={styles.compareBtnText}>
              {contactando ? 'Guardando...' : 'Añadir a Mis Jugadores'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: colors.surface },
  backBtn:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerLogo:  { fontFamily: fonts.oswaldMedium, fontSize: 18, color: colors.primaryFixedDim, letterSpacing: 1 },

  pageHead:    { padding: 16, paddingTop: 20, gap: 4, flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap' },
  pageTitle:   { fontFamily: fonts.oswaldBold, fontSize: 30, color: colors.white, textTransform: 'uppercase', flex: 1, lineHeight: 32 },
  pageSub:     { fontFamily: fonts.inter, fontSize: 13, color: colors.onSurfaceVariant, width: '100%' },
  activoPill:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceContainer, borderWidth: 1, borderColor: colors.outlineVariant, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  activoDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primaryFixedDim },
  activoText:  { fontFamily: fonts.interBold, fontSize: 12, color: colors.onSurface },

  grid:        { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card:        { width: CARD_W, height: 320, backgroundColor: colors.surfaceContainer, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.outlineVariant, position: 'relative' },
  cardBg:      { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  cardGrad:    { position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, backgroundColor: 'transparent',
                 // gradiente manual
                 shadowColor: colors.background, shadowOffset: { width: 0, height: -80 }, shadowOpacity: 1, shadowRadius: 60 },
  verifiedBadge:{ position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(18,20,20,0.85)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: colors.primaryFixedDim },
  verifiedText: { fontFamily: fonts.interBold, fontSize: 10, color: colors.primaryFixedDim },
  cardBottom:  { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, backgroundColor: 'rgba(18,20,20,0.85)' },
  cardName:    { fontFamily: fonts.oswaldMedium, fontSize: 16, color: colors.white, marginBottom: 8 },
  cardStats:   { flexDirection: 'row', gap: 6, marginBottom: 10, borderTopWidth: 1, borderTopColor: 'rgba(68,73,51,0.4)', paddingTop: 6 },
  cardStatItem:{ flex: 1 },
  cardStatLabel:{ fontFamily: fonts.interBold, fontSize: 9, color: colors.onSurfaceVariant, textTransform: 'uppercase' },
  cardStatValue:{ fontFamily: fonts.interBold, fontSize: 13, color: colors.white, marginTop: 2 },
  selectBtn:   { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.primaryFixedDim, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  selectBtnSel:{ backgroundColor: colors.primaryFixedDim, borderColor: colors.primaryFixedDim },
  selectBtnText:{ fontFamily: fonts.interBold, fontSize: 11, color: colors.primaryFixedDim, textTransform: 'uppercase', letterSpacing: 0.5 },
  selectBtnTextSel:{ color: colors.onPrimaryFixed },

  empty:       { alignItems: 'center', paddingTop: 60, gap: 14 },
  emptyText:   { fontFamily: fonts.inter, fontSize: 15, color: colors.onSurfaceVariant, textAlign: 'center' },

  compareBar:  { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(18,20,20,0.97)', borderTopWidth: 1, borderTopColor: colors.outlineVariant, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 24 },
  compareInfo: { gap: 2 },
  compareCount:{ fontFamily: fonts.oswaldBold, fontSize: 28, color: colors.primaryFixed },
  compareLabel:{ fontFamily: fonts.inter, fontSize: 12, color: colors.onSurfaceVariant },
  compareBtn:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primaryFixed, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 10 },
  compareBtnText:{ fontFamily: fonts.interBold, fontSize: 13, color: colors.onPrimaryFixed, textTransform: 'uppercase' },
});
