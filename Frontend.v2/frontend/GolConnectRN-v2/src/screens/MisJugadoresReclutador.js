import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView,
  ActivityIndicator, TextInput, Alert, Linking, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav, Modal } from '../components/chrome';
import Icon from '../components/Icon';
import AvatarImage from '../components/AvatarImage';
import { useNavigate } from '../navigation/useNavigate';
import { reclutador as apiRec, API_BASE_URL } from '../api';
import { colors, fonts } from '../theme';

// Estado → color del borde izquierdo
const ESTADO_CFG = {
  oferta_pendiente: { label: 'Oferta Pendiente', color: colors.primaryFixed,       dot: colors.primaryFixed       },
  reunion_agendada: { label: 'Reunión Agendada', color: '#C8C6C5',                  dot: '#C8C6C5'                 },
  mensaje_enviado:  { label: 'Mensaje Enviado',  color: colors.outline,             dot: colors.outline            },
  en_revision:      { label: 'En Revisión',      color: '#FFC400',                  dot: '#FFC400'                 },
  cerrado:          { label: 'Cerrado',           color: colors.outlineVariant,      dot: colors.outlineVariant     },
};

// ── Row de jugador ─────────────────────────────────────────────────────────
function JugadorRow({ contacto, onVerDetalle, onEmail, onWhatsApp }) {
  const jugador = contacto.jugador ?? {};
  const u       = jugador.user    ?? {};
  const nombre  = `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim() || 'Jugador';
  const posicion = jugador.posicion_principal ?? jugador.posicion ?? 'Sin posición';
  const club     = jugador.club_actual ?? '—';

  const fechaRaw = contacto.created_at ?? contacto.fecha_contacto;
  const fecha    = fechaRaw
    ? new Date(fechaRaw).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const cfg = ESTADO_CFG[contacto.estado] ?? ESTADO_CFG.mensaje_enviado;

  return (
    <Pressable
      style={[styles.row, { borderLeftColor: cfg.color }]}
      onPress={onVerDetalle}
    >
      {/* Avatar */}
      <AvatarImage
        fotoPath={jugador.foto_perfil}
        apiBaseUrl={API_BASE_URL}
        size={52}
        iconSize={22}
        style={{ borderWidth: 1, borderColor: colors.outlineVariant }}
      />

      {/* Datos */}
      <View style={styles.rowInfo}>
        <Text style={styles.rowNombre}>{nombre}</Text>
        <Text style={styles.rowSub}>{posicion} • {club}</Text>

      </View>

      {/* Meta + estado */}
      <View style={styles.rowMeta}>
        <View>
          <Text style={styles.rowMetaLabel}>Último Contacto</Text>
          <Text style={styles.rowMetaValue}>{fecha}</Text>
        </View>
        <View>
          <Text style={styles.rowMetaLabel}>Estado</Text>
          <View style={styles.estadoRow}>
            <View style={[styles.estadoDot, { backgroundColor: cfg.dot }]} />
            <Text style={[styles.estadoText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
      </View>

      {/* Acciones */}
      <View style={styles.rowActions}>
        <Pressable style={styles.actionBtn} onPress={onEmail} hitSlop={6}>
          <Icon name="mail" size={20} color={colors.onSurface} />
        </Pressable>
        <Pressable style={[styles.actionBtn, { borderColor: '#25D366' }]} onPress={onWhatsApp} hitSlop={6}>
          <Icon name="chat" size={20} color="#25D366" />
        </Pressable>
        <Pressable style={styles.verBtn} onPress={onVerDetalle}>
          <Text style={styles.verBtnText}>Ver Detalles</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

// ── Stats mini ─────────────────────────────────────────────────────────────
function StatMini({ label, value, subLabel, icon }) {
  return (
    <View style={styles.statMini}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={styles.statMiniLabel}>{label}</Text>
        <Icon name={icon} size={20} color={colors.primaryFixed} />
      </View>
      <Text style={styles.statMiniValue}>{value}</Text>
      <Text style={styles.statMiniSub}>{subLabel}</Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function MisJugadoresReclutador() {
  const onNavigate = useNavigate();

  const [lista, setLista]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [logoutModal, setLogoutModal] = useState(false);

  useEffect(() => {
    apiRec.misJugadores()
      .then(data => setLista(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtrada = lista.filter(c => {
    const jugador = c.jugador ?? {};
    const u       = jugador.user ?? {};
    const txt     = `${u.nombre} ${u.apellido} ${jugador.club_actual ?? ''}`.toLowerCase();
    return txt.includes(busqueda.toLowerCase());
  });

  const abrirEmail = (c) => {
    const u = c.jugador?.user ?? {};
    if (u.email) Linking.openURL(`mailto:${u.email}`);
    else Alert.alert('Sin email', 'El jugador no tiene email registrado.');
  };

  const abrirWhatsApp = (c) => {
    const wa = c.jugador?.user?.whatsapp?.replace(/\D/g, '');
    if (wa) Linking.openURL(`https://wa.me/${wa}`);
    else Alert.alert('Sin WhatsApp', 'El jugador no tiene WhatsApp registrado.');
  };

  const mensajesEnviados = lista.length;
  const reuniones        = lista.filter(c => c.estado === 'reunion_agendada').length;
  const ofertas          = lista.filter(c => c.estado === 'oferta_pendiente').length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── HEADER ── */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.headerLogo}>GolConnect</Text>
        <Pressable onPress={() => setLogoutModal(true)} style={styles.avatarBtn}>
          <Icon name="account_circle" size={24} color={colors.onSurfaceVariant} />
        </Pressable>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        <View style={styles.px}>
          {/* Dashboard header */}
          <Text style={styles.pageTitle}>Gestión de Contactos</Text>
          <Text style={styles.pageSub}>Seguimiento de relaciones con prospectos y negociaciones activas.</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatMini label="Mensajes Enviados" value={String(mensajesEnviados).padStart(2,'0')} subLabel="+12% esta semana" icon="send" />
            <StatMini label="Reuniones"         value={String(reuniones).padStart(2,'0')}        subLabel={`${reuniones} pendientes`}   icon="calendar_today" />
            <StatMini label="Ofertas"           value={String(ofertas).padStart(2,'0')}           subLabel="En revisión técnica"         icon="description" />
          </View>

          {/* Buscador */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Icon name="search" size={20} color={colors.onSurfaceVariant} />
              <TextInput
                style={styles.searchInput}
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder="Buscar jugador por nombre o club..."
                placeholderTextColor="rgba(196,201,172,0.4)"
              />
            </View>
            <Pressable style={styles.filterBtn}>
              <Icon name="filter_list" size={18} color={colors.onPrimaryFixed} />
              <Text style={styles.filterBtnText}>Filtrar</Text>
            </Pressable>
          </View>

          {/* Lista */}
          {loading ? (
            <ActivityIndicator color={colors.primaryFixed} style={{ marginTop: 48 }} size="large" />
          ) : filtrada.length === 0 ? (
            <View style={styles.empty}>
              <Icon name="group" size={48} color={colors.outlineVariant} />
              <Text style={styles.emptyText}>
                {busqueda ? 'No se encontraron jugadores.' : 'Todavía no contactaste ningún jugador.'}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 14 }}>
              {filtrada.map(c => (
                <JugadorRow
                  key={c.id}
                  contacto={c}
                  onVerDetalle={() => {
                    const jId = c.jugador?.id;
                    if (jId) onNavigate('detalle-candidato', { jugadorId: jId });
                  }}
                  onEmail={() => abrirEmail(c)}
                  onWhatsApp={() => abrirWhatsApp(c)}
                />
              ))}
              {/* Cargar más */}
              <Pressable style={styles.loadMore}>
                <Text style={styles.loadMoreText}>Cargar más jugadores</Text>
                <Icon name="expand_more" size={18} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNav active="mis-jugadores-reclutador" variant="reclutador" onNavigate={onNavigate} />

      <Modal visible={logoutModal} onClose={() => setLogoutModal(false)} maxWidth={380}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Icon name="logout" size={36} color={colors.primaryFixed} />
          <Text style={styles.logoutTitle}>¿CERRAR SESIÓN?</Text>
          <Text style={styles.logoutBody}>¿Seguro que querés cerrar sesión en GolConnect?</Text>
          <Pressable style={styles.logoutConfirmBtn} onPress={() => { setLogoutModal(false); onNavigate('landing'); }}>
            <Text style={styles.logoutConfirmText}>Cerrar Sesión</Text>
          </Pressable>
          <Pressable style={styles.logoutCancelBtn} onPress={() => setLogoutModal(false)}>
            <Text style={styles.logoutCancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: colors.surface },
  headerLogo:   { fontFamily: fonts.oswaldBold, fontSize: 20, color: colors.primaryFixed, letterSpacing: 0.5 },
  avatarBtn:    { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },

  px:           { paddingHorizontal: 16, paddingTop: 24 },
  pageTitle:    { fontFamily: fonts.oswaldBold, fontSize: 28, color: colors.white, textTransform: 'uppercase' },
  pageSub:      { fontFamily: fonts.inter, fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4, marginBottom: 20, lineHeight: 19 },

  statsRow:     { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statMini:     { flex: 1, backgroundColor: 'rgba(30,32,32,0.7)', borderWidth: 1, borderColor: 'rgba(171,214,0,0.1)', borderRadius: 12, padding: 14 },
  statMiniLabel:{ fontFamily: fonts.interBold, fontSize: 9, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8 },
  statMiniValue:{ fontFamily: fonts.oswaldBold, fontSize: 28, color: colors.white, marginTop: 6 },
  statMiniSub:  { fontFamily: fonts.inter, fontSize: 11, color: colors.primaryFixed, marginTop: 2 },

  searchRow:    { flexDirection: 'row', gap: 10, marginBottom: 20 },
  searchBox:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surfaceContainerHigh, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11 },
  searchInput:  { flex: 1, fontFamily: fonts.inter, fontSize: 14, color: colors.onSurface },
  filterBtn:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primaryFixed, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10 },
  filterBtnText:{ fontFamily: fonts.interBold, fontSize: 13, color: colors.onPrimaryFixed },

  row:          { flexDirection: 'column', gap: 12, backgroundColor: 'rgba(30,32,32,0.7)', borderRadius: 14, padding: 16, borderLeftWidth: 4, borderWidth: 1, borderColor: 'rgba(171,214,0,0.1)' },
  rowAvatar:    { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surfaceContainerHighest, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  rowAvatarImg: { width: '100%', height: '100%' },
  rowInfo:      { flex: 1 },
  rowNombre:    { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.white },
  rowSub:       { fontFamily: fonts.inter, fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
  rowMeta:      { flexDirection: 'row', gap: 24 },
  rowMetaLabel: { fontFamily: fonts.interBold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  rowMetaValue: { fontFamily: fonts.inter, fontSize: 14, color: colors.white, marginTop: 2 },
  estadoRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  estadoDot:    { width: 8, height: 8, borderRadius: 4 },
  estadoText:   { fontFamily: fonts.interBold, fontSize: 12 },
  rowActions:   { flexDirection: 'row', gap: 8, alignItems: 'center' },
  actionBtn:    { padding: 10, backgroundColor: colors.surfaceContainerHighest, borderRadius: 8, borderWidth: 1, borderColor: colors.outlineVariant },
  verBtn:       { flex: 1, backgroundColor: colors.primaryFixed, paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
  verBtnText:   { fontFamily: fonts.interBold, fontSize: 12, color: colors.onPrimaryFixed, textTransform: 'uppercase', letterSpacing: 0.5 },

  empty:        { alignItems: 'center', paddingTop: 60, gap: 14 },
  emptyText:    { fontFamily: fonts.inter, fontSize: 15, color: colors.onSurfaceVariant, textAlign: 'center' },
  loadMore:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16 },
  loadMoreText: { fontFamily: fonts.interBold, fontSize: 13, color: colors.onSurfaceVariant },

  logoutTitle:      { fontFamily: fonts.oswaldBold, fontSize: 20, color: colors.white, textTransform: 'uppercase', letterSpacing: 1 },
  logoutBody:       { fontFamily: fonts.inter, fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
  logoutConfirmBtn: { backgroundColor: colors.primaryFixed, paddingVertical: 14, borderRadius: 10, alignItems: 'center', width: '100%', marginTop: 8 },
  logoutConfirmText:{ fontFamily: fonts.interBold, fontSize: 13, color: colors.onPrimaryFixed, textTransform: 'uppercase', letterSpacing: 0.8 },
  logoutCancelBtn:  { backgroundColor: colors.surfaceContainerHighest, paddingVertical: 14, borderRadius: 10, alignItems: 'center', width: '100%' },
  logoutCancelText: { fontFamily: fonts.interBold, fontSize: 13, color: colors.white, textTransform: 'uppercase', letterSpacing: 0.8 },
});
