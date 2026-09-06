import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import AuthInput from '../../components/AuthInput';
import AuthButton from '../../components/AuthButton';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { validateTotpCode } from '../../utils/validators';
import { brandGradient } from '../../constants/ui';

export default function TwoFactorScreen() {
  const { challengeId } = useLocalSearchParams<{ challengeId?: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { t } = useLang();

  const handleVerify = async () => {
    setError('');
    const clean = code.trim();
    if (!validateTotpCode(clean)) {
      setError(t.twoFactorError);
      return;
    }
    if (!challengeId) {
      setError(t.twoFactorInvalid);
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.verify2fa(challengeId, clean);
      await signIn(data);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? t.twoFactorInvalid);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={brandGradient} style={styles.flex}>
        <View style={styles.container}>
          <Image source={require('@/assets/images/app-icon.png')} style={styles.logo} resizeMode="contain" />

          <Text style={styles.title}>{t.twoFactorTitle}</Text>
          <Text style={styles.subtitle}>{t.twoFactorSubtitle}</Text>

          <View style={styles.card}>
            <AuthInput
              label={t.twoFactorCode}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="123456"
              autoFocus
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <AuthButton title={t.twoFactorVerify} onPress={handleVerify} loading={loading} />

            <Text style={styles.hint}>{t.twoFactorAppHint}</Text>
          </View>

          <Text style={styles.link} onPress={() => router.replace('/(auth)/login')}>
            {t.twoFactorBack}
          </Text>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#69B6E6' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: '6%' },
  logo: { width: 160, height: 160, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '800', fontFamily: 'Gilroy-Bold', color: '#ffffff', marginBottom: 2, textAlign: 'center' },
  subtitle: { fontSize: 12, fontFamily: 'Gilroy-Medium', color: 'rgba(255,255,255,0.9)', marginBottom: 14, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: '5%',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  errorText: { color: '#ef4444', marginBottom: 8, textAlign: 'center', fontSize: 12 },
  hint: { color: 'rgba(255,255,255,0.85)', marginTop: 10, textAlign: 'center', fontSize: 12 },
  link: { marginTop: 14, textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontSize: 13 },
});
