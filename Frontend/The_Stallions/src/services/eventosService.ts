import api from './api';
import { Platform } from 'react-native';
import type { CategoriaEvento, Evento } from '../types/evento';

type NotificationsModule = typeof import('expo-notifications');

let cachedNotificationsModule: NotificationsModule | null | undefined;

function getNotificationsModule(): NotificationsModule | null {
  if (cachedNotificationsModule !== undefined) return cachedNotificationsModule;
  if (Platform.OS === 'web') {
    cachedNotificationsModule = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedNotificationsModule = require('expo-notifications') as NotificationsModule;
  } catch {
    cachedNotificationsModule = null;
  }
  return cachedNotificationsModule;
}

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

/** POST /api/eventos/{id}/foto — Subir/reemplazar la foto del evento (multipart). */
export async function subirFotoEvento(
  id: string,
  uri: string,
  asset?: { fileName?: string | null; mimeType?: string | null }
): Promise<{ fotoUrl: string }> {
  const fileName = asset?.fileName || 'foto-evento.jpg';
  const mimeType = asset?.mimeType || 'image/jpeg';
  const form = new FormData();
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    form.append('foto', blob as any, fileName);
  } else {
    form.append('foto', { uri, name: fileName, type: mimeType } as any);
  }
  const { data } = await api.post<{ fotoUrl: string }>(`/eventos/${id}/foto`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** Todas las fechas ISO que abarca el evento (fecha..fechaFin inclusive). */
export function fechasDelEvento(evento: Evento): string[] {
  if (!evento.fechaFin || evento.fechaFin <= evento.fecha) return [evento.fecha];
  const fechas: string[] = [];
  const cursor = new Date(`${evento.fecha}T12:00:00`);
  const fin = new Date(`${evento.fechaFin}T12:00:00`);
  while (cursor.getTime() <= fin.getTime() && fechas.length < 366) {
    fechas.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(
        cursor.getDate()
      ).padStart(2, '0')}`
    );
    cursor.setDate(cursor.getDate() + 1);
  }
  return fechas;
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

  const Notifications = getNotificationsModule();
  if (!Notifications) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: evento.titulo,
      body: `Hoy es ${evento.titulo}.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
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
  const Notifications = getNotificationsModule();
  if (!Notifications) return;
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
