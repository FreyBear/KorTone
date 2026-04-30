#!/usr/bin/env node

/**
 * Eksporterer sanger fra Supabase til CSV-mal for bulk-import.
 *
 * Kjor:
 *   node scripts/export-songs-template.js
 *
 * Miljovariabler:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY eller SUPABASE_SERVICE_ROLE_KEY
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, '..', 'data', 'songs.import-template.csv');

function loadEnvFromFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) {
      continue;
    }

    const key = match[1];
    const rawValue = match[2] ?? '';
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFromFile(path.join(__dirname, '..', '.env'));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Mangler Supabase-miljovariabler.');
  console.error('Sett NEXT_PUBLIC_SUPABASE_URL og en av disse: NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function escapeDelimited(value, delimiter = ';') {
  const text = value == null ? '' : String(value);
  if (text.includes(delimiter) || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function pickPitch(pitches, keys) {
  for (const key of keys) {
    const value = pitches?.[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

async function run() {
  const { data, error } = await supabase
    .from('songs')
    .select('title,nickname,voices,sequence,pitches,key_signature,tempo_bpm')
    .order('title', { ascending: true });

  if (error) {
    console.error('Kunne ikke hente sanger:', error.message);
    process.exit(1);
  }

  const delimiter = ';';
  const header = ['title', 'nickname', 'voices', 'sequence', 'S', 'A', 'T', 'B', 'key_signature', 'tempo_bpm'];
  const lines = [header.join(delimiter)];

  for (const song of data || []) {
    const sequenceText = Array.isArray(song.sequence) ? song.sequence.join(' ') : '';
    const pitches = song.pitches || {};

    const row = [
      song.title,
      song.nickname || '',
      song.voices,
      sequenceText,
      pickPitch(pitches, ['S', 'S1', 'S2']),
      pickPitch(pitches, ['A', 'A1', 'A2']),
      pickPitch(pitches, ['T', 'T1', 'T2']),
      pickPitch(pitches, ['B', 'B1', 'B2', 'Bar']),
      song.key_signature || '',
      song.tempo_bpm ?? 120,
    ];

    lines.push(row.map((value) => escapeDelimited(value, delimiter)).join(delimiter));
  }

  fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf-8');

  console.log(`Eksport fullfort: ${outputPath}`);
  console.log(`Antall sanger: ${(data || []).length}`);
  console.log('Rediger fila og importer med: node scripts/import-csv-to-supabase.js data/songs.import-template.csv');
}

run().catch((err) => {
  console.error('Uventet feil ved eksport:', err);
  process.exit(1);
});
