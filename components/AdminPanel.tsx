"use client";

import { useState, useEffect } from 'react';
import { Users, Shield, Edit3, X } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

type UserWithRole = {
  user_id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: 'admin' | 'editor' | null;
};

type AdminPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  async function loadUsers() {
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = getSupabase();
      if (!supabase) {
        setError('Ingen Supabase-tilkobling');
        return;
      }

      const { data, error: rpcError } = await supabase.rpc('get_all_users_with_roles');

      if (rpcError) {
        console.error('Error loading users:', rpcError);
        setError(`Kunne ikke laste brukere: ${rpcError.message}`);
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('En uventet feil oppstod');
    } finally {
      setIsLoading(false);
    }
  }

  async function setUserRole(userId: string, newRole: 'admin' | 'editor' | null) {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      if (newRole === null) {
        // Fjern rolle
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (error) {
          alert(`Kunne ikke fjerne rolle: ${error.message}`);
        } else {
          await loadUsers();
        }
      } else {
        // Legg til eller oppdater rolle
        const { error } = await supabase
          .from('user_roles')
          .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id' });

        if (error) {
          alert(`Kunne ikke sette rolle: ${error.message}`);
        } else {
          await loadUsers();
        }
      }
    } catch (err) {
      console.error('Error setting role:', err);
      alert('En uventet feil oppstod');
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-indigo-600 dark:text-indigo-400" size={24} />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Brukerhåndtering
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-slate-500">Laster brukere...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-600 dark:border-slate-700 dark:text-slate-400">
                <tr>
                  <th className="pb-3 pr-4">E-post</th>
                  <th className="pb-3 pr-4">Opprettet</th>
                  <th className="pb-3 pr-4">Sist pålogget</th>
                  <th className="pb-3 pr-4">Rolle</th>
                  <th className="pb-3">Handlinger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((user) => (
                  <tr key={user.user_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-slate-50">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                      {new Date(user.created_at).toLocaleDateString('nb-NO')}
                    </td>
                    <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString('nb-NO')
                        : 'Aldri'}
                    </td>
                    <td className="py-3 pr-4">
                      {user.role ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}
                        >
                          {user.role === 'admin' ? <Shield size={12} /> : <Edit3 size={12} />}
                          {user.role === 'admin' ? 'Admin' : 'Redaktør'}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Ingen rolle</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => setUserRole(user.user_id, 'admin')}
                            className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
                          >
                            Gjør til Admin
                          </button>
                        )}
                        {user.role !== 'editor' && (
                          <button
                            onClick={() => setUserRole(user.user_id, 'editor')}
                            className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                          >
                            Gjør til Redaktør
                          </button>
                        )}
                        {user.role && (
                          <button
                            onClick={() => setUserRole(user.user_id, null)}
                            className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            Fjern rolle
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800">
          <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-50">Rolleoversikt:</h3>
          <ul className="space-y-1 text-slate-600 dark:text-slate-400">
            <li>
              <strong className="text-purple-600 dark:text-purple-400">Admin:</strong> Full tilgang - kan administrere alle sanger, brukere og roller
            </li>
            <li>
              <strong className="text-blue-600 dark:text-blue-400">Redaktør:</strong> Kan legge til og redigere sanger, men ikke administrere brukere
            </li>
            <li>
              <strong>Ingen rolle:</strong> Kan bare se sanger (read-only)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
