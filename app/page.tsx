"use client";

import Fuse from 'fuse.js';
import { useEffect, useMemo, useState } from 'react';
import { AddSongModal } from '@/components/AddSongModal';
import { SearchBar } from '@/components/SearchBar';
import { SongCard } from '@/components/SongCard';
import { SoundModeSelect } from '@/components/SoundModeSelect';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TuningForkFab } from '@/components/TuningForkFab';
import { AdminPanel } from '@/components/AdminPanel';
import { Shield } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { installAudioWarmupOnFirstGesture, preloadCurrentInstrument, setSoundMode, detectIOSSilentMode } from '@/lib/audio';
import { fallbackSongs } from '@/lib/songData';
import { hasSupabaseEnv, getSupabase } from '@/lib/supabase';
import type { Song, SoundMode } from '@/lib/types';
import { Toast } from '@/components/Toast';

const soundStorageKey = 'kortone-sound-mode';

function resolveInitialSoundMode(): SoundMode {
  if (typeof window === 'undefined') {
    return 'grandPiano';
  }

  const saved = window.localStorage.getItem(soundStorageKey);
  if (saved === 'piano' || saved === 'grandPiano') {
    return 'grandPiano';
  }

  if (saved === 'choirPad' || saved === 'stringsPad') {
    return 'stringsPad';
  }

  if (saved === 'electricPiano' || saved === 'sine' || saved === 'organ') {
    return saved;
  }

  return 'grandPiano';
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>(fallbackSongs);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [soundMode, setSoundModeState] = useState<SoundMode>(resolveInitialSoundMode);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSoundMode(soundMode);
    window.localStorage.setItem(soundStorageKey, soundMode);
    void preloadCurrentInstrument();
  }, [soundMode]);

  async function fetchAndSetSongs() {
    const supabase = getSupabase();

    if (!hasSupabaseEnv || !supabase) {
      setStatus('Ingen Supabase-tilkobling. Krever autentisering.');
      return;
    }

    const { data, error } = await supabase
      .from('songs')
      .select('id,title,nickname,voices,sequence,pitches,key_signature,tempo_bpm')
      .order('title', { ascending: true });

    if (error) {
      setStatus('Kunne ikke hente fra Supabase. Viser demo-data.');
      return;
    }

    if (data && data.length > 0) {
      setSongs(data as Song[]);
    } else {
      setStatus('Ingen sanger i databasen enda. Viser demo-data.');
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchAndSetSongs();
    }, 0);
    const removeWarmupListeners = installAudioWarmupOnFirstGesture();

    return () => {
      window.clearTimeout(timeoutId);
      removeWarmupListeners();
    };
  }, []);

  const reloadSongs = fetchAndSetSongs;

  async function applyPermissions(supabase: ReturnType<typeof getSupabase>) {
    if (!supabase) return;
    const { data: adminCheck } = await supabase.rpc('is_admin');
    setIsAdmin(adminCheck === true);

    const { data: canEditCheck, error: canEditError } = await supabase.rpc('can_edit_songs');
    if (canEditError) {
      console.warn('can_edit_songs() not found, using isAdmin fallback');
      setCanEdit(adminCheck === true);
    } else {
      setCanEdit(canEditCheck === true);
    }
  }

  useEffect(() => {
    async function getSession() {
      const supabase = getSupabase();

      if (!hasSupabaseEnv || !supabase) {
        return;
      }

      const { data } = await supabase.auth.getSession();
      const currentSession = data?.session || null;
      setSession(currentSession);

      if (currentSession) {
        await applyPermissions(supabase);
      }

      // Listen for auth changes
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        setSession(session);

        if (session) {
          await applyPermissions(supabase);
        } else {
          setIsAdmin(false);
          setCanEdit(false);
        }
      });

      return () => {
        listener?.subscription.unsubscribe();
      };
    }

    getSession();
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(songs, {
        keys: ['title', 'nickname', 'voices', 'key_signature'],
        threshold: 0.32,
        ignoreLocation: true,
      }),
    [songs]
  );

  const filteredSongs = useMemo(() => {
    if (!query.trim()) {
      return songs;
    }
    return fuse.search(query.trim()).map((result) => result.item);
  }, [query, songs, fuse]);

  return (
    <main className="mx-auto min-h-screen max-w-2xl pb-24">
      <header className="flex flex-col items-start gap-3 px-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.24em] text-indigo-600">Åsta La Vista</p>
          <h1 className="text-2xl font-bold">Digital stemmegaffel</h1>
          <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">
            {status}
            {' · '}
            {session ? (
              <>
                <span className="text-slate-600 dark:text-slate-300">
                  {session.user.email}
                </span>
                {' · '}
                <button
                  onClick={async () => {
                    const supabase = getSupabase();
                    if (supabase) {
                      await supabase.auth.signOut();
                      window.location.reload();
                    }
                  }}
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                >
                  logg ut
                </button>
              </>
            ) : (
              <button
                onClick={async () => {
                  const supabase = getSupabase();
                  if (supabase) {
                    await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                      },
                    });
                  }
                }}
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
              >
                logg inn
              </button>
            )}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <AddSongModal canEdit={canEdit} onSongAdded={reloadSongs} />
          {isAdmin && (
            <button
              onClick={() => setAdminPanelOpen(true)}
              className="flex items-center gap-1 rounded-lg bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700 transition hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50"
              title="Brukerhåndtering"
            >
              <Shield size={16} />
              Admin
            </button>
          )}
          <SoundModeSelect value={soundMode} onChange={setSoundModeState} />
          <ThemeToggle />
        </div>
      </header>

      <SearchBar value={query} onChange={setQuery} />

      <section className="space-y-3 px-4 pt-4">
        {filteredSongs.map((song) => (
          <SongCard key={song.id} song={song} isAdmin={canEdit} onSongUpdated={reloadSongs} />
        ))}
      </section>

      <TuningForkFab />
      <AdminPanel isOpen={adminPanelOpen} onClose={() => setAdminPanelOpen(false)} />
    </main>
  );
}
