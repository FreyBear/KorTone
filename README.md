# KorTone - Digital stemmegaffel for ingve.com

KorTone er en mobil-forst webapp for korister. Løsningen gir rask tilgang til starttoner per stemme, sekvensavspilling og stemmegaffel (A440).

## Status na
- Appen er bygget og deployes automatisk til one.com via GitHub Actions.
- Produksjon kjører pa www.ingve.com.
- 51 sanger fra CSV er konvertert til app-format og brukt som fallback-data.
- Lint og build er gronne i repo.

## Ferdige funksjoner
- Sokevisning med live-filter i tittel, kallenavn og tekstutdrag.
- Avspilling av enkel stemmetone (S, A, T, B).
- Avspilling av sekvens per sang.
- Visuell utheving av aktiv stemmeknapp under avspilling.
- Mobiljustert knappelayout (kvadratiske stemmeknapper, egen rad for Spill sekvens).
- Stemmegaffel-knapp: spiller sa lenge knappen holdes inne, fader ut nar knappen slippes.
- Dark mode-toggle.
- Eget favicon med musikknote.

## Teknologistack
- Frontend: Next.js (App Router) med statisk eksport.
- Styling: Tailwind CSS.
- Lyd: Tone.js.
- Sok: Fuse.js.
- Backend: Supabase-klient (med fallback til lokale data).

## Data og import
- Kilde: sanger.csv i repo-roten.
- Konverteringsscript: scripts/parse-sanger.js.
- Generert bibliotek: data/sanger-library.json.
- Fallback i appen: lib/songData.ts leser data/sanger-library.json.

## Deploy
- Workflow: .github/workflows/deploy-onecom.yml.
- Bygg: npm ci + npm run build.
- Opplasting: SSH + rsync til one.com webroot.
- Rydding av gamle filer: rsync med --delete.
- Root-oppsel pa one.com styres via public/.htaccess.

## Miljovariabler
Se .env.example for forventede variabler.

Supabase:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (anbefalt)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (fallback)

## Gjenstaende arbeid (MVP)
- Kjore supabase/schema.sql og supabase/policies.sql i Supabase.
- Aktivere Google Auth-provider i Supabase.
- Legge inn admin-bruker i user_roles.
- Implementere admin-innlogging og inline redigering i UI.
- Importere data til songs-tabellen (i stedet for kun fallback JSON).

## Viktig om samtalelogger
Chat i Codespaces bor ikke vaere eneste kilde til historikk. Behold viktige beslutninger i repo-filer (README, SPEC, commits), siden de er den tryggeste langsiktige dokumentasjonen.
