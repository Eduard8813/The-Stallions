/**
 * Shared palettes (light/dark) for the profile section and tabs.
 * The active palette is selected based on the app theme (ThemeContext).
 */
export const lightColors = {
  bg: '#F2F4F8',
  surface: '#FFFFFF',
  surfaceAlt: '#FFFFFF',
  border: '#E3E6EC',
  text: '#1A1D24',
  subtext: '#6B7280',
  accent: '#6366F1',
  accentSoft: 'rgba(99,102,241,0.14)',
  success: '#16A34A',
  successSoft: 'rgba(22,163,74,0.12)',
  danger: '#DC2626',
  dangerSoft: 'rgba(220,38,38,0.12)',
  inputBg: '#FFFFFF',
  tabBar: '#FFFFFF',
  tabBorder: '#E3E6EC',
  tabActive: '#111111',
  tabInactive: '#9CA3AF',
  cameraBtn: '#e40077',
} as const;

export const darkColors = {
  bg: '#0F1115',
  surface: '#1A1D24',
  surfaceAlt: '#1A1D24',
  border: '#2A2F3B',
  text: '#F2F4F8',
  subtext: '#98A1B3',
  accent: '#6366F1',
  accentSoft: 'rgba(99,102,241,0.16)',
  success: '#22C55E',
  successSoft: 'rgba(34,197,94,0.14)',
  danger: '#EF4444',
  dangerSoft: 'rgba(239,68,68,0.12)',
  inputBg: '#14171E',
  tabBar: '#111111',
  tabBorder: '#222222',
  tabActive: '#ffffff',
  tabInactive: '#555555',
  cameraBtn: '#e40077',
} as const;

export type ProfileColors = typeof lightColors;

export { darkColors as colors };
