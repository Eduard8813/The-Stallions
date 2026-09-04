import { Linking } from 'react-native';

type LocationModule = typeof import('expo-location');
type ImagePickerModule = typeof import('expo-image-picker');

export type SystemPermissionKey = 'location' | 'gallery';

interface PermissionHolder {
  load(): Promise<LocationModule | ImagePickerModule | null>;
  getStatus(mod: any): Promise<{ granted: boolean; canAskAgain: boolean }>;
  request(mod: any): Promise<{ granted: boolean }>;
}

const holders: Record<SystemPermissionKey, PermissionHolder> = {
  location: {
    async load(): Promise<LocationModule | null> {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('expo-location') as LocationModule;
    },
    async getStatus(mod: any) {
      const r = await mod.getForegroundPermissionsAsync();
      return { granted: r.granted, canAskAgain: r.canAskAgain };
    },
    async request(mod: any) {
      const r = await mod.requestForegroundPermissionsAsync();
      return { granted: r.granted };
    },
  },
  gallery: {
    async load(): Promise<ImagePickerModule | null> {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('expo-image-picker') as ImagePickerModule;
    },
    async getStatus(mod: any) {
      const r = await mod.getMediaLibraryPermissionsAsync();
      return { granted: r.granted, canAskAgain: r.canAskAgain };
    },
    async request(mod: any) {
      const r = await mod.requestMediaLibraryPermissionsAsync();
      return { granted: r.granted };
    },
  },
};

/**
 * Permisos del sistema (Ubicación y Galería) gestionados igual que las
 * notificaciones: la barra refleja el permiso REAL del dispositivo y, si se
 * toca, se pide el permiso; si fue denegado de forma permanente se abre la
 * configuración del sistema.
 */
export const systemPermissions = {
  async getStatus(key: SystemPermissionKey): Promise<boolean> {
    const holder = holders[key];
    const mod = await holder.load();
    if (!mod) return false;
    try {
      const { granted } = await holder.getStatus(mod);
      return granted;
    } catch {
      return false;
    }
  },

  /**
   * Intenta otorgar el permiso real. Devuelve `true` solo si quedó concedido.
   * Si el permiso ya no puede pedirse (denegado permanentemente), abre la
   * configuración del sistema. Al volver de ahí la app recarga la barra.
   */
  async request(key: SystemPermissionKey): Promise<{ granted: boolean; opened: boolean }> {
    const holder = holders[key];
    const mod = await holder.load();
    if (!mod) return { granted: false, opened: false };

    try {
      const { granted, canAskAgain } = await holder.getStatus(mod);
      if (granted) return { granted: true, opened: false };
      if (canAskAgain) {
        const result = await holder.request(mod);
        return { granted: result.granted, opened: false };
      }
      // Denegado permanentemente: solo se puede habilitar desde los ajustes.
      await Linking.openSettings();
      return { granted: false, opened: true };
    } catch {
      await Linking.openSettings();
      return { granted: false, opened: true };
    }
  },
};
