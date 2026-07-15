import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Linking } from 'react-native';
import { Screen, Card, PrimaryButton, OutlineButton } from '../components/primitives';
import { TopBar } from '../components/chrome';
import Icon from '../components/Icon';
import { useNavigate } from '../navigation/useNavigate';
import { pagos as apiPagos } from '../api';
import { colors, fonts, type } from '../theme';

interface DatosPago {
  pago_id?: string | number;
  alias?: string;
  cbu?: string;
  titular?: string;
  mensaje?: string;
  whatsapp?: string;
}

export default function PagoSeguro() {
  const onNavigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [datosPago, setDatosPago] = useState<DatosPago | null>(null);

  const iniciarPago = async () => {
    setLoading(true);
    try {
      const data = await apiPagos.iniciar();
      setDatosPago(data);
    } catch (err: any) {
      Alert.alert('Error', err?.message);
    } finally {
      setLoading(false);
    }
  };

  const abrirWhatsApp = () => {
    const numero = datosPago?.whatsapp?.replace(/\D/g, '') ?? '';
    const texto = encodeURIComponent(`Hola! Realicé el pago del Plan PRO (ID #${datosPago?.pago_id}). Adjunto el comprobante.`);
    Linking.openURL(`https://wa.me/${numero}?text=${texto}`);
  };

  return (
    <Screen>
      <TopBar title="PLAN PRO" onBack={() => onNavigate('back')} />

      <View style={styles.body}>
        <View style={styles.hero}>
          <Icon name="verified" size={48} color={colors.primaryFixed} />
          <Text style={styles.heroTitle}>Activá tu Plan PRO</Text>
          <Text style={styles.heroSub}>Transferencia bancaria · Sin suscripción automática</Text>
        </View>

        <Card style={styles.planCard}>
          <Text style={styles.planName}>Plan PRO Mensual</Text>
          <Text style={styles.planPrice}>$19.99 <Text style={styles.planCurrency}>USD</Text></Text>
          {['Videos Ilimitados', 'Radar de Ojeadores', 'Insignia PRO', 'Métricas avanzadas'].map((f) => (
            <View key={f} style={styles.featRow}>
              <Icon name="check_circle" size={18} color={colors.primaryFixed} />
              <Text style={styles.featText}>{f}</Text>
            </View>
          ))}
        </Card>

        {!datosPago ? (
          <PrimaryButton
            label={loading ? 'Procesando...' : 'Iniciar Proceso de Pago'}
            onPress={iniciarPago}
            disabled={loading}
            style={{ marginTop: 24 }}
          />
        ) : (
          <Card style={{ marginTop: 24, gap: 12 }}>
            <Text style={styles.instrTitle}>Datos para la transferencia</Text>

            <View style={styles.datoRow}>
              <Text style={styles.datoLabel}>Alias</Text>
              <Text style={styles.datoValue}>{datosPago.alias}</Text>
            </View>
            <View style={styles.datoRow}>
              <Text style={styles.datoLabel}>CBU</Text>
              <Text style={styles.datoValue}>{datosPago.cbu}</Text>
            </View>
            <View style={styles.datoRow}>
              <Text style={styles.datoLabel}>Titular</Text>
              <Text style={styles.datoValue}>{datosPago.titular}</Text>
            </View>
            <View style={styles.datoRow}>
              <Text style={styles.datoLabel}>Monto</Text>
              <Text style={[styles.datoValue, { color: colors.primaryFixed }]}>$19.99 USD</Text>
            </View>

            <View style={styles.infoBox}>
              <Icon name="info" size={18} color={colors.primaryFixed} />
              <Text style={styles.infoText}>{datosPago.mensaje}</Text>
            </View>

            <PrimaryButton
              label="Enviar comprobante por WhatsApp"
              icon="whatsapp"
              onPress={abrirWhatsApp}
              style={{ marginTop: 8 }}
            />
            <OutlineButton
              label="Ya lo hice, ir al inicio"
              onPress={() => onNavigate('exito')}
              style={{ marginTop: 4 }}
            />
          </Card>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16 },
  hero: { alignItems: 'center', gap: 8, paddingVertical: 32 },
  heroTitle: { fontFamily: fonts.oswaldBold, fontSize: 32, color: colors.onSurface, textTransform: 'uppercase' },
  heroSub: { ...type.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center' },
  planCard: { borderWidth: 2, borderColor: colors.primaryFixed },
  planName: { fontFamily: fonts.oswaldMedium, fontSize: 22, color: colors.primary, marginBottom: 4 },
  planPrice: { fontFamily: fonts.interBold, fontSize: 36, color: colors.primaryFixed, marginBottom: 16 },
  planCurrency: { fontSize: 16, color: colors.onSurfaceVariant },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  featText: { ...type.bodyMd, fontSize: 14, color: colors.onSurface },
  instrTitle: { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.onSurface, textTransform: 'uppercase' },
  datoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  datoLabel: { ...type.labelSm, color: colors.onSurfaceVariant, textTransform: 'uppercase' },
  datoValue: { fontFamily: fonts.interBold, fontSize: 14, color: colors.onSurface },
  infoBox: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', padding: 12, backgroundColor: colors.surfaceContainerHigh, borderRadius: 10 },
  infoText: { flex: 1, ...type.labelSm, fontSize: 12, color: colors.onSurfaceVariant, lineHeight: 18 },
});
