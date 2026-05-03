"use client";

import { useState } from 'react';
import { Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { PianoIcon, PianoSheet } from '@/components/PianoSheet';
import type { Song, Voice } from '@/lib/types';
import { getSupabase } from '@/lib/supabase';
import { Toast } from '@/components/Toast';

type EditSongModalProps = {
  song: Song;
  isAdmin: boolean;
  onSongUpdated: () => void;
};

type PitchRow = {
  id: string;
  voice: string;
  note: string;
};

function normalizeVoiceOrder(voice: string): number {
  const order = ['S', 'M', 'A', 'T', 'BAR', 'B'];
  const normalized = voice.trim().toUpperCase();
  const index = order.findIndex((prefix) => normalized.startsWith(prefix));
  return index === -1 ? 99 : index;
}

function getPitchRows(pitches: Partial<Record<Voice, string>>): PitchRow[] {
  const entries = Object.entries(pitches);
  entries.sort((a, b) => {
    const voiceA = a[0] ?? '';
    const voiceB = b[0] ?? '';
    const orderA = normalizeVoiceOrder(voiceA);
    const orderB = normalizeVoiceOrder(voiceB);
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return voiceA.localeCompare(voiceB);
  });

  return entries.map(([voice, note], index) => ({
    id: `${voice}-${index}`,
    voice,
    note: note ?? '',
  }));
}

function rowsToPitchesObject(rows: PitchRow[]): Record<string, string> {
  const result: Record<string, string> = {};
  rows.forEach((row) => {
    const voice = row.voice.trim();
    const note = row.note.trim();
    if (voice && note) {
      result[voice] = note;
    }
  });
  return result;
}

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
  const [isPitchPianoOpen, setIsPitchPianoOpen] = useState(false);
  const [pitchTargetRowId, setPitchTargetRowId] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<'8n' | '4n' | '2n' | '1n'>('4n');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [pitchRows, setPitchRows] = useState<PitchRow[]>(getPitchRows(song.pitches));
  const [formData, setFormData] = useState({
    title: song.title,
    nickname: song.nickname || '',
    voices: song.voices,
    sequence: song.sequence.join(' '),
    key_signature: song.key_signature || '',
    tempo_bpm: song.tempo_bpm,
  });

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
    });
    setPitchRows(getPitchRows(song.pitches));
    setPitchTargetRowId(null);
    setIsPitchPianoOpen(false);
    setSelectedDuration('4n');
    setIsSequencePianoOpen(false);
    setIsOpen(true);
  }

  function closeModal() {
    setIsSequencePianoOpen(false);
    setIsPitchPianoOpen(false);
    setPitchTargetRowId(null);
    setIsOpen(false);
  }

  function appendSequenceToken(token: string) {
    setFormData((current) => ({
      ...current,
      sequence: current.sequence.trim() ? `${current.sequence.trim()} ${token}` : token,
    }));
  }

  function formatSequenceToken(note: string, duration: '8n' | '4n' | '2n' | '1n') {
    if (duration === '4n') {
      return note;
    }
    return `${note}:${duration}`;
  }

  function removeLastSequenceToken() {
    setFormData((current) => {
      const tokens = current.sequence.trim().split(/\s+/).filter((token) => token.length > 0);
      tokens.pop();

      return {
        ...current,
        sequence: tokens.join(' '),
      };
    });
  }

  function updatePitchRow(rowId: string, key: 'voice' | 'note', value: string) {
    setPitchRows((current) => current.map((row) => (row.id === rowId ? { ...row, [key]: value } : row)));
  }

  function addPitchRow() {
    setPitchRows((current) => [
      ...current,
      {
        id: `pitch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        voice: '',
        note: '',
      },
    ]);
  }

  function removePitchRow(rowId: string) {
    setPitchRows((current) => current.filter((row) => row.id !== rowId));
    if (pitchTargetRowId === rowId) {
      setPitchTargetRowId(null);
      setIsPitchPianoOpen(false);
    }
  }

  function pickPitchWithPiano(rowId: string) {
    setPitchTargetRowId(rowId);
    setIsSequencePianoOpen(false);
    setIsPitchPianoOpen(true);
  }

  function handlePitchPianoNote(note: string) {
    if (!pitchTargetRowId) {
      return;
    }
    updatePitchRow(pitchTargetRowId, 'note', note);
    setIsPitchPianoOpen(false);
    setPitchTargetRowId(null);
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

      const incompleteRows = pitchRows.filter((row) => {
        const hasVoice = row.voice.trim().length > 0;
        const hasNote = row.note.trim().length > 0;
        return (hasVoice && !hasNote) || (!hasVoice && hasNote);
      });

      if (incompleteRows.length > 0) {
        showToast('Alle pitch-rader må ha både stemme og tone (eller være tomme)', 'error');
        setIsSaving(false);
        return;
      }

      const validRows = pitchRows
        .map((row) => ({ ...row, voice: row.voice.trim(), note: row.note.trim() }))
        .filter((row) => row.voice.length > 0 && row.note.length > 0);

      if (validRows.length === 0) {
        showToast('Legg inn minst én gyldig pitch-rad', 'error');
        setIsSaving(false);
        return;
      }

      const uniqueVoices = new Set(validRows.map((row) => row.voice.toUpperCase()));
      if (uniqueVoices.size !== validRows.length) {
        showToast('Samme stemme kan ikke legges inn flere ganger', 'error');
        setIsSaving(false);
        return;
      }

      const pitchesObj = rowsToPitchesObject(validRows);

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
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Pitches (stemme + tone)
                  </label>
                  <button
                    type="button"
                    onClick={addPitchRow}
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Plus size={14} />
                    Legg til rad
                  </button>
                </div>

                <div className="space-y-2">
                  {pitchRows.map((row) => (
                    <div
                      key={row.id}
                      className="flex items-center gap-2 overflow-x-auto pb-1"
                    >
                      <input
                        type="text"
                        value={row.voice}
                        onChange={(e) => updatePitchRow(row.id, 'voice', e.target.value)}
                        className="h-10 w-24 shrink-0 rounded-lg border border-slate-300 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="Stemme"
                      />
                      <input
                        type="text"
                        value={row.note}
                        onChange={(e) => updatePitchRow(row.id, 'note', e.target.value)}
                        className="h-10 w-24 shrink-0 rounded-lg border border-slate-300 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="Tone"
                      />
                      <button
                        type="button"
                        onClick={() => pickPitchWithPiano(row.id)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md transition hover:bg-indigo-500 active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                        aria-label="Velg tone med piano"
                        title="Velg tone med piano"
                      >
                        <PianoIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePitchRow(row.id)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        aria-label="Fjern pitch-rad"
                        title="Fjern pitch-rad"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  JSON genereres automatisk ved lagring for å unngå ugyldig format.
                </p>
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
      {isSequencePianoOpen && (
        <PianoSheet
          isOpen={isSequencePianoOpen}
          onClose={() => setIsSequencePianoOpen(false)}
          title="Sekvensinput"
          durationOptions={['8n', '4n', '2n', '1n']}
          selectedDuration={selectedDuration}
          onSelectDuration={setSelectedDuration}
          onNoteInput={(note) => appendSequenceToken(formatSequenceToken(note, selectedDuration))}
          onBackspace={removeLastSequenceToken}
          onPauseInput={() => appendSequenceToken(formatSequenceToken('R', selectedDuration))}
          zIndexClassName="z-[60]"
        />
      )}
      {isPitchPianoOpen && (
        <PianoSheet
          isOpen={isPitchPianoOpen}
          onClose={() => {
            setIsPitchPianoOpen(false);
            setPitchTargetRowId(null);
          }}
          title="Velg tone for pitch"
          onNoteInput={handlePitchPianoNote}
          zIndexClassName="z-[70]"
        />
      )}
    </>
  );
}
