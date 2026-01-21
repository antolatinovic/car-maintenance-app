/**
 * Hook for managing AI quota
 */

import { useState, useEffect, useCallback } from 'react';
import { getQuotaInfo } from '../services';
import type { QuotaInfo } from '../types';

interface UseQuotaReturn {
  quota: QuotaInfo | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  canSendMessage: boolean;
}

export const useQuota = (): UseQuotaReturn => {
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuota = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getQuotaInfo();

      if (result.error) {
        setError(result.error.message);
        setQuota(null);
      } else {
        setQuota(result.data);
      }
    } catch (err) {
      setError('Erreur lors de la verification du quota');
      setQuota(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const refresh = useCallback(async () => {
    await fetchQuota();
  }, [fetchQuota]);

  const canSendMessage = quota !== null && !quota.isExceeded;

  return {
    quota,
    isLoading,
    error,
    refresh,
    canSendMessage,
  };
};
