# KorTone 🎵

Digital stemmegaffel for kor - utviklet for å gi korister og dirigenter rask tilgang til toner og sekvenser.

## 🌐 Live versjon
**https://ingve.com**

## 📋 Om prosjektet

KorTone er en webapplikasjon som lar korister:
- Søke etter sanger i korets repertoar
- Spille av enkelttoner for hver stemme (Sopran, Alt, Tenor, Bass)
- Avspille definerte sekvenser
- Bruke en virtuell stemmegaffel (A=440Hz)

Admins og redaktører kan logge inn for å administrere sanglisten og brukere.

## 🏗️ Teknisk stack

- **Frontend**: Next.js 16 (statisk export)
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Audio**: Tone.js
- **Søk**: Fuse.js (fuzzy search)
- **Hosting**: one.com (auto-deploy via GitHub Actions)
- **Autentisering**: Google OAuth via Supabase

## 🚀 Kom i gang

### Forutsetninger
- Node.js 18+ og npm
- Supabase-prosjekt (gratis tier fungerer fint)
- GitHub-konto for deployment

### Installasjon

1. Klon repoet:
```bash
git clone https://github.com/FreyBear/KorTone.git
cd KorTone
```

2. Installer avhengigheter:
```bash
npm install
```

3. Sett opp miljøvariabler i `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-legacy-anon-key
```

4. Sett opp database i Supabase SQL Editor:
```bash
# Kjør i rekkefølge:
supabase/schema.sql
supabase/policies.sql
supabase/add-roles-system.sql
```

5. Importer sanger fra CSV:
```bash
node scripts/import-csv-to-supabase.js
# Kopier output til Supabase SQL Editor og kjør
```

6. Start utviklingsserver:
```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000)

### Bygg for produksjon

```bash
npm run build
```

Dette genererer statiske filer i `out/` som kan hostes hvor som helst.

## 📁 Prosjektstruktur

```
KorTone/
├── app/                    # Next.js app router
│   ├── page.tsx           # Hovedside med sangliste
│   ├── layout.tsx         # Root layout
│   └── auth/callback/     # OAuth callback
├── components/            # React-komponenter
│   ├── AdminPanel.tsx     # Brukerhåndtering
│   ├── EditSongModal.tsx  # Redigering av sanger
│   ├── SearchBar.tsx      # Søkefelt
│   ├── SongCard.tsx       # Sangvisning
│   └── TuningForkFab.tsx  # Stemmegaffel-knapp
├── lib/                   # Kjernefunksjonalitet
│   ├── audio.ts           # Tone.js lydavspilling
│   ├── supabase.ts        # Supabase-klient
│   ├── types.ts           # TypeScript-typer
│   └── songData.ts        # Sangdatahåndtering
├── supabase/              # Database-skjema og policyer
│   ├── schema.sql         # Tabelldefinisjoner
│   ├── policies.sql       # Row Level Security
│   └── add-roles-system.sql  # Rollehåndtering
├── scripts/               # Verktøy
│   └── import-csv-to-supabase.js  # CSV→SQL-konverter
└── data/                  # Datakilder
    └── sanger.csv         # Sangliste (CSV)
```

## 🔐 Roller og tilgang

- **Anonym bruker**: Kan se alle sanger og spille av lyd
- **Innlogget bruker**: Samme som anonym (foreløpig)
- **Redaktør (editor)**: Kan redigere sanger
- **Admin**: Kan redigere sanger + administrere brukere og roller

## 🎵 CSV-format for sanger

```csv
Sang,Stemmer,Starttone,toneart,bpm
Helan,SATB,A F A F,F-dur,135
Halvan,TTBB,D C Bb A,F-dur,120
```

- **Sang**: Tittel
- **Stemmer**: SATB, TTBB, Unison, etc.
- **Starttone**: Sekvens av noter (mellomrom-separert)
- **toneart**: Nøkkel/toneart (valgfri)
- **bpm**: Tempo

## 🚢 Deployment

Appen deployes automatisk til one.com via GitHub Actions når du pusher til `main`.

### Nødvendige GitHub Secrets:
- `SSH_HOST`: one.com SSH-server
- `SSH_USERNAME`: SSH-bruker
- `SSH_KEY`: SSH private key
- `REMOTE_DIR`: Katalog på serveren (f.eks. `/home/ingve/public_html`)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Legacy Anon Key

Deployment tar typisk 45-55 sekunder.

## 📝 SQL-migreringer

Hvis du setter opp et nytt Supabase-prosjekt, kjør:

1. `supabase/schema.sql` - Oppretter `songs` og `user_roles` tabeller
2. `supabase/policies.sql` - Row Level Security med funksjoner
3. `supabase/add-roles-system.sql` - Rollehåndtering (admin + editor)
4. `supabase/import-songs.sql` - (valgfri) Importerer 7 eksempelsanger

## 🎹 Audiomotor

KorTone bruker Tone.js med følgende oktav-mapping:
- **Sopran (S)**: Oktav 4 (C4 = middle C)
- **Alt (A)**: Oktav 4
- **Tenor (T)**: Oktav 3
- **Bass (B)**: Oktav 3

Hvis en note ikke har spesifisert oktav (f.eks. "C" i stedet for "C4"), legges standard oktav til basert på stemmen.

## 🤝 Bidra

1. Fork repoet
2. Opprett en feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit endringene dine (`git commit -m 'Add some AmazingFeature'`)
4. Push til branchen (`git push origin feature/AmazingFeature`)
5. Åpne en Pull Request

## 📄 Lisens

Dette prosjektet er privat og eies av FreyBear.

## 🔗 Lenker

- **Live site**: https://ingve.com
- **Supabase Dashboard**: https://supabase.com/dashboard
- **GitHub Repo**: https://github.com/FreyBear/KorTone
- **GitHub Actions**: https://github.com/FreyBear/KorTone/actions

## 📞 Kontakt

For spørsmål eller support, kontakt prosjekteier via GitHub

  ```sh
  sudo dpkg -i <...>.deb
  ```

  ```sh
  sudo rpm -i <...>.rpm
  ```

  ```sh
  sudo pacman -U <...>.pkg.tar.zst
  ```
</details>

<details>
  <summary><b>Other Platforms</b></summary>

  You can also install the CLI via [go modules](https://go.dev/ref/mod#go-install) without the help of package managers.

  ```sh
  go install github.com/supabase/cli@latest
  ```

  Add a symlink to the binary in `$PATH` for easier access:

  ```sh
  ln -s "$(go env GOPATH)/bin/cli" /usr/bin/supabase
  ```

  This works on other non-standard Linux distros.
</details>

<details>
  <summary><b>Community Maintained Packages</b></summary>

  Available via [pkgx](https://pkgx.sh/). Package script [here](https://github.com/pkgxdev/pantry/blob/main/projects/supabase.com/cli/package.yml).
  To install in your working directory:

  ```bash
  pkgx install supabase
  ```

  Available via [Nixpkgs](https://nixos.org/). Package script [here](https://github.com/NixOS/nixpkgs/blob/master/pkgs/development/tools/supabase-cli/default.nix).
</details>

### Run the CLI

```bash
supabase bootstrap
```

Or using npx:

```bash
npx supabase bootstrap
```

The bootstrap command will guide you through the process of setting up a Supabase project using one of the [starter](https://github.com/supabase-community/supabase-samples/blob/main/samples.json) templates.

## Docs

Command & config reference can be found [here](https://supabase.com/docs/reference/cli/about).

## Breaking changes

We follow semantic versioning for changes that directly impact CLI commands, flags, and configurations.

However, due to dependencies on other service images, we cannot guarantee that schema migrations, seed.sql, and generated types will always work for the same CLI major version. If you need such guarantees, we encourage you to pin a specific version of CLI in package.json.

## Developing

To run from source:

```sh
# Go >= 1.22
go run . help
```
