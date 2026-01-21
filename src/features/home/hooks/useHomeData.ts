/**
 * Hook for fetching and managing HomeScreen data
 */

import { useState, useEffect, useCallback } from 'react';
import { getPrimaryVehicle } from '@/services/vehicleService';
import { getUpcomingMaintenances, UpcomingMaintenance } from '@/services/maintenanceService';
import { getBudgetSummary, BudgetSummary } from '@/services/expenseService';
import type { Vehicle } from '@/core/types/database';

interface HomeData {
  vehicle: Vehicle | null;
  budgets: BudgetSummary | null;
  maintenances: UpcomingMaintenance[];
  isLoading: boolean;
  error: string | null;
}

interface UseHomeDataReturn extends HomeData {
  refresh: () => Promise<void>;
}

export const useHomeData = (): UseHomeDataReturn => {
  const [data, setData] = useState<HomeData>({
    vehicle: null,
    budgets: null,
    maintenances: [],
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch primary vehicle
      const vehicleResult = await getPrimaryVehicle();

      if (vehicleResult.error) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: vehicleResult.error?.message || null,
        }));
        return;
      }

      const vehicle = vehicleResult.data;

      // If no vehicle, return early with empty state
      if (!vehicle) {
        setData({
          vehicle: null,
          budgets: null,
          maintenances: [],
          isLoading: false,
          error: null,
        });
        return;
      }

      // Fetch budget and maintenances in parallel
      const [budgetResult, maintenanceResult] = await Promise.all([
        getBudgetSummary(vehicle.id),
        getUpcomingMaintenances(vehicle.id, vehicle.current_mileage || undefined),
      ]);

      setData({
        vehicle,
        budgets: budgetResult.data,
        maintenances: maintenanceResult.data || [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors du chargement des donnees',
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    ...data,
    refresh,
  };
};
