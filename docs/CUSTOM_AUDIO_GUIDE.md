# Egne lydfiler i KorTone (Kevin-instrument)

Denne guiden viser hvordan du lager egne vokal-lydfiler for et eget instrument: Kevin (Vokal-sampler).

## Hva systemet bruker i dag

Lydsystemet leses fra [lib/audio.ts](../lib/audio.ts).

Instrumentene er separerte:

1. Flygel (Sampler): bruker [public/audio/piano-lite](../public/audio/piano-lite), ellers fjernkilde.
2. Kevin (Vokal-sampler): bruker [public/audio/Kevin](../public/audio/Kevin), ellers fallback til Flygel.

Disse fire filene brukes:

- C4.mp3
- Ds4.mp3
- Fs4.mp3
- A4.mp3

Merk:

- Filnavnene ma vaere eksakte (store/sma bokstaver og endelse).
- Ds4 betyr D#4, og Fs4 betyr F#4.
- Flygel og Kevin er to ulike lydmoduser i UI.
- Kevin-filer overskriver ikke filene i [public/audio/piano-lite](../public/audio/piano-lite).

## Krav til format

Anbefalt format for best kompatibilitet:

- Filtype: MP3
- Samplerate: 44.1 kHz eller 48 kHz
- Bitdybde i prosjektfil: 24-bit er fint (eksporteres til MP3 ved slutt)
- Kanal: Mono eller stereo (mono holder ofte)
- Niva: unnga clipping, la peak ligge rundt -1 dB
- Lengde: 2-8 sekunder er vanligvis nok for piano-sample med naturlig utklinging

Appen forventer MP3 akkurat na fordi URL-kartet i [lib/audio.ts](../lib/audio.ts) peker til .mp3-filer.

## Steg for steg: lag egne filer

1. Spill inn eller render fire toner: C4, D#4, F#4 og A4.
2. Rens opptakene (kutt stillhet i starten, fjern stoy ved behov).
3. Juster nivaa jevnt mellom filene.
4. Eksporter til MP3 med disse filnavnene:
   - C4.mp3
   - Ds4.mp3
   - Fs4.mp3
   - A4.mp3
5. Legg filene i [public/audio/Kevin](../public/audio/Kevin).
6. Start appen pa nytt (eller hard refresh i nettleser).
7. Velg lydmodus Kevin (Vokal-sampler) i UI og test noter i piano-panelet.

## Audacity-oppsett for vokalopptak

Dette er anbefalt arbeidsflyt hvis du synger tonene selv.

1. Aapne Audacity og sett prosjektfrekvens nederst til 44100 Hz.
2. Velg mikrofonen din som input og sett opptak til Mono.
3. Spill inn i et stille rom, med jevn avstand til mikrofonen (ca. 10-20 cm).
4. Lag referansetoner i Audacity via Generate -> Tone:
   - C4
   - D#4
   - F#4
   - A4
   Bruk gjerne Sine-wave, 3-5 sekunder per tone.
5. Spill av en referansetone, syng samme tone og ta opp pa nytt spor.
6. Ta 2-3 takes per tone, velg den beste.
7. Rydd opptaket:
   - kutt bort stillhet i starten
   - behold naturlig utklinging pa slutten
   - bruk Fade Out siste 100-300 ms ved behov
8. Jevn ut nivaa med Effect -> Normalize (f.eks. -1.0 dB peak).
9. Eksporter hver tone som egen fil via File -> Export -> Export Audio (MP3).
10. Gi filene eksakte navn og legg dem i [public/audio/Kevin](../public/audio/Kevin):
   - C4.mp3
   - Ds4.mp3
   - Fs4.mp3
   - A4.mp3

## Tuning-tips for sangstemme

- Hvis tonen driver, syng kortere og mer stabilt (2-4 sekunder holder ofte).
- Unnga kraftig vibrato; rett tone gir bedre resultat i sampler.
- Bruk helst samme vokal (for eksempel "ah") pa alle tonene for jevn klang.
- Hvis en tone blir for lys/mork sammenlignet med resten, juster med Effect -> Amplify eller ta opp pa nytt.

## Hvordan verifisere at dine filer brukes

Slik sjekker du raskt at lokale filer faktisk er aktive:

1. Aapne appen og velg Kevin (Vokal-sampler).
2. Spill av noen noter.
3. Endre en av filene tydelig (for eksempel kortere decay), refresh, og spill samme noter igjen.
4. Hvis lyden endres, er lokal sampler i bruk.

Tips: appen sjekker tilgjengelighet med en HEAD mot C4.mp3. Derfor er det ekstra viktig at akkurat den filen finnes.

## Vanlige feil

- Feil filnavn: D#4.mp3 i stedet for Ds4.mp3.
- Feil mappe: for Kevin-instrumentet skal filene ligge i [public/audio/Kevin](../public/audio/Kevin).
- Ugyldig/korrupt MP3: filen finnes, men kan ikke dekodes.
- Niva for hoyt: gir forvrengning i avspilling.

## Utvide med flere samples (valgfritt)

Vil du ha jevnere kvalitet over storre toneomrade, kan du legge til flere rot-noter.

Da ma du:

1. Legge til flere sample-filer i [public/audio/Kevin](../public/audio/Kevin).
2. Utvide KEVIN_VOCAL_URLS i [lib/audio.ts](../lib/audio.ts), for eksempel med E4, G4, C5 osv.
3. Beholde samsvar mellom notenokkel og filnavn.

Flygel-instrumentet styres separat av GRAND_PIANO_URLS i [lib/audio.ts](../lib/audio.ts).

Eksempel pa monster:

- E4: E4.mp3
- G4: G4.mp3
- C5: C5.mp3

Jo tettere sample-nett du har, jo mindre pitch-shifting og mer naturlig klang.