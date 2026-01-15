/**
 * Supabase client configuration
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = 'https://dahijvkdrsmrgwvosyym.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaGlqdmtkcnNtcmd3dm9zeXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MTUzOTUsImV4cCI6MjA1MjE5MTM5NX0.LGBx6NHxMUfJDTwfOp-aR5UvXmgMDxY9WBbbX99NKKg';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
