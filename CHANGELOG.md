# KorTone - Endringslogg

## [2026-05-03]

### Lagt til
- Flytende piano pa hovedsiden med to oktaver, norsk notasjon og støtte for flere samtidige toner.
- Gjenbrukbar `PianoSheet`-komponent for piano UI i flere deler av appen.
- Sekvens-piano i `Rediger sang` med notelengdevelger, `Backspace` og `Pause`.
- Strukturert pitches-editor i `Rediger sang` med rader for stemme og tone.
- Piano-basert tonevalg for pitches i `Rediger sang`.

### Endret
- Notelengdevelger i sekvens-piano viser brokformat (`1`, `1/2`, `1/4`, `1/8`) i stedet for Tone.js-notasjon.
- Ved valgt `1/4` lagres sekvenstoken uten eksplisitt `:4n` fordi dette er standard i systemet.
- Pitch-rader i `Rediger sang` er gjort mer kompakte og plassert pa en linje.

### Fikset
- Ustabil mobil-rendering i `Rediger sang` ved skjulte/faste piano-paneler og orienteringsbytte.

## [2026-04-29]

### Lagt til
- Ny modal for oppretting av sanger i UI for `editor` og `admin`.
- Stotte for sekvensvarighet per note (`note:duration`) i avspilling.
- Stotte for pauser i sekvens (`R:4n` / `REST:4n`).

### Endret
- Stemmeknapper hentes dynamisk fra `pitches` i stedet for fast SATB.
- Stemmeknapper sorteres i naturlig korrekkefolge (S1..B).
- Default lydmotor endret til Sampler-basert flygel (Salamander).
- Lydmoduser oppdatert til: `grandPiano`, `stringsPad`, `electricPiano`, `organ`, `sine`.
- `choirPad` erstattet av `stringsPad` med bakoverkompatibel mapping.
- Header gjort mer mobilvennlig med wrapping av kontroller.
- Forbedret kontrast i lydvelger-dropdown i dark mode.
- Brandtekst i header endret til "Asta La Vista".

### Fikset
- Build-feil i `lib/audio.ts` knyttet til Tone.js PolySynth typing.
- Flere lint-feil i app og komponenter (hooks, escaping, Link-bruk).

### Drift/CI
- GitHub Actions oppdatert til `actions/checkout@v5` og `actions/setup-node@v5`.
- Workflow konfigurert for Node 24 runtime for JavaScript actions.

## [2026-01]

### Plattform
- Supabase-integrasjon med songs + user_roles.
- Google OAuth via Supabase.
- RLS-policyer for offentlig lesing og rollebasert skriving.
- Auto-deploy til one.com via GitHub Actions.
