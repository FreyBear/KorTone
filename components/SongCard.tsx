"use client";

import { Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { playSequence, playVoice } from '@/lib/audio';
import type { Song, Voice } from '@/lib/types';

const orderedVoices: Voice[] = ['S', 'A', 'T', 'B'];

type SongCardProps = {
  song: Song;
};

export function SongCard({ song }: SongCardProps) {
  const [activeVoice, setActiveVoice] = useState<Voice | null>(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const clearVoiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clearVoiceTimerRef.current) {
        clearTimeout(clearVoiceTimerRef.current);
      }
    };
  }, []);

  async function handlePlayVoice(voice: Voice): Promise<void> {
    if (isPlayingSequence) {
      return;
    }

    setActiveVoice(voice);
    await playVoice(voice, song.pitches[voice]);

    if (clearVoiceTimerRef.current) {
      clearTimeout(clearVoiceTimerRef.current);
    }

    clearVoiceTimerRef.current = setTimeout(() => {
      setActiveVoice((current) => (current === voice ? null : current));
    }, 480);
  }

  async function handlePlaySequence(): Promise<void> {
    if (isPlayingSequence) {
      return;
    }

    setIsPlayingSequence(true);
    try {
      await playSequence(song.sequence, song.pitches, song.tempo_bpm, {
        onVoiceStart: (voice) => setActiveVoice(voice),
        onComplete: () => setActiveVoice(null),
      });
    } finally {
      setIsPlayingSequence(false);
      setActiveVoice(null);
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">{song.title}</h2>
      {song.nickname ? <p className="mt-1 text-xs text-slate-500">{song.nickname}</p> : null}
      {song.lyrics_snippet ? (
        <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{song.lyrics_snippet}</p>
      ) : null}

      <div className="mt-4 space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {orderedVoices.map((voice) => (
            <button
              key={voice}
              type="button"
              onClick={() => handlePlayVoice(voice)}
              aria-pressed={activeVoice === voice}
              className={`h-11 w-11 shrink-0 rounded-lg border text-sm font-semibold transition-colors ${
                activeVoice === voice
                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg ring-4 ring-emerald-200 dark:border-emerald-400 dark:bg-emerald-500 dark:ring-emerald-900'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {voice}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handlePlaySequence}
          disabled={isPlayingSequence}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-75 sm:w-auto"
        >
          <Play size={14} />
          {isPlayingSequence ? 'Spiller...' : 'Spill sekvens'}
        </button>
      </div>

      <p className="mt-3 min-h-5 text-xs font-medium text-emerald-700 dark:text-emerald-300" aria-live="polite">
        {activeVoice ? `Spiller na: ${activeVoice}` : '\u00a0'}
      </p>
    </article>
  );
}
