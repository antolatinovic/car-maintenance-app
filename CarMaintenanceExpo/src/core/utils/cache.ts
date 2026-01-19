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
} as const;
