import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';
import GoogleButton from '../components/GoogleButton';
import LangToggle from '../components/LangToggle';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { getAuthErrorMessage } from '../utils/errors';
import { validateEmail, isEmpty } from '../utils/validators';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { t } = useLang();

  const handleGoogleToken = async (
    idToken: string,
    googleProfile?: { name: string; email: string; photo: string | null }
  ) => {
    try {
      setLoading(true);
      const { data } = await authService.googleAuth(idToken);
      if (data?.requiresTwoFactor) {
        router.push({
          pathname: '/(auth)/two-factor',
          params: { challengeId: data.challengeId, email: googleProfile?.email || data.email },
        });
        return;
      }
      await signIn({
        token: data.token,
        email: googleProfile?.email || data.email,
        fullName: googleProfile?.name || data.fullName,
        photo: googleProfile?.photo,
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      console.error('Google login backend error:', e.response?.status, e.response?.data, e.message);
      setError(getAuthErrorMessage(e, t, t.errorGoogle));
    } finally {
      setLoading(false);
    }
  };

  const { promptAsync, isReady } = useGoogleAuth(handleGoogleToken);

  const handleLogin = async () => {
    setError('');
    if (isEmpty(email)) { setError(t.errorEmailRequired); return; }
    if (isEmpty(password)) { setError(t.errorPasswordRequired); return; }
    if (!validateEmail(email)) { setError(t.errorInvalidEmail); return; }
    if (password.length < 8) { setError(t.errorShortPassword); return; }
    try {
      setLoading(true);
      const { data } = await authService.login(email, password);
      if (data?.requiresTwoFactor) {
        router.push({
          pathname: '/(auth)/two-factor',
          params: { challengeId: data.challengeId, email: data.email },
        });
        return;
      }
      await signIn(data);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(getAuthErrorMessage(e, t, t.errorLogin, true));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <LangToggle style={styles.langBtn} />

        <Image source={require('../../assets/images/logo-glow.png')} style={styles.logo} resizeMode="contain" />

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
  logo: { width: 160, height: 160, marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: '5%', width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  errorText: { color: '#ef4444', marginBottom: 8, textAlign: 'center', fontSize: 12 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  line: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { marginHorizontal: 8, color: '#94a3b8', fontSize: 12 },
  link: { marginTop: 14, textAlign: 'center', color: '#64748b', fontSize: 13 },
  linkBold: { color: '#6366f1', fontWeight: '700' },
});
