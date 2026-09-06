import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
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
import { useTheme } from '../../context/ThemeContext';

const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];
const ROJO = '#C0392B';
const AZUL = '#1B6CE0';
const VERDE = '#2E7D32';

export default function EventoDetalleScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: evento, loading, error, setData } = useAsync(() => obtenerEventoPorId(id!), [id]);
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

  const [ay, am, ad] = evento.fecha.split('-').map(Number);
  const mesNombre = MESES[am - 1];
  const mesCorto = mesNombre.slice(0, 3);
  const diaNumero = String(ad).padStart(2, '0');
  const tieneImagen = !!evento.fotoUrl;
  const dias = diasHasta(evento.fecha);
  const enCurso =
    !!evento.fechaFin && dias <= 0 && diasHasta(evento.fechaFin) >= 0;

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
    <LinearGradient colors={['#FBF6EC', '#F3E8D6', '#EFDFC6']} style={styles.safe}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          <View style={styles.badge}>
            <Text style={styles.badgeTexto}>Eventos de {mesNombre}</Text>
          </View>

          <View style={styles.fotoWrap}>
            {tieneImagen ? (
              <Image source={{ uri: evento.fotoUrl! }} style={styles.foto} contentFit="cover" />
            ) : (
              <View style={styles.fotoPlaceholder}>
                <Text style={styles.fotoPlaceholderTexto}>No hay foto</Text>
              </View>
            )}
          </View>

          <View style={styles.tarjetaInfo}>
            <Text style={[styles.categoria, styles[evento.categoria]]}>{evento.categoria}</Text>
            <Text style={styles.titulo}>{evento.titulo}</Text>
            <Text style={styles.descripcion} numberOfLines={5}>{evento.descripcion}</Text>
            <View style={styles.pillsRow}>
              {enCurso ? (
                <View style={styles.pillVerde}>
                  <Text style={styles.pillVerdeTexto}>En curso</Text>
                </View>
              ) : (
                <View style={styles.pillFecha}>
                  <Text style={styles.pillFechaTexto}>{mesCorto} {diaNumero}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.tarjetaNotif}>
            <View style={{ flex: 1 }}>
              <Text style={styles.notifTitulo}>Notificarme</Text>
              <Text style={styles.notifSub}>Te avisaremos el día del evento</Text>
            </View>
            <Switch
              value={notifActiva}
              disabled={notifBusy}
              onValueChange={(v) => {
                setNotifActiva(v);
                toggleNotificacion(v);
              }}
              trackColor={{ true: AZUL, false: '#D8CBB8' }}
              thumbColor="#fff"
            />
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backBtnTexto}>←</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vacioTexto: { color: colors.subtext, fontSize: 14 },
  contenido: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.60)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(192,57,43,0.35)',
    marginBottom: 16,
  },
  badgeTexto: {
    color: ROJO,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  fotoWrap: { width: '100%', marginBottom: 16 },
  foto: {
    width: '100%',
    height: 230,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: '#C97B5A',
  } as const,
  fotoPlaceholder: {
    width: '100%',
    height: 170,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#C97B5A',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.50)',
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  fotoPlaceholderTexto: { color: '#8A6F4D', fontSize: 14, fontWeight: '700' },
  tarjetaInfo: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(192,57,43,0.35)',
    padding: 18,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  categoria: { fontSize: 12, fontWeight: '800', letterSpacing: 1, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  FERIADO: { color: ROJO, backgroundColor: 'rgba(192,57,43,0.12)' },
  CONMEMORACION: { color: '#B45309', backgroundColor: 'rgba(245,158,11,0.16)' },
  CELEBRACION: { color: VERDE, backgroundColor: 'rgba(46,125,50,0.14)' },
  titulo: {
    color: ROJO,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 10,
    fontFamily: 'Gilroy-Bold',
  },
  descripcion: {
    color: '#5A5144',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  pillsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  pillVerde: {
    backgroundColor: '#DDF0DC',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#9DCE9B',
  },
  pillVerdeTexto: { color: VERDE, fontSize: 12, fontWeight: '800' },
  pillFecha: {
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(27,108,224,0.4)',
  },
  pillFechaTexto: { color: AZUL, fontSize: 12, fontWeight: '800' },
  tarjetaNotif: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(192,57,43,0.35)',
    padding: 16,
    marginBottom: 24,
  },
  notifTitulo: { color: ROJO, fontSize: 15, fontWeight: '700' },
  notifSub: { color: '#7A6F5E', fontSize: 13, marginTop: 2 },
  backBtn: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    padding: 8,
    zIndex: 10,
  },
  backBtnTexto: { color: ROJO, fontSize: 42, fontWeight: '900', marginTop: -5 },
});