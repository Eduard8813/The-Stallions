import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AuthInput from '../../components/AuthInput';
import AuthButton from '../../components/AuthButton';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';

export default function TwoFactorScreen() {
  const { challengeId, email } = useLocalSearchParams<{ challengeId?: string; email?: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { t } = useLang();

  const handleVerify = async () => {
    setError('');
    const clean = code.trim();
    if (!/^\d{6}$/.test(clean)) {
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
      <View style={styles.container}>
        <Text style={styles.title}>{t.twoFactorTitle}</Text>
        <Text style={styles.subtitle}>{t.twoFactorSubtitle.replace('{email}', email ?? '')}</Text>

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
        </View>

        <Text style={styles.link} onPress={() => router.replace('/(auth)/login')}>
          {t.twoFactorBack}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f1f5f9' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: '6%' },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 2, textAlign: 'center' },
  subtitle: { fontSize: 12, color: '#64748b', marginBottom: 14, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
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
  link: { marginTop: 14, textAlign: 'center', color: '#64748b', fontSize: 13 },
});
