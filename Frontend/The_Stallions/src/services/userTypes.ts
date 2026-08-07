/**
 * Shared types for the profile section. These mirror the shapes the future
 * backend will return, so the UI layer never needs to change.
 */

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type ProfileVisibility = 'public' | 'contacts' | 'private';
export type AccountProvider = 'google' | 'apple' | 'facebook';
export type DevicePlatform = 'ios' | 'android' | 'web';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  birthDate: string | null; // DD/MM/YYYY
  gender: Gender | null;
  city: string;
  bio: string;
  photoUrl: string | null;
  createdAt: string;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  birthDate: string | null;
  gender: Gender | null;
  city: string;
  bio: string;
  photoUrl: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  /** Clave base32 del TOTP. Solo se devuelve al activar 2FA. */
  secret?: string | null;
  /** URL otpauth:// para escanear con Google Authenticator/Authy. */
  otpAuthUrl?: string | null;
}

export interface UserSession {
  id: string;
  device: string;
  platform: DevicePlatform;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface LinkedAccount {
  provider: AccountProvider;
  connected: boolean;
  email: string | null;
}

export interface NotificationChannel {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export type NotificationCategoryId = 'tours' | 'messages' | 'events' | 'promotions';

export interface NotificationCategorySettings {
  enabled: boolean;
  channels: NotificationChannel;
}

export interface QuietHours {
  enabled: boolean;
  start: string; // "HH:MM" 24h
  end: string; // "HH:MM" 24h
}

export interface NotificationSettings {
  categories: Record<NotificationCategoryId, NotificationCategorySettings>;
  quietHours: QuietHours;
}

export type NotificationSettingsPatch = Partial<{
  categories: Partial<Record<NotificationCategoryId, Partial<NotificationCategorySettings>>>;
  quietHours: Partial<QuietHours>;
}>;

export interface PrivacySettings {
  visibility: ProfileVisibility;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  discoverable: boolean;
}

export type PrivacySettingsPatch = Partial<PrivacySettings>;

export interface BlockedUser {
  id: string;
  name: string;
  username: string;
}

export interface DataExportResult {
  exportId: string;
  status: 'processing';
  availableForHours: number;
}
