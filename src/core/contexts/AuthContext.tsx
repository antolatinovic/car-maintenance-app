/**
 * AuthContext - Shared authentication state across features
 * Decouples features from direct auth hook imports
 */

import React, { createContext, useContext, ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/core/types/database';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  value: AuthContextValue;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, value }) => {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
