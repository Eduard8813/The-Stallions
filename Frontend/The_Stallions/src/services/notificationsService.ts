import { mockRequest } from './mockApi';
import type { NotificationSettings, NotificationSettingsPatch } from './userTypes';

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
  (Object.keys(patch.categories ?? {}) as (keyof NotificationSettings['categories'])[]).forEach((key) => {
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

export const notificationsService = {
  /** GET /user/notifications — Preferencias de notificaciones. */
  async getSettings(): Promise<NotificationSettings> {
    // Real: return (await api.get('/user/notifications')).data;
    return mockRequest<NotificationSettings>(() => deepMergeSettings(EMPTY_SETTINGS, {}));
  },

  /** PATCH /user/notifications — Actualizar preferencias (merge parcial). */
  async updateSettings(patch: NotificationSettingsPatch): Promise<NotificationSettings> {
    // Real: return (await api.patch('/user/notifications', patch)).data;
    return mockRequest<NotificationSettings>(() => deepMergeSettings(EMPTY_SETTINGS, patch));
  },
};
