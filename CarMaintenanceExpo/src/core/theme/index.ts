/**
 * Theme exports for CarMaintenance App
 */

export { colors, gradients, shadows } from './colors';
export type { ColorKey, GradientKey } from './colors';

export { typography } from './typography';
export type { TypographyKey } from './typography';

export { spacing } from './spacing';
export type { SpacingKey } from './spacing';

// Combined theme object
export const theme = {
  colors: require('./colors').colors,
  gradients: require('./colors').gradients,
  shadows: require('./colors').shadows,
  typography: require('./typography').typography,
  spacing: require('./spacing').spacing,
};
