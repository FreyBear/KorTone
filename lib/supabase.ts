import { createClient, SupabaseClient } from '@supabase/supabase-js';

// In static exports, process.env is replaced at build time
// These will be actual string values after build
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase() {
  // Only create client in browser
  if (typeof window === 'undefined') {
    return null;
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = SUPABASE_URL;
  const supabaseKey = SUPABASE_ANON_KEY || SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing!');
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
}

export const hasSupabaseEnv = Boolean(SUPABASE_URL && (SUPABASE_ANON_KEY || SUPABASE_PUBLISHABLE_KEY));

// Always return null on server to avoid hydration issues
export const supabase = typeof window !== 'undefined' ? getSupabase() : null;
export const supabaseUrl = SUPABASE_URL;
export const supabaseKey = SUPABASE_ANON_KEY || SUPABASE_PUBLISHABLE_KEY;
