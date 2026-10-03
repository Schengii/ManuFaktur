/**
 * Erzeugt sitemap.xml aus der Seitenliste unten. <lastmod> ist das Datum der letzten
 * Änderung laut git; Seiten mit noch nicht committeten Änderungen bekommen das heutige Datum.
 *
 * Teil von `npm run release`. Nutzung: node scripts/gen-sitemap.js   (oder: npm run sitemap)
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://www.manufaktur-malerei.de';

// 404.html gehört nicht in die Sitemap.
const PAGES = [
  { file: 'index.html', loc: '/', changefreq: 'monthly', priority: '1.0' },
  { file: 'Home.html', changefreq: 'weekly', priority: '0.9' },
  { file: 'UeberMich.html', changefreq: 'monthly', priority: '0.8' },
  { file: 'Leistungen.html', changefreq: 'monthly', priority: '0.8' },
  { file: 'Bildergalerie.html', changefreq: 'weekly', priority: '0.9' },
  { file: 'Auftrag.html', changefreq: 'monthly', priority: '0.8' },
  { file: 'Kontakt.html', changefreq: 'monthly', priority: '0.7' },
  { file: 'Impressum.html', changefreq: 'yearly', priority: '0.3' },
  { file: 'Datenschutz.html', changefreq: 'yearly', priority: '0.3' }
];

function git(args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function lastModified(file) {
  const today = new Date().toISOString().slice(0, 10);
  if (git(['status', '--porcelain', '--', file])) return today;
  return git(['log', '-1', '--format=%cs', '--', file]) || today;
}

function run() {
  for (const page of PAGES) {
    if (!fs.existsSync(path.join(ROOT, page.file))) throw new Error(`${page.file} existiert nicht.`);
  }
  const urls = PAGES.map(page => [
    '  <url>',
    `    <loc>${SITE}${page.loc || '/' + page.file}</loc>`,
    `    <lastmod>${lastModified(page.file)}</lastmod>`,
    `    <changefreq>${page.changefreq}</changefreq>`,
    `    <priority>${page.priority}</priority>`,
    '  </url>'
  ].join('\n'));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
  console.log(`sitemap.xml mit ${PAGES.length} Seiten geschrieben.`);
}

try {
  run();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
