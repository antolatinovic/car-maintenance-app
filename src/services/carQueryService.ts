/**
 * CarQuery API Service
 * Provides car makes and models data
 * API Documentation: https://www.carqueryapi.com/documentation/
 */

import { getCached, setCache, clearCacheByPrefix, CACHE_DURATIONS } from '@/core/utils/cache';
import type { CarMake, CarModel, CarMakesResponse, CarModelsResponse } from '@/core/types';

// API Configuration
const BASE_URL = 'https://www.carqueryapi.com/api/0.3/';
const CACHE_PREFIX = 'carquery_';
const MAKES_CACHE_KEY = `${CACHE_PREFIX}makes`;

/**
 * Popular brands to show first (French market focus)
 */
export const POPULAR_MAKES = [
  'peugeot',
  'renault',
  'citroen',
  'dacia',
  'volkswagen',
  'bmw',
  'audi',
  'mercedes-benz',
  'toyota',
  'ford',
  'opel',
  'fiat',
  'nissan',
  'hyundai',
  'kia',
  'seat',
  'skoda',
  'volvo',
  'mini',
  'mazda',
] as const;

/**
 * Parse JSONP response from CarQuery API
 */
function parseJSONP(jsonpString: string): unknown {
  const match = jsonpString.match(/\((.+)\)/s);
  if (match?.[1]) {
    return JSON.parse(match[1]);
  }
  return JSON.parse(jsonpString);
}

/**
 * Fetch data from CarQuery API with JSONP support
 */
async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const callbackName = `cb_${Date.now()}`;
  const url = `${BASE_URL}${endpoint}&callback=${callbackName}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const text = await response.text();
  return parseJSONP(text) as T;
}

/**
 * Sort makes: popular first, then alphabetically
 */
function sortMakes(makes: CarMake[]): CarMake[] {
  return [...makes].sort((a, b) => {
    const aIndex = POPULAR_MAKES.indexOf(a.make_id.toLowerCase() as typeof POPULAR_MAKES[number]);
    const bIndex = POPULAR_MAKES.indexOf(b.make_id.toLowerCase() as typeof POPULAR_MAKES[number]);

    if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex;
    if (aIndex >= 0) return -1;
    if (bIndex >= 0) return 1;
    return a.make_display.localeCompare(b.make_display);
  });
}

/**
 * Remove duplicate models (same name can appear for different years)
 */
function deduplicateModels(models: CarModel[]): CarModel[] {
  const seen = new Set<string>();
  return models.filter(model => {
    const key = model.model_name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Fetch all car makes
 * Results are cached for 7 days
 */
export async function getMakes(): Promise<CarMake[]> {
  // Check cache
  const cached = await getCached<CarMake[]>(MAKES_CACHE_KEY, CACHE_DURATIONS.WEEK);
  if (cached) return cached;

  try {
    const response = await fetchFromAPI<CarMakesResponse>('?cmd=getMakes');
    const sortedMakes = sortMakes(response.Makes || []);

    await setCache(MAKES_CACHE_KEY, sortedMakes);
    return sortedMakes;
  } catch (error) {
    console.error('[CarQuery] getMakes error:', error);
    throw new Error('Impossible de charger les marques');
  }
}

/**
 * Fetch models for a specific make
 * Results are cached for 7 days per make
 */
export async function getModels(makeId: string): Promise<CarModel[]> {
  const cacheKey = `${CACHE_PREFIX}models_${makeId.toLowerCase()}`;

  // Check cache
  const cached = await getCached<CarModel[]>(cacheKey, CACHE_DURATIONS.WEEK);
  if (cached) return cached;

  try {
    const response = await fetchFromAPI<CarModelsResponse>(
      `?cmd=getModels&make=${encodeURIComponent(makeId)}`
    );

    const uniqueModels = deduplicateModels(response.Models || []);
    uniqueModels.sort((a, b) => a.model_name.localeCompare(b.model_name));

    await setCache(cacheKey, uniqueModels);
    return uniqueModels;
  } catch (error) {
    console.error('[CarQuery] getModels error:', error);
    throw new Error('Impossible de charger les modeles');
  }
}

/**
 * Clear all CarQuery cache
 */
export async function clearCarQueryCache(): Promise<void> {
  await clearCacheByPrefix(CACHE_PREFIX);
}
