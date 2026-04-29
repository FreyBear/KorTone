import type { SoundMode, Voice } from '@/lib/types';

type ToneModule = typeof import('tone');

type PlayableInstrument = {
  triggerAttackRelease: (note: string, duration: string) => void;
  triggerAttack: (note: string) => void;
  triggerRelease: (note: string) => void;
};

const SAMPLER_URLS: Record<string, string> = {
  A0: 'A0.mp3',
  C1: 'C1.mp3',
  'D#1': 'Ds1.mp3',
  'F#1': 'Fs1.mp3',
  A1: 'A1.mp3',
  C2: 'C2.mp3',
  'D#2': 'Ds2.mp3',
  'F#2': 'Fs2.mp3',
  A2: 'A2.mp3',
  C3: 'C3.mp3',
  'D#3': 'Ds3.mp3',
  'F#3': 'Fs3.mp3',
  A3: 'A3.mp3',
  C4: 'C4.mp3',
  'D#4': 'Ds4.mp3',
  'F#4': 'Fs4.mp3',
  A4: 'A4.mp3',
  C5: 'C5.mp3',
  'D#5': 'Ds5.mp3',
  'F#5': 'Fs5.mp3',
  A5: 'A5.mp3',
  C6: 'C6.mp3',
  'D#6': 'Ds6.mp3',
  'F#6': 'Fs6.mp3',
  A6: 'A6.mp3',
  C7: 'C7.mp3',
  'D#7': 'Ds7.mp3',
  'F#7': 'Fs7.mp3',
  A7: 'A7.mp3',
  C8: 'C8.mp3',
};

let tonePromise: Promise<ToneModule> | null = null;
let currentSoundMode: SoundMode = 'grandPiano';
const instrumentPromises: Partial<Record<SoundMode, Promise<PlayableInstrument>>> = {};

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

function getVoiceFamily(voice: Voice): 'S' | 'A' | 'T' | 'BAR' | 'B' | 'OTHER' {
  const normalized = voice.trim().toUpperCase();
  if (normalized.startsWith('S')) return 'S';
  if (normalized.startsWith('A')) return 'A';
  if (normalized.startsWith('T')) return 'T';
  if (normalized.startsWith('BAR')) return 'BAR';
  if (normalized.startsWith('B')) return 'B';
  return 'OTHER';
}

function getFallbackMidi(voice: Voice): number {
  const family = getVoiceFamily(voice);
  if (family === 'S') return 64;
  if (family === 'A') return 60;
  if (family === 'T') return 55;
  if (family === 'BAR' || family === 'B') return 48;
  return 60;
}

function getVoiceOctave(voice?: Voice): number {
  if (!voice) return 4;

  const family = getVoiceFamily(voice);
  if (family === 'S' || family === 'A') return 4;
  if (family === 'T' || family === 'BAR' || family === 'B') return 3;
  return 4;
}

function createPolySynth(
  Tone: ToneModule,
  synthType: any,
  options: Record<string, unknown>
): PlayableInstrument {
  return new Tone.PolySynth(synthType, options).toDestination() as PlayableInstrument;
}

async function createInstrument(mode: SoundMode): Promise<PlayableInstrument> {
  const Tone = await getTone();

  if (mode === 'grandPiano') {
    const sampler = new Tone.Sampler({
      urls: SAMPLER_URLS,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      release: 1,
    }).toDestination();

    await Tone.loaded();
    return sampler as PlayableInstrument;
  }

  if (mode === 'choirPad') {
    return createPolySynth(Tone, Tone.AMSynth, {
      harmonicity: 1.8,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.08, decay: 0.25, sustain: 0.75, release: 1.1 },
      modulation: { type: 'triangle' },
      modulationEnvelope: { attack: 0.2, decay: 0.15, sustain: 0.8, release: 1 },
    });
  }

  if (mode === 'electricPiano') {
    return createPolySynth(Tone, Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 8,
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.8 },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.5 },
    });
  }

  if (mode === 'organ') {
    return createPolySynth(Tone, Tone.Synth, {
      oscillator: { type: 'square8' },
      envelope: { attack: 0.01, decay: 0.05, sustain: 0.95, release: 0.25 },
    });
  }

  return createPolySynth(Tone, Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.12, sustain: 0.5, release: 0.25 },
  });
}

async function getInstrument(): Promise<PlayableInstrument> {
  const mode = currentSoundMode;
  if (!instrumentPromises[mode]) {
    instrumentPromises[mode] = createInstrument(mode);
  }
  return instrumentPromises[mode] as Promise<PlayableInstrument>;
}

async function toNote(value: string | undefined, fallbackMidi: number, voice?: Voice): Promise<string> {
  const Tone = await getTone();

  if (!value || value.trim().length === 0) {
    return Tone.Frequency(fallbackMidi, 'midi').toNote();
  }

  const normalizedRaw = value.trim().toUpperCase();
  const match = normalizedRaw.match(/^([A-GH])([#B]?)(\d?)$/);

  if (!match) {
    return Tone.Frequency(fallbackMidi, 'midi').toNote();
  }

  const letter = match[1] === 'H' ? 'B' : match[1];
  const accidental = match[2] === 'B' ? 'b' : match[2];
  const octave = match[3] || `${getVoiceOctave(voice)}`;

  return `${letter}${accidental}${octave}`;
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
  const note = await toNote(pitch, getFallbackMidi(voice), voice);
  const instrument = await getInstrument();
  instrument.triggerAttackRelease(note, duration);
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
  const instrument = await getInstrument();

  try {
    for (const noteName of sequence) {
      const note = await toNote(noteName, 60);
      instrument.triggerAttackRelease(note, '8n');
      await new Promise((resolve) => setTimeout(resolve, stepMs));
    }
  } finally {
    options?.onComplete?.();
  }
}

export async function holdTuningForkA(): Promise<void> {
  await primeAudioContext();
  const instrument = await getInstrument();
  instrument.triggerAttack('A4');
}

export async function releaseTuningForkA(): Promise<void> {
  const instrument = await getInstrument();
  instrument.triggerRelease('A4');
}
