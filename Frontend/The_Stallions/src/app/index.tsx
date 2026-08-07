import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import * as biometrics from '../services/biometrics';
import { localSettings, type LocalSettings } from '../services/localSettings';

const BIOMETRICS_SUPPORTED = Platform.OS !== 'web';

function BiometricGate({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<LocalSettings | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [prompting, setPrompting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    localSettings.get().then((s) => {
      if (active) setSettings(s);
    });
    return () => {
      active = false;
    };
  }, []);

  const runPrompt = useCallback(async () => {
    setPrompting(true);
    setError('');
    try {
      const { success } = await biometrics.authenticateAsync({
        promptMessage: 'Desbloqueá la app',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });
      if (success) setUnlocked(true);
      else setError('No se pudo verificar la identidad.');
    } catch {
      setError('No se pudo usar la biometría en este dispositivo.');
    } finally {
      setPrompting(false);
    }
  }, []);

  useEffect(() => {
    if (settings?.biometricsEnabled && BIOMETRICS_SUPPORTED && !unlocked) {
      const id = setTimeout(runPrompt, 0);
      return () => clearTimeout(id);
    }
  }, [settings, unlocked, runPrompt]);

  if (!settings) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (settings.biometricsEnabled && BIOMETRICS_SUPPORTED && !unlocked) {
    return (
      <View style={styles.lock}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>App bloqueada</Text>
        <Text style={styles.subtitle}>Usá tu huella o Face ID para entrar</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.btn} onPress={runPrompt} disabled={prompting} activeOpacity={0.85}>
          <Text style={styles.btnText}>{prompting ? 'Desbloqueando…' : 'Desbloquear'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

export default function IndexScreen() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <BiometricGate>
      <Redirect href="/(tabs)" />
    </BiometricGate>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: '8%',
  },
  icon: { fontSize: 56, marginBottom: 18 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 22 },
  error: { color: '#f87171', fontSize: 13, marginBottom: 16, textAlign: 'center' },
  btn: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
