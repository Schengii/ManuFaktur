/**
 * Prüft, ob die vier Teile jedes Galerie-Werks zusammenpassen (siehe CLAUDE.md „Galerie-Daten“):
 *   1. .gallery-item-Block in Bildergalerie.html bzw. Home.html (id, data-kategorie, Link, Thumbnails),
 *   2. Eintrag in ARTWORKS_METADATA (assets/js/artworks-data.js),
 *   3. Eintrag in ARTWORKS_METADATA_EN,
 *   4. Bilddateien: lightbox/ID.webp und thumbs/ID-{400,700,1000}w.webp.
 *
 * Nutzung: node scripts/check-gallery.js   (oder: npm run check:gallery; läuft auch in der CI)
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'assets', 'js', 'artworks-data.js');
const PAGES = ['Bildergalerie.html', 'Home.html'];
const WIDTHS = [400, 700, 1000];
const CATEGORIES = new Set(['landschaften', 'tiere', 'pflanzen', 'sonstiges']);
// Optionales Feld "status" (Anzeige in der Lightbox, Texte: status_* in I18N_DICTIONARY)
const STATUSES = new Set(['verfuegbar', 'reserviert', 'verkauft']);

function loadData() {
  // Datei in einer Sandbox ausführen (reines Datenskript ohne Seiteneffekte)
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${fs.readFileSync(DATA_FILE, 'utf8')}\nthis.de = ARTWORKS_METADATA; this.en = ARTWORKS_METADATA_EN;`, context);
  return { de: context.de, en: context.en };
}

function galleryItems(page) {
  const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  // Jeder Abschnitt reicht vom öffnenden .gallery-item-Tag bis zum nächsten.
  const chunks = html.split(/(?=<div class="gallery-item[\s"])/).slice(1);
  return chunks.map(chunk => {
    const openTag = chunk.slice(0, chunk.indexOf('>') + 1);
    return {
      page,
      id: (openTag.match(/\sid="([^"]+)"/) || [])[1],
      kategorie: (openTag.match(/data-kategorie="([^"]+)"/) || [])[1],
      href: (chunk.match(/<a [^>]*href="([^"]+)"/) || [])[1]
    };
  });
}

function check() {
  const errors = [];
  const { de, en } = loadData();
  const seen = new Set();

  for (const [id, meta] of Object.entries(de)) {
    for (const field of ['title', 'technik', 'masse', 'kategorie', 'desc']) {
      if (!meta[field]) errors.push(`${id}: Feld „${field}“ fehlt in ARTWORKS_METADATA.`);
    }
    if (meta.kategorie && !CATEGORIES.has(meta.kategorie)) errors.push(`${id}: unbekannte Kategorie „${meta.kategorie}“.`);
    if (meta.status !== undefined && !STATUSES.has(meta.status)) {
      errors.push(`${id}: unbekannter status „${meta.status}“ (erlaubt: ${[...STATUSES].join(', ')}).`);
    }
    if (!en[id]) errors.push(`${id}: fehlt in ARTWORKS_METADATA_EN.`);
  }
  for (const id of Object.keys(en)) {
    if (!de[id]) errors.push(`${id}: steht in ARTWORKS_METADATA_EN, aber nicht in ARTWORKS_METADATA.`);
  }

  for (const page of PAGES) {
    for (const item of galleryItems(page)) {
      const where = `${page} #${item.id}`;
      if (!item.id) { errors.push(`${page}: .gallery-item ohne id.`); continue; }
      seen.add(item.id);
      const meta = de[item.id];
      if (!meta) { errors.push(`${where}: kein Eintrag in ARTWORKS_METADATA.`); continue; }
      if (item.kategorie !== meta.kategorie) {
        errors.push(`${where}: data-kategorie „${item.kategorie}“ ≠ Metadaten „${meta.kategorie}“.`);
      }
      const m = (item.href || '').match(/^(.*)\/lightbox\/([^/]+)\.webp$/);
      if (!m || m[2] !== item.id) { errors.push(`${where}: Link „${item.href}“ zeigt nicht auf …/lightbox/${item.id}.webp.`); continue; }
      const files = [`${m[1]}/lightbox/${item.id}.webp`, ...WIDTHS.map(w => `${m[1]}/thumbs/${item.id}-${w}w.webp`)];
      for (const file of files) {
        if (!fs.existsSync(path.join(ROOT, file))) errors.push(`${where}: Bilddatei ${file} fehlt.`);
      }
    }
  }

  for (const id of Object.keys(de)) {
    if (!seen.has(id)) errors.push(`${id}: hat Metadaten, steht aber auf keiner Seite (${PAGES.join(', ')}).`);
  }
  return { errors, count: seen.size };
}

if (require.main === module) {
  const { errors, count } = check();
  if (errors.length) {
    console.error(`Galerie-Daten inkonsistent (${errors.length} Fehler):\n  ${errors.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`Galerie-Daten konsistent: ${count} Werke.`);
}

module.exports = { check, loadData, galleryItems };
