/**
 * Hook for managing vehicles in settings
 */

import { useState, useEffect, useCallback } from 'react';
import type { Vehicle } from '@/core/types/database';
import { getVehicles } from '@/services/vehicleService';
import { setPrimaryVehicle } from '../services/settingsService';

interface UseVehicleManagementReturn {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  primaryVehicleId: string | null;
  setAsPrimary: (vehicleId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export const useVehicleManagement = (): UseVehicleManagementReturn => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getVehicles();

      if (result.error) {
        setError(result.error.message);
        return;
      }

      setVehicles(result.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des vehicules');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const primaryVehicleId = vehicles.find(v => v.is_primary)?.id || null;

  const setAsPrimary = useCallback(async (vehicleId: string): Promise<boolean> => {
    try {
      const result = await setPrimaryVehicle(vehicleId);

      if (result.error) {
        setError(result.error.message);
        return false;
      }

      // Update local state
      setVehicles(prev =>
        prev.map(v => ({
          ...v,
          is_primary: v.id === vehicleId,
        }))
      );

      return true;
    } catch (err) {
      setError('Erreur lors de la mise a jour');
      return false;
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchVehicles();
  }, [fetchVehicles]);

  return {
    vehicles,
    isLoading,
    error,
    primaryVehicleId,
    setAsPrimary,
    refresh,
  };
};
