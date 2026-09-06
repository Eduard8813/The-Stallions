import { Tabs, Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Image, type ColorValue } from 'react-native';
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
    const base = size ?? 24;
    const s = focused ? base - 2 : base - 4;
    const iconColor = focused ? '#ffffff' : color;
    return (
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <TabIcon name={n} color={iconColor} size={s} />
      </View>
    );
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

function ImageTabIcon({ src, color, size, focused, extra = 0 }: IconoProps & { src: number; extra?: number }) {
  const base = (size ?? 26) + extra;
  const s = focused ? base : base - 3;
  const tint = focused ? '#ffffff' : color;
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Image
        source={src}
        style={{ width: s, height: s, tintColor: tint }}
        resizeMode="contain"
      />
    </View>
  );
}

const BRAND_BAR = '#69B6E6';
const BLUE = '#1B6CE0';

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
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: { ...styles.tabBar, backgroundColor: '#ffffff', borderTopColor: '#e8eef5' },
        tabBarActiveTintColor: BLUE,
        tabBarInactiveTintColor: BLUE,
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
        options={{
          title: t.tabCommunity,
          tabBarIcon: ({ color, focused, size }) => (
            <ImageTabIcon
              src={require('../../../assets/images/tabIcons/comunidad.png')}
              color={color}
              focused={focused}
              size={size}
              extra={4}
            />
          ),
        }}
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
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: BLUE,
    marginTop: 2,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  iconWrapActive: {
    backgroundColor: BLUE,
  },
  cameraBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -14,
    boxShadow: '0 4px 12px rgba(27, 108, 224, 0.4)',
  },
});
