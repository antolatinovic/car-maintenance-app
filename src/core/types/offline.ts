/**
 * Offline Mode Types
 * Types for offline functionality and sync queue
 */

/**
 * Entity types that can be synced offline
 */
export type EntityType = 'vehicle' | 'maintenance' | 'expense' | 'settings';

/**
 * Operation types for queued actions
 */
export type OperationType = 'create' | 'update' | 'delete';

/**
 * Queued operation for offline sync
 */
export interface QueuedOperation {
  id: string;
  entityType: EntityType;
  operationType: OperationType;
  entityId: string;
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

/**
 * Offline state for context
 */
export interface OfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperationsCount: number;
  syncError: string | null;
  lastSyncTime: number | null;
}

/**
 * Result from offline service operations
 */
export interface OfflineResult<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
  fromCache: boolean;
  isStale?: boolean;
}

/**
 * Cache keys for offline storage
 */
export const OFFLINE_CACHE_KEYS = {
  VEHICLES: 'offline_vehicles',
  MAINTENANCE_HISTORY: (vehicleId: string) => `offline_maintenance_history_${vehicleId}`,
  MAINTENANCE_SCHEDULE: (vehicleId: string) => `offline_maintenance_schedule_${vehicleId}`,
  EXPENSES: (vehicleId: string) => `offline_expenses_${vehicleId}`,
  SETTINGS: 'offline_settings',
  SYNC_QUEUE: 'offline_sync_queue',
} as const;

/**
 * Offline cache duration (30 days in ms)
 */
export const OFFLINE_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

/**
 * Maximum retry count for failed operations
 */
export const MAX_RETRY_COUNT = 3;

/**
 * Temporary ID prefix for offline-created entities
 */
export const TEMP_ID_PREFIX = 'temp_';

/**
 * Check if an ID is a temporary offline ID
 */
export const isTempId = (id: string): boolean => id.startsWith(TEMP_ID_PREFIX);

/**
 * Generate a temporary ID for offline-created entities
 */
export const generateTempId = (): string => `${TEMP_ID_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
