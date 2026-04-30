#!/usr/bin/env node

/**
 * Konverterer Sangliste.csv (gammelt format) til import-format.
 *
 * Innformat:  Sang,Kallenavn,Stemmer,Starttone,toneart,bpm,Kommentar
 * Utformat:   title;nickname;voices;sequence;S;S1;S2;M;A;A1;A2;T;T1;T2;B;B1;B2;key_signature;tempo_bpm
 *
 * Regler:
 *  - H → B (B-naturell), Bb forblir Bb
 *  - Dash (-) → stemmen har ingen starttone, hoppes over
 *  - SATB: 1 tone → alle samme, 4 toner → S A T B
 *  - TTBB: 1-2 toner → T B, 4 toner → T1 T2 B1 B2
 *  - SSAA: 4 toner → S1 S2 A1 A2
 *  - SMA: 3 toner → S M A
 *  - Unison: alle stemmer = samme tone
 *  - Skråstrek (C/G) → stemmen er delt, f.eks. S1=C, S2=G
 *  - Manglende BPM → blank (null i DB)
 *  - Sekvens genereres fra stemmetoner i rekkefølge
 *
 * Kjor:
 *   node scripts/convert-sangliste.js
 *   node scripts/convert-sangliste.js MinListe.csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputArg = process.argv[2];
const inputPath = inputArg
  ? path.resolve(process.cwd(), inputArg)
  : path.join(__dirname, '..', 'Sangliste.csv');
const outputPath = path.join(__dirname, '..', 'data', 'Sangliste-import.csv');

const VOICE_SEQUENCE_ORDER = ['S', 'S1', 'S2', 'M', 'A', 'A1', 'A2', 'T', 'T1', 'T2', 'B', 'B1', 'B2'];

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
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

function escapeField(value) {
  const text = value == null ? '' : String(value);
  if (text.includes(';') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

// Convert H (Norwegian B-natural) to B (international notation)
function convertNote(note, songTitle, hSongs) {
  if (!note) return note;
  const trimmed = note.trim();
  if (/^H([#b]?)$/.test(trimmed)) {
    hSongs.add(songTitle);
    return 'B' + trimmed.slice(1);
  }
  return trimmed;
}

// Process one token: dash = null, slash = array of two, otherwise note string
function processToken(token, songTitle, hSongs) {
  const t = token.trim();
  if (!t || t === '-') return null;

  if (t.includes('/')) {
    const parts = t.split('/').map(p => convertNote(p.trim(), songTitle, hSongs));
    return parts;
  }

  return convertNote(t, songTitle, hSongs);
}

function mapVoices(raw, voices, songTitle, hSongs, guesses) {
  const tokens = raw.trim().split(/\s+/).map(t => t.trim()).filter(Boolean);
  const processed = tokens.map(t => processToken(t, songTitle, hSongs));

  const pitches = {};

  const voiceType = voices.trim().toUpperCase();

  if (voiceType === 'SATB') {
    if (processed.length === 1) {
      // All on same note
      const v = processed[0];
      if (v && !Array.isArray(v)) { pitches.S = v; pitches.A = v; pitches.T = v; pitches.B = v; }
    } else if (processed.length >= 4) {
      const [s, a, t, b] = processed;
      if (Array.isArray(s)) { pitches.S1 = s[0]; pitches.S2 = s[1]; }
      else if (s) pitches.S = s;

      if (Array.isArray(a)) { pitches.A1 = a[0]; pitches.A2 = a[1]; }
      else if (a) pitches.A = a;

      if (Array.isArray(t)) { pitches.T1 = t[0]; pitches.T2 = t[1]; }
      else if (t) pitches.T = t;

      if (Array.isArray(b)) { pitches.B1 = b[0]; pitches.B2 = b[1]; }
      else if (b) pitches.B = b;
    } else if (processed.length > 0) {
      guesses.push(`${songTitle}: SATB hadde ${processed.length} toner (forventet 4) – ignorert.`);
    }
  } else if (voiceType === 'TTBB') {
    if (processed.length === 1) {
      const v = processed[0];
      if (v && !Array.isArray(v)) { pitches.T = v; pitches.B = v; }
    } else if (processed.length === 2) {
      const [t, b] = processed;
      if (t) pitches.T = Array.isArray(t) ? t[0] : t;
      if (b) pitches.B = Array.isArray(b) ? b[0] : b;
    } else if (processed.length === 4) {
      const [t1, t2, b1, b2] = processed;
      if (t1) pitches.T1 = Array.isArray(t1) ? t1[0] : t1;
      if (t2) pitches.T2 = Array.isArray(t2) ? t2[0] : t2;
      if (b1) pitches.B1 = Array.isArray(b1) ? b1[0] : b1;
      if (b2) pitches.B2 = Array.isArray(b2) ? b2[0] : b2;
    }
  } else if (voiceType === 'SSAA') {
    if (processed.length === 4) {
      const [s1, s2, a1, a2] = processed;
      if (s1) pitches.S1 = Array.isArray(s1) ? s1[0] : s1;
      if (s2) pitches.S2 = Array.isArray(s2) ? s2[0] : s2;
      if (a1) pitches.A1 = Array.isArray(a1) ? a1[0] : a1;
      if (a2) pitches.A2 = Array.isArray(a2) ? a2[0] : a2;
    } else if (processed.length === 1) {
      const v = processed[0];
      if (v && !Array.isArray(v)) { pitches.S1 = v; pitches.S2 = v; pitches.A1 = v; pitches.A2 = v; }
    } else if (processed.length > 0) {
      guesses.push(`${songTitle}: SSAA hadde ${processed.length} toner (forventet 4) – ignorert.`);
    }
  } else if (voiceType === 'SMA') {
    if (processed.length === 3) {
      const [s, m, a] = processed;
      if (s) pitches.S = Array.isArray(s) ? s[0] : s;
      if (m) pitches.M = Array.isArray(m) ? m[0] : m;
      if (a) pitches.A = Array.isArray(a) ? a[0] : a;
    } else if (processed.length === 1) {
      const v = processed[0];
      if (v && !Array.isArray(v)) { pitches.S = v; pitches.M = v; pitches.A = v; }
    } else if (processed.length > 0) {
      guesses.push(`${songTitle}: SMA hadde ${processed.length} toner (forventet 3) – ignorert.`);
    }
  } else if (voiceType === 'UNISON') {
    const v = processed[0];
    if (v && !Array.isArray(v)) { pitches.S = v; pitches.A = v; pitches.T = v; pitches.B = v; }
  } else {
    guesses.push(`${songTitle}: ukjent stemmegruppe "${voices}".`);
  }

  return pitches;
}

function buildSequence(pitches) {
  return VOICE_SEQUENCE_ORDER
    .filter(v => pitches[v])
    .map(v => pitches[v])
    .join(' ');
}

// --- Main ---

const csvContent = fs.readFileSync(inputPath, 'utf-8');
const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

const rawHeaders = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
// Expected: sang, kallenavn, stemmer, starttone, toneart, bpm, kommentar

const hSongs = new Set();
const guesses = [];

const outHeader = [
  'title', 'nickname', 'voices', 'sequence',
  'S', 'S1', 'S2', 'M', 'A', 'A1', 'A2', 'T', 'T1', 'T2', 'B', 'B1', 'B2',
  'key_signature', 'tempo_bpm',
];
const outputLines = [outHeader.join(';')];

for (let i = 1; i < lines.length; i++) {
  const values = parseCsvLine(lines[i]);
  const row = {};
  rawHeaders.forEach((h, idx) => { row[h] = (values[idx] || '').trim(); });

  const title = row['sang'] || '';
  if (!title) continue;

  const nickname = row['kallenavn'] || '';
  const voices = row['stemmer'] || 'SATB';
  const startRaw = row['starttone'] || '';
  const toneart = row['toneart'] || '';
  const bpmRaw = row['bpm'] || '';

  // BPM: blank if missing
  const bpm = bpmRaw.trim() ? bpmRaw.trim() : '';

  // Map pitches
  const pitches = mapVoices(startRaw, voices, title, hSongs, guesses);

  // Build sequence
  const sequence = buildSequence(pitches);

  const outRow = [
    title, nickname, voices, sequence,
    pitches.S || '', pitches.S1 || '', pitches.S2 || '',
    pitches.M || '',
    pitches.A || '', pitches.A1 || '', pitches.A2 || '',
    pitches.T || '', pitches.T1 || '', pitches.T2 || '',
    pitches.B || '', pitches.B1 || '', pitches.B2 || '',
    toneart, bpm,
  ];

  outputLines.push(outRow.map(escapeField).join(';'));
}

fs.writeFileSync(outputPath, outputLines.join('\n') + '\n', 'utf-8');

console.log(`✅ Konvertert ${lines.length - 1} sanger → ${outputPath}`);

if (hSongs.size > 0) {
  console.log('\n⚠️  H→B konvertering brukt (sjekk at disse er riktige):');
  for (const t of hSongs) {
    console.log(`   - ${t}`);
  }
}

if (guesses.length > 0) {
  console.log('\n⚠️  Sanger med usikker tolkning (sjekk manuelt):');
  for (const g of guesses) {
    console.log(`   - ${g}`);
  }
}
