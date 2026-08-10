import { storage } from './storage';
import { mockRequest } from './mockApi';
import type {
  NotificationCategoryId,
  NotificationSettings,
  NotificationSettingsPatch,
} from './userTypes';

export const CATEGORY_IDS: NotificationCategoryId[] = ['tours', 'messages', 'events', 'promotions'];
export const CHANNEL_KEYS = ['push', 'email', 'inApp'] as const;
export type NotificationChannelKey = (typeof CHANNEL_KEYS)[number];

const STORAGE_KEY = 'notificationSettings';

const EMPTY_SETTINGS: NotificationSettings = {
  categories: {
    tours: { enabled: false, channels: { email: false, push: false, inApp: false } },
    messages: { enabled: false, channels: { email: false, push: false, inApp: false } },
    events: { enabled: false, channels: { email: false, push: false, inApp: false } },
    promotions: { enabled: false, channels: { email: false, push: false, inApp: false } },
  },
  quietHours: { enabled: false, start: '', end: '' },
};

function deepMergeSettings(
  base: NotificationSettings,
  patch: NotificationSettingsPatch
): NotificationSettings {
  const categories = { ...base.categories };
  (Object.keys(patch.categories ?? {}) as NotificationCategoryId[]).forEach((key) => {
    const patched = patch.categories![key];
    if (!patched) return;
    categories[key] = {
      ...categories[key],
      ...(patched.enabled !== undefined ? { enabled: patched.enabled } : {}),
      channels: { ...categories[key].channels, ...(patched.channels ?? {}) },
    };
  });
  return {
    ...base,
    categories,
    quietHours: { ...base.quietHours, ...(patch.quietHours ?? {}) },
  };
}

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
    const saved = await storage.get<NotificationSettings>(STORAGE_KEY);
    // Real: return (await api.get('/user/notifications')).data;
    return mockRequest<NotificationSettings>(() =>
      saved ? deepMergeSettings(saved, {}) : deepMergeSettings(EMPTY_SETTINGS, {})
    );
  },

  /** PATCH /user/notifications — Actualizar preferencias (merge parcial, persistente). */
  async updateSettings(patch: NotificationSettingsPatch): Promise<NotificationSettings> {
    const saved = await storage.get<NotificationSettings>(STORAGE_KEY);
    const merged = deepMergeSettings(saved ?? EMPTY_SETTINGS, patch);
    await storage.set(STORAGE_KEY, merged);
    // Real: return (await api.patch('/user/notifications', patch)).data;
    return mockRequest<NotificationSettings>(() => merged);
  },
};
