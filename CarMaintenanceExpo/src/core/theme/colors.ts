/**
 * Color palette for CarMaintenance App
 * Based on PRD Section 6.1 - Dark Theme
 */

export const colors = {
  // Background colors
  backgroundPrimary: '#121212',
  backgroundSecondary: '#1E1E1E',
  backgroundTertiary: '#2C2C2C',

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textTertiary: '#808080',

  // Accent colors
  accentPrimary: '#4A90E2', // Blue - Primary actions
  accentSuccess: '#50C878', // Green - Success states
  accentWarning: '#FFB347', // Orange - Warnings
  accentDanger: '#FF6B6B', // Red - Errors/Urgent

  // UI colors
  border: '#2C2C2C',
  borderLight: '#3C3C3C',
  cardBackground: '#1E1E1E',
  inputBackground: '#1E1E1E',

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Gradient colors
  gradientStart: '#4A90E2',
  gradientEnd: '#2C5282',

  // Transparent
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
