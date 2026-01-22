/**
 * Car Skin types - For car appearance customization
 */

export const CAR_SKIN_STORAGE_KEY = 'car_skin_preference';

export type CarSkinId = 'classic' | 'sport';

export interface CarSkin {
  id: CarSkinId;
  name: string;
  description: string;
}

export const CAR_SKINS: CarSkin[] = [
  {
    id: 'classic',
    name: 'Classique',
    description: 'Voiture vintage au style retro',
  },
  {
    id: 'sport',
    name: 'Sport',
    description: 'Voiture de sport moderne et agressive',
  },
];

export const DEFAULT_CAR_SKIN: CarSkinId = 'classic';

// Display mode: show user's photo or skin
export const CAR_DISPLAY_MODE_KEY = 'car_display_mode';
export type CarDisplayMode = 'photo' | 'skin';
export const DEFAULT_CAR_DISPLAY_MODE: CarDisplayMode = 'skin';
