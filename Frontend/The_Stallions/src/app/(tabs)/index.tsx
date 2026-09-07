import React, { useCallback, useEffect, useState } from 'react';
import { Image, View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from 'expo-router';
import NicaraguaMap from '../../components/NicaraguaMap';

export default function ExplorarScreen() {
  const [cargando, setCargando] = useState(true);
  const [resetCount, setResetCount] = useState(0);
  const navigation = useNavigation();

  const onMapaListo = useCallback(() => setCargando(false), []);

  // Cuando se pulsa el tab "Explorar" estando ya en él, reiniciar el mapa.
  useEffect(() => {
    const unsub = navigation.addListener('tabPress' as any, () => {
      setResetCount((n) => n + 1);
    });
    return unsub;
  }, [navigation]);

  // Cada vez que se enfoca la pestaña "Explorar" se pide al mapa volver a la vista inicial.
  useFocusEffect(
    useCallback(() => {
      setResetCount((n) => n + 1);
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Image
        source={require('@/assets/images/auth-background.jpeg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={styles.fondoOverlay} pointerEvents="none" />
      <View style={styles.mapArea}>
        {cargando && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#69B6E6" />
          </View>
        )}
        <NicaraguaMap onReady={onMapaListo} resetToken={resetCount} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  fondoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  mapArea: { flex: 1 },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});