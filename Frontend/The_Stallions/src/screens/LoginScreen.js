import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import GoogleButton from '../components/GoogleButton';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { validateEmail } from '../utils/validators';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleGoogleToken = async (idToken) => {
    try {
      setLoading(true);
      const { data } = await authService.googleAuth(idToken);
      await signIn(data);
    } catch (e) {
      setError('No se pudo iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  const { promptAsync, isReady } = useGoogleAuth(handleGoogleToken);

  const handleLogin = async () => {
    setError('');
    if (!validateEmail(email)) {
      setError('Ingresa un correo válido');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      setLoading(true);
      const { data } = await authService.login(email, password);
      await signIn(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Iniciar sesión</Text>

      <AuthInput placeholder="Correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <AuthInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <AuthButton title="Ingresar" onPress={handleLogin} loading={loading} />
      <GoogleButton onPress={() => promptAsync()} disabled={!isReady || loading} />

      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        ¿No tienes cuenta? Regístrate
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  errorText: { color: '#D32F2F', marginBottom: 12, textAlign: 'center' },
  link: { marginTop: 20, textAlign: 'center', color: '#1976D2' },
});