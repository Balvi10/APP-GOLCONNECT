import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { Screen, Card, PrimaryButton, GlowBackground } from '../components/primitives';
import Icon from '../components/Icon';
import { useNavigate } from '../navigation/useNavigate';
import { useAuth } from '../context/AuthContext';
import { reclutador as apiRec } from '../api';
import { colors, fonts, type } from '../theme';

const SOPORTE_WA = '+5493624003464';

export default function ExitoReclutador() {
  const onNavigate = useNavigate();
  const { user }   = useAuth();
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    apiRec.perfil()
      .then(data => setPerfil(data?.perfilReclutador ?? null))
      .catch(() => {});
  }, []);

  const nombre      = user?.nombre    ?? '—';
  const apellido    = user?.apellido  ?? '';
  const cargo       = perfil?.cargo       ?? 'Reclutador';
  const institucion = perfil?.institucion ?? '';

  const metaTexto = [cargo, institucion].filter(Boolean).join(' · ') || 'GolConnect';

  const abrirSoporte = () => {
    const texto = encodeURIComponent('Hola! Necesito soporte con GolConnect.');
    Linking.openURL(`https://wa.me/${SOPORTE_WA.replace(/\D/g,'')}?text=${texto}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <GlowBackground />
      <Screen contentStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View style={{ alignItems: 'center' }}>
          <View style={styles.checkRing}>
            <View style={styles.checkInner}>
              <Icon name="check" size={56} color={colors.onPrimaryFixed} />
            </View>
          </View>

          <Text style={styles.kicker}>Registro verificado</Text>
          <Text style={styles.title}>¡BIENVENIDO A LAS GRANDES LIGAS!</Text>
          <Text style={styles.subtitle}>Tu registro ha sido procesado. Ya podés acceder al panel de reclutamiento.</Text>

          <Card style={styles.snapshot}>
            <View style={styles.snapRow}>
              <View style={styles.snapAvatar}>
                <Icon name="account_circle" size={36} color={colors.onSurfaceVariant} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.snapName}>{`${nombre} ${apellido}`.trim()}</Text>
                <Text style={styles.snapMeta}>{metaTexto}</Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <Icon name="verified_user" size={18} color={colors.primaryFixed} />
              <Text style={styles.statusText}>Cuenta activa — verificación en proceso</Text>
            </View>
          </Card>

          <PrimaryButton
            label="Ir a mi panel"
            icon="arrow_forward_ios"
            onPress={() => onNavigate('inicio-reclutador')}
            style={{ marginTop: 28, alignSelf: 'stretch' }}
          />

          {/* WhatsApp soporte */}
          <Pressable onPress={abrirSoporte} style={{ marginTop: 16 }}>
            <Text style={styles.support}>Contacta a Soporte GolConnect</Text>
          </Pressable>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  checkRing:   { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(195,244,0,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  checkInner:  { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primaryFixed, alignItems: 'center', justifyContent: 'center' },
  kicker:      { ...type.labelBold, color: colors.primaryFixed, textTransform: 'uppercase', letterSpacing: 2 },
  title:       { ...type.headlineLgMobile, color: colors.white, textTransform: 'uppercase', textAlign: 'center', marginTop: 8 },
  subtitle:    { ...type.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 12, maxWidth: 320 },
  snapshot:    { alignSelf: 'stretch', marginTop: 32 },
  snapRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  snapAvatar:  { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  snapName:    { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.white },
  snapMeta:    { ...type.labelSm, color: colors.onSurfaceVariant, marginTop: 2 },
  statusRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: 16 },
  statusText:  { fontFamily: fonts.interBold, fontSize: 14, color: colors.onSurface },
  support:     { ...type.labelSm, color: colors.primaryFixed, textDecorationLine: 'underline', letterSpacing: 0.5 },
});
