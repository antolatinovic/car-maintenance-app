/**
 * Hook for fetching and managing analytics data
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getYearlySummary, getExpenses, getBudgetSummary } from '@/services/expenseService';
import { getPrimaryVehicle } from '@/services/vehicleService';
import type {
  MonthlyExpenseData,
  CategoryBreakdown,
  MileagePoint,
  CostPerKmData,
  AnalyticsData,
} from '@/core/types/analytics';
import { CHART_COLORS } from '@/core/types/analytics';
import type { Vehicle, Expense } from '@/core/types/database';

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  vehicle: Vehicle | null;
  selectedYear: number;
  availableYears: number[];
  isLoading: boolean;
  error: string | null;
  setSelectedYear: (year: number) => void;
  refresh: () => Promise<void>;
}

export const useAnalyticsData = (): UseAnalyticsReturn => {
  const currentYear = new Date().getFullYear();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [yearlySummary, setYearlySummary] = useState<MonthlyExpenseData[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const availableYears = useMemo(() => {
    const years: number[] = [];
    for (let y = currentYear; y >= currentYear - 5; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get primary vehicle
      const vehicleResult = await getPrimaryVehicle();
      if (vehicleResult.error || !vehicleResult.data) {
        setError('Aucun vehicule trouve');
        setIsLoading(false);
        return;
      }

      const currentVehicle = vehicleResult.data;
      setVehicle(currentVehicle);

      // Get yearly summary for charts
      const summaryResult = await getYearlySummary(currentVehicle.id, selectedYear);
      if (summaryResult.data) {
        const mappedData: MonthlyExpenseData[] = summaryResult.data.map(item => ({
          month: item.month,
          total: item.total,
          fuel: item.fuel,
          maintenance: item.maintenance,
          other: item.total - item.fuel - item.maintenance,
        }));
        setYearlySummary(mappedData);
      }

      // Get all expenses for mileage history
      const expensesResult = await getExpenses(currentVehicle.id);
      if (expensesResult.data) {
        setAllExpenses(expensesResult.data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des donnees');
      console.error('Analytics fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categoryBreakdown = useMemo((): CategoryBreakdown[] => {
    const totals = yearlySummary.reduce(
      (acc, month) => ({
        fuel: acc.fuel + month.fuel,
        maintenance: acc.maintenance + month.maintenance,
        other: acc.other + month.other,
      }),
      { fuel: 0, maintenance: 0, other: 0 }
    );

    const grandTotal = totals.fuel + totals.maintenance + totals.other;
    if (grandTotal === 0) return [];

    const breakdown: CategoryBreakdown[] = [
      {
        category: 'fuel' as const,
        amount: totals.fuel,
        percentage: Math.round((totals.fuel / grandTotal) * 100),
        color: CHART_COLORS.fuel,
      },
      {
        category: 'maintenance' as const,
        amount: totals.maintenance,
        percentage: Math.round((totals.maintenance / grandTotal) * 100),
        color: CHART_COLORS.maintenance,
      },
      {
        category: 'other' as const,
        amount: totals.other,
        percentage: Math.round((totals.other / grandTotal) * 100),
        color: CHART_COLORS.other,
      },
    ];

    return breakdown.filter(item => item.amount > 0);
  }, [yearlySummary]);

  const mileageHistory = useMemo((): MileagePoint[] => {
    const expensesWithMileage = allExpenses
      .filter(e => e.mileage !== null && e.mileage > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return expensesWithMileage.map(e => {
      const date = new Date(e.date);
      const label = `${date.getDate()}/${date.getMonth() + 1}`;
      return {
        date: e.date,
        mileage: e.mileage as number,
        label,
      };
    });
  }, [allExpenses]);

  const costPerKm = useMemo((): CostPerKmData => {
    if (!vehicle) {
      return { value: 0, trend: null, totalExpenses: 0, totalKm: 0 };
    }

    const yearExpenses = allExpenses.filter(e => {
      const expenseYear = new Date(e.date).getFullYear();
      return expenseYear === selectedYear;
    });

    const totalExpenses = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
    const purchaseMileage = vehicle.purchase_mileage || 0;
    const currentMileage = vehicle.current_mileage || 0;
    const totalKm = currentMileage - purchaseMileage;

    const value = totalKm > 0 ? totalExpenses / totalKm : 0;

    // Calculate previous year trend
    const previousYearExpenses = allExpenses.filter(e => {
      const expenseYear = new Date(e.date).getFullYear();
      return expenseYear === selectedYear - 1;
    });

    let trend: number | null = null;
    if (previousYearExpenses.length > 0) {
      const prevTotal = previousYearExpenses.reduce((sum, e) => sum + e.amount, 0);
      if (prevTotal > 0) {
        trend = Math.round(((totalExpenses - prevTotal) / prevTotal) * 100);
      }
    }

    return { value, trend, totalExpenses, totalKm };
  }, [vehicle, allExpenses, selectedYear]);

  const yearTotal = useMemo(() => {
    return yearlySummary.reduce((sum, month) => sum + month.total, 0);
  }, [yearlySummary]);

  const data: AnalyticsData | null = useMemo(() => {
    if (!vehicle || yearlySummary.length === 0) return null;

    return {
      yearlySummary,
      categoryBreakdown,
      mileageHistory,
      costPerKm,
      yearTotal,
    };
  }, [vehicle, yearlySummary, categoryBreakdown, mileageHistory, costPerKm, yearTotal]);

  return {
    data,
    vehicle,
    selectedYear,
    availableYears,
    isLoading,
    error,
    setSelectedYear,
    refresh: fetchData,
  };
};
