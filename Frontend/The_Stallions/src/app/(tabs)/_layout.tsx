import { Tabs, Redirect } from 'expo-router';
import { Text, View, ActivityIndicator, StyleSheet, type ColorValue } from 'react-native';
import { useAuth } from '../../context/AuthContext';

function TabIcon({ emoji, color }: { emoji: string; color: ColorValue }) {
  return <Text style={{ fontSize: 22, color }}>{emoji}</Text>;
}

const icon = (emoji: string) => {
  function Icono({ color }: { color: ColorValue }) {
    return <TabIcon emoji={emoji} color={color} />;
  }
  return Icono;
};

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
        tabBarStyle: { backgroundColor: '#111', borderTopColor: '#222', height: 80, paddingBottom: 8 },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index"          options={{ title: 'Explorar', tabBarIcon: icon('🧭') }} />
      <Tabs.Screen name="eventos"        options={{ title: 'Eventos',  tabBarIcon: icon('★') }} />
<<<<<<< HEAD
      <Tabs.Screen name="camera"         options={{
        tabBarIcon: ({ color }: { color: ColorValue }) => (
          <View style={styles.cameraContainer}>
            <Text style={[styles.cameraIcon, { color }]}>📷</Text>
          </View>
        ),
        title: ' ',
      }} />
      <Tabs.Screen name="comunidad"      options={{ title: 'Comunidad', tabBarIcon: icon('🌍') }} />
=======
      <Tabs.Screen name="misFotosComunidad" options={{ title: 'Mis fotos', tabBarIcon: icon('📸') }} />
>>>>>>> frontend
      <Tabs.Screen name="perfil"         options={{ title: 'Perfil',   tabBarIcon: icon('👤') }} />
      <Tabs.Screen name="notificaciones" options={{ href: null }} />
      <Tabs.Screen name="mensajes"       options={{ href: null }} />
      <Tabs.Screen name="mapa"           options={{ href: null }} />
    </Tabs>
    <View style={styles.fabContainer}>
      <TouchableOpacity style={styles.fabButton} onPress={() => router.push('/(tabs)/camera')}>
        <Text style={styles.fabIcon}>📷</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e40077',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(228, 0, 119, 0.4)',
  },
  fabIcon: {
    width: 32,
    height: 32,
    color: '#fff',
    fontSize: 32,
  },
});