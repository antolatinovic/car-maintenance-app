/**
 * Glass styles for glassmorphism effect
 * Use with expo-blur BlurView for best effect
 */

import { Platform } from 'react-native';

export const glass = {
  // Light glass - subtle frosted effect
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  // Medium glass - balanced frosted
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  // Dark glass - more opaque frosted
  dark: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  // Blur intensity for BlurView (platform-specific)
  blurIntensity: Platform.select({
    ios: 80,
    android: 90,
    default: 80,
  }),
  // Tint for BlurView - 'light' gives frosted white effect
  blurTint: 'extraLight' as const,
} as const;

export type GlassVariant = 'light' | 'medium' | 'dark';
