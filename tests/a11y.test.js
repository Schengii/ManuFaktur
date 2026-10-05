/**
 * Automatische Barrierefreiheitsprüfung mit axe-core (WCAG 2.x A/AA) in Hell und Dunkel.
 * Ausführen: npm test (oder: node --test tests/a11y.test.js)
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { start, stop, open } = require('./helpers.js');

const AXE_SOURCE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

before(start);
after(stop);

const PAGES = [
  '/index.html', '/Home.html', '/Bildergalerie.html', '/Auftrag.html', '/Leistungen.html',
  '/UeberMich.html', '/Kontakt.html', '/Impressum.html', '/Datenschutz.html', '/404.html'
];
const THEMES = ['light', 'dark'];

for (const path of PAGES) {
  for (const theme of THEMES) {
    test(`a11y: ${path} (${theme}) hat keine WCAG-Verstöße`, async () => {
      const { page, context } = await open(path, { storage: { manufaktur_theme: theme } });
      // page.evaluate statt addScriptTag: Inline-Skripte würden von der Produktions-CSP blockiert.
      await page.evaluate(AXE_SOURCE);
      // Übergänge (transition: all) können Farben kurz verfälschen. Echte Verstöße bleiben bestehen,
      // deshalb zählt nur, was in allen Durchläufen auftritt.
      let violations = [];
      for (let attempt = 0; attempt < 3; attempt++) {
        await page.waitForTimeout(attempt === 0 ? 300 : 900);
        ({ violations } = await page.evaluate(() => axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }
        })));
        if (violations.length === 0) break;
      }
      await context.close();
      const report = violations.map(v =>
        `${v.id} (${v.impact}): ${v.help}\n    ` + v.nodes.slice(0, 3).map(n => n.target.join(' ')).join('\n    ')
      );
      assert.deepEqual(report, []);
    });
  }
}
