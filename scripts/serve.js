/**
 * Lokaler statischer Server, der die globalen Sicherheits-Header aus vercel.json
 * (inkl. Content-Security-Policy) mitsendet. Damit verhält sich die Seite lokal
 * wie in Produktion – CSP-Verstöße fallen sofort auf, statt erst nach dem Deploy.
 *
 * Nutzung: node scripts/serve.js [port]   (oder: npm start)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.vcf': 'text/vcard'
};

function loadGlobalHeaders() {
  const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  const block = config.headers.find(h => h.source === '/(.*)');
  const headers = {};
  for (const { key, value } of block.headers) {
    // HSTS und upgrade-insecure-requests sind auf http://localhost nicht sinnvoll.
    if (key === 'Strict-Transport-Security') continue;
    headers[key] = key === 'Content-Security-Policy'
      ? value.replace(/;\s*upgrade-insecure-requests/, '')
      : value;
  }
  return headers;
}

function createServer() {
  return http.createServer((req, res) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent(req.url.split('?')[0]);
    } catch (e) {
      res.writeHead(400);
      res.end('400');
      return;
    }
    if (urlPath.endsWith('/')) urlPath += 'index.html';

    const file = path.normalize(path.join(ROOT, urlPath));
    const headers = loadGlobalHeaders();
    const isInsideRoot = file === ROOT || file.startsWith(ROOT + path.sep);

    if (!isInsideRoot || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      headers['Content-Type'] = MIME_TYPES['.html'];
      res.writeHead(404, headers);
      fs.createReadStream(path.join(ROOT, '404.html')).pipe(res);
      return;
    }

    headers['Content-Type'] = MIME_TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    headers['Cache-Control'] = 'no-cache';
    res.writeHead(200, headers);
    fs.createReadStream(file).pipe(res);
  });
}

module.exports = { createServer };

if (require.main === module) {
  const port = parseInt(process.argv[2], 10) || 3000;
  createServer().listen(port, () => {
    console.log(`ManuFAKTUR läuft auf http://localhost:${port} (mit Produktions-CSP aus vercel.json)`);
  });
}
