/**
 * Erzeugt zu jeder Vorschau thumbs/ID-{400,700,1000}w.webp eine AVIF-Fassung (ca. 45 % kleiner).
 * Die Galerie bindet sie per <picture><source type="image/avif"> ein, WebP bleibt der Fallback.
 * Vorhandene, aktuelle .avif-Dateien werden übersprungen.
 *
 * Nutzung: node scripts/gen-avif.js   (oder: npm run images:avif)
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FOLDERS = ['assets/images/img/thumbs', 'assets/images/artworks/thumbs'].map(f => path.join(ROOT, f));

async function run() {
  let made = 0;
  for (const dir of FOLDERS) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter(f => /-\d+w\.webp$/.test(f))) {
      const src = path.join(dir, file);
      const out = src.replace(/\.webp$/, '.avif');
      if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) continue;
      await sharp(src).avif({ quality: 50, effort: 4 }).toFile(out);
      made++;
    }
  }
  console.log(`${made} AVIF-Vorschaubilder erzeugt.`);
}

run().catch(e => { console.error(e); process.exit(1); });
