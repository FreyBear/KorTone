#!/usr/bin/env node

/**
 * Konverterer CSV til SQL INSERT-statements for Supabase.
 *
 * Stotter to formater:
 * 1) Ny mal (anbefalt):
 *    title,nickname,voices,sequence,pitches,key_signature,tempo_bpm
 *    - sequence = JSON-array
 *    - pitches = JSON-objekt
 *
 * 2) Legacy:
 *    title,voices,starttones,key_signature,tempo_bpm
 *
 * Kjor:
 *   node scripts/import-csv-to-supabase.js
 *   node scripts/import-csv-to-supabase.js data/songs.import-template.csv
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

const headers = parseCsvLine(lines[0]).map(normalizeHeader);

console.log('📖 Leser CSV med', lines.length - 1, 'sanger...');

// Parse hver sang
const songs = [];
for (let i = 1; i < lines.length; i++) {
  const values = parseCsvLine(lines[i]);
  const row = {};
  headers.forEach((header, idx) => {
    row[header] = values[idx] ?? '';
  });

  const title = String(getRowValue(row, ['title'])).trim();
  if (!title) continue;

  const voices = String(getRowValue(row, ['voices'], 'SATB')).trim() || 'SATB';
  const nickname = String(getRowValue(row, ['nickname'], '')).trim() || null;
  const keySignature = String(getRowValue(row, ['key_signature', 'keysignature'], '')).trim() || null;
  const tempoBpm = parseTempo(getRowValue(row, ['tempo_bpm', 'tempobpm']));

  let sequence = tryParseJson(getRowValue(row, ['sequence']), null);
  let pitches = tryParseJson(getRowValue(row, ['pitches']), null);

  // Fallback for legacy format where sequence/pitches are not JSON fields.
  if (!Array.isArray(sequence) || typeof pitches !== 'object' || pitches == null) {
    const startToneRaw = String(
      getRowValue(row, ['starttones', 'starttone', 'starttone_raw', 'start_tones'], '')
    ).trim();
    const startTonesArray = startToneRaw ? startToneRaw.split(/\s+/).filter(Boolean) : [];
    sequence = startTonesArray;
    pitches = mapLegacyPitches(voices, startTonesArray);
  }

  songs.push({
    title,
    nickname,
    voices,
    sequence,
    pitches,
    keySignature,
    tempoBpm,
  });
}

console.log('✅ Parsed', songs.length, 'sanger');

// Generer SQL
let sql = `-- Auto-generert import av sanger fra CSV
-- Generert: ${new Date().toISOString()}

`;

songs.forEach((song, idx) => {
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
);\n\n`;
});

// Skriv til fil
fs.writeFileSync(outputPath, sql);
console.log('💾 SQL generert:', outputPath);
console.log('\n📋 Neste steg:');
console.log('1. Åpne Supabase SQL Editor');
console.log('2. Kjør først: supabase/migrate-to-new-structure.sql');
console.log('3. Kjør deretter: supabase/import-songs.sql');
