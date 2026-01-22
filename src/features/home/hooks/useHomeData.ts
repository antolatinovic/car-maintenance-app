/**
 * Hook for fetching and managing HomeScreen data
 * Uses offline service for offline support
 * Includes memory cache to avoid reload on tab switch
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { vehicles, maintenance } from '@/services/offlineService';
import { getBudgetSummary, BudgetSummary } from '@/services/expenseService';
import { useOfflineContext } from '@/core/contexts';
import type { Vehicle } from '@/core/types/database';
import type { UpcomingMaintenance } from '@/services/maintenanceService';

interface HomeData {
  vehicle: Vehicle | null;
  budgets: BudgetSummary | null;
  maintenances: UpcomingMaintenance[];
  isLoading: boolean;
  error: string | null;
  isFromCache: boolean;
}

interface UseHomeDataReturn extends HomeData {
  refresh: () => Promise<void>;
}

// Memory cache to persist data between tab switches
let memoryCache: {
  data: Omit<HomeData, 'isLoading'> | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

// Cache duration: 30 seconds
const CACHE_DURATION = 30 * 1000;

export const useHomeData = (): UseHomeDataReturn => {
  const { isOnline } = useOfflineContext();
  const isMounted = useRef(true);

  // Initialize with cached data if available and fresh
  const getCachedData = (): HomeData => {
    const isCacheFresh = Date.now() - memoryCache.timestamp < CACHE_DURATION;
    if (memoryCache.data && isCacheFresh) {
      return { ...memoryCache.data, isLoading: false };
    }
    return {
      vehicle: memoryCache.data?.vehicle || null,
      budgets: memoryCache.data?.budgets || null,
      maintenances: memoryCache.data?.maintenances || [],
      isLoading: !memoryCache.data,
      error: null,
      isFromCache: false,
    };
  };

  const [data, setData] = useState<HomeData>(getCachedData);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Skip fetch if cache is fresh and not forcing refresh
    const isCacheFresh = Date.now() - memoryCache.timestamp < CACHE_DURATION;
    if (!forceRefresh && memoryCache.data && isCacheFresh) {
      return;
    }

    // Only show loading if we don't have any cached data
    if (!memoryCache.data) {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      // Fetch primary vehicle (works offline with cache)
      const vehicleResult = await vehicles.getPrimary();
      if (!isMounted.current) return;

      const vehicle = vehicleResult.data;

      // If no vehicle AND there's an error, show the error
      if (!vehicle && vehicleResult.error) {
        const newData = {
          vehicle: null,
          budgets: null,
          maintenances: [],
          error: vehicleResult.error?.message || null,
          isFromCache: vehicleResult.fromCache,
        };
        memoryCache = { data: newData, timestamp: Date.now() };
        setData({ ...newData, isLoading: false });
        return;
      }

      // If no vehicle (and no error), show empty state - user genuinely has no vehicles
      if (!vehicle) {
        const newData = {
          vehicle: null,
          budgets: null,
          maintenances: [],
          error: null,
          isFromCache: vehicleResult.fromCache,
        };
        memoryCache = { data: newData, timestamp: Date.now() };
        setData({ ...newData, isLoading: false });
        return;
      }

      // Fetch maintenances (works offline with cache)
      const maintenanceResult = await maintenance.getUpcoming(
        vehicle.id,
        vehicle.current_mileage || undefined
      );
      if (!isMounted.current) return;

      // Budget summary - only fetch when online (not critical for offline)
      let budgets: BudgetSummary | null = null;
      if (isOnline) {
        try {
          const budgetResult = await getBudgetSummary(vehicle.id);
          budgets = budgetResult.data;
        } catch {
          // Ignore budget errors when offline
        }
      }

      const newData = {
        vehicle,
        budgets,
        maintenances: maintenanceResult.data || [],
        error: null,
        isFromCache: vehicleResult.fromCache || maintenanceResult.fromCache,
      };

      // Update memory cache
      memoryCache = { data: newData, timestamp: Date.now() };

      if (isMounted.current) {
        setData({ ...newData, isLoading: false });
      }
    } catch (error) {
      if (isMounted.current) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erreur lors du chargement des donnees',
          isFromCache: false,
        }));
      }
    }
  }, [isOnline]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(true); // Force refresh
  }, [fetchData]);

  return {
    ...data,
    refresh,
  };
};
