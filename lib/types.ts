export type Voice = string;
export type SoundMode = 'grandPiano' | 'stringsPad' | 'electricPiano' | 'organ' | 'sine';
export type VoiceArrangement = 'SATB' | 'TTBB' | 'Unison' | string;

export type Song = {
  id: string;
  title: string;
  nickname: string | null;
  voices: VoiceArrangement;
  sequence: string[];  // Note tokens like ["C4", "A4:2n", "R:4n"]
  pitches: Record<string, string>;  // Map of voice to pitch
  key_signature: string | null;
  tempo_bpm: number;
};
