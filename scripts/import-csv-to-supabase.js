#!/usr/bin/env node

/**
 * Konverterer sanger.csv til SQL INSERT-statements for Supabase
 * Kjør: node scripts/import-csv-to-supabase.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, '..', 'sanger.csv');
const outputPath = path.join(__dirname, '..', 'supabase', 'import-songs.sql');

// Les CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.trim().split('\n');
const headers = lines[0].split(',');

console.log('📖 Leser CSV med', lines.length - 1, 'sanger...');

// Parse hver sang
const songs = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  
  const [title, voices, starttoneRaw, keySignature, tempoBpm] = line.split(',');
  
  // Parse starttoner (space-separated notes)
  const startTonesArray = starttoneRaw.trim().split(/\s+/);
  const sequence = startTonesArray;
  
  // Map pitches til stemmer basert på arrangement
  const pitches = {};
  if (voices === 'Unison') {
    // Alle stemmer får samme tone
    pitches.S = startTonesArray[0];
    pitches.A = startTonesArray[0];
    pitches.T = startTonesArray[0];
    pitches.B = startTonesArray[0];
  } else if (voices === 'SATB') {
    // 4 forskjellige toner
    pitches.S = startTonesArray[0] || startTonesArray[0];
    pitches.A = startTonesArray[1] || startTonesArray[0];
    pitches.T = startTonesArray[2] || startTonesArray[0];
    pitches.B = startTonesArray[3] || startTonesArray[0];
  } else if (voices === 'TTBB') {
    // 4 herrerstemmer
    pitches.T = startTonesArray[0] || startTonesArray[0];
    pitches.B = startTonesArray[1] || startTonesArray[0];
  }
  
  songs.push({
    title: title.trim(),
    voices: voices.trim(),
    sequence,
    pitches,
    keySignature: keySignature.trim(),
    tempoBpm: parseInt(tempoBpm)
  });
}

console.log('✅ Parsed', songs.length, 'sanger');

// Generer SQL
let sql = `-- Auto-generert import av sanger fra CSV
-- Generert: ${new Date().toISOString()}

`;

songs.forEach((song, idx) => {
  const pitchesJson = JSON.stringify(song.pitches).replace(/'/g, "''");
  const sequenceArray = song.sequence.map(n => `'${n}'`).join(',');
  
  sql += `INSERT INTO public.songs (title, voices, sequence, pitches, key_signature, tempo_bpm)
VALUES (
  '${song.title.replace(/'/g, "''")}',
  '${song.voices}',
  ARRAY[${sequenceArray}],
  '${pitchesJson}'::jsonb,
  '${song.keySignature}',
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
