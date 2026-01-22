/**
 * Cache Utility
 * Generic caching layer using AsyncStorage
 * Designed for scalability with thousands of users
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

// Cache version - increment to invalidate all caches
const CACHE_VERSION = 1;

/**
 * Get cached data if valid and not expired
 */
export async function getCached<T>(
  key: string,
  maxAge: number
): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);

    // Check version
    if (entry.version !== CACHE_VERSION) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    // Check expiration
    if (Date.now() - entry.timestamp > maxAge) {
      await AsyncStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error(`[Cache] Read error for key "${key}":`, error);
    return null;
  }
}

/**
 * Store data in cache with timestamp
 */
export async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error(`[Cache] Write error for key "${key}":`, error);
  }
}

/**
 * Remove specific cache entry
 */
export async function removeCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`[Cache] Remove error for key "${key}":`, error);
  }
}

/**
 * Clear all cache entries matching a prefix
 */
export async function clearCacheByPrefix(prefix: string): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const keysToRemove = allKeys.filter(key => key.startsWith(prefix));
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    console.error(`[Cache] Clear error for prefix "${prefix}":`, error);
  }
}

/**
 * Cache durations presets (in milliseconds)
 */
export const CACHE_DURATIONS = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 60 * 60 * 1000, // 1 hour
  LONG: 24 * 60 * 60 * 1000, // 1 day
  WEEK: 7 * 24 * 60 * 60 * 1000, // 7 days
  OFFLINE: 30 * 24 * 60 * 60 * 1000, // 30 days - for offline mode
} as const;

// ============================================================
// OFFLINE CACHE FUNCTIONS
// ============================================================

interface OfflineCacheResult<T> {
  data: T | null;
  isStale: boolean;
  timestamp: number | null;
}

/**
 * Store data for offline use with extended TTL
 * Uses OFFLINE duration (30 days) by default
 */
export async function setOfflineCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error(`[OfflineCache] Write error for key "${key}":`, error);
  }
}

/**
 * Get offline cached data with staleness indicator
 * Data is considered stale after MEDIUM duration but still returned
 * Data is only removed after OFFLINE duration
 */
export async function getOfflineCached<T>(
  key: string,
  staleAfter: number = CACHE_DURATIONS.MEDIUM
): Promise<OfflineCacheResult<T>> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return { data: null, isStale: false, timestamp: null };
    }

    const entry: CacheEntry<T> = JSON.parse(raw);

    // Check version
    if (entry.version !== CACHE_VERSION) {
      await AsyncStorage.removeItem(key);
      return { data: null, isStale: false, timestamp: null };
    }

    const age = Date.now() - entry.timestamp;

    // Remove if older than offline duration (30 days)
    if (age > CACHE_DURATIONS.OFFLINE) {
      await AsyncStorage.removeItem(key);
      return { data: null, isStale: false, timestamp: null };
    }

    // Return data with staleness flag
    return {
      data: entry.data,
      isStale: age > staleAfter,
      timestamp: entry.timestamp,
    };
  } catch (error) {
    console.error(`[OfflineCache] Read error for key "${key}":`, error);
    return { data: null, isStale: false, timestamp: null };
  }
}

/**
 * Update cached data without changing timestamp
 * Useful for updating cache after local mutations
 */
export async function updateOfflineCache<T>(
  key: string,
  updater: (current: T | null) => T
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(key);
    let timestamp = Date.now();

    if (raw) {
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (entry.version === CACHE_VERSION) {
        timestamp = entry.timestamp; // Preserve original timestamp
        const newEntry: CacheEntry<T> = {
          data: updater(entry.data),
          timestamp,
          version: CACHE_VERSION,
        };
        await AsyncStorage.setItem(key, JSON.stringify(newEntry));
        return;
      }
    }

    // No existing cache, create new
    const newEntry: CacheEntry<T> = {
      data: updater(null),
      timestamp,
      version: CACHE_VERSION,
    };
    await AsyncStorage.setItem(key, JSON.stringify(newEntry));
  } catch (error) {
    console.error(`[OfflineCache] Update error for key "${key}":`, error);
  }
}
