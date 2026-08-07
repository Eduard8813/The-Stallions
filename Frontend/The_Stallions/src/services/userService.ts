import { EVENTS, events } from './events';
import { mockRequest } from './mockApi';
import { profileSource } from './profileSource';
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

let twoFactorEnabled = false;

const AVAILABLE_PROVIDERS: LinkedAccount[] = [
  { provider: 'google', connected: false, email: null },
  { provider: 'apple', connected: false, email: null },
  { provider: 'facebook', connected: false, email: null },
];

export const userService = {
  /**
   * GET /user/profile — Obtener perfil del usuario autenticado.
   * Mientras el backend no existe, se precarga lo que dejó el login
   * (correo/contraseña o Google) y la foto elegida en la app.
   */
  async getProfile(): Promise<UserProfile> {
    // Real: return (await api.get('/user/profile')).data;
    return mockRequest<UserProfile>(async () => {
      const source = await profileSource.get();
      const parts = (source.fullName ?? '').trim().split(/\s+/).filter(Boolean);
      const firstName = parts[0] ?? '';
      const lastName = parts.slice(1).join(' ');
      const username = source.email ? source.email.split('@')[0] : '';
      return {
        ...EMPTY_PROFILE,
        firstName,
        lastName,
        username,
        email: source.email ?? '',
        photoUrl: source.localPhoto ?? source.photo ?? null,
      };
    });
  },

  /** PUT /user/profile — Actualizar datos básicos del perfil. */
  async updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
    // Real: return (await api.put('/user/profile', input)).data;
    return mockRequest<UserProfile>(() => ({ ...EMPTY_PROFILE, ...input }));
  },

  /** POST /user/profile/photo — Subir foto de perfil (multipart/form-data). */
  async uploadProfilePhoto(uri: string): Promise<{ photoUrl: string }> {
    // Real: const form = new FormData(); form.append('photo', { uri, name, type }); return (await api.post('/user/profile/photo', form)).data;
    return mockRequest<{ photoUrl: string }>(async () => {
      await profileSource.setLocalPhoto(uri);
      return { photoUrl: uri };
    });
  },

  /** GET /user/security — Estado de seguridad (2FA). */
  async getSecuritySettings(): Promise<SecuritySettings> {
    // Real: return (await api.get('/user/security')).data;
    return mockRequest<SecuritySettings>(() => ({ twoFactorEnabled }));
  },

  /** PUT /user/security/password — Cambiar contraseña. */
  async changePassword(_input: ChangePasswordInput): Promise<{ success: boolean }> {
    // Real: return (await api.put('/user/security/password', input)).data;
    return mockRequest(() => ({ success: true }));
  },

  /** PATCH /user/security/2fa — Activar/desactivar verificación en dos pasos. */
  async setTwoFactor(enabled: boolean): Promise<SecuritySettings> {
    // Real: return (await api.patch('/user/security/2fa', { enabled })).data;
    return mockRequest<SecuritySettings>(() => {
      twoFactorEnabled = enabled;
      return { twoFactorEnabled: enabled };
    });
  },

  /** GET /user/sessions — Sesiones activas. */
  async getSessions(): Promise<UserSession[]> {
    // Real: return (await api.get('/user/sessions')).data;
    return mockRequest<UserSession[]>(() => []);
  },

  /** DELETE /user/sessions/:id — Cerrar una sesión remota. */
  async revokeSession(_sessionId: string): Promise<{ revoked: boolean }> {
    // Real: return (await api.delete(`/user/sessions/${sessionId}`)).data;
    return mockRequest(() => ({ revoked: true }));
  },

  /** GET /user/accounts — Cuentas vinculadas (Google/Apple/Facebook). */
  async getLinkedAccounts(): Promise<LinkedAccount[]> {
    // Real: return (await api.get('/user/accounts')).data;
    return mockRequest<LinkedAccount[]>(() => AVAILABLE_PROVIDERS.map((a) => ({ ...a })));
  },

  /** POST /user/accounts — Vincular una cuenta externa. */
  async linkAccount(provider: AccountProvider): Promise<LinkedAccount> {
    // Real: return (await api.post('/user/accounts', { provider })).data;
    return mockRequest<LinkedAccount>(() => ({ provider, connected: true, email: null }));
  },

  /** DELETE /user/accounts/:provider — Desvincular una cuenta externa. */
  async unlinkAccount(_provider: AccountProvider): Promise<{ linked: boolean }> {
    // Real: return (await api.delete(`/user/accounts/${provider}`)).data;
    return mockRequest(() => ({ linked: false }));
  },

  /** POST /auth/logout — Cerrar sesión (el token se limpia localmente). */
  async logout(): Promise<{ success: boolean }> {
    // Real: return (await api.post('/auth/logout')).data;
    return mockRequest(() => {
      events.emit(EVENTS.loggedOut);
      return { success: true };
    });
  },
};
