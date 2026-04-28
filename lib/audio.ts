import type { SoundMode, Voice } from '@/lib/types';

const voiceMidi: Record<Voice, number> = {
  S: 64,
  A: 60,
  T: 55,
  B: 48,
};

type ToneModule = typeof import('tone');

let tonePromise: Promise<ToneModule> | null = null;
let currentSoundMode: SoundMode = 'piano';
const synthPromises: Partial<Record<SoundMode, Promise<any>>> = {};

export function getSoundMode(): SoundMode {
  return currentSoundMode;
}

export function setSoundMode(mode: SoundMode): void {
  currentSoundMode = mode;
}

function ensureBrowser(): void {
  if (typeof window === 'undefined') {
    throw new Error('Lyd er kun tilgjengelig i nettleseren.');
  }
}

async function getTone(): Promise<ToneModule> {
  ensureBrowser();
  if (!tonePromise) {
    tonePromise = import('tone');
  }
  return tonePromise;
}

async function createSynth(mode: SoundMode) {
  const Tone = await getTone();

  if (mode === 'sine') {
    return new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.12, sustain: 0.5, release: 0.25 },
    }).toDestination();
  }

  if (mode === 'organ') {
    return new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square8' },
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.95, release: 0.25 },
    }).toDestination();
  }

  return new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 1.2 },
  }).toDestination();
}

async function getSynth() {
  const mode = currentSoundMode;
  if (!synthPromises[mode]) {
    synthPromises[mode] = createSynth(mode);
  }
  return synthPromises[mode];
}

// Octave mapping for voices (Tenor and Bass are lower)
const voiceOctave: Record<Voice, number> = {
  S: 4,  // Soprano - middle octave
  A: 4,  // Alto - middle octave  
  T: 3,  // Tenor - one octave lower
  B: 2,  // Bass - two octaves lower
};

async function toNote(value: string | undefined, fallbackMidi: number, voice?: Voice): Promise<string> {
  const Tone = await getTone();

  if (!value || value.trim().length === 0) {
    return Tone.Frequency(fallbackMidi, 'midi').toNote();
  }

  const normalized = value.trim().toUpperCase();
  const isSimpleNote = /^[A-G](#|B)?\d$/.test(normalized);
  if (isSimpleNote) {
    return normalized.replace('B', 'b');
  }
  
  // If no octave specified, use voice-appropriate octave
  const hasOctave = /\d$/.test(normalized);
  if (!hasOctave && voice) {
    const noteWithoutOctave = normalized.replace('B', 'b');
    return `${noteWithoutOctave}${voiceOctave[voice]}`;
  }

  return Tone.Frequency(fallbackMidi, 'midi').toNote();
}

export async function primeAudioContext(): Promise<void> {
  const Tone = await getTone();
  if (Tone.getContext().state !== 'running') {
    await Tone.start();
  }
}

export async function playVoice(
  voice: Voice,
  pitch?: string,
  duration = '8n'
): Promise<void> {
  await primeAudioContext();
  const note = await toNote(pitch, voiceMidi[voice], voice);
  const synth = await getSynth();
  synth.triggerAttackRelease(note, duration);
}

export async function playSequence(
  sequence: string[],
  pitches: Partial<Record<Voice, string>>,
  tempoBpm?: number | null,
  options?: {
    onVoiceStart?: (voice: Voice) => void;
    onComplete?: () => void;
  }
): Promise<void> {
  await primeAudioContext();

  const stepMs = tempoBpm && tempoBpm > 0 ? Math.round((60_000 / tempoBpm) * 0.8) : 520;
  const synth = await getSynth();

  try {
    for (const noteName of sequence) {
      // Play each note in the sequence (use octave 4 as default if not specified)
      const note = await toNote(noteName, 60); // 60 = C4
      synth.triggerAttackRelease(note, '8n');
      await new Promise((resolve) => setTimeout(resolve, stepMs));
    }
  } finally {
    options?.onComplete?.();
  }
}

export async function holdTuningForkA(): Promise<void> {
  await primeAudioContext();
  const synth = await getSynth();
  synth.triggerAttack('A4');
}

export async function releaseTuningForkA(): Promise<void> {
  const synth = await getSynth();
  synth.triggerRelease('A4');
}
