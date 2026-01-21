/**
 * Maintenance Service - Operations for maintenance history and schedules
 */

import { supabase } from '@/core/config/supabase';
import type {
  MaintenanceHistory,
  MaintenanceSchedule,
  MaintenanceCategory,
} from '@/core/types/database';

interface ServiceError {
  message: string;
  code?: string;
}

interface ServiceResult<T> {
  data: T | null;
  error: ServiceError | null;
}

export interface CreateMaintenanceData {
  vehicle_id: string;
  category: MaintenanceCategory;
  subcategory?: string;
  date: string;
  mileage?: number;
  cost?: number;
  description?: string;
  location?: string;
  invoice_id?: string;
  notes?: string;
}

export interface CreateScheduleData {
  vehicle_id: string;
  category: MaintenanceCategory;
  subcategory?: string;
  description?: string;
  reminder_type: 'date' | 'mileage' | 'both';
  due_date?: string;
  due_mileage?: number;
  notification_advance_days?: number;
  notification_advance_km?: number;
  recurrence_type?: 'none' | 'monthly' | 'yearly' | 'km_based';
  recurrence_value?: number;
  estimated_cost?: number;
  location?: string;
  notes?: string;
}

/**
 * Get maintenance history for a vehicle
 */
export const getMaintenanceHistory = async (
  vehicleId: string
): Promise<ServiceResult<MaintenanceHistory[]>> => {
  try {
    const { data, error } = await supabase
      .from('maintenance_history')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('date', { ascending: false });

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as MaintenanceHistory[], error: null };
  } catch (error) {
    return { data: null, error: { message: "Erreur lors de la recuperation de l'historique" } };
  }
};

/**
 * Get scheduled maintenances for a vehicle
 */
export const getMaintenanceSchedule = async (
  vehicleId: string
): Promise<ServiceResult<MaintenanceSchedule[]>> => {
  try {
    const { data, error } = await supabase
      .from('maintenance_schedule')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .in('status', ['pending', 'overdue'])
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as MaintenanceSchedule[], error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la recuperation des maintenances' } };
  }
};

/**
 * Get upcoming maintenances with urgency calculation
 */
export interface UpcomingMaintenance {
  id: string;
  title: string;
  category: MaintenanceCategory;
  dueDate?: string;
  dueMileage?: number;
  urgency: 'overdue' | 'soon' | 'upcoming';
}

export const getUpcomingMaintenances = async (
  vehicleId: string,
  currentMileage?: number
): Promise<ServiceResult<UpcomingMaintenance[]>> => {
  try {
    const { data, error } = await supabase
      .from('maintenance_schedule')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .in('status', ['pending', 'overdue'])
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(5);

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    const now = new Date();
    const upcoming: UpcomingMaintenance[] = (data as MaintenanceSchedule[]).map(item => {
      let urgency: UpcomingMaintenance['urgency'] = 'upcoming';

      // Check date-based urgency
      if (item.due_date) {
        const dueDate = new Date(item.due_date);
        const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil < 0) {
          urgency = 'overdue';
        } else if (daysUntil <= 14) {
          urgency = 'soon';
        }
      }

      // Check mileage-based urgency (if applicable)
      if (item.due_mileage && currentMileage) {
        const kmUntil = item.due_mileage - currentMileage;

        if (kmUntil < 0) {
          urgency = 'overdue';
        } else if (kmUntil <= 500 && urgency !== 'overdue') {
          urgency = 'soon';
        }
      }

      // Title from description or category
      const categoryLabels: Record<MaintenanceCategory, string> = {
        oil_change: 'Vidange',
        brakes: 'Freins',
        filters: 'Filtres',
        tires: 'Pneus',
        mechanical: 'Mecanique',
        revision: 'Revision',
        ac: 'Climatisation',
        custom: 'Autre',
      };

      return {
        id: item.id,
        title: item.description || categoryLabels[item.category],
        category: item.category,
        dueDate: item.due_date || undefined,
        dueMileage: item.due_mileage || undefined,
        urgency,
      };
    });

    return { data: upcoming, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la recuperation des maintenances' } };
  }
};

/**
 * Add a maintenance record
 */
export const addMaintenance = async (
  maintenanceData: CreateMaintenanceData
): Promise<ServiceResult<MaintenanceHistory>> => {
  try {
    const { data, error } = await supabase
      .from('maintenance_history')
      .insert(maintenanceData as never)
      .select()
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as MaintenanceHistory, error: null };
  } catch (error) {
    return { data: null, error: { message: "Erreur lors de l'ajout de la maintenance" } };
  }
};

/**
 * Schedule a maintenance
 */
export const scheduleMaintenance = async (
  scheduleData: CreateScheduleData
): Promise<ServiceResult<MaintenanceSchedule>> => {
  try {
    const insertData = {
      ...scheduleData,
      status: 'pending',
      notification_advance_days: scheduleData.notification_advance_days ?? 7,
      notification_advance_km: scheduleData.notification_advance_km ?? 500,
    };

    const { data, error } = await supabase
      .from('maintenance_schedule')
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: data as MaintenanceSchedule, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la planification' } };
  }
};

/**
 * Mark a scheduled maintenance as completed
 */
export const completeMaintenance = async (
  scheduleId: string,
  completionData?: Partial<CreateMaintenanceData>
): Promise<ServiceResult<MaintenanceSchedule>> => {
  try {
    // Update the schedule status
    const { data: schedule, error: scheduleError } = await supabase
      .from('maintenance_schedule')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      } as never)
      .eq('id', scheduleId)
      .select()
      .single();

    if (scheduleError) {
      return { data: null, error: { message: scheduleError.message, code: scheduleError.code } };
    }

    // Optionally create a history record
    if (completionData) {
      const historyData: CreateMaintenanceData = {
        vehicle_id: (schedule as MaintenanceSchedule).vehicle_id,
        category: (schedule as MaintenanceSchedule).category,
        date: new Date().toISOString().split('T')[0],
        ...completionData,
      };

      await supabase.from('maintenance_history').insert(historyData as never);
    }

    return { data: schedule as MaintenanceSchedule, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la completion' } };
  }
};

/**
 * Delete a scheduled maintenance
 */
export const deleteSchedule = async (scheduleId: string): Promise<ServiceResult<boolean>> => {
  try {
    const { error } = await supabase.from('maintenance_schedule').delete().eq('id', scheduleId);

    if (error) {
      return { data: null, error: { message: error.message, code: error.code } };
    }

    return { data: true, error: null };
  } catch (error) {
    return { data: null, error: { message: 'Erreur lors de la suppression' } };
  }
};
