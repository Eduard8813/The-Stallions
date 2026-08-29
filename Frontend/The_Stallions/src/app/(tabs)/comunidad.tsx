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
import api, { resolveResourceUrl } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LangContext';

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
  const { colors, mode } = useTheme();
  const { t } = useLang();
  const styles = createStyles(colors);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hayMas, setHayMas] = useState(true);
  const [expandida, setExpandida] = useState<number | null>(null);
  const [miId, setMiId] = useState<number | null>(null);

  useEffect(() => {
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
        Alert.alert('Error', e?.response?.data?.message || t.communityErrorLoad);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [t]
  );

  useFocusEffect(
    useCallback(() => {
      cargar(1, true);
    }, [cargar])
  );

  const darLike = async (foto: Foto) => {
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
      setFotos((prev) =>
        prev.map((f) =>
          f.id === foto.id
            ? { ...f, likedByMe: foto.likedByMe, likes: foto.likes }
            : f
        )
      );
      Alert.alert('Error', e?.response?.data?.message || t.communityErrorLike);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={colors.surface} />
      <View style={styles.topBar}>
        <Text style={styles.title}>{t.tabCommunity}</Text>
        <TouchableOpacity
          style={styles.campana}
          onPress={() => router.push('/(tabs)/notificaciones')}
        >
          <Text style={{ fontSize: 20 }}>🔔</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator style={styles.center} size="large" color={colors.cameraBtn} />
      ) : fotos.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🌍</Text>
          <Text style={styles.emptyText}>{t.communityEmpty}</Text>
        </View>
      ) : (
        <FlatList
          data={fotos}
          keyExtractor={(f) => String(f.id)}
          onEndReached={() => {
            if (!loadingMore && hayMas) cargar(page + 1, false);
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.cameraBtn} /> : null}
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
  const { colors } = useTheme();
  const { t } = useLang();
  const styles = createStyles(colors);
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {foto.usuarioAvatar ? (
          <Image source={{ uri: resolveResourceUrl(foto.usuarioAvatar) }} style={styles.avatar} />
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

      <Image source={{ uri: resolveResourceUrl(foto.url) }} style={styles.imagen} resizeMode="cover" />

      {foto.descripcion ? (
        <View style={styles.descBox}>
          <Text style={styles.descTexto}>{foto.descripcion}</Text>
        </View>
      ) : null}

      <View style={styles.acciones}>
        <TouchableOpacity style={styles.accionBtn} onPress={onLike}>
          <Text style={[styles.accionTexto, foto.likedByMe && styles.likeActivo]}>
            {foto.likedByMe ? '❤️' : '🤍'} {t.communityLike} ({foto.likes})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.accionBtn} onPress={onToggleComentarios}>
          <Text style={styles.accionTexto}>💬 {t.communityComment} ({foto.comentarios})</Text>
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
  const { colors } = useTheme();
  const { t } = useLang();
  const styles = createStyles(colors);
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
      Alert.alert('Error', e?.response?.data?.message || t.communityErrorPost);
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
      Alert.alert('Error', e?.response?.data?.message || t.communityErrorEdit);
    }
  };

  const eliminar = (id: number) => {
    Alert.alert(t.communityDeleteTitle, t.communityDeleteMsg, [
      { text: t.communityCancel, style: 'cancel' },
      {
        text: t.communityDelete,
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/comentarios/${id}`);
            setComentarios((prev) => prev.filter((c) => c.id !== id));
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || t.communityErrorDelete);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.comentariosBox}>
      {cargando ? (
        <ActivityIndicator color={colors.cameraBtn} style={{ paddingVertical: 12 }} />
      ) : comentarios.length === 0 ? (
        <Text style={styles.sinComentarios}>{t.communityFirst}</Text>
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
                  {c.usuarioNombre} <Text style={styles.comentarioFecha}>· {c.fecha}{c.editado ? ` · ${t.communityEdited}` : ''}</Text>
                </Text>
                {editandoId === c.id ? (
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={textoEdit}
                      onChangeText={setTextoEdit}
                      autoFocus
                      placeholderTextColor={colors.subtext}
                    />
                    <TouchableOpacity onPress={() => guardarEdicion(c.id)}>
                      <Text style={styles.linkGuardar}>{t.communitySave}</Text>
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
                          <Text style={styles.linkEditar}>{t.communityEdit}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => eliminar(c.id)}>
                          <Text style={styles.linkEliminar}>{t.communityDelete}</Text>
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
          placeholder={t.communityWriteComment}
          placeholderTextColor={colors.subtext}
          value={texto}
          onChangeText={setTexto}
          multiline
        />
        <TouchableOpacity style={styles.enviarBtn} onPress={enviar} disabled={enviando || !texto.trim()}>
          <Text style={[styles.enviarTexto, (!texto.trim() || enviando) && { opacity: 0.5 }]}>
            {enviando ? '…' : t.communitySend}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    topBar: {
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    title: { color: colors.text, fontSize: 18, fontWeight: '700' },
    campana: { position: 'absolute', right: 14 },
    center: { flex: 1 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { color: colors.subtext, fontSize: 15 },

    card: { backgroundColor: colors.surface, marginBottom: 10 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    avatarFallback: { backgroundColor: colors.cameraBtn, justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { color: colors.text, fontSize: 16, fontWeight: '700' },
    nombre: { color: colors.text, fontSize: 14, fontWeight: '700' },
    fecha: { color: colors.subtext, fontSize: 12 },

    imagen: { width: '100%', aspectRatio: 1 },

    descBox: { paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
    descTexto: { color: colors.text, fontSize: 14, lineHeight: 20 },

    acciones: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border },
    accionBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    accionTexto: { color: colors.subtext, fontSize: 13, fontWeight: '600' },
    likeActivo: { color: colors.cameraBtn },

    comentariosBox: { paddingHorizontal: 12, paddingBottom: 12, backgroundColor: colors.inputBg },
    sinComentarios: { color: colors.subtext, fontSize: 13, paddingVertical: 10 },
    comentario: { flexDirection: 'row', gap: 8, paddingVertical: 6 },
    avatarSmall: { width: 28, height: 28, borderRadius: 14 },
    comentarioAutor: { color: colors.text, fontSize: 12, fontWeight: '700' },
    comentarioFecha: { color: colors.subtext, fontSize: 11, fontWeight: '400' },
    comentarioTexto: { color: colors.text, fontSize: 13, marginTop: 2 },
    linkEditar: { color: colors.accent, fontSize: 12 },
    linkEliminar: { color: colors.danger, fontSize: 12 },
    linkGuardar: { color: colors.success, fontSize: 12, fontWeight: '700' },
    linkCancelar: { color: colors.subtext, fontSize: 12 },

    inputRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
    input: {
      backgroundColor: colors.inputBg,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 8,
      fontSize: 13,
    },
    enviarBtn: { justifyContent: 'center', paddingHorizontal: 8 },
    enviarTexto: { color: colors.cameraBtn, fontWeight: '700', fontSize: 13 },
  });
