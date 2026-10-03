/**
 * Kopiert wiederverwendete HTML-Blöcke aus partials/ in die Seiten.
 *
 * Eine Seite markiert die Stelle mit
 *     <!-- partial:lightbox -->
 *     … (wird bei jedem Lauf überschrieben) …
 *     <!-- /partial:lightbox -->
 * und bekommt dazwischen den Inhalt von partials/lightbox.html (eingerückt wie der Marker).
 * So bleibt das HTML statisch (kein Nachladen per JS, keine CSP-Änderung), existiert aber nur einmal.
 *
 * Nutzung:
 *   node scripts/sync-partials.js           Seiten aktualisieren (Teil von npm run build)
 *   node scripts/sync-partials.js --check   nur prüfen, ob alle Seiten aktuell sind (CI)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PARTIALS = path.join(ROOT, 'partials');
const BLOCK_RE = /^([ \t]*)<!-- partial:([a-z0-9-]+) -->\n[\s\S]*?^[ \t]*<!-- \/partial:\2 -->/gm;

function render(indent, name) {
  const file = path.join(PARTIALS, `${name}.html`);
  if (!fs.existsSync(file)) throw new Error(`partials/${name}.html nicht gefunden.`);
  const body = fs.readFileSync(file, 'utf8').replace(/\s+$/, '')
    .split('\n').map(line => (line ? indent + line : line)).join('\n');
  return `${indent}<!-- partial:${name} -->\n${body}\n${indent}<!-- /partial:${name} -->`;
}

function sync({ check = false } = {}) {
  const stale = [];
  for (const page of fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))) {
    const file = path.join(ROOT, page);
    const before = fs.readFileSync(file, 'utf8');
    const after = before.replace(BLOCK_RE, (_, indent, name) => render(indent, name));
    if (after === before) continue;
    stale.push(page);
    if (!check) fs.writeFileSync(file, after, 'utf8');
  }
  return stale;
}

if (require.main === module) {
  try {
    const check = process.argv.includes('--check');
    const stale = sync({ check });
    if (check && stale.length) {
      console.error(`Partials nicht synchron in: ${stale.join(', ')} – bitte "npm run build" ausführen.`);
      process.exit(1);
    }
    console.log(stale.length ? `Partials aktualisiert: ${stale.join(', ')}` : 'Partials synchron.');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { sync };
