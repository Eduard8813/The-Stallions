import { Platform, Linking } from 'react-native';
import Constants from 'expo-constants';
import { localSettings } from './localSettings';

type NotificationsModule = typeof import('expo-notifications');

let cachedModule: NotificationsModule | null | undefined;

function getModule(): NotificationsModule | null {
  if (cachedModule !== undefined) return cachedModule;
  if (Platform.OS === 'web') {
    cachedModule = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require('expo-notifications') as NotificationsModule;
  } catch {
    cachedModule = null;
  }
  return cachedModule;
}

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined' | 'unavailable';

/**
 * Ensures a default channel exists on Android so the OS shows the permission
 * prompt (Android 13+) and notifications can be presented.
 *
 * A channel that is set to NONE cannot have its importance raised, and on some
 * OEMs (Samsung) recreating a channel with the same id restores the previous
 * NONE importance. To keep the toggle reversible forever, every enable uses a
 * fresh channel id, and the previous one is deleted.
 */
async function ensureChannel(): Promise<void> {
  const mod = getModule();
  if (!mod || Platform.OS !== 'android') return;
  try {
    const channelId = `default_${Date.now()}`;
    await mod.setNotificationChannelAsync(channelId, {
      name: 'Notificaciones',
      importance: mod.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });

    const channels = await mod.getNotificationChannelsAsync();
    for (const existing of channels) {
      if (existing.id !== channelId && (existing.id === 'default' || existing.id.startsWith('default_'))) {
        await mod.deleteNotificationChannelAsync(existing.id);
      }
    }

    const settings = await localSettings.get();
    await localSettings.set({ ...settings, notificationChannelId: channelId });
  } catch {
    // The channel is optional for the permission prompt to work on older versions.
  }
}

/**
 * Opens the notification settings of this app on the device. This is the only
 * way to actually revoke the OS notification permission, since the OS does not
 * allow an app to disable its own notification permission programmatically.
 */
export async function openNotificationSettings(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      await Linking.sendIntent('android.settings.APP_NOTIFICATION_SETTINGS', [
        {
          key: 'android.provider.extra.APP_PACKAGE',
          value: Constants.expoConfig?.android?.package ?? 'com.eduard8813steam.thestallions',
        },
      ]);
      return;
    } catch {
      // Fall through to the generic settings screen.
    }
  }
  await Linking.openSettings();
}

function toStatus(permission: { granted: boolean } | null): NotificationPermissionStatus {
  if (!permission) return 'unavailable';
  return permission.granted ? 'granted' : 'denied';
}

export const notificationsPermissions = {
  /** Current device permission without prompting the user. */
  async getStatus(): Promise<NotificationPermissionStatus> {
    const mod = getModule();
    if (!mod) return 'unavailable';
    try {
      const permission = await mod.getPermissionsAsync();
      return toStatus(permission);
    } catch {
      return 'undetermined';
    }
  },

  /**
   * Asks the user for permission to send notifications. Resolves to `true`
   * only when the device permission was granted.
   */
  async request(): Promise<{ granted: boolean; status: NotificationPermissionStatus }> {
    const mod = getModule();
    if (!mod) return { granted: false, status: 'unavailable' };
    try {
      await ensureChannel();
      const permission = await mod.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: true, allowSound: true },
      });
      const status = toStatus(permission);
      return { granted: status === 'granted', status };
    } catch {
      return { granted: false, status: 'denied' };
    }
  },

  /**
   * Stops delivering notifications at the app level: the notification channel
   * is set to NONE so nothing is shown and any presented notification is
   * dismissed. This does NOT revoke the OS permission (that is impossible
   * programmatically) — the OS permission stays granted. The channel is
   * recreated at DEFAULT by `ensureChannel` on the next enable, so this stays
   * reversible indefinitely.
   */
  async disableDeviceChannel(): Promise<void> {
    const mod = getModule();
    if (!mod) return;
    try {
      if (Platform.OS === 'android') {
        const settings = await localSettings.get();
        const channelId = settings.notificationChannelId ?? 'default';
        await mod.setNotificationChannelAsync(channelId, {
          name: 'Notificaciones',
          importance: mod.AndroidImportance.NONE,
        });
      }
      await mod.dismissAllNotificationsAsync();
    } catch {
      // Best effort; the app-level state still disables delivery.
    }
  },
};

