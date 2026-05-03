"use client";

import { useEffect, useRef, useState } from 'react';
import { Delete, Pause, X } from 'lucide-react';
import { holdNote, releaseNote, stopAllPlayback } from '@/lib/audio';

const START_OCTAVE = 4;
const END_OCTAVE = 5;

const TOTAL_OCTAVES = END_OCTAVE - START_OCTAVE + 1;
const GRID_COLUMNS_PER_OCTAVE = 14;
const TOTAL_GRID_COLUMNS = TOTAL_OCTAVES * GRID_COLUMNS_PER_OCTAVE;

type PianoKey = {
  label: string;
  note: string;
  isHalf: boolean;
  col: number;
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
      { label: `Gb${octave}`, note: `Gb${octave}`, isHalf: true, col: offset + 8 },
      { label: `Ab${octave}`, note: `Ab${octave}`, isHalf: true, col: offset + 10 },
      { label: `B${octave}`, note: `Bb${octave}`, isHalf: true, col: offset + 12 },
    );
  }
  return keys;
}

const NATURAL_KEYS = buildNaturalKeys(START_OCTAVE, END_OCTAVE);
const HALF_KEYS = buildHalfKeys(START_OCTAVE, END_OCTAVE);

export function PianoIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      width="22"
      height="22"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="4" width="3.8" height="16" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6.8" y="4" width="3.8" height="16" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.6" y="4" width="3.8" height="16" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="16.4" y="4" width="3.8" height="16" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="5.2" y="4" width="2.4" height="10" rx="1" fill="currentColor" />
      <rect x="10" y="4" width="2.4" height="10" rx="1" fill="currentColor" />
      <rect x="14.8" y="4" width="2.4" height="10" rx="1" fill="currentColor" />
    </svg>
  );
}

type PianoSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onActivated?: () => void;
  title?: string;
  onNoteInput?: (noteToken: string) => void;
  durationOptions?: Array<'8n' | '4n' | '2n' | '1n'>;
  selectedDuration?: '8n' | '4n' | '2n' | '1n';
  onSelectDuration?: (duration: '8n' | '4n' | '2n' | '1n') => void;
  onBackspace?: () => void;
  onPauseInput?: () => void;
  zIndexClassName?: string;
};

export function PianoSheet({
  isOpen,
  onClose,
  onActivated,
  title = `Piano — C${START_OCTAVE}–H${END_OCTAVE} (C5 i midten)`,
  onNoteInput,
  durationOptions,
  selectedDuration,
  onSelectDuration,
  onBackspace,
  onPauseInput,
  zIndexClassName = 'z-40',
}: PianoSheetProps) {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragOffsetY = useRef(0);

  useEffect(() => {
    if (!isOpen) {
      setActiveNotes(new Set());
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (!container || container.scrollWidth <= container.clientWidth) {
        return;
      }

      const target = container.querySelector<HTMLButtonElement>('button[data-note="C5"]');
      if (!target) {
        return;
      }

      const targetCenter = target.offsetLeft + target.offsetWidth / 2;
      const desiredScrollLeft = Math.max(
        0,
        Math.min(targetCenter - container.clientWidth / 2, container.scrollWidth - container.clientWidth)
      );

      container.scrollTo({ left: desiredScrollLeft, behavior: 'smooth' });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isOpen]);

  function handleClose() {
    setActiveNotes(new Set());
    if (panelRef.current) {
      panelRef.current.style.transform = '';
    }
    onClose();
  }

  async function handleKeyPress(note: string) {
    if (activeNotes.has(note)) {
      return;
    }

    stopAllPlayback();
    onActivated?.();
    await holdNote(note);
    onNoteInput?.(note);

    setActiveNotes((prev) => new Set(prev).add(note));
  }

  async function handleKeyRelease(note: string) {
    if (!activeNotes.has(note)) {
      return;
    }

    await releaseNote(note);

    setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  }

  function handleDragStart(e: React.TouchEvent) {
    dragStartY.current = e.touches[0].clientY;
    dragOffsetY.current = 0;
    if (panelRef.current) {
      panelRef.current.style.transition = 'none';
    }
  }

  function handleDragMove(e: React.TouchEvent) {
    if (dragStartY.current === null || !panelRef.current) {
      return;
    }

    const delta = Math.max(0, e.touches[0].clientY - dragStartY.current);
    dragOffsetY.current = delta;
    panelRef.current.style.transform = `translateY(${delta}px)`;
  }

  function handleDragEnd() {
    if (!panelRef.current) {
      return;
    }

    panelRef.current.style.transition = '';
    if (dragOffsetY.current > 80) {
      handleClose();
    } else {
      panelRef.current.style.transform = '';
    }

    dragStartY.current = null;
  }

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
      : 'bg-slate-600 text-slate-100 hover:bg-slate-500 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900';

    return (
      <button
        key={key.note}
        type="button"
        data-note={key.note}
        style={{ gridColumn: `${key.col} / span 2` }}
        className={`${baseClasses} ${key.isHalf ? 'h-12' : 'h-16'} ${key.isHalf ? halfClasses : naturalClasses}`}
        onMouseDown={() => void handleKeyPress(key.note)}
        onMouseUp={() => void handleKeyRelease(key.note)}
        onMouseLeave={() => void handleKeyRelease(key.note)}
        onTouchStart={(e) => {
          e.preventDefault();
          void handleKeyPress(key.note);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          void handleKeyRelease(key.note);
        }}
        aria-label={key.label}
        aria-pressed={isActive}
      >
        {key.label}
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      className={`fixed inset-x-0 bottom-0 ${zIndexClassName} transition-transform duration-300 ease-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      <div className="rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div
          className="flex flex-col items-center cursor-grab touch-none pt-3 pb-1 active:cursor-grabbing sm:cursor-default"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        <div className="space-y-2 px-4 pb-2">
          <div className="flex items-center justify-between gap-3">
            <span className="select-none text-sm font-medium text-slate-500 dark:text-slate-400">
              {title}
            </span>
            <div className="flex items-center gap-2">
              {onPauseInput && (
                <button
                  type="button"
                  onClick={onPauseInput}
                  className="inline-flex h-8 items-center gap-1 rounded-full border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Pause size={14} />
                  Pause
                </button>
              )}
              {onBackspace && (
                <button
                  type="button"
                  onClick={onBackspace}
                  className="inline-flex h-8 items-center gap-1 rounded-full border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Delete size={14} />
                  Backspace
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="hidden h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 sm:flex"
                aria-label="Lukk piano"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {durationOptions && durationOptions.length > 0 && onSelectDuration && selectedDuration && (
            <div className="flex flex-wrap items-center gap-2">
              {durationOptions.map((duration) => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => onSelectDuration(duration)}
                  className={`inline-flex h-8 items-center justify-center rounded-full border px-3 text-xs font-semibold transition ${
                    selectedDuration === duration
                      ? 'border-indigo-500 bg-indigo-500 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  aria-pressed={selectedDuration === duration}
                >
                  {duration}
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={scrollContainerRef} className="overflow-x-auto px-3 pb-6 sm:px-6">
          <div className="min-w-[48rem] sm:min-w-0">
            <div
              className="mb-1 grid"
              style={{ gridTemplateColumns: `repeat(${TOTAL_GRID_COLUMNS}, minmax(0, 1fr))`, gap: '3px' }}
            >
              {HALF_KEYS.map(renderKey)}
            </div>
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
  );
}