# KorTone arkitektur

## Oversikt
KorTone er en statisk frontend-applikasjon som kjører på one.com, med Supabase som backend-tjeneste for autentisering og data.

## Hovedkomponenter
- **Next.js 16**: Frontend med statisk eksport (output: 'export')
- **Supabase Auth**: Google OAuth med Legacy anon key
- **Supabase Postgres**: Database med songs og user_roles tabeller
- **Tone.js v15**: Lydavspilling i nettleser (PolySynth)
- **Fuse.js**: Lokalt fuzzy søk (title, nickname, voices, key_signature)
- **Tailwind CSS**: Styling med dark mode-støtte
- **GitHub Actions**: Auto-deployment til one.com via SSH/rsync

## Dataflyt
1. Bruker laster appen fra ingve.com (statiske filer på one.com).
2. Appen henter songs fra Supabase via REST API.
3. Bruker søker i listen (Fuse.js klientside, ingen backend-kall).
4. Ved klikk på stemme/sekvens brukes Tone.js til avspilling lokalt.
5. Admin logger inn med Google OAuth (redirect til Supabase → tilbake til ingve.com/auth/callback).
6. Admin/editor kan redigere songs, og endringer skrives til Supabase hvis RLS tillater.
7. Admin kan se brukerliste og tildele roller via AdminPanel.

## Sikkerhetsmodell

### Row Level Security (RLS)
- **songs tabell**:
  - SELECT: Tillatt for alle (også anonyme brukere)
  - INSERT/UPDATE: Kun for brukere med admin- eller editor-rolle (via can_edit_songs())
  - DELETE: Kun for admin (via is_admin())
  
- **user_roles tabell**:
  - SELECT: Kun admin (via get_all_users_with_roles() SECURITY DEFINER funksjon)
  - INSERT/UPDATE/DELETE: Kun admin
  
### PostgreSQL-funksjoner
- `is_admin()`: Returnerer true hvis innlogget bruker har admin-rolle
- `is_editor()`: Returnerer true hvis innlogget bruker har editor-rolle
- `can_edit_songs()`: Returnerer true hvis bruker er admin ELLER editor
- `get_all_users_with_roles()`: SECURITY DEFINER funksjon for admin å hente alle brukere med roller

### Fallback-logikk
Frontend har fallback-logikk for å håndtere manglende funksjoner:
```typescript
// Prøv kan_edit_songs(), fall tilbake til is_admin() hvis feil
const canEditResult = await supabase.rpc('can_edit_songs');
if (canEditResult.error) {
  const adminResult = await supabase.rpc('is_admin');
  canEdit = adminResult.data ?? false;
} else {
  canEdit = canEditResult.data ?? false;
}
```

## Deploymodell

### Static Export
- Next.js 16 med `output: 'export'` i next.config.ts
- Alle miljøvariabler bakes inn i bundle ved byggetid via next.config.ts
- Output genereres til `out/` katalog

### GitHub Actions Workflow
1. Push til `main` branch trigger workflow
2. Node.js environment settes opp
3. Miljøvariabler injiseres i .env.local
4. `npm run build` kjører statisk eksport
5. SSH-nøkkel settes opp
6. rsync overfører filer til one.com
7. Deployment tar ~45-55 sekunder

### Nødvendige GitHub Secrets
- `SSH_HOST`: one.com SSH-server
- `SSH_USERNAME`: SSH-bruker
- `SSH_KEY`: Private SSH-nøkkel
- `REMOTE_DIR`: Remote katalog (f.eks. `/home/ingve/public_html`)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase prosjekt URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Legacy Anon Key (IKKE Publishable key)

## Audio-arkitektur

### Tone.js Setup
- **PolySynth**: Brukes for å spille flere toner samtidig
- **Instrument**: Piano (standardvalg)
- **Oktav-mapping**:
  - Sopran (S): Oktav 4
  - Alt (A): Oktav 4
  - Tenor (T): Oktav 3
  - Bass (B): Oktav 3

### Note-parsing
- `toNote(pitch: string, voice?: Voice)`: Konverterer note-string til Tone.js-format
- Støtter både "C" og "C4" notasjon
- Hvis oktav mangler, legges stemme-spesifikk oktav til
- Default fallback: Oktav 4 hvis stemme ikke er spesifisert

### Sekvensavspilling
- `playSequence(notes: string[], onNoteChange?: (index: number) => void)`
- Spiller array av noter i sekvens
- Callback for UI-oppdatering (aktiv stemme)
- Respekterer tempo fra sang-metadata

## CSV Import System

### Format
```csv
Sang,Stemmer,Starttone,toneart,bpm
Helan,SATB,A F A F,F-dur,135
```

### Konvertering
- `scripts/import-csv-to-supabase.js` leser sanger.csv
- Parser CSV og mapper voices til pitches
- Genererer SQL INSERT statements til `supabase/import-songs.sql`
- Admin kjører SQL i Supabase SQL Editor

### Voice-mappings
- **Unison**: Alle stemmer samme tone
- **SATB**: 4 toner fordelt på S, A, T, B
- **TTBB**: 2 toner fordelt på T og B (tenor 1+2, bass 1+2)

## Fremtidige utvidelser (under diskusjon)

### Fleksibelt voice-system
- Støtte for nummererte stemmer (S1, S2, A1, A2, T1, T2, B1, B2)
- Voice type som string i stedet for enum
- Komplekse arrangements:
  - ASSA = A1, S1, S2, A2
  - TTBB = T1, T2, B1, B2
- Intelligent oktav-gjetting basert på prefix (S* → 4, T* → 3, etc.)

## Strukturforslag for appkode
- **app/**: Next.js app router (page.tsx, layout.tsx, auth/callback/)
- **components/**: UI-komponenter (SongCard, SearchBar, AdminPanel, EditSongModal, etc.)
- **lib/**: Kjernefunksjonalitet
  - `supabase.ts`: Supabase-klient med runtime redirect URL
  - `audio.ts`: Tone.js wrapper for lydavspilling
  - `types.ts`: TypeScript-typer for Song, Voice, etc.
  - `songData.ts`: Fallback-data (tom i produksjon)
- **supabase/**: SQL-scripts (schema, policies, migrations)
- **scripts/**: Verktøy (CSV-import, etc.)
- **data/**: Datakilder (sanger.csv)

## Feilsøkingstips

### OAuth-problemer
- Bruk Legacy Anon Key (fra API Settings), IKKE Publishable key
- Sjekk at redirect URL er `https://ingve.com/auth/callback` i Supabase Dashboard
- Verifiser at .htaccess på one.com router `/auth/callback` korrekt

### Audio fungerer ikke
- Sjekk at Tone.js er initialisert (`await Tone.start()`)
- Verifiser at noter er formatert riktig ("C4", ikke "c4" eller "C")
- Sjekk oktav-mapping i voiceOctave dictionary

### RLS-problemer
- Kjør SQL-scripts i rekkefølge: schema.sql → policies.sql → add-roles-system.sql
- Verifiser at funksjoner eksisterer: `SELECT * FROM pg_proc WHERE proname = 'is_admin';`
- Test direkte i SQL Editor før testing i frontend

### Build-feil
- Verifiser at miljøvariabler er satt i next.config.ts
- Sjekk TypeScript-feil: `npm run build`
- Slett `.next/` og `out/` ved mystiske feil
