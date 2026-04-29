# KorTone

Digital stemmegaffel for kor med Supabase-backend og statisk deploy til one.com.

## Live
- https://ingve.com

## Hovedfunksjoner
- Sok i sangliste (Fuse.js)
- Dynamiske stemmeknapper basert pa `pitches`
- Naturlig stemmerekkefolge (S1 -> ... -> B)
- Sekvensavspilling med notelengder, f.eks. `C4:2n A4:4n R:4n`
- Flere lydmoduser:
  - Flygel (Sampler)
  - Stryk-pad
  - Elpiano
  - Orgel
  - Sinus
- Mork/lys modus
- Google-innlogging med roller:
  - `admin`: bruker- og rolleadministrasjon + sangredigering
  - `editor`: sangredigering + oppretting av nye sanger

## Teknologi
- Next.js 16 (App Router, statisk eksport)
- Tailwind CSS
- Supabase (Postgres + Auth + RLS)
- Tone.js
- Fuse.js

## Lokal utvikling

### Krav
- Node.js 20+
- npm
- Supabase-prosjekt

### 1) Installer
```bash
npm install
```

### 2) Miljovariabler
Opprett `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<legacy-anon-key>
# valgfritt alternativt navn som appen ogsa stotter:
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

### 3) Sett opp database
Kjor SQL-filer i Supabase SQL Editor:
1. `supabase/schema.sql`
2. `supabase/policies.sql`
3. `supabase/add-roles-system.sql`

Ved behov i eldre miljo:
- `supabase/fix-admin-access.sql`
- `supabase/fix-public-access.sql`

### 4) Start app
```bash
npm run dev
```

### 5) Verifiser
```bash
npm run lint
npm run build
```

## Sangdata

### Sekvensformat
`sequence` lagres som liste med tokens.

Eksempler:
- `C4` -> tolkes som `C4:4n` (default)
- `A4:2n` -> halvnote
- `R:4n` eller `REST:4n` -> pause

Stottede varighetsformer folger Tone.js-notasjon (f.eks. `1n`, `2n`, `4n`, `8n`, `4n.`, `8t`).

### Pitches-format
`pitches` er JSON med stemme->tone mapping.

Eksempel:
```json
{
  "S1": "A",
  "S2": "F",
  "A": "D",
  "T1": "A",
  "B": "F"
}
```

## Deploy
Deploy skjer automatisk via GitHub Actions ved push til `main`.

Workflow:
- [Deploy to one.com](.github/workflows/deploy-onecom.yml)

### Nodvendige GitHub Secrets
- `ONECOM_HOST`
- `ONECOM_USERNAME`
- `ONECOM_PASSWORD`
- `ONECOM_PORT` (valgfri, default 22)
- `ONECOM_REMOTE_PATH` (valgfri)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (valgfri)

## Prosjektstruktur
- [app](app)
- [components](components)
- [lib](lib)
- [supabase](supabase)
- [scripts](scripts)
- [data](data)

## Lisens
Privat prosjekt (FreyBear).
