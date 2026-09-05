import api from './api';
import type {
  NotificationCategoryId,
  NotificationSettings,
  NotificationSettingsPatch,
} from './userTypes';

export const CATEGORY_IDS: NotificationCategoryId[] = ['tours', 'messages', 'events', 'promotions'];
export const CHANNEL_KEYS = ['push', 'email', 'inApp'] as const;
export type NotificationChannelKey = (typeof CHANNEL_KEYS)[number];

/** True when at least one category is enabled (master switch "on"). */
export function isNotificationsOn(settings: NotificationSettings): boolean {
  return CATEGORY_IDS.some((id) => settings.categories[id].enabled);
}

/** Patch that enables or disables every category on every channel. */
export function buildMasterPatch(enabled: boolean): NotificationSettingsPatch {
  const categories: NotificationSettingsPatch['categories'] = {};
  CATEGORY_IDS.forEach((id) => {
    categories[id] = { enabled, channels: { push: enabled, email: enabled, inApp: enabled } };
  });
  return { categories };
}

export const notificationsService = {
  /** GET /user/notifications — Preferencias de notificaciones. */
  async getSettings(): Promise<NotificationSettings> {
    const { data } = await api.get('/user/notifications');
    return data;
  },

  /** PATCH /user/notifications — Actualizar preferencias (merge parcial, persistente). */
  async updateSettings(patch: NotificationSettingsPatch): Promise<NotificationSettings> {
    const { data } = await api.patch('/user/notifications', patch);
    return data;
  },
};
