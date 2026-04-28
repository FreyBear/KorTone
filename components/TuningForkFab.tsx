"use client";

import { AudioLines } from 'lucide-react';
import { useRef } from 'react';
import { holdTuningForkA, releaseTuningForkA } from '@/lib/audio';

type TuningForkFabProps = {
  onPlayed?: () => void;
};

export function TuningForkFab({ onPlayed }: TuningForkFabProps) {
  const isActiveRef = useRef(false);

  async function handleMouseDown() {
    isActiveRef.current = true;
    await holdTuningForkA();
    onPlayed?.();
  }

  async function handleMouseUp() {
    isActiveRef.current = false;
    await releaseTuningForkA();
  }

  async function handleTouchStart(e: React.TouchEvent) {
    e.preventDefault();
    isActiveRef.current = true;
    await holdTuningForkA();
    onPlayed?.();
  }

  async function handleTouchEnd() {
    isActiveRef.current = false;
    await releaseTuningForkA();
  }

  return (
    <button
      type="button"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed bottom-6 right-5 z-30 h-14 w-14 rounded-full bg-indigo-600 text-white shadow-xl transition hover:bg-indigo-500 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
      aria-label="Hold for stemmegaffel A440"
      title="Hold knappen for A 440Hz"
    >
      <span className="sr-only">Hold for A 440Hz</span>
      <AudioLines className="mx-auto" size={24} />
    </button>
  );
}
