# KorTone - Spesifikasjon

## 1. Produkt
- Produkt: Digital stemmegaffel og sangoversikt for kor.
- Domene: https://ingve.com
- Primarplattform: Mobil nettleser (responsive desktop).
- Malkgruppe: Korister, dirigent, redaktor og admin.

## 2. Omfang

### 2.1 Inkludert
- Sokevisning av sanger med live-filter.
- Avspilling av enkelttoner per stemme.
- Avspilling av sekvens per sang.
- Stemmegaffel (A4) via flytende knapp.
- Flytende piano via egen knapp for referansetoner (to oktaver, C4-H5).
- Mork/lys modus.
- Google-innlogging med roller (`admin`, `editor`).
- Opprette og redigere sanger i UI for roller med redigeringsrett.
- Bruker- og rolleadministrasjon for admin.

### 2.2 Utenfor
- Multitenancy
- Native app
- Avansert noteredigering (MusicXML/ABC)

## 3. Funksjonelle krav

### 3.1 Sok
- Sok matcher i `title`, `nickname`, `voices`, `key_signature`.
- Sok oppdateres fortlopende under input.

### 3.2 Stemmeavspilling
- Stemmeknapper genereres dynamisk fra nokler i `pitches`.
- Stemmeknapper vises i naturlig rekkefolge: `S1, S2, S, A1, A2, A, T1, T2, T, Bar, B1, B2, B`.

### 3.3 Sekvensavspilling
- `sequence` stotter tokenformat: `NOTE[:DURATION]`.
- Eksempel: `C4:2n C4 A4:4n R:4n`.
- Manglende duration skal tolkes som `4n`.
- `R`/`REST` representerer pause.
- Duration-notasjon folger Tone.js (f.eks. `1n`, `2n`, `4n`, `8n`, `4n.`, `8t`).

### 3.4 Piano og noteinput
- Flytende piano skal kunne spille referansetoner med norsk notasjon og flere samtidige toner.
- Piano skal bruke samme aktive lydmodus som resten av appen.
- I `Rediger sang` skal sekvensfeltet kunne fylles via et eget piano-panel.
- Piano-input i `Rediger sang` skal legge noter bakerst i sekvensen med valgt notelengde.
- Standard valgt notelengde i sekvens-piano er `1/4` (`4n`).
- Ved valgt `1/4` lagres noten uten eksplisitt `:4n`.
- `Pause` i sekvens-piano skal legge til `R` eller `R:DURATION` avhengig av valgt notelengde.

### 3.5 Pitches-redigering
- `pitches` lagres som `jsonb` i databasen.
- I `Rediger sang` skal brukeren redigere pitches via en strukturert liste med radene `stemme` + `tone`.
- UI skal forhindre halvutfylte rader.
- UI skal forhindre dupliserte stemmer.
- UI kan bruke piano til a velge tone for en pitch-rad.

### 3.6 Roller
- `admin`:
  - Kan opprette/redigere sanger
  - Kan administrere brukere og roller
- `editor`:
  - Kan opprette/redigere sanger
  - Kan ikke administrere brukere og roller
- Anonyme brukere:
  - Kan lese og spille av

## 4. Datamodell (Supabase)

### 4.1 songs
- `id` (uuid, pk)
- `title` (text, not null)
- `nickname` (text, nullable)
- `voices` (text, not null)
- `sequence` (text[])
- `pitches` (jsonb)
- `key_signature` (text, nullable)
- `tempo_bpm` (int)
- `created_at`, `updated_at` (timestamptz)

### 4.2 user_roles
- `user_id` (uuid, pk, ref auth.users)
- `role` (text; `admin` eller `editor`)
- `created_at` (timestamptz)

## 5. Sikkerhet (RLS)
- `songs.select`: alle
- `songs.insert/update`: `can_edit_songs()`
- `songs.delete`: `is_admin()`
- `user_roles`: kun admin

## 6. Audio
- Standardmodus: Sampler-basert flygel.
- Tilgjengelige moduser: `grandPiano`, `stringsPad`, `electricPiano`, `organ`, `sine`.
- Noter uten eksplisitt oktav faar automatisk oktav basert pa stemmeprefix.

## 7. UX-krav
- Mobil-forst layout.
- Tap-targets minimum 44x44 px.
- Headerkontroller skal ikke skape horisontal overflow pa mobil.
- Dropdowns i dark mode skal ha god kontrast.
- Redigeringsflyter skal prioritere strukturerte inputflater framfor fri JSON der dette reduserer feil.
- Flytende paneler/bottom sheets skal ikke skape blank skjerm eller ustabil rendering pa mobil ved orienteringsbytte.

## 8. Deploykrav
- Statisk eksport via Next.js build.
- Automatisk deploy ved push til `main`.
- Workflow skal vaere kompatibel med Node 24-runtime for GitHub actions.

## 9. Akseptansekriterier
- Bruker finner sanger raskt via sok.
- Bruker kan spille av alle relevante stemmer for en sang (inkl. nummererte stemmer).
- Sekvenser med blandede notelengder spilles korrekt.
- Bruker kan spille referansetoner via flytende piano.
- Editor/admin kan fylle sekvens via piano-input i `Rediger sang`.
- Editor/admin kan opprette ny sang fra UI.
- Admin kan tildele/fjerne roller.
- Losningen er tilgjengelig pa ingve.com etter deploy.
