# Piano lite samples

Legg inn disse filene i denne mappen for lokal (self-hosted) piano-sampler:

- C4.mp3
- Ds4.mp3
- Fs4.mp3
- A4.mp3

Koden i `lib/audio.ts` bruker denne mappen automatisk hvis `C4.mp3` finnes. Hvis filene mangler, brukes fjernkilden fra Tone.js som fallback.

Tips:
- Behold disse filnavnene eksakt.
- 4 filer dekker dagens repertoar godt (C4-B4 med pitch-shift).
- For bedre kvalitet kan du senere legge til flere samples i samme oktav og utvide URL-kartet i `lib/audio.ts`.
