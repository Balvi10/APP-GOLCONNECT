import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import AvatarImage from '../components/AvatarImage';
import { useNavigate } from '../navigation/useNavigate';
import { useNavigation } from '@react-navigation/native';
import { reclutador as apiRec } from '../api';
import { colors, fonts } from '../theme';
import type { PerfilJugador } from '../types';

// ── Card jugador ──────────────────────────────────────────────────────────
function JugadorCard({ perfil, onVerPerfil }: { perfil: PerfilJugador; onVerPerfil: () => void }) {
  const u = perfil.user ?? ({} as any);
  const nombre = `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim() || 'Jugador';

  const estadoColor = ({
    libre: colors.primaryFixed,
    amateur: '#FFC400',
    profesional: '#4FC3F7',
  } as Record<string, string>)[perfil.estado ?? 'libre'] ?? colors.onSurfaceVariant;

  return (
    <View style={styles.card}>
      <View style={styles.cardAvatarWrap}>
        <AvatarImage
          fotoPath={perfil.foto_perfil}
          size={60}
          iconSize={32}
          style={{ borderWidth: 1, borderColor: colors.outlineVariant }}
        />
        {perfil.plan === 'pro' && (
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardNombre} numberOfLines={1}>{nombre}</Text>
        <Text style={styles.cardPosicion}>{perfil.posicion_principal ?? '—'}</Text>

        <View style={styles.cardMeta}>
          {perfil.ciudad ? (
            <View style={styles.cardMetaItem}>
              <Icon name="location_on" size={13} color={colors.onSurfaceVariant} />
              <Text style={styles.cardMetaText}>{perfil.ciudad}</Text>
            </View>
          ) : null}
          <View style={[styles.estadoPill, { borderColor: estadoColor }]}>
            <View style={[styles.estadoDot, { backgroundColor: estadoColor }]} />
            <Text style={[styles.estadoText, { color: estadoColor }]}>
              {(perfil.estado ?? 'libre').charAt(0).toUpperCase() + (perfil.estado ?? 'libre').slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.cardStats}>
          <View style={styles.cardStat}>
            <Text style={styles.cardStatVal}>{perfil.altura_cm ? `${perfil.altura_cm}cm` : '—'}</Text>
            <Text style={styles.cardStatLbl}>Altura</Text>
          </View>
          <View style={styles.cardStat}>
            <Text style={styles.cardStatVal}>{perfil.peso_kg ? `${perfil.peso_kg}kg` : '—'}</Text>
            <Text style={styles.cardStatLbl}>Peso</Text>
          </View>
          <View style={styles.cardStat}>
            <Text style={[styles.cardStatVal, { color: colors.primaryFixed }]}>
              {perfil.pierna_habil
                ? perfil.pierna_habil.charAt(0).toUpperCase() + perfil.pierna_habil.slice(1)
                : '—'}
            </Text>
            <Text style={styles.cardStatLbl}>Pie</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.verBtn} onPress={onVerPerfil}>
        <Text style={styles.verBtnText}>Ver Perfil{'\n'}Completo</Text>
        <Icon name="chevron_right" size={18} color={colors.onPrimaryFixed} />
      </Pressable>
    </View>
  );
}


export default function BuscadorReclutador() {
  const onNavigate = useNavigate();
  const navigation = useNavigation();

  const [nombre, setNombre] = useState('');
  const [posicion, setPosicion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [lista, setLista] = useState<PerfilJugador[]>([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);

  // Carga inicial — todos los jugadores
  useEffect(() => {
    setLoading(true);
    apiRec.buscar({})
      .then((data: any) => setLista(data?.data ?? data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const buscar = useCallback(() => {
    const filtros: Record<string, string> = {};
    if (nombre.trim()) filtros.nombre = nombre.trim();
    if (posicion.trim()) filtros.posicion = posicion.trim();
    if (ciudad.trim()) filtros.ciudad = ciudad.trim();

    setLoading(true);
    setBuscado(true);
    apiRec.buscar(filtros)
      .then((data: any) => setLista(data?.data ?? data ?? []))
      .catch(() => setLista([]))
      .finally(() => setLoading(false));
  }, [nombre, posicion, ciudad]);

  const limpiar = () => {
    setNombre(''); setPosicion(''); setCiudad('');
    setBuscado(false);
    setLoading(true);
    apiRec.buscar({})
      .then((data: any) => setLista(data?.data ?? data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const hayFiltros = nombre || posicion || ciudad;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* ── Header con Safe Area para Dynamic Island ── */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow_back" size={20} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>BUSCAR JUGADORES</Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.searchSection}>

          {/* Campo nombre */}
          <Text style={styles.fieldLabel}>Nombre del jugador</Text>
          <View style={styles.inputWrap}>
            <Icon name="person_search" size={18} color={colors.onSurfaceVariant} />
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej. Mateo, Lucas..."
              placeholderTextColor="rgba(196,201,172,0.4)"
              returnKeyType="search"
              onSubmitEditing={buscar}
            />
            {nombre ? (
              <Pressable hitSlop={8} onPress={() => setNombre('')}>
                <Icon name="close" size={16} color={colors.onSurfaceVariant} />
              </Pressable>
            ) : null}
          </View>

          {/* Campo posición */}
          <Text style={styles.fieldLabel}>Posición</Text>
          <View style={styles.inputWrap}>
            <Icon name="sports_soccer" size={18} color={colors.onSurfaceVariant} />
            <TextInput
              style={styles.input}
              value={posicion}
              onChangeText={setPosicion}
              placeholder="Ej. Delantero, Portero..."
              placeholderTextColor="rgba(196,201,172,0.4)"
              returnKeyType="search"
              onSubmitEditing={buscar}
            />
            {posicion ? (
              <Pressable hitSlop={8} onPress={() => setPosicion('')}>
                <Icon name="close" size={16} color={colors.onSurfaceVariant} />
              </Pressable>
            ) : null}
          </View>

          {/* Campo ciudad */}
          <Text style={styles.fieldLabel}>Ciudad / Región</Text>
          <View style={styles.inputWrap}>
            <Icon name="location_on" size={18} color={colors.onSurfaceVariant} />
            <TextInput
              style={styles.input}
              value={ciudad}
              onChangeText={setCiudad}
              placeholder="Ej. Buenos Aires, Madrid..."
              placeholderTextColor="rgba(196,201,172,0.4)"
              returnKeyType="search"
              onSubmitEditing={buscar}
            />
            {ciudad ? (
              <Pressable hitSlop={8} onPress={() => setCiudad('')}>
                <Icon name="close" size={16} color={colors.onSurfaceVariant} />
              </Pressable>
            ) : null}
          </View>

          {/* Botones */}
          <View style={styles.btnRow}>
            <Pressable style={styles.searchBtn} onPress={buscar}>
              <Icon name="search" size={18} color={colors.onPrimaryFixed} />
              <Text style={styles.searchBtnText}>BUSCAR</Text>
            </Pressable>
            {hayFiltros && (
              <Pressable style={styles.clearBtn} onPress={limpiar}>
                <Icon name="clear" size={16} color={colors.onSurfaceVariant} />
                <Text style={styles.clearBtnText}>Limpiar</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Resultados */}
        <View style={styles.resultSection}>
          {loading ? (
            <ActivityIndicator color={colors.primaryFixed} size="large" style={{ marginTop: 40 }} />
          ) : lista.length === 0 && buscado ? (
            <View style={styles.empty}>
              <Icon name="person_search" size={48} color={colors.outlineVariant} />
              <Text style={styles.emptyTitle}>Sin resultados</Text>
              <Text style={styles.emptyText}>
                No se encontraron jugadores con esos filtros.{'\n'}
                Intentá con términos más generales.
              </Text>
              <Pressable style={styles.clearBtn} onPress={limpiar}>
                <Text style={styles.clearBtnText}>Ver todos los jugadores</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.resultHead}>
                <Text style={styles.resultCount}>
                  {lista.length} jugador{lista.length !== 1 ? 'es' : ''} encontrado{lista.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={{ gap: 12 }}>
                {lista.map((p) => (
                  <JugadorCard
                    key={p.id}
                    perfil={p}
                    onVerPerfil={() => onNavigate('detalle-candidato', { jugadorId: p.id })}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: colors.surface },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.oswaldMedium, fontSize: 18, color: colors.primaryFixed, letterSpacing: 1 },

  searchSection: { padding: 16, paddingTop: 20, gap: 4 },
  fieldLabel: { fontFamily: fonts.interBold, fontSize: 11, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5, marginTop: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surfaceContainerHigh, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: colors.outlineVariant },
  input: { flex: 1, fontFamily: fonts.inter, fontSize: 14, color: colors.onSurface },

  btnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  searchBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primaryFixed, paddingVertical: 15, borderRadius: 12 },
  searchBtnText: { fontFamily: fonts.interBold, fontSize: 13, color: colors.onPrimaryFixed, textTransform: 'uppercase', letterSpacing: 1 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceContainerHigh, paddingHorizontal: 16, paddingVertical: 15, borderRadius: 12, borderWidth: 1, borderColor: colors.outlineVariant },
  clearBtnText: { fontFamily: fonts.interBold, fontSize: 12, color: colors.onSurfaceVariant },

  resultSection: { paddingHorizontal: 16, paddingTop: 8 },
  resultHead: { marginBottom: 12 },
  resultCount: { fontFamily: fonts.interBold, fontSize: 13, color: colors.onSurfaceVariant },

  card: { backgroundColor: colors.surfaceContainer, borderRadius: 14, borderWidth: 1, borderColor: colors.outlineVariant, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  cardAvatarWrap: { position: 'relative' },
  proBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: colors.primaryFixed, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 999 },
  proBadgeText: { fontFamily: fonts.interBold, fontSize: 8, color: colors.onPrimaryFixed, letterSpacing: 0.5 },

  cardBody: { flex: 1 },
  cardNombre: { fontFamily: fonts.oswaldMedium, fontSize: 17, color: colors.white },
  cardPosicion: { fontFamily: fonts.interBold, fontSize: 12, color: colors.primaryFixed, marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  cardMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardMetaText: { fontFamily: fonts.inter, fontSize: 11, color: colors.onSurfaceVariant },
  estadoPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999 },
  estadoDot: { width: 6, height: 6, borderRadius: 3 },
  estadoText: { fontFamily: fonts.interBold, fontSize: 10, textTransform: 'uppercase' },
  cardStats: { flexDirection: 'row', gap: 10, marginTop: 8, borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: 8 },
  cardStat: { alignItems: 'center', gap: 2 },
  cardStatVal: { fontFamily: fonts.interBold, fontSize: 13, color: colors.white },
  cardStatLbl: { fontFamily: fonts.inter, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase' },

  verBtn: { backgroundColor: colors.primaryFixed, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', gap: 2 },
  verBtnText: { fontFamily: fonts.interBold, fontSize: 11, color: colors.onPrimaryFixed, textTransform: 'uppercase', lineHeight: 16 },

  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontFamily: fonts.oswaldMedium, fontSize: 22, color: colors.white, textTransform: 'uppercase' },
  emptyText: { fontFamily: fonts.inter, fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
});
