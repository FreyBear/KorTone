"use client";

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    // Only run on client after mount
    const storedTheme = window.localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDark(storedTheme ? storedTheme === 'dark' : prefersDark);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    window.localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark, mounted]);

  function toggle() {
    setDark((current) => !current);
  }

  // Render a placeholder during SSR/SSG to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        aria-label="Bytt tema"
        disabled
      >
        <Moon size={14} />
        Mork
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      aria-label="Bytt tema"
    >
      {dark ? <Sun size={14} /> : <Moon size={14} />}
      {dark ? 'Lys' : 'Mork'}
    </button>
  );
}
