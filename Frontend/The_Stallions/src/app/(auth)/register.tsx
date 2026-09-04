import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import AuthInput from '../../components/AuthInput';
import AuthButton from '../../components/AuthButton';
import GoogleButton from '../../components/GoogleButton';
import LangToggle from '../../components/LangToggle';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import { getAuthErrorMessage } from '../../utils/errors';
import { validateEmail, isEmpty } from '../../utils/validators';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
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
      await signIn({
        token: data.token,
        email: googleProfile?.email || data.email,
        fullName: googleProfile?.name || data.fullName,
        photo: googleProfile?.photo,
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(getAuthErrorMessage(e, t, t.errorGoogle));
    } finally {
      setLoading(false);
    }
  };

  const { promptAsync, isReady } = useGoogleAuth(handleGoogleToken);

  const handleRegister = async () => {
    setError('');
    if (isEmpty(fullName)) { setError(t.errorFullName); return; }
    if (isEmpty(email)) { setError(t.errorEmailRequired); return; }
    if (isEmpty(password)) { setError(t.errorPasswordRequired); return; }
    if (isEmpty(confirm)) { setError(t.errorConfirmPassword); return; }
    if (!validateEmail(email)) { setError(t.errorInvalidEmail); return; }
    if (password.length < 8) { setError(t.errorShortPassword); return; }
    if (password !== confirm) { setError(t.errorPasswordMatch); return; }
    try {
      setLoading(true);
      const { data } = await authService.register(email, password, fullName);
      await signIn(data);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(getAuthErrorMessage(e, t, t.errorRegister));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.flex}>
        <Image
          source={require('@/assets/images/auth-background.jpeg')}
          style={styles.background}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <LangToggle style={styles.langBtn} />

          <Text style={styles.title}>{t.register}</Text>
          <Text style={styles.subtitle}>{t.registerSubtitle}</Text>

          <Image source={require('@/assets/images/app-icon.png')} style={styles.logo} resizeMode="contain" />

          <View style={styles.card}>
            <AuthInput label={t.fullName} value={fullName} onChangeText={setFullName} placeholder={t.namePlaceholder} autoCapitalize="words" />
            <AuthInput label={t.email} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder={t.emailPlaceholder} />
            <AuthInput label={t.password} value={password} onChangeText={setPassword} secureTextEntry placeholder={t.passwordPlaceholder} />
            <AuthInput label={t.confirmPassword} value={confirm} onChangeText={setConfirm} secureTextEntry placeholder={t.passwordPlaceholder} />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <AuthButton title={t.registerButton} onPress={handleRegister} loading={loading} />

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>{t.orContinueWith}</Text>
              <View style={styles.line} />
            </View>

            <GoogleButton onPress={() => promptAsync()} disabled={!isReady || loading} />
          </View>

          <Text style={styles.link} onPress={() => router.back()}>
            {t.hasAccount} <Text style={styles.linkBold}>{t.signInLink}</Text>
          </Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#69B6E6' },
  background: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(21,98,162,0.6)' },
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: '6%', paddingVertical: 24 },
  langBtn: { alignSelf: 'flex-end', marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '800', fontFamily: 'Gilroy-Bold', color: '#ffffff', marginBottom: 2, textAlign: 'center' },
  subtitle: { fontSize: 12, fontFamily: 'Gilroy-Medium', color: 'rgba(255,255,255,0.9)', marginBottom: 14, textAlign: 'center' },
  logo: { width: 160, height: 160, marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 28, padding: '4%', width: '100%', maxWidth: 300, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  errorText: { color: '#ef4444', marginBottom: 8, textAlign: 'center', fontSize: 12 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  line: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { marginHorizontal: 8, color: '#94a3b8', fontSize: 12 },
  link: { marginTop: 14, textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontSize: 13 },
  linkBold: { color: '#ffffff', fontWeight: '700' },
});
