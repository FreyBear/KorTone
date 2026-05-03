#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.join(__dirname, '..', 'public', 'audio', 'piano-lite');

const samples = ['C4.mp3', 'Ds4.mp3', 'Fs4.mp3', 'A4.mp3'];
const baseUrl = 'https://tonejs.github.io/audio/salamander/';

function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode} for ${url}`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
  });
}

async function main() {
  // Opprett mappen hvis den ikke eksisterer
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`✓ Opprettet mappe: ${targetDir}`);
  }

  console.log(`Downloader piano-samples til ${targetDir}...\n`);

  let downloaded = 0;
  let failed = 0;

  for (const sample of samples) {
    const url = `${baseUrl}${sample}`;
    const filePath = path.join(targetDir, sample);

    try {
      // Sjekk om filen allerede eksisterer
      if (fs.existsSync(filePath)) {
        const size = fs.statSync(filePath).size;
        console.log(`✓ ${sample} (${(size / 1024).toFixed(1)} KB) - finnes allerede`);
        downloaded++;
        continue;
      }

      process.stdout.write(`  ${sample}... `);
      await downloadFile(url, filePath);
      const size = fs.statSync(filePath).size;
      console.log(`✓ (${(size / 1024).toFixed(1)} KB)`);
      downloaded++;
    } catch (error) {
      console.log(`✗ Feil: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n${downloaded}/${samples.length} filer OK${failed > 0 ? `, ${failed} feilet` : ''}`);

  if (failed === 0) {
    console.log(`\n✓ Piano-lite er klar! Appen vil bruke lokal audio nå.`);
    process.exit(0);
  } else {
    console.log(`\n⚠ Noen filer feilet. Appen faller tilbake til fjernkilde.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Feil:', error);
  process.exit(1);
});
