import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Screen, Field, PrimaryButton, GlowBackground } from '../components/primitives';
import { TopBar } from '../components/chrome';
import { useNavigate } from '../navigation/useNavigate';
import { useRole } from '../context/RoleContext';
import { useAuth } from '../context/AuthContext';
import { auth } from '../api';
import { colors, fonts, type } from '../theme';

export default function Login() {
  const onNavigate = useNavigate();
  const { role } = useRole();
  const { setUser, setToken } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isRecruiter = role === 'reclutador';

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresá tu email y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const loginFn = isRecruiter ? auth.loginReclutador : auth.loginJugador;
      const data = await loginFn(email.trim(), password);

      setToken(data.token);
      setUser(data.user);

      onNavigate(isRecruiter ? 'inicio-reclutador' : 'inicio');
    } catch (err: any) {
      Alert.alert('Error al iniciar sesión', err?.message || 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <TopBar title="GolConnect" onBack={() => onNavigate('landing')} />
      <GlowBackground />

      <View style={styles.body}>
        <View style={{ marginBottom: 32 }}>
          <Text style={styles.title}>
            {isRecruiter ? 'PORTAL DE CLUBES' : 'BIENVENIDO DE NUEVO'}
          </Text>
          <Text style={styles.subtitle}>
            {isRecruiter
              ? 'Ingresá para gestionar tu red de scouting.'
              : 'Ingresá tus credenciales para continuar tu carrera.'}
          </Text>
        </View>

        <View style={styles.panel}>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            leftIcon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            leftIcon="lock"
            rightIcon={showPassword ? 'visibility_off' : 'visibility'}
            onRightIconPress={() => setShowPassword((v) => !v)}
          />
          <PrimaryButton
            label={loading ? 'Ingresando...' : 'Iniciar Sesión'}
            onPress={handleLogin}
            disabled={loading}
            style={{ marginTop: 8 }}
          />

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tenés cuenta? </Text>
            <Text
              style={styles.registerLink}
              onPress={() => onNavigate(isRecruiter ? 'registro-reclutador' : 'register', role)}
            >
              Regístrate
            </Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, paddingTop: 40 },
  title: { fontFamily: fonts.oswald, fontSize: 36, color: colors.white, textTransform: 'uppercase', marginBottom: 8 },
  subtitle: { ...type.bodyMd, color: colors.onSurfaceVariant },
  panel: { backgroundColor: 'rgba(40,42,43,0.5)', borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: 12, padding: 24 },
  forgot: { ...type.labelSm, color: colors.primaryFixed, textAlign: 'right', marginTop: -8, marginBottom: 16 },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { ...type.bodyMd, fontSize: 14, color: colors.onSurfaceVariant },
  registerLink: { ...type.bodyMd, fontSize: 14, color: colors.primaryFixed, fontFamily: fonts.interBold },
});
