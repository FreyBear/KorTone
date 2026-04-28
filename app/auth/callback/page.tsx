'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = getSupabase();
      
      if (!supabase) {
        console.error('Supabase not available');
        router.push('/');
        return;
      }

      try {
        // Check if we have hash params (OAuth callback)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        console.log('Auth callback - has access token:', !!accessToken);

        if (accessToken) {
          // We have OAuth tokens in the URL, Supabase will handle them automatically
          // Just wait a bit for Supabase to process
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Now check session
        const { data, error } = await supabase.auth.getSession();

        console.log('Session check:', { 
          hasSession: !!data?.session, 
          error: error?.message 
        });

        if (error) {
          console.error('Auth callback error:', error);
        }

        // Always redirect to home, whether we have a session or not
        console.log('Redirecting to home...');
        
        // Use window.location for more reliable redirect in static export
        window.location.href = '/';
      } catch (err) {
        console.error('Callback handling error:', err);
        window.location.href = '/';
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-slate-600">Logging in...</p>
    </div>
  );
}
