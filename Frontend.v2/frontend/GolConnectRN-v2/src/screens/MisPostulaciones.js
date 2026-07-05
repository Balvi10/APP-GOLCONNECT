import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen, Card, Badge } from '../components/primitives';
import { TopBar, BottomNav } from '../components/chrome';
import Icon from '../components/Icon';
import { useNavigate } from '../navigation/useNavigate';
import { postulaciones as apiPost } from '../api';
import { colors, fonts, type } from '../theme';

const TABS = ['Todas', 'Enviadas', 'En Revisión', 'Finalizadas'];

const ESTADO_MAP = {
  enviada:    { label: 'Enviada',      bg: 'rgba(255,255,255,0.1)', color: colors.onSurfaceVariant },
  en_revision:{ label: 'En Revisión',  bg: 'rgba(255,204,0,0.15)', color: '#FFC400'               },
  confirmada: { label: 'Confirmada',   bg: 'rgba(195,244,0,0.15)', color: colors.primaryFixed      },
  finalizada: { label: 'Finalizada',   bg: 'rgba(255,255,255,0.05)', color: colors.outline         },
};

const TAB_FILTER = {
  'Todas':       null,
  'Enviadas':    'enviada',
  'En Revisión': 'en_revision',
  'Finalizadas': 'finalizada',
};

export default function MisPostulaciones() {
  const onNavigate   = useNavigate();
  const [tab, setTab]               = useState('Todas');
  const [lista, setLista]           = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    apiPost.misPostulaciones()
      .then((data) => setLista(Array.isArray(data) ? data : data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtradas = TAB_FILTER[tab]
    ? lista.filter((p) => p.estado === TAB_FILTER[tab])
    : lista;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBar title="MIS POSTULACIONES" />
      <Screen>
        <View style={styles.body}>
          {/* Tabs */}
          <View style={styles.tabs}>
            {TABS.map((t) => {
              const active = t === tab;
              return (
                <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, active && styles.tabActive]}>
                  <Text style={[styles.tabText, { color: active ? colors.onPrimaryFixed : colors.onSurfaceVariant }]}>{t}</Text>
                </Pressable>
              );
            })}
          </View>

          {loading && <ActivityIndicator color={colors.primaryFixed} style={{ marginTop: 40 }} />}

          {!loading && filtradas.length === 0 && (
            <Card style={{ alignItems: 'center', gap: 12, paddingVertical: 40 }}>
              <Icon name="inbox" size={40} color={colors.outlineVariant} />
              <Text style={styles.emptyText}>No hay postulaciones en esta categoría.</Text>
            </Card>
          )}

          {filtradas.map((p) => {
            const est = ESTADO_MAP[p.estado] ?? ESTADO_MAP.enviada;
            const aviso = p.aviso ?? {};
            const rec   = aviso.reclutador ?? {};
            const recUser = rec.user ?? {};
            return (
              <Card key={p.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <View style={styles.logoBox}>
                    <Icon name="shield" size={26} color={colors.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.club}>{rec.institucion ?? 'Club'}</Text>
                    <Text style={styles.role}>{aviso.posicion_requerida ?? '—'}</Text>
                  </View>
                  <Badge label={est.label} bg={est.bg} color={est.color} />
                </View>
                <Text style={styles.avisoNombre}>{aviso.nombre ?? '—'}</Text>
                {p.fecha_prueba && (
                  <View style={styles.dateRow}>
                    <Icon name="calendar_month" size={16} color={colors.onSurfaceVariant} />
                    <Text style={styles.dateText}>
                      Prueba: {new Date(p.fecha_prueba).toLocaleDateString('es-AR')}
                    </Text>
                  </View>
                )}
                {p.notas_reclutador ? (
                  <Text style={styles.notas}>{p.notas_reclutador}</Text>
                ) : null}
              </Card>
            );
          })}
        </View>
      </Screen>
      <BottomNav active="postulaciones" variant="jugador" onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  body:       { padding: 16 },
  tabs:       { flexDirection: 'row', backgroundColor: colors.surfaceContainerHigh, borderRadius: 14, padding: 4, marginBottom: 20 },
  tab:        { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive:  { backgroundColor: colors.primaryFixedDim },
  tabText:    { fontFamily: fonts.interBold, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' },
  card:       { marginBottom: 16 },
  cardHead:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  logoBox:    { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  club:       { fontFamily: fonts.interBold, fontSize: 15, color: colors.onSurface },
  role:       { ...type.labelSm, color: colors.onSurfaceVariant },
  avisoNombre:{ ...type.bodyMd, fontSize: 14, color: colors.onSurfaceVariant, marginBottom: 6 },
  dateRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  dateText:   { ...type.labelSm, color: colors.onSurfaceVariant },
  notas:      { ...type.bodyMd, fontSize: 13, color: colors.onSurfaceVariant, marginTop: 8, fontStyle: 'italic' },
  emptyText:  { ...type.bodyMd, color: colors.onSurfaceVariant },
});
