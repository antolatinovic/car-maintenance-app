/**
 * Network Service - Network connectivity monitoring
 */

import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

type NetworkCallback = (isConnected: boolean) => void;

let currentNetworkState: NetInfoState | null = null;
let subscription: NetInfoSubscription | null = null;
const listeners: Set<NetworkCallback> = new Set();

/**
 * Initialize network monitoring
 * Should be called once at app startup
 */
export const initNetworkMonitoring = async (): Promise<void> => {
  // Get initial state
  currentNetworkState = await NetInfo.fetch();

  // Subscribe to network changes
  subscription = NetInfo.addEventListener((state) => {
    const wasOnline = currentNetworkState?.isConnected ?? false;
    const isNowOnline = state.isConnected ?? false;

    currentNetworkState = state;

    // Notify listeners only on state change
    if (wasOnline !== isNowOnline) {
      listeners.forEach((callback) => callback(isNowOnline));
    }
  });
};

/**
 * Stop network monitoring
 */
export const stopNetworkMonitoring = (): void => {
  if (subscription) {
    subscription();
    subscription = null;
  }
  listeners.clear();
};

/**
 * Subscribe to network state changes
 * @param callback Function called when network state changes
 * @returns Unsubscribe function
 */
export const subscribeToNetwork = (callback: NetworkCallback): (() => void) => {
  listeners.add(callback);

  // Immediately call with current state
  const isCurrentlyOnline = currentNetworkState?.isConnected ?? true;
  callback(isCurrentlyOnline);

  return () => {
    listeners.delete(callback);
  };
};

/**
 * Check if currently online
 */
export const isOnline = (): boolean => {
  return currentNetworkState?.isConnected ?? true;
};

/**
 * Get current network state details
 */
export const getNetworkState = (): NetInfoState | null => {
  return currentNetworkState;
};

/**
 * Force refresh network state
 */
export const refreshNetworkState = async (): Promise<boolean> => {
  currentNetworkState = await NetInfo.fetch();
  return currentNetworkState.isConnected ?? true;
};
