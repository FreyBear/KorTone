# KorTone – Status og gjenstående oppgaver

## ✅ Fullført (Januar 2026)

### Database & Infrastruktur
- [x] Opprettet Supabase-prosjekt
- [x] Kjørt `supabase/schema.sql` (tabeller: `songs`, `user_roles`)
- [x] Kjørt `supabase/policies.sql` (Row Level Security)
- [x] Satt opp miljøvariabler i GitHub Secrets
- [x] Appen henter live data fra Supabase
- [x] Auto-deployment via GitHub Actions til one.com

### Autentisering
- [x] Google OAuth fungerer via Supabase
- [x] Redirect URLs konfigurert (`https://ingve.com/auth/callback`)
- [x] Diskret auth UI (text links under header)
- [x] Logg ut-funksjonalitet

### Sanger & Data
- [x] Ny database-struktur basert på CSV (`sanger.csv`)
- [x] Kolonnner: `title`, `nickname`, `voices`, `sequence`, `pitches`, `key_signature`, `tempo_bpm`
- [x] Import-script: `scripts/import-csv-to-supabase.js`
- [x] 7 sanger importert (Helan, Helan går, Akademisk bordvers, etc.)
- [x] Søkbart kallenavn-felt (vises ikke i UI)
- [x] Offentlig visning (alle kan se sanger uten innlogging)

### Admin & Roller
- [x] Rollehåndtering: `admin` og `editor` (redaktør)
- [x] AdminPanel-komponent for brukerhåndtering
- [x] Admin kan se alle brukere og tildele roller
- [x] Editor kan redigere sanger, men ikke administrere brukere
- [x] RLS policies oppdatert for begge roller

### Redigering
- [x] EditSongModal for admin/editor
- [x] Kan redigere: tittel, kallenavn, voices, sekvens, toneart, BPM, pitches
- [x] Dialog lukker automatisk etter vellykket lagring
- [x] Feilhåndtering med tydelige meldinger

### Audio & Playback
- [x] Sequence-playback fungerer (A C F A spiller riktig)
- [x] Oktav-mapping for stemmer (T=oktav 3, B=oktav 2)
- [x] Default oktav 4 for noter uten oktav-spesifikasjon

## 🔨 Gjenstående oppgaver

### 1. Sang-administrasjon
- [ ] "Legg til ny sang"-funksjon (tom form → lagre til database)
- [ ] Slett sang-funksjonalitet (med bekreftelsesdialog, kun admin)
- [ ] Bulk-import fra CSV via admin-panel
- [ ] Validering av `sequence` array (gyldige noter)
- [ ] Validering av `pitches` JSON format

### 2. Audio-forbedringer
- [ ] Metronom-funksjon (global eller per sang)
- [ ] Velg oktav for sequence-playback per sang
- [ ] Justere lengde/duration på sequence-noter
- [ ] Volume-kontroll

### 3. UX-forbedringer
- [ ] Loading-tilstand på "Spill sekvens"-knapp
- [ ] Optimistisk oppdatering av sangliste etter lagring
- [ ] Bedre mobile-visning for AdminPanel
- [ ] Keyboard shortcuts (space = play sequence, etc.)
- [ ] Toast-meldinger i stedet for alert()

### 4. Søk & Filter
- [ ] Filter på voices (SATB, TTBB, Unison)
- [ ] Filter på toneart
- [ ] Sortering (alfabetisk, nyeste først, etc.)

### 5. Datamigrering
- [ ] Vurder om `sanger.csv` skal arkiveres etter import
- [ ] Fjern `data/sanger-library.json` (ikke lenger i bruk)
- [ ] Dokumenter CSV-format for fremtidige importer

### 6. Diverse
- [ ] Legg til "Om"-side med info om appen
- [ ] Eksporter sangliste til PDF/CSV
- [ ] Sanghistorikk (sist spilte sanger)
- [ ] Favoritter-funksjon per bruker

## 📝 SQL-scripts å kjøre i Supabase

Hvis du har kjørt migreringene tidligere, sjekk at disse er kjørt:
1. `supabase/migrate-to-new-structure.sql` - Ny database-struktur
2. `supabase/import-songs.sql` - Import av 7 sanger
3. `supabase/fix-public-access.sql` - Offentlig lesing av sanger
4. `supabase/add-nickname-column.sql` - Kallenavn-kolonne
5. `supabase/add-roles-system.sql` - Rollehåndtering (admin + editor)

## 🔗 Nyttige lenker
- Live: https://ingve.com
- Supabase Dashboard: https://supabase.com/dashboard
- GitHub Repo: https://github.com/FreyBear/KorTone
- GitHub Actions: https://github.com/FreyBear/KorTone/actions
