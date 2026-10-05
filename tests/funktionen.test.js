/**
 * Funktionstests im echten Browser unter Produktions-CSP.
 * Ausführen: npm test
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { start, stop, open, isDisplayed } = require('./helpers.js');

before(start);
after(stop);

const PAGES = [
  '/index.html', '/Home.html', '/Bildergalerie.html', '/Auftrag.html', '/Leistungen.html',
  '/UeberMich.html', '/Kontakt.html', '/Impressum.html', '/Datenschutz.html', '/404.html'
];

for (const path of PAGES) {
  test(`${path} lädt ohne Konsolenfehler und CSP-Verstöße`, async () => {
    const { page, context, errors } = await open(path);
    await page.waitForTimeout(300);
    await context.close();
    assert.deepEqual(errors, []);
  });
}

test('Footer: Dunkelmodus-Umschalter wechselt das Theme', async () => {
  const { page, context, errors } = await open('/Home.html', { storage: { manufaktur_theme: 'light' } });
  await page.click('#theme-toggle-btn');
  assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
  await page.click('#theme-toggle-btn');
  assert.equal(await page.getAttribute('html', 'data-theme'), 'light');
  await context.close();
  assert.deepEqual(errors, []);
});

test('Footer: Sprach-Umschalter wechselt zu Englisch und zurück', async () => {
  const { page, context, errors } = await open('/Home.html');
  await page.click('#lang-toggle-btn');
  assert.equal(await page.getAttribute('html', 'lang'), 'en');
  assert.match(await page.textContent('.welcome h1'), /Welcome/);
  // Der Button wird beim Sprachwechsel neu aufgebaut und muss weiter funktionieren.
  await page.click('#lang-toggle-btn');
  assert.equal(await page.getAttribute('html', 'lang'), 'de');
  await context.close();
  assert.deepEqual(errors, []);
});

test('Galerie: der gewählte Filter-Button ist als aktiv markiert', async () => {
  const { page, context } = await open('/Bildergalerie.html');
  const active = () => page.$$eval('.filter-btn.active', btns => btns.map(b => b.dataset.filter));
  assert.deepEqual(await active(), ['alle']);
  await page.click('.filter-btn[data-filter="tiere"]');
  assert.deepEqual(await active(), ['tiere']);
  assert.equal(await page.getAttribute('.filter-btn[data-filter="tiere"]', 'aria-pressed'), 'true');
  await context.close();
});

test('Galerie: Suche ohne Treffer zeigt die „Keine Gemälde gefunden“-Meldung', async () => {
  const { page, context } = await open('/Bildergalerie.html');
  assert.equal(await isDisplayed(page, '#no-gallery-results'), false);
  await page.fill('#gallery-search', 'xyzxyzxyz');
  assert.equal(await isDisplayed(page, '#no-gallery-results'), true);
  await page.fill('#gallery-search', '');
  assert.equal(await isDisplayed(page, '#no-gallery-results'), false);
  await context.close();
});

test('Lightbox: Wandansicht zeigt das Badge der Wandvorlage', async () => {
  const { page, context } = await open('/Bildergalerie.html');
  await page.click('.gallery-item a');
  await page.waitForSelector('#lightbox', { state: 'visible' });
  assert.equal(await isDisplayed(page, '#wall-badge-tag'), false);
  await page.click('#lightbox-room-btn');
  assert.equal(await isDisplayed(page, '#wall-badge-tag'), true);
  await page.click('.view-thumb-btn[data-view="front"]');
  assert.equal(await isDisplayed(page, '#wall-badge-tag'), false);
  await context.close();
});

test('Lightbox: zeigt keine erfundenen Kundenstimmen zu einzelnen Werken', async () => {
  const { page, context } = await open('/Bildergalerie.html#DSC_6626a');
  await page.waitForSelector('#lightbox', { state: 'visible' });
  const lightboxText = await page.textContent('#lightbox');
  assert.doesNotMatch(lightboxText, /Elena M\.|Stefan K\.|Karin S\./);
  await context.close();
});

test('Lightbox: Schließen und Pfeile sind Buttons, der Tastaturfokus bleibt im Dialog', async () => {
  const { page, context } = await open('/Bildergalerie.html');
  await page.click('.gallery-item a');
  await page.waitForSelector('#lightbox', { state: 'visible' });
  assert.deepEqual(
    await page.$$eval('#lightbox > .close, #lightbox > .prev, #lightbox > .next', els => els.map(el => el.tagName)),
    ['BUTTON', 'BUTTON', 'BUTTON']
  );
  assert.equal(await page.evaluate(() => document.activeElement.className), 'close');
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    assert.ok(await page.evaluate(() => document.getElementById('lightbox').contains(document.activeElement)),
      `Fokus hat die Lightbox nach ${i + 1}× Tab verlassen`);
  }
  await page.keyboard.press('Shift+Tab');
  assert.ok(await page.evaluate(() => document.getElementById('lightbox').contains(document.activeElement)));
  await page.keyboard.press('Escape');
  assert.equal(await isDisplayed(page, '#lightbox'), false);
  await context.close();
});

test('Kundenstimmen: Karussell lässt sich anhalten und ist per Tastatur bedienbar', async () => {
  const { page, context } = await open('/Home.html');
  assert.equal(await page.$$eval('.testimonial-dot', dots => dots.filter(d => d.tagName === 'BUTTON').length), 3);
  assert.equal(await page.getAttribute('.testimonial-stars', 'role'), 'img');
  assert.equal(await page.getAttribute('#testi-pause', 'aria-pressed'), 'false');
  await page.click('#testi-pause');
  assert.equal(await page.getAttribute('#testi-pause', 'aria-pressed'), 'true');
  await page.click('.testimonial-dot:nth-child(3)');
  assert.equal(await page.getAttribute('.testimonial-dot:nth-child(3)', 'aria-current'), 'true');
  assert.equal(await page.$$eval('.testimonial-slide', s => s.findIndex(el => el.classList.contains('active'))), 2);
  await context.close();
});

test('Kundenstimmen: bei „Bewegung reduzieren“ startet kein automatischer Wechsel', async () => {
  const { page, context } = await open('/Home.html');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  assert.equal(await page.getAttribute('#testi-pause', 'aria-pressed'), 'true');
  await context.close();
});

test('Toast-Meldungen sind eine Statusmeldung und unterbrechen den Screenreader nicht', async () => {
  const { page, context } = await open('/Home.html');
  assert.equal(await page.getAttribute('#toast', 'role'), 'status');
  await context.close();
});

test('Sprachwechsel: nach Englisch und zurück steht wieder exakt der deutsche HTML-Text da', async () => {
  for (const path of ['/Bildergalerie.html', '/UeberMich.html', '/Auftrag.html']) {
    const { page, context } = await open(path);
    // Text und übersetzbare Attribute (innerHTML ändert sich nebenbei durch Bild-Ladezustände)
    const snapshot = () => page.evaluate(() => {
      const main = document.querySelector('main');
      const attrs = Array.from(main.querySelectorAll('[aria-label], [alt], [title], [placeholder]'))
        .map(el => ['aria-label', 'alt', 'title', 'placeholder'].map(a => el.getAttribute(a)).join('|'));
      return { text: main.textContent, attrs };
    });
    const before = await snapshot();
    await page.click('#lang-toggle-btn');
    const english = await snapshot();
    assert.notEqual(english.text, before.text, `${path}: Englisch unterscheidet sich nicht`);
    await page.click('#lang-toggle-btn');
    assert.deepEqual(await snapshot(), before, `${path}: deutscher Text hat sich verändert`);
    await context.close();
  }
});

test('Lightbox: Verfügbarkeit erscheint nur bei Werken mit status-Feld', async () => {
  const { page, context } = await open('/Bildergalerie.html');
  await page.click('#DSC_6622a a');
  await page.waitForSelector('#lightbox', { state: 'visible' });
  assert.equal(await isDisplayed(page, '#lb-detail-status-row'), false);
  await page.keyboard.press('Escape');
  await page.evaluate(() => { ARTWORKS_METADATA.DSC_6622a.status = 'verkauft'; });
  await page.click('#DSC_6622a a');
  assert.equal(await isDisplayed(page, '#lb-detail-status-row'), true);
  assert.match(await page.textContent('#lb-detail-status'), /^Verkauft/);
  await context.close();
});

test('SEO: strukturierte Daten sind gültiges JSON, Vorschaubilder existieren', async () => {
  const fs = require('fs');
  const path = require('path');
  const root = path.join(__dirname, '..');
  for (const file of fs.readdirSync(root).filter(f => f.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      assert.doesNotThrow(() => JSON.parse(m[1]), `${file}: ungültiges JSON-LD`);
    }
    for (const m of html.matchAll(/<meta (?:property="og:image"|name="twitter:image") content="https:\/\/www\.manufaktur-malerei\.de\/([^"]+)"/g)) {
      assert.ok(fs.existsSync(path.join(root, m[1])), `${file}: ${m[1]} fehlt`);
    }
  }
});

test('Performance: Seiten laden nur das Icon-Subset, nicht das komplette Font Awesome', async () => {
  const { page, context } = await open('/Kontakt.html');
  const requested = [];
  page.on('request', req => requested.push(req.url()));
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  assert.ok(requested.some(u => u.includes('icons.min.css')));
  assert.ok(!requested.some(u => /all\.min\.css|fa-(solid-900|brands-400|regular-400)\.woff2/.test(u)));
  // Brand-Icon (WhatsApp) und Solid-Icon (Brief) haben eine Glyphe im Subset. Fehlt eine Glyphe,
  // zeichnet Chrome das Ersatzzeichen (.notdef) der Icon-Font – erkennbar an dessen Breite,
  // gemessen an einem Zeichen aus dem Private-Use-Bereich, das Font Awesome nicht belegt.
  const hasGlyph = (font, char) => page.evaluate(async ([font, char]) => {
    await document.fonts.load(font, char);
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = font;
    return ctx.measureText(char).width !== ctx.measureText('').width;
  }, [font, char]);
  assert.ok(await hasGlyph('400 40px "Font Awesome 6 Brands"', ''), 'WhatsApp-Icon fehlt im Subset');
  assert.ok(await hasGlyph('900 40px "Font Awesome 6 Free"', ''), 'Brief-Icon fehlt im Subset');
  assert.equal(await hasGlyph('900 40px "Font Awesome 6 Free"', ''), false, 'Gegenprobe: nicht benutztes Icon darf fehlen');
  // Seiten ohne Galerie laden die Werkdaten nicht
  assert.equal(await page.evaluate(() => typeof ARTWORKS_METADATA), 'undefined');
  await context.close();
});

test('Performance: schmale Bildschirme bekommen in der Lightbox die 1000-px-Fassung', async () => {
  const { page, context } = await open('/Bildergalerie.html');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.click('.gallery-item a');
  await page.waitForSelector('#lightbox', { state: 'visible' });
  assert.match(await page.getAttribute('#lightbox-img', 'src'), /\/thumbs\/[^/]+-1000w\.webp$/);
  assert.match(await page.getAttribute('#thumb-img-front', 'src'), /-400w\.webp$/);
  await context.close();
});

const SAVED_CONFIG = JSON.stringify({
  step: 4, motiv: 'Tierportrait', format: '30×40 cm', technik: 'Acryl', lieferzeit: 'ca. 2–3 Wochen'
});

test('Konfigurator: gespeicherte Konfiguration blendet das Wiederherstellen-Banner ein', async () => {
  const { page, context } = await open('/Auftrag.html', { storage: { manufaktur_konfigurator_state: SAVED_CONFIG } });
  assert.equal(await isDisplayed(page, '#restore-banner'), true);
  await context.close();
});

test('Konfigurator: ohne gespeicherte Konfiguration bleibt das Banner verborgen', async () => {
  const { page, context } = await open('/Auftrag.html');
  assert.equal(await isDisplayed(page, '#restore-banner'), false);
  await context.close();
});

test('Konfigurator: Wiederherstellen in Schritt 4 füllt Zusammenfassung und Anfrage-Link', async () => {
  const { page, context } = await open('/Auftrag.html', { storage: { manufaktur_konfigurator_state: SAVED_CONFIG } });
  await page.click('#restore-btn');
  assert.equal(await isDisplayed(page, '#restore-banner'), false);
  assert.equal(await page.$eval('.config-panel.active', el => el.id), 'panel-4');
  assert.equal(await page.textContent('#summary-motiv'), 'Tierportrait');
  assert.equal(await page.textContent('#summary-format'), '30×40 cm');
  assert.equal(await page.textContent('#summary-technik'), 'Acrylfarben');
  const href = await page.getAttribute('#anfrage-link', 'href');
  assert.match(href, /^Kontakt\.html\?/);
  assert.match(href, /motiv=Tierportrait/);
  await context.close();
});

test('Konfigurator: gemerkte Favoriten werden in Schritt 1 angeboten', async () => {
  const { page, context } = await open('/Auftrag.html', {
    storage: { manufaktur_favorites: JSON.stringify(['DSC_6622a', 'bild18-eulen']) }
  });
  assert.equal(await isDisplayed(page, '#config-saved-favorites'), true);
  assert.equal(await page.$$eval('.fav-card-item', cards => cards.length), 2);
  // Vorschaubilder müssen tatsächlich laden (Pfad zu den Thumbnails)
  await page.waitForFunction(() => Array.from(document.querySelectorAll('.fav-card-item img')).every(img => img.complete));
  assert.ok(await page.$$eval('.fav-card-item img', imgs => imgs.every(img => img.naturalWidth > 0)));
  await context.close();
});

test('Konfigurator: Fortschrittsanzeige meldet den aktuellen Schritt', async () => {
  const { page, context } = await open('/Auftrag.html', { storage: { manufaktur_konfigurator_state: SAVED_CONFIG } });
  assert.equal(await page.getAttribute('.progress-bar-container', 'aria-valuenow'), '1');
  await page.click('#restore-btn');
  assert.equal(await page.getAttribute('.progress-bar-container', 'aria-valuenow'), '4');
  assert.match(await page.getAttribute('.progress-bar-container', 'aria-valuetext'), /^Schritt 4 von 4/);
  await context.close();
});

test('Konfigurator: ?ref= wird als reiner Text angezeigt, HTML wird nicht eingeschleust', async () => {
  const payload = '<img src=x id=injected-probe><a href="https://example.com">Klick</a>';
  const { page, context } = await open('/Auftrag.html?kat=tiere&ref=' + encodeURIComponent(payload));
  assert.equal(await page.$('#injected-probe'), null);
  assert.equal(await page.$('#hint-1 a'), null);
  assert.ok((await page.textContent('#hint-1')).includes(payload), 'Referenz erscheint als Text');
  await context.close();
});

test('Auftragsablauf: Motiv-Referenz aus der Galerie kommt in der Kontaktnachricht an', async () => {
  const { page, context } = await open('/Bildergalerie.html');
  await page.click('.gallery-item a');
  await page.waitForSelector('#lightbox', { state: 'visible' });
  await Promise.all([page.waitForURL(/Auftrag\.html/), page.click('#lightbox-inquiry-btn')]);
  // Das Motiv (Landschaft) ist anhand der Kategorie vorausgewählt.
  await page.click('#next-1');
  await page.click('.format-card[data-value="30×40 cm"]');
  await page.click('#next-2');
  await page.click('.technique-card[data-value="Öl"]');
  await page.click('#next-3');
  await Promise.all([page.waitForURL(/Kontakt\.html/), page.click('#anfrage-link')]);
  const message = await page.inputValue('#message');
  assert.match(message, /Motiv: Landschaft/);
  assert.match(message, /Format: 30×40 cm/);
  assert.match(message, /Godesburg modern/, 'Titel des Referenz-Gemäldes steht in der Nachricht');
  await context.close();
});

test('Konfigurator: Foto-Vorschau verspricht keinen Upload, sondern erklärt den Versandweg', async () => {
  const { page, context } = await open('/Auftrag.html');
  const text = await page.textContent('.photo-upload-wrapper');
  assert.doesNotMatch(text, /Bereit für die Anfrage/);
  assert.match(text, /nicht (mit der Anfrage )?übertragen|per E-Mail oder WhatsApp/);
  await context.close();
});

test('Service Worker: Seite bleibt offline mit Styles und Skripten nutzbar', async () => {
  const { page, context } = await open('/Home.html', { serviceWorker: true });
  await page.evaluate(() => navigator.serviceWorker.ready);
  // Zweiter Aufruf läuft bereits über den aktiven Service Worker.
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(500);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'load' });
  const state = await page.evaluate(() => ({
    hasNav: !!document.querySelector('nav .nav-links'),
    cssApplied: getComputedStyle(document.querySelector('.skip-link')).position === 'absolute',
    stylesheetRules: [...document.styleSheets].reduce((n, s) => { try { return n + s.cssRules.length; } catch { return n; } }, 0)
  }));
  await context.close();
  assert.equal(state.hasNav, true, 'Home.min.js wurde offline ausgeführt');
  assert.ok(state.stylesheetRules > 100, `Stylesheets offline geladen (Regeln: ${state.stylesheetRules})`);
  assert.equal(state.cssApplied, true);
});
