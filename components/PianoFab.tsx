"use client";

import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { holdNote, releaseNote, stopAllPlayback } from '@/lib/audio';

// ─── Octave configuration ─────────────────────────────────────────────────────
// Keep range configurable for future tweaks without changing rendering logic.
const START_OCTAVE = 4;
const END_OCTAVE = 5;

const TOTAL_OCTAVES = END_OCTAVE - START_OCTAVE + 1;
const GRID_COLUMNS_PER_OCTAVE = 14;
const TOTAL_GRID_COLUMNS = TOTAL_OCTAVES * GRID_COLUMNS_PER_OCTAVE;

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

function buildNaturalKeys(startOctave: number, endOctave: number): PianoKey[] {
  const keys: PianoKey[] = [];
  for (let octave = startOctave; octave <= endOctave; octave += 1) {
    const offset = (octave - startOctave) * GRID_COLUMNS_PER_OCTAVE;
    keys.push(
      { label: `C${octave}`, note: `C${octave}`, isHalf: false, col: offset + 1 },
      { label: `D${octave}`, note: `D${octave}`, isHalf: false, col: offset + 3 },
      { label: `E${octave}`, note: `E${octave}`, isHalf: false, col: offset + 5 },
      { label: `F${octave}`, note: `F${octave}`, isHalf: false, col: offset + 7 },
      { label: `G${octave}`, note: `G${octave}`, isHalf: false, col: offset + 9 },
      { label: `A${octave}`, note: `A${octave}`, isHalf: false, col: offset + 11 },
      // H in Norwegian = B in international (Tone.js)
      { label: `H${octave}`, note: `B${octave}`, isHalf: false, col: offset + 13 },
    );
  }
  return keys;
}

function buildHalfKeys(startOctave: number, endOctave: number): PianoKey[] {
  const keys: PianoKey[] = [];
  for (let octave = startOctave; octave <= endOctave; octave += 1) {
    const offset = (octave - startOctave) * GRID_COLUMNS_PER_OCTAVE;
    keys.push(
      { label: `Db${octave}`, note: `Db${octave}`, isHalf: true, col: offset + 2 },
      { label: `Eb${octave}`, note: `Eb${octave}`, isHalf: true, col: offset + 4 },
      // No half tone between E and F → col 6 intentionally empty
      { label: `Gb${octave}`, note: `Gb${octave}`, isHalf: true, col: offset + 8 },
      { label: `Ab${octave}`, note: `Ab${octave}`, isHalf: true, col: offset + 10 },
      // B in Norwegian = Bb in international (Tone.js)
      { label: `B${octave}`, note: `Bb${octave}`, isHalf: true, col: offset + 12 },
      // No half tone above H → col 14 intentionally empty
    );
  }
  return keys;
}

const NATURAL_KEYS = buildNaturalKeys(START_OCTAVE, END_OCTAVE);
const HALF_KEYS = buildHalfKeys(START_OCTAVE, END_OCTAVE);

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
              Piano — C{START_OCTAVE}–H{END_OCTAVE} (C5 i midten)
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

          {/* Keys — keep keys large on mobile by allowing horizontal scrolling */}
          <div className="px-3 pb-6 sm:px-6 overflow-x-auto">
            <div className="min-w-[48rem] sm:min-w-0">
            {/* Row 1: half tones (Db, Eb, gap, Gb, Ab, B) */}
            <div
              className="grid mb-1"
              style={{ gridTemplateColumns: `repeat(${TOTAL_GRID_COLUMNS}, minmax(0, 1fr))`, gap: '3px' }}
            >
              {HALF_KEYS.map(renderKey)}
            </div>

            {/* Row 2: natural tones (C, D, E, F, G, A, H) */}
            <div
              className="grid"
              style={{ gridTemplateColumns: `repeat(${TOTAL_GRID_COLUMNS}, minmax(0, 1fr))`, gap: '3px' }}
            >
              {NATURAL_KEYS.map(renderKey)}
            </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
