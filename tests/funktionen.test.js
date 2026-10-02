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
    stylesheetRules: [...document.styleSheets].reduce((n, s) => { try { return n + s.cssRules.length; } catch (e) { return n; } }, 0)
  }));
  await context.close();
  assert.equal(state.hasNav, true, 'Home.min.js wurde offline ausgeführt');
  assert.ok(state.stylesheetRules > 100, `Stylesheets offline geladen (Regeln: ${state.stylesheetRules})`);
  assert.equal(state.cssApplied, true);
});
