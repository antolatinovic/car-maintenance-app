/**
 * Hook for managing user settings
 */

import { useState, useEffect, useCallback } from 'react';
import type { UserSettings } from '@/core/types/database';
import { getUserSettings, updateUserSettings } from '@/services/settingsService';
import { getVehicles } from '@/services/vehicleService';
import { getMaintenanceSchedule } from '@/services/maintenanceService';
import {
  requestPermissions,
  cancelAllNotifications,
  scheduleAllMaintenanceNotifications,
} from '@/services/notificationService';

interface UseSettingsReturn {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  updateSettings: (
    updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => Promise<boolean>;
  toggleNotifications: () => Promise<boolean>;
  setMileageUnit: (unit: 'km' | 'miles') => Promise<boolean>;
  refresh: () => Promise<void>;
}

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getUserSettings();

      if (result.error) {
        setError(result.error.message);
        return;
      }

      setSettings(result.data);
    } catch (err) {
      setError('Erreur lors du chargement des parametres');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(
    async (
      updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
    ): Promise<boolean> => {
      try {
        const result = await updateUserSettings(updates);

        if (result.error) {
          setError(result.error.message);
          return false;
        }

        setSettings(result.data);
        return true;
      } catch (err) {
        setError('Erreur lors de la mise a jour');
        return false;
      }
    },
    []
  );

  const toggleNotifications = useCallback(async (): Promise<boolean> => {
    if (!settings) return false;

    const newValue = !settings.notification_enabled;

    if (newValue) {
      // Enabling notifications
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setError('Permissions de notification refusees');
        return false;
      }

      // Schedule notifications for all maintenances
      const vehiclesResult = await getVehicles();
      if (vehiclesResult.data) {
        for (const vehicle of vehiclesResult.data) {
          const maintenanceResult = await getMaintenanceSchedule(vehicle.id);
          if (maintenanceResult.data) {
            await scheduleAllMaintenanceNotifications(maintenanceResult.data);
          }
        }
      }
    } else {
      // Disabling notifications - cancel all scheduled
      await cancelAllNotifications();
    }

    return updateSettings({ notification_enabled: newValue });
  }, [settings, updateSettings]);

  const setMileageUnit = useCallback(
    async (unit: 'km' | 'miles'): Promise<boolean> => {
      return updateSettings({ mileage_unit: unit });
    },
    [updateSettings]
  );

  const refresh = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    toggleNotifications,
    setMileageUnit,
    refresh,
  };
};
