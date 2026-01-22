/**
 * useVehiclePhoto - Hook for managing vehicle photo upload and display preference
 */

import { useState, useCallback, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { uploadVehiclePhoto } from '@/services/vehiclePhotoService';
import type { CarDisplayMode } from '@/core/types';
import { CAR_DISPLAY_MODE_KEY, DEFAULT_CAR_DISPLAY_MODE } from '@/core/types';

interface UseVehiclePhotoReturn {
  isUploading: boolean;
  displayMode: CarDisplayMode;
  setDisplayMode: (mode: CarDisplayMode) => Promise<boolean>;
  pickAndUploadPhoto: (vehicleId: string, onSuccess?: (url: string) => void) => Promise<string | null>;
  toggleDisplayMode: () => Promise<void>;
}

export const useVehiclePhoto = (): UseVehiclePhotoReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [displayMode, setDisplayModeState] = useState<CarDisplayMode>(DEFAULT_CAR_DISPLAY_MODE);

  // Load display mode preference on mount
  useEffect(() => {
    const loadDisplayMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(CAR_DISPLAY_MODE_KEY);
        if (savedMode === 'photo' || savedMode === 'skin') {
          setDisplayModeState(savedMode);
        }
      } catch (error) {
        console.error('Error loading display mode:', error);
      }
    };

    loadDisplayMode();
  }, []);

  const setDisplayMode = useCallback(async (mode: CarDisplayMode): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(CAR_DISPLAY_MODE_KEY, mode);
      setDisplayModeState(mode);
      return true;
    } catch (error) {
      console.error('Error saving display mode:', error);
      return false;
    }
  }, []);

  const toggleDisplayMode = useCallback(async () => {
    const newMode = displayMode === 'photo' ? 'skin' : 'photo';
    await setDisplayMode(newMode);
  }, [displayMode, setDisplayMode]);

  const pickAndUploadPhoto = useCallback(async (
    vehicleId: string,
    onSuccess?: (url: string) => void
  ): Promise<string | null> => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission requise',
          'Veuillez autoriser l\'acces a la galerie pour ajouter une photo.'
        );
        return null;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      setIsUploading(true);

      const uri = result.assets[0].uri;
      const uploadResult = await uploadVehiclePhoto(vehicleId, uri);

      if (uploadResult.error) {
        Alert.alert('Erreur', uploadResult.error.message);
        return null;
      }

      // Switch to photo display mode after successful upload
      await setDisplayMode('photo');

      // Call success callback
      if (uploadResult.data && onSuccess) {
        onSuccess(uploadResult.data);
      }

      return uploadResult.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'upload';
      Alert.alert('Erreur', message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [setDisplayMode]);

  return {
    isUploading,
    displayMode,
    setDisplayMode,
    pickAndUploadPhoto,
    toggleDisplayMode,
  };
};
