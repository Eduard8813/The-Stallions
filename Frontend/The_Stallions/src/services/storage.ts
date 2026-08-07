import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Generic JSON storage used for local-only settings (no backend).
 * SecureStore on native, localStorage on web.
 */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw =
        Platform.OS === 'web' ? localStorage.getItem(key) : await SecureStore.getItemAsync(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  async set<T>(key: string, value: T): Promise<void> {
    const raw = JSON.stringify(value);
    if (Platform.OS === 'web') {
      localStorage.setItem(key, raw);
      return;
    }
    await SecureStore.setItemAsync(key, raw);
  },
  async remove(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
