# Import av sangdata

## Eksporter dagens database til CSV-mal
Ja, dette er mulig og anbefalt nar du vil bulk-importere med samme struktur som appen bruker.

Kjor:
- `node scripts/export-songs-template.js`

Output:
- `data/songs.import-template.csv`

CSV-malen inneholder kolonnene:
- `title`
- `nickname`
- `voices`
- `sequence` (JSON-array)
- `pitches` (JSON-objekt)
- `key_signature`
- `tempo_bpm`

Deretter kan du redigere fila og importere tilbake via:
- `node scripts/import-csv-to-supabase.js data/songs.import-template.csv`

## Oppdatering vs nye rader (UPSERT)
Importscriptet bruker na UPSERT i stedet for bare INSERT:
- Hvis `title + voices` finnes fra for, blir raden oppdatert.
- Hvis kombinasjonen ikke finnes, blir ny sang opprettet.

For at dette skal fungere maa databasen ha unik constraint paa `title + voices`.
Kjor denne en gang i Supabase:
- `supabase/add-songs-upsert-constraint.sql`

Merk: hvis databasen allerede har duplikater paa `title + voices`, vil constraint-scriptet stoppe med feil. Da maa du rydde duplikatene forst.

## Validering for import
For SQL genereres valideres CSV automatisk. Import avbrytes hvis noe er feil.

Validering inkluderer:
- `title` og `voices` maa vaere satt
- `sequence` maa vaere ikke-tom array med gyldige tokens (f.eks. `C4:2n`, `Eb:4n`, `R:4n`)
- `pitches` maa vaere ikke-tomt JSON-objekt med gyldige noter
- `tempo_bpm` maa vaere positivt heltall
- duplikater i samme CSV paa `title + voices` stoppes

## Stottet startformat
- JSON (anbefalt)
- CSV (kan konverteres til JSON for enklere validering)

## CSV i dette repoet
- Kilde: sanger.csv
- Konvertering: node scripts/parse-sanger.js
- Output: data/sanger-library.json

## JSON-mal
Se data/songs.template.json.

## Feltkrav
- title: pakrevd tekst
- nickname: valgfri tekst
- lyrics_snippet: valgfri tekst
- tempo_bpm: valgfri heltall
- sequence: liste med stemmer, f.eks. ["B", "T", "A", "S"]
- pitches: objekt med tone per stemme, f.eks. {"S":"E4","A":"C4","T":"G3","B":"E2"}
- dropbox_url: valgfri URL

## Anbefalt importprosess
1. Oppdater sanger.csv.
2. Kjor node scripts/parse-sanger.js > data/sanger-library.json.
3. Valider JSON lokalt mot malstrukturen.
4. Kjor kontroll pa at sequence kun inneholder S/A/T/B.
5. Kjor kontroll pa at pitches inneholder gyldige notenavn.
6. Last opp til Supabase via SQL, script eller dashboard.
7. Verifiser i appen med sok og avspilling.

## Kvalitetssjekk etter import
- Minst 1 sang har komplett S/A/T/B i pitches.
- Minst 1 sang har tempo_bpm for metronomtest.
- Sok gir forventet treff pa title og nickname.
