"use client";

import { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
  message: string;
  type?: ToastType;
  onClose: () => void;
  durationMs?: number;
};

const TOAST_STYLE: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-900/30 dark:text-emerald-100',
  error: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800/60 dark:bg-rose-900/30 dark:text-rose-100',
  info: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800/60 dark:bg-sky-900/30 dark:text-sky-100',
};

export function Toast({ message, type = 'info', onClose, durationMs = 3200 }: ToastProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(onClose, durationMs);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [durationMs, onClose]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] w-[min(24rem,calc(100vw-2rem))]">
      <div className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg ${TOAST_STYLE[type]}`} role="status" aria-live="polite">
        <div className="flex items-start justify-between gap-3">
          <p>{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-current/70 transition hover:text-current"
            aria-label="Lukk varsel"
          >
            x
          </button>
        </div>
      </div>
    </div>
  );
}