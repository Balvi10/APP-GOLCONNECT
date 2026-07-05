import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Modal as RNModal, FlatList } from 'react-native';
import { Screen, Field, PrimaryButton, Card, GlowBackground } from '../components/primitives';
import { TopBar } from '../components/chrome';
import Icon from '../components/Icon';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigate } from '../navigation/useNavigate';
import { useAuth } from '../context/AuthContext';
import { auth } from '../api';
import { colors, fonts, type } from '../theme';

const CARGOS = [
  'Reclutador Senior', 'Reclutador Junior', 'Director Deportivo',
  'Jefe de Scouting', 'Ojeador', 'Agente FIFA', 'Coordinador de Inferiores', 'Otro',
];
const CATEGORIAS = [
  'Primera División', 'Segunda División', 'Tercera División',
  'Inferiores / Formativas', 'Liga Amateur', 'Liga Regional', 'Otra',
];

function Picker({ label, value, options, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.pickerBtn}>
        <Text style={[styles.pickerText, !value && { color: colors.onSurfaceVariant }]}>
          {value || label}
        </Text>
        <Icon name="expand_more" size={20} color={colors.onSurfaceVariant} />
      </Pressable>

      <RNModal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalSheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.optionRow, item === value && styles.optionRowSel]}
                  onPress={() => { onSelect(item); setOpen(false); }}
                >
                  <Text style={[styles.optionText, item === value && { color: colors.primaryFixed }]}>{item}</Text>
                  {item === value && <Icon name="check" size={18} color={colors.primaryFixed} />}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </RNModal>
    </>
  );
}

export default function RegistroReclutador() {
  const onNavigate = useNavigate();
  const { setUser, setToken } = useAuth();

  // Datos personales
  const [nombre, setNombre]     = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [cargo, setCargo]       = useState('');

  // Datos del club
  const [institucion, setInstitucion] = useState('');
  const [categoria, setCategoria]     = useState('');
  const [ciudad, setCiudad]           = useState('');

  // Credencial
  const [archivoCredencial, setArchivoCredencial] = useState(null);
  const [loading, setLoading] = useState(false);

  const subirCredencial = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setArchivoCredencial(result.assets[0]);
      }
    } catch {
      Alert.alert('Error', 'No se pudo abrir el selector de archivos.');
    }
  };

  const handleRegistro = async () => {
    if (!nombre || !apellido || !email || !password) {
      Alert.alert('Campos requeridos', 'Completá nombre, apellido, email y contraseña.');
      return;
    }

    const payload = {
      nombre,
      apellido,
      email: email.trim(),
      password,
      cargo:       cargo       || null,
      institucion: institucion || null,
      categoria:   categoria   || null,
      ciudad:      ciudad      || null,
    };

    setLoading(true);
    try {
      const data = await auth.registrarReclutador(payload);
      setToken(data.token);
      setUser(data.user);
      onNavigate('exito-reclutador');
    } catch (err) {
      Alert.alert('Error en el registro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <TopBar title="RECLUTADOR" onBack={() => onNavigate('landing')} />
      <GlowBackground />

      <View style={styles.body}>
        <Text style={styles.eyebrow}>REGISTRO</Text>
        <Text style={styles.title}>Unite a la Red Elite</Text>

        {/* Datos personales */}
        <Card style={{ marginTop: 24 }}>
          <View style={styles.sectionHead}>
            <Icon name="person" size={22} color={colors.primaryFixed} />
            <Text style={styles.sectionTitle}>Datos Personales</Text>
          </View>
          <Field label="Nombre *"   value={nombre}   onChangeText={setNombre}   placeholder="Ej: Julian" />
          <Field label="Apellido *"  value={apellido} onChangeText={setApellido} placeholder="Ej: Alvarez" />
          <Field label="Email *"     value={email}    onChangeText={setEmail}    placeholder="tu@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Field
            label="Contraseña *"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPass}
            rightIcon={showPass ? 'visibility_off' : 'visibility'}
            onRightIconPress={() => setShowPass(v => !v)}
          />
          <Text style={styles.fieldLabel}>Cargo</Text>
          <Picker label="Seleccioná tu rol profesional" value={cargo} options={CARGOS} onSelect={setCargo} />
        </Card>

        {/* Datos del club/agencia */}
        <Card style={{ marginTop: 24 }}>
          <View style={styles.sectionHead}>
            <Icon name="stadium" size={22} color={colors.primaryFixed} />
            <Text style={styles.sectionTitle}>Datos del Club/Agencia</Text>
          </View>
          <Field label="Nombre de la Institución" value={institucion} onChangeText={setInstitucion} placeholder="Club Atlético o Agencia" />
          <Text style={styles.fieldLabel}>Categoría</Text>
          <Picker label="Seleccioná la categoría" value={categoria} options={CATEGORIAS} onSelect={setCategoria} />
          <View style={{ height: 12 }} />
          <Field label="Ubicación" value={ciudad} onChangeText={setCiudad} placeholder="Ciudad, País" leftIcon="location_on" />
        </Card>

        {/* Verificación de identidad */}
        <Card style={{ marginTop: 24, borderColor: 'rgba(195,244,0,0.2)' }}>
          <View style={[styles.sectionHead, { alignItems: 'flex-start' }]}>
            <View style={styles.verifyIcon}>
              <Icon name="verified_user" size={32} color={colors.primaryFixed} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Verificación de Identidad</Text>
              <Text style={styles.verifyBody}>
                Para garantizar la integridad de GolConnect, requerimos una copia de su credencial
                profesional vigente.
              </Text>
            </View>
          </View>
          <Pressable
            onPress={subirCredencial}
            style={[styles.uploadBtn, archivoCredencial && { borderColor: colors.primaryFixed }]}
          >
            <Icon
              name={archivoCredencial ? 'check_circle' : 'upload_file'}
              size={20}
              color={archivoCredencial ? colors.primaryFixed : colors.primaryFixed}
            />
            <Text style={styles.uploadText}>
              {archivoCredencial ? archivoCredencial.name : 'SUBIR CREDENCIAL'}
            </Text>
          </Pressable>
          <Text style={styles.uploadHint}>Formatos: JPG, PDF o PNG (Max 5MB)</Text>
        </Card>

        <PrimaryButton
          label={loading ? 'Registrando...' : 'Finalizar Registro'}
          onPress={handleRegistro}
          disabled={loading}
          style={{ marginTop: 24 }}
        />
        <View style={styles.secureRow}>
          <Icon name="lock" size={16} color={colors.outline} />
          <Text style={styles.secureText}>DATOS ENCRIPTADOS Y PROTEGIDOS</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body:             { padding: 16, paddingTop: 24 },
  eyebrow:          { fontFamily: fonts.interBold, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: colors.surfaceTint },
  title:            { ...type.headlineLgMobile, color: colors.primary, marginTop: 4 },
  sectionHead:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitle:     { fontFamily: fonts.oswaldMedium, fontSize: 22, color: colors.primary },
  fieldLabel:       { ...type.labelSm, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: fonts.interBold, marginBottom: 6, marginTop: 4 },
  pickerBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: colors.surfaceContainerHigh, marginBottom: 12 },
  pickerText:       { fontFamily: fonts.inter, fontSize: 15, color: colors.onSurface, flex: 1 },
  modalBackdrop:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet:       { backgroundColor: colors.surfaceContainer, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%' },
  modalSheetTitle:  { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.onSurface, marginBottom: 16 },
  optionRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  optionRowSel:     { },
  optionText:       { fontFamily: fonts.inter, fontSize: 15, color: colors.onSurface },
  verifyIcon:       { backgroundColor: 'rgba(195,244,0,0.2)', padding: 12, borderRadius: 12 },
  verifyBody:       { ...type.bodyMd, fontSize: 14, color: colors.onSurfaceVariant, marginTop: 6 },
  uploadBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 2, borderColor: colors.primaryFixed, borderRadius: 8, paddingVertical: 14, marginTop: 16 },
  uploadText:       { fontFamily: fonts.interBold, fontSize: 13, letterSpacing: 0.5, color: colors.primaryFixed, flexShrink: 1 },
  uploadHint:       { ...type.labelSm, color: colors.outline, textAlign: 'center', marginTop: 8 },
  secureRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24 },
  secureText:       { ...type.labelSm, color: colors.outline, letterSpacing: 0.5 },
});
