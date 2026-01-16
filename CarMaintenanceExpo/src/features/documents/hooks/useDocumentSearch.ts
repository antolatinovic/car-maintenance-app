/**
 * Hook for local document search and filtering
 */

import { useState, useCallback, useMemo } from 'react';
import type { Document, DocumentType } from '@/core/types/database';

interface SearchFilters {
  query: string;
  type: DocumentType | null;
}

interface UseDocumentSearchReturn {
  filters: SearchFilters;
  setSearchQuery: (query: string) => void;
  setTypeFilter: (type: DocumentType | null) => void;
  clearFilters: () => void;
  filterDocuments: (documents: Document[]) => Document[];
  hasActiveFilters: boolean;
}

export const useDocumentSearch = (): UseDocumentSearchReturn => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: null,
  });

  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, query }));
  }, []);

  const setTypeFilter = useCallback((type: DocumentType | null) => {
    setFilters(prev => ({ ...prev, type }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ query: '', type: null });
  }, []);

  const filterDocuments = useCallback(
    (documents: Document[]): Document[] => {
      let filtered = [...documents];

      // Filter by type
      if (filters.type) {
        filtered = filtered.filter(doc => doc.type === filters.type);
      }

      // Filter by search query
      if (filters.query.trim()) {
        const searchTerm = filters.query.toLowerCase().trim();
        filtered = filtered.filter(doc => {
          const searchableFields = [doc.description, doc.vendor, doc.notes, doc.type].filter(
            Boolean
          );

          return searchableFields.some(field => field?.toLowerCase().includes(searchTerm));
        });
      }

      return filtered;
    },
    [filters]
  );

  const hasActiveFilters = useMemo(() => {
    return filters.query.trim() !== '' || filters.type !== null;
  }, [filters]);

  return {
    filters,
    setSearchQuery,
    setTypeFilter,
    clearFilters,
    filterDocuments,
    hasActiveFilters,
  };
};
