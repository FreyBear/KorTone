# KorTone - Digital Stemmegaffel for ingve.com

En lynrask, mobil-først webapplikasjon for korister. Siden viser en søkbar liste over stamrepertoar med mulighet for å spille av starttoner i sekvens.

## 🚀 Teknisk Arkitektur
- **Frontend:** Next.js (Static Site Generation - SSG)
- **Hosting:** One.com Webhotell (Statisk hosting)
- **Database & Auth:** Supabase (Client-side integrasjon)
- **Lydmotor:** Tone.js (Web Audio API)
- **Søk:** Fuse.js (Fuzzy search)
- **Styling:** Tailwind CSS (Slate & Indigo fargepalett)

## 📋 Hovedfunksjonalitet
- **Søk:** Live søk i tittel, kallenavn og første ord i sangen.
- **Lyd:** 
  - Spill av toner i definert sekvens (f.eks. B -> T -> A -> S).
  - Mulighet for 4 taktslag (metronom) hvis tempo (BPM) er lagret.
  - Instrumentvalg: Piano (sampling) og "Sinus/Square" (for støyete lokaler).
- **Stemmegaffel:** Fast knapp nederst til høyre som spiller en A (440Hz) med 1s fade-out.
- **Admin:** 
  - Innlogging via Google (Supabase Auth).
  - Administratorer kan redigere sanger direkte i applikasjonen (Inline editing).
- **Design:** Dark Mode-støtte med standard slider.

## 🛠 Database-skjema (Supabase)
Tabellen `songs` skal inneholde:
- `title` (text)
- `nickname` (text)
- `lyrics_snippet` (text)
- `tempo_bpm` (int)
- `sequence` (text array, f.eks. ['B', 'T', 'A', 'S'])
- `pitches` (jsonb, f.eks. {"S": "E4", "B": "G2"})
- `dropbox_url` (text)
