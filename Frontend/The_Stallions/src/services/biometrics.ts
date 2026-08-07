import { Platform } from 'react-native';

type LocalAuthenticationModule = typeof import('expo-local-authentication');

let cachedModule: LocalAuthenticationModule | null | undefined;

function getModule(): LocalAuthenticationModule | null {
  if (cachedModule !== undefined) return cachedModule;
  if (Platform.OS === 'web') {
    cachedModule = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require('expo-local-authentication') as LocalAuthenticationModule;
  } catch {
    cachedModule = null;
  }
  return cachedModule;
}

export async function hasHardwareAsync(): Promise<boolean> {
  const mod = getModule();
  if (!mod) return false;
  try {
    return await mod.hasHardwareAsync();
  } catch {
    return false;
  }
}

export async function isEnrolledAsync(): Promise<boolean> {
  const mod = getModule();
  if (!mod) return false;
  try {
    return await mod.isEnrolledAsync();
  } catch {
    return false;
  }
}

export async function authenticateAsync(
  options: { promptMessage?: string; cancelLabel?: string; disableDeviceFallback?: boolean }
): Promise<{ success: boolean }> {
  const mod = getModule();
  if (!mod) return { success: false };
  try {
    return await mod.authenticateAsync(options);
  } catch {
    return { success: false };
  }
}
