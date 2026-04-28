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

  if (mode === 'flute') {
    return new Tone.PolySynth(Tone.AMSynth, {
      harmonicity: 1.8,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.03, decay: 0.1, sustain: 0.9, release: 0.7 },
      modulation: { type: 'triangle' },
      modulationEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.35, release: 0.6 },
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

async function toNote(value: string | undefined, fallbackMidi: number): Promise<string> {
  const Tone = await getTone();

  if (!value || value.trim().length === 0) {
    return Tone.Frequency(fallbackMidi, 'midi').toNote();
  }

  const normalized = value.trim().toUpperCase();
  const isSimpleNote = /^[A-G](#|B)?\d$/.test(normalized);
  if (isSimpleNote) {
    return normalized.replace('B', 'b');
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
  const note = await toNote(pitch, voiceMidi[voice]);
  const synth = await getSynth();
  synth.triggerAttackRelease(note, duration);
}

export async function playSequence(
  sequence: Voice[],
  pitches: Partial<Record<Voice, string>>,
  tempoBpm?: number | null,
  options?: {
    onVoiceStart?: (voice: Voice) => void;
    onComplete?: () => void;
  }
): Promise<void> {
  await primeAudioContext();

  const stepMs = tempoBpm && tempoBpm > 0 ? Math.round((60_000 / tempoBpm) * 0.8) : 520;

  try {
    for (const voice of sequence) {
      options?.onVoiceStart?.(voice);
      await playVoice(voice, pitches[voice], '8n');
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
