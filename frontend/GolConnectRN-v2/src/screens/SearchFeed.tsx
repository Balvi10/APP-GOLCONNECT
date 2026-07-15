import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Screen, Card, Field, Badge, PrimaryButton } from '../components/primitives';
import { TopBar, BottomNav, Modal } from '../components/chrome';
import Icon from '../components/Icon';
import { useNavigate } from '../navigation/useNavigate';
import { avisos as apiAvisos, postulaciones as apiPost } from '../api';
import { colors, fonts, type } from '../theme';
import type { AvisoBusqueda } from '../types';

export default function SearchFeed() {
  const onNavigate = useNavigate();
  const [query, setQuery] = useState('');
  const [lista, setLista] = useState<AvisoBusqueda[]>([]);
  const [loading, setLoading] = useState(true);
  const [postulados, setPostulados] = useState<Record<number, boolean>>({});
  const [detalleAviso, setDetalleAviso] = useState<AvisoBusqueda | null>(null);

  const cargar = (posicion: string = '') => {
    setLoading(true);
    apiAvisos.listar(posicion ? { posicion } : {})
      .then((data: any) => setLista(data.data ?? data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const buscar = () => cargar(query);

  const postular = async (aviso: AvisoBusqueda) => {
    if (postulados[aviso.id]) return;
    try {
      await apiPost.postular(aviso.id);
      setPostulados((prev) => ({ ...prev, [aviso.id]: true }));
      Alert.alert('¡Postulación enviada!', `Te postulaste a: ${aviso.nombre}`);
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBar title="GOLCONNECT" />
      <Screen>
        <View style={styles.body}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Field
                placeholder="Buscar por posición..."
                value={query}
                onChangeText={setQuery}
                leftIcon="search"
              />
            </View>
            <Pressable onPress={buscar} style={styles.searchBtn}>
              <Icon name="search" size={22} color={colors.onPrimaryFixed} />
            </Pressable>
          </View>

          {loading && <ActivityIndicator color={colors.primaryFixed} style={{ marginTop: 40 }} />}

          {!loading && lista.length === 0 && (
            <Card style={{ alignItems: 'center', gap: 12, paddingVertical: 40 }}>
              <Icon name="search_off" size={40} color={colors.outlineVariant} />
              <Text style={styles.emptyText}>No hay avisos activos en este momento.</Text>
            </Card>
          )}

          {lista.map((aviso) => {
            const yaPostulado = postulados[aviso.id];
            const rec = aviso.reclutador ?? {};
            return (
              <Card key={aviso.id} style={{ marginTop: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <View style={styles.logoBox}>
                    <Icon name="sports_soccer" size={28} color={colors.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{aviso.nombre}</Text>
                    <Text style={styles.cardClub}>{rec.institucion ?? 'Club'}</Text>
                  </View>
                  {aviso.estado === 'activo' && (
                    <Badge label="Activo" bg="rgba(195,244,0,0.15)" color={colors.primaryFixed} />
                  )}
                </View>

                {aviso.descripcion ? (
                  <Text style={styles.cardBody} numberOfLines={3}>{aviso.descripcion}</Text>
                ) : null}

                <View style={styles.metaGrid}>
                  {aviso.lugar && (
                    <View style={styles.metaCell}>
                      <Text style={styles.metaCellLabel}>Lugar</Text>
                      <Text style={styles.metaCellValue}>{aviso.lugar}</Text>
                    </View>
                  )}
                  {(aviso.edad_minima || aviso.edad_maxima) && (
                    <View style={styles.metaCell}>
                      <Text style={styles.metaCellLabel}>Edad</Text>
                      <Text style={styles.metaCellValue}>
                        {aviso.edad_minima ?? '?'} - {aviso.edad_maxima ?? '?'} años
                      </Text>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <Pressable style={styles.detalleBtn} onPress={() => setDetalleAviso(aviso)}>
                    <Text style={styles.detalleBtnText}>Ver detalles</Text>
                  </Pressable>
                  <PrimaryButton
                    label={yaPostulado ? '✓ Enviado' : 'Postularme'}
                    onPress={() => postular(aviso)}
                    disabled={yaPostulado}
                    style={{ flex: 1 }}
                  />
                </View>
              </Card>
            );
          })}
        </View>
      </Screen>

      {/* Modal detalle */}
      <Modal visible={!!detalleAviso} onClose={() => setDetalleAviso(null)} maxWidth={380}>
        {detalleAviso && (
          <View style={{ gap: 12 }}>
            <Text style={styles.modalTitle}>{detalleAviso.nombre}</Text>
            <Text style={styles.modalSub}>{detalleAviso.reclutador?.institucion}</Text>
            {detalleAviso.descripcion && <Text style={styles.modalBody}>{detalleAviso.descripcion}</Text>}
            {detalleAviso.habilidades_clave && (
              <View>
                <Text style={styles.modalLabel}>Habilidades clave</Text>
                <Text style={styles.modalBody}>{detalleAviso.habilidades_clave}</Text>
              </View>
            )}
            {detalleAviso.requisitos_ingreso && (
              <View>
                <Text style={styles.modalLabel}>Requisitos</Text>
                <Text style={styles.modalBody}>{detalleAviso.requisitos_ingreso}</Text>
              </View>
            )}
            <PrimaryButton
              label={postulados[detalleAviso.id] ? '✓ Ya te postulaste' : 'Postularme'}
              onPress={() => { postular(detalleAviso); setDetalleAviso(null); }}
              disabled={postulados[detalleAviso.id]}
            />
          </View>
        )}
      </Modal>

      <BottomNav active="search" variant="jugador" onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16 },
  searchBtn: { backgroundColor: colors.primaryFixedDim, borderRadius: 12, padding: 14 },
  logoBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: fonts.oswaldMedium, fontSize: 18, color: colors.onSurface },
  cardClub: { ...type.labelSm, color: colors.onSurfaceVariant },
  cardBody: { ...type.bodyMd, fontSize: 14, color: colors.onSurfaceVariant },
  metaGrid: { flexDirection: 'row', gap: 16, marginTop: 12 },
  metaCell: { flex: 1 },
  metaCellLabel: { ...type.labelSm, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  metaCellValue: { fontFamily: fonts.interBold, fontSize: 14, color: colors.onSurface, marginTop: 2 },
  detalleBtn: { borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 10, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  detalleBtnText: { ...type.labelSm, color: colors.onSurfaceVariant, fontFamily: fonts.interBold },
  emptyText: { ...type.bodyMd, color: colors.onSurfaceVariant },
  modalTitle: { fontFamily: fonts.oswaldMedium, fontSize: 22, color: colors.onSurface, textTransform: 'uppercase' },
  modalSub: { ...type.labelSm, color: colors.primaryFixed },
  modalLabel: { fontFamily: fonts.interBold, fontSize: 13, color: colors.onSurface, marginBottom: 4 },
  modalBody: { ...type.bodyMd, fontSize: 14, color: colors.onSurfaceVariant },
});
