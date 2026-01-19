/**
 * Hook for managing car makes and models data
 * Uses CarQuery API with caching
 */

import { useState, useEffect, useCallback } from 'react';
import { getMakes, getModels, POPULAR_MAKES } from '@/services/carQueryService';
import type { CarMake, CarModel } from '@/core/types';

export interface UseCarDataResult {
  // Data
  makes: CarMake[];
  models: CarModel[];

  // Loading states
  isLoadingMakes: boolean;
  isLoadingModels: boolean;

  // Errors
  makesError: string | null;
  modelsError: string | null;

  // Selection
  selectedMake: CarMake | null;
  selectedModel: CarModel | null;
  setSelectedMake: (make: CarMake | null) => void;
  setSelectedModel: (model: CarModel | null) => void;

  // Search
  filterMakes: (query: string) => CarMake[];
  filterModels: (query: string) => CarModel[];

  // Manual entry fallback
  isManualEntry: boolean;
  setManualEntry: (value: boolean) => void;

  // Actions
  refreshMakes: () => Promise<void>;
}

export function useCarData(
  initialMake?: string,
  initialModel?: string
): UseCarDataResult {
  // Data state
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);

  // Loading state
  const [isLoadingMakes, setIsLoadingMakes] = useState(true);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Error state
  const [makesError, setMakesError] = useState<string | null>(null);
  const [modelsError, setModelsError] = useState<string | null>(null);

  // Selection state
  const [selectedMake, setSelectedMakeInternal] = useState<CarMake | null>(null);
  const [selectedModel, setSelectedModelInternal] = useState<CarModel | null>(null);

  // Manual entry fallback
  const [isManualEntry, setManualEntry] = useState(false);

  // Load makes on mount
  useEffect(() => {
    loadMakes();
  }, []);

  // Auto-select initial make when makes are loaded
  useEffect(() => {
    if (initialMake && makes.length > 0 && !selectedMake) {
      const match = makes.find(
        m => m.make_display.toLowerCase() === initialMake.toLowerCase()
      );
      if (match) {
        setSelectedMakeInternal(match);
      }
    }
  }, [initialMake, makes, selectedMake]);

  // Auto-select initial model when models are loaded
  useEffect(() => {
    if (initialModel && models.length > 0 && selectedMake && !selectedModel) {
      const match = models.find(
        m => m.model_name.toLowerCase() === initialModel.toLowerCase()
      );
      if (match) {
        setSelectedModelInternal(match);
      }
    }
  }, [initialModel, models, selectedMake, selectedModel]);

  // Load models when make changes
  useEffect(() => {
    if (selectedMake) {
      loadModels(selectedMake.make_id);
    } else {
      setModels([]);
    }
  }, [selectedMake]);

  const loadMakes = async () => {
    setIsLoadingMakes(true);
    setMakesError(null);

    try {
      const data = await getMakes();
      setMakes(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de chargement';
      setMakesError(message);
      setManualEntry(true);
    } finally {
      setIsLoadingMakes(false);
    }
  };

  const loadModels = async (makeId: string) => {
    setIsLoadingModels(true);
    setModelsError(null);
    setModels([]);

    try {
      const data = await getModels(makeId);
      setModels(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de chargement';
      setModelsError(message);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const setSelectedMake = useCallback((make: CarMake | null) => {
    setSelectedMakeInternal(make);
    setSelectedModelInternal(null); // Reset model when make changes
  }, []);

  const setSelectedModel = useCallback((model: CarModel | null) => {
    setSelectedModelInternal(model);
  }, []);

  const filterMakes = useCallback(
    (query: string): CarMake[] => {
      if (!query.trim()) return makes;

      const lowerQuery = query.toLowerCase();
      return makes
        .filter(
          m =>
            m.make_display.toLowerCase().includes(lowerQuery) ||
            m.make_id.toLowerCase().includes(lowerQuery)
        )
        .sort((a, b) => {
          // Exact start matches first
          const aStarts = a.make_display.toLowerCase().startsWith(lowerQuery);
          const bStarts = b.make_display.toLowerCase().startsWith(lowerQuery);
          if (aStarts !== bStarts) return aStarts ? -1 : 1;

          // Popular brands second
          const aPopular = POPULAR_MAKES.includes(a.make_id.toLowerCase() as typeof POPULAR_MAKES[number]);
          const bPopular = POPULAR_MAKES.includes(b.make_id.toLowerCase() as typeof POPULAR_MAKES[number]);
          if (aPopular !== bPopular) return aPopular ? -1 : 1;

          // Alphabetical
          return a.make_display.localeCompare(b.make_display);
        });
    },
    [makes]
  );

  const filterModels = useCallback(
    (query: string): CarModel[] => {
      if (!query.trim()) return models;

      const lowerQuery = query.toLowerCase();
      return models
        .filter(m => m.model_name.toLowerCase().includes(lowerQuery))
        .sort((a, b) => {
          const aStarts = a.model_name.toLowerCase().startsWith(lowerQuery);
          const bStarts = b.model_name.toLowerCase().startsWith(lowerQuery);
          if (aStarts !== bStarts) return aStarts ? -1 : 1;
          return a.model_name.localeCompare(b.model_name);
        });
    },
    [models]
  );

  const refreshMakes = useCallback(async () => {
    await loadMakes();
  }, []);

  return {
    makes,
    models,
    isLoadingMakes,
    isLoadingModels,
    makesError,
    modelsError,
    selectedMake,
    selectedModel,
    setSelectedMake,
    setSelectedModel,
    filterMakes,
    filterModels,
    isManualEntry,
    setManualEntry,
    refreshMakes,
  };
}
