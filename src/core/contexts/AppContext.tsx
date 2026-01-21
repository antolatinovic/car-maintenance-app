/**
 * AppContext - Cross-feature navigation and app-wide actions
 * Allows features to trigger navigation without direct imports
 */

import React, { createContext, useContext, ReactNode } from 'react';
import type { TabItem } from '@/shared/components/TabBar';
import type { Vehicle } from '@/core/types/database';

interface AppContextValue {
  openVehicleForm: (vehicle?: Vehicle) => void;
  closeVehicleForm: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openAnalytics: () => void;
  closeAnalytics: () => void;
  navigateToTab: (tab: TabItem) => void;
  refreshHome: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

interface AppProviderProps {
  children: ReactNode;
  value: AppContextValue;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children, value }) => {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
