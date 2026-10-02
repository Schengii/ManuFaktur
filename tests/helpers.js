/**
 * Gemeinsame Test-Helfer: startet den lokalen Server mit Produktions-CSP und
 * einen echten Chrome (über playwright-core, ohne Browser-Download).
 */
const { chromium } = require('playwright-core');
const { createServer } = require('../scripts/serve.js');

let server;
let browser;
let baseUrl;

async function start() {
  server = createServer();
  await new Promise(resolve => server.listen(0, resolve));
  baseUrl = `http://localhost:${server.address().port}`;
  browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'chrome' });
}

async function stop() {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
}

/**
 * Öffnet eine Seite in einem frischen, isolierten Browser-Kontext.
 * @param {string} urlPath          z. B. '/Home.html'
 * @param {object} [options]
 * @param {object} [options.storage]        localStorage-Einträge, die vor dem Laden gesetzt werden
 * @param {boolean} [options.serviceWorker] Service Worker zulassen (Standard: blockiert)
 * @param {object} [options.context]        zusätzliche Playwright-Kontextoptionen
 */
async function open(urlPath, options = {}) {
  const context = await browser.newContext({
    serviceWorkers: options.serviceWorker ? 'allow' : 'block',
    ...options.context
  });
  if (options.storage) {
    // Nur beim allerersten Laden setzen, damit die Seite den Zustand danach selbst verwalten kann.
    await context.addInitScript(entries => {
      if (sessionStorage.getItem('__seeded')) return;
      sessionStorage.setItem('__seeded', '1');
      for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
    }, options.storage);
  }
  const page = await context.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(String(err)));
  await page.goto(baseUrl + urlPath, { waitUntil: 'load' });
  return { page, context, errors };
}

/** true, wenn das Element tatsächlich gerendert wird (nicht display:none). */
function isDisplayed(page, selector) {
  return page.$eval(selector, el => getComputedStyle(el).display !== 'none');
}

module.exports = { start, stop, open, isDisplayed, getBaseUrl: () => baseUrl };
