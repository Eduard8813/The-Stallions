import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { useAsync } from '../../hooks/useAsync';
import { privacyService } from '../../services/privacyService';
import { systemPermissions } from '../../services/systemPermissions';
import {
  notificationsPermissions,
  openNotificationSettings,
} from '../../services/notificationsPermissions';
import { exportUserDataPdf } from '../../services/dataExportService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import type { PrivacySettings } from '../../services/userTypes';
import CenterLoading from '../../components/profile/CenterLoading';
import ErrorState from '../../components/profile/ErrorState';
import Section from '../../components/profile/Section';
import ToggleRow from '../../components/profile/ToggleRow';
import Button from '../../components/profile/Button';
import DeleteAccountModal from '../../components/profile/DeleteAccountModal';
import CenteredBox from '../../components/profile/CenteredBox';

interface DevicePerms {
  location: boolean;
  gallery: boolean;
  notifications: boolean;
}

function PrivacyContent({ initial }: { initial: PrivacySettings }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { user } = useAuth();

  const [settings, setSettings] = useState(initial);
  const [perms, setPerms] = useState<DevicePerms>({ location: false, gallery: false, notifications: false });
  const [permBusy, setPermBusy] = useState<Record<keyof DevicePerms, boolean>>({
    location: false,
    gallery: false,
    notifications: false,
  });
  const [banner, setBanner] = useState('');
  const [permNote, setPermNote] = useState('');
  const [exporting, setExporting] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  // Carga el estado REAL de los permisos del sistema al entrar a la pantalla.
  useEffect(() => {
    let active = true;
    (async () => {
      const [location, gallery, notif] = await Promise.all([
        systemPermissions.getStatus('location'),
        systemPermissions.getStatus('gallery'),
        notificationsPermissions.getStatus(),
      ]);
      if (active) {
        setPerms({ location, gallery, notifications: notif === 'granted' });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const updateSettings = (patch: Partial<PrivacySettings>) => {
    setBanner('');
    setSettings((prev) => ({ ...prev, ...patch }));
    privacyService.updateSettings(patch).catch((e: any) => {
      setBanner(e?.message ?? 'No se pudieron guardar los cambios.');
    });
  };

  // Sobrescribe la barra con el estado real del dispositivo (útil al volver de
  // la configuración del sistema).
  const refreshPerm = async (key: keyof DevicePerms) => {
    let granted = false;
    if (key === 'notifications') {
      granted = (await notificationsPermissions.getStatus()) === 'granted';
    } else {
      granted = await systemPermissions.getStatus(key);
    }
    setPerms((p) => ({ ...p, [key]: granted }));
  };

  const handlePermission = async (key: keyof DevicePerms, _value: boolean) => {
    setBanner('');
    setPermNote('');

    // Si el permiso ya está otorgado, la única forma de revocarlo es desde los
    // ajustes del sistema.
    if (perms[key]) {
      if (key === 'notifications') {
        try {
          await openNotificationSettings();
        } catch {
          await Linking.openSettings();
        }
        return;
      }
      try {
        await Linking.openSettings();
      } catch {
        // Sin gestión externa; se ignora.
      }
      return;
    }

    setPermBusy((b) => ({ ...b, [key]: true }));
    try {
      if (key === 'notifications') {
        const status = await notificationsPermissions.getStatus();
        if (status === 'undetermined') {
          const result = await notificationsPermissions.request();
          await refreshPerm('notifications');
          if (!result.granted) setPermNote('Para activar notificaciones, hechalo desde los ajustes del sistema.');
        } else if (status === 'denied') {
          try {
            await openNotificationSettings();
          } catch {
            await Linking.openSettings();
          }
        }
      } else {
        const result = await systemPermissions.request(key);
        await refreshPerm(key);
        if (result.opened) {
          setPermNote('Para activar este permiso, hechalo desde los ajustes del sistema y volvé a la app.');
        }
      }
      // Al reenfocar la pantalla la barra se superpone con Refocus si existe;
      // aquí ya refrescamos el estado real en refreshPerm.
    } catch (e: any) {
      setBanner(e?.message ?? 'No se pudo actualizar el permiso.');
    } finally {
      setPermBusy((b) => ({ ...b, [key]: false }));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setBanner('');
    try {
      await exportUserDataPdf({
        fullName: user?.fullName,
        email: user?.email,
      });
    } catch (e: any) {
      setBanner(e?.message ?? 'No se pudo generar la descarga de datos.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <CenteredBox>
      {banner ? <Text style={[styles.banner]}>{banner}</Text> : null}

      <Section title="Privacidad">
        <ToggleRow
          title="Mostrar mi correo"
          description="Que otros usuarios puedan ver tu correo"
          value={settings.showEmail}
          onValueChange={(v) => updateSettings({ showEmail: v })}
          last
        />
      </Section>

      <Section title="Permisos del sistema">
        <ToggleRow
          title="Ubicación"
          description="Permiso del dispositivo para usar el mapa"
          value={perms.location}
          onValueChange={(v) => handlePermission('location', v)}
          pending={permBusy.location}
        />
        <ToggleRow
          title="Notificaciones"
          description="Permiso del dispositivo para enviar alertas"
          value={perms.notifications}
          onValueChange={(v) => handlePermission('notifications', v)}
          pending={permBusy.notifications}
        />
        <ToggleRow
          title="Galería"
          description="Permiso del dispositivo para subir fotos"
          value={perms.gallery}
          onValueChange={(v) => handlePermission('gallery', v)}
          pending={permBusy.gallery}
          last
        />
        {permNote ? <Text style={styles.help}>{permNote}</Text> : null}
      </Section>

      <Section title="Datos y cuenta">
        <View style={styles.padding}>
          <Button title="Descargar mis datos" variant="outline" loading={exporting} onPress={handleExport} />
          <Text style={styles.help}>Se generará un PDF con los datos de tu cuenta.</Text>
        </View>
        <View style={styles.padding}>
          <Button title="Eliminar cuenta" variant="danger" onPress={() => setDeleteVisible(true)} />
          <Text style={styles.help}>Tu cuenta quedará suspendida y tu contenido se ocultará de la comunidad.</Text>
        </View>
      </Section>

      <DeleteAccountModal visible={deleteVisible} onClose={() => setDeleteVisible(false)} />
    </CenteredBox>
  );
}

export default function PrivacyScreen() {
  const load = (): Promise<PrivacySettings> => privacyService.getSettings();
  const { data, loading, error, refetch } = useAsync(load);

  if (loading) return <CenterLoading />;
  if (error || !data) return <ErrorState message={error ?? 'No se pudo cargar la privacidad.'} onRetry={refetch} />;
  return <PrivacyContent initial={data} />;
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    padding: { padding: 14 },
    help: { color: colors.subtext, fontSize: 12, marginTop: 10, lineHeight: 17, paddingHorizontal: 14, paddingBottom: 12 },
    banner: { color: colors.danger, fontSize: 13, marginBottom: 14 },
  });
