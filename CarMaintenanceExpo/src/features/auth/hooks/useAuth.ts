/**
 * Authentication hook for Supabase auth management
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/core/config/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/core/types/database';

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

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

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
      } catch (error) {
        console.error('Error initializing auth:', error);
        setState(prev => ({ ...prev, isLoading: false }));
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
  }, [fetchProfile]);

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
