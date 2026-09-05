import { Tabs, Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, type ColorValue } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';

type IconoProps = { color: ColorValue; size?: number; focused?: boolean };

function TabIcon({ name, color, size }: { name: string; color: ColorValue; size: number }) {
  return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
}

const icon = (name: string, nameFocused: string) => {
  function Icono({ color, size, focused }: IconoProps) {
    const n = focused ? nameFocused : name;
    const s = focused ? (size ?? 24) + 6 : size ?? 24;
    return <TabIcon name={n} color={color} size={s} />;
  }
  return Icono;
};

function CameraIcon({ color }: { color: ColorValue }) {
  void color;
  return (
    <View style={styles.cameraBtn}>
      <MaterialCommunityIcons name="camera-outline" size={26} color="#ffffff" />
    </View>
  );
}

const BRAND_BAR = '#69B6E6';
const ACTIVE_TINT = '#ffffff';
const INACTIVE_TINT = 'rgba(255,255,255,0.6)';

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const { t } = useLang();

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
        tabBarShowLabel: false,
        tabBarStyle: { ...styles.tabBar, backgroundColor: BRAND_BAR, borderTopColor: BRAND_BAR },
        tabBarActiveTintColor: ACTIVE_TINT,
        tabBarInactiveTintColor: INACTIVE_TINT,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t.tabExplore, tabBarIcon: icon('compass-outline', 'compass') }}
      />
      <Tabs.Screen
        name="eventos"
        options={{ title: t.tabEvents, tabBarIcon: icon('calendar-outline', 'calendar') }}
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
        options={{ title: t.tabCommunity, tabBarIcon: icon('earth', 'earth') }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: t.tabProfile, tabBarIcon: icon('account-outline', 'account') }}
      />
      <Tabs.Screen name="misFotos"           options={{ href: null }} />
      <Tabs.Screen name="misFotosComunidad"  options={{ href: null }} />
      <Tabs.Screen name="notificaciones"     options={{ href: null }} />
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
    backgroundColor: BRAND_BAR,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    boxShadow: '0 4px 12px rgba(105, 182, 230, 0.4)',
  },
});
