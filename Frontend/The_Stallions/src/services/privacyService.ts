import { EVENTS, events } from './events';
import api from './api';
import type {
  BlockedUser,
  DataExportResult,
  PrivacySettings,
  PrivacySettingsPatch,
} from './userTypes';

export const privacyService = {
  /** GET /user/privacy — Configuración de privacidad. */
  async getSettings(): Promise<PrivacySettings> {
    const { data } = await api.get('/user/privacy');
    return data;
  },

  /** PATCH /user/privacy — Actualizar privacidad (merge parcial, persistente). */
  async updateSettings(patch: PrivacySettingsPatch): Promise<PrivacySettings> {
    const { data } = await api.patch('/user/privacy', patch);
    return data;
  },

  /** GET /user/blocked — Usuarios bloqueados. */
  async getBlockedUsers(): Promise<BlockedUser[]> {
    const { data } = await api.get('/user/blocked');
    return data;
  },

  /** DELETE /user/blocked/:id — Desbloquear usuario. */
  async unblockUser(userId: string): Promise<{ unblocked: boolean }> {
    const { data } = await api.delete(`/user/blocked/${userId}`);
    return data;
  },

  /** POST /user/data-export — Solicitar descarga de datos personales. */
  async requestDataExport(): Promise<DataExportResult> {
    const { data } = await api.post('/user/data-export');
    return data;
  },

  /** DELETE /user/account — Eliminar cuenta (irreversible, soft delete en backend). */
  async deleteAccount(): Promise<{ success: boolean }> {
    const { data } = await api.delete('/user/account');
    events.emit(EVENTS.loggedOut);
    return data;
  },
};