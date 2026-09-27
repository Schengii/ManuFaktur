const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILES = ['Bildergalerie.html', 'Home.html'];
const SIZES = '(min-width: 1200px) 290px, (min-width: 700px) 45vw, 90vw';

// Matches: src="assets/images/(img|artworks)/thumbs/ID.webp"
const SRC_RE = /src="assets\/images\/(img|artworks)\/thumbs\/([^".]+)\.webp"/g;

for (const file of FILES) {
  const filePath = path.join(ROOT, file);
  let html = fs.readFileSync(filePath, 'utf8');
  let count = 0;

  html = html.replace(SRC_RE, (match, folder, id) => {
    count++;
    const base = `assets/images/${folder}/thumbs/${id}`;
    const srcset = `${base}-400w.webp 400w, ${base}-700w.webp 700w, ${base}-1000w.webp 1000w`;
    return `src="${base}-700w.webp" srcset="${srcset}" sizes="${SIZES}"`;
  });

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`${file}: patched ${count} <img> tags`);
}
