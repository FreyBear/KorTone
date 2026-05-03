# KorTone arkitektur

## Oversikt
KorTone er en statisk Next.js-applikasjon hostet pa one.com, med Supabase for autentisering, roller og sangdata.

## Hovedkomponenter
- Frontend: Next.js 16 + Tailwind
- Data/Auth: Supabase (Postgres + Google OAuth + RLS)
- Lyd: Tone.js (Sampler + synth-baserte moduser)
- Sok: Fuse.js (klientside)
- Deploy: GitHub Actions -> rsync/SSH til one.com

## Domeneobjekt

### Song
- `id`: uuid
- `title`: string
- `nickname`: string | null
- `voices`: string
- `sequence`: string[] (tokens som `C4`, `A4:2n`, `R:4n`)
- `pitches`: Record<string, string> (dynamiske stemmer)
- `key_signature`: string | null
- `tempo_bpm`: number

## UI-struktur
- [app/page.tsx](app/page.tsx): hovedside, auth-status, roller, liste/sok
- [components/SongCard.tsx](components/SongCard.tsx): avspilling og redigering per sang
- [components/EditSongModal.tsx](components/EditSongModal.tsx): oppdatering av eksisterende sang
- [components/AddSongModal.tsx](components/AddSongModal.tsx): oppretting av ny sang
- [components/AdminPanel.tsx](components/AdminPanel.tsx): rolleadministrasjon
- [components/PianoFab.tsx](components/PianoFab.tsx): flytende piano-knapp pa hovedsiden
- [components/PianoSheet.tsx](components/PianoSheet.tsx): delt bottom-sheet for piano UI og noteinput

## Tilgangsmodell

### Roller
- `admin`: kan administrere brukere/roller + redigere/opprette sanger
- `editor`: kan redigere/opprette sanger
- anonym/innlogget uten rolle: lesetilgang

### RLS-prinsipp
- `songs.select`: tillatt for alle
- `songs.insert/update`: kun `can_edit_songs()`
- `songs.delete`: kun `is_admin()`
- `user_roles`: kun admin

Frontend sjekker `is_admin()` og `can_edit_songs()` og har fallback til admin-check hvis funksjon mangler i eldre miljo.

## Lydarkitektur

### Sound modes
- `grandPiano` (Tone.Sampler med Salamander)
- `stringsPad` (AMSynth)
- `electricPiano` (FMSynth)
- `organ` (Synth)
- `sine` (Synth)

### Dynamiske stemmer
- Stemmeknapper dannes fra noklene i `pitches`.
- Sortering i naturlig korrekkefolge (S1, S2, S, A1, ... B).
- Fallback-oktav estimeres fra stemmeprefix (`S/A` -> 4, `T/Bar/B` -> 3).

### Sekvensparser
- Token-format: `NOTE[:DURATION]`
- Manglende duration -> `4n`
- Rest tokens: `R`/`REST`
- Duration notasjon folger Tone.js (`1n`, `2n`, `4n`, `8n`, `4n.`, `8t`)

## Redigeringsarkitektur

### Sekvenseditor
- `EditSongModal` har et eget sekvens-piano som gjenbruker `PianoSheet`.
- Notelengde styres eksplisitt via UI-knapper (`1`, `1/2`, `1/4`, `1/8`).
- Ved valgt `1/4` lagres sekvenstoken uten `:4n` for a matche standardformatet i systemet.

### Pitches-editor
- `EditSongModal` bruker en strukturert radmodell (`stemme`, `tone`) i stedet for fri JSON-redigering.
- Rader konverteres til `Record<string, string>` ved lagring.
- UI validerer halvutfylte rader, tom pitch-liste og dupliserte stemmer før update mot Supabase.
- Tonevalg for pitch-rader kan settes via gjenbrukt `PianoSheet`.

## Deployflyt
1. Push til `main` trigger workflow.
2. `npm ci` + `npm run build`.
3. Statiske filer i `out/` sync'es til one.com via rsync.

Workflow bruker:
- `actions/checkout@v5`
- `actions/setup-node@v5`
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`

## Driftstips
- Kjor alltid `npm run lint` og `npm run build` for push.
- Ved auth/rolleproblemer: verifiser SQL-funksjoner i Supabase.
- Ved deployfeil: sjekk siste run i GitHub Actions.
