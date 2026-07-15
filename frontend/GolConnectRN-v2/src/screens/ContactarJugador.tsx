import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, Alert, Linking,
  TextInput, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { jugadores as apiJugadores } from '../api';
import { colors, fonts } from '../theme';
import type { RootStackParamList } from '../navigation/routes';
import type { PerfilJugador } from '../types';

const MENSAJES: Record<string, string> = {
  interes: 'Hola, hemos estado siguiendo tu progreso en GolConnect y estamos muy impresionados con tu perfil técnico. Nos gustaría hablar más formalmente sobre tu futuro.',
  prueba: '¡Hola! Tras revisar tus clips y estadísticas, nos gustaría invitarte a una jornada de pruebas (tryouts) en nuestras instalaciones la próxima semana.',
  reunion: 'Hola, ¿tendrías 10 minutos esta semana para una videollamada? Queremos presentarte el proyecto deportivo de nuestro club para la próxima temporada.',
};

export default function ContactarJugador() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'contactar-jugador'>>();
  const jugadorId = route.params?.jugadorId;

  const [perfil, setPerfil] = useState<PerfilJugador | null>(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(MENSAJES.interes);

  useEffect(() => {
    if (!jugadorId) { setLoading(false); return; }
    apiJugadores.detalle(jugadorId)
      .then(setPerfil)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [jugadorId]);

  const nombre = perfil ? `${perfil.nombre ?? ''} ${perfil.apellido ?? ''}`.trim() : 'Jugador';
  const emailJugador = perfil?.email ?? null;
  const whatsappCrudo = perfil?.whatsapp ?? null;
  const whatsappLimpio = whatsappCrudo ? whatsappCrudo.replace(/\D/g, '') : null;

  // Formatea el numero para mostrarlo lindo, ej: +54 9 3624 003464
  const whatsappFormateado = whatsappCrudo ?? null;

  const contactarEmail = async () => {
    if (!emailJugador) {
      Alert.alert('Sin email', 'Este jugador no cargó un email en su perfil.');
      return;
    }
    const asunto = encodeURIComponent('Interés de Scout - GolConnect');
    const cuerpo = encodeURIComponent(mensaje);
    const url = `mailto:${emailJugador}?subject=${asunto}&body=${cuerpo}`;

    // Registrar en backend (no bloqueante)
    if (jugadorId) {
      apiJugadores.contactar(jugadorId, { tipo: 'interes', canal: 'email', notas: mensaje }).catch(() => {});
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir el cliente de email. Revisá que tengas una app de correo instalada.');
    });
  };

  const contactarWhatsApp = async () => {
    if (!whatsappLimpio) {
      Alert.alert('Sin WhatsApp', 'Este jugador no cargó un número de WhatsApp en su perfil.');
      return;
    }
    const texto = encodeURIComponent(mensaje);
    const url = `https://wa.me/${whatsappLimpio}?text=${texto}`;

    if (jugadorId) {
      apiJugadores.contactar(jugadorId, { tipo: 'interes', canal: 'whatsapp', notas: mensaje }).catch(() => {});
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir WhatsApp. Asegurate de tenerlo instalado.');
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primaryFixed} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow_back" size={20} color={colors.onSurfaceVariant} />
          <Text style={styles.backText}>VOLVER</Text>
        </Pressable>
        <Text style={styles.headerLogo}>GOLCONNECT</Text>
        <View style={{ width: 80 }} />
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={styles.playerHeader}>
          <View style={styles.playerAvatar}>
            <Icon name="person" size={40} color={colors.onSurfaceVariant} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.playerName}>{nombre.toUpperCase()}</Text>
            <View style={styles.playerTags}>
              {perfil?.posicion_principal && (
                <View style={styles.tagChip}>
                  <Icon name="sports_soccer" size={12} color={colors.onSurfaceVariant} />
                  <Text style={styles.tagChipText}>{perfil.posicion_principal}</Text>
                </View>
              )}
              {perfil?.ciudad && (
                <View style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{perfil.ciudad}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 16 }}>

          {/* ── Card Email — muestra el email real, sin "Seleccionar" ── */}
          <View style={styles.contactCard}>
            <View style={styles.contactCardTop}>
              <View style={styles.contactCardIcon}>
                <Icon name="mail" size={26} color={colors.primaryFixed} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactCardLabel}>EMAIL DEL JUGADOR</Text>
                <Text style={[styles.contactCardValue, !emailJugador && styles.contactCardValueEmpty]}>
                  {emailJugador ?? 'No registrado'}
                </Text>
              </View>
            </View>
            <Pressable
              style={[styles.contactActionBtn, !emailJugador && styles.contactActionBtnDisabled]}
              onPress={contactarEmail}
              disabled={!emailJugador}
            >
              <Icon name="send" size={16} color={colors.onPrimaryFixed} />
              <Text style={styles.contactActionBtnText}>ENVIAR CORREO</Text>
            </Pressable>
          </View>

          {/* ── Card WhatsApp — muestra el número real, sin "Seleccionar" ── */}
          <View style={styles.contactCard}>
            <View style={styles.contactCardTop}>
              <View style={[styles.contactCardIcon, { backgroundColor: 'rgba(37,211,102,0.12)' }]}>
                <Icon name="chat" size={26} color="#25D366" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactCardLabel}>WHATSAPP DEL JUGADOR</Text>
                <Text style={[styles.contactCardValue, !whatsappFormateado && styles.contactCardValueEmpty]}>
                  {whatsappFormateado ?? 'No registrado'}
                </Text>
              </View>
            </View>
            <Pressable
              style={[styles.contactActionBtn, { backgroundColor: '#25D366' }, !whatsappLimpio && styles.contactActionBtnDisabled]}
              onPress={contactarWhatsApp}
              disabled={!whatsappLimpio}
            >
              <Icon name="chat" size={16} color="#fff" />
              <Text style={[styles.contactActionBtnText, { color: '#fff' }]}>ABRIR WHATSAPP</Text>
            </Pressable>
          </View>

          {/* ── Editor de mensaje ── */}
          <View style={styles.messageBox}>
            <View style={styles.messageHead}>
              <Icon name="edit_note" size={18} color={colors.primaryFixed} />
              <Text style={styles.messageTitle}>MENSAJE PREDEFINIDO</Text>
            </View>
            <Text style={styles.messageHint}>Este texto se envía junto con el email o WhatsApp.</Text>

            <TextInput
              style={styles.messageInput}
              value={mensaje}
              onChangeText={setMensaje}
              multiline
              numberOfLines={4}
              placeholderTextColor="rgba(196,201,172,0.4)"
              textAlignVertical="top"
            />

            <View style={styles.templatesRow}>
              {[
                { key: 'interes', label: 'Interés Inicial' },
                { key: 'prueba', label: 'Inv. a Prueba' },
                { key: 'reunion', label: 'Agendar Reunión' },
              ].map((t) => (
                <Pressable key={t.key} style={styles.templateBtn} onPress={() => setMensaje(MENSAJES[t.key])}>
                  <Text style={styles.templateBtnText}>{t.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Text style={styles.legal}>
            Al contactar al jugador, aceptás los términos de intermediación y el código de conducta de reclutadores de GolConnect.
          </Text>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: 'rgba(18,20,20,0.95)' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 80 },
  backText: { fontFamily: fonts.interBold, fontSize: 11, color: colors.onSurfaceVariant, letterSpacing: 1 },
  headerLogo: { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.primaryFixed, letterSpacing: 1 },

  playerHeader: { backgroundColor: colors.surfaceContainerLow, padding: 20, paddingTop: 28, flexDirection: 'row', alignItems: 'center', gap: 14 },
  playerAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surfaceContainerHighest, borderWidth: 2, borderColor: colors.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  playerName: { fontFamily: fonts.oswaldBold, fontSize: 20, color: colors.primaryFixed, letterSpacing: 0.5 },
  playerTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceVariant, borderWidth: 1, borderColor: colors.outlineVariant, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  tagChipText: { fontFamily: fonts.interMedium, fontSize: 11, color: colors.onSurfaceVariant },

  contactCard: { backgroundColor: 'rgba(51,53,53,0.55)', borderWidth: 1, borderColor: 'rgba(195,244,0,0.1)', borderRadius: 14, padding: 18, gap: 14 },
  contactCardTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  contactCardIcon: { width: 48, height: 48, borderRadius: 10, backgroundColor: 'rgba(195,244,0,0.12)', alignItems: 'center', justifyContent: 'center' },
  contactCardLabel: { fontFamily: fonts.interBold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1 },
  contactCardValue: { fontFamily: fonts.oswaldMedium, fontSize: 17, color: colors.white, marginTop: 3 },
  contactCardValueEmpty: { color: colors.onSurfaceVariant, fontFamily: fonts.inter, fontSize: 14, fontStyle: 'italic' },
  contactActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primaryFixed, paddingVertical: 13, borderRadius: 10 },
  contactActionBtnDisabled: { opacity: 0.35 },
  contactActionBtnText: { fontFamily: fonts.interBold, fontSize: 12, color: colors.onPrimaryFixed, textTransform: 'uppercase', letterSpacing: 1 },

  messageBox: { backgroundColor: 'rgba(51,53,53,0.3)', borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 14, padding: 16, gap: 10 },
  messageHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  messageTitle: { fontFamily: fonts.interBold, fontSize: 11, color: colors.primaryFixed, letterSpacing: 1 },
  messageHint: { fontFamily: fonts.inter, fontSize: 11, color: colors.onSurfaceVariant, marginTop: -6 },
  messageInput: { backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 10, padding: 14, color: colors.onSurface, fontFamily: fonts.inter, fontSize: 14, minHeight: 100, lineHeight: 22 },
  templatesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  templateBtn: { backgroundColor: colors.surfaceVariant, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 6 },
  templateBtnText: { fontFamily: fonts.interBold, fontSize: 11, color: colors.onSurfaceVariant },

  legal: { fontFamily: fonts.inter, fontSize: 11, color: colors.onSurfaceVariant, textAlign: 'center', opacity: 0.6, lineHeight: 16 },
});
