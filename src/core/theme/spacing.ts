/**
 * Spacing and dimensions for CarMaintenance App
 * Modern design with larger radiuses
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
  screenPaddingHorizontal: 20,
  screenPaddingVertical: 16,

  // Card dimensions
  cardRadius: 20, // Increased for modern look
  cardRadiusSmall: 12,
  cardPadding: 16,
  cardPaddingLarge: 20,

  // Button dimensions
  buttonRadius: 16, // More rounded
  buttonRadiusSmall: 12,
  buttonHeight: 52,
  buttonHeightSmall: 44,
  buttonPaddingHorizontal: 20,

  // Input dimensions
  inputRadius: 12,
  inputHeight: 52,
  inputPaddingHorizontal: 16,

  // Tab bar
  tabBarHeight: 70,
  tabBarRadius: 24,
  tabBarMargin: 16,
  fabSize: 56, // Floating action button

  // Avatar sizes
  avatarSmall: 32,
  avatarMedium: 44,
  avatarLarge: 56,

  // Icon sizes
  iconSmall: 20,
  iconMedium: 24,
  iconLarge: 32,

  // Badge
  badgeSize: 20,
  badgeDot: 8,
} as const;

export type SpacingKey = keyof typeof spacing;
