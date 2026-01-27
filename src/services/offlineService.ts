/**
 * Offline Service - Wrappers for services with offline support
 * Handles caching, queueing mutations, and returning cached data when offline
 */

import {
  OFFLINE_CACHE_KEYS,
  OfflineResult,
  EntityType,
  OperationType,
  generateTempId,
  isTempId,
  QueuedOperation,
} from '@/core/types/offline';
import type {
  Vehicle,
  MaintenanceHistory,
  MaintenanceSchedule,
  Expense,
  UserSettings,
} from '@/core/types/database';
import { setOfflineCache, getOfflineCached, updateOfflineCache } from '@/core/utils/cache';
import { isOnline } from './networkService';

// Import original services
import * as vehicleService from './vehicleService';
import * as maintenanceService from './maintenanceService';
import * as expenseService from './expenseService';
import * as settingsService from './settingsService';

// Type for queue function passed from context
type AddToQueueFn = (
  entityType: EntityType,
  operationType: OperationType,
  entityId: string,
  data: Record<string, unknown>
) => Promise<QueuedOperation>;

// ============================================================
// VEHICLES
// ============================================================

export const vehicles = {
  /**
   * Get all vehicles for current user
   */
  async getAll(): Promise<OfflineResult<Vehicle[]>> {
    if (isOnline()) {
      const result = await vehicleService.getVehicles();
      if (result.data) {
        // Cache for offline use
        await setOfflineCache(OFFLINE_CACHE_KEYS.VEHICLES, result.data);
      }
      return {
        data: result.data,
        error: result.error,
        fromCache: false,
      };
    }

    // Offline: return from cache
    const cached = await getOfflineCached<Vehicle[]>(OFFLINE_CACHE_KEYS.VEHICLES);
    return {
      data: cached.data,
      error: cached.data ? null : { message: 'Aucune donnee en cache' },
      fromCache: true,
      isStale: cached.isStale,
    };
  },

  /**
   * Get primary vehicle for current user
   */
  async getPrimary(): Promise<OfflineResult<Vehicle>> {
    // Always try online first, fall back to cache on error
    try {
      const result = await vehicleService.getPrimaryVehicle();

      if (result.data) {
        // Also update the vehicles cache for offline use
        const allVehicles = await vehicleService.getVehicles();
        if (allVehicles.data) {
          await setOfflineCache(OFFLINE_CACHE_KEYS.VEHICLES, allVehicles.data);
        }
        return {
          data: result.data,
          error: null,
          fromCache: false,
        };
      }

      // No vehicle found online (but no error) - this is a real "no vehicle" case
      if (!result.error) {
        return {
          data: null,
          error: null,
          fromCache: false,
        };
      }

      // There was an error (auth not ready, network issue, etc.) - try cache
      const cached = await getOfflineCached<Vehicle[]>(OFFLINE_CACHE_KEYS.VEHICLES);
      const primary = cached.data?.find((v) => v.is_primary) || cached.data?.[0] || null;

      // If we have cached data, return it even on auth errors
      if (primary) {
        return {
          data: primary,
          error: null,
          fromCache: true,
          isStale: cached.isStale,
        };
      }

      return {
        data: null,
        error: result.error,
        fromCache: false,
      };
    } catch (error) {
      // Network or other error - try cache
      console.log('[OfflineService] getPrimary error, trying cache:', error);
      const cached = await getOfflineCached<Vehicle[]>(OFFLINE_CACHE_KEYS.VEHICLES);
      const primary = cached.data?.find((v) => v.is_primary) || cached.data?.[0] || null;
      return {
        data: primary,
        error: primary ? null : { message: 'Erreur reseau' },
        fromCache: true,
        isStale: cached.isStale,
      };
    }
  },

  /**
   * Get single vehicle by ID
   */
  async getById(vehicleId: string): Promise<OfflineResult<Vehicle>> {
    if (isOnline() && !isTempId(vehicleId)) {
      const result = await vehicleService.getVehicle(vehicleId);
      return {
        data: result.data,
        error: result.error,
        fromCache: false,
      };
    }

    // Offline or temp ID: find in cached vehicles
    const cached = await getOfflineCached<Vehicle[]>(OFFLINE_CACHE_KEYS.VEHICLES);
    const vehicle = cached.data?.find((v) => v.id === vehicleId) || null;
    return {
      data: vehicle,
      error: vehicle ? null : { message: 'Vehicule non trouve en cache' },
      fromCache: true,
      isStale: cached.isStale,
    };
  },

  /**
   * Create new vehicle
   */
  async create(
    data: vehicleService.CreateVehicleData,
    addToQueue: AddToQueueFn
  ): Promise<OfflineResult<Vehicle>> {
    if (isOnline()) {
      const result = await vehicleService.createVehicle(data);
      if (result.data) {
        // Update cache
        await updateOfflineCache<Vehicle[]>(
          OFFLINE_CACHE_KEYS.VEHICLES,
          (current) => [...(current || []), result.data!]
        );
      }
      return {
        data: result.data,
        error: result.error,
        fromCache: false,
      };
    }

    // Offline: create with temp ID
    const tempId = generateTempId();
    const tempVehicle: Vehicle = {
      id: tempId,
      user_id: '', // Will be set on sync
      brand: data.brand,
      model: data.model,
      year: data.year || null,
      registration_plate: data.registration_plate || null,
      vin: data.vin || null,
      purchase_date: data.purchase_date || null,
      purchase_price: data.purchase_price || null,
      purchase_mileage: data.purchase_mileage || null,
      current_mileage: data.current_mileage || null,
      fuel_type: data.fuel_type || null,
      engine: data.engine || null,
      transmission: data.transmission || null,
      body_type: data.body_type || null,
      color: data.color || null,
      seats: data.seats || null,
      photo_url: data.photo_url || null,
      is_primary: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Update cache
    await updateOfflineCache<Vehicle[]>(
      OFFLINE_CACHE_KEYS.VEHICLES,
      (current) => [...(current || []), tempVehicle]
    );

    // Queue for sync
    await addToQueue('vehicle', 'create', tempId, data as unknown as Record<string, unknown>);

    return {
      data: tempVehicle,
      error: null,
      fromCache: true,
    };
  },

  /**
   * Update vehicle
   */
  async update(
    vehicleId: string,
    updates: vehicleService.UpdateVehicleData,
    addToQueue: AddToQueueFn
  ): Promise<OfflineResult<Vehicle>> {
    if (isOnline() && !isTempId(vehicleId)) {
      const result = await vehicleService.updateVehicle(vehicleId, updates);
      if (result.data) {
        await updateOfflineCache<Vehicle[]>(
          OFFLINE_CACHE_KEYS.VEHICLES,
          (current) =>
            current?.map((v) => (v.id === vehicleId ? result.data! : v)) || []
        );
      }
      return {
        data: result.data,
        error: result.error,
        fromCache: false,
      };
    }

    // Offline: update in cache
    let updatedVehicle: Vehicle | null = null;
    await updateOfflineCache<Vehicle[]>(
      OFFLINE_CACHE_KEYS.VEHICLES,
      (current) =>
        current?.map((v) => {
          if (v.id === vehicleId) {
            updatedVehicle = { ...v, ...updates, updated_at: new Date().toISOString() };
            return updatedVehicle;
          }
          return v;
        }) || []
    );

    if (updatedVehicle && !isTempId(vehicleId)) {
      await addToQueue('vehicle', 'update', vehicleId, updates as Record<string, unknown>);
    }

    return {
      data: updatedVehicle,
      error: updatedVehicle ? null : { message: 'Vehicule non trouve' },
      fromCache: true,
    };
  },

  /**
   * Delete vehicle
   */
  async delete(vehicleId: string, addToQueue: AddToQueueFn): Promise<OfflineResult<boolean>> {
    if (isOnline() && !isTempId(vehicleId)) {
      const result = await vehicleService.deleteVehicle(vehicleId);
      if (result.data) {
        await updateOfflineCache<Vehicle[]>(
          OFFLINE_CACHE_KEYS.VEHICLES,
          (current) => current?.filter((v) => v.id !== vehicleId) || []
        );
      }
      return {
        data: result.data,
        error: result.error,
        fromCache: false,
      };
    }

    // Offline: remove from cache
    await updateOfflineCache<Vehicle[]>(
      OFFLINE_CACHE_KEYS.VEHICLES,
      (current) => current?.filter((v) => v.id !== vehicleId) || []
    );

    if (!isTempId(vehicleId)) {
      await addToQueue('vehicle', 'delete', vehicleId, {});
    }

    return {
      data: true,
      error: null,
      fromCache: true,
    };
  },
};

// ============================================================
// MAINTENANCE
// ============================================================

export const maintenance = {
  /**
   * Get maintenance history for a vehicle
   */
  async getHistory(vehicleId: string): Promise<OfflineResult<MaintenanceHistory[]>> {
    if (isOnline() && !isTempId(vehicleId)) {
      const result = await maintenanceService.getMaintenanceHistory(vehicleId);
      if (result.data) {
        await setOfflineCache(
          OFFLINE_CACHE_KEYS.MAINTENANCE_HISTORY(vehicleId),
          result.data
        );
      }
      return {
        data: result.data,
        error: result.error,
        fromCache: false,
      };
    }

    const cached = await getOfflineCached<MaintenanceHistory[]>(
      OFFLINE_CACHE_KEYS.MAINTENANCE_HISTORY(vehicleId)
    );
    return {
      data: cached.data,
      error: cached.data ? null : { message: 'Aucune donnee en cache' },
      fromCache: true,
      isStale: cached.isStale,
    };
  },

  /**
   * Get upcoming maintenances with urgency calculation
   */
  async getUpcoming(
    vehicleId: string,
    currentMileage?: number
  ): Promise<OfflineResult<maintenanceService.UpcomingMaintenance[]>> {
    if (isOnline() && !isTempId(vehicleId)) {
      const result = await maintenanceService.getUpcomingMaintenances(vehicleId, currentMileage);
      // Cache the schedule for offline use
      const scheduleResult = await maintenanceService.getMaintenanceSchedule(vehicleId);
      if (scheduleResult.data) {
        await setOfflineCache(
          OFFLINE_CACHE_KEYS.MAINTENANCE_SCHEDULE(vehicleId),
          scheduleResult.data
        );
      }
      return {
        data: result.data,
        error: result.error,
        fromCache: false,
      };
    }

    // Offline: calculate from cached schedule
    const cached = await getOfflineCached<MaintenanceSchedule[]>(
      OFFLINE_CACHE_KEYS.MAINTENANCE_SCHEDULE(vehicleId)
    );

    if (!cached.data) {
      return {
        data: [],
        error: null,
        fromCache: true,
        isStale: false,
      };
    }

    // Calculate urgency locally
    const now = new Date();
    const categoryLabels: Record<string, string> = {
      oil_change: 'Vidange',
      brakes: 'Freins',
      filters: 'Filtres',
      tires: 'Pneus',
      mechanical: 'Mecanique',
      revision: 'Revision',
      ac: 'Climatisation',
      distribution: 'Distribution',
      suspension: 'Amortisseur',
      fluids: 'Liquides',
      gearbox_oil: 'Vidange boite auto',
      custom: 'Autre',
    };

    const upcoming: maintenanceService.UpcomingMaintenance[] = cached.data
      .filter((item) => item.status === 'pending' || item.status === 'overdue')
      .slice(0, 5)
      .map((item) => {
        let urgency: 'overdue' | 'soon' | 'upcoming' = 'upcoming';

        if (item.due_date) {
          const dueDate = new Date(item.due_date);
          const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntil < 0) urgency = 'overdue';
          else if (daysUntil <= 14) urgency = 'soon';
        }

        if (item.due_mileage && currentMileage) {
          const kmUntil = item.due_mileage - currentMileage;
          if (kmUntil < 0) urgency = 'overdue';
          else if (kmUntil <= 500 && urgency !== 'overdue') urgency = 'soon';
        }

        return {
          id: item.id,
          title: item.description || categoryLabels[item.category] || item.category,
          category: item.category,
          dueDate: item.due_date || undefined,
          dueMileage: item.due_mileage || undefined,
          urgency,
        };
      });

    return {
      data: upcoming,
      error: null,
      fromCache: true,
      isStale: cached.isStale,
    };
  },

  /**
   * Get maintenance schedule for a vehicle
   */
  async getSchedule(vehicleId: string): Promise<OfflineResult<MaintenanceSchedule[]>> {
    if (isOnline() && !isTempId(vehicleId)) {
      const result = await maintenanceService.getMaintenanceSchedule(vehicleId);
      if (result.data) {
        await setOfflineCache(
          OFFLINE_CACHE_KEYS.MAINTENANCE_SCHEDULE(vehicleId),
          result.data
        );
      }
      return {
        data: result.data,
        error: result.error,
        fromCache: false,
      };
    }

    const cached = await getOfflineCached<MaintenanceSchedule[]>(
      OFFLINE_CACHE_KEYS.MAINTENANCE_SCHEDULE(vehicleId)
    );
    return {
      data: cached.data,
      error: cached.data ? null : { message: 'Aucune donnee en cache' },
      fromCache: true,
      isStale: cached.isStale,
    };
  },

  /**
   * Add maintenance record
   */
  async addRecord(
    data: maintenanceService.CreateMaintenanceData,
    addToQueue: AddToQueueFn
  ): Promise<OfflineResult<MaintenanceHistory>> {
    if (isOnline() && !isTempId(data.vehicle_id)) {
      const result = await maintenanceService.addMaintenance(data);
      if (result.data) {
        await updateOfflineCache<MaintenanceHistory[]>(
          OFFLINE_CACHE_KEYS.MAINTENANCE_HISTORY(data.vehicle_id),
          (current) => [result.data!, ...(current || [])]
        );
      }
      return {
        data: result.data,
        error: result.error,
        fromCache: false,
      };
    }

    // Offline: create temp record
    const tempId = generateTempId();
    const now = new Date().toISOString();
    const tempRecord: MaintenanceHistory = {
      id: tempId,
      vehicle_id: data.vehicle_id,
      category: data.category,
      subcategory: data.subcategory || null,
      date: data.date,
      mileage: data.mileage || null,
      cost: data.cost || null,
      description: data.description || null,
      location: data.location || null,
      invoice_id: data.invoice_id || null,
      notes: data.notes || null,
      created_at: now,
      updated_at: now,
    };

    await updateOfflineCache<MaintenanceHistory[]>(
      OFFLINE_CACHE_KEYS.MAINTENANCE_HISTORY(data.vehicle_id),
      (current) => [tempRecord, ...(current || [])]
    );

    await addToQueue('maintenance', 'create', tempId, data as unknown as Record<string, unknown>);

    return {
      data: tempRecord,
      error: null,
      fromCache: true,
    };
  },

  /**
   * Schedule maintenance
   */
  async schedule(
    data: maintenanceService.CreateScheduleData,
    addToQueue: AddToQueueFn
  ): Promise<OfflineResult<MaintenanceSchedule>> {
    if (isOnline() && !isTempId(data.vehicle_id)) {
      const result = await maintenanceService.scheduleMaintenance(data);
      if (result.data) {
        await updateOfflineCache<MaintenanceSchedule[]>(
          OFFLINE_CACHE_KEYS.MAINTENANCE_SCHEDULE(data.vehicle_id),
          (current) => [...(current || []), result.data!]
        );
      }
      return {
        data: result.data,
        error: result.error,
        fromCache: false,
      };
    }

    // Offline: create temp schedule
    const tempId = generateTempId();
    const now = new Date().toISOString();
    const tempSchedule: MaintenanceSchedule = {
      id: tempId,
      vehicle_id: data.vehicle_id,
      category: data.category,
      subcategory: data.subcategory || null,
      description: data.description || null,
      reminder_type: data.reminder_type,
      due_date: data.due_date || null,
      due_mileage: data.due_mileage || null,
      notification_advance_days: data.notification_advance_days || 7,
      notification_advance_km: data.notification_advance_km || 500,
      recurrence_type: data.recurrence_type || 'none',
      recurrence_value: data.recurrence_value || null,
      estimated_cost: data.estimated_cost || null,
      location: data.location || null,
      notes: data.notes || null,
      status: 'pending',
      completed_at: null,
      created_at: now,
      updated_at: now,
    };

    await updateOfflineCache<MaintenanceSchedule[]>(
      OFFLINE_CACHE_KEYS.MAINTENANCE_SCHEDULE(data.vehicle_id),
      (current) => [...(current || []), tempSchedule]
    );

    await addToQueue('maintenance', 'create', tempId, {
      ...data,
      _isSchedule: true,
    } as Record<string, unknown>);

    return {
      data: tempSchedule,
      error: null,
      fromCache: true,
    };
  },
};

// ============================================================
// EXPENSES
// ============================================================

export const expenses = {
  /**
   * Get expenses for a vehicle
   */
  async getAll(
    vehicleId: string,
    options?: Parameters<typeof expenseService.getExpenses>[1]
  ): Promise<OfflineResult<Expense[]>> {
    if (isOnline() && !isTempId(vehicleId)) {
      const result = await expenseService.getExpenses(vehicleId, options);
      if (result.data) {
        await setOfflineCache(OFFLINE_CACHE_KEYS.EXPENSES(vehicleId), result.data);
      }
      return {
        data: result.data,
        error: result.error,
        fromCache: false,
      };
    }

    const cached = await getOfflineCached<Expense[]>(
      OFFLINE_CACHE_KEYS.EXPENSES(vehicleId)
    );

    // Apply filters on cached data if needed
    let filteredData = cached.data;
    if (filteredData && options) {
      if (options.type) {
        filteredData = filteredData.filter((e) => e.type === options.type);
      }
      if (options.startDate) {
        filteredData = filteredData.filter((e) => e.date >= options.startDate!);
      }
      if (options.endDate) {
        filteredData = filteredData.filter((e) => e.date <= options.endDate!);
      }
      if (options.limit) {
        filteredData = filteredData.slice(0, options.limit);
      }
    }

    return {
      data: filteredData,
      error: filteredData ? null : { message: 'Aucune donnee en cache' },
      fromCache: true,
      isStale: cached.isStale,
    };
  },

  /**
   * Add expense
   */
  async add(
    data: expenseService.CreateExpenseData,
    addToQueue: AddToQueueFn
  ): Promise<OfflineResult<Expense>> {
    if (isOnline() && !isTempId(data.vehicle_id)) {
      const result = await expenseService.addExpense(data);
      if (result.data) {
        await updateOfflineCache<Expense[]>(
          OFFLINE_CACHE_KEYS.EXPENSES(data.vehicle_id),
          (current) => [result.data!, ...(current || [])]
        );
      }
      return {
        data: result.data,
        error: result.error,
        fromCache: false,
      };
    }

    // Offline: create temp expense
    const tempId = generateTempId();
    const now = new Date().toISOString();
    const tempExpense: Expense = {
      id: tempId,
      vehicle_id: data.vehicle_id,
      type: data.type,
      date: data.date,
      amount: data.amount,
      mileage: data.mileage || null,
      description: data.description || null,
      document_id: data.document_id || null,
      created_at: now,
      updated_at: now,
    };

    await updateOfflineCache<Expense[]>(
      OFFLINE_CACHE_KEYS.EXPENSES(data.vehicle_id),
      (current) => [tempExpense, ...(current || [])]
    );

    await addToQueue('expense', 'create', tempId, data as unknown as Record<string, unknown>);

    return {
      data: tempExpense,
      error: null,
      fromCache: true,
    };
  },

  /**
   * Update expense
   */
  async update(
    expenseId: string,
    vehicleId: string,
    updates: Partial<expenseService.CreateExpenseData>,
    addToQueue: AddToQueueFn
  ): Promise<OfflineResult<Expense>> {
    if (isOnline() && !isTempId(expenseId)) {
      const result = await expenseService.updateExpense(expenseId, updates);
      if (result.data) {
        await updateOfflineCache<Expense[]>(
          OFFLINE_CACHE_KEYS.EXPENSES(vehicleId),
          (current) =>
            current?.map((e) => (e.id === expenseId ? result.data! : e)) || []
        );
      }
      return {
        data: result.data,
        error: result.error,
        fromCache: false,
      };
    }

    // Offline: update in cache
    let updatedExpense: Expense | null = null;
    await updateOfflineCache<Expense[]>(
      OFFLINE_CACHE_KEYS.EXPENSES(vehicleId),
      (current) =>
        current?.map((e) => {
          if (e.id === expenseId) {
            updatedExpense = { ...e, ...updates };
            return updatedExpense;
          }
          return e;
        }) || []
    );

    if (updatedExpense && !isTempId(expenseId)) {
      await addToQueue('expense', 'update', expenseId, {
        ...updates,
        vehicleId,
      } as Record<string, unknown>);
    }

    return {
      data: updatedExpense,
      error: updatedExpense ? null : { message: 'Depense non trouvee' },
      fromCache: true,
    };
  },

  /**
   * Delete expense
   */
  async delete(
    expenseId: string,
    vehicleId: string,
    addToQueue: AddToQueueFn
  ): Promise<OfflineResult<boolean>> {
    if (isOnline() && !isTempId(expenseId)) {
      const result = await expenseService.deleteExpense(expenseId);
      if (result.data) {
        await updateOfflineCache<Expense[]>(
          OFFLINE_CACHE_KEYS.EXPENSES(vehicleId),
          (current) => current?.filter((e) => e.id !== expenseId) || []
        );
      }
      return {
        data: result.data,
        error: result.error,
        fromCache: false,
      };
    }

    // Offline: remove from cache
    await updateOfflineCache<Expense[]>(
      OFFLINE_CACHE_KEYS.EXPENSES(vehicleId),
      (current) => current?.filter((e) => e.id !== expenseId) || []
    );

    if (!isTempId(expenseId)) {
      await addToQueue('expense', 'delete', expenseId, { vehicleId });
    }

    return {
      data: true,
      error: null,
      fromCache: true,
    };
  },
};

// ============================================================
// SETTINGS
// ============================================================

export const settings = {
  /**
   * Get user settings
   */
  async get(): Promise<OfflineResult<UserSettings>> {
    if (isOnline()) {
      const result = await settingsService.getUserSettings();
      if (result.data) {
        await setOfflineCache(OFFLINE_CACHE_KEYS.SETTINGS, result.data);
      }
      return {
        data: result.data,
        error: result.error,
        fromCache: false,
      };
    }

    const cached = await getOfflineCached<UserSettings>(OFFLINE_CACHE_KEYS.SETTINGS);
    return {
      data: cached.data,
      error: cached.data ? null : { message: 'Aucune donnee en cache' },
      fromCache: true,
      isStale: cached.isStale,
    };
  },

  /**
   * Update user settings
   */
  async update(
    updates: Parameters<typeof settingsService.updateUserSettings>[0],
    addToQueue: AddToQueueFn
  ): Promise<OfflineResult<UserSettings>> {
    if (isOnline()) {
      const result = await settingsService.updateUserSettings(updates);
      if (result.data) {
        await setOfflineCache(OFFLINE_CACHE_KEYS.SETTINGS, result.data);
      }
      return {
        data: result.data,
        error: result.error,
        fromCache: false,
      };
    }

    // Offline: update in cache
    let updatedSettings: UserSettings | null = null;
    const cached = await getOfflineCached<UserSettings>(OFFLINE_CACHE_KEYS.SETTINGS);
    if (cached.data) {
      updatedSettings = { ...cached.data, ...updates };
      await setOfflineCache(OFFLINE_CACHE_KEYS.SETTINGS, updatedSettings);
      await addToQueue('settings', 'update', cached.data.id, updates as Record<string, unknown>);
    }

    return {
      data: updatedSettings,
      error: updatedSettings ? null : { message: 'Parametres non trouves en cache' },
      fromCache: true,
    };
  },
};
