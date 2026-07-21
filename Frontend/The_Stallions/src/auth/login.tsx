import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import GoogleButton from '../components/GoogleButton';
import LangToggle from '../components/LangToggle';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { validateEmail } from '../utils/validators';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { t } = useLang();

  const handleGoogleToken = async (idToken: string) => {
    try {
      setLoading(true);
      const { data } = await authService.googleAuth(idToken);
      await signIn(data);
      router.replace('/(tabs)');
    } catch {
      setError(t.errorGoogle);
    } finally {
      setLoading(false);
    }
  };

  const { promptAsync, isReady } = useGoogleAuth(handleGoogleToken);

  const handleLogin = async () => {
    setError('');
    if (!validateEmail(email)) { setError(t.errorInvalidEmail); return; }
    if (password.length < 8) { setError(t.errorShortPassword); return; }
    try {
      setLoading(true);
      const { data } = await authService.login(email, password);
      await signIn(data);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.response?.data?.message || t.errorLogin);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <LangToggle style={styles.langBtn} />

        <Text style={styles.title}>{t.login}</Text>
        <Text style={styles.subtitle}>{t.loginSubtitle}</Text>

        <View style={styles.card}>
          <AuthInput label={t.email} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder={t.emailPlaceholder} />
          <AuthInput label={t.password} value={password} onChangeText={setPassword} secureTextEntry placeholder={t.passwordPlaceholder} />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <AuthButton title={t.loginButton} onPress={handleLogin} loading={loading} />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>{t.orContinueWith}</Text>
            <View style={styles.line} />
          </View>

          <GoogleButton onPress={() => promptAsync()} disabled={!isReady || loading} />
        </View>

        <Text style={styles.link} onPress={() => router.push('/(auth)/register')}>
          {t.noAccount} <Text style={styles.linkBold}>{t.signUpLink}</Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f1f5f9' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: '6%' },
  langBtn: { position: 'absolute', top: 48, right: '4%' },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 2, textAlign: 'center' },
  subtitle: { fontSize: 12, color: '#64748b', marginBottom: 14, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: '5%', width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  errorText: { color: '#ef4444', marginBottom: 8, textAlign: 'center', fontSize: 12 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  line: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { marginHorizontal: 8, color: '#94a3b8', fontSize: 12 },
  link: { marginTop: 14, textAlign: 'center', color: '#64748b', fontSize: 13 },
  linkBold: { color: '#6366f1', fontWeight: '700' },
});
