import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, Pressable, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Linking, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import AvatarImage from '../components/AvatarImage';
import { useNavigate } from '../navigation/useNavigate';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { jugadores as apiJugadores } from '../api';
import { colors, fonts } from '../theme';
import type { RootStackParamList } from '../navigation/routes';
import type { PerfilJugador, TrayectoriaJugador } from '../types';

const { width: SW } = Dimensions.get('window');

function miniatura(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}


function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}


function MetricBar({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <View style={styles.barWrap}>
      <View style={styles.barRow}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>{value}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.min(pct, 100)}%` }]} />
      </View>
    </View>
  );
}

//  Item de trayectoria 
interface TrayItemProps {
  club: string;
  division?: string | null;
  partidos?: number | null;
  inicio?: number | null;
  fin?: number | null;
  last?: boolean;
}

function TrayItem({ club, division, partidos, inicio, fin, last }: TrayItemProps) {
  return (
    <View style={styles.trayItem}>
      <View style={styles.trayLeft}>
        <View style={styles.trayDot}>
          <Icon name="shield" size={16} color={colors.onSurfaceVariant} />
        </View>
        {!last && <View style={styles.trayLine} />}
      </View>
      <View style={styles.trayContent}>
        <View style={styles.trayRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.trayClub}>{club}</Text>
            {(division || partidos) && (
              <Text style={styles.trayDiv}>
                {[division, partidos ? `${partidos} partidos` : null].filter(Boolean).join(' • ')}
              </Text>
            )}
          </View>
          {(inicio || fin) && (
            <Text style={styles.trayYear}>{inicio}{fin ? ` - ${fin}` : ''}</Text>
          )}
        </View>
      </View>
    </View>
  );
}


export default function DetalleCandidato() {
  const onNavigate = useNavigate();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'detalle-candidato'>>();
  const jugadorId = route.params?.jugadorId;

  const [perfil, setPerfil] = useState<PerfilJugador | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jugadorId) { setLoading(false); return; }
    apiJugadores.detalle(jugadorId)
      .then(setPerfil)
      .catch(() => Alert.alert('Error', 'No se pudo cargar el perfil del jugador.'))
      .finally(() => setLoading(false));
  }, [jugadorId]);

  const abrirVideo = async (url?: string | null) => {
    if (!url) return;
    const ok = await Linking.canOpenURL(url);
    if (ok) await Linking.openURL(url);
    else Alert.alert('Error', 'No se pudo abrir el enlace.');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primaryFixed} size="large" />
      </View>
    );
  }

  if (!perfil) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Icon name="person_search" size={48} color={colors.outlineVariant} />
        <Text style={{ fontFamily: fonts.inter, fontSize: 16, color: colors.onSurfaceVariant, marginTop: 16, textAlign: 'center' }}>
          No se encontró el perfil del jugador.
        </Text>
        <Pressable style={{ marginTop: 20, padding: 14 }} onPress={() => navigation.goBack()}>
          <Text style={{ fontFamily: fonts.interBold, color: colors.primaryFixed }}>← Volver</Text>
        </Pressable>
      </View>
    );
  }

  const nombre = `${perfil.nombre ?? ''} ${perfil.apellido ?? ''}`.trim();
  const videos = perfil.videos ?? [];
  const trayec: TrayectoriaJugador[] = perfil.trayectoria ?? [];
  const videoHero = videos[0];
  const thumbHero = videoHero ? miniatura(videoHero.url) : null;

  const pierna = perfil.pierna_habil
    ? perfil.pierna_habil.charAt(0).toUpperCase() + perfil.pierna_habil.slice(1)
    : '—';

  const partidos = perfil.temporada_partidos ?? 0;
  const goles = perfil.temporada_goles ?? 0;
  const golsPP = partidos > 0 ? (goles / partidos).toFixed(2) : '0.00';
  const efectividad = goles > 0
    ? Math.min(Math.round((goles / (partidos || 1)) * 100), 100)
    : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── HEADER ── */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow_back" size={22} color={colors.primaryFixed} />
          <Text style={styles.backText}>VOLVER</Text>
        </Pressable>
        <Text style={styles.headerLogo}>GOLCONNECT</Text>
        <View style={{ width: 80 }} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── VIDEO HERO ── */}
        <Pressable
          style={styles.videoHero}
          onPress={() => videoHero && abrirVideo(videoHero.url)}
          disabled={!videoHero}
        >
          {thumbHero
            ? <Image source={{ uri: thumbHero }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            : <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceContainerHighest }]} />}
          <View style={styles.videoOverlay} />
          {videoHero && (
            <View style={styles.playBtn}>
              <Icon name="play_arrow" size={44} color={colors.onPrimaryFixed} />
            </View>
          )}
          {!videoHero && (
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Icon name="videocam_off" size={40} color={colors.outlineVariant} />
              <Text style={{ fontFamily: fonts.inter, fontSize: 13, color: colors.outlineVariant }}>Sin video</Text>
            </View>
          )}
          <View style={styles.viewsBadge}>
            <Icon name="visibility" size={14} color={colors.primaryFixed} />
            <Text style={styles.viewsText}>{perfil.visitas_perfil ?? 0} VISTAS</Text>
          </View>
        </Pressable>

        {/* ── IDENTIDAD ── */}
        <View style={styles.identityCard}>
          <View style={styles.identityTop}>
            <View style={styles.avatarWrap}>
              <AvatarImage
                fotoPath={perfil.foto_perfil}
                size={88}
                iconSize={44}
                style={{ borderRadius: 12, borderWidth: 2, borderColor: colors.primaryFixed }}
              />
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={styles.nameRow}>
                <Text style={styles.playerName}>{nombre.toUpperCase()}</Text>
                <View style={styles.estadoBadge}>
                  <Text style={styles.estadoBadgeText}>{(perfil.estado ?? 'libre').toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.posicionText}>
                {perfil.posicion_principal ?? 'Jugador'}
              </Text>
              {perfil.ciudad && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="location_on" size={14} color={colors.primaryFixedDim} />
                  <Text style={styles.cityText}>{perfil.ciudad}{perfil.pais ? `, ${perfil.pais}` : ''}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 16 }}>

          {/* ── MÉTRICAS FÍSICAS ── */}
          <View style={styles.metricsRow}>
            <MetricBox label="ALTURA" value={perfil.altura_cm ? `${perfil.altura_cm}m` : '—'} />
            <MetricBox label="PESO" value={perfil.peso_kg ? `${perfil.peso_kg}kg` : '—'} />
            <MetricBox label="PIE" value={pierna} />
          </View>

          {/* ── MÉTRICAS CLAVE ── */}
          <View style={styles.card}>
            <Text style={styles.cardKicker}>MÉTRICAS CLAVE (ÚLT. TEMP)</Text>
            <MetricBar label="Goles por partido" value={golsPP} pct={parseFloat(golsPP) * 100} />
            <MetricBar label="Efectividad de Remate" value={`${efectividad}%`} pct={efectividad} />
            <View style={styles.seasonGrid}>
              {(
                [
                  ['Partidos', perfil.temporada_partidos ?? 0],
                  ['Goles', perfil.temporada_goles ?? 0],
                  ['Asistencias', perfil.temporada_asistencias ?? 0],
                ] as [string, number][]
              ).map(([k, v]) => (
                <View key={k} style={styles.seasonItem}>
                  <Text style={styles.seasonItemValue}>{v}</Text>
                  <Text style={styles.seasonItemLabel}>{k}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── TRAYECTORIA ── */}
          {trayec.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.cardKicker}>TRAYECTORIA</Text>
                <Icon name="timeline" size={20} color={colors.onSurfaceVariant} />
              </View>
              {trayec.map((t, i) => (
                <TrayItem
                  key={t.id ?? i}
                  club={t.club}
                  division={t.division ?? t.categoria}
                  partidos={t.partidos}
                  inicio={t.temporada_inicio}
                  fin={t.temporada_fin}
                  last={i === trayec.length - 1}
                />
              ))}
            </View>
          )}

          {/* ── VIDEOS ADICIONALES ── */}
          {videos.length > 1 && (
            <View style={styles.card}>
              <Text style={styles.cardKicker}>HIGHLIGHTS</Text>
              {videos.slice(1).map((v) => {
                const thumb = miniatura(v.url);
                return (
                  <Pressable key={v.id} style={styles.videoRow} onPress={() => abrirVideo(v.url)}>
                    {thumb
                      ? <Image source={{ uri: thumb }} style={styles.videoThumb} resizeMode="cover" />
                      : <View style={[styles.videoThumb, { backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' }]}>
                          <Icon name="play_circle" size={24} color={colors.primaryFixed} />
                        </View>}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.videoTitle} numberOfLines={1}>{v.titulo ?? 'Video'}</Text>
                      <Text style={styles.videoUrl} numberOfLines={1}>{v.url}</Text>
                    </View>
                    <Icon name="open_in_new" size={18} color={colors.primaryFixed} />
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* ── REPORTE DEL SCOUT ── */}
          <View>
            <Text style={styles.cardKicker}>REPORTE DEL SCOUT</Text>
            <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.primaryFixed, marginTop: 8 }]}>
              <Text style={styles.reportText}>
                "Jugador con perfil técnico destacado. Revisado y verificado por el equipo de GolConnect Scout Network."
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 }}>
                <View style={styles.reportAvatar} />
                <Text style={styles.reportAuthor}>Admin GolConnect Scout Network</Text>
              </View>
            </View>
            <View style={styles.tagsRow}>
              {['#TécnicaFina', '#Velocidad', '#Potencia', '#Definición'].map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>

      {/* ── CTA FIJO ── */}
      <View style={styles.ctaWrap}>
        <Pressable
          style={styles.ctaBtn}
          onPress={() => onNavigate('contactar-jugador', { jugadorId: perfil.id })}
        >
          <Icon name="mail" size={20} color={colors.onPrimaryFixed} />
          <Text style={styles.ctaBtnText}>CONTACTAR JUGADOR</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: 'rgba(18,20,20,0.95)' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 80 },
  backText: { fontFamily: fonts.interBold, fontSize: 11, color: colors.onSurfaceVariant, letterSpacing: 1 },
  headerLogo: { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.primaryFixed, letterSpacing: 1 },

  videoHero: { width: SW, aspectRatio: 16 / 9, backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  videoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  playBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  viewsBadge: { position: 'absolute', bottom: 12, left: 16, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  viewsText: { fontFamily: fonts.interBold, fontSize: 11, color: colors.primaryFixed, letterSpacing: 0.8 },

  identityCard: { backgroundColor: colors.surfaceContainer, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 14, margin: 16, padding: 16 },
  identityTop: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  avatarWrap: { position: 'relative' },
  verifiedBadge: { position: 'absolute', bottom: -6, left: '50%', transform: [{ translateX: -28 }], backgroundColor: colors.primaryFixed, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  verifiedText: { fontFamily: fonts.interBold, fontSize: 8, color: colors.onPrimaryFixed, letterSpacing: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  playerName: { fontFamily: fonts.oswaldBold, fontSize: 26, color: colors.white, lineHeight: 30 },
  estadoBadge: { backgroundColor: colors.primaryFixed, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  estadoBadgeText: { fontFamily: fonts.interBold, fontSize: 10, color: colors.onPrimaryFixed, letterSpacing: 1 },
  posicionText: { fontFamily: fonts.oswaldMedium, fontSize: 18, color: colors.onSurfaceVariant },
  cityText: { fontFamily: fonts.interMedium, fontSize: 12, color: colors.primaryFixedDim },

  metricsRow: { flexDirection: 'row', gap: 8 },
  metricBox: { flex: 1, backgroundColor: colors.surfaceContainer, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 10, paddingVertical: 14, alignItems: 'center', gap: 4 },
  metricLabel: { fontFamily: fonts.interBold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8 },
  metricValue: { fontFamily: fonts.oswaldMedium, fontSize: 22, color: colors.white },

  card: { backgroundColor: colors.surfaceContainer, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, padding: 16 },
  cardKicker: { fontFamily: fonts.interBold, fontSize: 11, color: colors.primaryFixed, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },

  barWrap: { marginBottom: 16 },
  barRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  barLabel: { fontFamily: fonts.inter, fontSize: 14, color: colors.onSurface },
  barValue: { fontFamily: fonts.oswaldMedium, fontSize: 22, color: colors.white },
  barTrack: { height: 4, backgroundColor: colors.surfaceVariant, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primaryFixed, borderRadius: 2 },

  seasonGrid: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: 14, marginTop: 4 },
  seasonItem: { flex: 1, alignItems: 'center' },
  seasonItemValue: { fontFamily: fonts.oswaldMedium, fontSize: 24, color: colors.primaryFixed },
  seasonItemLabel: { fontFamily: fonts.interBold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', marginTop: 2 },

  trayItem: { flexDirection: 'row', gap: 12 },
  trayLeft: { alignItems: 'center', width: 36 },
  trayDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceContainerHighest, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },
  trayLine: { flex: 1, width: 1, backgroundColor: colors.outlineVariant, marginTop: 4 },
  trayContent: { flex: 1, paddingBottom: 16 },
  trayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  trayClub: { fontFamily: fonts.interBold, fontSize: 14, color: colors.white },
  trayDiv: { fontFamily: fonts.inter, fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
  trayYear: { fontFamily: fonts.inter, fontSize: 12, color: colors.onSurfaceVariant },

  videoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  videoThumb: { width: 64, height: 40, borderRadius: 6, overflow: 'hidden' },
  videoTitle: { fontFamily: fonts.interBold, fontSize: 13, color: colors.white },
  videoUrl: { fontFamily: fonts.inter, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },

  reportText: { fontFamily: fonts.inter, fontSize: 14, color: colors.onSurface, fontStyle: 'italic', lineHeight: 22 },
  reportAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceContainerHighest },
  reportAuthor: { fontFamily: fonts.interMedium, fontSize: 12, color: colors.onSurfaceVariant },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.outlineVariant, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  tagText: { fontFamily: fonts.interMedium, fontSize: 12, color: colors.white },

  ctaWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(18,20,20,0.92)', paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  ctaBtn: { backgroundColor: colors.primaryFixed, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 999 },
  ctaBtnText: { fontFamily: fonts.interBold, fontSize: 14, color: colors.onPrimaryFixed, textTransform: 'uppercase', letterSpacing: 1.5 },
});
