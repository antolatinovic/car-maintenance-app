/**
 * Vehicle Photo Service - Upload and manage vehicle photos in Supabase Storage
 */

import { supabase } from '@/core/config/supabase';
import { clearSignedUrlCache } from '@/core/utils/storageUtils';

interface ServiceError {
  message: string;
  code?: string;
}

interface ServiceResult<T> {
  data: T | null;
  error: ServiceError | null;
}

const BUCKET_NAME = 'vehicles';

/**
 * Upload a vehicle photo to Supabase Storage
 * @param vehicleId - The vehicle ID
 * @param uri - Local file URI
 * @param fileName - Optional custom file name
 * @returns The public URL of the uploaded photo
 */
export const uploadVehiclePhoto = async (
  vehicleId: string,
  uri: string,
  fileName?: string
): Promise<ServiceResult<string>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    // Fetch the file and convert to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Determine file extension
    const extension = uri.split('.').pop()?.toLowerCase() || 'jpg';

    // Generate unique file name
    const timestamp = Date.now();
    const finalFileName = fileName || `photo_${timestamp}.${extension}`;
    const filePath = `${user.id}/${vehicleId}/${finalFileName}`;

    // Check if there's an existing photo and delete it
    const { data: existingFiles } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`${user.id}/${vehicleId}`);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `${user.id}/${vehicleId}/${f.name}`);
      await supabase.storage.from(BUCKET_NAME).remove(filesToDelete);
    }

    // Upload new file
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      return { data: null, error: { message: uploadError.message } };
    }

    // Store the relative path (not public URL) for signed URL resolution
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({ photo_url: filePath } as never)
      .eq('id', vehicleId)
      .eq('user_id', user.id);

    if (updateError) {
      // Try to clean up uploaded file if database update fails
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      return { data: null, error: { message: updateError.message } };
    }

    // Clear signed URL cache so new URL is generated
    clearSignedUrlCache('vehicles');

    return { data: filePath, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de l\'upload de la photo';
    return { data: null, error: { message } };
  }
};

/**
 * Remove a vehicle photo from Supabase Storage
 * @param vehicleId - The vehicle ID
 * @returns Success status
 */
export const removeVehiclePhoto = async (
  vehicleId: string
): Promise<ServiceResult<boolean>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    // List and delete all files in the vehicle's folder
    const { data: existingFiles } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`${user.id}/${vehicleId}`);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(f => `${user.id}/${vehicleId}/${f.name}`);
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filesToDelete);

      if (deleteError) {
        return { data: null, error: { message: deleteError.message } };
      }
    }

    // Update vehicle record to remove photo URL
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({ photo_url: null } as never)
      .eq('id', vehicleId)
      .eq('user_id', user.id);

    if (updateError) {
      return { data: null, error: { message: updateError.message } };
    }

    return { data: true, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la suppression de la photo';
    return { data: null, error: { message } };
  }
};
