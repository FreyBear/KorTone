"use client";

import type { SoundMode } from '@/lib/types';

type SoundModeSelectProps = {
  value: SoundMode;
  onChange: (mode: SoundMode) => void;
};

export function SoundModeSelect({ value, onChange }: SoundModeSelectProps) {
  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <span>Lyd</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SoundMode)}
        className="bg-transparent text-xs font-medium outline-none"
        aria-label="Velg lydtype"
      >
        <option value="piano">Piano</option>
        <option value="sine">Sinus</option>
        <option value="organ">Orgel</option>
      </select>
    </label>
  );
}
