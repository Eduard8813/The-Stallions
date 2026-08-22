import api from './api';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import type { CategoriaEvento, Evento } from '../types/evento';

export async function obtenerEventos(categoria?: CategoriaEvento): Promise<Evento[]> {
  // GET /api/eventos (con ?categoria=FERIADO opcional)
  const { data } = await api.get<Evento[]>('/eventos', {
    params: categoria ? { categoria } : undefined,
  });
  return data;
}

export async function obtenerEventoPorId(id: string): Promise<Evento> {
  // GET /api/eventos/{id}
  const { data } = await api.get<Evento>(`/eventos/${id}`);
  return data;
}

export async function activarNotificaciones(evento: Evento, activar: boolean): Promise<void> {
  // TODO: conectar con backend — registrar/desregistrar el token FCM para este evento
  console.log('[eventos] activarNotificaciones:', evento.id, activar);
}

/** Notificaciones locales programadas por evento (en memoria). */
const notificacionesActivas = new Map<string, string>();

/**
 * Programa una notificación local que se dispara el día del evento a las 9:00.
 * Devuelve el id de la notificación programada o null si la fecha ya pasó.
 */
export async function programarNotificacionEvento(evento: Evento): Promise<string | null> {
  const [y, m, d] = evento.fecha.split('-').map(Number);
  const fechaDisparo = new Date(y, m - 1, d, 9, 0, 0, 0);
  if (fechaDisparo.getTime() <= Date.now()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: evento.titulo,
      body: `Hoy es ${evento.titulo}.`,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: fechaDisparo,
    },
  });
  notificacionesActivas.set(evento.id, id);
  return id;
}

/** Cancela la notificación local programada para el evento (si existe). */
export async function cancelarNotificacionEvento(evento: Evento): Promise<void> {
  const id = notificacionesActivas.get(evento.id);
  if (!id) return;
  await Notifications.cancelScheduledNotificationAsync(id);
  notificacionesActivas.delete(evento.id);
}

/** Días restantes hasta la fecha del evento (0 = hoy). */
export function diasHasta(fechaISO: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const [y, m, d] = fechaISO.split('-').map(Number);
  const fecha = new Date(y, m - 1, d);
  return Math.round((fecha.getTime() - hoy.getTime()) / 86_400_000);
}
