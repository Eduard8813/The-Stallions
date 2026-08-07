import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Locally stored account data used to prefill the profile section while the
 * backend has no data yet. Keys are plain strings, shared with AuthContext:
 *  - userFullName / userEmail / userPhoto: written at login (email or Google).
 *  - profilePhoto: photo the user picked inside the app (local only).
 */
const KEYS = {
  fullName: 'userFullName',
  email: 'userEmail',
  photo: 'userPhoto',
  localPhoto: 'profilePhoto',
} as const;

async function read(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function write(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function remove(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export interface ProfileSource {
  fullName: string | null;
  email: string | null;
  photo: string | null;
  localPhoto: string | null;
}

export const profileSource = {
  async get(): Promise<ProfileSource> {
    const [fullName, email, photo, localPhoto] = await Promise.all([
      read(KEYS.fullName),
      read(KEYS.email),
      read(KEYS.photo),
      read(KEYS.localPhoto),
    ]);
    return { fullName, email, photo, localPhoto };
  },

  async setLocalPhoto(uri: string): Promise<void> {
    await write(KEYS.localPhoto, uri);
  },

  async clearLocalPhoto(): Promise<void> {
    await remove(KEYS.localPhoto);
  },
};
