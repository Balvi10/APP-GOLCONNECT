import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Image, Pressable, StyleSheet, ScrollView,
  Alert, ActivityIndicator, TextInput, Animated, Linking,
  Modal as RNModal, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Modal } from '../components/chrome';
import { BottomNav } from '../components/chrome';
import Icon from '../components/Icon';
import AvatarImage from '../components/AvatarImage';
import * as ImagePicker from 'expo-image-picker';
import { useNavigate } from '../navigation/useNavigate';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
// Importaciones estáticas — nunca usar require() dentro de callbacks
import {
  jugador as apiJugador,
  API_BASE_URL,
  guardarSesion,
  obtenerToken,
  urlFoto,
} from '../api';
import { colors, fonts, type } from '../theme';
import { prepararFotoParaSubir } from '../utils/imagenes';
import type { User, PerfilJugador, VideoJugador } from '../types';

const { width: SW } = Dimensions.get('window');

function miniatura(url?: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

function PhysBox({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.physBox}>
      <Icon name={icon} size={22} color={colors.primaryFixed} />
      <Text style={styles.physValue}>{value}</Text>
      <Text style={styles.physLabel}>{label}</Text>
    </View>
  );
}

function SeasonRow({ label, value, last }: { label: string; value: number; last?: boolean }) {
  return (
    <View style={[styles.seasonRow, !last && styles.seasonRowBorder]}>
      <Text style={styles.seasonLabel}>{label}</Text>
      <Text style={styles.seasonValue}>{value}</Text>
    </View>
  );
}

function MiniChart() {
  const bars = [30, 45, 35, 60, 40, 80, 55, 90, 70, 95, 75, 100];
  return (
    <View style={styles.chartWrap}>
      <View style={styles.chartBars}>
        {bars.map((h, i) => <View key={i} style={[styles.chartBar, { height: `${h}%` }]} />)}
      </View>
      <View style={styles.chartLabels}>
        {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'].map((l) => (
          <Text key={l} style={styles.chartLabel}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

function GeoBar({ country, pct }: { country: string; pct: number }) {
  return (
    <View style={styles.geoRow}>
      <Text style={styles.geoCountry}>{country}</Text>
      <View style={styles.geoTrack}><View style={[styles.geoFill, { width: `${pct}%` }]} /></View>
      <Text style={styles.geoPct}>{pct}%</Text>
    </View>
  );
}

interface ContactFieldProps {
  icon: string;
  label: string;
  value?: string | null;
  onSave: (val: string) => void;
}

function ContactField({ icon, label, value: init, onSave }: ContactFieldProps) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(init ?? '');
  useEffect(() => { setVal(init ?? ''); }, [init]);
  const save = () => { setEditing(false); if (onSave) onSave(val); };
  return (
    <View style={styles.contactCard}>
      <View style={styles.contactTop}>
        <View style={styles.contactIconBox}>
          <Icon name={icon} size={22} color={colors.primaryFixed} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.contactLabel}>{label}</Text>
          {editing
            ? <TextInput style={styles.contactInput} value={val} onChangeText={setVal} autoFocus placeholderTextColor="rgba(196,201,172,0.5)" />
            : <Text style={styles.contactValue}>{val || '—'}</Text>}
        </View>
      </View>
      {editing ? (
        <View style={styles.contactBtns}>
          <Pressable style={styles.contactBtnPrimary} onPress={save}><Text style={styles.contactBtnPrimaryText}>Guardar</Text></Pressable>
          <Pressable style={styles.contactBtnOutline} onPress={() => { setEditing(false); setVal(init ?? ''); }}><Text style={styles.contactBtnOutlineText}>Cancelar</Text></Pressable>
        </View>
      ) : (
        <Pressable style={styles.contactBtnPrimary} onPress={() => setEditing(true)}>
          <Text style={styles.contactBtnPrimaryText}>Editar</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Helper: persistir user actualizado en memoria + AsyncStorage ──────────
async function persistirUser(
  userActual: User | null,
  setUser: (u: User) => void,
  perfilNuevo: Partial<PerfilJugador>,
): Promise<User> {
  const userActualizado = { ...(userActual as User), perfilJugador: perfilNuevo as PerfilJugador };
  setUser(userActualizado);
  try {
    const tk = await obtenerToken();
    if (tk) await guardarSesion(tk, userActualizado);
  } catch (_) {}
  return userActualizado;
}

// ═══════════════════════════════════════════════════════════════════════════
export default function Profile() {
  const onNavigate = useNavigate();
  const { user, setUser, logout } = useAuth();

  const [perfil, setPerfil] = useState<PerfilJugador | null>(null);
  const [loading, setLoading] = useState(true);
  // fotoLocal: URI local tras elegir de galería (para preview inmediato)
  const [fotoLocal, setFotoLocal] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoJugador[]>([]);

  // Modales
  const [cancelModal, setCancelModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [galleryModal, setGalleryModal] = useState(false);
  const [heroImagenRota, setHeroImagenRota] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [editFisicoModal, setEditFisicoModal] = useState(false);

  const [videoUrl, setVideoUrl] = useState('');
  const [addingVideo, setAddingVideo] = useState(false);

  // Campos edición física
  const [editAltura, setEditAltura] = useState('');
  const [editPeso, setEditPeso] = useState('');
  const [editPierna, setEditPierna] = useState('diestro');
  const [editPosP, setEditPosP] = useState('');
  const [editPosS, setEditPosS] = useState('');
  const [editPartidos, setEditPartidos] = useState('');
  const [editGoles, setEditGoles] = useState('');
  const [editAsistencias, setEditAsistencias] = useState('');
  const [savingFisico, setSavingFisico] = useState(false);

  const slideAnim = useRef(new Animated.Value(400)).current;

  // ── CARGA — se ejecuta cada vez que la pantalla obtiene foco ────────────
  useFocusEffect(
    useCallback(() => {
      let activo = true;
      apiJugador.perfil()
        .then(async (data) => {
          if (!activo) return;
          // El backend devuelve el user completo: { id, nombre, apellido, perfilJugador: {..., videos:[]} }
          const p = data?.perfilJugador ?? null;

          if (p) {
            setPerfil(p);
            setVideos(Array.isArray(p.videos) ? p.videos : []);
            setHeroImagenRota(false); // reintentar cargar la foto con los datos frescos

            setEditAltura(p.altura_cm != null ? String(p.altura_cm) : '');
            setEditPeso(p.peso_kg != null ? String(p.peso_kg) : '');
            setEditPierna(p.pierna_habil ?? 'diestro');
            setEditPosP(p.posicion_principal ?? '');
            setEditPosS(p.posicion_secundaria ?? '');
            setEditPartidos(p.temporada_partidos != null ? String(p.temporada_partidos) : '');
            setEditGoles(p.temporada_goles != null ? String(p.temporada_goles) : '');
            setEditAsistencias(p.temporada_asistencias != null ? String(p.temporada_asistencias) : '');
          }

          if (data && data.id) {
            await persistirUser(data, setUser, p ?? {});
          }
        })
        .catch(() => {
          const p = user?.perfilJugador ?? null;
          if (p && activo) {
            setPerfil(p);
            setVideos(Array.isArray(p.videos) ? p.videos : []);
          }
        })
        .finally(() => { if (activo) setLoading(false); });

      return () => { activo = false; };
    }, [])
  );

  // ── CAMBIAR FOTO DE PERFIL ─────────────────────────────────────────────
  const abrirGaleriaFoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'GolConnect necesita acceso a tu galería.\nAndá a Configuración → Privacidad → Fotos y habilitá el acceso.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      // Preview inmediato — se muestra antes de subir
      setFotoLocal(asset.uri);

      // Subir al backend
      const tk = await obtenerToken();
      if (!tk) return;

      // Convertir SIEMPRE a JPEG antes de subir. Las fotos de la galería de
      // iPhone suelen ser HEIC, que el backend no acepta.
      const fotoLista = await prepararFotoParaSubir(asset.uri, 'foto_perfil.jpg');

      const form = new FormData();
      form.append('foto', fotoLista as any);

      const resp = await fetch(`${API_BASE_URL}/jugador/perfil/foto`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tk}` }, // sin Content-Type: fetch arma el boundary automáticamente
        body: form,
      });

      if (resp.ok) {
        const rd = await resp.json().catch(() => ({}));
        // Actualizar perfil con la ruta guardada en el servidor
        const perfilNuevo = { ...(perfil ?? {}), foto_perfil: rd.foto_perfil };
        setPerfil(perfilNuevo);
        await persistirUser(user, setUser, perfilNuevo);
        // Limpiar el preview local y permitir reintentar cargar la nueva URL
        setFotoLocal(null);
        setHeroImagenRota(false);
        Alert.alert('✓ Foto actualizada', 'Tu foto de perfil fue guardada.');
      } else {
        // Si falló la subida, tampoco tiene sentido seguir mostrando un
        // preview local que nunca se guardó en el servidor.
        setFotoLocal(null);
        const errData = await resp.json().catch(() => ({}));
        const detalle = errData?.message || errData?.errors?.foto?.[0] || `Código ${resp.status}`;
        Alert.alert('No se pudo guardar la foto', detalle);
      }
    } catch (err: any) {
      setFotoLocal(null);
      Alert.alert('Error', 'No se pudo procesar la foto: ' + (err?.message ?? 'Error desconocido'));
    }
  };

  // ── GUARDAR PERFIL FÍSICO ─────────────────────────────────────────────
  const guardarFisico = async () => {
    setSavingFisico(true);
    try {
      await apiJugador.actualizarPerfil({
        altura_cm: editAltura ? parseInt(editAltura, 10) : undefined,
        peso_kg: editPeso ? parseInt(editPeso, 10) : undefined,
        pierna_habil: (editPierna as any) || undefined,
        posicion_principal: editPosP || undefined,
        posicion_secundaria: editPosS || undefined,
        temporada_partidos: editPartidos ? parseInt(editPartidos, 10) : undefined,
        temporada_goles: editGoles ? parseInt(editGoles, 10) : undefined,
        temporada_asistencias: editAsistencias ? parseInt(editAsistencias, 10) : undefined,
      });

      const perfilNuevo: PerfilJugador = {
        ...(perfil ?? ({} as PerfilJugador)),
        altura_cm: editAltura ? parseInt(editAltura, 10) : perfil?.altura_cm,
        peso_kg: editPeso ? parseInt(editPeso, 10) : perfil?.peso_kg,
        pierna_habil: (editPierna as any) || perfil?.pierna_habil,
        posicion_principal: editPosP || perfil?.posicion_principal,
        posicion_secundaria: editPosS || perfil?.posicion_secundaria,
        temporada_partidos: editPartidos ? parseInt(editPartidos, 10) : perfil?.temporada_partidos,
        temporada_goles: editGoles ? parseInt(editGoles, 10) : perfil?.temporada_goles,
        temporada_asistencias: editAsistencias ? parseInt(editAsistencias, 10) : perfil?.temporada_asistencias,
      };

      setPerfil(perfilNuevo);
      await persistirUser(user, setUser, perfilNuevo);
      setEditFisicoModal(false);
      Alert.alert('✓ Guardado', 'Tus datos físicos fueron actualizados.');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo guardar.');
    } finally {
      setSavingFisico(false);
    }
  };

  // ── AGREGAR VIDEO ────────────────────────────────────────────────────
  const agregarVideo = async () => {
    if (!videoUrl.trim()) return;
    const esPro = perfil?.plan === 'pro';
    if (!esPro && videos.length >= 1) {
      Alert.alert('LÍMITE ALCANZADO', 'Necesitás el plan PRO para subir más de un video.');
      return;
    }
    setAddingVideo(true);
    try {
      const nuevo = await apiJugador.agregarVideo({
        url: videoUrl.trim(),
        titulo: 'VIDEO ' + (videos.length + 1),
        es_highlight: videos.length === 0,
      });
      const nuevosVideos = [...videos, nuevo];
      setVideos(nuevosVideos);
      setVideoUrl('');
      // Persistir videos en el perfil cacheado
      const perfilNuevo = { ...(perfil ?? {}), videos: nuevosVideos };
      setPerfil(perfilNuevo);
      await persistirUser(user, setUser, perfilNuevo);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo agregar el video.');
    } finally {
      setAddingVideo(false);
    }
  };

  // ── ELIMINAR VIDEO ───────────────────────────────────────────────────
  const eliminarVideo = async (id: number) => {
    try {
      await apiJugador.eliminarVideo(id);
      const nuevosVideos = videos.filter((v) => v.id !== id);
      setVideos(nuevosVideos);
      const perfilNuevo = { ...(perfil ?? {}), videos: nuevosVideos };
      setPerfil(perfilNuevo);
      await persistirUser(user, setUser, perfilNuevo);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'No se pudo eliminar el video.');
    }
  };

  // ── ABRIR VIDEO ──────────────────────────────────────────────────────
  const abrirVideo = async (url?: string | null) => {
    if (!url) return;
    const ok = await Linking.canOpenURL(url);
    if (ok) await Linking.openURL(url);
    else Alert.alert('Error', 'No se pudo abrir el enlace.');
  };

  // ── SHARE BOTTOM-SHEET ───────────────────────────────────────────────
  const openShare = () => {
    setShareModal(true);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
  };
  const closeShare = () => {
    Animated.timing(slideAnim, { toValue: 400, duration: 250, useNativeDriver: true })
      .start(() => setShareModal(false));
  };

  // ── DATOS DERIVADOS ──────────────────────────────────────────────────
  const nombre = user?.nombre ?? '—';
  const apellido = user?.apellido ?? '';
  const p = perfil ?? ({} as PerfilJugador);

  const piernaMostrar = p.pierna_habil
    ? p.pierna_habil.charAt(0).toUpperCase() + p.pierna_habil.slice(1)
    : '—';

  // fotoUri: primero foto local (preview), luego foto del servidor, luego nada
  const fotoServidor = urlFoto(p.foto_perfil);
  const fotoUri = fotoLocal ?? fotoServidor;

  const esPro = p.plan === 'pro';

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primaryFixed} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* ── TOP NAV — SafeAreaView maneja Dynamic Island automáticamente ── */}
      <SafeAreaView edges={['top']} style={styles.topNav}>
        <Text style={styles.topNavLogo}>GOLCONNECT</Text>
        <View style={styles.topNavRight}>
          <Pressable style={styles.enviarCvBtn} onPress={openShare}>
            <Text style={styles.enviarCvText}>Enviar CV</Text>
          </Pressable>
          <Pressable onPress={() => setLogoutModal(true)} style={styles.avatarCircle}>
            {fotoLocal
              ? <Image source={{ uri: fotoLocal }} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
              : <AvatarImage fotoPath={p.foto_perfil} size={36} iconSize={22} style={{ borderWidth: 0 }} />}
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── HERO ── */}
        <View style={styles.hero}>
          {fotoUri && !heroImagenRota
            ? <Image
                source={{ uri: fotoUri }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
                onError={() => setHeroImagenRota(true)}
              />
            : <View style={[StyleSheet.absoluteFill, styles.heroPlaceholder]}>
                <Icon name="person" size={80} color="rgba(255,255,255,0.08)" />
              </View>}
          <View style={styles.heroGradient} />
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>PERFIL PROFESIONAL</Text></View>
            <Text style={styles.heroName}>{`${nombre} ${apellido}`.toUpperCase()}</Text>
            <View style={styles.heroMeta}>
              <Text style={styles.heroPos}>{p.posicion_principal ?? 'Jugador'}</Text>
              {p.club_actual && <><View style={styles.heroDot} /><Text style={styles.heroClub}>{p.club_actual}</Text></>}
            </View>
          </View>
          <View style={styles.heroBtns}>
            <Pressable style={styles.heroBtnPrimary} onPress={openShare}>
              <Text style={styles.heroBtnPrimaryText}>COMPARTIR MI CV</Text>
            </Pressable>
            <Pressable style={styles.heroBtnIcon} onPress={openShare}>
              <Icon name="share" size={20} color={colors.primaryFixed} />
            </Pressable>
          </View>
        </View>

        {/* ── CAMBIAR FOTO ── */}
        <View style={styles.px}>
          <Pressable style={styles.cambiarFotoBtn} onPress={abrirGaleriaFoto}>
            <Icon name="photo_camera" size={18} color={colors.onPrimaryFixed} />
            <Text style={styles.cambiarFotoText}>Cambiar foto de perfil</Text>
          </Pressable>
        </View>

        {/* ── FÍSICO Y TÁCTICO ── */}
        <View style={[styles.px, styles.section]}>
          <View style={styles.glassCard}>
            <View style={styles.sectionTitleRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.sectionHeadLine} />
                <Text style={styles.sectionTitle}>Perfil Físico y Táctico</Text>
              </View>
              <Pressable style={styles.editChip} onPress={() => setEditFisicoModal(true)}>
                <Icon name="edit" size={14} color={colors.onPrimaryFixed} />
                <Text style={styles.editChipText}>Editar</Text>
              </Pressable>
            </View>
            <View style={styles.physGrid}>
              <PhysBox icon="straighten" value={p.altura_cm ? `${p.altura_cm}cm` : '—'} label="Altura" />
              <PhysBox icon="monitor_weight" value={p.peso_kg ? `${p.peso_kg}kg` : '—'} label="Peso" />
              <PhysBox icon="sports_soccer" value={p.posicion_principal?.split(' ')[0] ?? '—'} label="Posición" />
              <PhysBox icon="footprint" value={piernaMostrar} label="Pie Hábil" />
            </View>
          </View>
          <View style={styles.seasonCard}>
            <Text style={styles.seasonTitle}>Temporada</Text>
            <SeasonRow label="Partidos" value={p.temporada_partidos ?? 0} />
            <SeasonRow label="Goles" value={p.temporada_goles ?? 0} />
            <SeasonRow label="Asistencias" value={p.temporada_asistencias ?? 0} last />
          </View>
        </View>

        {/* ── ESTADÍSTICAS ── */}
        <View style={[styles.px, styles.section]}>
          <View style={styles.glassCard}>
            <View style={styles.visibHead}>
              <Text style={styles.sectionTitle}>Estadísticas de Visibilidad</Text>
              <View style={styles.liveChip}>
                <Icon name="radar" size={14} color={colors.primaryFixed} />
                <Text style={styles.liveText}>Live Data</Text>
              </View>
            </View>
            <Text style={styles.subsectionLabel}>Visitas a tu perfil (últimos 30 días)</Text>
            <MiniChart />
            <Text style={[styles.subsectionLabel, { marginTop: 20 }]}>Clubes Interesados</Text>
            <View style={styles.clubsRow}>
              {['Ajax', 'Porto'].map((c) => (
                <View key={c} style={styles.clubChip}>
                  <Icon name="shield" size={14} color={colors.primaryFixed} />
                  <Text style={styles.clubChipText}>{c}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.subsectionLabel, { marginTop: 20 }]}>Ubicación de las búsquedas</Text>
            {([['Spain', 45], ['England', 20], ['Italy', 15], ['Germany', 10]] as [string, number][]).map(([c, pt]) => (
              <GeoBar key={c} country={c} pct={pt} />
            ))}
          </View>
        </View>

        {/* ── SUSCRIPCIÓN ── */}
        <View style={[styles.px, styles.section]}>
          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>Gestión de Suscripción</Text>
            <Text style={styles.subsectionLabel}>Plan Actual</Text>
            <View style={styles.planRow}>
              <View style={styles.planRowLeft}>
                <View style={styles.planCheck}><Icon name="check_circle" size={16} color={colors.primaryFixed} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>{esPro ? 'Suscripción Plan Pro (Mensual)' : 'Plan Amateur (Gratuito)'}</Text>
                  <Text style={styles.planSub}>{esPro ? 'Activa' : 'Actualizá para todas las funciones'}</Text>
                </View>
              </View>
              {esPro && (
                <Pressable style={styles.cancelSubBtn} onPress={() => setCancelModal(true)}>
                  <Text style={styles.cancelSubText}>Cancelar</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* ── CONTACTO ── */}
        <View style={[styles.px, styles.section]}>
          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>Información de Contacto</Text>
            <ContactField icon="chat" label="WhatsApp" value={user?.whatsapp ?? ''}
              onSave={(val) => apiJugador.actualizarPerfil({ whatsapp: val }).catch(() => {})} />
            <View style={{ height: 12 }} />
            <ContactField icon="mail" label="Email" value={user?.email ?? ''} onSave={() => {}} />
          </View>
        </View>

        {/* ── GALERÍA MULTIMEDIA ── */}
        <View style={[styles.px, styles.section]}>
          <View style={styles.galleryHeader}>
            <Text style={styles.sectionTitle}>Galería Multimedia</Text>
            <Pressable onPress={() => setGalleryModal(true)}>
              <Text style={styles.editLink}>EDITAR</Text>
            </Pressable>
          </View>

          {videos.length === 0 ? (
            <Pressable style={styles.emptyGallery} onPress={() => setGalleryModal(true)}>
              <Icon name="video_library" size={36} color={colors.outlineVariant} />
              <Text style={styles.emptyGalleryText}>Tocá EDITAR para subir tu primer video</Text>
            </Pressable>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              {videos.map((v, i) => {
                const thumb = miniatura(v.url);
                return (
                  <Pressable key={v.id ?? i} onPress={() => abrirVideo(v.url)}
                    style={[styles.galleryItem, i > 0 && { marginLeft: 12 }]}>
                    {thumb
                      ? <Image source={{ uri: thumb }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                      : <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceContainerHighest }]} />}
                    <View style={styles.galleryPlayOverlay}>
                      <View style={styles.galleryPlayBtn}>
                        <Icon name="play_arrow" size={28} color={colors.onPrimaryFixed} />
                      </View>
                    </View>
                    <View style={styles.galleryCaption}>
                      <Text style={styles.galleryCaptionText} numberOfLines={1}>{v.titulo ?? 'VIDEO'}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

      </ScrollView>

      <BottomNav active="profile" variant="jugador" onNavigate={(v) => v !== 'profile' && onNavigate(v)} />

      {/* ══════════ MODALES ══════════ */}

      {/* Modal: editar físico */}
      <Modal visible={editFisicoModal} onClose={() => setEditFisicoModal(false)} maxWidth={420}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={styles.modalTitle}>Editar Perfil Físico</Text>
          <Pressable onPress={() => setEditFisicoModal(false)}>
            <Icon name="close" size={22} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>
        <View style={styles.editFisicoGrid}>
          <View style={{ flex: 1 }}>
            <Text style={styles.editFisicoLabel}>Altura (cm)</Text>
            <TextInput style={styles.editFisicoInput} value={editAltura} onChangeText={setEditAltura} keyboardType="numeric" placeholder="185" placeholderTextColor={colors.outline} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.editFisicoLabel}>Peso (kg)</Text>
            <TextInput style={styles.editFisicoInput} value={editPeso} onChangeText={setEditPeso} keyboardType="numeric" placeholder="78" placeholderTextColor={colors.outline} />
          </View>
        </View>
        <Text style={styles.editFisicoLabel}>Pierna Hábil</Text>
        <View style={styles.piernaRow}>
          {['zurdo', 'diestro', 'ambidiestro'].map((op) => (
            <Pressable key={op} onPress={() => setEditPierna(op)}
              style={[styles.piernaBtn, editPierna === op && styles.piernaBtnSel]}>
              <Text style={[styles.piernaBtnText, editPierna === op && { color: colors.onPrimaryFixed }]}>
                {op.charAt(0).toUpperCase() + op.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.editFisicoLabel}>Posición Principal</Text>
        <TextInput style={styles.editFisicoInput} value={editPosP} onChangeText={setEditPosP} placeholder="Ej. Delantero Centro" placeholderTextColor={colors.outline} />
        <Text style={styles.editFisicoLabel}>Posición Secundaria</Text>
        <TextInput style={styles.editFisicoInput} value={editPosS} onChangeText={setEditPosS} placeholder="Ej. Media Punta" placeholderTextColor={colors.outline} />
        <Text style={[styles.editFisicoLabel, { marginTop: 8 }]}>Temporada actual</Text>
        <View style={styles.editFisicoGrid}>
          <View style={{ flex: 1 }}>
            <Text style={styles.editFisicoLabel}>Partidos</Text>
            <TextInput style={styles.editFisicoInput} value={editPartidos} onChangeText={setEditPartidos} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.outline} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.editFisicoLabel}>Goles</Text>
            <TextInput style={styles.editFisicoInput} value={editGoles} onChangeText={setEditGoles} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.outline} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.editFisicoLabel}>Asistencias</Text>
            <TextInput style={styles.editFisicoInput} value={editAsistencias} onChangeText={setEditAsistencias} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.outline} />
          </View>
        </View>
        <View style={styles.modalBtns}>
          <Pressable style={[styles.modalBtnPrimary, savingFisico && { opacity: 0.6 }]} onPress={guardarFisico} disabled={savingFisico}>
            <Text style={styles.modalBtnPrimaryText}>{savingFisico ? 'Guardando...' : 'Guardar Cambios'}</Text>
          </Pressable>
          <Pressable style={styles.modalBtnOutline} onPress={() => setEditFisicoModal(false)}>
            <Text style={styles.modalBtnOutlineText}>Cancelar</Text>
          </Pressable>
        </View>
      </Modal>

      {/* Modal: galería */}
      <Modal visible={galleryModal} onClose={() => setGalleryModal(false)} maxWidth={420}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={styles.modalTitle}>Gestionar Galería</Text>
          <Pressable onPress={() => setGalleryModal(false)}><Icon name="close" size={22} color={colors.onSurfaceVariant} /></Pressable>
        </View>
        <Text style={styles.subsectionLabel}>Añadir Nuevo Video</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 20 }}>
          <TextInput style={styles.galleryInput} value={videoUrl} onChangeText={setVideoUrl}
            placeholder="https://www.youtube.com/watch?v=..." placeholderTextColor="rgba(196,201,172,0.4)" />
          <Pressable style={[styles.addVideoBtn, addingVideo && { opacity: 0.6 }]} onPress={agregarVideo} disabled={addingVideo}>
            <Text style={styles.addVideoBtnText}>{addingVideo ? '...' : 'Añadir'}</Text>
          </Pressable>
        </View>
        <Text style={styles.subsectionLabel}>Videos Actuales</Text>
        {videos.length === 0 && <Text style={[styles.modalBody, { marginVertical: 8 }]}>No tenés videos cargados todavía.</Text>}
        {videos.map((v) => (
          <View key={v.id} style={styles.galleryVideoRow}>
            <Pressable onPress={() => abrirVideo(v.url)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <Icon name="play_circle" size={20} color={colors.primaryFixed} />
              <Text style={{ flex: 1, fontFamily: fonts.inter, fontSize: 13, color: colors.onSurface }} numberOfLines={1}>
                {v.titulo ?? v.url}
              </Text>
            </Pressable>
            <Pressable style={styles.deleteVideoBtn} onPress={() => {
              Alert.alert('¿Eliminar video?', '', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => eliminarVideo(v.id) },
              ]);
            }}>
              <Icon name="delete" size={18} color={colors.onErrorContainer} />
            </Pressable>
          </View>
        ))}
        <View style={[styles.modalBtns, { marginTop: 20 }]}>
          <Pressable style={styles.modalBtnPrimary} onPress={() => setGalleryModal(false)}>
            <Text style={styles.modalBtnPrimaryText}>Guardar cambios</Text>
          </Pressable>
          <Pressable style={styles.modalBtnOutline} onPress={() => setGalleryModal(false)}>
            <Text style={styles.modalBtnOutlineText}>Cerrar</Text>
          </Pressable>
        </View>
      </Modal>

      {/* Modal: cancelar suscripción */}
      <Modal visible={cancelModal} onClose={() => setCancelModal(false)} maxWidth={380}>
        <Text style={styles.modalTitle}>¿Cancelar suscripción?</Text>
        <Text style={styles.modalBody}>Perderás acceso a las estadísticas avanzadas y visibilidad premium.</Text>
        <View style={styles.modalBtns}>
          <Pressable style={styles.modalBtnPrimary} onPress={() => setCancelModal(false)}>
            <Text style={styles.modalBtnPrimaryText}>Sí, cancelar</Text>
          </Pressable>
          <Pressable style={styles.modalBtnOutline} onPress={() => setCancelModal(false)}>
            <Text style={styles.modalBtnOutlineText}>Volver</Text>
          </Pressable>
        </View>
      </Modal>

      {/* Modal: logout */}
      <Modal visible={logoutModal} onClose={() => setLogoutModal(false)} maxWidth={320}>
        <Text style={[styles.modalTitle, { textAlign: 'center', marginBottom: 16 }]}>Sesión</Text>
        <Pressable style={styles.logoutBtn}
          onPress={async () => { await logout(); setLogoutModal(false); onNavigate('landing'); }}>
          <Icon name="logout" size={20} color={colors.onSurface} />
          <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
        </Pressable>
        <Pressable style={{ alignItems: 'center', marginTop: 12 }} onPress={() => setLogoutModal(false)}>
          <Text style={styles.modalBody}>Cancelar</Text>
        </Pressable>
      </Modal>

      {/* Share bottom-sheet */}
      <RNModal visible={shareModal} transparent animationType="none" onRequestClose={closeShare}>
        <Pressable style={styles.shareOverlay} onPress={closeShare}>
          <Animated.View style={[styles.shareSheet, { transform: [{ translateY: slideAnim }] }]}>
            <Pressable onPress={() => {}}>
              <View style={styles.shareHeader}>
                <Text style={styles.modalTitle}>Compartir CV</Text>
                <Pressable onPress={closeShare}><Icon name="close" size={22} color={colors.onSurfaceVariant} /></Pressable>
              </View>
              <View style={styles.shareGrid}>
                {[
                  { icon: 'chat', label: 'WhatsApp', url: 'https://wa.me/' },
                  { icon: 'mail', label: 'Gmail', url: 'mailto:' },
                  { icon: 'alternate_email', label: 'Twitter', url: 'https://twitter.com/' },
                  { icon: 'photo_camera', label: 'Instagram', url: 'https://instagram.com/' },
                ].map(({ icon, label, url }) => (
                  <Pressable key={label} style={styles.shareItem} onPress={() => Linking.openURL(url).catch(() => {})}>
                    <View style={styles.shareItemIcon}><Icon name={icon} size={24} color={colors.onSurface} /></View>
                    <Text style={styles.shareItemLabel}>{label}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable style={styles.copyLinkBtn} onPress={() => { Alert.alert('✓', 'Enlace copiado al portapapeles.'); closeShare(); }}>
                <Icon name="link" size={20} color={colors.onSurface} />
                <Text style={styles.copyLinkText}>Copiar Enlace</Text>
              </Pressable>
              <Pressable style={{ alignItems: 'center', marginTop: 12 }} onPress={closeShare}>
                <Text style={styles.modalBody}>Cancelar</Text>
              </Pressable>
            </Pressable>
          </Animated.View>
        </Pressable>
      </RNModal>

    </View>
  );
}

// ═══ ESTILOS ════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: 'rgba(18,20,20,0.97)' },
  topNavLogo: { fontFamily: fonts.oswaldMedium, fontSize: 22, color: colors.primaryFixed, letterSpacing: 1 },
  topNavRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  enviarCvBtn: { backgroundColor: colors.primaryFixed, paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999 },
  enviarCvText: { fontFamily: fonts.interBold, fontSize: 12, color: colors.onPrimaryFixed, textTransform: 'uppercase', letterSpacing: 0.8 },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceContainerHighest, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },

  hero: { height: 400, justifyContent: 'flex-end' },
  heroPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceContainerHighest },
  heroGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18,20,20,0.5)' },
  heroContent: { padding: 20, paddingBottom: 12 },
  heroBadge: { alignSelf: 'flex-start', backgroundColor: colors.primaryFixed, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, marginBottom: 10 },
  heroBadgeText: { fontFamily: fonts.interBold, fontSize: 11, color: colors.onPrimaryFixed, letterSpacing: 1.5 },
  heroName: { fontFamily: fonts.oswaldBold, fontSize: 38, lineHeight: 42, color: colors.white, textTransform: 'uppercase' },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  heroPos: { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.primaryFixed, textTransform: 'uppercase', letterSpacing: 2 },
  heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.outline },
  heroClub: { fontFamily: fonts.interBold, fontSize: 13, color: colors.onSurfaceVariant },
  heroBtns: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 14 },
  heroBtnPrimary: { flex: 1, backgroundColor: colors.primaryFixed, paddingVertical: 14, borderRadius: 6, alignItems: 'center' },
  heroBtnPrimaryText: { fontFamily: fonts.interBold, fontSize: 12, color: colors.onPrimaryFixed, textTransform: 'uppercase', letterSpacing: 1.5 },
  heroBtnIcon: { padding: 14, borderWidth: 1, borderColor: colors.primaryFixed, borderRadius: 6 },

  px: { paddingHorizontal: 16 },
  cambiarFotoBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primaryFixed, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 6, marginTop: 14 },
  cambiarFotoText: { fontFamily: fonts.interBold, fontSize: 13, color: colors.onPrimaryFixed, textTransform: 'uppercase', letterSpacing: 1 },

  section: { marginTop: 28 },
  glassCard: { backgroundColor: 'rgba(30,32,32,0.88)', borderWidth: 1, borderColor: 'rgba(195,244,0,0.1)', borderRadius: 16, padding: 20 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionHeadLine: { width: 4, height: 22, backgroundColor: colors.primaryFixed, borderRadius: 2 },
  sectionTitle: { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.white, textTransform: 'uppercase' },
  editChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryFixed, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  editChipText: { fontFamily: fonts.interBold, fontSize: 11, color: colors.onPrimaryFixed, textTransform: 'uppercase' },
  subsectionLabel: { fontFamily: fonts.interBold, fontSize: 11, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },

  physGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  physBox: { width: (SW - 64) / 2, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8, backgroundColor: 'rgba(51,53,53,0.3)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(68,73,51,0.3)' },
  physValue: { fontFamily: fonts.oswaldMedium, fontSize: 22, color: colors.white, marginTop: 6 },
  physLabel: { fontFamily: fonts.interBold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 2 },

  seasonCard: { backgroundColor: colors.surfaceContainer, borderRadius: 14, padding: 20, borderWidth: 1, borderColor: colors.outlineVariant, marginTop: 12 },
  seasonTitle: { fontFamily: fonts.interBold, fontSize: 11, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 },
  seasonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 10, marginBottom: 10 },
  seasonRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  seasonLabel: { fontFamily: fonts.interBold, fontSize: 14, color: colors.white },
  seasonValue: { fontFamily: fonts.oswaldMedium, fontSize: 26, color: colors.primaryFixed },

  visibHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  liveChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(51,53,53,0.4)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(195,244,0,0.2)' },
  liveText: { fontFamily: fonts.interBold, fontSize: 11, color: colors.white, letterSpacing: 0.5 },
  chartWrap: { height: 110, marginTop: 10, marginBottom: 4 },
  chartBars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  chartBar: { flex: 1, backgroundColor: colors.primaryFixed, borderRadius: 3, opacity: 0.8 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, borderTopWidth: 1, borderTopColor: 'rgba(68,73,51,0.2)', paddingTop: 4 },
  chartLabel: { fontFamily: fonts.interBold, fontSize: 9, color: colors.onSurfaceVariant, textTransform: 'uppercase' },
  clubsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  clubChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(51,53,53,0.2)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 6 },
  clubChipText: { fontFamily: fonts.interBold, fontSize: 12, color: colors.white },
  geoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  geoCountry: { fontFamily: fonts.inter, fontSize: 13, color: colors.white, width: 60 },
  geoTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(51,53,53,0.6)', overflow: 'hidden' },
  geoFill: { height: '100%', backgroundColor: colors.primaryFixed, borderRadius: 3 },
  geoPct: { fontFamily: fonts.interBold, fontSize: 12, color: colors.primaryFixed, width: 34, textAlign: 'right' },

  planRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: 'rgba(51,53,53,0.2)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(68,73,51,0.3)', marginTop: 8 },
  planRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  planCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(195,244,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  planName: { fontFamily: fonts.interBold, fontSize: 13, color: colors.white },
  planSub: { fontFamily: fonts.inter, fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
  cancelSubBtn: { paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 6 },
  cancelSubText: { fontFamily: fonts.interBold, fontSize: 11, color: colors.white, textTransform: 'uppercase' },

  contactCard: { backgroundColor: 'rgba(51,53,53,0.2)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(195,244,0,0.3)' },
  contactTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  contactIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(195,244,0,0.15)', alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontFamily: fonts.interBold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  contactValue: { fontFamily: fonts.interBold, fontSize: 14, color: colors.white },
  contactInput: { fontFamily: fonts.interBold, fontSize: 14, color: colors.white, borderBottomWidth: 1, borderBottomColor: colors.primaryFixed, paddingVertical: 4 },
  contactBtns: { flexDirection: 'row', gap: 8 },
  contactBtnPrimary: { flex: 1, backgroundColor: colors.primaryFixed, paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  contactBtnPrimaryText: { fontFamily: fonts.interBold, fontSize: 11, color: colors.onPrimaryFixed, textTransform: 'uppercase', letterSpacing: 1 },
  contactBtnOutline: { flex: 1, borderWidth: 1, borderColor: colors.outlineVariant, paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  contactBtnOutlineText: { fontFamily: fonts.interBold, fontSize: 11, color: colors.white, textTransform: 'uppercase', letterSpacing: 1 },

  galleryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  editLink: { fontFamily: fonts.interBold, fontSize: 13, color: colors.primaryFixed },
  emptyGallery: { alignItems: 'center', paddingVertical: 36, gap: 10, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.outlineVariant, borderRadius: 14, marginTop: 12 },
  emptyGalleryText: { fontFamily: fonts.inter, fontSize: 14, color: colors.onSurfaceVariant },
  galleryItem: { width: 280, height: 180, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerHighest },
  galleryPlayOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)' },
  galleryPlayBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  galleryCaption: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, backgroundColor: 'rgba(0,0,0,0.55)' },
  galleryCaptionText: { fontFamily: fonts.interBold, fontSize: 12, color: colors.white, textTransform: 'uppercase' },

  modalTitle: { fontFamily: fonts.oswaldMedium, fontSize: 22, color: colors.white, textTransform: 'uppercase' },
  modalBody: { fontFamily: fonts.inter, fontSize: 14, color: colors.onSurfaceVariant, marginTop: 8, lineHeight: 20 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalBtnPrimary: { flex: 1, backgroundColor: colors.primaryFixed, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  modalBtnPrimaryText: { fontFamily: fonts.interBold, fontSize: 12, color: colors.onPrimaryFixed, textTransform: 'uppercase', letterSpacing: 1 },
  modalBtnOutline: { flex: 1, borderWidth: 1, borderColor: colors.outlineVariant, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  modalBtnOutlineText: { fontFamily: fonts.interBold, fontSize: 12, color: colors.white, textTransform: 'uppercase', letterSpacing: 1 },

  uploadZone: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.primaryFixed, borderRadius: 14, paddingVertical: 36, alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 4 },
  uploadPreview: { width: 80, height: 80, borderRadius: 40, marginBottom: 4 },
  uploadZoneText: { fontFamily: fonts.interBold, fontSize: 13, color: colors.primaryFixed, textTransform: 'uppercase', textAlign: 'center' },

  editFisicoGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  editFisicoLabel: { fontFamily: fonts.interBold, fontSize: 11, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5, marginTop: 4 },
  editFisicoInput: { backgroundColor: colors.surfaceContainerHigh, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, color: colors.white, fontFamily: fonts.inter, fontSize: 14, marginBottom: 2 },
  piernaRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  piernaBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: colors.surfaceContainerHigh, borderWidth: 1, borderColor: colors.outlineVariant },
  piernaBtnSel: { backgroundColor: colors.primaryFixedDim, borderColor: colors.primaryFixedDim },
  piernaBtnText: { fontFamily: fonts.interBold, fontSize: 12, color: colors.onSurfaceVariant, textTransform: 'uppercase' },

  galleryInput: { flex: 1, backgroundColor: colors.surfaceContainerLow, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, color: colors.white, fontFamily: fonts.inter, fontSize: 14 },
  addVideoBtn: { backgroundColor: colors.primaryFixed, paddingHorizontal: 18, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  addVideoBtnText: { fontFamily: fonts.interBold, fontSize: 12, color: colors.onPrimaryFixed, textTransform: 'uppercase' },
  galleryVideoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  deleteVideoBtn: { backgroundColor: colors.errorContainer, padding: 8, borderRadius: 999 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(51,53,53,0.4)', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.outlineVariant },
  logoutBtnText: { fontFamily: fonts.interBold, fontSize: 13, color: colors.onSurface, textTransform: 'uppercase', letterSpacing: 1 },

  shareOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  shareSheet: { backgroundColor: 'rgba(30,32,32,0.98)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderColor: 'rgba(68,73,51,0.3)' },
  shareHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  shareGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  shareItem: { alignItems: 'center', gap: 8 },
  shareItemIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  shareItemLabel: { fontFamily: fonts.interBold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase' },
  copyLinkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(51,53,53,0.4)', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.outlineVariant },
  copyLinkText: { fontFamily: fonts.interBold, fontSize: 12, color: colors.onSurface, textTransform: 'uppercase', letterSpacing: 1 },
});
