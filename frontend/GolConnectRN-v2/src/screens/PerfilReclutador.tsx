import React, { useState, useCallback } from 'react';
import {
  View, Text, Pressable, StyleSheet,
  ScrollView, ActivityIndicator, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav, Modal } from '../components/chrome';
import Icon from '../components/Icon';
import AvatarImage from '../components/AvatarImage';
import { useNavigate } from '../navigation/useNavigate';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { reclutador as apiRec } from '../api';
import { colors, fonts } from '../theme';
import type { PerfilReclutador as PerfilReclutadorType } from '../types';

const SOPORTE_WA = '+5493624003464';

interface DocInfo {
  titulo: string;
  descripcion: string;
}


interface CredCardProps {
  titulo: string;
  subtitulo: string;
  icon: string;
  color: string;
  onVer: () => void;
}

function CredCard({ titulo, subtitulo, icon, color, onVer }: CredCardProps) {
  return (
    <View style={styles.credCard}>
      <View style={[styles.credIcon, { backgroundColor: `${color}22` }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <Text style={styles.credTitle} numberOfLines={1}>{titulo}</Text>
        <Text style={styles.credSub}>{subtitulo}</Text>
      </View>
      <Pressable hitSlop={10} onPress={onVer}>
        <Icon name="visibility" size={20} color={colors.onSurfaceVariant} />
      </Pressable>
    </View>
  );
}


function ContactoCard({ nombre, club }: { nombre: string; club: string }) {
  return (
    <View style={styles.contactoCard}>
      <View style={styles.contactoAvatar}>
        <Icon name="person" size={22} color={colors.onSurfaceVariant} />
      </View>
      <Text style={styles.contactoNombre} numberOfLines={1}>{nombre}</Text>
      <Text style={styles.contactoClub} numberOfLines={1}>{club}</Text>
    </View>
  );
}


export default function PerfilReclutador() {
  const onNavigate = useNavigate();
  const { user, logout } = useAuth();

  const [perfil, setPerfil] = useState<PerfilReclutadorType | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutModal, setLogoutModal] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const [verDocModal, setVerDocModal] = useState<DocInfo | null>(null);

  const cargar = useCallback(() => {
    setLoading(true);
    apiRec.perfil()
      .then((data) => setPerfil(data?.perfilReclutador ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

 
  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  
  const ctxPerfil = user?.perfilReclutador;

  const abrirSoporte = () => {
    const texto = encodeURIComponent('Hola! Necesito soporte con GolConnect.');
    Linking.openURL(`https://wa.me/${SOPORTE_WA.replace(/\D/g, '')}?text=${texto}`);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primaryFixed} size="large" />
      </View>
    );
  }

  // Priorizar datos del contexto (más frescos tras editar) sobre los de la API
  const nombre = user?.nombre ?? '—';
  const apellido = user?.apellido ?? '';
  const cargo = ctxPerfil?.cargo ?? perfil?.cargo ?? 'Reclutador';
  const institucion = ctxPerfil?.institucion ?? perfil?.institucion ?? '—';
  const categoria = ctxPerfil?.categoria ?? perfil?.categoria ?? '';
  const ciudad = ctxPerfil?.ciudad ?? perfil?.ciudad ?? '';
  const pais = ctxPerfil?.pais ?? perfil?.pais ?? '';
  const anios = ctxPerfil?.anios_experiencia ?? perfil?.anios_experiencia ?? 0;
  const fichajes = ctxPerfil?.fichajes_realizados ?? perfil?.fichajes_realizados ?? 0;
  const credenciales = perfil?.credenciales ?? [];
  const ubicacion = [ciudad, pais].filter(Boolean).join(', ');

  // Foto del reclutador — priorizar contexto (recién actualizado) sobre API
  const fotoPath = ctxPerfil?.foto_perfil ?? perfil?.foto_perfil ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── TOP NAV ── */}
      <SafeAreaView edges={['top']} style={styles.topNav}>
        <Text style={styles.topNavLogo}>GOLCONNECT</Text>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── HERO BANNER ── */}
        <View style={styles.heroBanner} />

        {/* ── PERFIL HEADER ── */}
        <View style={styles.profileHead}>
          <View style={styles.avatarWrap}>
            <AvatarImage
              fotoPath={fotoPath}
              size={96}
              iconSize={52}
              style={{ borderRadius: 12, borderWidth: 3, borderColor: colors.background }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{`${nombre} ${apellido}`.trim()}</Text>
            {ubicacion ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Icon name="location_on" size={14} color={colors.onSurfaceVariant} />
                <Text style={styles.profileLocation}>{ubicacion}</Text>
              </View>
            ) : null}
            <Text style={styles.profileRole}>{cargo.toUpperCase()}</Text>
          </View>
          <Pressable style={styles.editBtn} onPress={() => onNavigate('editar-perfil')}>
            <Icon name="edit" size={16} color={colors.onPrimaryFixed} />
            <Text style={styles.editBtnText}>Editar</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 16, marginTop: 8 }}>

          {/* ── INSTITUCIÓN ── */}
          <View style={styles.glassCard}>
            <Text style={styles.cardKicker}>Institución Actual</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 }}>
              <View style={styles.clubLogoBox}>
                <Icon name="shield" size={28} color={colors.primaryFixed} />
              </View>
              <View>
                {/* Nombre real de la institución */}
                <Text style={styles.institutionName}>{institucion}</Text>
                {categoria ? <Text style={styles.institutionDiv}>{categoria}</Text> : null}
              </View>
            </View>
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                {/* Años de experiencia reales */}
                <Text style={styles.metricValue}>{anios}</Text>
                <Text style={styles.metricLabel}>Años de Exp.</Text>
              </View>
              <View style={[styles.metricItem, { borderLeftWidth: 1, borderLeftColor: colors.outlineVariant }]}>
                {/* Fichajes reales */}
                <Text style={styles.metricValue}>{fichajes}+</Text>
                <Text style={styles.metricLabel}>Fichajes</Text>
              </View>
            </View>
          </View>

          {/* ── BÚSQUEDAS FAVORITAS ── */}
          <View style={styles.glassCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.cardKicker}>Búsquedas Favoritas</Text>
              <Icon name="filter_list" size={18} color={colors.primaryFixed} />
            </View>
            {['Extremos Sub-19 - Latam', 'MCD Box-to-Box Europa', 'Porteros Agentes Libres'].map((b) => (
              <Pressable key={b} style={styles.savedFilter} onPress={() => onNavigate('buscar-reclutador')}>
                <Text style={styles.savedFilterText}>{b}</Text>
                <Icon name="chevron_right" size={18} color={colors.outlineVariant} />
              </Pressable>
            ))}
          </View>

          {/* ── RED DE CONTACTOS ── */}
          <View style={styles.glassCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <View>
                <Text style={styles.cardKicker}>Red de Contactos</Text>
                <Text style={styles.cardSubhead}>Scouts y Agencias</Text>
              </View>
              {/* "Ver todos" → va a Mis Jugadores */}
              <Pressable hitSlop={10} onPress={() => onNavigate('mis-jugadores-reclutador')}>
                <Text style={styles.linkText}>Ver todos</Text>
              </Pressable>
            </View>
            <View style={styles.contactosGrid}>
              <ContactoCard nombre="Marc Rossi" club="Inter Milan" />
              <ContactoCard nombre="Elena Gómez" club="Valencia" />
              <ContactoCard nombre="Julian Drax" club="Barcelona" />
              <Pressable style={styles.contactoCardAdd} onPress={() => setInviteModal(true)}>
                <View style={styles.addIcon}><Icon name="add" size={20} color={colors.primaryFixed} /></View>
                <Text style={styles.contactoClub}>Invitar</Text>
              </Pressable>
            </View>
          </View>

          {/* ── CREDENCIALES ── */}
          <View style={styles.glassCard}>
            <Text style={styles.cardKicker}>Credenciales y Documentos</Text>
            {/* Ojito funcional → abre modal de vista previa */}
            <CredCard
              titulo="Licencia UEFA Pro"
              subtitulo="Verificada • Expira 2026"
              icon="badge"
              color={colors.primaryFixed}
              onVer={() => setVerDocModal({
                titulo: 'Licencia UEFA Pro',
                descripcion: 'Licencia oficial UEFA Pro. Válida hasta diciembre 2026.\nID: UEFA-2024-AM\nTitular: ' + `${nombre} ${apellido}`.trim(),
              })}
            />
            <CredCard
              titulo="Certificación Scout AFOP"
              subtitulo="ID: SC-9921-2023"
              icon="verified_user"
              color={colors.onSurfaceVariant}
              onVer={() => setVerDocModal({
                titulo: 'Certificación Scout AFOP',
                descripcion: 'Certificado de Excelencia AFOP.\nID Registro: SC-9921-2023\nFecha Emisión: 15/03/2023\nTitular: ' + `${nombre} ${apellido}`.trim(),
              })}
            />
            {credenciales.map((c, i) => (
              <CredCard
                key={i}
                titulo={c.titulo ?? 'Credencial'}
                subtitulo={c.estado ?? ''}
                icon="description"
                color={colors.primaryFixed}
                onVer={() => setVerDocModal({ titulo: c.titulo ?? 'Credencial', descripcion: c.estado ?? 'Sin descripción' })}
              />
            ))}
          </View>

          {/* ── CERRAR SESIÓN ── */}
          <Pressable style={styles.logoutRow} onPress={() => setLogoutModal(true)}>
            <Icon name="logout" size={18} color={colors.error} />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </Pressable>

          {/* ── SOPORTE ── */}
          <Pressable style={{ alignItems: 'center', paddingBottom: 8 }} onPress={abrirSoporte}>
            <Text style={styles.supportLink}>Contacta a Soporte GolConnect</Text>
          </Pressable>

        </View>
      </ScrollView>

      <BottomNav active="perfil-reclutador" variant="reclutador"
        onNavigate={(v) => v !== 'perfil-reclutador' && onNavigate(v)} />

      {/* Logout modal */}
      <Modal visible={logoutModal} onClose={() => setLogoutModal(false)} maxWidth={320}>
        <Text style={styles.modalTitle}>¿Cerrar sesión?</Text>
        <Pressable style={[styles.modalBtnPrimary, { marginTop: 16 }]}
          onPress={async () => { await logout(); setLogoutModal(false); onNavigate('landing'); }}>
          <Text style={styles.modalBtnPrimaryText}>Cerrar Sesión</Text>
        </Pressable>
        <Pressable style={[styles.modalBtnOutline, { marginTop: 8 }]} onPress={() => setLogoutModal(false)}>
          <Text style={styles.modalBtnOutlineText}>Cancelar</Text>
        </Pressable>
      </Modal>

      {/* Vista previa de credencial */}
      <Modal visible={!!verDocModal} onClose={() => setVerDocModal(null)} maxWidth={380}>
        {verDocModal && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.modalTitle}>{verDocModal.titulo?.toUpperCase()}</Text>
              <Pressable onPress={() => setVerDocModal(null)}>
                <Icon name="close" size={20} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>
            <View style={styles.docPreview}>
              <Icon name="badge" size={48} color={colors.primaryFixed} />
              <Text style={styles.docPreviewText}>{verDocModal.descripcion}</Text>
            </View>
            <Pressable style={[styles.modalBtnPrimary, { marginTop: 8 }]} onPress={() => setVerDocModal(null)}>
              <Text style={styles.modalBtnPrimaryText}>Cerrar</Text>
            </Pressable>
          </View>
        )}
      </Modal>

      {/* Invite scout modal */}
      <Modal visible={inviteModal} onClose={() => setInviteModal(false)} maxWidth={400}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={styles.modalTitle}>Buscar Ojeadores</Text>
          <Pressable onPress={() => setInviteModal(false)}><Icon name="close" size={20} color={colors.onSurfaceVariant} /></Pressable>
        </View>
        {[{ nombre: 'Marco Silva', club: 'Sporting CP' }, { nombre: 'Ana Beltrán', club: 'RCD Espanyol' }].map((c) => (
          <Pressable key={c.nombre} style={styles.inviteRow} onPress={() => { Alert.alert('✓', `${c.nombre} invitado correctamente.`); setInviteModal(false); }}>
            <View style={styles.inviteAvatar}><Icon name="person" size={20} color={colors.onSurfaceVariant} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.interBold, fontSize: 14, color: colors.white }}>{c.nombre}</Text>
              <Text style={{ fontFamily: fonts.inter, fontSize: 12, color: colors.onSurfaceVariant }}>{c.club}</Text>
            </View>
            <Icon name="person_add" size={18} color={colors.primaryFixed} />
          </Pressable>
        ))}
        <Pressable style={[styles.modalBtnPrimary, { marginTop: 20 }]} onPress={() => { Alert.alert('✓', 'Invitaciones enviadas.'); setInviteModal(false); }}>
          <Text style={styles.modalBtnPrimaryText}>Guardar</Text>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  topNav: { height: 56, justifyContent: 'center', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: colors.surface },
  topNavLogo: { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.primaryFixed, letterSpacing: 1 },

  heroBanner: { height: 110, backgroundColor: colors.surfaceContainerLow },

  profileHead: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 16, marginTop: -48, gap: 12 },
  avatarWrap: {},
  profileName: { fontFamily: fonts.oswaldBold, fontSize: 24, color: colors.white, lineHeight: 26 },
  profileLocation: { fontFamily: fonts.inter, fontSize: 13, color: colors.onSurfaceVariant },
  profileRole: { fontFamily: fonts.interBold, fontSize: 11, color: colors.primaryFixed, letterSpacing: 1.5, marginTop: 4 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryFixed, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, alignSelf: 'flex-end', marginBottom: 4 },
  editBtnText: { fontFamily: fonts.interBold, fontSize: 12, color: colors.onPrimaryFixed, textTransform: 'uppercase' },

  glassCard: { backgroundColor: 'rgba(51,53,53,0.55)', borderWidth: 1, borderColor: 'rgba(142,147,121,0.2)', borderRadius: 14, padding: 16 },
  cardKicker: { fontFamily: fonts.interBold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1.5 },
  cardSubhead: { fontFamily: fonts.oswaldMedium, fontSize: 18, color: colors.white, marginTop: 2 },

  clubLogoBox: { width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, borderWidth: 1, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },
  institutionName: { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.white },
  institutionDiv: { fontFamily: fonts.interMedium, fontSize: 13, color: colors.primaryFixed },
  metricsRow: { flexDirection: 'row', marginTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(68,73,51,0.3)', paddingTop: 16 },
  metricItem: { flex: 1, alignItems: 'center' },
  metricValue: { fontFamily: fonts.oswaldMedium, fontSize: 28, color: colors.white },
  metricLabel: { fontFamily: fonts.inter, fontSize: 11, color: colors.onSurfaceVariant, textTransform: 'uppercase', marginTop: 2 },

  savedFilter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceContainer, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginTop: 8 },
  savedFilterText: { fontFamily: fonts.inter, fontSize: 14, color: colors.onSurface },
  linkText: { fontFamily: fonts.interBold, fontSize: 12, color: colors.primaryFixed },

  contactosGrid: { flexDirection: 'row', gap: 8, marginTop: 12 },
  contactoCard: { flex: 1, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderRadius: 12, backgroundColor: colors.surfaceContainerLow, gap: 4 },
  contactoCardAdd: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.outlineVariant, gap: 4 },
  contactoAvatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  contactoNombre: { fontFamily: fonts.interBold, fontSize: 11, color: colors.white, textAlign: 'center' },
  contactoClub: { fontFamily: fonts.inter, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', textAlign: 'center' },
  addIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },

  credCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surfaceContainer, borderRadius: 8, padding: 14, borderWidth: 1, borderColor: 'rgba(68,73,51,0.3)', marginTop: 10 },
  credIcon: { width: 44, height: 44, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  credTitle: { fontFamily: fonts.interBold, fontSize: 13, color: colors.white },
  credSub: { fontFamily: fonts.inter, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },

  docPreview: { backgroundColor: colors.surfaceContainerHighest, borderRadius: 12, padding: 24, alignItems: 'center', gap: 16, borderWidth: 2, borderColor: colors.primaryFixed },
  docPreviewText: { fontFamily: fonts.inter, fontSize: 14, color: colors.onSurface, textAlign: 'center', lineHeight: 22 },

  logoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, paddingVertical: 8 },
  logoutText: { fontFamily: fonts.interBold, fontSize: 13, color: colors.error },
  supportLink: { fontFamily: fonts.interMedium, fontSize: 12, color: colors.primaryFixed, textDecorationLine: 'underline' },

  modalTitle: { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.white, textTransform: 'uppercase' },
  modalBtnPrimary: { backgroundColor: colors.primaryFixed, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  modalBtnPrimaryText: { fontFamily: fonts.interBold, fontSize: 12, color: colors.onPrimaryFixed, textTransform: 'uppercase', letterSpacing: 1 },
  modalBtnOutline: { borderWidth: 1, borderColor: colors.outlineVariant, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  modalBtnOutlineText: { fontFamily: fonts.interBold, fontSize: 12, color: colors.white, textTransform: 'uppercase', letterSpacing: 1 },
  inviteRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  inviteAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
});
