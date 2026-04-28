# KorTone - Spesifikasjon

## 1. Produktmal
- Produkt: Digital stemmegaffel for lukket kor.
- Domene: ingve.com.
- Primarplattform: Mobil nettleser.
- Malgruppe: Korister og dirigent/admin.

## 2. Omfang
### 2.1 Inkludert i MVP
- Sokevisning av sanger med livefilter.
- Avspilling av enkelttoner per stemme (S, A, T, B).
- Avspilling av definert sekvens.
- Visuell markering av hvilken stemme som spilles.
- Fast stemmegaffel-knapp (A=440Hz) med hold-for-avspilling og fade-out pa release.
- Dark mode-toggle.
- Favicon med musikknote.
- Google-innlogging for admin.
- Inline redigering for admin.
- Oppstartsimport fra CSV/JSON.

### 2.2 Utenfor MVP
- Multitenancy (flere kor i samme losning).
- Komplekst tilgangssystem utover admin/ikke-admin.
- Native mobilapp.

## 3. Design og UI
### 3.1 Farger (Tailwind)
- Light mode:
  - Bakgrunn: bg-slate-50
  - Kort: bg-white
  - Tekst: text-slate-900
- Dark mode:
  - Bakgrunn: bg-slate-950
  - Kort: bg-slate-900
  - Tekst: text-slate-50
- Aksent:
  - Interaktive elementer: bg-indigo-600

### 3.2 Komponentkrav
- Sticky sokefelt i topp.
- Sangkort med:
  - Tittel.
  - Rad med stemmeknapper: S, A, T, B.
  - Tydelig aktiv-state pa stemmeknapp under avspilling.
  - Knapp for Spill sekvens (play-ikon), egen rad pa mobil.
- Flytende stemmegaffelknapp nederst til hoyre.

### 3.3 Responsivitet og bruk
- Mobil-forst layout.
- Optimalisert for en-hands bruk.
- Tap targets minimum 44x44 px.
- Stemmeknapper skal vaere kvadratiske pa mobil og desktop.
- Aktiv knappemarkering skal ikke endre layoutstorrelse.

## 4. Funksjonelle krav
### 4.1 Sok
- Sok skal reagere fortlopende ved input.
- Sok skal matche i title, nickname og lyrics_snippet.
- Fuzzy matching med Fuse.js.

### 4.2 Lyd
- Klikk pa stemmeknapp spiller kun valgt tone.
- Spill sekvens spiller i lagret rekkefolge.
- Sekvensoppstart viser aktiv stemme fortlopende i UI.
- Standard instrument ved forste last: Piano.

### 4.3 Stemmegaffel
- FAB starter A4 (440Hz) nar knapp holdes inne.
- FAB slipper tonen med fade-out nar knapp slippes.
- Skal fungere for mus (down/up/leave) og touch (start/end).

### 4.4 Admin
- Innlogging via Supabase Auth med Google.
- Adminrolle verifiseres mot user_roles-tabell.
- Kun admin kan opprette/endre sanger.

## 5. Datamodell (Supabase)
### 5.1 Tabell songs
- id (uuid, pk)
- title (text, not null)
- nickname (text)
- lyrics_snippet (text)
- tempo_bpm (int)
- sequence (text[])
- pitches (jsonb)
- dropbox_url (text)
- created_at (timestamptz)
- updated_at (timestamptz)

### 5.2 Tabell user_roles
- user_id (uuid, pk, referanse til auth.users)
- role (text, forventet verdi: admin)
- created_at (timestamptz)

## 6. Sikkerhet
- Row Level Security aktiv pa songs og user_roles.
- Lesing av songs: tillatt for autentiserte brukere.
- Skriving til songs: kun brukere med adminrolle.
- user_roles oppdateres kun av service role eller dedikert adminflyt.

## 7. Teknisk arkitektur
- Frontend: Next.js statisk eksport.
- Hosting: One.com statisk webhotell.
- Backend: Supabase klientintegrasjon.
- Lyd: Tone.js.
- Sok: Fuse.js.

Implementert dataflyt na:
- CSV-kilde i sanger.csv.
- Konvertering via scripts/parse-sanger.js.
- JSON-bibliotek i data/sanger-library.json.
- Fallback-lastepunkt i lib/songData.ts.

## 8. Deploykrav
- Bygg skal produsere statiske filer.
- Publisering til one.com automatiseres via GitHub Actions + SSH/rsync.
- Deploy skal bruke rsync --delete for a fjerne foreldede filer.
- Root-oppsel skal styres med .htaccess.
- Manuell opplasting skal fungere som fallback.

## 9. Kvalitetskrav
- Forste visning pa mobil skal oppleves responsiv.
- Lydavspilling skal fungere i moderne mobilnettlesere etter brukerinteraksjon.
- Design skal fungere i lys og mork modus.

## 10. Akseptansekriterier (MVP)
- Bruker finner sang ved sok innen fa tastetrykk.
- Bruker kan spille enkelttoner for alle stemmer pa et sangkort.
- Bruker kan spille sekvens for en sang.
- Bruker ser tydelig hvilken stemme som spilles under avspilling.
- Stemmegaffel spiller sa lenge knapp holdes inne, og fader ut pa slipp.
- Admin kan logge inn og redigere minst ett felt pa en sang.
- Losningen er tilgjengelig pa ingve.com etter deploy.