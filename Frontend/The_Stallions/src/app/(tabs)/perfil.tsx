import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAsync } from '../../hooks/useAsync';
import { userService } from '../../services/userService';
import {
  notificationsService,
  buildMasterPatch,
  isNotificationsOn,
} from '../../services/notificationsService';
import {
  notificationsPermissions,
  openNotificationSettings,
  type NotificationPermissionStatus,
} from '../../services/notificationsPermissions';
import { localSettings } from '../../services/localSettings';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/ui';
import Avatar from '../../components/profile/Avatar';
import Section from '../../components/profile/Section';
import ListRow from '../../components/profile/ListRow';
import ToggleRow from '../../components/profile/ToggleRow';
import CenteredBox from '../../components/profile/CenteredBox';
import CenterLoading from '../../components/profile/CenterLoading';
import ErrorState from '../../components/profile/ErrorState';
import Button from '../../components/profile/Button';
import ConfirmModal from '../../components/profile/ConfirmModal';

type DeviceNotificationStatus = NotificationPermissionStatus | 'checking';

export default function PerfilScreen() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const { data: profile, loading, error, refetch, setData } = useAsync(() => userService.getProfile());
  const [signingOut, setSigningOut] = useState(false);
  const [photoUpdating, setPhotoUpdating] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState<DeviceNotificationStatus>('checking');
  const [notificationsBusy, setNotificationsBusy] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [deniedModalVisible, setDeniedModalVisible] = useState(false);
  const [disabledInfoVisible, setDisabledInfoVisible] = useState(false);

  const syncNotificationState = useCallback(async () => {
    setDeviceStatus('checking');
    try {
      const [settings, status] = await Promise.all([
        notificationsService.getSettings(),
        notificationsPermissions.getStatus(),
      ]);
      const preferenceOn = isNotificationsOn(settings);
      setNotificationsOn(preferenceOn);
      setDeviceStatus(status);
      const stored = await localSettings.get();
      await localSettings.set({
        ...stored,
        permissions: { ...stored.permissions, notifications: status === 'granted' && preferenceOn },
      });
    } catch {
      setDeviceStatus('unavailable');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      syncNotificationState();
    }, [syncNotificationState])
  );

  const persistNotificationPreference = async (enabled: boolean) => {
    const stored = await localSettings.get();
    await localSettings.set({
      ...stored,
      permissions: { ...stored.permissions, notifications: enabled },
    });
    await notificationsService.updateSettings(buildMasterPatch(enabled));
  };

  const handleNotifications = async (value: boolean) => {
    setNotificationsError('');
    setNotificationsBusy(true);
    if (value) {
      try {
        const status = await notificationsPermissions.getStatus();
        if (status === 'granted') {
          await persistNotificationPreference(true);
          setNotificationsOn(true);
          setDeviceStatus('granted');
        } else if (status === 'undetermined') {
          const result = await notificationsPermissions.request();
          if (result.granted) {
            await persistNotificationPreference(true);
            setNotificationsOn(true);
            setDeviceStatus('granted');
          } else {
            setNotificationsOn(false);
            setDeviceStatus(result.status);
            if (result.status === 'denied') setDeniedModalVisible(true);
          }
        } else if (status === 'denied') {
          setNotificationsOn(false);
          setDeviceStatus('denied');
          setDeniedModalVisible(true);
        } else {
          setNotificationsOn(false);
          setDeviceStatus('unavailable');
          setNotificationsError('Las notificaciones no están disponibles en este dispositivo.');
        }
      } catch {
        setNotificationsOn(false);
        setNotificationsError('No se pudieron activar las notificaciones.');
      }
    } else {
      const previous = notificationsOn;
      try {
        await notificationsPermissions.disableDeviceChannel();
        await persistNotificationPreference(false);
        setNotificationsOn(false);
        setDisabledInfoVisible(true);
      } catch {
        setNotificationsOn(previous);
        setNotificationsError('No se pudieron desactivar las notificaciones.');
      }
    }
    setNotificationsBusy(false);
  };

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
            icon="📸"
            title="Mis fotos"
            subtitle="Fotos subidas, visibilidad y borrado"
            chevron
            onPress={() => router.push('/(tabs)/misFotos')}
          />
          <ListRow
            icon="✏️"
            title="Editar perfil"
            subtitle="Datos personales y foto"
            chevron
            onPress={() => router.push('/profile/edit')}
          />
          <ListRow
            icon="🔔"
            title="Notificaciones"
            subtitle="Likes y comentarios en tus fotos"
            chevron
            onPress={() => router.push('/(tabs)/notificaciones')}
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
          <ToggleRow
            title="Notificaciones"
            description={
              deviceStatus === 'denied'
                ? 'Permiso denegado en el sistema. Tocá para ir a Ajustes'
                : deviceStatus === 'unavailable'
                  ? 'No disponibles en este dispositivo'
                  : deviceStatus === 'granted' && notificationsOn
                    ? 'Activadas · alertas de la app'
                    : 'Activá todas las alertas de la app'
            }
            value={deviceStatus === 'granted' && notificationsOn}
            onValueChange={handleNotifications}
            pending={notificationsBusy || deviceStatus === 'checking'}
          />
          {notificationsError ? <Text style={styles.notificationsError}>{notificationsError}</Text> : null}
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

      <ConfirmModal
        visible={deniedModalVisible}
        title="Permiso de notificaciones"
        message="Sin el permiso del sistema, Wani Connect no puede enviarte notificaciones. Activá el permiso desde Ajustes del sistema para poder encenderlas."
        confirmLabel="Ir a Ajustes"
        cancelLabel="Cancelar"
        onConfirm={() => {
          setDeniedModalVisible(false);
          openNotificationSettings().catch(() => {});
        }}
        onCancel={() => setDeniedModalVisible(false)}
      />

      <ConfirmModal
        visible={disabledInfoVisible}
        title="Notificaciones desactivadas"
        message="Ya no recibirás notificaciones. Si querés revocar el permiso por completo, podés hacerlo desde Ajustes del sistema."
        confirmLabel="Ir a Ajustes"
        cancelLabel="Entendido"
        onConfirm={() => {
          setDisabledInfoVisible(false);
          openNotificationSettings().catch(() => {});
        }}
        onCancel={() => setDisabledInfoVisible(false)}
      />
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
  notificationsError: { color: colors.danger, fontSize: 12, paddingHorizontal: 14, paddingVertical: 6 },
  version: { textAlign: 'center', color: colors.subtext, fontSize: 12, marginTop: 18 },
});
