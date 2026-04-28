# KorTone arkitektur

## Oversikt
KorTone er en statisk frontend-applikasjon som kjører på one.com, med Supabase som backend-tjeneste for autentisering og data.

## Hovedkomponenter
- Next.js frontend (statisk eksport)
- Supabase Auth (Google)
- Supabase Postgres (songs + user_roles)
- Tone.js lydavspilling i nettleser
- Fuse.js for lokalt fuzzy sok

## Dataflyt
1. Bruker laster appen fra one.com.
2. Appen henter songs fra Supabase.
3. Bruker soker i listen (Fuse.js klientside).
4. Ved klikk pa stemme/sekvens brukes Tone.js til avspilling.
5. Admin logger inn med Google.
6. Admin kan redigere songs, og endringer skrives til Supabase hvis RLS tillater.

## Sikkerhetsmodell
- Alle tabeller med RLS aktiv.
- songs: lesing for autentiserte, skriving kun for adminrolle.
- user_roles: lesing for innlogget bruker (egen rolle), skriving via service role eller kontrollert adminflyt.

## Deploymodell
- Bygg med Next.js statisk eksport.
- Publiser output til one.com.
- Anbefalt: GitHub Actions for automatisk publisering.

## Strukturforslag for appkode
- app/: sider/layout
- components/: UI-komponenter
- lib/: supabase-klient, lydmotor, sokelogikk
- types/: TypeScript-typer for songs og roller
- scripts/: import/vedlikehold
