import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import api, { resolveResourceUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';

const PAGE_SIZE = 10;
const SCREEN_W = Dimensions.get('window').width;

type FotoItem = {
  id: number;
  url: string;
  visibilidad: 'privada' | 'publica';
  usuarioNombre: string;
  usuarioAvatar: string | null;
  fecha: string;
  descripcion?: string | null;
  likes: number;
  likedByMe: boolean;
  comentarios: number;
  fotos?: FotoItem[];
};

type Comentario = {
  id: number;
  usuarioId: number | null;
  usuarioNombre: string;
  texto: string;
  fecha: string;
  editado: boolean;
};

export default function MisFotosComunidadScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [tab, setTab] = useState<'misFotos' | 'comunidad'>('misFotos');
  const [misFotos, setMisFotos] = useState<FotoItem[]>([]);
  const [loadingMisFotos, setLoadingMisFotos] = useState(true);
  const [refreshingMisFotos, setRefreshingMisFotos] = useState(false);

  const [comunidad, setComunidad] = useState<FotoItem[]>([]);
  const [loadingComunidad, setLoadingComunidad] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hayMas, setHayMas] = useState(true);
  const [miId, setMiId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id != null) {
      setMiId(Number(user.id));
    }
  }, [user]);

  const cargarMisFotos = useCallback(async () => {
    if (refreshingMisFotos) return;
    setLoadingMisFotos(true);
    try {
      const { data } = await api.get<FotoItem[]>('/fotos/mias');
      setMisFotos(data);
    } catch (e: any) {
      console.error('Error cargando mis fotos:', e);
    } finally {
      setLoadingMisFotos(false);
      setRefreshingMisFotos(false);
    }
  }, [refreshingMisFotos]);

  const cargarComunidad = useCallback(
    async (pagina: number, reemplazar: boolean) => {
      if (reemplazar) setLoadingComunidad(true);
      else setLoadingMore(true);
      try {
        const { data } = await api.get<FotoItem[]>('/fotos/comunidad/posts', {
          params: { page: pagina, pageSize: PAGE_SIZE },
        });
        setComunidad((prev) => (reemplazar ? data : [...prev, ...data]));
        setPage(pagina);
        setHayMas(data.length === PAGE_SIZE);
      } catch (e: any) {
        console.error('Error cargando comunidad:', e);
      } finally {
        setLoadingComunidad(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      if (tab === 'misFotos') {
        cargarMisFotos();
      } else {
        cargarComunidad(1, true);
      }
    }, [tab, cargarMisFotos, cargarComunidad])
  );

  const toggleTab = (newTab: 'misFotos' | 'comunidad') => {
    setTab(newTab);
  };

  const darLike = async (foto: FotoItem) => {
    setMisFotos((prev) =>
      prev.map((f) =>
        f.id === foto.id
          ? { ...f, likedByMe: !f.likedByMe, likes: f.likes + (f.likedByMe ? -1 : 1) }
          : f
      )
    );
    try {
      await api.post(`/fotos/${foto.id}/like`);
    } catch (e: any) {
      setMisFotos((prev) =>
        prev.map((f) =>
          f.id === foto.id
            ? { ...f, likedByMe: foto.likedByMe, likes: foto.likes }
            : f
        )
      );
      Alert.alert('Error', 'No se pudo registrar el like');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.topBar}>
        <Text style={styles.tabTitle}>{tab === 'misFotos' ? 'Mis fotos' : 'Comunidad'}</Text>
        <TouchableOpacity
          style={[styles.tabBtn, { backgroundColor: tab === 'misFotos' ? '#e40077' : '#333' }]}
          onPress={() => toggleTab('misFotos')}
        >
          <Text style={styles.tabBtnText}>Mis fotos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, { backgroundColor: tab === 'comunidad' ? '#e40077' : '#333' }]}
          onPress={() => toggleTab('comunidad')}
        >
          <Text style={styles.tabBtnText}>Comunidad</Text>
        </TouchableOpacity>
      </View>

      {tab === 'misFotos' ? (
        <View style={styles.screenContent}>
          {loadingMisFotos ? (
            <ActivityIndicator style={styles.center} size="large" color="#e40077" />
          ) : misFotos.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📸</Text>
              <Text style={styles.emptyText}>Aún no has subido fotos</Text>
              <Text style={styles.emptyHint}>Usa el botón de cámara para subir tu primera foto</Text>
            </View>
          ) : (
            <FlatList
              data={misFotos}
              keyExtractor={(f) => String(f.id)}
              numColumns={3}
              renderItem={({ item }) => renderFotoItem(item, 'misFotos')}
              contentContainerStyle={styles.grid}
              refreshControl={
                <RefreshControl
                  refreshing={refreshingMisFotos}
                  onRefresh={cargarMisFotos}
                  tintColor="#e40077"
                />
              }
            />
          )}
        </View>
      ) : (
        <View style={styles.screenContent}>
          {loadingComunidad ? (
            <ActivityIndicator style={styles.center} size="large" color="#e40077" />
          ) : comunidad.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🌍</Text>
              <Text style={styles.emptyText}>Aún no hay fotos en la comunidad</Text>
            </View>
          ) : (
            <FlatList
              data={comunidad}
              keyExtractor={(f) => String(f.id)}
              onEndReached={() => {
                if (!loadingMore && hayMas) cargarComunidad(page + 1, false);
              }}
              onEndReachedThreshold={0.3}
              ListFooterComponent={loadingMore ? <ActivityIndicator color="#e40077" /> : null}
              renderItem={({ item }) => renderFotoItem(item, 'comunidad')}
            />
          )}
        </View>
      )}
    </View>
  );
}

function renderFotoItem(foto: FotoItem, mode: 'misFotos' | 'comunidad') {
  const isLiked = foto.likedByMe;
  const likeText = `${foto.likes} ${isLiked ? 'Me gusta' : 'Gostar'}`;

  if (mode === 'misFotos') {
    return (
      <View style={styles.gridItem}>
        <Image source={{ uri: resolveResourceUrl(foto.url) }} style={styles.gridImage} />
        <View
          style={[
            styles.badge,
            { backgroundColor: foto.visibilidad === 'publica' ? '#1b8a3f' : '#555' },
          ]}
        >
          <Text style={styles.badgeText}>
            {foto.visibilidad === 'publica' ? '🌍 Pública' : '🔒 Privada'}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => {/* toggle visibility */}}>
            <Text style={styles.actionText}>Cambiar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => {/* delete foto */}}
          >
            <Text style={[styles.actionText, { color: '#ff5c5c' }]}>Borrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  } else {
    const fotos = foto.fotos && foto.fotos.length > 0 ? foto.fotos : [foto];
    const multi = fotos.length > 1;
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          {foto.usuarioAvatar ? (
            <Image source={{ uri: resolveResourceUrl(foto.usuarioAvatar) }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>
                {foto.usuarioNombre.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.nombre}>{foto.usuarioNombre}</Text>
            <Text style={styles.fecha}>{foto.fecha}</Text>
          </View>
          {multi ? <Text style={styles.multCount}>{fotos.length} 📸</Text> : null}
        </View>

        {multi ? (
          <View>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {fotos.map((f) => (
                <Image
                  key={String(f.id)}
                  source={{ uri: resolveResourceUrl(f.url) }}
                  style={[styles.imagen, { width: SCREEN_W }]}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            <View style={styles.masIndicador}>
              <Text style={styles.masIndicadorText}>+{fotos.length}</Text>
            </View>
          </View>
        ) : (
          <Image source={{ uri: resolveResourceUrl(foto.url) }} style={styles.imagen} resizeMode="cover" />
        )}

        {foto.descripcion ? (
          <View style={styles.descBox}>
            <Text style={styles.descTexto}>{foto.descripcion}</Text>
          </View>
        ) : null}

        <View style={styles.acciones}>
          <TouchableOpacity
            style={styles.accionBtn}
            onPress={() => {
              // Like toggle se maneja en la pantalla principal; se deja vacío aquí.
            }}
          >
            <Text style={[styles.accionTexto, isLiked && styles.likeActivo]}>
              {isLiked ? '❤️' : '🤍'} Me gusta ({foto.likes})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.accionBtn} onPress={() => {/* toggle comments */}}>
            <Text style={styles.accionTexto}>💬 Comentar ({foto.comentarios})</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0b' },
  topBar: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tabTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  screenContent: { padding: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyHint: { color: '#777', fontSize: 13, marginTop: 6, textAlign: 'center' },
  grid: { padding: 2 },
  gridItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 2 / 2,
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
    padding: 6,
  },
  actionBtn: { flex: 1, paddingVertical: 6, alignItems: 'center' },
  deleteBtn: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' },
  actionText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  card: { backgroundColor: '#111', marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { backgroundColor: '#e40077', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: '#fff', fontSize: 16, fontWeight: '700' },
  nombre: { color: '#fff', fontSize: 14, fontWeight: '700' },
  fecha: { color: '#888', fontSize: 12 },
  multCount: { color: '#e40077', fontSize: 13, fontWeight: '700' },

  imagen: { width: '100%', aspectRatio: 1 },

  masIndicador: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  masIndicadorText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  descBox: { paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1f1f1f' },
  descTexto: { color: '#eee', fontSize: 14, lineHeight: 20 },

  acciones: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#222' },
  accionBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  accionTexto: { color: '#ccc', fontSize: 13, fontWeight: '600' },
  likeActivo: { color: '#ff4d6d' },
});