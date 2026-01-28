/**
 * useVehiclePhoto - Hook for managing vehicle photo upload
 */

import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { uploadVehiclePhoto } from '@/services/vehiclePhotoService';

interface UseVehiclePhotoReturn {
  isUploading: boolean;
  pickAndUploadPhoto: (vehicleId: string, onSuccess?: (url: string) => void) => Promise<string | null>;
}

export const useVehiclePhoto = (): UseVehiclePhotoReturn => {
  const [isUploading, setIsUploading] = useState(false);

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
  }, []);

  return {
    isUploading,
    pickAndUploadPhoto,
  };
};
