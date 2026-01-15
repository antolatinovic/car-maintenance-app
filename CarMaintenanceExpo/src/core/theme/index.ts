/**
 * Theme exports for CarMaintenance App
 */

export { colors } from './colors';
export type { ColorKey } from './colors';

export { typography } from './typography';
export type { TypographyKey } from './typography';

export { spacing } from './spacing';
export type { SpacingKey } from './spacing';

// Combined theme object
export const theme = {
  colors: require('./colors').colors,
  typography: require('./typography').typography,
  spacing: require('./spacing').spacing,
};
