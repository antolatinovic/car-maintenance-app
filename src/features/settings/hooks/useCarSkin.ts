/**
 * useCarSkin - Hook for managing car skin preference
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CarSkinId } from '@/core/types';
import { DEFAULT_CAR_SKIN, CAR_SKIN_STORAGE_KEY } from '@/core/types';

interface UseCarSkinReturn {
  currentSkin: CarSkinId;
  isLoading: boolean;
  setSkin: (skinId: CarSkinId) => Promise<boolean>;
}

export const useCarSkin = (): UseCarSkinReturn => {
  const [currentSkin, setCurrentSkin] = useState<CarSkinId>(DEFAULT_CAR_SKIN);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preference on mount
  useEffect(() => {
    const loadSkin = async () => {
      try {
        const savedSkin = await AsyncStorage.getItem(CAR_SKIN_STORAGE_KEY);
        if (savedSkin && (savedSkin === 'classic' || savedSkin === 'sport')) {
          setCurrentSkin(savedSkin);
        }
      } catch (error) {
        console.error('Error loading car skin preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSkin();
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

  return {
    currentSkin,
    isLoading,
    setSkin,
  };
};
