import { Platform } from 'react-native';
import api from './api';
import { EVENTS, events } from './events';
import { profileSource } from './profileSource';
import { getAuthToken } from './token';
import type {
  AccountProvider,
  ChangePasswordInput,
  LinkedAccount,
  SecuritySettings,
  UpdateProfileInput,
  UserProfile,
  UserSession,
} from './userTypes';

const EMPTY_PROFILE: UserProfile = {
  id: '',
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  birthDate: '',
  gender: 'prefer_not_to_say',
  city: '',
  bio: '',
  photoUrl: null,
  createdAt: '',
};

const AVAILABLE_PROVIDERS: LinkedAccount[] = [
  { provider: 'google', connected: false, email: null },
  { provider: 'apple', connected: false, email: null },
  { provider: 'facebook', connected: false, email: null },
];

/** Devuelve el mensaje legible del backend (ErrorResponse.message) o un fallback. */
function extractMessage(e: any): string {
  return e?.response?.data?.message ?? e?.message ?? 'Error inesperado. Inténtalo de nuevo.';
}

/** Perfil local de respaldo: caché del backend, o lo que dejó el login. */
async function loadLocalProfile(): Promise<UserProfile> {
  const cached = await profileSource.getCachedProfile();
  if (cached) return cached;
  const source = await profileSource.get();
  const parts = (source.fullName ?? '').trim().split(/\s+/).filter(Boolean);
  return {
    ...EMPTY_PROFILE,
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
    username: source.email ? source.email.split('@')[0] : '',
    email: source.email ?? '',
    photoUrl: source.localPhoto || source.photo || null,
  };
}

export const userService = {
  /** GET /user/profile — Perfil del usuario autenticado. */
  async getProfile(): Promise<UserProfile> {
    try {
      const { data } = await api.get<UserProfile>('/user/profile');
      await profileSource.saveProfile(data);
      return data;
    } catch {
      return loadLocalProfile();
    }
  },

  /** PUT /user/profile — Actualizar datos básicos del perfil. */
  async updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
    const current = await loadLocalProfile();
    try {
      const { data } = await api.put<UserProfile>('/user/profile', input);
      await profileSource.saveProfile(data);
      return data;
    } catch (e: any) {
      const merged: UserProfile = { ...current, ...input, id: current.id, createdAt: current.createdAt };
      await profileSource.saveProfile(merged);
      throw new Error(extractMessage(e));
    }
  },

  /** POST /user/profile/photo — Subir foto de perfil (multipart/form-data). */
  async uploadProfilePhoto(
    uri: string,
    asset?: { fileName?: string | null; mimeType?: string | null }
  ): Promise<{ photoUrl: string }> {
    const current = await loadLocalProfile();
    const fileName = asset?.fileName || 'photo.jpg';
    const mimeType = asset?.mimeType || 'image/jpeg';
    try {
      const form = new FormData();
      if (Platform.OS === 'web') {
        const blob = await (await fetch(uri)).blob();
        form.append('photo', blob as any, fileName);
      } else {
        form.append('photo', { uri, name: fileName, type: mimeType } as any);
      }
      const { data } = await api.post<{ photoUrl: string }>('/user/profile/photo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await profileSource.saveProfile({ ...current, photoUrl: data.photoUrl });
      return { photoUrl: data.photoUrl };
    } catch (e) {
      throw new Error(extractMessage(e));
    }
  },

  /** POST /api/fotos — Subir una nueva foto (multipart/form-data).
   *  Requiere token en header (inyectado por el interceptor API).
   *  El backend decodifica el token para obtener user_id.
   *  Acepta cualquier tipo de imagen usando el mimeType/fileName reales del asset.
   */
  async uploadFoto(
    uri: string,
    visibilidad: 'privada' | 'publica',
    descripcion: string = '',
    asset?: { fileName?: string | null; mimeType?: string | null },
    grupoId?: number
  ): Promise<{ success: boolean; url?: string; usuarioId?: string }> {
    const fileName = asset?.fileName || `photo_${Date.now()}.jpg`;
    const mimeType = asset?.mimeType || 'image/jpeg';
    try {
      const form = new FormData();
      if (Platform.OS === 'web') {
        const blob = await (await fetch(uri)).blob();
        form.append('photo', blob as any, fileName);
      } else {
        form.append('photo', { uri, name: fileName, type: mimeType } as any);
      }
      form.append('visibilidad', visibilidad);
      if (descripcion && descripcion.trim()) {
        form.append('descripcion', descripcion.trim());
      }
      if (grupoId != null) {
        form.append('grupoId', String(grupoId));
      }
      const { data } = await api.post<{ success: boolean; url?: string; usuarioId?: string }>('/fotos', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (e: any) {
      throw new Error(extractMessage(e));
    }
  },

  /** GET /api/fotos/mias - Obtener fotos del usuario autenticado */
  async getFotosMias(): Promise<any[]> {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get<any[]>('/fotos/mias', { headers });
    return data;
  },

  /** GET /api/fotos/comunidad - Obtener fotos públicas */
  async getFotosComunidad(): Promise<any[]> {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get<any[]>('/fotos/comunidad', { headers });
    return data;
  },

  /** POST /api/fotos/:id/like - Dar/quitar like a una foto */
  async likeFoto(fotoId: string): Promise<{ success: boolean }> {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post<{ success: boolean }>(`/fotos/${fotoId}/like`, {}, { headers });
    return data;
  },

  /** GET /api/fotos/:id/comentarios - Obtener comentarios de una foto */
  async getComentariosFoto(fotoId: string): Promise<any[]> {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get<any[]>(`/fotos/${fotoId}/comentarios`, { headers });
    return data;
  },

  /** POST /api/fotos/:id/comentarios - Agregar un comentario a una foto */
  async agregarComentario(fotoId: string, texto: string): Promise<{ exito: boolean; comentario?: any }> {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.post<{ exito: boolean; comentario?: any }>(`/fotos/${fotoId}/comentarios`, { texto }, { headers });
    return data;
  },

  /** PUT /api/comentarios/:id - Editar un comentario propio */
  async editarComentario(comentarioId: string, texto: string): Promise<{ exito: boolean }> {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.put<{ exito: boolean }>(`/comentarios/${comentarioId}`, { texto }, { headers });
    return data;
  },

  /** DELETE /api/comentarios/:id - Eliminar un comentario propio */
  async eliminarComentario(comentarioId: string): Promise<{ exito: boolean }> {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.delete<{ exito: boolean }>(`/comentarios/${comentarioId}`, { headers });
    return data;
  },

  /** GET /api/notificaciones - Obtener notificaciones del usuario */
  async getNotificaciones(): Promise<any[]> {
    const token = getAuthToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const { data } = await api.get<any[]>(`/api/notificaciones`, { headers });
    return data;
  },

  /** GET /user/security — Estado de seguridad (2FA). */
  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      const { data } = await api.get<SecuritySettings>('/user/security');
      return data;
    } catch {
      return { twoFactorEnabled: false };
    }
  },

  /** PUT /user/security/password — Cambiar contraseña. */
  async changePassword(input: ChangePasswordInput): Promise<{ success: boolean }> {
    try {
      const { data } = await api.put<{ success: boolean }>('/user/security/password', input);
      return data;
    } catch (e: any) {
      throw new Error(extractMessage(e));
    }
  },

  /** PATCH /user/security/2fa — Activar/desactivar verificación en dos pasos. */
  async setTwoFactor(enabled: boolean): Promise<SecuritySettings> {
    try {
      const { data } = await api.patch<SecuritySettings>('/user/security/2fa', { enabled });
      return data;
    } catch (e: any) {
      throw new Error(extractMessage(e));
    }
  },

  /** GET /user/sessions — Sesiones activas. */
  async getSessions(): Promise<UserSession[]> {
    try {
      const { data } = await api.get<any[]>('/user/sessions');
      return data.map((session) => ({
        id: String(session.id),
        device: session.device,
        platform: session.platform,
        location: session.location,
        lastActive: session.lastActive,
        isCurrent: Boolean(session.current),
      }));
    } catch {
      return [];
    }
  },

  /** DELETE /user/sessions/:id — Cerrar una sesión remota. */
  async revokeSession(sessionId: string): Promise<{ revoked: boolean }> {
    try {
      const { data } = await api.delete<{ revoked: boolean }>(`/user/sessions/${sessionId}`);
      return data;
    } catch (e: any) {
      throw new Error(extractMessage(e));
    }
  },

  /** GET /user/accounts — Cuentas vinculadas (Google/Apple/Facebook). */
  async getLinkedAccounts(): Promise<LinkedAccount[]> {
    try {
      const { data } = await api.get<LinkedAccount[]>('/user/accounts');
      return data;
    } catch {
      return AVAILABLE_PROVIDERS.map((a) => ({ ...a }));
    }
  },

  /** POST /user/accounts — Vincular una cuenta externa. */
  async linkAccount(provider: AccountProvider): Promise<LinkedAccount> {
    try {
      const { data } = await api.post<LinkedAccount>('/user/accounts', { provider });
      return data;
    } catch (e: any) {
      throw new Error(extractMessage(e));
    }
  },

  /** DELETE /user/accounts/:provider — Desvincular una cuenta externa. */
  async unlinkAccount(provider: AccountProvider): Promise<{ linked: boolean }> {
    try {
      const { data } = await api.delete<{ linked: boolean }>(`/user/accounts/${provider}`);
      return data;
    } catch (e: any) {
      throw new Error(extractMessage(e));
    }
  },

  /** POST /auth/logout — Cerrar sesión (el token se limpia en el cliente). */
  async logout(): Promise<{ success: boolean }> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Se ignora: el token se limpia igualmente en el cliente.
    }
    events.emit(EVENTS.loggedOut);
    return { success: true };
  },
};
