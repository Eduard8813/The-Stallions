import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAsync } from '../../hooks/useAsync';
import { privacyService } from '../../services/privacyService';
import { localSettings } from '../../services/localSettings';
import { useTheme } from '../../context/ThemeContext';
import type { BlockedUser, PrivacySettings, ProfileVisibility } from '../../services/userTypes';
import CenterLoading from '../../components/profile/CenterLoading';
import ErrorState from '../../components/profile/ErrorState';
import Section from '../../components/profile/Section';
import ToggleRow from '../../components/profile/ToggleRow';
import ListRow from '../../components/profile/ListRow';
import SelectChips from '../../components/profile/SelectChips';
import Button from '../../components/profile/Button';
import DeleteAccountModal from '../../components/profile/DeleteAccountModal';
import CenteredBox from '../../components/profile/CenteredBox';

const VISIBILITY_OPTIONS: { label: string; value: ProfileVisibility }[] = [
  { label: 'Público', value: 'public' },
  { label: 'Contactos', value: 'contacts' },
  { label: 'Privado', value: 'private' },
];

const VISIBILITY_HELP: Record<ProfileVisibility, string> = {
  public: 'Cualquier persona puede ver tu perfil.',
  contacts: 'Solo tus contactos pueden ver tu perfil.',
  private: 'Nadie fuera de tu lista aprobada puede verlo.',
};

interface PrivacyData {
  settings: PrivacySettings;
  blocked: BlockedUser[];
}

function PrivacyContent({ initial }: { initial: PrivacyData }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [settings, setSettings] = useState(initial.settings);
  const [blocked, setBlocked] = useState(initial.blocked);
  const [permissions, setPermissions] = useState({ location: false, notifications: false, gallery: false });
  const [banner, setBanner] = useState('');
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  useEffect(() => {
    let active = true;
    localSettings.get().then((s) => {
      if (active) setPermissions(s.permissions);
    });
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

  const handlePermission = async (key: keyof typeof permissions, value: boolean) => {
    const previous = permissions[key];
    setPermissions((p) => ({ ...p, [key]: value }));
    try {
      const stored = await localSettings.get();
      await localSettings.set({ ...stored, permissions: { ...stored.permissions, [key]: value } });
    } catch {
      setPermissions((p) => ({ ...p, [key]: previous }));
    }
  };

  const handleUnblock = async (userId: string) => {
    setUnblockingId(userId);
    try {
      await privacyService.unblockUser(userId);
      setBlocked((list) => list.filter((u) => u.id !== userId));
    } catch (e: any) {
      setBanner(e?.message ?? 'No se pudo desbloquear al usuario.');
    } finally {
      setUnblockingId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setExportDone(false);
    setBanner('');
    try {
      await privacyService.requestDataExport();
      setExportDone(true);
      setBanner('Solicitud recibida. Te avisaremos cuando tus datos estén listos.');
    } catch (e: any) {
      setBanner(e?.message ?? 'No se pudo iniciar la descarga de datos.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <CenteredBox>
      {banner ? <Text style={[styles.banner, exportDone && styles.successText]}>{banner}</Text> : null}

      <Section title="Visibilidad del perfil">
        <View style={styles.padding}>
          <SelectChips
            options={VISIBILITY_OPTIONS}
            value={settings.visibility}
            onChange={(v) => updateSettings({ visibility: v })}
          />
          <Text style={styles.help}>{VISIBILITY_HELP[settings.visibility]}</Text>
        </View>
        <ToggleRow title="Mostrar mi ubicación" description="Aparece en el mapa para los demás" value={settings.showLocation} onValueChange={(v) => updateSettings({ showLocation: v })} />
        <ToggleRow title="Mostrar mi correo" value={settings.showEmail} onValueChange={(v) => updateSettings({ showEmail: v })} />
        <ToggleRow title="Mostrar mi teléfono" value={settings.showPhone} onValueChange={(v) => updateSettings({ showPhone: v })} />
        <ToggleRow title="Perfil descubrible" description="Que otros usuarios puedan encontrarme" value={settings.discoverable} onValueChange={(v) => updateSettings({ discoverable: v })} last />
      </Section>

      <Section title="Permisos del sistema">
        <ToggleRow title="Ubicación" description="Permiso del dispositivo para usar el mapa" value={permissions.location} onValueChange={(v) => handlePermission('location', v)} />
        <ToggleRow title="Notificaciones" description="Permiso del dispositivo para enviar alertas" value={permissions.notifications} onValueChange={(v) => handlePermission('notifications', v)} />
        <ToggleRow title="Galería" description="Permiso del dispositivo para subir fotos" value={permissions.gallery} onValueChange={(v) => handlePermission('gallery', v)} last />
      </Section>

      <Section title="Usuarios bloqueados">
        {blocked.length === 0 ? (
          <Text style={styles.emptyText}>No tenés usuarios bloqueados.</Text>
        ) : (
          blocked.map((user) => (
            <ListRow
              key={user.id}
              icon="🚫"
              title={user.name}
              subtitle={`@${user.username}`}
              last={user === blocked[blocked.length - 1]}
              right={
                <TouchableOpacity onPress={() => handleUnblock(user.id)} disabled={unblockingId === user.id} style={styles.miniBtn} activeOpacity={0.7}>
                  <Text style={styles.miniBtnText}>{unblockingId === user.id ? '…' : 'Desbloquear'}</Text>
                </TouchableOpacity>
              }
            />
          ))
        )}
      </Section>

      <Section title="Datos y cuenta">
        <View style={styles.padding}>
          <Button title="Descargar mis datos" variant="outline" loading={exporting} onPress={handleExport} />
          <Text style={styles.help}>Recibirás un enlace de descarga con tus datos personales.</Text>
        </View>
        <View style={styles.padding}>
          <Button title="Eliminar cuenta" variant="danger" onPress={() => setDeleteVisible(true)} />
        </View>
      </Section>

      <DeleteAccountModal visible={deleteVisible} onClose={() => setDeleteVisible(false)} />
    </CenteredBox>
  );
}

export default function PrivacyScreen() {
  const load = async (): Promise<PrivacyData> => {
    const [settings, blocked] = await Promise.all([privacyService.getSettings(), privacyService.getBlockedUsers()]);
    return { settings, blocked };
  };
  const { data, loading, error, refetch } = useAsync(load);

  if (loading) return <CenterLoading />;
  if (error || !data) return <ErrorState message={error ?? 'No se pudo cargar la privacidad.'} onRetry={refetch} />;
  return <PrivacyContent initial={data} />;
}

const createStyles = (colors: any) => StyleSheet.create({
  padding: { padding: 14 },
  help: { color: colors.subtext, fontSize: 12, marginTop: 10, lineHeight: 17 },
  banner: { color: colors.danger, fontSize: 13, marginBottom: 14 },
  successText: { color: colors.success },
  emptyText: { color: colors.subtext, fontSize: 13, padding: 14 },
  miniBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  miniBtnText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
});
