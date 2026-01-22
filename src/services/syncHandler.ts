/**
 * Sync Handler - Process queued operations when back online
 */

import {
  QueuedOperation,
  isTempId,
  OFFLINE_CACHE_KEYS,
} from '@/core/types/offline';
import { dequeue, incrementRetry, updateEntityId } from '@/core/utils/syncQueue';
import { updateOfflineCache } from '@/core/utils/cache';
import type { Vehicle, Expense } from '@/core/types/database';

// Import original services
import * as vehicleService from './vehicleService';
import * as maintenanceService from './maintenanceService';
import * as expenseService from './expenseService';
import * as settingsService from './settingsService';

interface SyncResult {
  successCount: number;
  failedCount: number;
}

/**
 * Process a single operation
 * Returns the real ID if a temp entity was created
 */
async function processOperation(operation: QueuedOperation): Promise<{ success: boolean; realId?: string }> {
  const { entityType, operationType, entityId, data } = operation;

  try {
    switch (entityType) {
      case 'vehicle':
        return await processVehicleOperation(operationType, entityId, data);

      case 'maintenance':
        return await processMaintenanceOperation(operationType, entityId, data);

      case 'expense':
        return await processExpenseOperation(operationType, entityId, data);

      case 'settings':
        return await processSettingsOperation(operationType, data);

      default:
        console.warn(`[SyncHandler] Unknown entity type: ${entityType}`);
        return { success: false };
    }
  } catch (error) {
    console.error(`[SyncHandler] Error processing operation:`, error);
    return { success: false };
  }
}

/**
 * Process vehicle operations
 */
async function processVehicleOperation(
  operationType: string,
  entityId: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; realId?: string }> {
  switch (operationType) {
    case 'create': {
      const result = await vehicleService.createVehicle(data as unknown as vehicleService.CreateVehicleData);
      if (result.data) {
        // Update cache with real ID
        await updateOfflineCache<Vehicle[]>(
          OFFLINE_CACHE_KEYS.VEHICLES,
          (current) =>
            current?.map((v) => (v.id === entityId ? { ...v, ...result.data!, id: result.data!.id } : v)) || []
        );
        // Update any queued operations referencing this temp ID
        await updateEntityId(entityId, result.data.id, 'vehicle');
        return { success: true, realId: result.data.id };
      }
      return { success: false };
    }

    case 'update': {
      if (isTempId(entityId)) {
        // This shouldn't happen - updates on temp IDs should be merged with create
        console.warn(`[SyncHandler] Skipping update on temp vehicle ID: ${entityId}`);
        return { success: true };
      }
      const result = await vehicleService.updateVehicle(
        entityId,
        data as vehicleService.UpdateVehicleData
      );
      return { success: !!result.data };
    }

    case 'delete': {
      if (isTempId(entityId)) {
        // Temp entity that was never created - just remove from cache
        return { success: true };
      }
      const result = await vehicleService.deleteVehicle(entityId);
      return { success: !!result.data };
    }

    default:
      return { success: false };
  }
}

/**
 * Process maintenance operations
 */
async function processMaintenanceOperation(
  operationType: string,
  entityId: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; realId?: string }> {
  switch (operationType) {
    case 'create': {
      // Check if this is a schedule or history record
      const isSchedule = data._isSchedule === true;

      if (isSchedule) {
        // Remove internal flag
        const { _isSchedule, ...scheduleData } = data;
        const result = await maintenanceService.scheduleMaintenance(
          scheduleData as unknown as maintenanceService.CreateScheduleData
        );
        if (result.data) {
          await updateEntityId(entityId, result.data.id, 'maintenance');
          return { success: true, realId: result.data.id };
        }
      } else {
        const result = await maintenanceService.addMaintenance(
          data as unknown as maintenanceService.CreateMaintenanceData
        );
        if (result.data) {
          await updateEntityId(entityId, result.data.id, 'maintenance');
          return { success: true, realId: result.data.id };
        }
      }
      return { success: false };
    }

    case 'delete': {
      if (isTempId(entityId)) {
        return { success: true };
      }
      const result = await maintenanceService.deleteSchedule(entityId);
      return { success: !!result.data };
    }

    default:
      return { success: false };
  }
}

/**
 * Process expense operations
 */
async function processExpenseOperation(
  operationType: string,
  entityId: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; realId?: string }> {
  switch (operationType) {
    case 'create': {
      const result = await expenseService.addExpense(data as unknown as expenseService.CreateExpenseData);
      if (result.data) {
        const vehicleId = data.vehicle_id as string;
        // Update cache with real ID
        await updateOfflineCache<Expense[]>(
          OFFLINE_CACHE_KEYS.EXPENSES(vehicleId),
          (current) =>
            current?.map((e) => (e.id === entityId ? { ...e, ...result.data!, id: result.data!.id } : e)) || []
        );
        await updateEntityId(entityId, result.data.id, 'expense');
        return { success: true, realId: result.data.id };
      }
      return { success: false };
    }

    case 'update': {
      if (isTempId(entityId)) {
        console.warn(`[SyncHandler] Skipping update on temp expense ID: ${entityId}`);
        return { success: true };
      }
      const { vehicleId, ...updates } = data;
      const result = await expenseService.updateExpense(
        entityId,
        updates as Partial<expenseService.CreateExpenseData>
      );
      return { success: !!result.data };
    }

    case 'delete': {
      if (isTempId(entityId)) {
        return { success: true };
      }
      const result = await expenseService.deleteExpense(entityId);
      return { success: !!result.data };
    }

    default:
      return { success: false };
  }
}

/**
 * Process settings operations
 */
async function processSettingsOperation(
  operationType: string,
  data: Record<string, unknown>
): Promise<{ success: boolean }> {
  if (operationType === 'update') {
    const result = await settingsService.updateUserSettings(
      data as Parameters<typeof settingsService.updateUserSettings>[0]
    );
    return { success: !!result.data };
  }
  return { success: false };
}

/**
 * Process all queued operations
 * Called by OfflineContext when coming back online
 */
export async function processBatch(operations: QueuedOperation[]): Promise<SyncResult> {
  let successCount = 0;
  let failedCount = 0;

  // Sort operations: creates first (by timestamp), then updates, then deletes
  const sorted = [...operations].sort((a, b) => {
    const orderMap = { create: 0, update: 1, delete: 2 };
    const orderDiff = orderMap[a.operationType] - orderMap[b.operationType];
    if (orderDiff !== 0) return orderDiff;
    return a.timestamp - b.timestamp;
  });

  for (const operation of sorted) {
    const result = await processOperation(operation);

    if (result.success) {
      await dequeue(operation.id);
      successCount++;
    } else {
      const shouldRetry = await incrementRetry(operation.id);
      if (!shouldRetry) {
        // Max retries exceeded, operation removed from queue
        failedCount++;
      }
    }
  }

  return { successCount, failedCount };
}
