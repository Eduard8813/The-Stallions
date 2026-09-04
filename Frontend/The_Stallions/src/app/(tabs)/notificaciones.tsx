import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import api from '../../services/api';

type Notificacion = {
  id: number;
  tipo: 'like' | 'comentario';
  usuarioNombre: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
};

export default function NotificacionesScreen() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get<Notificacion[]>('/fotos/notificaciones');
      setNotificaciones(data);
    } catch {
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  const marcarLeida = async (n: Notificacion) => {
    if (n.leida) return;
    setNotificaciones((prev) => prev.map((x) => (x.id === n.id ? { ...x, leida: true } : x)));
    try {
      await api.put(`/fotos/notificaciones/${n.id}/leida`);
    } catch {
      // silencioso: no es crítico
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.topBar}>
        <Text style={styles.title}>Notificaciones</Text>
        <TouchableOpacity style={styles.campana} onPress={() => {}}>
          <Text style={{ fontSize: 20, color: '#69B6E6' }}>🔔</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator style={styles.center} size="large" color="#69B6E6" />
      ) : notificaciones.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>No tienes notificaciones todavía</Text>
        </View>
      ) : (
        <FlatList
          data={notificaciones}
          keyExtractor={(n) => String(n.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, !item.leida && styles.noLeida]}
              onPress={() => marcarLeida(item)}
            >
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>{item.usuarioNombre.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.mensaje, !item.leida && styles.mensajeNuevo]}>
                  {item.mensaje}
                </Text>
                <Text style={styles.fecha}>{item.fecha}</Text>
              </View>
              {!item.leida && <View style={styles.punto} />}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0b' },
  topBar: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    backgroundColor: '#000',
    paddingHorizontal: 14,
    paddingVertical: 4,
    position: 'relative',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '700', fontFamily: 'Gilroy-Bold' },
  campana: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    padding: 4,
  },
  center: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#999', fontSize: 15 },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1c1c1c',
  },
  noLeida: { backgroundColor: '#161016' },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#69B6E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 17, fontWeight: '700' },
  mensaje: { color: '#ddd', fontSize: 14 },
  mensajeNuevo: { color: '#fff', fontWeight: '700' },
  fecha: { color: '#777', fontSize: 12, marginTop: 2 },
  punto: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#69B6E6' },
});