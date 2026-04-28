# KorTone - Endringslogg

## [Siste commit: 3ac9c1c] - 2026-04-28

### 🎵 Bass får nå samme oktav som Tenor (oktav 3)

**Endringer:**
- Endret `voiceOctave` mapping i `/lib/audio.ts`: B: 3 (tidligere 2)
- Bass og Tenor spiller nå i samme oktav når oktav ikke er spesifisert
- Før: C for Bass → C2, C for Tenor → C3
- Nå: C for Bass → C3, C for Tenor → C3
- Fortsatt mulig å spesifisere eksplisitt oktav (C2, C3, C4)

**Bakgrunn:**
Bruker korrigerte tidligere antakelse om at Bass skulle være to oktaver lavere enn Sopran. Bass og Tenor skal være i samme oktav (oktav 3) når oktav ikke er eksplisitt spesifisert.

---

## [Januar 2026] - Større omstrukturering

### ✅ Fullført funksjoner

#### Database & Infrastruktur
- Opprettet Supabase-prosjekt med PostgreSQL
- Ny database-struktur basert på CSV-import (sanger.csv)
- Migrert fra nickname/lyrics_snippet til voices/key_signature/sequence
- Auto-deployment via GitHub Actions til one.com (~45-55 sekunder)

#### Autentisering
- Google OAuth fungerer via Supabase
- Redirect URLs konfigurert (https://ingve.com/auth/callback)
- Bruker Legacy Anon Key (IKKE Publishable key)
- Diskret auth UI (text links under header)

#### Roller & Tilgang
- Rollehåndtering: `admin` og `editor` (redaktør)
- AdminPanel for brukerhåndtering
- Admin kan se alle brukere og tildele roller
- Editor kan redigere sanger, men ikke administrere brukere
- Offentlig visning (alle kan se sanger uten innlogging)

#### Sanger & Data
- 7 sanger importert fra CSV (Helan, Halvan, Tersen, etc.)
- Søkbart kallenavn-felt (vises ikke i UI)
- Import-script: `scripts/import-csv-to-supabase.js`
- Støtte for SATB, TTBB og Unison-arrangementer

#### Redigering
- EditSongModal for admin/editor
- Kan redigere: tittel, kallenavn, voices, sekvens, toneart, BPM, pitches
- Pitches sorteres i S-A-T-B rekkefølge (ikke alfabetisk)
- Dialog lukker automatisk etter vellykket lagring
- Feilhåndtering med tydelige meldinger
- Fallback-logikk for manglende can_edit_songs() funksjon

#### Audio & Playback
- Sequence-playback fungerer (A C F A spiller riktig)
- Oktav-mapping: S=4, A=4, T=3, B=3
- Default oktav 4 for noter uten oktav-spesifikasjon
- toNote() legger til stemme-spesifikk oktav automatisk
- Støtte for både "C" og "C4" notasjon

### 🚧 Under diskusjon

#### Fleksibelt voice-system
- Støtte for nummererte stemmer (S1, S2, A1, A2, T1, T2, B1, B2)
- Voice type som string i stedet for enum 'S'|'A'|'T'|'B'
- Komplekse arrangements:
  - ASSA = A1, S1, S2, A2 (spesifikk rekkefølge)
  - TTBB = T1, T2, B1, B2
- Intelligent oktav-gjetting basert på prefix (S* → 4, A* → 4, T* → 3, B* → 3)

### 📝 Kjente problemer løst

#### OAuth-feil: "No API key found in request"
**Løsning:** Bytt til Legacy Anon Key (fra API Settings) i stedet for Publishable key

#### Redirect til localhost:3000
**Løsning:** Bruk runtime `window.location.origin` i getSupabase() callback, ikke build-time URL

#### React hydration error #418 (ThemeToggle)
**Løsning:** Legg til mounted state check før rendering av auth buttons

#### 403 på /auth/callback
**Løsning:** Legg til eksplisitt RewriteRule i .htaccess for extensionless URLs

#### Sekvens spiller ikke korrekt
**Løsning:** toNote() legger nå til default oktav 4 (eller stemme-spesifikk oktav) for noter uten oktav

#### Edit dialog lukker ikke etter lagring
**Løsning:** Fjern finally block, sett isSaving=false eksplisitt i success/error branches

#### Admin mister redigeringsrettigheter
**Løsning:** Fallback-logikk hvis can_edit_songs() ikke eksisterer, bruk isAdmin

#### Pitches vises i alfabetisk rekkefølge (A,B,S,T)
**Løsning:** sortPitches() helper function som ordner keys som ['S','A','T','B']

#### Bass for lav (oktav 2)
**Løsning:** Endret voiceOctave B fra 2 til 3 for å matche Tenor

---

## Neste steg

1. **Voice arrangement system** (avventer beslutning)
   - Implementere fleksibel Voice typing
   - Støtte for nummererte stemmer
   - Oppdatere sortPitches() for komplekse arrangements

2. **Sang-administrasjon**
   - "Legg til ny sang"-funksjon
   - Slett sang-funksjonalitet
   - Bulk-import fra CSV via admin-panel

3. **Audio-forbedringer**
   - Metronom-funksjon
   - Volume-kontroll
   - Velg instrument

4. **UX-forbedringer**
   - Loading-tilstander
   - Toast-meldinger i stedet for alert()
   - Keyboard shortcuts

5. **Søk & Filter**
   - Filter på voices (SATB, TTBB, Unison)
   - Filter på toneart
   - Sortering (alfabetisk, nyeste først)
