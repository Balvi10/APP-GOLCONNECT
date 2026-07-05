import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Screen, Field, PrimaryButton } from '../components/primitives';
import { TopBar } from '../components/chrome';
import { useNavigate } from '../navigation/useNavigate';
import { avisos as apiAvisos } from '../api';
import { colors, fonts, type } from '../theme';

export default function CrearAviso() {
  const onNavigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [nombre, setNombre]         = useState('');
  const [posicion, setPosicion]     = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [lugar, setLugar]           = useState('');
  const [edadMin, setEdadMin]       = useState('');
  const [edadMax, setEdadMax]       = useState('');
  const [estaturaMin, setEstaturaMin] = useState('');
  const [habilidades, setHabilidades] = useState('');
  const [requisitos, setRequisitos] = useState('');

  const handleCrear = async () => {
    if (!nombre.trim() || !posicion.trim()) {
      Alert.alert('Campos requeridos', 'El nombre del aviso y la posición son obligatorios.');
      return;
    }
    setLoading(true);
    try {
      await apiAvisos.crear({
        nombre:              nombre.trim(),
        posicion_requerida:  posicion.trim(),
        descripcion:         descripcion || null,
        lugar:               lugar       || null,
        edad_minima:         edadMin     ? parseInt(edadMin)     : null,
        edad_maxima:         edadMax     ? parseInt(edadMax)     : null,
        estatura_minima_cm:  estaturaMin ? parseInt(estaturaMin) : null,
        habilidades_clave:   habilidades || null,
        requisitos_ingreso:  requisitos  || null,
      });
      Alert.alert('¡Aviso publicado!', 'Los jugadores ya pueden postularse.', [
        { text: 'OK', onPress: () => onNavigate('inicio-reclutador') },
      ]);
    } catch (err) {
      Alert.alert('Error al publicar', err.message ?? 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <TopBar title="CREAR AVISO" onBack={() => onNavigate('back')} />
      <View style={styles.body}>

        <Text style={styles.sectionTitle}>Detalles del Aviso</Text>
        <Field label="Nombre del aviso *"    value={nombre}      onChangeText={setNombre}      placeholder="Ej. Búsqueda Delantero 2025" />
        <Field label="Posición requerida *"  value={posicion}    onChangeText={setPosicion}    placeholder="Ej. Delantero Centro" />
        <Field label="Descripción"           value={descripcion} onChangeText={setDescripcion} placeholder="Describí el perfil que buscás..." multiline />
        <Field label="Lugar de la prueba"    value={lugar}       onChangeText={setLugar}       placeholder="Ej. Estadio Metropolitano" leftIcon="location_on" />

        <Text style={styles.sectionTitle}>Requisitos Físicos</Text>
        <View style={styles.row2}>
          <Field label="Edad mínima" value={edadMin}     onChangeText={setEdadMin}     placeholder="18" keyboardType="numeric" style={{ flex: 1 }} />
          <Field label="Edad máxima" value={edadMax}     onChangeText={setEdadMax}     placeholder="25" keyboardType="numeric" style={{ flex: 1 }} />
        </View>
        <Field label="Estatura mínima (cm)"  value={estaturaMin} onChangeText={setEstaturaMin} placeholder="175" keyboardType="numeric" />

        <Text style={styles.sectionTitle}>Perfil Deportivo</Text>
        <Field label="Habilidades clave"     value={habilidades} onChangeText={setHabilidades} placeholder="Velocidad, definición, juego aéreo..." />
        <Field label="Requisitos de ingreso" value={requisitos}  onChangeText={setRequisitos}  placeholder="Experiencia mínima requerida..." multiline />

        <PrimaryButton
          label={loading ? 'Publicando...' : 'Publicar Aviso'}
          icon="campaign"
          onPress={handleCrear}
          disabled={loading}
          style={{ marginTop: 24 }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body:         { padding: 16 },
  sectionTitle: { fontFamily: fonts.oswald, fontSize: 22, color: colors.primaryFixed, textTransform: 'uppercase', marginTop: 24, marginBottom: 12, letterSpacing: 0.5 },
  row2:         { flexDirection: 'row', gap: 16 },
});
