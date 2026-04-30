#!/usr/bin/env node

/**
 * Konverterer CSV til SQL UPSERT-statements for Supabase.
 *
 * Stotter tre formater:
 * 1) Enkel mal (anbefalt):
 *    title;nickname;voices;sequence;S;A;T;B;key_signature;tempo_bpm
 *    - sequence = mellomrom-separert liste, f.eks. C D Eb F R:4n
 *    - S/A/T/B = starttone per stemme (ingen JSON)
 *
 * 2) JSON-mal:
 *    title,nickname,voices,sequence,pitches,key_signature,tempo_bpm
 *    - sequence = JSON-array
 *    - pitches = JSON-objekt
 *
 * 3) Legacy:
 *    title,voices,starttones,key_signature,tempo_bpm
 *
 * Kjor:
 *   node scripts/import-csv-to-supabase.js
 *   node scripts/import-csv-to-supabase.js data/songs.import-template.csv
 *
 * Viktig:
 *   For UPSERT kreves unik constraint paa (title, voices).
 *   Kjor supabase/add-songs-upsert-constraint.sql en gang i databasen.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputArg = process.argv[2];
const csvPath = inputArg
  ? path.resolve(process.cwd(), inputArg)
  : path.join(__dirname, '..', 'sanger.csv');
const outputPath = path.join(__dirname, '..', 'supabase', 'import-songs.sql');

const DURATION_PATTERN = '(?:1|2|4|8|16|32)n(?:[t.]?)';
const NOTE_PATTERN = new RegExp(`^(?:[A-GH](?:#|b)?\\d?|R|REST)(?::${DURATION_PATTERN})?$`, 'i');

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function detectDelimiter(headerLine) {
  const semicolons = (headerLine.match(/;/g) || []).length;
  const commas = (headerLine.match(/,/g) || []).length;
  return semicolons > commas ? ';' : ',';
}

function parseDelimitedLine(line, delimiter) {
  if (delimiter === ',') {
    return parseCsvLine(line);
  }

  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function normalizeHeader(value) {
  return value.trim().toLowerCase();
}

function parseTempo(value) {
  const parsed = Number.parseInt(String(value || '').trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 120;
}

function escapeSql(value) {
  return String(value || '').replace(/'/g, "''");
}

function tryParseJson(value, fallback) {
  if (!value || String(value).trim() === '') {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function parseSimpleSequence(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return [];
  }

  return raw.split(/\s+/).filter(Boolean);
}

function parseSimplePitches(row) {
  const map = [
    ['s', 'S'], ['s1', 'S1'], ['s2', 'S2'],
    ['m', 'M'],
    ['a', 'A'], ['a1', 'A1'], ['a2', 'A2'],
    ['t', 'T'], ['t1', 'T1'], ['t2', 'T2'],
    ['b', 'B'], ['b1', 'B1'], ['b2', 'B2'],
  ];

  const pitches = {};
  for (const [column, voice] of map) {
    const raw = row[column];
    if (raw == null) {
      continue;
    }

    const value = String(raw).trim();
    if (value) {
      pitches[voice] = value;
    }
  }

  return pitches;
}

function mapLegacyPitches(voices, startTonesArray) {
  const pitches = {};

  if (voices === 'Unison') {
    pitches.S = startTonesArray[0];
    pitches.A = startTonesArray[0];
    pitches.T = startTonesArray[0];
    pitches.B = startTonesArray[0];
  } else if (voices === 'SATB') {
    pitches.S = startTonesArray[0] || startTonesArray[0];
    pitches.A = startTonesArray[1] || startTonesArray[0];
    pitches.T = startTonesArray[2] || startTonesArray[0];
    pitches.B = startTonesArray[3] || startTonesArray[0];
  } else if (voices === 'TTBB') {
    pitches.T = startTonesArray[0] || startTonesArray[0];
    pitches.B = startTonesArray[1] || startTonesArray[0];
  }

  return pitches;
}

function getRowValue(row, keys, fallback = '') {
  for (const key of keys) {
    if (row[key] != null) {
      return row[key];
    }
  }
  return fallback;
}

function validateSong(song, rowNumber) {
  const errors = [];

  if (!song.title || song.title.trim().length === 0) {
    errors.push(`[rad ${rowNumber}] title mangler.`);
  }

  if (!song.voices || song.voices.trim().length === 0) {
    errors.push(`[rad ${rowNumber}] voices mangler.`);
  }

  if (!Array.isArray(song.sequence) || song.sequence.length === 0) {
    errors.push(`[rad ${rowNumber}] sequence maa vaere en ikke-tom liste med noter.`);
  } else {
    song.sequence.forEach((token, idx) => {
      if (typeof token !== 'string' || token.trim().length === 0) {
        errors.push(`[rad ${rowNumber}] sequence[${idx}] maa vaere tekst.`);
        return;
      }

      if (!NOTE_PATTERN.test(token.trim())) {
        errors.push(
          `[rad ${rowNumber}] sequence[${idx}] har ugyldig format: "${token}" (eksempel: C4:2n, Eb:4n, R:4n).`
        );
      }
    });
  }

  if (typeof song.pitches !== 'object' || song.pitches == null || Array.isArray(song.pitches)) {
    errors.push(`[rad ${rowNumber}] pitches maa vaere et objekt eller stemmekolonner (S/A/T/B).`);
  } else {
    const pitchEntries = Object.entries(song.pitches);
    if (pitchEntries.length === 0) {
      errors.push(`[rad ${rowNumber}] pitches kan ikke vaere tomt.`);
    }

    for (const [voice, pitch] of pitchEntries) {
      if (!voice || voice.trim().length === 0) {
        errors.push(`[rad ${rowNumber}] pitches har tom stemme-noekkel.`);
      }
      if (typeof pitch !== 'string' || pitch.trim().length === 0) {
        errors.push(`[rad ${rowNumber}] pitches[${voice}] maa vaere tekst.`);
      } else if (!NOTE_PATTERN.test(pitch.trim())) {
        errors.push(`[rad ${rowNumber}] pitches[${voice}] har ugyldig noteformat: "${pitch}".`);
      }
    }
  }

  if (!Number.isInteger(song.tempoBpm) || song.tempoBpm <= 0) {
    errors.push(`[rad ${rowNumber}] tempo_bpm maa vaere et positivt heltall.`);
  }

  return errors;
}

// Les CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

if (lines.length < 2) {
  console.error('CSV-filen mangler data.');
  process.exit(1);
}

const delimiter = detectDelimiter(lines[0]);
const headers = parseDelimitedLine(lines[0], delimiter).map(normalizeHeader);

console.log('📖 Leser CSV med', lines.length - 1, 'sanger...');
console.log(`🔎 Oppdaget separator: ${delimiter === ';' ? 'semikolon (;)' : 'komma (,)'} `);

// Parse hver sang
const songs = [];
const validationErrors = [];
const duplicateKeyMap = new Map();

for (let i = 1; i < lines.length; i++) {
  const rowNumber = i + 1;
  const values = parseDelimitedLine(lines[i], delimiter);
  const row = {};
  headers.forEach((header, idx) => {
    row[header] = values[idx] ?? '';
  });

  const title = String(getRowValue(row, ['title'])).trim();
  if (!title) {
    continue;
  }

  const voices = String(getRowValue(row, ['voices'], 'SATB')).trim() || 'SATB';
  const nickname = String(getRowValue(row, ['nickname'], '')).trim() || null;
  const keySignature = String(getRowValue(row, ['key_signature', 'keysignature'], '')).trim() || null;
  const tempoBpm = parseTempo(getRowValue(row, ['tempo_bpm', 'tempobpm']));

  const sequenceRaw = getRowValue(row, ['sequence']);
  const pitchesRaw = getRowValue(row, ['pitches']);

  let sequence = tryParseJson(sequenceRaw, null);
  let pitches = tryParseJson(pitchesRaw, null);

  if (!Array.isArray(sequence)) {
    sequence = parseSimpleSequence(sequenceRaw);
  }

  if (typeof pitches !== 'object' || pitches == null || Array.isArray(pitches)) {
    pitches = parseSimplePitches(row);
  }

  // Fallback for legacy format where starttones is explicitly present.
  const hasValidSequence = Array.isArray(sequence) && sequence.length > 0;
  const hasValidPitches =
    typeof pitches === 'object' && pitches != null && !Array.isArray(pitches) && Object.keys(pitches).length > 0;

  if (!hasValidSequence || !hasValidPitches) {
    const startToneRaw = String(
      getRowValue(row, ['starttones', 'starttone', 'starttone_raw', 'start_tones'], '')
    ).trim();

    if (startToneRaw) {
      const startTonesArray = startToneRaw.split(/\s+/).filter(Boolean);
      if (!hasValidSequence) {
        sequence = startTonesArray;
      }
      if (!hasValidPitches) {
        pitches = mapLegacyPitches(voices, startTonesArray);
      }
    }
  }

  const song = {
    title,
    nickname,
    voices,
    sequence,
    pitches,
    keySignature,
    tempoBpm,
  };

  const key = `${title.toLowerCase()}|${voices.toLowerCase()}`;
  if (duplicateKeyMap.has(key)) {
    validationErrors.push(
      `[rad ${rowNumber}] duplikat i filen for title+voices: "${title}" + "${voices}" (foerst sett paa rad ${duplicateKeyMap.get(key)}).`
    );
  } else {
    duplicateKeyMap.set(key, rowNumber);
  }

  validationErrors.push(...validateSong(song, rowNumber));
  songs.push(song);
}

if (songs.length === 0) {
  console.error('Ingen gyldige sangrader funnet i CSV.');
  process.exit(1);
}

if (validationErrors.length > 0) {
  console.error('\n❌ Validering feilet. Import avbrutt.');
  validationErrors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('✅ Validering OK for', songs.length, 'sanger');

// Generer SQL (UPSERT)
let sql = `-- Auto-generert UPSERT av sanger fra CSV
-- Generert: ${new Date().toISOString()}
-- Krever unik constraint paa (title, voices):
-- Kjor en gang: supabase/add-songs-upsert-constraint.sql

`;

songs.forEach((song) => {
  const pitchesJson = JSON.stringify(song.pitches).replace(/'/g, "''");
  const sequenceArray = song.sequence.map((n) => `'${escapeSql(n)}'`).join(',');
  const nicknameSql = song.nickname ? `'${escapeSql(song.nickname)}'` : 'NULL';
  const keySignatureSql = song.keySignature ? `'${escapeSql(song.keySignature)}'` : 'NULL';

  sql += `INSERT INTO public.songs (title, nickname, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  '${escapeSql(song.title)}',
  ${nicknameSql},
  '${escapeSql(song.voices)}',
  ARRAY[${sequenceArray}],
  '${pitchesJson}'::jsonb,
  ${keySignatureSql},
  ${song.tempoBpm}
)
ON CONFLICT (title, voices) DO UPDATE
SET
  nickname = EXCLUDED.nickname,
  sequence = EXCLUDED.sequence,
  pitches = EXCLUDED.pitches,
  key_signature = EXCLUDED.key_signature,
  tempo_bpm = EXCLUDED.tempo_bpm,
  updated_at = now();\n\n`;
});

// Skriv til fil
fs.writeFileSync(outputPath, sql);
console.log('💾 SQL generert:', outputPath);
console.log('\n📋 Neste steg:');
console.log('1. Kjor en gang i Supabase: supabase/add-songs-upsert-constraint.sql');
console.log('2. Aapne Supabase SQL Editor');
console.log('3. Kjor: supabase/import-songs.sql');
