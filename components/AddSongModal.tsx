"use client";

import { useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { Toast } from '@/components/Toast';

type AddSongModalProps = {
  canEdit: boolean;
  onSongAdded: () => void;
};

type SongFormData = {
  title: string;
  nickname: string;
  voices: string;
  sequence: string;
  key_signature: string;
  tempo_bpm: number;
  pitches: string;
};

const defaultFormData: SongFormData = {
  title: '',
  nickname: '',
  voices: 'SATB',
  sequence: '',
  key_signature: '',
  tempo_bpm: 120,
  pitches: JSON.stringify({ S: 'A', A: 'F', T: 'A', B: 'F' }, null, 2),
};

export function AddSongModal({ canEdit, onSongAdded }: AddSongModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<SongFormData>(defaultFormData);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    setToastMessage(message);
    setToastType(type);
  }

  if (!canEdit) return null;

  function handleOpen() {
    setFormData(defaultFormData);
    setIsOpen(true);
  }

  async function handleSave() {
    const normalizedTitle = formData.title.trim();
    const normalizedVoices = formData.voices.trim() || 'SATB';

    if (!normalizedTitle) {
      showToast('Tittel er paakrevd', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const supabase = getSupabase();
      if (!supabase) {
        showToast('Ingen Supabase-tilkobling', 'error');
        setIsSaving(false);
        return;
      }

      const { data: duplicateSong, error: duplicateCheckError } = await supabase
        .from('songs')
        .select('id')
        .ilike('title', normalizedTitle)
        .eq('voices', normalizedVoices)
        .maybeSingle();

      if (duplicateCheckError && duplicateCheckError.code !== 'PGRST116') {
        showToast(`Kunne ikke sjekke duplikat: ${duplicateCheckError.message}`, 'error');
        setIsSaving(false);
        return;
      }

      if (duplicateSong) {
        showToast('En sang med samme tittel og stemmesett finnes allerede', 'error');
        setIsSaving(false);
        return;
      }

      const sequenceArray = formData.sequence.trim().split(/\s+/).filter((s) => s.length > 0);

      let pitchesObj;
      try {
        pitchesObj = JSON.parse(formData.pitches);
      } catch {
        showToast('Ugyldig JSON i pitches-feltet', 'error');
        setIsSaving(false);
        return;
      }

      const { error } = await supabase.from('songs').insert({
        title: normalizedTitle,
        nickname: formData.nickname.trim() || null,
        voices: normalizedVoices,
        sequence: sequenceArray,
        pitches: pitchesObj,
        key_signature: formData.key_signature.trim() || null,
        tempo_bpm: parseInt(formData.tempo_bpm.toString(), 10) || 120,
      });

      if (error) {
        showToast(`Kunne ikke opprette sang: ${error.message}`, 'error');
        setIsSaving(false);
        return;
      }

      showToast('Sang opprettet', 'success');
      setIsSaving(false);
      setIsOpen(false);
      await onSongAdded();
    } catch (err) {
      console.error('Unexpected error while adding song:', err);
      showToast('En uventet feil oppstod. Se konsollen for detaljer.', 'error');
      setIsSaving(false);
    }
  }

  return (
    <>
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
        title="Legg til ny sang"
      >
        <Plus size={16} />
        Ny sang
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Legg til ny sang
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tittel
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="F.eks. Kveldssang"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Kallenavn <span className="text-xs text-slate-500">(søkbart, men vises ikke)</span>
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="Valgfritt søkeord"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Stemmer (SATB, TTBB, Unison, etc.)
                </label>
                <input
                  type="text"
                  value={formData.voices}
                  onChange={(e) => setFormData({ ...formData, voices: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Sekvens (space-separerte noter, f.eks. &quot;C4:2n C4 A4:4n R:4n&quot;)
                </label>
                <input
                  type="text"
                  value={formData.sequence}
                  onChange={(e) => setFormData({ ...formData, sequence: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="C4:2n C4 A4:4n R:4n"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Toneart
                </label>
                <input
                  type="text"
                  value={formData.key_signature}
                  onChange={(e) => setFormData({ ...formData, key_signature: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="F-dur, c-moll, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tempo (BPM)
                </label>
                <input
                  type="number"
                  value={formData.tempo_bpm}
                  onChange={(e) => setFormData({ ...formData, tempo_bpm: parseInt(e.target.value, 10) || 120 })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  min="30"
                  max="300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Pitches (JSON med stemme-mapping)
                </label>
                <textarea
                  value={formData.pitches}
                  onChange={(e) => setFormData({ ...formData, pitches: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  rows={6}
                  placeholder='{"S":"A","A":"F","T":"A","B":"F"}'
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                <Save size={16} />
                {isSaving ? 'Lagrer...' : 'Opprett sang'}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}