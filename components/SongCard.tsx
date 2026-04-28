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

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {orderedVoices.map((voice) => (
          <button
            key={voice}
            type="button"
            onClick={() => handlePlayVoice(voice)}
            aria-pressed={activeVoice === voice}
            className={`min-h-11 min-w-11 rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
              activeVoice === voice
                ? 'scale-[1.03] border-indigo-500 bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300 dark:border-indigo-400 dark:bg-indigo-500 dark:ring-indigo-700'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {voice}
          </button>
        ))}

        <button
          type="button"
          onClick={handlePlaySequence}
          disabled={isPlayingSequence}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-75"
        >
          <Play size={14} />
          {isPlayingSequence ? 'Spiller...' : 'Spill sekvens'}
        </button>
      </div>
    </article>
  );
}
