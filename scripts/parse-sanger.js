#!/usr/bin/env node
/**
 * Parse sanger.csv and convert to song library JSON format
 */

import * as fs from 'fs';

const csvContent = fs.readFileSync('./sanger.csv', 'utf-8');
const lines = csvContent.trim().split('\n');

// Parse CSV manually (simple semicolon split)
const headerLine = lines[0];
const headers = headerLine.split(';');

const records = lines.slice(1).map(line => {
  const values = line.split(';');
  const record = {};
  headers.forEach((header, idx) => {
    record[header] = values[idx] || '';
  });
  return record;
});

// Map note names to frequencies or just keep as strings
const noteMap = {
  'c': 'C4',
  'ciss': 'C#4',
  'd': 'D4',
  'diss': 'D#4',
  'e': 'E4',
  'f': 'F4',
  'fiss': 'F#4',
  'g': 'G4',
  'giss': 'G#4',
  'a': 'A4',
  'ais': 'A#4',
  'h': 'B4',
  'b': 'Bb4',
  'ess': 'Eb4',
  'cess': 'B3',
  'ass': 'Ab4',
  'dess': 'Db4',
};

// Extract unique voices from besetning string (SATB letters)
function extractVoices(besetning) {
  if (!besetning || besetning === 'Ad lib') return [];
  const voices = [];
  if (besetning.includes('S')) voices.push('S');
  if (besetning.includes('A')) voices.push('A');
  if (besetning.includes('T')) voices.push('T');
  if (besetning.includes('B')) voices.push('B');
  return [...new Set(voices)];
}

// Parse toner string like "(a-c, f-a)" into object
function parseToner(tonerStr) {
  if (!tonerStr) return {};
  
  const pitches = {};
  const voiceOrder = ['S', 'A', 'T', 'B'];
  
  // Extract all note names
  const notePattern = /([a-h](?:iss|ess|is|as)?)/gi;
  const notesFound = [...tonerStr.matchAll(notePattern)].map(m => m[0].toLowerCase());
  
  // Assign notes to voices in order
  notesFound.forEach((note, idx) => {
    const voice = voiceOrder[idx % 4];
    if (voice && !pitches[voice]) {
      pitches[voice] = noteMap[note] || note;
    }
  });
  
  return pitches;
}

const songs = records.map((row, idx) => ({
  id: `song_${row.Nummer.replace(/\s+/g, '_')}`.toLowerCase(),
  title: row.Tittel,
  nickname: row.Toneart || null,
  lyrics_snippet: null,
  tempo_bpm: null,
  sequence: extractVoices(row.Besetning),
  pitches: parseToner(row.Toner),
  dropbox_url: null,
}));

const output = {
  songs,
  meta: {
    count: songs.length,
    source: 'sanger.csv',
    converted: new Date().toISOString(),
  },
};

console.log(JSON.stringify(output, null, 2));
