"use client";

import type { SoundMode } from '@/lib/types';

type SoundModeSelectProps = {
  value: SoundMode;
  onChange: (mode: SoundMode) => void;
};

export function SoundModeSelect({ value, onChange }: SoundModeSelectProps) {
  return (
    <label className="inline-flex min-w-0 items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <span>Lyd</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SoundMode)}
        className="max-w-[9.5rem] rounded bg-white px-1 text-xs font-medium text-slate-900 outline-none dark:bg-slate-900 dark:text-slate-100 dark:[color-scheme:dark]"
        aria-label="Velg lydtype"
      >
        <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100" value="grandPiano">Flygel (Sampler)</option>
        <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100" value="stringsPad">Stryk-pad</option>
        <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100" value="electricPiano">Elpiano</option>
        <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100" value="organ">Orgel</option>
        <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100" value="sine">Sinus</option>
      </select>
    </label>
  );
}
