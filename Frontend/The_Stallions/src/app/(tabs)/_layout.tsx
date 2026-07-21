import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const icon = (emoji: string) =>
  ({ color }: { color: string }) =>
    <Text style={{ fontSize: 22, color }}>{emoji}</Text>;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#111', borderTopColor: '#222', height: 64, paddingBottom: 8 },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Explorar', tabBarIcon: icon('🧭') }} />
      <Tabs.Screen name="mensajes" options={{ title: 'Mensajes', tabBarIcon: icon('💬') }} />
      <Tabs.Screen name="mapa"     options={{ title: 'Mapa',     tabBarIcon: icon('🌍') }} />
      <Tabs.Screen name="perfil"   options={{ title: 'Perfil',   tabBarIcon: icon('👤') }} />
    </Tabs>
  );
}
