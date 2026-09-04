import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAsync } from '../../hooks/useAsync';
import {
  activarNotificaciones,
  cancelarNotificacionEvento,
  diasHasta,
  obtenerEventoPorId,
  programarNotificacionEvento,
  subirFotoEvento,
} from '../../services/eventosService';
import { notificationsPermissions, openNotificationSettings } from '../../services/notificationsPermissions';
import { useTheme } from '../../context/ThemeContext';

export default function EventoDetalleScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: evento, loading, error, setData } = useAsync(() => obtenerEventoPorId(id!), [id]);
  const [notifActiva, setNotifActiva] = useState(false);
  const [notifBusy, setNotifBusy] = useState(false);
  const [fotoBusy, setFotoBusy] = useState(false);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centro}>
          <Text style={styles.vacioTexto}>Cargando evento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !evento) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centro}>
          <Text style={styles.vacioTexto}>{error ?? 'Evento no encontrado.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatoLargo = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  const fecha = evento.fechaFin
    ? `del ${formatoLargo(evento.fecha)} al ${formatoLargo(evento.fechaFin)}`
    : formatoLargo(evento.fecha);
  const dias = diasHasta(evento.fecha);
  const enCurso =
    !!evento.fechaFin && dias <= 0 && diasHasta(evento.fechaFin) >= 0;

  const agregarFoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso necesario', 'Se necesita acceso a la galería para elegir una foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setFotoBusy(true);
    try {
      const { fotoUrl } = await subirFotoEvento(evento.id, asset.uri, asset);
      setData((prev) => (prev ? { ...prev, fotoUrl } : prev));
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo subir la foto.');
    } finally {
      setFotoBusy(false);
    }
  };

  const toggleNotificacion = async (valor: boolean) => {
    setNotifBusy(true);
    try {
      if (valor) {
        const status = await notificationsPermissions.getStatus();
        let concedido = status === 'granted';
        if (status === 'undetermined') {
          const resultado = await notificationsPermissions.request();
          concedido = resultado.granted;
        }
        if (!concedido) {
          setNotifActiva(false);
          await openNotificationSettings();
          return;
        }
        await programarNotificacionEvento(evento);
        await activarNotificaciones(evento, true);
        setNotifActiva(true);
      } else {
        await cancelarNotificacionEvento(evento);
        await activarNotificaciones(evento, false);
        setNotifActiva(false);
      }
    } catch {
      setNotifActiva(false);
    } finally {
      setNotifBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()} hitSlop={12}>
        <Text style={styles.backTexto}>‹ Volver</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.contenido}>
        {evento.fotoUrl ? (
          <Image source={{ uri: evento.fotoUrl }} style={styles.foto} contentFit="cover" />
        ) : (
          <TouchableOpacity style={styles.fotoPlaceholder} onPress={agregarFoto} disabled={fotoBusy} activeOpacity={0.7}>
            <Text style={styles.fotoPlaceholderTexto}>
              {fotoBusy ? 'Subiendo foto...' : '📷 Agregar foto'}
            </Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.categoria, styles[evento.categoria]]}>{evento.categoria}</Text>
        <Text style={styles.titulo}>{evento.titulo}</Text>
        <Text style={styles.fecha}>{fecha}</Text>

        {enCurso && (
          <View style={styles.enCursoBox}>
            <Text style={styles.enCursoTexto}>En curso</Text>
          </View>
        )}

        {dias >= 0 && (
          <View style={styles.countdownBox}>
            <Text style={styles.countdownNumero}>
              {dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `${dias}`}
            </Text>
            {dias > 1 && <Text style={styles.countdownLabel}>días para este evento</Text>}
          </View>
        )}

        <Text style={styles.descripcion}>{evento.descripcion}</Text>

        <View style={styles.notifRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifTitulo}>Notificarme</Text>
            <Text style={styles.notifSub}>Te avisamos el día del evento</Text>
          </View>
          <Switch
            value={notifActiva}
            disabled={notifBusy}
            onValueChange={(v) => {
              setNotifActiva(v);
              toggleNotificacion(v);
            }}
            trackColor={{ true: colors.accent, false: colors.border }}
            thumbColor="#fff"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vacioTexto: { color: colors.subtext, fontSize: 14 },
  back: { paddingHorizontal: 16, paddingTop: 12 },
  backTexto: { color: colors.accent, fontSize: 16, fontWeight: '700' },
  contenido: { padding: 20, paddingBottom: 40 },
  foto: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  } as const,
  fotoPlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  } as const,
  fotoPlaceholderTexto: { color: colors.subtext, fontSize: 14, fontWeight: '700' },
  enCursoBox: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34,197,94,0.14)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
  },
  enCursoTexto: { color: colors.success, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  categoria: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  FERIADO: { color: colors.danger },
  CONMEMORACION: { color: '#F59E0B' },
  CELEBRACION: { color: colors.success },
  titulo: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 8, fontFamily: 'Gilroy-Bold' },
  fecha: {
    color: colors.subtext,
    fontSize: 15,
    textTransform: 'capitalize',
    marginTop: 6,
  },
  countdownBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(243,150,28,0.16)',
    borderWidth: 1,
    borderColor: '#F3961C',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 18,
  },
  countdownNumero: { color: '#F3961C', fontSize: 32, fontWeight: '900' },
  countdownLabel: { color: colors.subtext, fontSize: 13, marginTop: 2 },
  descripcion: { color: colors.text, fontSize: 15, lineHeight: 24, marginTop: 20 },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginTop: 24,
  },
  notifTitulo: { color: colors.text, fontSize: 15, fontWeight: '700' },
  notifSub: { color: colors.subtext, fontSize: 13, marginTop: 2 },
});
