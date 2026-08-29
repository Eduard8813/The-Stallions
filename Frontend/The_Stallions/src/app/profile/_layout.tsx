import { Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileStackLayout() {
  const { colors } = useTheme();
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
      <Stack.Screen name="privacy" options={{ title: 'Privacidad' }} />
      <Stack.Screen name="help" options={{ title: 'Ayuda y Soporte' }} />
    </Stack>
  );
}
