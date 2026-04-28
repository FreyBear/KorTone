'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[AUTH CALLBACK] Starting...');
      
      const supabase = getSupabase();
      
      if (!supabase) {
        console.error('[AUTH CALLBACK] Supabase not available');
        window.location.href = '/';
        return;
      }

      try {
        // Check if we have hash params (OAuth callback)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        console.log('[AUTH CALLBACK] Access token present:', !!accessToken);

        if (accessToken) {
          // We have OAuth tokens in the URL, Supabase will handle them automatically
          // Wait for Supabase to process
          console.log('[AUTH CALLBACK] Waiting for Supabase to process tokens...');
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Now check session
        const { data, error } = await supabase.auth.getSession();

        console.log('[AUTH CALLBACK] Session check:', { 
          hasSession: !!data?.session, 
          error: error?.message,
          userEmail: data?.session?.user?.email
        });

        if (error) {
          console.error('[AUTH CALLBACK] Error:', error);
        }

        // Always redirect to home
        console.log('[AUTH CALLBACK] Redirecting to home...');
        
        // Set a fallback timeout
        setTimeout(() => {
          console.log('[AUTH CALLBACK] Fallback redirect executing...');
          window.location.href = '/';
        }, 1000);
        
        // Try immediate redirect
        window.location.href = '/';
      } catch (err) {
        console.error('[AUTH CALLBACK] Exception:', err);
        window.location.href = '/';
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-slate-600">Logging in...</p>
      <p className="text-xs text-slate-400">Processing authentication...</p>
    </div>
  );
}
