/**
 * Storage utilities for secure signed URLs
 * Replaces public URL access with time-limited signed URLs
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/core/config/supabase';

export type BucketName = 'documents' | 'vehicles' | 'avatars';

interface CacheEntry {
  url: string;
  expiresAt: number;
}

// In-memory cache: key = "bucket/path" → signed URL + expiration
const signedUrlCache = new Map<string, CacheEntry>();

// Signed URLs are valid for 1 hour; cache expires at 45 min to avoid stale URLs
const SIGNED_URL_DURATION = 3600; // 1 hour in seconds
const CACHE_TTL_MS = 45 * 60 * 1000; // 45 minutes in milliseconds

/**
 * Extract the relative storage path from a full public URL or return as-is if already relative.
 * Handles both old records (full URLs) and new records (relative paths).
 */
export const extractStoragePath = (urlOrPath: string, bucket: BucketName): string => {
  // Already a relative path (no protocol)
  if (!urlOrPath.startsWith('http')) {
    return urlOrPath;
  }

  // Extract path from full URL
  // Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = urlOrPath.indexOf(marker);
  if (idx !== -1) {
    return urlOrPath.slice(idx + marker.length);
  }

  // Fallback: try signed URL format
  // Format: https://<project>.supabase.co/storage/v1/object/sign/<bucket>/<path>?token=...
  const signedMarker = `/storage/v1/object/sign/${bucket}/`;
  const signedIdx = urlOrPath.indexOf(signedMarker);
  if (signedIdx !== -1) {
    const pathWithQuery = urlOrPath.slice(signedIdx + signedMarker.length);
    return pathWithQuery.split('?')[0];
  }

  // Last resort: return as-is (might already be a path)
  return urlOrPath;
};

/**
 * Generate a signed URL for a private storage object.
 * Results are cached in-memory for 45 minutes.
 */
export const getSignedStorageUrl = async (
  bucket: BucketName,
  pathOrUrl: string
): Promise<string | null> => {
  if (!pathOrUrl) return null;

  const path = extractStoragePath(pathOrUrl, bucket);
  const cacheKey = `${bucket}/${path}`;

  // Check cache
  const cached = signedUrlCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  // Generate new signed URL
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_DURATION);

  if (error || !data?.signedUrl) {
    console.warn(`Failed to get signed URL for ${bucket}/${path}:`, error?.message);
    return null;
  }

  // Cache the result
  signedUrlCache.set(cacheKey, {
    url: data.signedUrl,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return data.signedUrl;
};

/**
 * Clear the signed URL cache.
 * Call after uploads to ensure fresh URLs are generated.
 */
export const clearSignedUrlCache = (bucket?: BucketName): void => {
  if (bucket) {
    const prefix = `${bucket}/`;
    for (const key of signedUrlCache.keys()) {
      if (key.startsWith(prefix)) {
        signedUrlCache.delete(key);
      }
    }
  } else {
    signedUrlCache.clear();
  }
};

/**
 * React hook to resolve a signed URL from a private storage path.
 * Returns null while loading, the signed URL when resolved, or null on error.
 */
export const useSignedUrl = (
  bucket: BucketName,
  path: string | null | undefined
): { url: string | null; loading: boolean } => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!path);

  useEffect(() => {
    let cancelled = false;

    if (!path) {
      setUrl(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    getSignedStorageUrl(bucket, path).then(signedUrl => {
      if (!cancelled) {
        setUrl(signedUrl);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [bucket, path]);

  return { url, loading };
};
