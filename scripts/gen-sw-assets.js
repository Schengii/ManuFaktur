/**
 * Erzeugt die Precache-Liste (ASSETS_TO_CACHE) in sw.js aus dem tatsächlichen Stand:
 *   - alle HTML-Seiten (index.html über './'),
 *   - alle lokalen CSS-/JS-Dateien, die in den Seiten eingebunden sind (inkl. ?v=N),
 *     dazu das nachgeladene assets/js/i18n.min.js,
 *   - manifest.json und alle Dateien in assets/images/logos,
 *   - die in style.css und icons.min.css per url() geladenen Schriften (inkl. ?h=Hash).
 * Fehlt eine referenzierte Datei, bricht das Skript ab – sonst würde cache.addAll()
 * im Service Worker die gesamte Installation scheitern lassen.
 *
 * Läuft als Teil von `npm run build` (nach den Icons). Nutzung: npm run sw:assets
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SW = path.join(ROOT, 'sw.js');
const START = '// <generated:assets>';
const END = '// </generated:assets>';

const rel = p => './' + p.split(path.sep).join('/');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

function pages() {
  return fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && f !== 'index.html').sort();
}

/** Lokale CSS-/JS-Verweise (src/href) aus allen Seiten, mit Query-String. */
function pageAssets(htmlFiles) {
  const found = new Set();
  const re = /(?:src|href)="((?!https?:|\/\/|data:)[^"#]+\.(?:css|js)(?:\?[^"]*)?)"/g;
  for (const file of htmlFiles) {
    for (const m of read(file).matchAll(re)) found.add(m[1]);
  }
  return [...found].sort();
}

/** url(...)-Schriften aus einer CSS-Datei, aufgelöst relativ zur Datei. */
function fontsFrom(cssFile) {
  const dir = path.dirname(cssFile);
  const urls = new Set();
  for (const m of read(cssFile).matchAll(/url\(\s*['"]?([^'")]+\.woff2(?:\?[^'")]*)?)['"]?\s*\)/g)) {
    urls.add(path.normalize(path.join(dir, m[1])));
  }
  return [...urls].sort();
}

function logos() {
  return fs.readdirSync(path.join(ROOT, 'assets/images/logos')).sort()
    .map(f => path.join('assets/images/logos', f));
}

/** i18n.min.js wird von Home.min.js bei Bedarf nachgeladen (mit derselben ?v=N) und gehört deshalb in den Precache. */
function withLazyScripts(urls) {
  const lazy = urls
    .filter(u => /^Home\.min\.js/.test(u))
    .map(u => u.replace(/^Home\.min\.js/, 'assets/js/i18n.min.js'));
  return [...urls, ...lazy].sort();
}

function buildList() {
  const html = pages();
  const entries = [
    './',
    ...html.map(rel),
    ...withLazyScripts(pageAssets([...html, 'index.html'])).map(u => './' + u),
    './manifest.json',
    ...logos().map(rel),
    ...fontsFrom('style.css').map(rel),
    ...fontsFrom('assets/vendor/font-awesome/css/icons.min.css').map(rel)
  ];
  const unique = [...new Set(entries)];
  for (const entry of unique) {
    const file = entry.split('?')[0];
    if (file !== './' && !fs.existsSync(path.join(ROOT, file))) {
      throw new Error(`${entry} wird referenziert, existiert aber nicht – würde den Service-Worker-Precache brechen.`);
    }
  }
  return unique;
}

function main() {
  const before = fs.readFileSync(SW, 'utf8');
  const start = before.indexOf(START);
  const end = before.indexOf(END);
  if (start === -1 || end === -1) throw new Error('Marker <generated:assets> in sw.js nicht gefunden.');
  const entries = buildList();
  const list = entries.map(e => `  '${e}'`).join(',\n');
  const block = `${START} (scripts/gen-sw-assets.js – nicht von Hand ändern)\nconst ASSETS_TO_CACHE = [\n${list}\n];\n`;
  const after = before.slice(0, start) + block + before.slice(end);
  if (after !== before) fs.writeFileSync(SW, after, 'utf8');
  console.log(`Precache-Liste in sw.js: ${entries.length} Einträge.`);
}

main();
