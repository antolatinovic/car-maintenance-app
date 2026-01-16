/**
 * Hook for managing maintenance schedules in calendar
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  getMaintenanceSchedule,
  scheduleMaintenance,
  completeMaintenance,
  deleteSchedule,
  CreateScheduleData,
} from '@/services/maintenanceService';
import type { MaintenanceSchedule, MaintenanceCategory } from '@/core/types/database';

export type UrgencyLevel = 'overdue' | 'soon' | 'upcoming';

export interface CalendarMaintenance extends MaintenanceSchedule {
  urgency: UrgencyLevel;
}

export interface UseMaintenanceSchedulesResult {
  schedules: CalendarMaintenance[];
  filteredSchedules: CalendarMaintenance[];
  isLoading: boolean;
  error: string | null;
  categoryFilter: MaintenanceCategory | 'all';
  setCategoryFilter: (filter: MaintenanceCategory | 'all') => void;
  getSchedulesForDate: (date: Date) => CalendarMaintenance[];
  getDatesWithSchedules: () => Set<string>;
  refresh: () => Promise<void>;
  addSchedule: (data: CreateScheduleData) => Promise<boolean>;
  completeSchedule: (scheduleId: string) => Promise<boolean>;
  removeSchedule: (scheduleId: string) => Promise<boolean>;
}

const calculateUrgency = (schedule: MaintenanceSchedule, currentMileage?: number): UrgencyLevel => {
  const now = new Date();

  // Check date-based urgency
  if (schedule.due_date) {
    const dueDate = new Date(schedule.due_date);
    const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) {
      return 'overdue';
    }
    if (daysUntil <= 14) {
      return 'soon';
    }
  }

  // Check mileage-based urgency
  if (schedule.due_mileage && currentMileage) {
    const kmUntil = schedule.due_mileage - currentMileage;

    if (kmUntil < 0) {
      return 'overdue';
    }
    if (kmUntil <= 500) {
      return 'soon';
    }
  }

  return 'upcoming';
};

const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const useMaintenanceSchedules = (
  vehicleId: string | null,
  currentMileage?: number
): UseMaintenanceSchedulesResult => {
  const [schedules, setSchedules] = useState<CalendarMaintenance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<MaintenanceCategory | 'all'>('all');

  const fetchSchedules = useCallback(async () => {
    if (!vehicleId) {
      setSchedules([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getMaintenanceSchedule(vehicleId);

      if (result.error) {
        setError(result.error.message);
        setSchedules([]);
      } else if (result.data) {
        const schedulesWithUrgency = result.data.map(schedule => ({
          ...schedule,
          urgency: calculateUrgency(schedule, currentMileage),
        }));
        setSchedules(schedulesWithUrgency);
      }
    } catch (err) {
      setError('Erreur lors du chargement des maintenances');
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  }, [vehicleId, currentMileage]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const filteredSchedules = useMemo(() => {
    if (categoryFilter === 'all') {
      return schedules;
    }
    return schedules.filter(s => s.category === categoryFilter);
  }, [schedules, categoryFilter]);

  const getSchedulesForDate = useCallback(
    (date: Date): CalendarMaintenance[] => {
      const dateKey = formatDateKey(date);
      return filteredSchedules.filter(s => {
        if (!s.due_date) return false;
        return s.due_date.split('T')[0] === dateKey;
      });
    },
    [filteredSchedules]
  );

  const getDatesWithSchedules = useCallback((): Set<string> => {
    const dates = new Set<string>();
    filteredSchedules.forEach(s => {
      if (s.due_date) {
        dates.add(s.due_date.split('T')[0]);
      }
    });
    return dates;
  }, [filteredSchedules]);

  const addSchedule = useCallback(
    async (data: CreateScheduleData): Promise<boolean> => {
      try {
        const result = await scheduleMaintenance(data);
        if (result.error) {
          setError(result.error.message);
          return false;
        }
        await fetchSchedules();
        return true;
      } catch (err) {
        setError("Erreur lors de l'ajout de la maintenance");
        return false;
      }
    },
    [fetchSchedules]
  );

  const completeSchedule = useCallback(
    async (scheduleId: string): Promise<boolean> => {
      try {
        const result = await completeMaintenance(scheduleId);
        if (result.error) {
          setError(result.error.message);
          return false;
        }
        await fetchSchedules();
        return true;
      } catch (err) {
        setError('Erreur lors de la completion');
        return false;
      }
    },
    [fetchSchedules]
  );

  const removeSchedule = useCallback(
    async (scheduleId: string): Promise<boolean> => {
      try {
        const result = await deleteSchedule(scheduleId);
        if (result.error) {
          setError(result.error.message);
          return false;
        }
        await fetchSchedules();
        return true;
      } catch (err) {
        setError('Erreur lors de la suppression');
        return false;
      }
    },
    [fetchSchedules]
  );

  return {
    schedules,
    filteredSchedules,
    isLoading,
    error,
    categoryFilter,
    setCategoryFilter,
    getSchedulesForDate,
    getDatesWithSchedules,
    refresh: fetchSchedules,
    addSchedule,
    completeSchedule,
    removeSchedule,
  };
};
