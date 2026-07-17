export const darkColors = {
  background: '#0B0F14',
  surface: '#161D26',
  card: '#1E2630',
  primary: '#FF4B4B',
  secondary: '#4DA3FF',
  text: '#F5F7FA',
  textSecondary: '#B5C0CC',
  border: '#2B3642',
  overlay: 'rgba(0, 0, 0, 0.56)',
} as const;

export const lightColors = {
  background: '#F7F9FC',
  surface: '#FFFFFF',
  card: '#EEF2F7',
  primary: '#FF4B4B',
  secondary: '#2E77D0',
  text: '#131A22',
  textSecondary: '#5F6B7A',
  border: '#D6DEE8',
  overlay: 'rgba(19, 26, 34, 0.32)',
} as const;

export type AppColors = typeof darkColors | typeof lightColors;
