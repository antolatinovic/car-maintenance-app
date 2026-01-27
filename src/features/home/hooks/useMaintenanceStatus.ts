/**
 * Hook to compute maintenance status cards for the home screen
 * Determines whether each maintenance category is ok, overdue, or unknown
 */

import { useState, useEffect, useCallback } from 'react';
import { maintenance } from '@/services/offlineService';
import type { MaintenanceCategory, MaintenanceSchedule } from '@/core/types/database';
import type { Ionicons } from '@expo/vector-icons';

export type MaintenanceStatusType = 'ok' | 'attention' | 'unknown';

export interface MaintenanceStatusCard {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  categories: MaintenanceCategory[];
  status: MaintenanceStatusType;
}

const CARD_DEFINITIONS: Omit<MaintenanceStatusCard, 'status'>[] = [
  { id: 'revision', label: 'Revision / Vidange', icon: 'checkmark-circle', categories: ['revision', 'oil_change'] },
  { id: 'tires', label: 'Pneus', icon: 'ellipse', categories: ['tires'] },
  { id: 'brakes', label: 'Freinage', icon: 'disc', categories: ['brakes'] },
  { id: 'distribution', label: 'Distribution', icon: 'git-network', categories: ['distribution'] },
  { id: 'ac', label: 'Climatisation', icon: 'snow', categories: ['ac'] },
  { id: 'suspension', label: 'Amortisseur', icon: 'swap-vertical', categories: ['suspension'] },
  { id: 'fluids', label: 'Liquides', icon: 'beaker', categories: ['fluids'] },
  { id: 'gearbox_oil', label: 'Vidange boite auto', icon: 'settings', categories: ['gearbox_oil'] },
];

function computeStatus(
  categories: MaintenanceCategory[],
  schedules: MaintenanceSchedule[],
  currentMileage?: number
): MaintenanceStatusType {
  const matching = schedules.filter(s => categories.includes(s.category));

  if (matching.length === 0) {
    return 'unknown';
  }

  const now = new Date();

  for (const schedule of matching) {
    if (schedule.status === 'overdue') {
      return 'attention';
    }

    if (schedule.due_date) {
      const dueDate = new Date(schedule.due_date);
      if (dueDate < now) {
        return 'attention';
      }
    }

    if (schedule.due_mileage && currentMileage) {
      if (currentMileage >= schedule.due_mileage) {
        return 'attention';
      }
    }
  }

  return 'ok';
}

export const useMaintenanceStatus = (
  vehicleId?: string,
  currentMileage?: number
): MaintenanceStatusCard[] => {
  const [cards, setCards] = useState<MaintenanceStatusCard[]>([]);

  const fetchStatus = useCallback(async () => {
    if (!vehicleId) {
      setCards([]);
      return;
    }

    try {
      const result = await maintenance.getSchedule(vehicleId);
      const schedules = result.data || [];

      const statusCards: MaintenanceStatusCard[] = CARD_DEFINITIONS.map(def => ({
        ...def,
        status: computeStatus(def.categories, schedules, currentMileage),
      }));

      setCards(statusCards);
    } catch {
      // On error, show all cards as unknown
      setCards(CARD_DEFINITIONS.map(def => ({ ...def, status: 'unknown' as const })));
    }
  }, [vehicleId, currentMileage]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return cards;
};
