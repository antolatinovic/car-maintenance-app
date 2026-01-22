/**
 * Color palette for CarMaintenance App
 * Modern Light Mode Theme - Inspired by fitness app design
 */

export const colors = {
  // Background colors
  backgroundPrimary: '#F8F9FE', // Light grey-blue
  backgroundSecondary: '#FFFFFF', // White (cards)
  backgroundTertiary: '#EEF2FF', // Light indigo tint

  // Text colors
  textPrimary: '#1F2937', // Dark grey
  textSecondary: '#6B7280', // Medium grey
  textTertiary: '#9CA3AF', // Light grey
  textOnColor: '#FFFFFF', // White text on colored backgrounds

  // Accent colors
  accentPrimary: '#7C3AED', // Violet - Primary actions
  accentSecondary: '#3B82F6', // Blue - Secondary actions
  accentSuccess: '#10B981', // Green - Success states
  accentWarning: '#F59E0B', // Orange - Warnings
  accentDanger: '#EF4444', // Red - Errors/Urgent

  // UI colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  cardBackground: '#FFFFFF',
  inputBackground: '#F9FAFB',
  inputBorder: '#D1D5DB',

  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',

  // Shadow color
  shadow: '#000000',

  // Transparent
  transparent: 'transparent',
} as const;

// Gradient presets for colored cards
export const gradients = {
  violet: ['#7C3AED', '#5B21B6'] as const,
  blue: ['#3B82F6', '#1D4ED8'] as const,
  pink: ['#EC4899', '#BE185D'] as const,
  teal: ['#14B8A6', '#0D9488'] as const,
  orange: ['#F59E0B', '#D97706'] as const,
  green: ['#10B981', '#059669'] as const,
  red: ['#EF4444', '#DC2626'] as const,
  purple: ['#8B5CF6', '#6D28D9'] as const,
  // Background gradient for glassmorphism effect (violet to peach/warm)
  background: ['#C4B5FD', '#FBCFE8', '#FED7AA'] as const, // Violet -> rose -> pêche
} as const;

// Shadow presets
export const shadows = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
} as const;

export type ColorKey = keyof typeof colors;
export type GradientKey = keyof typeof gradients;
