import { createClient, SupabaseClient } from '@supabase/supabase-js';

// In static exports, process.env is replaced at build time
// These will be actual string values after build
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = SUPABASE_URL;
  const supabaseKey = SUPABASE_ANON_KEY || SUPABASE_PUBLISHABLE_KEY;

  console.log('Attempting to create Supabase client:', {
    hasUrl: !!supabaseUrl,
    urlLength: supabaseUrl?.length || 0,
    urlPrefix: supabaseUrl?.slice(0, 30) || 'undefined',
    hasKey: !!supabaseKey,
    keyLength: supabaseKey?.length || 0,
    keyPrefix: supabaseKey?.slice(0, 10) || 'undefined',
  });

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials missing!', {
      url: supabaseUrl,
      hasAnonKey: !!SUPABASE_ANON_KEY,
      hasPublishableKey: !!SUPABASE_PUBLISHABLE_KEY,
    });
    return null;
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    console.log('✓ Supabase client created successfully');
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
}

export const hasSupabaseEnv = Boolean(SUPABASE_URL && (SUPABASE_ANON_KEY || SUPABASE_PUBLISHABLE_KEY));

// Export supabase as a getter that works in browser
export const supabase = typeof window !== 'undefined' ? getSupabase() : null;
export const supabaseUrl = SUPABASE_URL;
export const supabaseKey = SUPABASE_ANON_KEY || SUPABASE_PUBLISHABLE_KEY;
