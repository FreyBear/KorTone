"use client";

import { AudioLines } from 'lucide-react';
import { playTuningForkA } from '@/lib/audio';

type TuningForkFabProps = {
  onPlayed?: () => void;
};

export function TuningForkFab({ onPlayed }: TuningForkFabProps) {
  async function handleClick() {
    await playTuningForkA();
    onPlayed?.();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-6 right-5 z-30 h-14 w-14 rounded-full bg-indigo-600 text-white shadow-xl transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
      aria-label="Spill stemmegaffel A440"
      title="Stemmegaffel A440"
    >
      <span className="sr-only">Spill A 440Hz</span>
      <AudioLines className="mx-auto" size={24} />
    </button>
  );
}
