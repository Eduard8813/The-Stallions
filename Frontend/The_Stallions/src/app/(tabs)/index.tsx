import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AuthButton from '../../components/AuthButton';
import LangToggle from '../../components/LangToggle';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { t } = useLang();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <LangToggle style={styles.langBtn} />

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.fullName?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.title}>{t.welcome}</Text>
        <Text style={styles.name}>{user?.fullName || user?.email}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <AuthButton title={t.signOut} onPress={handleSignOut} variant="outline" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', justifyContent: 'center', paddingHorizontal: '6%', paddingVertical: 24 },
  langBtn: { position: 'absolute', top: 52, right: '6%' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: '7%', alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  avatar: { width: '18%', aspectRatio: 1, borderRadius: 999, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 6 },
  name: { fontSize: 16, fontWeight: '600', color: '#334155', marginBottom: 4 },
  email: { fontSize: 13, color: '#94a3b8' },
});
