'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LogOutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogOut = async () => {
    if (!supabase) {
      console.error('Supabase is not configured.');
      return;
    }

    setLoading(true);

    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogOut}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
    >
      <LogOut size={18} />
      {loading ? 'Logging out...' : 'Log out'}
    </button>
  );
}
