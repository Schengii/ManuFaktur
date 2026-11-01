/**
 * Paritätstest: Die Header in vercel.json (Produktion) und .htaccess (Apache-Alternative)
 * müssen dieselben Sicherheits- und Cache-Regeln enthalten.
 * Ausführen: node --test tests/header-paritaet.test.js
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
const htaccess = fs.readFileSync(path.join(ROOT, '.htaccess'), 'utf8');

function vercelHeaders(source) {
  const block = vercel.headers.find(h => h.source === source);
  assert.ok(block, `vercel.json: Header-Block für ${source} fehlt`);
  return Object.fromEntries(block.headers.map(h => [h.key, h.value]));
}

/** Liefert den Wert von `Header set <name> "<wert>"` im Text oder null. */
function htaccessValue(text, name) {
  const m = text.match(new RegExp(`Header set ${name} "([^"]*)"`));
  return m ? m[1] : null;
}

/** Text einer `<FilesMatch "regex">…</FilesMatch>`-Gruppe, deren Regex `needle` enthält. */
function filesMatchBlock(needle) {
  const re = /<FilesMatch "([^"]+)">([\s\S]*?)<\/FilesMatch>/g;
  for (const m of htaccess.matchAll(re)) {
    if (m[1].includes(needle)) return m[2];
  }
  return null;
}

test('Globale Sicherheits-Header stimmen in vercel.json und .htaccess überein', () => {
  for (const [key, value] of Object.entries(vercelHeaders('/(.*)'))) {
    assert.equal(htaccessValue(htaccess, key), value, `.htaccess weicht bei ${key} ab`);
  }
});

test('Schriften: gleiche Cache-Regel', () => {
  const expected = vercelHeaders('/(.*)\\.(woff2|woff)')['Cache-Control'];
  const block = filesMatchBlock('woff2');
  assert.ok(block, '.htaccess: FilesMatch für Schriften fehlt');
  assert.equal(htaccessValue(block, 'Cache-Control'), expected);
});

test('Bilder: gleiche Cache-Regel', () => {
  const expected = vercelHeaders('/(.*)\\.(jpg|jpeg|png|webp|avif|svg|ico)')['Cache-Control'];
  const block = filesMatchBlock('webp');
  assert.ok(block, '.htaccess: FilesMatch für Bilder fehlt');
  assert.equal(htaccessValue(block, 'Cache-Control'), expected);
});

test('Service Worker wird nie lange gecacht (no-cache)', () => {
  assert.equal(vercelHeaders('/sw.js')['Cache-Control'], 'no-cache');
  const block = filesMatchBlock('sw');
  assert.ok(block, '.htaccess: FilesMatch für sw.js fehlt');
  assert.equal(htaccessValue(block, 'Cache-Control'), 'no-cache');
});

test('Dokumente (PDF/VCF) sind noindex', () => {
  assert.equal(vercelHeaders('/assets/documents/(.*)')['X-Robots-Tag'], 'noindex');
  const block = filesMatchBlock('pdf');
  assert.ok(block, '.htaccess: FilesMatch für pdf|vcf fehlt');
  assert.equal(htaccessValue(block, 'X-Robots-Tag'), 'noindex');
});
