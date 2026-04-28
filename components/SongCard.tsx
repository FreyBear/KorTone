"use client";

import { Play } from 'lucide-react';
import { playSequence, playVoice } from '@/lib/audio';
import type { Song, Voice } from '@/lib/types';

const orderedVoices: Voice[] = ['S', 'A', 'T', 'B'];

type SongCardProps = {
  song: Song;
};

export function SongCard({ song }: SongCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">{song.title}</h2>
      {song.nickname ? <p className="mt-1 text-xs text-slate-500">{song.nickname}</p> : null}
      {song.lyrics_snippet ? (
        <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{song.lyrics_snippet}</p>
      ) : null}

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {orderedVoices.map((voice) => (
          <button
            key={voice}
            type="button"
            onClick={() => playVoice(voice, song.pitches[voice])}
            className="min-h-11 min-w-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {voice}
          </button>
        ))}

        <button
          type="button"
          onClick={() => playSequence(song.sequence, song.pitches, song.tempo_bpm)}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          <Play size={14} />
          Spill sekvens
        </button>
      </div>
    </article>
  );
}
