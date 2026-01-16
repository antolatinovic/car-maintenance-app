/**
 * Typography styles for CarMaintenance App
 * Modern bold typography
 */

import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  // Headings - Bolder and larger
  h1: {
    fontFamily,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.5,
  } as TextStyle,

  h2: {
    fontFamily,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.3,
  } as TextStyle,

  h3: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
  } as TextStyle,

  // Body text
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,

  bodyMedium: {
    fontFamily,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  } as TextStyle,

  bodySemiBold: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,

  // Captions
  caption: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,

  captionMedium: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  } as TextStyle,

  captionSemiBold: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,

  // Small text
  small: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,

  smallMedium: {
    fontFamily,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  } as TextStyle,

  // Large numbers (for stats, amounts)
  number: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  } as TextStyle,

  numberLarge: {
    fontFamily,
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 44,
  } as TextStyle,

  // Button text
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,

  buttonSmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  } as TextStyle,

  // Tab bar labels
  tabLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  } as TextStyle,

  // Link text
  link: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,
} as const;

export type TypographyKey = keyof typeof typography;
