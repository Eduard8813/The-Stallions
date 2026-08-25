import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import api from '../../services/api';

type Foto = {
  id: number;
  url: string;
  visibilidad: 'privada' | 'publica';
};

export default function MisFotosScreen() {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadFotos = useCallback(async () => {
    try {
      const { data } = await api.get<Foto[]>('/fotos/mias');
      setFotos(data);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudieron cargar tus fotos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFotos();
    }, [loadFotos])
  );

  const toggleVisibilidad = async (foto: Foto) => {
    setBusyId(foto.id);
    try {
      const nueva = foto.visibilidad === 'publica' ? 'privada' : 'publica';
      await api.put(`/fotos/${foto.id}`, { visibilidad: nueva });
      setFotos((prev) => prev.map((f) => (f.id === foto.id ? { ...f, visibilidad: nueva } : f)));
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo cambiar la visibilidad');
    } finally {
      setBusyId(null);
    }
  };

  const eliminarFoto = (foto: Foto) => {
    Alert.alert('Eliminar foto', '¿Seguro que deseas eliminar esta foto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setBusyId(foto.id);
          try {
            await api.delete(`/fotos/${foto.id}`);
            setFotos((prev) => prev.filter((f) => f.id !== foto.id));
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'No se pudo eliminar la foto');
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Foto }) => (
    <View style={styles.gridItem}>
      <Image source={{ uri: item.url }} style={styles.gridImage} />
      <View
        style={[
          styles.badge,
          { backgroundColor: item.visibilidad === 'publica' ? '#1b8a3f' : '#555' },
        ]}
      >
        <Text style={styles.badgeText}>
          {item.visibilidad === 'publica' ? '🌍 Pública' : '🔒 Privada'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          disabled={busyId === item.id}
          onPress={() => toggleVisibilidad(item)}
        >
          <Text style={styles.actionText}>{busyId === item.id ? '…' : 'Cambiar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          disabled={busyId === item.id}
          onPress={() => eliminarFoto(item)}
        >
          <Text style={[styles.actionText, { color: '#ff5c5c' }]}>Borrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.topBar}>
        <Text style={styles.title}>Mis fotos</Text>
      </View>
      {loading ? (
        <ActivityIndicator style={styles.center} size="large" color="#e40077" />
      ) : fotos.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📸</Text>
          <Text style={styles.emptyText}>Aún no has subido fotos</Text>
          <Text style={styles.emptyHint}>Usa el botón de cámara para subir tu primera foto</Text>
        </View>
      ) : (
        <FlatList
          data={fotos}
          keyExtractor={(f) => String(f.id)}
          numColumns={3}
          renderItem={renderItem}
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadFotos} tintColor="#e40077" />
          }
        />
      )}
    </View>
  );
}

const GRID_GAP = 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  center: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyHint: { color: '#777', fontSize: 13, marginTop: 6, textAlign: 'center' },
  grid: { padding: GRID_GAP },
  gridItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: GRID_GAP / 2,
    position: 'relative',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gridImage: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  actionBtn: { flex: 1, paddingVertical: 6, alignItems: 'center' },
  deleteBtn: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' },
  actionText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
