import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl, StatusBar, TouchableOpacity, Image as RNImage } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function MisFotosScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [tab, setTab] = useState<'misFotos' | 'comunidad'>('misFotos');
  const [fotos, setFotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFotos = useCallback(async () => {
    setLoading(true);
    try {
      const token = await (await import('../../services/token')).getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      if (tab === 'misFotos') {
        const { data } = await api.get<any[]>('/fotos/mias', { headers });
        setFotos(data);
      } else {
        const { data } = await api.get<any[]>('/fotos/comunidad', { headers });
        setFotos(data);
      }
    } catch (e: any) {
      console.error('Error loading fotos:', e?.message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useFocusEffect(() => {
    loadFotos();
  });

  const handleRefresh = () => {
    setTab(tab => tab === 'misFotos' ? 'comunidad' : 'misFotos');
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.topBar}>
        <Text style={styles.title}>Wani Connect</Text>
        <TouchableOpacity style={styles.tabBtn} onPress={() => setTab('misFotos')}>
          <Text style={[styles.tabText, { color: tab === 'misFotos' ? '#e40077' : '#aaa' }]}>Mis fotos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => setTab('comunidad')}>
          <Text style={[styles.tabText, { color: tab === 'comunidad' ? '#e40077' : '#aaa' }]}>Comunidad</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loading}>
            <Text>Cargando fotos...</Text>
            {refreshing && <RefreshControl refreshing={true} onRefresh={handleRefresh} />}
          </View>
        ) : fotos.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {tab === 'misFotos' ? 'Aún no tienes fotos. Sube tu primera usando el botón de cámara.' : 'Aún no hay fotos en la comunidad.'}
            </Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {fotos.map((foto) => (
              <View key={foto.id} style={styles.gridItem}>
                <RNImage source={{ uri: foto.url }} style={styles.gridImage} />
                <View style={styles.infoContainer}>
                  <Text style={styles.infoTitle}>{foto.usuarioNombre || 'Usuario'}</Text>
                  <Text style={styles.infoDate}>{foto.fecha}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    height: 50,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 16,
  },
  tabBtn: {
    padding: 8,
  },
  tabText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  content: { flex: 1, padding: 16 },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: { color: '#666', fontSize: 14 },
  infoContainer: {
    padding: 8,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoDate: {
    color: '#666',
    fontSize: 10,
  },
  gridContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  gridImage: { width: '100%', height: '100%', resizeMode: 'cover' },
});