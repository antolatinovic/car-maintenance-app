/**
 * Hook for account deletion orchestration
 */

import { useState, useCallback } from 'react';
import { deleteUserAccount } from '@/services/gdprService';

export const useAccountDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = useCallback(async (password: string) => {
    setIsDeleting(true);
    setError(null);

    const result = await deleteUserAccount(password);

    if (result.error) {
      setError(result.error.message);
      setIsDeleting(false);
    }
    // If successful, the user is signed out and the auth context handles navigation
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isDeleting,
    error,
    deleteAccount,
    clearError,
  };
};
