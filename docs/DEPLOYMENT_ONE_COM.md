# Deploy til one.com

## Anbefalt strategi
Bruk statisk eksport fra Next.js og automatisk opplasting via GitHub Actions til one.com.

Hvorfor:
- Repeterbar deploy
- Mindre manuell risiko
- Passer statisk webhotell

## Forutsetninger
- One.com FTP/SFTP-bruker
- Repo i GitHub
- Next.js konfigurert for statisk eksport

## Steg 1: Next.js statisk eksport
I next.config.ts:
- output: 'export'

Byggkommando:
- npm run build

Publiseringsmappe blir normalt out/.

## Steg 2: GitHub Secrets
Legg inn:
- ONECOM_HOST
- ONECOM_USERNAME
- ONECOM_PASSWORD
- ONECOM_PORT (valgfri, typisk 21 for FTP eller 22 for SFTP)
- ONECOM_REMOTE_PATH (eks: /public_html/)

## Steg 3: GitHub Actions
Opprett workflow som:
1. Installerer dependencies
2. Bygger statisk app
3. Laster opp out/ til one.com via FTP/SFTP action

## Steg 4: Verifisering
- Sjekk at ingve.com/ laster startsiden.
- Test hard refresh pa mobil.
- Test at klientkobling til Supabase fungerer i produksjon.

## Manuell fallback
- Kjor lokal build.
- Last opp innholdet i out/ via FTP-klient til riktig webrot.
- Bekreft at gamle filer overskrives eller ryddes for a unnga stale assets.
