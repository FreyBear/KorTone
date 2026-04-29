export type Voice = string;
export type SoundMode = 'piano' | 'sine' | 'organ';
export type VoiceArrangement = 'SATB' | 'TTBB' | 'Unison' | string;

export type Song = {
  id: string;
  title: string;
  nickname: string | null;
  voices: VoiceArrangement;
  sequence: string[];  // Array of note names like ["A", "F", "A", "F"]
  pitches: Record<string, string>;  // Map of voice to pitch
  key_signature: string | null;
  tempo_bpm: number;
};
