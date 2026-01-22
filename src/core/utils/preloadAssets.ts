/**
 * Preload assets for faster rendering
 * Call this during app startup
 */

import { Asset } from 'expo-asset';

// All images to preload
const images = [
  require('../../../assets/cars/car-classic.png'),
  require('../../../assets/cars/car-sport.png'),
  require('../../../assets/check-success.png'),
];

let isPreloaded = false;

export const preloadAssets = async (): Promise<void> => {
  if (isPreloaded) return;

  try {
    const imageAssets = images.map(image => Asset.fromModule(image).downloadAsync());
    await Promise.all(imageAssets);
    isPreloaded = true;
  } catch (error) {
    console.warn('Failed to preload some assets:', error);
  }
};

export const isAssetsPreloaded = (): boolean => isPreloaded;
