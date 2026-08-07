import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const AUTH_TOKEN_KEY = 'authToken';

/**
 * Central access point for the auth token.
 * Reads the same storage used by AuthContext (SecureStore on native,
 * localStorage on web) so the HTTP client and the mock layer stay in sync.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return localStorage.getItem(AUTH_TOKEN_KEY);
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function hasAuthToken(): Promise<boolean> {
  return !!(await getAuthToken());
}
