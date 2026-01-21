/**
 * Hook for managing documents CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  uploadDocumentFile,
  CreateDocumentData,
  UpdateDocumentData,
} from '@/services/documentService';
import type { Document, DocumentType } from '@/core/types/database';

interface DocumentsState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
}

interface UseDocumentsReturn extends DocumentsState {
  refresh: () => Promise<void>;
  addDocument: (
    fileUri: string,
    fileName: string,
    data: Omit<CreateDocumentData, 'vehicle_id' | 'file_path'>
  ) => Promise<Document | null>;
  editDocument: (documentId: string, updates: UpdateDocumentData) => Promise<Document | null>;
  removeDocument: (documentId: string) => Promise<boolean>;
  filterByType: (type: DocumentType | null) => Document[];
}

export const useDocuments = (vehicleId: string | null): UseDocumentsReturn => {
  const [state, setState] = useState<DocumentsState>({
    documents: [],
    isLoading: false,
    error: null,
  });

  const fetchDocuments = useCallback(async () => {
    if (!vehicleId) {
      setState({ documents: [], isLoading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await getDocuments(vehicleId);

      if (result.error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error?.message || 'Erreur inconnue',
        }));
        return;
      }

      setState({
        documents: result.data || [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors du chargement des documents',
      }));
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const refresh = useCallback(async () => {
    await fetchDocuments();
  }, [fetchDocuments]);

  const addDocument = useCallback(
    async (
      fileUri: string,
      fileName: string,
      data: Omit<CreateDocumentData, 'vehicle_id' | 'file_path'>
    ): Promise<Document | null> => {
      if (!vehicleId) return null;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Upload file first
        const uploadResult = await uploadDocumentFile(vehicleId, fileUri, fileName);

        if (uploadResult.error || !uploadResult.data) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: uploadResult.error?.message || 'Erreur lors du telechargement',
          }));
          return null;
        }

        // Create document record
        const createResult = await createDocument({
          ...data,
          vehicle_id: vehicleId,
          file_path: uploadResult.data,
        });

        if (createResult.error || !createResult.data) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: createResult.error?.message || 'Erreur lors de la creation',
          }));
          return null;
        }

        // Add to local state
        setState(prev => ({
          ...prev,
          documents: [createResult.data!, ...prev.documents],
          isLoading: false,
          error: null,
        }));

        return createResult.data;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: "Erreur lors de l'ajout du document",
        }));
        return null;
      }
    },
    [vehicleId]
  );

  const editDocument = useCallback(
    async (documentId: string, updates: UpdateDocumentData): Promise<Document | null> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await updateDocument(documentId, updates);

        if (result.error || !result.data) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: result.error?.message || 'Erreur lors de la mise a jour',
          }));
          return null;
        }

        // Update local state
        setState(prev => ({
          ...prev,
          documents: prev.documents.map(doc => (doc.id === documentId ? result.data! : doc)),
          isLoading: false,
          error: null,
        }));

        return result.data;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Erreur lors de la modification du document',
        }));
        return null;
      }
    },
    []
  );

  const removeDocument = useCallback(async (documentId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await deleteDocument(documentId);

      if (result.error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error?.message || 'Erreur lors de la suppression',
        }));
        return false;
      }

      // Remove from local state
      setState(prev => ({
        ...prev,
        documents: prev.documents.filter(doc => doc.id !== documentId),
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erreur lors de la suppression du document',
      }));
      return false;
    }
  }, []);

  const filterByType = useCallback(
    (type: DocumentType | null): Document[] => {
      if (!type) return state.documents;
      return state.documents.filter(doc => doc.type === type);
    },
    [state.documents]
  );

  return {
    ...state,
    refresh,
    addDocument,
    editDocument,
    removeDocument,
    filterByType,
  };
};
