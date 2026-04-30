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
const DEFAULT_SEQUENCE_DURATION = '4n';
let metronomeRunning = false;

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

  if (mode === 'stringsPad') {
    return createPolySynth(Tone, Tone.AMSynth, {
      harmonicity: 2,
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.12, decay: 0.2, sustain: 0.85, release: 1.4 },
      modulation: { type: 'sawtooth' },
      modulationEnvelope: { attack: 0.25, decay: 0.2, sustain: 0.7, release: 1.1 },
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

async function toNote(value: string | undefined, fallbackMidi: number): Promise<string> {
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
  // Keep note entry simple in UI/import: missing octave defaults to octave 4.
  const octave = match[3] || '4';

  return `${letter}${accidental}${octave}`;
}

function durationToBeats(duration: string): number {
  const normalized = duration.trim().toLowerCase();
  const match = normalized.match(/^(\d+)n([t.]?)$/);

  if (!match) {
    return 1;
  }

  const noteValue = Number(match[1]);
  if (!Number.isFinite(noteValue) || noteValue <= 0) {
    return 1;
  }

  let beats = 4 / noteValue;
  if (match[2] === '.') {
    beats *= 1.5;
  }
  if (match[2] === 't') {
    beats *= 2 / 3;
  }

  return beats;
}

function parseSequenceToken(token: string): { noteToken: string; duration: string; isRest: boolean } {
  const trimmed = token.trim();
  if (!trimmed) {
    return { noteToken: '', duration: DEFAULT_SEQUENCE_DURATION, isRest: false };
  }

  const [rawNoteToken, rawDuration] = trimmed.split(':', 2);
  const noteToken = rawNoteToken.trim();
  const duration = rawDuration?.trim() || DEFAULT_SEQUENCE_DURATION;
  const isRest = /^(r|rest)$/i.test(noteToken);

  return { noteToken, duration, isRest };
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
  const note = await toNote(pitch, getFallbackMidi(voice));
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

  const quarterMs = tempoBpm && tempoBpm > 0 ? 60_000 / tempoBpm : 500;
  const instrument = await getInstrument();

  try {
    for (const token of sequence) {
      const { noteToken, duration, isRest } = parseSequenceToken(token);
      const waitMs = Math.max(1, Math.round(durationToBeats(duration) * quarterMs));

      if (!isRest) {
        const note = await toNote(noteToken, 60);
        instrument.triggerAttackRelease(note, duration);
      }

      await new Promise((resolve) => setTimeout(resolve, waitMs));
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

export async function startMetronome(tempoBpm: number): Promise<void> {
  if (metronomeRunning || !tempoBpm || tempoBpm <= 0) {
    return;
  }

  await primeAudioContext();
  metronomeRunning = true;

  const Tone = await getTone();
  const synth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.05 },
  }).toDestination();

  const intervalMs = (60_000 / tempoBpm);
  
  async function tick() {
    if (!metronomeRunning) {
      synth.dispose();
      return;
    }

    synth.triggerAttackRelease('C5', '32n');
    
    if (metronomeRunning) {
      setTimeout(tick, intervalMs);
    }
  }

  tick();
}

export function stopMetronome(): void {
  metronomeRunning = false;
}

export function isMetronomeRunning(): boolean {
  return metronomeRunning;
}
