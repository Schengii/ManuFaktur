/**
 * Erzeugt die Vorschaubilder für Link-Vorschauen (Open Graph / Twitter Card) im
 * empfohlenen Format 1200 × 630 px als JPEG – WebP wird nicht von allen Plattformen angezeigt.
 *
 * Ausgabe: assets/images/og/*.jpg. Die Seiten verweisen per og:image/twitter:image darauf.
 * Nutzung: node scripts/gen-og-images.js   (oder: npm run images:og)
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'images', 'og');
const WIDTH = 1200;
const HEIGHT = 630;

const IMAGES = [
  { out: 'og-eulen.jpg', src: 'assets/images/artworks/bild18-eulen.webp' },
  { out: 'og-galerie.jpg', src: 'assets/images/img/lightbox/DSC_6622a.webp' },
  { out: 'og-hahn.jpg', src: 'assets/images/artworks/bild13-hahn.webp' },
  // Hochformat-Foto vollständig zeigen (Gesichter würden beim Zuschneiden abgeschnitten)
  { out: 'og-manuela.jpg', src: 'assets/images/manuela-balou.webp', fit: 'contain', scale: 1, background: '#faf8f5' },
  // Logo nicht beschneiden, sondern mittig auf hellen Grund setzen
  { out: 'og-logo.jpg', src: 'assets/images/logos/logo.png', fit: 'contain', background: '#faf8f5' }
];

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const img of IMAGES) {
    const target = path.join(OUT, img.out);
    let pipeline;
    if (img.fit === 'contain') {
      // sharp kennt nur einen resize je Pipeline: Logo erst verkleinern, dann auf die Fläche setzen.
      const logo = await sharp(path.join(ROOT, img.src))
        .resize({ width: Math.round(WIDTH * (img.scale || 0.7)), height: Math.round(HEIGHT * (img.scale || 0.7)), fit: 'inside' })
        .toBuffer();
      pipeline = sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: img.background } })
        .composite([{ input: logo, gravity: 'center' }]);
    } else {
      pipeline = sharp(path.join(ROOT, img.src))
        .resize({ width: WIDTH, height: HEIGHT, fit: 'cover', position: img.position || 'attention' });
    }
    await pipeline.jpeg({ quality: 82, mozjpeg: true }).toFile(target);
    console.log(`${img.out}: ${(fs.statSync(target).size / 1024).toFixed(0)} KB`);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
