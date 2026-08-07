import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAsync } from '../../hooks/useAsync';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/ui';
import Avatar from '../../components/profile/Avatar';
import Section from '../../components/profile/Section';
import ListRow from '../../components/profile/ListRow';
import CenteredBox from '../../components/profile/CenteredBox';
import CenterLoading from '../../components/profile/CenterLoading';
import ErrorState from '../../components/profile/ErrorState';
import Button from '../../components/profile/Button';

export default function PerfilScreen() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const { data: profile, loading, error, refetch, setData } = useAsync(() => userService.getProfile());
  const [signingOut, setSigningOut] = useState(false);
  const [photoUpdating, setPhotoUpdating] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await userService.logout(); // emite logged-out; SessionBridge redirige a login
    } catch {
      setSigningOut(false);
    }
  };

  const handleChangePhoto = async () => {
    setPhotoError('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPhotoError('Se necesita acceso a la galería para cambiar la foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const uri = asset.uri;
    setPhotoUpdating(true);
    try {
      const { photoUrl } = await userService.uploadProfilePhoto(uri, {
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
      setData((prev) => (prev ? { ...prev, photoUrl } : prev));
      await updateUser({ photo: photoUrl });
    } catch (e: any) {
      setPhotoError(e?.message ?? 'No se pudo cambiar la foto.');
    } finally {
      setPhotoUpdating(false);
    }
  };

  if (loading) return <CenterLoading />;
  if (error || !profile) return <ErrorState message={error ?? 'No se pudo cargar el perfil.'} onRetry={refetch} />;

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const hasIdentity = Boolean(fullName || profile.username || profile.email);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <CenteredBox>
        <Text style={styles.headerTitle}>Mi Perfil</Text>

        <View style={styles.profileCard}>
          <Avatar
            uri={profile.photoUrl}
            name={fullName}
            size={84}
            onEditPress={photoUpdating ? undefined : handleChangePhoto}
          />
          {photoUpdating ? <Text style={styles.photoHint}>Subiendo foto…</Text> : null}
          {photoError ? <Text style={styles.photoError}>{photoError}</Text> : null}
          {hasIdentity ? (
            <>
              {fullName ? <Text style={styles.name}>{fullName}</Text> : null}
              {profile.username ? <Text style={styles.username}>@{profile.username}</Text> : null}
              {profile.email ? <Text style={styles.email}>{profile.email}</Text> : null}
            </>
          ) : null}
        </View>

        <Section title="Cuenta">
          <ListRow
            icon="✏️"
            title="Editar perfil"
            subtitle="Datos personales y foto"
            chevron
            onPress={() => router.push('/profile/edit')}
          />
          <ListRow
            icon="🔒"
            title="Seguridad y acceso"
            subtitle="Contraseña, sesiones y 2FA"
            chevron
            last
            onPress={() => router.push('/profile/security')}
          />
        </Section>

        <Section title="Preferencias">
          <ListRow
            icon="🔔"
            title="Notificaciones"
            subtitle="Alertas, categorías y no molestar"
            chevron
            onPress={() => router.push('/profile/notifications')}
          />
          <ListRow
            icon="🕶️"
            title="Privacidad"
            subtitle="Visibilidad, bloqueos y datos"
            chevron
            last
            onPress={() => router.push('/profile/privacy')}
          />
        </Section>

        <Section title="Soporte">
          <ListRow
            icon="🛟"
            title="Ayuda y Soporte"
            subtitle="Centro de ayuda, términos y cuenta"
            chevron
            last
            onPress={() => router.push('/profile/help')}
          />
        </Section>

        <Button title="Cerrar sesión" variant="outline" loading={signingOut} onPress={handleSignOut} />
        <Text style={styles.version}>Wani Connect · v1.0.0</Text>
      </CenteredBox>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8 },
  profileCard: { alignItems: 'center', marginVertical: 14 },
  name: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 12 },
  username: { fontSize: 14, color: colors.accent, marginTop: 2, fontWeight: '600' },
  email: { fontSize: 13, color: colors.subtext, marginTop: 4 },
  photoHint: { color: colors.accent, fontSize: 12, marginTop: 10, fontWeight: '600' },
  photoError: { color: colors.danger, fontSize: 12, marginTop: 10, textAlign: 'center' },
  version: { textAlign: 'center', color: colors.subtext, fontSize: 12, marginTop: 18 },
});
