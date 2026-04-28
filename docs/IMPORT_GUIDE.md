# Import av sangdata

## Stottet startformat
- JSON (anbefalt)
- CSV (kan konverteres til JSON for enklere validering)

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
1. Valider JSON lokalt mot malstrukturen.
2. Kjor kontroll pa at sequence kun inneholder S/A/T/B.
3. Kjor kontroll pa at pitches inneholder gyldige notenavn.
4. Last opp til Supabase via SQL, script eller dashboard.
5. Verifiser i appen med sok og avspilling.

## Kvalitetssjekk etter import
- Minst 1 sang har komplett S/A/T/B i pitches.
- Minst 1 sang har tempo_bpm for metronomtest.
- Sok gir forventet treff pa title og nickname.
