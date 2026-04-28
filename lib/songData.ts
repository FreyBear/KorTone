import type { Song } from '@/lib/types';

export const fallbackSongs: Song[] = [
  {
    id: 'demo-1',
    title: 'Deg vere are',
    nickname: 'Aresangen',
    lyrics_snippet: 'Deg vere are, Herre over dodsens makt',
    tempo_bpm: 84,
    sequence: ['B', 'T', 'A', 'S'],
    pitches: {
      S: 'E4',
      A: 'C4',
      T: 'G3',
      B: 'E2',
    },
    dropbox_url: null,
  },
  {
    id: 'demo-2',
    title: 'Kyrie',
    nickname: null,
    lyrics_snippet: 'Kyrie eleison, Christe eleison',
    tempo_bpm: 72,
    sequence: ['T', 'B', 'A', 'S'],
    pitches: {
      S: 'F4',
      A: 'D4',
      T: 'A3',
      B: 'F2',
    },
    dropbox_url: null,
  },
];
