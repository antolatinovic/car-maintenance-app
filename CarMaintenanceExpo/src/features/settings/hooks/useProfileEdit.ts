/**
 * Hook for editing user profile and avatar
 */

import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile, uploadAvatar } from '../services/settingsService';

interface UseProfileEditReturn {
  isUpdating: boolean;
  isUploadingAvatar: boolean;
  error: string | null;
  updateUserProfile: (updates: { first_name?: string; last_name?: string }) => Promise<boolean>;
  pickAndUploadAvatar: () => Promise<string | null>;
}

export const useProfileEdit = (onProfileUpdated?: () => void): UseProfileEditReturn => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserProfile = useCallback(
    async (updates: { first_name?: string; last_name?: string }): Promise<boolean> => {
      try {
        setIsUpdating(true);
        setError(null);

        const result = await updateProfile(updates);

        if (result.error) {
          setError(result.error.message);
          return false;
        }

        onProfileUpdated?.();
        return true;
      } catch (err) {
        setError('Erreur lors de la mise a jour du profil');
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [onProfileUpdated]
  );

  const pickAndUploadAvatar = useCallback(async (): Promise<string | null> => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError("Permission d'acces a la galerie refusee");
        return null;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      setIsUploadingAvatar(true);
      setError(null);

      const uri = result.assets[0].uri;
      const fileName = `avatar_${Date.now()}.jpg`;

      const uploadResult = await uploadAvatar(uri, fileName);

      if (uploadResult.error) {
        setError(uploadResult.error.message);
        return null;
      }

      onProfileUpdated?.();
      return uploadResult.data;
    } catch (err) {
      setError("Erreur lors de l'upload de l'avatar");
      return null;
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [onProfileUpdated]);

  return {
    isUpdating,
    isUploadingAvatar,
    error,
    updateUserProfile,
    pickAndUploadAvatar,
  };
};
