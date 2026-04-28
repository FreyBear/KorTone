# KorTone – Gjenstående oppgaver

## 1. Supabase-oppsett

- [ ] Opprett prosjekt på [supabase.com](https://supabase.com) om ikke gjort
- [ ] Kjør `supabase/schema.sql` i Supabase SQL-editor (tabeller: `songs`, `user_roles`, indekser, trigger)
- [ ] Kjør `supabase/policies.sql` i Supabase SQL-editor (Row Level Security)
- [ ] Legg inn miljøvariabler i GitHub-repoet (Settings → Secrets → Actions):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Verifiser at appen henter live data fra Supabase (statuslinje i header skal si "Koblet til Supabase")

## 2. Google-innlogging

- [ ] Gå til Supabase → Authentication → Providers → Google
- [ ] Aktiver Google-provider og lim inn OAuth-klientnøkler fra Google Cloud Console
- [ ] Legg til `https://ingve.com` og `https://www.ingve.com` som godkjente redirect-URLer i Supabase
- [ ] Test innlogging på live-nettsiden

## 3. Importer sanger til Supabase

- [ ] Skriv et importskript (f.eks. `scripts/import-to-supabase.js`) som leser `data/sanger-library.json` og bruker Supabase service-role-nøkkel til å sette inn rader i `songs`-tabellen
- [ ] Kjør skriptet én gang for å populere basen
- [ ] Verifiser at alle 51 sanger dukker opp i appen via live-data

## 4. Adminpanel – innlogging og tilgangskontroll

- [ ] Legg til innloggingsside eller modal som starter Google OAuth-flyt (`supabase.auth.signInWithOAuth({ provider: 'google' })`)
- [ ] Etter innlogging: sjekk `user_roles`-tabellen for å bekrefte at brukeren har `role = 'admin'`
- [ ] Vis admin-kontroller kun for brukere med adminrolle
- [ ] Legg til logg-ut-knapp

## 5. Adminpanel – sanger

- [ ] Inline redigering av eksisterende sang (klikk på felt → rediger → lagre til Supabase)
  - Felter: `title`, `nickname`, `lyrics_snippet`, `tempo_bpm`, `sequence`, `pitches`, `dropbox_url`
- [ ] Opprett ny sang (tom form + lagre)
- [ ] Slett sang (med bekreftelsesdialog)
- [ ] Valider at `sequence` er gyldig array av `S | A | T | B`
- [ ] Valider at `pitches` inneholder korrekte noter for valgte stemmer

## 6. Adminpanel – brukeradministrasjon

- [ ] Legg til side/seksjon der admin kan tildele adminrolle til andre brukere (legg inn rad i `user_roles`)
- [ ] Støtte for å fjerne adminrolle

## 7. Feilhåndtering og UX

- [ ] Vis tydelig feilmelding om Supabase-kall feiler (lagring, innlogging)
- [ ] Optionistisk oppdatering av liste etter lagret sang
- [ ] Loading-tilstand på "Lagre"-knapp under API-kall

## 8. Smårydding

- [ ] Norske tegn i UI: "Mørk" i stedet for "Mork" (ThemeToggle-knapp)
- [ ] Vurder om sanger.csv fortsatt skal ligge i repoet etter DB-import, eller flyttes til `archive/`
