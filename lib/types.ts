export type Voice = 'S' | 'A' | 'T' | 'B';
export type SoundMode = 'piano' | 'sine' | 'organ';

export type Song = {
  id: string;
  title: string;
  nickname: string | null;
  lyrics_snippet: string | null;
  tempo_bpm: number | null;
  sequence: Voice[];
  pitches: Partial<Record<Voice, string>>;
  dropbox_url: string | null;
};
