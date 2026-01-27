/**
 * Hook for user data export (RGPD Art. 20)
 */

import { useState, useCallback } from 'react';
import * as Sharing from 'expo-sharing';
import { File as ExpoFile } from 'expo-file-system';
import { exportUserData } from '@/services/gdprService';

export const useDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportAndShare = useCallback(async () => {
    setIsExporting(true);
    setError(null);

    try {
      const result = await exportUserData();

      if (result.error || !result.data) {
        setError(result.error?.message ?? "Erreur lors de l'export");
        setIsExporting(false);
        return;
      }

      const filePath = result.data;

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        setError("Le partage n'est pas disponible sur cet appareil");
        setIsExporting(false);
        return;
      }

      // Share the file
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Exporter mes donnees',
        UTI: 'public.json',
      });

      // Clean up temp file
      try {
        const tempFile = new ExpoFile(filePath);
        if (tempFile.exists) {
          tempFile.delete();
        }
      } catch {
        // Best-effort cleanup
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'export";
      setError(message);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    isExporting,
    error,
    exportAndShare,
  };
};
