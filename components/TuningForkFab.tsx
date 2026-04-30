"use client";

import { useRef } from 'react';
import { holdTuningForkA, releaseTuningForkA } from '@/lib/audio';

type TuningForkFabProps = {
  onPlayed?: () => void;
};

function TuningForkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
      width="24"
      height="24"
    >
      <path
        d="M8 3V9M16 3V9M8 3H16M8 9C8 11.8 9.7 13.8 12 14.6V19.2M16 9C16 11.8 14.3 13.8 12 14.6M12 19.2V21M10.5 21H13.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
      <TuningForkIcon />
    </button>
  );
}
