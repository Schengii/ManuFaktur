/**
 * Erzeugt je Werk eine kleine Weiterleitungsseite werk/ID.html mit eigenen Open-Graph-Tags.
 * Messenger und soziale Netzwerke lesen den #-Teil einer URL nicht; der Teilen-Button der Lightbox
 * verweist deshalb auf werk/ID.html, damit die Link-Vorschau das richtige Bild und den Titel zeigt.
 * Besucher werden sofort zu Bildergalerie.html#ID (bzw. Home.html#ID) weitergeleitet.
 *
 * Teil von `npm run build`. Nutzung: node scripts/gen-share-pages.js   (oder: npm run share-pages)
 */
const fs = require('fs');
const path = require('path');
const { loadData, galleryItems } = require('./check-gallery.js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'werk');
const SITE = 'https://www.manufaktur-malerei.de';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function collect() {
  const { de } = loadData();
  const items = new Map();
  for (const page of ['Home.html', 'Bildergalerie.html']) {
    for (const item of galleryItems(page)) {
      if (item.id && de[item.id] && item.href) items.set(item.id, { page, href: item.href });
    }
  }
  return [...items].map(([id, { page, href }]) => ({
    id,
    page,
    meta: de[id],
    image: href.replace(/\/lightbox\/[^/]+$/, `/thumbs/${id}-1000w.webp`)
  }));
}

function render({ id, page, meta, image }) {
  const title = `${meta.title} – ManuFAKTUR Schenk`;
  const desc = `${meta.technik}, ${meta.masse}. ${meta.desc}`;
  const target = `${page}#${id}`;
  const url = `${SITE}/werk/${id}.html`;
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="noindex, follow">
  <meta http-equiv="refresh" content="0; url=../${target}">
  <link rel="canonical" href="${SITE}/${page}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${SITE}/${image}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="de_DE">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${SITE}/${image}">
</head>
<body>
  <p><a href="../${target}">${esc(meta.title)} in der Galerie ansehen</a></p>
</body>
</html>
`;
}

function run() {
  const works = collect();
  fs.mkdirSync(OUT, { recursive: true });
  const keep = new Set(works.map(w => `${w.id}.html`));
  for (const file of fs.readdirSync(OUT)) {
    if (!keep.has(file)) fs.unlinkSync(path.join(OUT, file));
  }
  for (const work of works) {
    const file = path.join(OUT, `${work.id}.html`);
    const html = render(work);
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== html) fs.writeFileSync(file, html, 'utf8');
  }
  console.log(`Teilen-Seiten für ${works.length} Werke in werk/.`);
}

try {
  run();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
