const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WIDTHS = [400, 700, 1000];

const FOLDERS = [
  { lightbox: path.join(ROOT, 'assets/images/img/lightbox'), thumbs: path.join(ROOT, 'assets/images/img/thumbs') },
  { lightbox: path.join(ROOT, 'assets/images/artworks/lightbox'), thumbs: path.join(ROOT, 'assets/images/artworks/thumbs') },
];

async function run() {
  let total = 0;
  for (const { lightbox, thumbs } of FOLDERS) {
    const files = fs.readdirSync(lightbox).filter(f => f.endsWith('.webp'));
    for (const file of files) {
      const id = file.replace(/\.webp$/, '');
      const src = path.join(lightbox, file);
      for (const w of WIDTHS) {
        const out = path.join(thumbs, `${id}-${w}w.webp`);
        await sharp(src).resize({ width: w }).webp({ quality: 80 }).toFile(out);
        total++;
      }
    }
    console.log(`Done: ${lightbox} (${files.length} images)`);
  }
  console.log(`Generated ${total} files.`);
}

run().catch(e => { console.error(e); process.exit(1); });
