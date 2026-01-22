/**
 * Sync Queue Utility
 * Manages the queue of offline operations to be synced
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  QueuedOperation,
  EntityType,
  OperationType,
  OFFLINE_CACHE_KEYS,
  MAX_RETRY_COUNT,
} from '@/core/types/offline';

/**
 * Generate unique operation ID
 */
const generateOperationId = (): string => {
  return `op_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

/**
 * Get all queued operations
 */
export const getQueue = async (): Promise<QueuedOperation[]> => {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_CACHE_KEYS.SYNC_QUEUE);
    if (!raw) return [];
    return JSON.parse(raw) as QueuedOperation[];
  } catch (error) {
    console.error('[SyncQueue] Error reading queue:', error);
    return [];
  }
};

/**
 * Save queue to storage
 */
const saveQueue = async (queue: QueuedOperation[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(OFFLINE_CACHE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
  } catch (error) {
    console.error('[SyncQueue] Error saving queue:', error);
  }
};

/**
 * Add operation to the queue
 */
export const enqueue = async (
  entityType: EntityType,
  operationType: OperationType,
  entityId: string,
  data: Record<string, unknown>
): Promise<QueuedOperation> => {
  const queue = await getQueue();

  const operation: QueuedOperation = {
    id: generateOperationId(),
    entityType,
    operationType,
    entityId,
    data,
    timestamp: Date.now(),
    retryCount: 0,
  };

  // Check for existing operations on the same entity
  const existingIndex = queue.findIndex(
    (op) => op.entityType === entityType && op.entityId === entityId
  );

  if (existingIndex !== -1) {
    const existing = queue[existingIndex];

    // Merge logic based on operation types
    if (existing.operationType === 'create' && operationType === 'update') {
      // Merge update into create
      queue[existingIndex] = {
        ...existing,
        data: { ...existing.data, ...data },
        timestamp: Date.now(),
      };
    } else if (existing.operationType === 'create' && operationType === 'delete') {
      // Cancel the create entirely
      queue.splice(existingIndex, 1);
    } else if (existing.operationType === 'update' && operationType === 'update') {
      // Merge updates
      queue[existingIndex] = {
        ...existing,
        data: { ...existing.data, ...data },
        timestamp: Date.now(),
      };
    } else if (existing.operationType === 'update' && operationType === 'delete') {
      // Replace update with delete
      queue[existingIndex] = operation;
    } else {
      // Add as new operation
      queue.push(operation);
    }
  } else {
    queue.push(operation);
  }

  await saveQueue(queue);
  return operation;
};

/**
 * Remove operation from queue after successful sync
 */
export const dequeue = async (operationId: string): Promise<void> => {
  const queue = await getQueue();
  const filteredQueue = queue.filter((op) => op.id !== operationId);
  await saveQueue(filteredQueue);
};

/**
 * Increment retry count for failed operation
 * Returns false if max retries exceeded
 */
export const incrementRetry = async (operationId: string): Promise<boolean> => {
  const queue = await getQueue();
  const index = queue.findIndex((op) => op.id === operationId);

  if (index === -1) return false;

  queue[index].retryCount += 1;

  if (queue[index].retryCount >= MAX_RETRY_COUNT) {
    // Remove failed operation after max retries
    queue.splice(index, 1);
    await saveQueue(queue);
    return false;
  }

  await saveQueue(queue);
  return true;
};

/**
 * Get count of pending operations
 */
export const getPendingCount = async (): Promise<number> => {
  const queue = await getQueue();
  return queue.length;
};

/**
 * Clear all queued operations
 */
export const clearQueue = async (): Promise<void> => {
  await AsyncStorage.removeItem(OFFLINE_CACHE_KEYS.SYNC_QUEUE);
};

/**
 * Get operations for a specific entity type
 */
export const getQueueByEntityType = async (
  entityType: EntityType
): Promise<QueuedOperation[]> => {
  const queue = await getQueue();
  return queue.filter((op) => op.entityType === entityType);
};

/**
 * Update entity ID after server creates it (temp -> real ID)
 */
export const updateEntityId = async (
  oldId: string,
  newId: string,
  entityType: EntityType
): Promise<void> => {
  const queue = await getQueue();
  const updated = queue.map((op) => {
    if (op.entityType === entityType && op.entityId === oldId) {
      return { ...op, entityId: newId };
    }
    // Also update references in data (e.g., vehicle_id in maintenance)
    if (op.data.vehicle_id === oldId) {
      return { ...op, data: { ...op.data, vehicle_id: newId } };
    }
    return op;
  });
  await saveQueue(updated);
};
