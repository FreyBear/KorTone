# KorTone - Status og neste steg

## Sist oppdatert
- 2026-05-03

## Fullfort nylig

### Produkt og UI
- [x] Brand oppdatert i header: "Asta La Vista"
- [x] Mobilvennlig header-layout (kontroller wraper pa sma skjermer)
- [x] Mork modus-forbedring for lydvelger dropdown (bedre kontrast)
- [x] `alert()` erstattet med toast-varsler i UI-flyt for oppretting/redigering/admin

### Roller og administrasjon
- [x] Stotte for roller: `admin` og `editor`
- [x] AdminPanel for bruker- og rolleadministrasjon
- [x] Redaktor/admin kan redigere sanger i UI
- [x] Redaktor/admin kan opprette nye sanger i UI (`AddSongModal`)

### Sanger og avspilling
- [x] Dynamiske stemmeknapper basert pa `pitches`-nokkler
- [x] Naturlig stemmerekkefolge i UI: S1, S2, S, A1, A2, A, T1, T2, T, Bar, B1, B2, B
- [x] Sekvensformat stotter varighet per note (`C4:2n`, `A4:4n`)
- [x] Bakoverkompatibilitet for sekvens: token uten varighet tolkes som `:4n`
- [x] Pauser i sekvens stottes (`R:4n` eller `REST:4n`)

### Lydmotor
- [x] Sampler-basert flygel (Salamander) som standard
- [x] Flere lydmoduser: `grandPiano`, `stringsPad`, `electricPiano`, `organ`, `sine`
- [x] Erstattet `choirPad` med `stringsPad`
- [x] Legacy mapping i localStorage (eldre verdier mappes automatisk)

### CI/CD
- [x] Fix for build-feil i audio-typing
- [x] Oppdatert GitHub Actions til `actions/checkout@v5` og `actions/setup-node@v5`
- [x] Node 24 runtime for JavaScript actions i workflow

## Gjenstaende oppgaver

### Hoy prioritet
- [ ] Legg til slett sang-funksjon (kun admin) med bekreftelsesdialog
- [ ] Bedre validering i "Ny sang"/"Rediger sang" (sekvensformat + streng validering av pitches-struktur utover JSON-parse)

### Medium prioritet
- [ ] Egen filter-UI for stemmetype (`voices`) og toneart (fritisok dekker delvis)
- [ ] Duplikatsjekk ogsa ved redigering av sang (oppretting har allerede sjekk pa tittel + voices)
- [ ] Forbedret mobilvisning i AdminPanel
- [ ] Volumkontroll for avspilling

### Lav prioritet
- [ ] Bulk-import i UI (CSV/JSON) for redaktor/admin
- [ ] Historikk/favoritter per bruker
- [ ] Keyboard shortcuts for avspilling

## Drift og SQL

For nytt miljo/prosjekt, verifiser at disse er kjort i Supabase:
1. `supabase/schema.sql`
2. `supabase/policies.sql`
3. `supabase/add-roles-system.sql`
4. `supabase/fix-admin-access.sql` (hvis behov i eksisterende miljo)

## Nyttige lenker
- Live: https://ingve.com
- Repo: https://github.com/FreyBear/KorTone
- Actions: https://github.com/FreyBear/KorTone/actions
