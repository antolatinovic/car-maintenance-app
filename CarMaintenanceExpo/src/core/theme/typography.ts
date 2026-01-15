/**
 * Typography styles for CarMaintenance App
 * Based on PRD Section 6.1
 */

import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  // Headings
  h1: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  } as TextStyle,

  h2: {
    fontFamily,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
  } as TextStyle,

  h3: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,

  // Body text
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  } as TextStyle,

  bodyMedium: {
    fontFamily,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  } as TextStyle,

  // Captions
  caption: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
  } as TextStyle,

  captionMedium: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  } as TextStyle,

  // Small text
  small: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,

  // Button text
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  } as TextStyle,

  // Tab bar labels
  tabLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 12,
  } as TextStyle,
} as const;

export type TypographyKey = keyof typeof typography;
