'use client';

import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export default function SignInButton() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    const supabase = getSupabase();
    
    if (!supabase) {
      console.error('Supabase is not configured.');
      return;
    }

    setLoading(true);

    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
    >
      <LogIn size={18} />
      {loading ? 'Logging in...' : 'Sign in with Google'}
    </button>
  );
}
