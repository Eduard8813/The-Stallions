import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useAsync } from '../../hooks/useAsync';
import * as biometricsService from '../../services/biometrics';
import { userService } from '../../services/userService';
import { localSettings } from '../../services/localSettings';
import { EVENTS, events } from '../../services/events';
import { useTheme } from '../../context/ThemeContext';
import type { UserSession } from '../../services/userTypes';
import CenterLoading from '../../components/profile/CenterLoading';
import ErrorState from '../../components/profile/ErrorState';
import Section from '../../components/profile/Section';
import Field from '../../components/profile/Field';
import ToggleRow from '../../components/profile/ToggleRow';
import ListRow from '../../components/profile/ListRow';
import Button from '../../components/profile/Button';
import CenteredBox from '../../components/profile/CenteredBox';
import TOTPSetupModal from '../../components/profile/TOTPSetupModal';

interface SecurityData {
  twoFactorEnabled: boolean;
  sessions: UserSession[];
}

function platformIcon(session: UserSession): string {
  if (session.platform === 'ios') return '📱';
  if (session.platform === 'android') return '🤖';
  return '🖥️';
}

function SecurityContent({ initial }: { initial: SecurityData }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [twoFactor, setTwoFactor] = useState(initial.twoFactorEnabled);
  const [twoFactorPending, setTwoFactorPending] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; otpAuthUrl: string | null } | null>(null);
  const [biometrics, setBiometrics] = useState(false);
  const [banner, setBanner] = useState('');

  const [sessions, setSessions] = useState(initial.sessions);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);

  useEffect(() => {
    let active = true;
    localSettings.get().then((s) => {
      if (active) setBiometrics(s.biometricsEnabled);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);
    if (!currentPassword) return setPasswordError('Ingresá tu contraseña actual.');
    if (newPassword.length < 8) return setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
    if (newPassword !== confirmPassword) return setPasswordError('Las contraseñas nuevas no coinciden.');
    if (newPassword === currentPassword) return setPasswordError('La nueva contraseña debe ser distinta a la actual.');

    setPasswordPending(true);
    try {
      await userService.changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setPasswordError(e?.message ?? 'No se pudo cambiar la contraseña.');
    } finally {
      setPasswordPending(false);
    }
  };

  const handleTwoFactor = async (value: boolean) => {
    setTwoFactorPending(true);
    setBanner('');
    const previous = twoFactor;
    setTwoFactor(value);
    try {
      const settings = await userService.setTwoFactor(value);
      if (value && settings.secret) {
        setSetupData({ secret: settings.secret, otpAuthUrl: settings.otpAuthUrl ?? null });
      }
    } catch (e: any) {
      setTwoFactor(previous);
      setBanner(e?.message ?? 'No se pudo actualizar la verificación en dos pasos.');
    } finally {
      setTwoFactorPending(false);
    }
  };

  const handleBiometrics = async (value: boolean) => {
    setBanner('');
    if (value) {
      if (Platform.OS === 'web') {
        setBanner('El desbloqueo biométrico no está disponible en la web.');
        return;
      }
      const hasHardware = await biometricsService.hasHardwareAsync();
      const isEnrolled = await biometricsService.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        setBanner('Este dispositivo no tiene huella o Face ID configurado.');
        return;
      }
      const auth = await biometricsService.authenticateAsync({
        promptMessage: 'Confirmá tu identidad para activar el desbloqueo biométrico',
        cancelLabel: 'Cancelar',
      });
      if (!auth.success) {
        setBanner('No se pudo verificar tu identidad. Intentá de nuevo.');
        return;
      }
    }
    const previous = biometrics;
    setBiometrics(value);
    try {
      const settings = await localSettings.get();
      await localSettings.set({ ...settings, biometricsEnabled: value });
    } catch {
      setBiometrics(previous);
    }
  };

  const handleRevoke = async (session: UserSession) => {
    setRevokingId(session.id);
    try {
      await userService.revokeSession(session.id);
      if (session.isCurrent) {
        events.emit(EVENTS.loggedOut); // SessionBridge firma sesión y redirige a login
        return;
      }
      setSessions((list) => list.filter((s) => s.id !== session.id));
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <CenteredBox>
      {banner ? <Text style={styles.errorText}>{banner}</Text> : null}

      <Section title="Contraseña">
        <View style={styles.padding}>
          <Field label="Contraseña actual" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="••••••••" />
          <Field label="Nueva contraseña" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Mínimo 8 caracteres" />
          <Field label="Confirmar nueva contraseña" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Repetí la nueva contraseña" />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          {passwordSuccess ? <Text style={styles.successText}>Contraseña actualizada.</Text> : null}
          <Button title="Actualizar contraseña" loading={passwordPending} onPress={handleChangePassword} />
        </View>
      </Section>

      <Section title="Autenticación">
        <ToggleRow
          title="Verificación en dos pasos (2FA)"
          description="Con tu app de autenticación (Google Authenticator, Authy)"
          value={twoFactor}
          onValueChange={handleTwoFactor}
          pending={twoFactorPending}
        />
        <ToggleRow title="Desbloqueo biométrico" description="Huella o Face ID para entrar a la app" value={biometrics} onValueChange={handleBiometrics} last />
      </Section>

      <Section title="Sesiones activas">
        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>No hay sesiones activas.</Text>
        ) : (
          sessions.map((session) => (
            <ListRow
              key={session.id}
              icon={platformIcon(session)}
              title={session.device}
              subtitle={`${session.location} · ${session.lastActive}`}
              last={session === sessions[sessions.length - 1]}
              right={
                <TouchableOpacity
                  onPress={() => handleRevoke(session)}
                  disabled={revokingId === session.id}
                  style={styles.miniBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.miniBtnText}>
                    {revokingId === session.id ? '…' : session.isCurrent ? 'Cerrar' : 'Cerrar sesión'}
                  </Text>
                </TouchableOpacity>
              }
            />
          ))
        )}
      </Section>

      <TOTPSetupModal
        visible={!!setupData}
        secret={setupData?.secret ?? ''}
        otpAuthUrl={setupData?.otpAuthUrl ?? null}
        onClose={() => setSetupData(null)}
      />
    </CenteredBox>
  );
}

export default function SecurityScreen() {
  const load = async (): Promise<SecurityData> => {
    const [settings, sessions] = await Promise.all([
      userService.getSecuritySettings(),
      userService.getSessions(),
    ]);
    return { twoFactorEnabled: settings.twoFactorEnabled, sessions };
  };
  const { data, loading, error, refetch } = useAsync(load);

  if (loading) return <CenterLoading />;
  if (error || !data) return <ErrorState message={error ?? 'No se pudo cargar la seguridad.'} onRetry={refetch} />;
  return <SecurityContent initial={data} />;
}

const createStyles = (colors: any) => StyleSheet.create({
  padding: { padding: 14 },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: 14 },
  successText: { color: colors.success, fontSize: 13, marginBottom: 12 },
  emptyText: { color: colors.subtext, fontSize: 13, padding: 14 },
  miniBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  miniBtnText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  miniBtnTextDanger: { color: colors.danger, fontSize: 13, fontWeight: '700' },
});
