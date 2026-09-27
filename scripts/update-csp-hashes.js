/**
 * Berechnet SHA-256-Hashes für alle Inline-<script>-Blöcke (z.B. JSON-LD
 * Strukturdaten) in den HTML-Seiten und schreibt sie automatisch in die
 * Content-Security-Policy von vercel.json. Verhindert manuelles, fehleran-
 * fälliges Neuberechnen der Hashes bei jeder Änderung an Inline-Scripts.
 *
 * Nutzung: node scripts/update-csp-hashes.js   (oder: npm run csp:update)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const VERCEL_JSON = path.join(ROOT, 'vercel.json');

const SCRIPT_TAG_RE = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
const SRC_ATTR_RE = /\ssrc\s*=/i;

function collectInlineScriptHashes() {
  const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
  const hashes = new Set();

  for (const file of htmlFiles) {
    const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
    let match;
    while ((match = SCRIPT_TAG_RE.exec(html)) !== null) {
      const [, attrs, body] = match;
      if (attrs && SRC_ATTR_RE.test(attrs)) continue; // externes Script, kein Hash nötig
      if (!body.trim()) continue; // leerer Block
      const hash = crypto.createHash('sha256').update(body, 'utf8').digest('base64');
      hashes.add(`'sha256-${hash}'`);
    }
  }
  return Array.from(hashes).sort();
}

function updateVercelJson(hashes) {
  const config = JSON.parse(fs.readFileSync(VERCEL_JSON, 'utf8'));
  const headerBlock = config.headers.find(h => h.source === '/(.*)');
  const cspHeader = headerBlock.headers.find(h => h.key === 'Content-Security-Policy');

  const directives = cspHeader.value.split(';').map(d => d.trim()).filter(Boolean);
  const scriptSrcIndex = directives.findIndex(d => d.startsWith('script-src'));

  const newScriptSrc = `script-src 'self' ${hashes.join(' ')}`;
  if (scriptSrcIndex === -1) {
    directives.unshift(newScriptSrc);
  } else {
    directives[scriptSrcIndex] = newScriptSrc;
  }

  cspHeader.value = directives.join('; ');

  fs.writeFileSync(VERCEL_JSON, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

const hashes = collectInlineScriptHashes();
console.log(`Gefundene eindeutige Inline-Script-Hashes: ${hashes.length}`);
updateVercelJson(hashes);
console.log('vercel.json aktualisiert.');
