import { storage } from './storage';

/**
 * Settings that live only on the device (no backend):
 * biometric unlock and system permission switches.
 */
export interface LocalSettings {
  biometricsEnabled: boolean;
  notificationChannelId?: string;
  permissions: {
    location: boolean;
    notifications: boolean;
    gallery: boolean;
  };
}

const KEY = 'profileLocalSettings';

const DEFAULTS: LocalSettings = {
  biometricsEnabled: false,
  permissions: { location: false, notifications: false, gallery: false },
};

export const localSettings = {
  async get(): Promise<LocalSettings> {
    return (await storage.get<LocalSettings>(KEY)) ?? DEFAULTS;
  },
  async set(settings: LocalSettings): Promise<void> {
    await storage.set(KEY, settings);
  },
};
