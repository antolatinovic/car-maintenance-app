/**
 * Hook for building vehicle context for AI assistant
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/core/config/supabase';
import { getPrimaryVehicle } from '@/services/vehicleService';
import type { VehicleContext, MaintenanceSummary } from '../types';
import type { Vehicle, MaintenanceHistory, MaintenanceSchedule } from '@/core/types/database';

type HistoryRow = Pick<MaintenanceHistory, 'category' | 'date' | 'mileage' | 'description'>;
type ScheduleRow = Pick<MaintenanceSchedule, 'category' | 'due_date' | 'description'>;

interface UseVehicleContextReturn {
  vehicleContext: VehicleContext | null;
  vehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setVehicle: (vehicle: Vehicle | null) => void;
}

export const useVehicleContext = (): UseVehicleContextReturn => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [vehicleContext, setVehicleContext] = useState<VehicleContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildContext = useCallback(async (v: Vehicle | null) => {
    if (!v) {
      setVehicleContext(null);
      return;
    }

    try {
      // Get maintenance history
      const { data: history } = await supabase
        .from('maintenance_history')
        .select('category, date, mileage, description')
        .eq('vehicle_id', v.id)
        .order('date', { ascending: false })
        .limit(10);

      // Get upcoming maintenance
      const { data: scheduled } = await supabase
        .from('maintenance_schedule')
        .select('category, due_date, description')
        .eq('vehicle_id', v.id)
        .eq('status', 'pending')
        .order('due_date', { ascending: true })
        .limit(5);

      const maintenanceHistory: MaintenanceSummary[] = ((history || []) as HistoryRow[]).map(h => ({
        category: h.category,
        date: h.date,
        mileage: h.mileage || undefined,
        description: h.description || undefined,
      }));

      const upcomingMaintenance: MaintenanceSummary[] = ((scheduled || []) as ScheduleRow[]).map(
        s => ({
          category: s.category,
          date: s.due_date || '',
          description: s.description || undefined,
        })
      );

      setVehicleContext({
        vehicle: v,
        maintenanceHistory,
        upcomingMaintenance,
      });
    } catch (err) {
      console.error('Error building vehicle context:', err);
      // Still set basic vehicle context even if history fails
      setVehicleContext({
        vehicle: v,
        maintenanceHistory: [],
        upcomingMaintenance: [],
      });
    }
  }, []);

  const fetchVehicle = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getPrimaryVehicle();

      if (result.error) {
        setError(result.error.message);
        setVehicle(null);
        setVehicleContext(null);
      } else {
        setVehicle(result.data);
        await buildContext(result.data);
      }
    } catch (err) {
      setError('Erreur lors de la recuperation du vehicule');
      setVehicle(null);
      setVehicleContext(null);
    } finally {
      setIsLoading(false);
    }
  }, [buildContext]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  const refresh = useCallback(async () => {
    await fetchVehicle();
  }, [fetchVehicle]);

  const handleSetVehicle = useCallback(
    async (v: Vehicle | null) => {
      setVehicle(v);
      await buildContext(v);
    },
    [buildContext]
  );

  return {
    vehicleContext,
    vehicle,
    isLoading,
    error,
    refresh,
    setVehicle: handleSetVehicle,
  };
};
