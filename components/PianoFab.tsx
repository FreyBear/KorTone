"use client";

import { useState } from 'react';
import { PianoIcon, PianoSheet } from '@/components/PianoSheet';

// ─── Component ────────────────────────────────────────────────────────────────
type PianoFabProps = {
  /** Called when the piano activates so the parent can stop other playback. */
  onActivated?: () => void;
};

export function PianoFab({ onActivated }: PianoFabProps) {
  const [isOpen, setIsOpen] = useState(false);

  function togglePanel() {
    setIsOpen((current) => !current);
  }

  return (
    <>
      <button
        type="button"
        onClick={togglePanel}
        className={`fixed bottom-6 right-[5.5rem] z-30 h-14 w-14 rounded-full shadow-xl transition
          hover:bg-indigo-500 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
          ${isOpen ? 'bg-indigo-500' : 'bg-indigo-600'} text-white`}
        aria-label={isOpen ? 'Lukk piano' : 'Åpne piano'}
        title="Piano — en oktav"
      >
        <span className="flex items-center justify-center">
          <PianoIcon />
        </span>
      </button>
      <PianoSheet isOpen={isOpen} onClose={() => setIsOpen(false)} onActivated={onActivated} />
    </>
  );
}
