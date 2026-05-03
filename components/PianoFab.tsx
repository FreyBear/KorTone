"use client";

import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { holdNote, releaseNote, stopAllPlayback } from '@/lib/audio';

// ─── Octave configuration ─────────────────────────────────────────────────────
// Change OCTAVE to shift the entire keyboard range (e.g. 3 for C3–B3).
const OCTAVE = 4;

// ─── Key definitions ──────────────────────────────────────────────────────────
// Norwegian note system:
//   H = international B (natural)
//   B = international Bb (flat)
// Each key maps a display label to the Tone.js note name and a 14-column
// grid position (two adjacent columns per key; see CSS grid layout below).
type PianoKey = {
  label: string;   // Norwegian display label shown on the button
  note: string;    // Tone.js note name (international)
  isHalf: boolean; // Distinguishes half-tone keys visually
  col: number;     // Grid column start (1-indexed, 14-column grid)
};

// Natural tones — bottom row
const NATURAL_KEYS: PianoKey[] = [
  { label: `C${OCTAVE}`,  note: `C${OCTAVE}`,  isHalf: false, col: 1  },
  { label: `D${OCTAVE}`,  note: `D${OCTAVE}`,  isHalf: false, col: 3  },
  { label: `E${OCTAVE}`,  note: `E${OCTAVE}`,  isHalf: false, col: 5  },
  { label: `F${OCTAVE}`,  note: `F${OCTAVE}`,  isHalf: false, col: 7  },
  { label: `G${OCTAVE}`,  note: `G${OCTAVE}`,  isHalf: false, col: 9  },
  { label: `A${OCTAVE}`,  note: `A${OCTAVE}`,  isHalf: false, col: 11 },
  // H in Norwegian = B in international (Tone.js)
  { label: `H${OCTAVE}`,  note: `B${OCTAVE}`,  isHalf: false, col: 13 },
];

// Half tones — top row (b-names only in Norwegian)
// Positions are offset so Db sits between C and D, Eb between D and E, etc.
const HALF_KEYS: PianoKey[] = [
  { label: `Db${OCTAVE}`, note: `Db${OCTAVE}`, isHalf: true, col: 2  },
  { label: `Eb${OCTAVE}`, note: `Eb${OCTAVE}`, isHalf: true, col: 4  },
  // No half tone between E and F → col 6 intentionally empty
  { label: `Gb${OCTAVE}`, note: `Gb${OCTAVE}`, isHalf: true, col: 8  },
  { label: `Ab${OCTAVE}`, note: `Ab${OCTAVE}`, isHalf: true, col: 10 },
  // B in Norwegian = Bb in international (Tone.js)
  { label: `B${OCTAVE}`,  note: `Bb${OCTAVE}`, isHalf: true, col: 12 },
  // No half tone above H → col 14 intentionally empty
];

// ─── Piano icon ───────────────────────────────────────────────────────────────
function PianoIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      width="22"
      height="22"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Four white keys */}
      <rect x="2"    y="4" width="3.8" height="16" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6.8"  y="4" width="3.8" height="16" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.6" y="4" width="3.8" height="16" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="16.4" y="4" width="3.8" height="16" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      {/* Three black keys */}
      <rect x="5.2"  y="4" width="2.4" height="10" rx="1" fill="currentColor" />
      <rect x="10"   y="4" width="2.4" height="10" rx="1" fill="currentColor" />
      <rect x="14.8" y="4" width="2.4" height="10" rx="1" fill="currentColor" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
type PianoFabProps = {
  /** Called when the piano activates so the parent can stop other playback. */
  onActivated?: () => void;
};

export function PianoFab({ onActivated }: PianoFabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

  // Refs for drag-to-close gesture (mobile only)
  const panelRef        = useRef<HTMLDivElement>(null);
  const dragStartY      = useRef<number | null>(null);
  const dragOffsetY     = useRef<number>(0);

  // ── Panel open / close ──────────────────────────────────────────────────────
  function openPanel() {
    stopAllPlayback(); // Stop sequences, metronome, tuning fork
    onActivated?.();
    setIsOpen(true);
  }

  function closePanel() {
    setIsOpen(false);
    if (panelRef.current) {
      panelRef.current.style.transform = '';
    }
  }

  function togglePanel() {
    if (isOpen) {
      closePanel();
    } else {
      openPanel();
    }
  }

  // ── Piano key interaction ───────────────────────────────────────────────────
  async function handleKeyPress(toneJsNote: string) {
    if (activeNotes.has(toneJsNote)) return;
    // Stop other playback on first key interaction each session
    stopAllPlayback();
    onActivated?.();
    await holdNote(toneJsNote);
    setActiveNotes((prev) => new Set(prev).add(toneJsNote));
  }

  async function handleKeyRelease(toneJsNote: string) {
    if (!activeNotes.has(toneJsNote)) return;
    await releaseNote(toneJsNote);
    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(toneJsNote);
      return next;
    });
  }

  // ── Drag to close (mobile touch) ────────────────────────────────────────────
  function handleDragStart(e: React.TouchEvent) {
    dragStartY.current = e.touches[0].clientY;
    dragOffsetY.current = 0;
    if (panelRef.current) {
      panelRef.current.style.transition = 'none';
    }
  }

  function handleDragMove(e: React.TouchEvent) {
    if (dragStartY.current === null || !panelRef.current) return;
    const delta = Math.max(0, e.touches[0].clientY - dragStartY.current);
    dragOffsetY.current = delta;
    panelRef.current.style.transform = `translateY(${delta}px)`;
  }

  function handleDragEnd() {
    if (!panelRef.current) return;
    panelRef.current.style.transition = '';
    if (dragOffsetY.current > 80) {
      closePanel();
    } else {
      panelRef.current.style.transform = '';
    }
    dragStartY.current = null;
  }

  // ── Key renderer ────────────────────────────────────────────────────────────
  function renderKey(key: PianoKey) {
    const isActive = activeNotes.has(key.note);

    const baseClasses =
      'rounded-lg font-bold transition-all duration-150 select-none cursor-pointer ' +
      'flex items-center justify-center overflow-hidden text-[10px] sm:text-xs ' +
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400';

    const naturalClasses = isActive
      ? 'bg-indigo-500 text-white ring-2 ring-indigo-300 dark:ring-indigo-700 shadow-md scale-[0.97]'
      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 ' +
        'dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700';

    const halfClasses = isActive
      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 dark:ring-indigo-500 shadow-md scale-[0.97]'
      : 'bg-slate-600 text-slate-100 hover:bg-slate-500 ' +
        'dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900';

    const heightClass = key.isHalf ? 'h-12' : 'h-16';

    return (
      <button
        key={key.note}
        type="button"
        style={{ gridColumn: `${key.col} / span 2` }}
        className={`${baseClasses} ${heightClass} ${key.isHalf ? halfClasses : naturalClasses}`}
        onMouseDown={() => handleKeyPress(key.note)}
        onMouseUp={() => handleKeyRelease(key.note)}
        onMouseLeave={() => handleKeyRelease(key.note)}
        onTouchStart={(e) => { e.preventDefault(); void handleKeyPress(key.note); }}
        onTouchEnd={(e) => { e.preventDefault(); void handleKeyRelease(key.note); }}
        aria-label={key.label}
        aria-pressed={isActive}
      >
        {key.label}
      </button>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Piano toggle button — positioned to the left of TuningForkFab */}
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

      {/* Bottom sheet panel */}
      <div
        ref={panelRef}
        className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}
        aria-hidden={!isOpen}
      >
        <div className="bg-white dark:bg-slate-900 rounded-t-2xl border-t border-slate-200 dark:border-slate-700 shadow-2xl">

          {/* Drag handle — touch target for swipe-to-close on mobile */}
          <div
            className="flex flex-col items-center pt-3 pb-1 cursor-grab active:cursor-grabbing sm:cursor-default touch-none"
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 select-none">
              Piano — C{OCTAVE}–H{OCTAVE}
            </span>
            {/* Close button — visible on desktop/tablet */}
            <button
              type="button"
              onClick={closePanel}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full
                text-slate-400 hover:text-slate-600 hover:bg-slate-100
                dark:hover:bg-slate-800 dark:hover:text-slate-200
                transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Lukk piano"
            >
              <X size={18} />
            </button>
          </div>

          {/* Keys — 14-column grid preserving piano intervals */}
          <div className="px-3 pb-6 sm:px-6">
            {/* Row 1: half tones (Db, Eb, gap, Gb, Ab, B) */}
            <div
              className="grid mb-1"
              style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))', gap: '3px' }}
            >
              {HALF_KEYS.map(renderKey)}
            </div>

            {/* Row 2: natural tones (C, D, E, F, G, A, H) */}
            <div
              className="grid"
              style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))', gap: '3px' }}
            >
              {NATURAL_KEYS.map(renderKey)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
