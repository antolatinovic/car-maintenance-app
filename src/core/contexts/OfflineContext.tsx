/**
 * Offline Context
 * Provides offline state and sync functionality to the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  OfflineState,
  EntityType,
  OperationType,
  QueuedOperation,
} from '@/core/types/offline';
import {
  initNetworkMonitoring,
  subscribeToNetwork,
  stopNetworkMonitoring,
  isOnline as checkIsOnline,
} from '@/services/networkService';
import {
  enqueue,
  getPendingCount,
  getQueue,
} from '@/core/utils/syncQueue';

interface OfflineContextValue extends OfflineState {
  addToQueue: (
    entityType: EntityType,
    operationType: OperationType,
    entityId: string,
    data: Record<string, unknown>
  ) => Promise<QueuedOperation>;
  triggerSync: () => Promise<void>;
  // Debug: force offline mode for testing
  debugForceOffline: boolean;
  setDebugForceOffline: (force: boolean) => void;
}

const defaultState: OfflineState = {
  isOnline: true,
  isSyncing: false,
  pendingOperationsCount: 0,
  syncError: null,
  lastSyncTime: null,
};

const OfflineContext = createContext<OfflineContextValue | null>(null);

interface OfflineProviderProps {
  children: React.ReactNode;
  onSync: (operations: QueuedOperation[]) => Promise<{ successCount: number; failedCount: number }>;
}

export function OfflineProvider({ children, onSync }: OfflineProviderProps) {
  const [state, setState] = useState<OfflineState>(defaultState);
  const [debugForceOffline, setDebugForceOffline] = useState(false);
  const syncInProgressRef = useRef(false);

  // Initialize network monitoring
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      await initNetworkMonitoring();

      // Subscribe to network changes
      unsubscribe = subscribeToNetwork((isConnected) => {
        // Only update if not in debug force offline mode
        setState((prev) => ({
          ...prev,
          isOnline: debugForceOffline ? false : isConnected
        }));
      });

      // Load initial pending count
      const count = await getPendingCount();
      setState((prev) => ({ ...prev, pendingOperationsCount: count }));
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
      stopNetworkMonitoring();
    };
  }, []);

  // Update isOnline when debugForceOffline changes
  useEffect(() => {
    if (debugForceOffline) {
      setState((prev) => ({ ...prev, isOnline: false }));
    } else {
      // Restore real network state
      setState((prev) => ({ ...prev, isOnline: checkIsOnline() }));
    }
  }, [debugForceOffline]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (state.isOnline && state.pendingOperationsCount > 0 && !state.isSyncing && !debugForceOffline) {
      triggerSync();
    }
  }, [state.isOnline, state.pendingOperationsCount, debugForceOffline]);

  // Add operation to sync queue
  const addToQueue = useCallback(
    async (
      entityType: EntityType,
      operationType: OperationType,
      entityId: string,
      data: Record<string, unknown>
    ): Promise<QueuedOperation> => {
      const operation = await enqueue(entityType, operationType, entityId, data);
      const count = await getPendingCount();
      setState((prev) => ({ ...prev, pendingOperationsCount: count }));
      return operation;
    },
    []
  );

  // Trigger sync process
  const triggerSync = useCallback(async () => {
    // Prevent concurrent syncs
    if (syncInProgressRef.current || !checkIsOnline()) {
      return;
    }

    syncInProgressRef.current = true;
    setState((prev) => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      const operations = await getQueue();

      if (operations.length === 0) {
        setState((prev) => ({
          ...prev,
          isSyncing: false,
          pendingOperationsCount: 0,
        }));
        syncInProgressRef.current = false;
        return;
      }

      const result = await onSync(operations);

      const remainingCount = await getPendingCount();

      setState((prev) => ({
        ...prev,
        isSyncing: false,
        pendingOperationsCount: remainingCount,
        lastSyncTime: Date.now(),
        syncError: result.failedCount > 0
          ? `${result.failedCount} operation(s) ont echoue`
          : null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        syncError: 'Erreur lors de la synchronisation',
      }));
    } finally {
      syncInProgressRef.current = false;
    }
  }, [onSync]);

  const value: OfflineContextValue = {
    ...state,
    addToQueue,
    triggerSync,
    debugForceOffline,
    setDebugForceOffline,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOfflineContext(): OfflineContextValue {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOfflineContext must be used within an OfflineProvider');
  }
  return context;
}
