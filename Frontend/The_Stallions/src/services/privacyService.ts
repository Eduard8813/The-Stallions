import { EVENTS, events } from './events';
import { mockRequest } from './mockApi';
import type {
  BlockedUser,
  DataExportResult,
  PrivacySettings,
  PrivacySettingsPatch,
} from './userTypes';

const EMPTY_PRIVACY: PrivacySettings = {
  visibility: 'public',
  showEmail: false,
  showPhone: false,
  showLocation: false,
  discoverable: false,
};

export const privacyService = {
  /** GET /user/privacy — Configuración de privacidad. */
  async getSettings(): Promise<PrivacySettings> {
    // Real: return (await api.get('/user/privacy')).data;
    return mockRequest<PrivacySettings>(() => ({ ...EMPTY_PRIVACY }));
  },

  /** PATCH /user/privacy — Actualizar privacidad (merge parcial). */
  async updateSettings(patch: PrivacySettingsPatch): Promise<PrivacySettings> {
    // Real: return (await api.patch('/user/privacy', patch)).data;
    return mockRequest<PrivacySettings>(() => ({ ...EMPTY_PRIVACY, ...patch }));
  },

  /** GET /user/blocked — Usuarios bloqueados. */
  async getBlockedUsers(): Promise<BlockedUser[]> {
    // Real: return (await api.get('/user/blocked')).data;
    return mockRequest<BlockedUser[]>(() => []);
  },

  /** DELETE /user/blocked/:id — Desbloquear usuario. */
  async unblockUser(_userId: string): Promise<{ unblocked: boolean }> {
    // Real: return (await api.delete(`/user/blocked/${userId}`)).data;
    return mockRequest(() => ({ unblocked: true }));
  },

  /** POST /user/data-export — Solicitar descarga de datos personales. */
  async requestDataExport(): Promise<DataExportResult> {
    // Real: return (await api.post('/user/data-export')).data;
    return mockRequest<DataExportResult>(() => ({
      exportId: '',
      status: 'processing',
      availableForHours: 48,
    }));
  },

  /** DELETE /user/account — Eliminar cuenta (irreversible). */
  async deleteAccount(): Promise<{ success: boolean }> {
    // Real: return (await api.delete('/user/account')).data;
    return mockRequest(() => {
      events.emit(EVENTS.loggedOut);
      return { success: true };
    });
  },
};
