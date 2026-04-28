"use client";

import Fuse from 'fuse.js';
import { useEffect, useMemo, useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { SongCard } from '@/components/SongCard';
import { SoundModeSelect } from '@/components/SoundModeSelect';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TuningForkFab } from '@/components/TuningForkFab';
import { setSoundMode } from '@/lib/audio';
import { fallbackSongs } from '@/lib/songData';
import { hasSupabaseEnv, supabase } from '@/lib/supabase';
import type { Song, SoundMode } from '@/lib/types';

const soundStorageKey = 'kortone-sound-mode';

export default function Home() {
  const [songs, setSongs] = useState<Song[]>(fallbackSongs);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Demo-data aktiv.');
  const [soundMode, setSoundModeState] = useState<SoundMode>(() => {
    if (typeof window === 'undefined') {
      return 'piano';
    }

    const saved = window.localStorage.getItem(soundStorageKey);
    if (saved === 'piano' || saved === 'sine' || saved === 'organ') {
      return saved;
    }

    return 'piano';
  });

  useEffect(() => {
    setSoundMode(soundMode);
    window.localStorage.setItem(soundStorageKey, soundMode);
  }, [soundMode]);

  useEffect(() => {
    async function loadSongs() {
      if (!hasSupabaseEnv || !supabase) {
        setStatus('Demo-data aktiv. Legg inn Supabase-verdier for live data.');
        return;
      }

      const { data, error } = await supabase
        .from('songs')
        .select('id,title,nickname,lyrics_snippet,tempo_bpm,sequence,pitches,dropbox_url')
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

  const fuse = useMemo(
    () =>
      new Fuse(songs, {
        keys: ['title', 'nickname', 'lyrics_snippet'],
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
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{status}</p>
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
