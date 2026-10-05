/**
 * Verkleinert die Lightbox-Bilder (WebP, max. 1600 px Kantenlänge, Qualität 80).
 * Eine Datei wird nur ersetzt, wenn sie dadurch mindestens 10 % kleiner wird – so
 * verschlechtert ein erneuter Lauf bereits optimierte Bilder nicht weiter.
 * Thumbnails (images:srcset) bleiben unberührt; sie stammen aus den Originalen.
 * Nutzung: npm run images:lightbox
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FOLDERS = ['assets/images/img/lightbox', 'assets/images/artworks/lightbox'];
const MAX_EDGE = 1600;
const QUALITY = 80;
const MIN_SAVING = 0.10;

async function run() {
  let before = 0;
  let after = 0;
  let changed = 0;
  for (const folder of FOLDERS) {
    const dir = path.join(ROOT, folder);
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.webp'))) {
      const full = path.join(dir, file);
      const input = fs.readFileSync(full);
      const output = await sharp(input)
        .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 6 })
        .toBuffer();
      before += input.length;
      if (output.length <= input.length * (1 - MIN_SAVING)) {
        fs.writeFileSync(full, output);
        after += output.length;
        changed++;
      } else {
        after += input.length;
      }
    }
  }
  const mb = n => (n / 1e6).toFixed(1);
  console.log(`${changed} Bilder neu kodiert: ${mb(before)} MB -> ${mb(after)} MB`);
}

run().catch(e => { console.error(e); process.exit(1); });
