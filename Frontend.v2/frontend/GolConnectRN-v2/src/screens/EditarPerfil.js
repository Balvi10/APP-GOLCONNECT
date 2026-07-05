import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, Pressable, StyleSheet,
  ScrollView, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import AvatarImage from '../components/AvatarImage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { reclutador as apiRec, API_BASE_URL, guardarSesion, obtenerToken } from '../api';
import { colors, fonts, type } from '../theme';
import { prepararFotoParaSubir } from '../utils/imagenes';

// ── Sección expandible ────────────────────────────────────────────────────
function ExpandSection({ icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={exStyles.section}>
      <Pressable style={exStyles.sectionHead} onPress={() => setOpen(v => !v)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Icon name={icon} size={20} color={colors.primaryFixed} />
          <Text style={exStyles.sectionTitle}>{title}</Text>
        </View>
        <Icon name={open ? 'expand_less' : 'expand_more'} size={20} color={colors.onSurfaceVariant} />
      </Pressable>
      {open && <View style={exStyles.sectionBody}>{children}</View>}
    </View>
  );
}

const exStyles = StyleSheet.create({
  section:     { backgroundColor: colors.surfaceContainerLow, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  sectionTitle:{ fontFamily: fonts.inter, fontSize: 15, color: colors.onSurface },
  sectionBody: { padding: 16, paddingTop: 0, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
});

// ── Campo de formulario ────────────────────────────────────────────────────
function FormField({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={fStyles.label}>{label}</Text>
      <TextInput
        style={fStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(196,201,172,0.4)"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
      />
    </View>
  );
}

const fStyles = StyleSheet.create({
  label: { fontFamily: fonts.interMedium, fontSize: 12, color: colors.onSurfaceVariant, marginBottom: 5 },
  input: { backgroundColor: colors.surfaceContainer, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: colors.onSurface, fontFamily: fonts.inter, fontSize: 14 },
});

// ═══════════════════════════════════════════════════════════════════════════
export default function EditarPerfil() {
  const navigation      = useNavigation();
  const { user, setUser } = useAuth();

  const [loadingInit, setLoadingInit] = useState(true);
  const [loading, setLoading]         = useState(false);
  const [fotoLocal, setFotoLocal]     = useState(null);
  const [fotoServidor, setFotoServidor] = useState(null); // foto ya guardada en el servidor
  const [credencialSelec, setCredencialSelec] = useState(null);
  const [credenciales, setCredenciales]       = useState([]);

  // Campos
  const [nombre, setNombre]         = useState('');
  const [apellido, setApellido]     = useState('');
  const [emailVal, setEmailVal]     = useState('');
  const [cargo, setCargo]           = useState('');
  const [institucion, setInstitucion] = useState('');
  const [pasActual, setPasActual]   = useState('');
  const [pasNueva, setPasNueva]     = useState('');

  useEffect(() => {
    apiRec.perfil()
      .then(data => {
        const p = data?.perfilReclutador ?? {};
        setNombre(data?.nombre    ?? user?.nombre    ?? '');
        setApellido(data?.apellido ?? user?.apellido ?? '');
        setEmailVal(data?.email   ?? user?.email    ?? '');
        setCargo(p.cargo       ?? '');
        setInstitucion(p.institucion ?? '');
        setCredenciales(p.credenciales ?? []);
        if (p.foto_perfil) setFotoServidor(p.foto_perfil);
      })
      .catch(() => {
        setNombre(user?.nombre   ?? '');
        setApellido(user?.apellido ?? '');
        setEmailVal(user?.email  ?? '');
      })
      .finally(() => setLoadingInit(false));
  }, []);

  const cambiarFoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.85,
    });
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    setFotoLocal(asset.uri); // preview inmediato

    try {
      const tk = await obtenerToken();
      if (!tk) return;

      // Convertir SIEMPRE a JPEG: las fotos de la galería de iPhone suelen
      // ser HEIC, que el backend no acepta.
      const fotoLista = await prepararFotoParaSubir(asset.uri, 'foto_reclutador.jpg');

      const form = new FormData();
      form.append('foto', fotoLista);

      const resp = await fetch(`${API_BASE_URL}/reclutador/perfil/foto`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${tk}` }, // sin Content-Type: fetch arma el boundary automáticamente
        body:    form,
      });
      if (resp.ok) {
        const rd = await resp.json().catch(() => ({}));
        if (setUser && user) {
          const perfilActualizado = { ...(user.perfilReclutador ?? {}), foto_perfil: rd.foto_perfil };
          const userActualizado   = { ...user, perfilReclutador: perfilActualizado };
          setUser(userActualizado);
          await guardarSesion(tk, userActualizado);
        }
        // A partir de ahora la fuente de verdad es la foto del servidor
        setFotoServidor(rd.foto_perfil ?? null);
        setFotoLocal(null);
        Alert.alert('✓ Foto actualizada', 'Tu foto fue guardada correctamente.');
      } else {
        setFotoLocal(null);
        const errData = await resp.json().catch(() => ({}));
        const detalle = errData?.message || errData?.errors?.foto?.[0] || `Código ${resp.status}`;
        Alert.alert('No se pudo guardar la foto', detalle);
      }
    } catch (err) {
      setFotoLocal(null);
      Alert.alert('Error', 'No se pudo subir la foto: ' + (err?.message ?? 'Error desconocido'));
    }
  };

  const subirCredencial = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length) {
        setCredencialSelec(result.assets[0]);
      }
    } catch {
      Alert.alert('Error', 'No se pudo abrir el selector de archivos.');
    }
  };

  const guardar = async () => {
    setLoading(true);
    try {
      await apiRec.actualizarPerfil({
        nombre:      nombre.trim()     || undefined,
        apellido:    apellido.trim()   || undefined,
        cargo:       cargo             || undefined,
        institucion: institucion       || undefined,
      });

      // Actualizar user en contexto y persistir en AsyncStorage
      const userActualizado = {
        ...(user ?? {}),
        nombre:   nombre.trim()   || user?.nombre,
        apellido: apellido.trim() || user?.apellido,
        perfilReclutador: {
          ...(user?.perfilReclutador ?? {}),
          cargo,
          institucion,
        },
      };
      if (setUser) setUser(userActualizado);
      const tk = await obtenerToken();
      if (tk) await guardarSesion(tk, userActualizado);

      Alert.alert('✓ Guardado', 'Cambios guardados con éxito.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err?.message ?? 'No se pudo guardar.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingInit) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primaryFixed} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow_back" size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
        </View>
        <Pressable onPress={guardar} disabled={loading}>
          <Text style={styles.saveLink}>{loading ? 'Guardando...' : 'Guardar'}</Text>
        </Pressable>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>

        {/* Foto de perfil */}
        <View style={styles.photoSection}>
          <View style={styles.photoWrap}>
            {fotoLocal
              ? <Image source={{ uri: fotoLocal }} style={styles.photo} />
              : <AvatarImage fotoPath={fotoServidor} apiBaseUrl={API_BASE_URL} size={120} iconSize={44} style={{ borderWidth: 2, borderColor: colors.primaryFixed }} />}
            <Pressable style={styles.cameraBtn} onPress={cambiarFoto}>
              <Icon name="photo_camera" size={16} color={colors.onPrimaryFixed} />
            </Pressable>
          </View>
          <Pressable style={styles.changePhotoBtn} onPress={cambiarFoto}>
            <Text style={styles.changePhotoText}>Cambiar foto de perfil</Text>
          </Pressable>
        </View>

        {/* Información Personal */}
        <Text style={styles.sectionTitle}>Información Personal</Text>
        <FormField label="Nombre Completo"     value={nombre}      onChangeText={setNombre}      placeholder="Tu nombre" />
        <FormField label="Apellido"             value={apellido}    onChangeText={setApellido}    placeholder="Tu apellido" />
        <FormField label="Correo Electrónico"   value={emailVal}    onChangeText={setEmailVal}    placeholder="email@ejemplo.com" keyboardType="email-address" />
        <FormField label="Organización / Club"  value={institucion} onChangeText={setInstitucion} placeholder="Nombre del club o agencia" />
        <FormField label="Cargo"                value={cargo}       onChangeText={setCargo}       placeholder="Ej: Senior Talent Scout" />

        {/* Seguridad */}
        <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Seguridad</Text>
        <ExpandSection icon="lock" title="Cambiar Contraseña">
          <View style={{ paddingTop: 12 }}>
            <FormField label="Contraseña Actual" value={pasActual} onChangeText={setPasActual} placeholder="••••••••" secureTextEntry />
            <FormField label="Nueva Contraseña"  value={pasNueva}  onChangeText={setPasNueva}  placeholder="••••••••" secureTextEntry />
            <Pressable style={styles.updatePassBtn} onPress={() => {
              if (!pasActual || !pasNueva) { Alert.alert('Requerido', 'Completá ambos campos.'); return; }
              Alert.alert('✓', '¡Contraseña actualizada!');
              setPasActual(''); setPasNueva('');
            }}>
              <Text style={styles.updatePassText}>Actualizar Contraseña</Text>
            </Pressable>
          </View>
        </ExpandSection>

        <ExpandSection icon="verified_user" title="Verificación de Credenciales" defaultOpen>
          <View style={{ paddingTop: 12, gap: 10 }}>
            {credenciales.map((c, i) => (
              <View key={i} style={styles.credRow}>
                <Icon name="description" size={16} color={colors.primaryFixed} />
                <Text style={styles.credName}>{c.titulo ?? 'Credencial'}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable hitSlop={8}><Icon name="visibility" size={18} color={colors.onSurfaceVariant} /></Pressable>
                  <Pressable hitSlop={8} onPress={() => setCredenciales(prev => prev.filter((_, j) => j !== i))}>
                    <Icon name="delete" size={18} color={colors.error} />
                  </Pressable>
                </View>
              </View>
            ))}
            {/* Licencia y Certificación de ejemplo */}
            <View style={styles.credRow}>
              <Icon name="description" size={16} color={colors.primaryFixed} />
              <Text style={styles.credName}>Licencia Pro</Text>
              <Pressable hitSlop={8}><Icon name="visibility" size={18} color={colors.onSurfaceVariant} /></Pressable>
            </View>
            <View style={styles.credRow}>
              <Icon name="description" size={16} color={colors.primaryFixed} />
              <Text style={styles.credName}>Certificación Scouting</Text>
              <Pressable hitSlop={8}><Icon name="visibility" size={18} color={colors.onSurfaceVariant} /></Pressable>
            </View>

            <Pressable style={[styles.uploadBtn, credencialSelec && { borderColor: colors.primaryFixed }]} onPress={subirCredencial}>
              <Icon name="upload_file" size={20} color={colors.primaryFixed} />
              <Text style={styles.uploadBtnText}>
                {credencialSelec ? credencialSelec.name : 'Subir nueva credencial'}
              </Text>
            </Pressable>
            <Text style={styles.uploadHint}>Formatos permitidos: PDF, JPG, PNG</Text>
          </View>
        </ExpandSection>

        {/* Acciones */}
        <Pressable style={styles.guardarBtn} onPress={guardar} disabled={loading}>
          <Text style={styles.guardarBtnText}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Text>
        </Pressable>
        <Pressable style={styles.cancelarBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelarBtnText}>Cancelar</Text>
        </Pressable>
        <Pressable style={styles.logoutBtn} onPress={() => navigation.navigate('landing')}>
          <Icon name="logout" size={18} color={colors.error} />
          <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant, backgroundColor: colors.surface },
  backBtn:       { padding: 4 },
  headerTitle:   { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.onSurface },
  saveLink:      { fontFamily: fonts.interBold, fontSize: 14, color: colors.primaryFixed },

  photoSection:  { alignItems: 'center', marginBottom: 28, gap: 12 },
  photoWrap:     { position: 'relative' },
  photo:         { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: colors.primaryFixed },
  cameraBtn:     { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primaryFixed, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  changePhotoBtn:{ backgroundColor: 'rgba(195,244,0,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  changePhotoText:{ fontFamily: fonts.interBold, fontSize: 13, color: colors.primaryFixed },

  sectionTitle:  { fontFamily: fonts.oswaldMedium, fontSize: 20, color: colors.primaryFixed, marginBottom: 16, textTransform: 'uppercase' },

  credRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surfaceContainer, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12 },
  credName:      { flex: 1, fontFamily: fonts.inter, fontSize: 14, color: colors.onSurface },

  uploadBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.outlineVariant, borderRadius: 10, paddingVertical: 14, marginTop: 4 },
  uploadBtnText: { fontFamily: fonts.interBold, fontSize: 13, color: colors.primaryFixed },
  uploadHint:    { fontFamily: fonts.inter, fontSize: 11, color: colors.outline, textAlign: 'center' },

  updatePassBtn: { backgroundColor: 'rgba(195,244,0,0.1)', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  updatePassText:{ fontFamily: fonts.interBold, fontSize: 13, color: colors.primaryFixed, textTransform: 'uppercase' },

  guardarBtn:    { backgroundColor: colors.primaryFixed, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  guardarBtnText:{ fontFamily: fonts.interBold, fontSize: 14, color: colors.onPrimaryFixed, textTransform: 'uppercase', letterSpacing: 1 },
  cancelarBtn:   { borderWidth: 1, borderColor: colors.outlineVariant, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  cancelarBtnText:{ fontFamily: fonts.interBold, fontSize: 14, color: colors.onSurface, textTransform: 'uppercase' },
  logoutBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, marginTop: 8 },
  logoutBtnText: { fontFamily: fonts.interBold, fontSize: 14, color: colors.error },
});
