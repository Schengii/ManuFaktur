/**
 * Hält die Release-Version an allen Stellen synchron:
 *   - ?v=N an den lokalen CSS-/JS-Verweisen in allen HTML-Seiten,
 *   - dieselben ?v=N-URLs in ASSETS_TO_CACHE in sw.js,
 *   - CACHE_NAME in sw.js (wird mit hochgezählt, damit alte Caches verworfen werden).
 *
 * Nutzung:
 *   node scripts/bump-version.js           zählt N und CACHE_NAME um eins hoch  (npm run release)
 *   node scripts/bump-version.js --check   prüft nur, ob alles zusammenpasst    (npm run version:check)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SW = path.join(ROOT, 'sw.js');
const VERSION_RE = /\?v=(\d+)/g;
const CACHE_NAME_RE = /(const CACHE_NAME = 'manufaktur-v)(\d+)(')/;

function htmlFiles() {
  return fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).map(f => path.join(ROOT, f));
}

/** Liefert alle unterschiedlichen ?v=N-Werte aus den übergebenen Dateien. */
function collectVersions(files) {
  const versions = new Map();
  for (const file of files) {
    for (const match of fs.readFileSync(file, 'utf8').matchAll(VERSION_RE)) {
      const name = path.basename(file);
      if (!versions.has(match[1])) versions.set(match[1], new Set());
      versions.get(match[1]).add(name);
    }
  }
  return versions;
}

function check() {
  const versions = collectVersions([...htmlFiles(), SW]);
  if (versions.size === 1) return [...versions.keys()][0];
  const detail = [...versions].map(([v, files]) => `  ?v=${v}: ${[...files].join(', ')}`).join('\n');
  throw new Error(`Uneinheitliche Asset-Versionen – bitte "npm run release" ausführen:\n${detail}`);
}

function bump() {
  const versions = collectVersions([...htmlFiles(), SW]);
  const next = Math.max(...[...versions.keys()].map(Number)) + 1;

  for (const file of [...htmlFiles(), SW]) {
    const before = fs.readFileSync(file, 'utf8');
    let after = before.replace(VERSION_RE, `?v=${next}`);
    if (file === SW) {
      if (!CACHE_NAME_RE.test(after)) throw new Error('CACHE_NAME in sw.js nicht gefunden.');
      after = after.replace(CACHE_NAME_RE, (_, pre, n, post) => pre + (Number(n) + 1) + post);
    }
    if (after !== before) fs.writeFileSync(file, after, 'utf8');
  }
  return next;
}

if (require.main === module) {
  try {
    if (process.argv.includes('--check')) {
      console.log(`Asset-Version einheitlich: ?v=${check()}`);
    } else {
      console.log(`Asset-Version auf ?v=${bump()} gesetzt (HTML-Seiten und sw.js).`);
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { check, bump };
