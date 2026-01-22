/**
 * useCarSkin - Hook for managing car skin preference
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CarSkinId, CarDisplayMode } from '@/core/types';
import {
  DEFAULT_CAR_SKIN,
  CAR_SKIN_STORAGE_KEY,
  CAR_DISPLAY_MODE_KEY,
  DEFAULT_CAR_DISPLAY_MODE,
} from '@/core/types';

interface UseCarSkinReturn {
  currentSkin: CarSkinId;
  isLoading: boolean;
  setSkin: (skinId: CarSkinId) => Promise<boolean>;
  displayMode: CarDisplayMode;
  setDisplayMode: (mode: CarDisplayMode) => Promise<boolean>;
}

export const useCarSkin = (): UseCarSkinReturn => {
  const [currentSkin, setCurrentSkin] = useState<CarSkinId>(DEFAULT_CAR_SKIN);
  const [displayMode, setDisplayModeState] = useState<CarDisplayMode>(DEFAULT_CAR_DISPLAY_MODE);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedSkin, savedMode] = await Promise.all([
          AsyncStorage.getItem(CAR_SKIN_STORAGE_KEY),
          AsyncStorage.getItem(CAR_DISPLAY_MODE_KEY),
        ]);
        if (savedSkin && (savedSkin === 'classic' || savedSkin === 'sport')) {
          setCurrentSkin(savedSkin);
        }
        if (savedMode && (savedMode === 'photo' || savedMode === 'skin')) {
          setDisplayModeState(savedMode);
        }
      } catch (error) {
        console.error('Error loading car preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const setSkin = useCallback(async (skinId: CarSkinId): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(CAR_SKIN_STORAGE_KEY, skinId);
      setCurrentSkin(skinId);
      return true;
    } catch (error) {
      console.error('Error saving car skin preference:', error);
      return false;
    }
  }, []);

  const setDisplayMode = useCallback(async (mode: CarDisplayMode): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(CAR_DISPLAY_MODE_KEY, mode);
      setDisplayModeState(mode);
      return true;
    } catch (error) {
      console.error('Error saving display mode preference:', error);
      return false;
    }
  }, []);

  return {
    currentSkin,
    isLoading,
    setSkin,
    displayMode,
    setDisplayMode,
  };
};
