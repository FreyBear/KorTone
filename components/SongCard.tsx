"use client";

import { Play, Music } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { playSequence, playVoice, startMetronome, stopMetronome, isMetronomeRunning } from '@/lib/audio';
import type { Song, Voice } from '@/lib/types';
import { EditSongModal } from './EditSongModal';

const VOICE_ORDER = ['S1', 'S2', 'S', 'M1', 'M2', 'M', 'A1', 'A2', 'A', 'T1', 'T2', 'T', 'Bar', 'B1', 'B2', 'B'];
function sortVoices(voices: string[]): string[] {
  return [...voices].sort((a, b) => {
    const ai = VOICE_ORDER.indexOf(a);
    const bi = VOICE_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

type SongCardProps = {
  song: Song;
  isAdmin?: boolean;
  onSongUpdated?: () => void;
};

export function SongCard({ song, isAdmin = false, onSongUpdated }: SongCardProps) {
  const [activeVoice, setActiveVoice] = useState<Voice | null>(null);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const clearVoiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clearVoiceTimerRef.current) {
        clearTimeout(clearVoiceTimerRef.current);
      }
      if (isMetronomeActive) {
        stopMetronome();
      }
    };
  }, [isMetronomeActive]);

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
        onComplete: () => setActiveVoice(null),
      });
    } finally {
      setIsPlayingSequence(false);
      setActiveVoice(null);
    }
  }

  async function handleMetronome(): Promise<void> {
    if (isMetronomeActive) {
      stopMetronome();
      setIsMetronomeActive(false);
    } else if (song.tempo_bpm && song.tempo_bpm > 0) {
      await startMetronome(song.tempo_bpm);
      setIsMetronomeActive(true);
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">{song.title}</h2>
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">{song.voices}</span>
          {isAdmin && onSongUpdated && (
            <EditSongModal song={song} isAdmin={isAdmin} onSongUpdated={onSongUpdated} />
          )}
        </div>
      </div>
      {song.key_signature ? (
        <p className="mt-1 text-xs text-slate-500">{song.key_signature} · {song.tempo_bpm} BPM</p>
      ) : null}

      <div className="mt-4 space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sortVoices(Object.keys(song.pitches)).map((voice) => (
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
        {song.tempo_bpm && song.tempo_bpm > 0 && (
          <button
            type="button"
            onClick={handleMetronome}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              isMetronomeActive
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
            title={`Metronom: ${song.tempo_bpm} BPM`}
          >
            <Music size={14} />
            {isMetronomeActive ? 'Metronom av' : 'Metronom'}
          </button>
        )}
      </div>
    </article>
  );
}
