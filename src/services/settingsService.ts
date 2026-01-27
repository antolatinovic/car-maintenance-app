/**
 * Settings Service - CRUD operations for user settings
 */

import { supabase } from '@/core/config/supabase';
import { clearSignedUrlCache } from '@/core/utils/storageUtils';
import type { UserSettings, Profile } from '@/core/types/database';

interface ServiceError {
  message: string;
  code?: string;
}

interface ServiceResult<T> {
  data: T | null;
  error: ServiceError | null;
}

/**
 * Get user settings for the current user
 */
export const getUserSettings = async (): Promise<ServiceResult<UserSettings>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no settings exist, create default settings
      if (error.code === 'PGRST116') {
        return createDefaultSettings();
      }
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as UserSettings, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la recuperation des parametres' } };
  }
};

/**
 * Create default settings for a new user
 */
export const createDefaultSettings = async (): Promise<ServiceResult<UserSettings>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const defaultSettings = {
      user_id: user.id,
      notification_enabled: true,
      notification_time_start: '08:00',
      notification_time_end: '20:00',
      notification_categories: ['oil_change', 'brakes', 'filters', 'tires', 'revision'],
      mileage_unit: 'km' as const,
      currency: 'EUR',
      language: 'fr',
      theme: 'light' as const,
    };

    const { data, error } = await supabase
      .from('user_settings')
      .insert(defaultSettings as never)
      .select()
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as UserSettings, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la creation des parametres' } };
  }
};

/**
 * Update user settings
 */
export const updateUserSettings = async (
  updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<ServiceResult<UserSettings>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { data, error } = await supabase
      .from('user_settings')
      .update(updates as never)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as UserSettings, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la mise a jour des parametres' } };
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (
  updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
): Promise<ServiceResult<Profile>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates as never)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as Profile, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la mise a jour du profil' } };
  }
};

/**
 * Upload avatar image to Supabase storage
 */
export const uploadAvatar = async (
  uri: string,
  fileName: string
): Promise<ServiceResult<string>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    // Fetch the image and convert to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    const filePath = `${user.id}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, blob, {
      upsert: true,
      contentType: 'image/jpeg',
    });

    if (uploadError) {
      return { data: null, error: { message: uploadError.message } };
    }

    // Store the relative path (not public URL) for signed URL resolution
    await updateProfile({ avatar_url: filePath });

    // Clear signed URL cache so new URL is generated
    clearSignedUrlCache('avatars');

    return { data: filePath, error: null };
  } catch (error) {
    return { data: null, error: { message: "Erreur lors de l'upload de l'avatar" } };
  }
};

/**
 * Set a vehicle as primary
 */
export const setPrimaryVehicle = async (vehicleId: string): Promise<ServiceResult<boolean>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    // First, unset all vehicles as primary
    await supabase
      .from('vehicles')
      .update({ is_primary: false } as never)
      .eq('user_id', user.id);

    // Then set the selected vehicle as primary
    const { error } = await supabase
      .from('vehicles')
      .update({ is_primary: true } as never)
      .eq('id', vehicleId)
      .eq('user_id', user.id);

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la definition du vehicule principal' } };
  }
};
