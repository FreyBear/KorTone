# KorTone - Digital stemmegaffel for ingve.com

KorTone er en mobil-forst webapp for et lukket kor. Løsningen gir rask tilgang til starttoner per stemme, avspilling av stemmesekvenser og enkel administrasjon av repertoar.

## Prosjektstatus
- Fase: Grunnlag og spesifikasjon
- Malkonfigurasjon: Dokumentasjon + databaseoppsett + deployplan
- Domene: ingve.com
- Hosting: One.com (statisk webhotell)

## Avklart MVP (v1)
- Sokevisning med live-filter i tittel, kallenavn og tekstutdrag.
- Avspilling av enkel stemmetone (S, A, T, B).
- Avspilling av lagret sekvens, med 4 taktslag hvis tempo finnes.
- Fast stemmegaffel-knapp nederst til hoyre (A=440Hz, fade-out).
- Dark mode-toggle.
- Admin-innlogging med Google via Supabase Auth.
- Inline redigering av sanger for administratorer.

Ikke i MVP:
- Flerkor/multitenancy.
- Avansert rettighetsmodell utover admin/ikke-admin.
- Avansert mediebibliotek utover toneavspilling og eventuelle eksterne lenker.

## Teknisk retning
- Frontend: Next.js med statisk eksport.
- Styling: Tailwind CSS (slate/indigo i henhold til designspesifikasjon).
- Lydmotor: Tone.js.
- Sok: Fuse.js.
- Backend: Supabase (Auth + Postgres + RLS).

## Adminmodell
- Innlogging med Google i Supabase.
- Roller styres i egen tabell for brukerroller.
- Klient sjekker rolle for adminfunksjoner.
- RLS beskytter skriveoperasjoner server-side.

## Dataflyt
- Primar flyt ved oppstart: import fra CSV/JSON til tabellen songs.
- Sekundar flyt: vedlikehold direkte i app (inline editing).

## Anbefalt deploy til One.com
Anbefaling: statisk eksport av Next.js + automatisk opplasting via GitHub Actions (FTP/SFTP), med manuell fallback.

Begrunnelse:
- Gir repeterbar deploy.
- Reduserer manuelle feil.
- Passer statisk webhotell.

Detaljer ligger i docs/DEPLOYMENT_ONE_COM.md.

## Miljovariabler
Se .env.example for forventede variabler.
For Supabase: bruk NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY som standard.
NEXT_PUBLIC_SUPABASE_ANON_KEY kan brukes som fallback i eldre oppsett.

## Planlagte filer i dette grunnlaget
- SPEC.md: konkret funksjonell og teknisk spesifikasjon.
- ARCHITECTURE.md: komponentoversikt og dataflyt.
- supabase/schema.sql: tabeller og indekser.
- supabase/policies.sql: RLS-policyer.
- data/songs.template.json: importmal for sangdata.
- docs/DEPLOYMENT_ONE_COM.md: deployoppskrift.

## Neste milepael
1. Opprette Next.js app med Tailwind og grunnlayout.
2. Koble Supabase-klient, auth og rollekontroll.
3. Implementere sangliste, sok og toneavspilling.
4. Implementere admin inline editing og importskript.
5. Sette opp CI-basert deploy til One.com.
