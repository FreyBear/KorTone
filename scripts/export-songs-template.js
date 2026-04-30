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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Mangler Supabase-miljovariabler.');
  console.error('Sett NEXT_PUBLIC_SUPABASE_URL og NEXT_PUBLIC_SUPABASE_ANON_KEY (eller SUPABASE_SERVICE_ROLE_KEY).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function escapeCsv(value) {
  const text = value == null ? '' : String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
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

  const header = ['title', 'nickname', 'voices', 'sequence', 'pitches', 'key_signature', 'tempo_bpm'];
  const lines = [header.join(',')];

  for (const song of data || []) {
    const row = [
      song.title,
      song.nickname || '',
      song.voices,
      JSON.stringify(song.sequence || []),
      JSON.stringify(song.pitches || {}),
      song.key_signature || '',
      song.tempo_bpm ?? 120,
    ];

    lines.push(row.map(escapeCsv).join(','));
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
