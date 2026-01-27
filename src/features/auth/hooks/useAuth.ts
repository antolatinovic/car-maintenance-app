/**
 * Authentication hook for Supabase auth management
 * Supports offline mode with cached profile
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/core/config/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/core/types/database';

const PROFILE_CACHE_KEY = 'cached_user_profile';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthError {
  message: string;
  code?: string;
}

interface UseAuthReturn extends AuthState {
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<AuthError | null>;
  signIn: (email: string, password: string) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Get cached profile from AsyncStorage
  const getCachedProfile = useCallback(async (): Promise<Profile | null> => {
    try {
      const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Cache profile to AsyncStorage
  const cacheProfile = useCallback(async (profile: Profile): Promise<void> => {
    try {
      await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore cache errors
    }
  }, []);

  // Fetch user profile from database with timeout and fallback to cache
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 10000);
      });

      // Race between fetch and timeout
      const fetchPromise = supabase.from('profiles').select('*').eq('id', userId).single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        console.warn('Error fetching profile, using cache:', error.message);
        // Try to get cached profile
        return await getCachedProfile();
      }

      // Cache the profile for offline use
      if (data) {
        await cacheProfile(data);
      }

      return data;
    } catch (error) {
      console.warn('Profile fetch failed (possibly offline), using cache');
      // Return cached profile when offline
      return await getCachedProfile();
    }
  }, [getCachedProfile, cacheProfile]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get session with timeout for offline scenarios
        const timeoutPromise = new Promise<{ data: { session: Session | null } }>((resolve) => {
          setTimeout(() => resolve({ data: { session: null } }), 15000);
        });

        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            session,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          // No session from Supabase, check if we have cached profile (offline scenario)
          const cachedProfile = await getCachedProfile();
          if (cachedProfile) {
            // We have cached data, user was previously logged in
            // Show them as authenticated with cached profile
            setState({
              user: null,
              profile: cachedProfile,
              session: null,
              isLoading: false,
              isAuthenticated: true, // Allow offline access with cached profile
            });
          } else {
            setState({
              user: null,
              profile: null,
              session: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Try cached profile on error (likely offline)
        const cachedProfile = await getCachedProfile();
        if (cachedProfile) {
          setState({
            user: null,
            profile: cachedProfile,
            session: null,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          user: session.user,
          profile,
          session,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState({
          user: null,
          profile: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, getCachedProfile]);

  // Sign up with email and password
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string
    ): Promise<AuthError | null> => {
      try {
        setState(prev => ({ ...prev, isLoading: true }));

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
          },
        });

        if (error) {
          setState(prev => ({ ...prev, isLoading: false }));
          return { message: error.message, code: error.code };
        }

        // Create profile in database
        // Note: Profile may be auto-created by Supabase trigger
        if (data.user) {
          const profileData = {
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
          };

          const { error: profileError } = await supabase
            .from('profiles')
            .upsert(profileData as never);

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }

        return null;
      } catch (error) {
        setState(prev => ({ ...prev, isLoading: false }));
        return { message: 'Une erreur inattendue est survenue' };
      }
    },
    []
  );

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string): Promise<AuthError | null> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState(prev => ({ ...prev, isLoading: false }));
        return { message: error.message, code: error.code };
      }

      return null;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { message: 'Une erreur inattendue est survenue' };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    try {
      // Clear cached profile
      await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  // Refresh profile data
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id);
      setState(prev => ({ ...prev, profile }));
    }
  }, [state.user, fetchProfile]);

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };
};
