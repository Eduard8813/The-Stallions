import { Stack } from 'expo-router';
import { colors } from '../../constants/ui';

export default function ProfileStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="edit" options={{ title: 'Editar Perfil' }} />
      <Stack.Screen name="security" options={{ title: 'Seguridad y Acceso' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notificaciones' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacidad' }} />
      <Stack.Screen name="help" options={{ title: 'Ayuda y Soporte' }} />
    </Stack>
  );
}
