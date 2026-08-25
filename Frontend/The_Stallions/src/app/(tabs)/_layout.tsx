import { Tabs, Redirect } from 'expo-router';
import { Text, View, ActivityIndicator, StyleSheet, type ColorValue } from 'react-native';
import { useAuth } from '../../context/AuthContext';

function TabIcon({ emoji, color, size }: { emoji: string; color: ColorValue; size?: number }) {
  return <Text style={{ fontSize: size ?? 22, color }}>{emoji}</Text>;
}

const icon = (emoji: string) => {
  function Icono({ color }: { color: ColorValue }) {
    return <TabIcon emoji={emoji} color={color} />;
  }
  return Icono;
};

function CameraIcon({ color }: { color: ColorValue }) {
  return (
    <View style={styles.cameraBtn}>
      <Text style={styles.cameraEmoji}>📷</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Explorar', tabBarIcon: icon('🧭') }}
      />
      <Tabs.Screen
        name="eventos"
        options={{ title: 'Eventos', tabBarIcon: icon('★') }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: '',
          tabBarIcon: CameraIcon,
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="comunidad"
        options={{ title: 'Comunidad', tabBarIcon: icon('🌍') }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: 'Perfil', tabBarIcon: icon('👤') }}
      />
      <Tabs.Screen name="misFotos"           options={{ href: null }} />
      <Tabs.Screen name="misFotosComunidad"  options={{ href: null }} />
      <Tabs.Screen name="notificaciones"     options={{ href: null }} />
      <Tabs.Screen name="mensajes"           options={{ href: null }} />
      <Tabs.Screen name="mapa"               options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#111',
    borderTopColor: '#222',
    height: 80,
    paddingBottom: 8,
  },
  cameraBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e40077',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    boxShadow: '0 4px 12px rgba(228, 0, 119, 0.4)',
  },
  cameraEmoji: {
    fontSize: 26,
  },
});
