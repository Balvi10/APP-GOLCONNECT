import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Image } from 'react-native';
import { Screen, Field, PrimaryButton } from '../components/primitives';
import { TopBar, Modal } from '../components/chrome';
import Icon from '../components/Icon';
import * as ImagePicker from 'expo-image-picker';
import { useNavigate } from '../navigation/useNavigate';
import { useAuth } from '../context/AuthContext';
import { auth, API_BASE_URL, obtenerToken } from '../api';
import { colors, fonts, type } from '../theme';
import { prepararFotoParaSubir } from '../utils/imagenes';

const STEP_LABELS = ['Básico', 'Físico', 'Estado', 'Media'];
const FEET        = ['Zurdo', 'Diestro', 'Ambidiestro'];
const STATUS      = [
  { value: 'libre',       icon: 'person_search', title: 'Libre (Busco Club)',  sub: 'Disponible para pruebas e incorporación inmediata.' },
  { value: 'amateur',     icon: 'sports_soccer', title: 'Amateur',             sub: 'Jugando en ligas locales o formación.' },
  { value: 'profesional', icon: 'verified',      title: 'Profesional',         sub: 'Con contrato vigente o experiencia en liga profesional.' },
];

export default function Register() {
  const onNavigate = useNavigate();
  const { setUser, setToken } = useAuth();

  const [step, setStep]             = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [foot, setFoot]             = useState('Zurdo');
  const [status, setStatus]         = useState('libre');
  const [showModal, setShowModal]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [fotoUri, setFotoUri]       = useState(null); // foto local seleccionada

  // Campos
  const [nombre, setNombre]             = useState('');
  const [apellido, setApellido]         = useState('');
  const [nacimiento, setNacimiento]     = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [ciudad, setCiudad]             = useState('');
  const [altura, setAltura]             = useState('');
  const [peso, setPeso]                 = useState('');
  const [posicionP, setPosicionP]       = useState('');
  const [posicionS, setPosicionS]       = useState('');
  const [club, setClub]                 = useState('');
  const [liga, setLiga]                 = useState('');
  const [division, setDivision]         = useState('');
  const [videoUrl, setVideoUrl]         = useState('');

  const total = 4;
  const next = () => step < total ? setStep(s => s + 1) : handleRegistro();
  const prev = () => step > 1 && setStep(s => s - 1);

  // ── Abre galería para foto de perfil ──────────────────────────
  const abrirGaleria = async () => {
    const { status: perm } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para subir la foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setFotoUri(result.assets[0].uri);
    }
  };

  const handleRegistro = async () => {
    if (!nombre || !apellido || !email || !password) {
      Alert.alert('Campos requeridos', 'Completá al menos nombre, apellido, email y contraseña.');
      return;
    }

    const partes = nacimiento.replace(/\s/g, '').split('/');
    let fechaFormateada = '2000-01-01';
    if (partes.length === 3 && partes[2].length === 4) {
      fechaFormateada = `${partes[2]}-${partes[1].padStart(2,'0')}-${partes[0].padStart(2,'0')}`;
    }

    const payload = {
      nombre,
      apellido,
      email: email.trim(),
      password,
      fecha_nacimiento:    fechaFormateada,
      ciudad:              ciudad || null,
      altura_cm:           altura ? parseInt(altura) : null,
      peso_kg:             peso   ? parseInt(peso)   : null,
      pierna_habil:        foot.toLowerCase(),
      posicion_principal:  posicionP || null,
      posicion_secundaria: posicionS || null,
      estado:              status,
      club_actual:         club     || null,
      liga_actual:         liga     || null,
      division_actual:     division || null,
      video_url:           videoUrl || null,   // video del paso 4
    };

    setLoading(true);
    try {
      const data = await auth.registrarJugador(payload);
      setToken(data.token);
      setUser(data.user);

      // Si el usuario eligió una foto en el paso 4, subirla ahora que ya existe la cuenta
      if (fotoUri) {
        try {
          const tk = await obtenerToken();
          // Convertir SIEMPRE a JPEG: las fotos de la galería de iPhone
          // suelen ser HEIC, que el backend no acepta.
          const fotoLista = await prepararFotoParaSubir(fotoUri, 'foto_perfil.jpg');
          const form = new FormData();
          form.append('foto', fotoLista);
          const resp = await fetch(`${API_BASE_URL}/jugador/perfil/foto`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${tk}` }, // sin Content-Type: fetch arma el boundary automáticamente
            body: form,
          });
          if (!resp.ok) {
            console.warn('No se pudo subir la foto de perfil en el registro:', resp.status);
          }
        } catch (_) {
          // Si falla la subida de foto no bloqueamos el registro exitoso
        }
      }

      setShowModal(true);
    } catch (err) {
      Alert.alert('Error en el registro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <TopBar title="GOLCONNECT" onBack={() => onNavigate('back')} />

      <View style={styles.body}>
        {/* Stepper */}
        <View style={styles.stepper}>
          {STEP_LABELS.map((label, i) => {
            const n = i + 1; const done = n < step; const active = n === step;
            return (
              <View key={label} style={styles.stepItem}>
                <View style={[styles.dot, (done || active) && styles.dotActive]}>
                  {done
                    ? <Icon name="check" size={18} color={colors.onPrimaryFixed} />
                    : <Text style={[styles.dotText, active && { color: colors.onPrimaryFixed }]}>{n}</Text>}
                </View>
                <Text style={[styles.stepLabel, n <= step && { color: colors.primaryFixedDim }]}>{label}</Text>
              </View>
            );
          })}
        </View>

        {/* Paso 1 — Básico */}
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Información Básica</Text>
            <Text style={styles.sectionSub}>Comienza tu camino profesional.</Text>
            <Field label="Nombre"             value={nombre}    onChangeText={setNombre}    placeholder="Ej. Javier" />
            <Field label="Apellido"            value={apellido}  onChangeText={setApellido}  placeholder="Ej. Rodriguez" />
            <Field label="Fecha de Nacimiento" value={nacimiento} onChangeText={setNacimiento} placeholder="DD / MM / AAAA" />
            <Field label="Email"               value={email}     onChangeText={setEmail}     placeholder="nombre@ejemplo.com" keyboardType="email-address" autoCapitalize="none" />
            <Field
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••••"
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? 'visibility_off' : 'visibility'}
              onRightIconPress={() => setShowPassword(v => !v)}
            />
            <Field label="Ciudad" value={ciudad} onChangeText={setCiudad} placeholder="Ej. Buenos Aires" leftIcon="location_on" />
          </View>
        )}

        {/* Paso 2 — Físico */}
        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Atributos Físicos</Text>
            <View style={styles.row2}>
              <Field label="Altura (cm)" value={altura} onChangeText={setAltura} placeholder="185" keyboardType="numeric" style={{ flex: 1 }} />
              <Field label="Peso (kg)"   value={peso}   onChangeText={setPeso}   placeholder="78"  keyboardType="numeric" style={{ flex: 1 }} />
            </View>
            <Text style={styles.fieldLabel}>Pierna hábil</Text>
            <View style={styles.toggleGroup}>
              {FEET.map(f => (
                <Pressable key={f} onPress={() => setFoot(f)} style={[styles.toggle, foot === f && styles.toggleActive]}>
                  <Text style={[styles.toggleText, foot === f && { color: colors.onPrimaryFixed }]}>{f}</Text>
                </Pressable>
              ))}
            </View>
            <View style={{ height: 20 }} />
            <Field label="Posición Principal"  value={posicionP} onChangeText={setPosicionP} placeholder="Delantero Centro" />
            <Field label="Posición Secundaria" value={posicionS} onChangeText={setPosicionS} placeholder="Media Punta" />
          </View>
        )}

        {/* Paso 3 — Estado */}
        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>Situación Actual</Text>
            <Text style={styles.sectionSub}>Esto ayuda a los scouts a filtrar tu perfil.</Text>
            {STATUS.map(s => {
              const selected = status === s.value;
              return (
                <Pressable key={s.value} onPress={() => setStatus(s.value)} style={[styles.radioCard, selected && styles.radioCardSel]}>
                  <View style={styles.radioIcon}><Icon name={s.icon} size={22} color={colors.primaryFixed} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.radioTitle}>{s.title}</Text>
                    <Text style={styles.radioSub}>{s.sub}</Text>
                  </View>
                  {selected && <Icon name="check_circle" size={22} color={colors.primaryFixed} />}
                </Pressable>
              );
            })}
            {status === 'profesional' && (
              <View style={styles.proBox}>
                <Field label="Club"     value={club}     onChangeText={setClub}     placeholder="Ej. Club Atlético..." />
                <View style={styles.row2}>
                  <Field label="Liga"    value={liga}     onChangeText={setLiga}     placeholder="Liga Profesional" style={{ flex: 1 }} />
                  <Field label="División" value={division} onChangeText={setDivision} placeholder="Primera"          style={{ flex: 1 }} />
                </View>
              </View>
            )}
          </View>
        )}

        {/* Paso 4 — Media */}
        {step === 4 && (
          <View>
            <Text style={styles.sectionTitle}>Galería & Highlights</Text>

            {/* Foto de perfil — toca para abrir galería */}
            <Text style={styles.fieldLabel}>Foto de Perfil</Text>
            <Pressable style={styles.upload} onPress={abrirGaleria}>
              {fotoUri ? (
                <>
                  <Image source={{ uri: fotoUri }} style={styles.previewImg} />
                  <Text style={styles.uploadTitle}>Foto seleccionada ✓</Text>
                  <Text style={styles.uploadSub}>Tocá para cambiarla</Text>
                </>
              ) : (
                <>
                  <Icon name="add_a_photo" size={32} color={colors.primaryFixed} />
                  <Text style={styles.uploadTitle}>Tocá para subir foto</Text>
                  <Text style={styles.uploadSub}>PNG, JPG hasta 5MB</Text>
                </>
              )}
            </Pressable>

            <View style={{ height: 16 }} />
            <Field
              label="Video de Jugadas (YouTube/Link)"
              value={videoUrl}
              onChangeText={setVideoUrl}
              placeholder="https://youtube.com/watch?v=..."
              leftIcon="play_circle"
            />
            <View style={styles.infoBox}>
              <Icon name="info" size={22} color={colors.primaryFixed} />
              <Text style={styles.infoText}>
                Un buen video de highlights aumenta tus posibilidades de ser contactado en un{' '}
                <Text style={{ color: colors.primaryFixedDim, fontFamily: fonts.interBold }}>300%</Text>.
              </Text>
            </View>
          </View>
        )}

        {/* Navegación */}
        <View style={styles.nav}>
          {step > 1 ? (
            <Pressable onPress={prev} style={styles.prevBtn}>
              <Icon name="arrow_back_ios" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.prevText}>Anterior</Text>
            </Pressable>
          ) : <View />}
          <PrimaryButton
            label={loading ? 'Creando perfil...' : step === total ? 'Finalizar' : 'Siguiente'}
            icon={step === total ? 'rocket_launch' : 'arrow_forward_ios'}
            onPress={next}
            disabled={loading}
            style={{ minWidth: 170 }}
          />
        </View>
      </View>

      {/* Modal de éxito — botón lleva al perfil */}
      <Modal visible={showModal} onClose={() => {}} maxWidth={380}>
        <View style={{ alignItems: 'center', gap: 16 }}>
          <View style={styles.modalIcon}>
            <Icon name="check_circle" size={44} color={colors.onPrimaryFixed} />
          </View>
          <Text style={styles.modalTitle}>¡Perfil Creado!</Text>
          <Text style={styles.modalBody}>Tu camino a la élite comienza hoy. Los scouts ya pueden ver tu talento.</Text>
          <PrimaryButton
            label="Ver Mi Perfil"
            onPress={() => {
              setShowModal(false);
              onNavigate('profile');
            }}
            style={{ alignSelf: 'stretch' }}
          />
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body:          { padding: 16, paddingTop: 24 },
  stepper:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  stepItem:      { alignItems: 'center', gap: 6, flex: 1 },
  dot:           { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  dotActive:     { backgroundColor: colors.primaryFixedDim, borderColor: colors.primaryFixedDim },
  dotText:       { fontFamily: fonts.interBold, fontSize: 14, color: colors.onSurfaceVariant },
  stepLabel:     { fontFamily: fonts.interBold, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: colors.onSurfaceVariant },
  sectionTitle:  { fontFamily: fonts.oswald, fontSize: 30, color: colors.onSurface, textTransform: 'uppercase', marginBottom: 6, fontStyle: 'italic' },
  sectionSub:    { ...type.bodyMd, fontSize: 14, color: colors.onSurfaceVariant, marginBottom: 24 },
  fieldLabel:    { ...type.labelSm, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: fonts.interBold, marginBottom: 6 },
  row2:          { flexDirection: 'row', gap: 16 },
  toggleGroup:   { flexDirection: 'row', gap: 4, backgroundColor: colors.surfaceContainerHigh, padding: 4, borderRadius: 12 },
  toggle:        { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  toggleActive:  { backgroundColor: colors.primaryFixedDim },
  toggleText:    { fontFamily: fonts.interBold, fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase', color: colors.onSurfaceVariant },
  radioCard:     { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, backgroundColor: colors.surfaceContainerHigh, borderWidth: 2, borderColor: 'transparent', marginBottom: 10 },
  radioCardSel:  { borderColor: colors.primaryFixedDim, backgroundColor: colors.surfaceContainerHighest },
  radioIcon:     { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceContainerHighest, alignItems: 'center', justifyContent: 'center' },
  radioTitle:    { fontFamily: fonts.oswaldMedium, fontSize: 18, color: colors.onSurface },
  radioSub:      { ...type.labelSm, fontSize: 13, color: colors.onSurfaceVariant },
  proBox:        { backgroundColor: colors.surfaceContainerLow, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 16, padding: 20, marginTop: 4 },
  upload:        { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.outlineVariant, borderRadius: 16, paddingVertical: 32, alignItems: 'center', gap: 8, backgroundColor: colors.surfaceContainerLow },
  previewImg:    { width: 80, height: 80, borderRadius: 40 },
  uploadTitle:   { fontFamily: fonts.interBold, fontSize: 14, color: colors.onSurface },
  uploadSub:     { ...type.labelSm, color: colors.onSurfaceVariant },
  infoBox:       { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 16, borderRadius: 14, backgroundColor: colors.surfaceContainerHighest, borderLeftWidth: 4, borderLeftColor: colors.primaryFixedDim, marginTop: 4 },
  infoText:      { flex: 1, ...type.labelSm, fontSize: 13, color: colors.onSurfaceVariant, lineHeight: 19 },
  nav:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 28, borderTopWidth: 1, borderTopColor: colors.outlineVariant, marginTop: 16 },
  prevBtn:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 14, paddingHorizontal: 20 },
  prevText:      { fontFamily: fonts.interBold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.onSurfaceVariant },
  modalIcon:     { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primaryFixedDim, alignItems: 'center', justifyContent: 'center' },
  modalTitle:    { fontFamily: fonts.oswald, fontSize: 24, color: colors.onSurface, textTransform: 'uppercase', fontStyle: 'italic' },
  modalBody:     { ...type.bodyMd, fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center' },
});
