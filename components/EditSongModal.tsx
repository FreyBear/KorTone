"use client";

import { useRef, useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { PianoIcon, PianoSheet } from '@/components/PianoSheet';
import type { Song, Voice } from '@/lib/types';
import { getSupabase } from '@/lib/supabase';
import { Toast } from '@/components/Toast';

type EditSongModalProps = {
  song: Song;
  isAdmin: boolean;
  onSongUpdated: () => void;
};

// Helper: Sort pitches in musical order (S, A, T, B)
function sortPitches(pitches: Partial<Record<Voice, string>>): string {
  const voiceOrder: Voice[] = ['S', 'M', 'A', 'T', 'B'];
  const sorted: Partial<Record<Voice, string>> = {};
  
  voiceOrder.forEach(voice => {
    if (pitches[voice] !== undefined) {
      sorted[voice] = pitches[voice];
    }
  });
  
  return JSON.stringify(sorted, null, 2);
}

export function EditSongModal({ song, isAdmin, onSongUpdated }: EditSongModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSequencePianoOpen, setIsSequencePianoOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [formData, setFormData] = useState({
    title: song.title,
    nickname: song.nickname || '',
    voices: song.voices,
    sequence: song.sequence.join(' '),
    key_signature: song.key_signature || '',
    tempo_bpm: song.tempo_bpm,
    pitches: sortPitches(song.pitches),
  });
  const sequenceInteractionIndexRef = useRef<Map<number, number>>(new Map());

  if (!isAdmin) return null;

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    setToastMessage(message);
    setToastType(type);
  }

  function handleOpen() {
    // Reset form data to current song values when opening
    setFormData({
      title: song.title,
      nickname: song.nickname || '',
      voices: song.voices,
      sequence: song.sequence.join(' '),
      key_signature: song.key_signature || '',
      tempo_bpm: song.tempo_bpm,
      pitches: sortPitches(song.pitches),
    });
    sequenceInteractionIndexRef.current.clear();
    setIsSequencePianoOpen(false);
    setIsOpen(true);
  }

  function closeModal() {
    sequenceInteractionIndexRef.current.clear();
    setIsSequencePianoOpen(false);
    setIsOpen(false);
  }

  function appendSequenceToken(token: string) {
    setFormData((current) => ({
      ...current,
      sequence: current.sequence.trim() ? `${current.sequence.trim()} ${token}` : token,
    }));
  }

  function removeLastSequenceToken() {
    setFormData((current) => {
      const tokens = current.sequence.trim().split(/\s+/).filter((token) => token.length > 0);
      const removedIndex = tokens.length - 1;
      tokens.pop();

      if (removedIndex >= 0) {
        sequenceInteractionIndexRef.current.forEach((index, interactionId) => {
          if (index === removedIndex) {
            sequenceInteractionIndexRef.current.delete(interactionId);
          }
        });
      }

      return {
        ...current,
        sequence: tokens.join(' '),
      };
    });
  }

  function handleDurationNoteInput(payload: {
    interactionId: number;
    note: string;
    duration: '4n' | '2n' | '1n';
    isUpdate: boolean;
  }) {
    const tokenValue = `${payload.note}:${payload.duration}`;

    setFormData((current) => {
      const tokens = current.sequence.trim().split(/\s+/).filter((token) => token.length > 0);

      if (!payload.isUpdate) {
        const newIndex = tokens.length;
        tokens.push(tokenValue);
        sequenceInteractionIndexRef.current.set(payload.interactionId, newIndex);
      } else {
        const targetIndex = sequenceInteractionIndexRef.current.get(payload.interactionId);
        if (targetIndex === undefined || targetIndex < 0 || targetIndex >= tokens.length) {
          return current;
        }
        tokens[targetIndex] = tokenValue;
      }

      return {
        ...current,
        sequence: tokens.join(' '),
      };
    });
  }

  function handleDurationNoteEnd(interactionId: number) {
    sequenceInteractionIndexRef.current.delete(interactionId);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        showToast('Ingen Supabase-tilkobling', 'error');
        setIsSaving(false);
        return;
      }

      // Parse sequence (space-separated notes)
      const sequenceArray = formData.sequence.trim().split(/\s+/).filter(s => s.length > 0);
      
      // Parse pitches JSON
      let pitchesObj;
      try {
        pitchesObj = JSON.parse(formData.pitches);
      } catch (e) {
        showToast('Ugyldig JSON i pitches-feltet', 'error');
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from('songs')
        .update({
          title: formData.title,
          nickname: formData.nickname || null,
          voices: formData.voices,
          sequence: sequenceArray,
          pitches: pitchesObj,
          key_signature: formData.key_signature || null,
          tempo_bpm: parseInt(formData.tempo_bpm.toString()),
        })
        .eq('id', song.id);

      if (error) {
        console.error('Feil ved oppdatering:', error);
        showToast(`Kunne ikke lagre: ${error.message}`, 'error');
        setIsSaving(false);
      } else {
        // Success!
        console.log('✅ Song updated successfully');
        showToast('Sang oppdatert', 'success');
        setIsSaving(false);
        setIsOpen(false);
        await onSongUpdated();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
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
        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        title="Rediger sang"
      >
        <Edit2 size={14} />
        Rediger
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Rediger sang
              </h2>
              <button
                onClick={closeModal}
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
                  placeholder="F.eks. alternativt navn eller søkeord"
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
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Sekvens (space-separerte noter, f.eks. &quot;C4:2n C4 A4:4n R:4n&quot;)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSequencePianoOpen((current) => !current)}
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-md transition hover:bg-indigo-500 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 ${
                      isSequencePianoOpen ? 'bg-indigo-500' : 'bg-indigo-600'
                    }`}
                    aria-label={isSequencePianoOpen ? 'Lukk piano for sekvens' : 'Åpne piano for sekvens'}
                    title="Piano for sekvens"
                  >
                    <PianoIcon />
                  </button>
                </div>
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
                  onChange={(e) => setFormData({ ...formData, tempo_bpm: parseInt(e.target.value) || 120 })}
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
                {isSaving ? 'Lagrer...' : 'Lagre endringer'}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
      <PianoSheet
        isOpen={isSequencePianoOpen}
        onClose={() => setIsSequencePianoOpen(false)}
        title="Sekvensinput"
        onNoteDurationInput={handleDurationNoteInput}
        onNoteDurationEnd={handleDurationNoteEnd}
        onBackspace={removeLastSequenceToken}
        onPauseInput={() => appendSequenceToken('R:4n')}
        zIndexClassName="z-[60]"
      />
    </>
  );
}
