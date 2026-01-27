/**
 * GDPR Service - Account deletion (Art. 17) and data export (Art. 20)
 */

import { File as ExpoFile, Paths } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

/**
 * List all file paths in a user's storage folder (including subfolders).
 * Returns flat array of paths like ["userId/vehicleId/photo.jpg", ...]
 */
const listAllUserFiles = async (bucket: string, userId: string): Promise<string[]> => {
  const { data: entries } = await supabase.storage.from(bucket).list(userId);
  if (!entries || entries.length === 0) return [];

  const paths: string[] = [];

  for (const entry of entries) {
    if (entry.id === null) {
      // Folder: list its contents
      const { data: subFiles } = await supabase.storage
        .from(bucket)
        .list(`${userId}/${entry.name}`);
      if (subFiles) {
        for (const f of subFiles) {
          if (f.id !== null) {
            paths.push(`${userId}/${entry.name}/${f.name}`);
          }
        }
      }
    } else {
      paths.push(`${userId}/${entry.name}`);
    }
  }

  return paths;
};

/**
 * Delete user account and all associated data (RGPD Art. 17 - Droit a l'effacement)
 *
 * Steps:
 * 1. Re-authenticate with password
 * 2. Delete storage files (3 buckets, best-effort)
 * 3. Clear local cache
 * 4. Call database cascade delete function
 * 5. Sign out
 */
export const deleteUserAccount = async (password: string): Promise<ServiceResult<boolean>> => {
  try {
    // 1. Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    // 2. Re-authenticate to verify identity
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });
    if (signInError) {
      return { data: null, error: { message: 'Mot de passe incorrect' } };
    }

    // 3. Delete storage files (best-effort, don't block on failures)
    const buckets = ['documents', 'vehicles', 'avatars'] as const;
    for (const bucket of buckets) {
      try {
        const paths = await listAllUserFiles(bucket, user.id);
        if (paths.length > 0) {
          await supabase.storage.from(bucket).remove(paths);
        }
      } catch {
        // Best-effort: continue even if storage deletion fails
      }
    }

    // 4. Clear local cache
    try {
      await AsyncStorage.clear();
    } catch {
      // Best-effort
    }
    clearSignedUrlCache();

    // 5. Call database cascade delete function
    const { error: rpcError } = await supabase.rpc('delete_user_account');
    if (rpcError) {
      return {
        data: null,
        error: { message: 'Erreur lors de la suppression du compte', code: rpcError.code },
      };
    }

    // 6. Sign out
    await supabase.auth.signOut();

    return { data: true, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erreur lors de la suppression du compte';
    return { data: null, error: { message } };
  }
};

/**
 * Export all user data as JSON (RGPD Art. 20 - Droit a la portabilite)
 * Returns the path to a temporary JSON file
 */
export const exportUserData = async (): Promise<ServiceResult<string>> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: 'Non authentifie' } };
    }

    // Collect all user data
    const [
      profileResult,
      vehiclesResult,
      settingsResult,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('vehicles').select('*').eq('user_id', user.id),
      supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
    ]);

    // Get vehicle IDs for related queries
    const vehicleIds = (vehiclesResult.data ?? []).map((v: { id: string }) => v.id);

    const [
      maintenanceHistoryResult,
      maintenanceScheduleResult,
      documentsResult,
      expensesResult,
    ] = vehicleIds.length > 0
      ? await Promise.all([
          supabase.from('maintenance_history').select('*').in('vehicle_id', vehicleIds),
          supabase.from('maintenance_schedule').select('*').in('vehicle_id', vehicleIds),
          supabase.from('documents').select('*').in('vehicle_id', vehicleIds),
          supabase.from('expenses').select('*').in('vehicle_id', vehicleIds),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

    // Try to get conversations and messages (may not exist yet)
    let conversations: unknown[] = [];
    let messages: unknown[] = [];
    try {
      const convResult = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id);
      conversations = convResult.data ?? [];

      if (conversations.length > 0) {
        const convIds = conversations.map((c: unknown) => (c as { id: string }).id);
        const msgResult = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', convIds);
        messages = msgResult.data ?? [];
      }
    } catch {
      // Tables may not exist yet
    }

    const exportData = {
      exported_at: new Date().toISOString(),
      user_email: user.email,
      profile: profileResult.data,
      settings: settingsResult.data,
      vehicles: vehiclesResult.data,
      maintenance_history: maintenanceHistoryResult.data,
      maintenance_schedule: maintenanceScheduleResult.data,
      documents: documentsResult.data,
      expenses: expensesResult.data,
      conversations,
      messages,
    };

    // Write to temporary file using new expo-file-system API
    const fileName = `car-maintenance-export-${new Date().toISOString().slice(0, 10)}.json`;
    const file = new ExpoFile(Paths.cache, fileName);

    if (file.exists) {
      file.delete();
    }
    file.create();
    file.write(JSON.stringify(exportData, null, 2));

    return { data: file.uri, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de l'export des donnees";
    return { data: null, error: { message } };
  }
};
