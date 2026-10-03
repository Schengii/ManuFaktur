/**
 * Erzeugt die strukturierten Daten (schema.org/VisualArtwork) für alle Werke der Bildergalerie
 * aus assets/js/artworks-data.js und schreibt sie zwischen die Marker
 *     <!-- generated:gallery-jsonld --> … <!-- /generated:gallery-jsonld -->
 * in Bildergalerie.html. So gibt es keine dritte, von Hand gepflegte Kopie der Werkdaten.
 *
 * Teil von `npm run build` (vor csp:update, weil sich dabei der Hash des Inline-Skripts ändert).
 * Nutzung: node scripts/gen-gallery-jsonld.js   (oder: npm run jsonld)
 */
const fs = require('fs');
const path = require('path');
const { loadData, galleryItems } = require('./check-gallery.js');

const ROOT = path.join(__dirname, '..');
const PAGE = path.join(ROOT, 'Bildergalerie.html');
const SITE = 'https://www.manufaktur-malerei.de';
const MARKER_RE = /([ \t]*)<!-- generated:gallery-jsonld -->\n[\s\S]*?<!-- \/generated:gallery-jsonld -->/;

function build() {
  const { de } = loadData();
  const artworks = galleryItems('Bildergalerie.html')
    .filter(item => item.id && de[item.id])
    .map(item => {
      const meta = de[item.id];
      return {
        '@type': 'VisualArtwork',
        '@id': `${SITE}/Bildergalerie.html#${item.id}`,
        name: meta.title,
        description: meta.desc,
        image: `${SITE}/${item.href}`,
        artform: 'Gemälde',
        artMedium: meta.technik,
        size: meta.masse,
        creator: { '@id': `${SITE}/#manuela-schenk` }
      };
    });

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE}/#manuela-schenk`,
        name: 'Manuela Schenk',
        jobTitle: 'Künstlerin',
        url: `${SITE}/UeberMich.html`
      },
      ...artworks
    ]
  };
}

function run() {
  const html = fs.readFileSync(PAGE, 'utf8');
  const match = html.match(MARKER_RE);
  if (!match) throw new Error('Marker <!-- generated:gallery-jsonld --> fehlt in Bildergalerie.html.');
  const indent = match[1];
  const json = JSON.stringify(build(), null, 2).split('\n').map(line => indent + '  ' + line).join('\n');
  const block = `${indent}<!-- generated:gallery-jsonld -->\n${indent}<script type="application/ld+json">\n${json}\n${indent}</script>\n${indent}<!-- /generated:gallery-jsonld -->`;
  const next = html.replace(MARKER_RE, block);
  if (next !== html) fs.writeFileSync(PAGE, next, 'utf8');
  console.log(`VisualArtwork-Daten für ${build()['@graph'].length - 1} Werke in Bildergalerie.html.`);
}

try {
  run();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
