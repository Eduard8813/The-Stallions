import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { UserProfile } from './userTypes';

/**
 * Locally stored account data used to prefill the profile section while the
 * backend has no data yet. Keys are plain strings, shared with AuthContext:
 *  - userFullName / userEmail / userPhoto: written at login (email or Google).
 *  - profilePhoto: photo the user picked inside the app (local only).
 *  - cachedProfile: last known profile, so the profile and the edit form are
 *    never empty (also used as offline fallback).
 */
const KEYS = {
  fullName: 'userFullName',
  email: 'userEmail',
  photo: 'userPhoto',
  localPhoto: 'profilePhoto',
  cachedProfile: 'cachedProfile',
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

  async getCachedProfile(): Promise<UserProfile | null> {
    const raw = await read(KEYS.cachedProfile);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  },

  /**
   * Persists the full profile locally and keeps the login-derived keys
   * (name / email / photo) in sync so AuthContext rehydrates correctly.
   */
  async saveProfile(profile: UserProfile): Promise<void> {
    const fullName = `${profile.firstName} ${profile.lastName}`.trim();
    const tasks: Promise<void>[] = [
      write(KEYS.fullName, fullName),
      write(KEYS.email, profile.email),
      write(KEYS.cachedProfile, JSON.stringify(profile)),
    ];
    if (profile.photoUrl) {
      tasks.push(write(KEYS.photo, profile.photoUrl));
    } else {
      tasks.push(remove(KEYS.photo));
    }
    await Promise.all(tasks);
  },
};
