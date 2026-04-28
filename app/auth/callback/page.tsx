'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      if (!supabase) {
        router.push('/');
        return;
      }

      // Supabase automatically handles the session from the URL
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error);
        router.push('/');
        return;
      }

      if (data?.session) {
        // Session is established, redirect to home
        router.push('/');
      } else {
        // No session, redirect to home
        router.push('/');
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
