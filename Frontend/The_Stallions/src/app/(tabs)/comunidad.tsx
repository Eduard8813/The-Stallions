import React, { useCallback, useEffect, useState } from 'react';
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
  TextInput,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import api from '../../services/api';

type Comentario = {
  id: number;
  usuarioId: number | null;
  usuarioNombre: string;
  texto: string;
  fecha: string;
  editado: boolean;
};

type Foto = {
  id: number;
  url: string;
  usuarioNombre: string;
  usuarioAvatar: string | null;
  fecha: string;
  descripcion?: string | null;
  likes: number;
  likedByMe: boolean;
  comentarios: number;
};

const PAGE_SIZE = 10;

export default function ComunidadScreen() {
  const router = useRouter();
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hayMas, setHayMas] = useState(true);
  const [expandida, setExpandida] = useState<number | null>(null);
  const [miId, setMiId] = useState<number | null>(null);

  useEffect(() => {
    // ID del usuario autenticado para resaltar sus propios comentarios
    api.get('/user/profile')
      .then(({ data }) => setMiId(data.id != null ? Number(data.id) : null))
      .catch(() => {});
  }, []);

  const cargar = useCallback(
    async (pagina: number, reemplazar: boolean) => {
      if (reemplazar) setLoading(true);
      else setLoadingMore(true);
      try {
        const { data } = await api.get<Foto[]>('/fotos/comunidad', {
          params: { page: pagina, pageSize: PAGE_SIZE },
        });
        setFotos((prev) => (reemplazar ? data : [...prev, ...data]));
        setPage(pagina);
        setHayMas(data.length === PAGE_SIZE);
      } catch (e: any) {
        Alert.alert('Error', e?.response?.data?.message || 'No se pudo cargar la comunidad');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      cargar(1, true);
    }, [cargar])
  );

  const darLike = async (foto: Foto) => {
    // actualización optimista
    setFotos((prev) =>
      prev.map((f) =>
        f.id === foto.id
          ? { ...f, likedByMe: !f.likedByMe, likes: f.likes + (f.likedByMe ? -1 : 1) }
          : f
      )
    );
    try {
      await api.post(`/fotos/${foto.id}/like`);
    } catch (e: any) {
      // revertir si falla
      setFotos((prev) =>
        prev.map((f) =>
          f.id === foto.id
            ? { ...f, likedByMe: foto.likedByMe, likes: foto.likes }
            : f
        )
      );
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo registrar el like');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.topBar}>
        <Text style={styles.title}>Comunidad</Text>
        <TouchableOpacity
          style={styles.campana}
          onPress={() => router.push('/(tabs)/notificaciones')}
        >
          <Text style={{ fontSize: 20 }}>🔔</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator style={styles.center} size="large" color="#e40077" />
      ) : fotos.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🌍</Text>
          <Text style={styles.emptyText}>Aún no hay fotos en la comunidad</Text>
        </View>
      ) : (
        <FlatList
          data={fotos}
          keyExtractor={(f) => String(f.id)}
          onEndReached={() => {
            if (!loadingMore && hayMas) cargar(page + 1, false);
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator color="#e40077" /> : null}
          renderItem={({ item }) => (
            <Publicacion
              foto={item}
              miUsuarioId={miId}
              expandida={expandida === item.id}
              onLike={() => darLike(item)}
              onToggleComentarios={() =>
                setExpandida((prev) => (prev === item.id ? null : item.id))
              }
            />
          )}
        />
      )}
    </View>
  );
}

// ==================== PUBLICACIÓN ====================

function Publicacion({
  foto,
  miUsuarioId,
  expandida,
  onLike,
  onToggleComentarios,
}: {
  foto: Foto;
  miUsuarioId: number | null;
  expandida: boolean;
  onLike: () => void;
  onToggleComentarios: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {foto.usuarioAvatar ? (
          <Image source={{ uri: foto.usuarioAvatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>{foto.usuarioNombre.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.nombre}>{foto.usuarioNombre}</Text>
          <Text style={styles.fecha}>{foto.fecha}</Text>
        </View>
      </View>

      <Image source={{ uri: foto.url }} style={styles.imagen} resizeMode="cover" />

      {foto.descripcion ? (
        <View style={styles.descBox}>
          <Text style={styles.descTexto}>{foto.descripcion}</Text>
        </View>
      ) : null}

      <View style={styles.acciones}>
        <TouchableOpacity style={styles.accionBtn} onPress={onLike}>
          <Text style={[styles.accionTexto, foto.likedByMe && styles.likeActivo]}>
            {foto.likedByMe ? '❤️' : '🤍'} Me gusta ({foto.likes})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accionBtn} onPress={onToggleComentarios}>
          <Text style={styles.accionTexto}>💬 Comentar ({foto.comentarios})</Text>
        </TouchableOpacity>
      </View>

      {expandida && (
        <SeccionComentarios fotoId={foto.id} miUsuarioId={miUsuarioId} onChange={onToggleComentarios} />
      )}
    </View>
  );
}

// ==================== COMENTARIOS ====================

function SeccionComentarios({
  fotoId,
  miUsuarioId,
}: {
  fotoId: number;
  miUsuarioId: number | null;
  onChange?: () => void;
}) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [textoEdit, setTextoEdit] = useState('');

  useEffect(() => {
    let activo = true;
    api.get<Comentario[]>(`/fotos/${fotoId}/comentarios`)
      .then(({ data }) => {
        if (!activo) return;
        setComentarios(data);
      })
      .catch(() => {})
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [fotoId]);

  const enviar = async () => {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      const { data } = await api.post<Comentario>(`/fotos/${fotoId}/comentarios`, { texto: texto.trim() });
      setComentarios((prev) => [...prev, data]);
      setTexto('');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo publicar el comentario');
    } finally {
      setEnviando(false);
    }
  };

  const guardarEdicion = async (id: number) => {
    if (!textoEdit.trim()) return;
    try {
      const { data } = await api.put<Comentario>(`/comentarios/${id}`, { texto: textoEdit.trim() });
      setComentarios((prev) => prev.map((c) => (c.id === id ? { ...c, texto: data.texto, editado: true } : c)));
      setEditandoId(null);
      setTextoEdit('');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'No se pudo editar el comentario');
    }
  };

  const eliminar = (id: number) => {
    Alert.alert('Eliminar comentario', '¿Seguro que deseas eliminar este comentario?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/comentarios/${id}`);
            setComentarios((prev) => prev.filter((c) => c.id !== id));
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'No se pudo eliminar el comentario');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.comentariosBox}>
      {cargando ? (
        <ActivityIndicator color="#e40077" style={{ paddingVertical: 12 }} />
      ) : comentarios.length === 0 ? (
        <Text style={styles.sinComentarios}>Sé el primero en comentar</Text>
      ) : (
        comentarios.map((c) => {
          const esMio = miUsuarioId != null && c.usuarioId === miUsuarioId;
          return (
            <View key={c.id} style={styles.comentario}>
              <View style={[styles.avatarSmall, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>{c.usuarioNombre.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.comentarioAutor}>
                  {c.usuarioNombre} <Text style={styles.comentarioFecha}>· {c.fecha}{c.editado ? ' · editado' : ''}</Text>
                </Text>
                {editandoId === c.id ? (
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={textoEdit}
                      onChangeText={setTextoEdit}
                      autoFocus
                    />
                    <TouchableOpacity onPress={() => guardarEdicion(c.id)}>
                      <Text style={styles.linkGuardar}>Guardar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditandoId(null)}>
                      <Text style={styles.linkCancelar}>X</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.comentarioTexto}>{c.texto}</Text>
                    {esMio && (
                      <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
                        <TouchableOpacity onPress={() => { setEditandoId(c.id); setTextoEdit(c.texto); }}>
                          <Text style={styles.linkEditar}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => eliminar(c.id)}>
                          <Text style={styles.linkEliminar}>Eliminar</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>
          );
        })
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un comentario..."
          placeholderTextColor="#666"
          value={texto}
          onChangeText={setTexto}
          multiline
        />
        <TouchableOpacity style={styles.enviarBtn} onPress={enviar} disabled={enviando || !texto.trim()}>
          <Text style={[styles.enviarTexto, (!texto.trim() || enviando) && { opacity: 0.5 }]}>
            {enviando ? '…' : 'Enviar'}
          </Text>
        </TouchableOpacity>
      </View>
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
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  campana: { position: 'absolute', right: 14 },
  center: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#999', fontSize: 15 },

  card: { backgroundColor: '#111', marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { backgroundColor: '#e40077', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: '#fff', fontSize: 16, fontWeight: '700' },
  nombre: { color: '#fff', fontSize: 14, fontWeight: '700' },
  fecha: { color: '#888', fontSize: 12 },

  imagen: { width: '100%', aspectRatio: 1 },

  descBox: { paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1f1f1f' },
  descTexto: { color: '#eee', fontSize: 14, lineHeight: 20 },

  acciones: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#222' },
  accionBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  accionTexto: { color: '#ccc', fontSize: 13, fontWeight: '600' },
  likeActivo: { color: '#ff4d6d' },

  comentariosBox: { paddingHorizontal: 12, paddingBottom: 12, backgroundColor: '#181818' },
  sinComentarios: { color: '#777', fontSize: 13, paddingVertical: 10 },
  comentario: { flexDirection: 'row', gap: 8, paddingVertical: 6 },
  avatarSmall: { width: 28, height: 28, borderRadius: 14 },
  comentarioAutor: { color: '#ddd', fontSize: 12, fontWeight: '700' },
  comentarioFecha: { color: '#777', fontSize: 11, fontWeight: '400' },
  comentarioTexto: { color: '#eee', fontSize: 13, marginTop: 2 },
  linkEditar: { color: '#4da3ff', fontSize: 12 },
  linkEliminar: { color: '#ff5c5c', fontSize: 12 },
  linkGuardar: { color: '#37d67a', fontSize: 12, fontWeight: '700' },
  linkCancelar: { color: '#999', fontSize: 12 },

  inputRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
  },
  enviarBtn: { justifyContent: 'center', paddingHorizontal: 8 },
  enviarTexto: { color: '#e40077', fontWeight: '700', fontSize: 13 },
});
