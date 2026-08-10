import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { localSettings } from '../services/localSettings';
import * as biometricsService from '../services/biometrics';
import { colors } from '../constants/ui';

/**
 * Locks the app with the biometric prompt while a signed-in user exists and
 * `biometricsEnabled` is on. Children render only after a successful unlock.
 */
export default function BiometricUnlockGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'unlocked' | 'locked' | 'idle'>('checking');
  const [prompting, setPrompting] = useState(false);
  const promptedOnce = useRef(false);

  const prompt = useCallback(async () => {
    setPrompting(true);
    try {
      const result = await biometricsService.authenticateAsync({
        promptMessage: 'Desbloquea Wani Connect',
        cancelLabel: 'Cancelar',
      });
      if (result.success) {
        setStatus('unlocked');
      }
    } catch {
      // Stay locked; the user can retry.
    } finally {
      setPrompting(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      if (loading) return;
      if (!user) {
        if (active) setStatus('idle');
        return;
      }
      if (Platform.OS === 'web') {
        if (active) setStatus('unlocked');
        return;
      }
      try {
        const settings = await localSettings.get();
        if (!settings.biometricsEnabled) {
          if (active) setStatus('unlocked');
          return;
        }
        if (active) setStatus('locked');
        if (!promptedOnce.current) {
          promptedOnce.current = true;
          prompt();
        }
      } catch {
        if (active) setStatus('unlocked');
      }
    })();
    return () => {
      active = false;
    };
  }, [user, loading, prompt]);

  if (status === 'checking' || status === 'idle' || status === 'unlocked') {
    return <>{children}</>;
  }

  const handleExit = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.title}>Wani Connect bloqueado</Text>
      <Text style={styles.subtitle}>Usá tu huella o Face ID para desbloquear la app.</Text>

      <TouchableOpacity
        style={[styles.button, prompting && styles.buttonDisabled]}
        onPress={prompt}
        disabled={prompting}
        activeOpacity={0.85}
      >
        {prompting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Desbloquear</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleExit} activeOpacity={0.7} style={styles.exitLink}>
        <Text style={styles.exitText}>Usar otra cuenta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: { fontSize: 56, marginBottom: 18 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.subtext, textAlign: 'center', marginTop: 8, marginBottom: 28, lineHeight: 20 },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
    minHeight: 48,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  exitLink: { marginTop: 20, padding: 8 },
  exitText: { color: colors.subtext, fontSize: 14, textDecorationLine: 'underline' },
});
