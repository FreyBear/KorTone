"use client";

import Fuse from 'fuse.js';
import { useEffect, useMemo, useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { SongCard } from '@/components/SongCard';
import { SoundModeSelect } from '@/components/SoundModeSelect';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TuningForkFab } from '@/components/TuningForkFab';
import type { Session } from '@supabase/supabase-js';
import { setSoundMode } from '@/lib/audio';
import { fallbackSongs } from '@/lib/songData';
import { hasSupabaseEnv, getSupabase } from '@/lib/supabase';
import type { Song, SoundMode } from '@/lib/types';

const soundStorageKey = 'kortone-sound-mode';

export default function Home() {
  const [songs, setSongs] = useState<Song[]>(fallbackSongs);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Demo-data aktiv.');
  const [session, setSession] = useState<Session | null>(null);
  const [mounted, setMounted] = useState(false);
  const [soundMode, setSoundModeState] = useState<SoundMode>('piano');

  useEffect(() => {
    setMounted(true);
    
    // Load sound mode from localStorage after mount
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(soundStorageKey);
      if (saved === 'piano' || saved === 'sine' || saved === 'organ') {
        setSoundModeState(saved);
      }
    }
  }, []);

  useEffect(() => {
    setSoundMode(soundMode);
    window.localStorage.setItem(soundStorageKey, soundMode);
  }, [soundMode]);

  useEffect(() => {
    async function loadSongs() {
      const supabase = getSupabase();
      
      if (!hasSupabaseEnv || !supabase) {
        setStatus('Ingen Supabase-tilkobling. Krever autentisering.');
        return;
      }

      const { data, error } = await supabase
        .from('songs')
        .select('id,title,voices,sequence,pitches,key_signature,tempo_bpm')
        .order('title', { ascending: true });

      if (error) {
        setStatus('Kunne ikke hente fra Supabase. Viser demo-data.');
        return;
      }

      if (data && data.length > 0) {
        setSongs(data as Song[]);
        setStatus('Koblet til Supabase.');
      } else {
        setStatus('Ingen sanger i databasen enda. Viser demo-data.');
      }
    }

    loadSongs();
  }, []);

  useEffect(() => {
    async function getSession() {
      const supabase = getSupabase();
      
      if (!hasSupabaseEnv || !supabase) {
        return;
      }

      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);

      // Listen for auth changes
      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
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
        keys: ['title', 'voices', 'key_signature'],
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
      <header className="flex items-center justify-between px-4 pt-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-indigo-600">KorTone</p>
          <h1 className="text-2xl font-bold">Digital stemmegaffel</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {status}
            {mounted && (
              <>
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
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SoundModeSelect value={soundMode} onChange={setSoundModeState} />
          <ThemeToggle />
        </div>
      </header>

      <SearchBar value={query} onChange={setQuery} />

      <section className="space-y-3 px-4 pt-4">
        {filteredSongs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </section>

      <TuningForkFab />
    </main>
  );
}
