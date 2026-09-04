export type SystemPermissionKey = 'location' | 'gallery';

/**
 * Versión web de los permisos del sistema. En el navegador no se usan los
 * permisos nativos de ubicación/galería de React Native, por lo que se reporta
 * siempre como no concedido y no se abre la configuración del sistema.
 */
export const systemPermissions = {
  async getStatus(_key: SystemPermissionKey): Promise<boolean> {
    return false;
  },

  async request(_key: SystemPermissionKey): Promise<{ granted: boolean; opened: boolean }> {
    return { granted: false, opened: false };
  },
};
