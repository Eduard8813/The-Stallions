import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAsync } from '../../hooks/useAsync';
import {
  activarNotificaciones,
  cancelarNotificacionEvento,
  diasHasta,
  obtenerEventoPorId,
  programarNotificacionEvento,
} from '../../services/eventosService';
import { notificationsPermissions, openNotificationSettings } from '../../services/notificationsPermissions';
import { colors } from '../../constants/ui';

export default function EventoDetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: evento, loading, error } = useAsync(() => obtenerEventoPorId(id!), [id]);
  const [notifActiva, setNotifActiva] = useState(false);
  const [notifBusy, setNotifBusy] = useState(false);

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

  const fecha = new Date(`${evento.fecha}T12:00:00`).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const dias = diasHasta(evento.fecha);

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
        <Text style={[styles.categoria, styles[evento.categoria]]}>{evento.categoria}</Text>
        <Text style={styles.titulo}>{evento.titulo}</Text>
        <Text style={styles.fecha}>{fecha}</Text>

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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vacioTexto: { color: colors.subtext, fontSize: 14 },
  back: { paddingHorizontal: 16, paddingTop: 12 },
  backTexto: { color: colors.accent, fontSize: 16, fontWeight: '700' },
  contenido: { padding: 20, paddingBottom: 40 },
  categoria: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  FERIADO: { color: colors.danger },
  CONMEMORACION: { color: '#F59E0B' },
  CELEBRACION: { color: colors.success },
  titulo: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 8 },
  fecha: {
    color: colors.subtext,
    fontSize: 15,
    textTransform: 'capitalize',
    marginTop: 6,
  },
  countdownBox: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 18,
  },
  countdownNumero: { color: colors.accent, fontSize: 32, fontWeight: '900' },
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
