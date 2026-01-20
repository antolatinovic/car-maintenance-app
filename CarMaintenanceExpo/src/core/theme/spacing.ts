/**
 * Spacing and dimensions for CarMaintenance App
 * Based on PRD Section 6.2
 */

export const spacing = {
  // Base spacing units
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  // Screen padding
  screenPaddingHorizontal: 16,
  screenPaddingVertical: 16,

  // Card dimensions
  cardRadius: 12,
  cardPadding: 16,

  // Button dimensions
  buttonRadius: 8,
  buttonHeight: 48,
  buttonPaddingHorizontal: 16,

  // Input dimensions
  inputRadius: 8,
  inputHeight: 48,
  inputPaddingHorizontal: 16,

  // Tab bar
  tabBarHeight: 60,
  tabBarRadius: 20,
  tabBarMargin: 16,

  // Avatar sizes
  avatarSmall: 32,
  avatarMedium: 40,
  avatarLarge: 56,

  // Icon sizes
  iconSmall: 20,
  iconMedium: 24,
  iconLarge: 32,
} as const;

export type SpacingKey = keyof typeof spacing;
