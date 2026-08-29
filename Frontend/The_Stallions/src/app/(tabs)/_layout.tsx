import { Tabs, Redirect } from 'expo-router';
import { Text, View, ActivityIndicator, StyleSheet, type ColorValue } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { useTheme } from '../../context/ThemeContext';

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
  void color;
  return (
    <View style={styles.cameraBtn}>
      <Text style={styles.cameraEmoji}>📷</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const { colors } = useTheme();

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
        tabBarStyle: { ...styles.tabBar, backgroundColor: colors.tabBar, borderTopColor: colors.tabBorder },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t.tabExplore, tabBarIcon: icon('🧭') }}
      />
      <Tabs.Screen
        name="eventos"
        options={{ title: t.tabEvents, tabBarIcon: icon('★') }}
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
        options={{ title: t.tabCommunity, tabBarIcon: icon('🌍') }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: t.tabProfile, tabBarIcon: icon('👤') }}
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
