/**
 * Erzeugt ein Font-Awesome-Subset mit genau den Icons, die die Website benutzt.
 *
 * Statt all.min.css (≈100 KB) und den vollständigen Webfonts (≈290 KB) laden die
 * Seiten nur icons.min.css und die *-subset.woff2-Dateien (zusammen wenige KB).
 *
 * Gesucht wird nach
 *   - Klassen `fa-<name>` in allen HTML-Seiten, Home.js und assets/js/*.js,
 *   - eigenen Icons per `content: "\fXXX"` in style.css (z. B. Häkchen an Konfigurator-Karten).
 *
 * Neue Icons im HTML/JS → `npm run icons` (Teil von `npm run build`) ausführen.
 * Icon-Namen dürfen nicht dynamisch zusammengesetzt werden ('fa-' + name), sonst findet
 * das Skript sie nicht.
 *
 * Nutzung: node scripts/build-icons.js   (oder: npm run icons)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const subsetFont = require('subset-font');

const ROOT = path.join(__dirname, '..');
const FA = path.join(ROOT, 'assets', 'vendor', 'font-awesome');
const SOURCE_CSS = path.join(FA, 'css', 'all.min.css');
const OUT_CSS = path.join(FA, 'css', 'icons.min.css');

// Quelle der Glyphen → Ausgabedatei. v4compatibility wird nicht gebraucht (nur alte FontAwesome-4-Namen).
const FONTS = [
  { family: 'Font Awesome 6 Free', weight: 900, src: 'fa-solid-900.woff2', out: 'fa-solid-900-subset.woff2' },
  { family: 'Font Awesome 6 Free', weight: 400, src: 'fa-regular-400.woff2', out: 'fa-regular-400-subset.woff2' },
  { family: 'Font Awesome 6 Brands', weight: 400, src: 'fa-brands-400.woff2', out: 'fa-brands-400-subset.woff2' }
];

// fa-Klassen, die keine Icons sind (Stil, Größe, Animation …)
const NON_ICON = new Set(['solid', 'regular', 'brands', 'classic', 'sharp', 'fw', 'spin', 'pulse', 'lg', 'xs', 'sm', 'xl', '2xl', '2xs',
  '1x', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x', 'ul', 'li', 'border', 'inverse', 'stack', 'stack-1x', 'stack-2x',
  'flip', 'flip-horizontal', 'flip-vertical', 'flip-both', 'rotate-90', 'rotate-180', 'rotate-270', 'rotate-by', 'beat', 'fade',
  'beat-fade', 'bounce', 'shake', 'pull-left', 'pull-right', 'style-family']);

function sourceFiles() {
  const html = fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).map(f => path.join(ROOT, f));
  const js = fs.readdirSync(path.join(ROOT, 'assets', 'js')).filter(f => f.endsWith('.js')).map(f => path.join(ROOT, 'assets', 'js', f));
  return [...html, path.join(ROOT, 'Home.js'), ...js];
}

function collectUsedIconNames() {
  const names = new Set();
  for (const file of sourceFiles()) {
    for (const m of fs.readFileSync(file, 'utf8').matchAll(/\bfa-([a-z0-9]+(?:-[a-z0-9]+)*)\b/g)) {
      if (!NON_ICON.has(m[1])) names.add(m[1]);
    }
  }
  return names;
}

/** Zerlegt all.min.css in Regeln: { selectors, body } bzw. @-Regeln als Rohtext. */
function parseRules(css) {
  const rules = [];
  let i = 0;
  while (i < css.length) {
    if (css.startsWith('/*', i)) { i = css.indexOf('*/', i) + 2; continue; }
    const open = css.indexOf('{', i);
    if (open === -1) break;
    const prelude = css.slice(i, open).trim();
    if (prelude.startsWith('@')) {
      // verschachtelte Blöcke (@keyframes, @media) bis zur passenden Klammer übernehmen
      let depth = 1, j = open + 1;
      while (depth > 0) { if (css[j] === '{') depth++; else if (css[j] === '}') depth--; j++; }
      rules.push({ at: prelude, raw: css.slice(i, j).trim() });
      i = j;
    } else {
      const close = css.indexOf('}', open);
      rules.push({ selectors: prelude.split(','), body: css.slice(open + 1, close) });
      i = close + 1;
    }
  }
  return rules;
}

function codepointOf(body) {
  const m = body.match(/content:\s*"\\([0-9a-f]+)"/i);
  return m ? parseInt(m[1], 16) : null;
}

async function main() {
  const css = fs.readFileSync(SOURCE_CSS, 'utf8');
  const license = css.match(/^\/\*![\s\S]*?\*\//)[0];
  const used = collectUsedIconNames();
  const rules = parseRules(css);

  const codepoints = new Set();
  const found = new Set();
  const out = [];

  for (const rule of rules) {
    if (rule.at) {
      if (rule.at.startsWith('@font-face')) continue; // wird unten durch die Subset-Fonts ersetzt
      out.push(rule.raw);
      continue;
    }
    const cp = codepointOf(rule.body);
    const isIconRule = cp !== null && rule.selectors.every(s => /^\.fa-[a-z0-9-]+:(?::)?before$/.test(s.trim()));
    if (!isIconRule) {
      // Basis-Regeln (.fa, .fa-solid, Größen, Animationen …) unverändert übernehmen
      out.push(`${rule.selectors.join(',')}{${rule.body}}`);
      continue;
    }
    const keep = rule.selectors.filter(s => used.has(s.trim().replace(/^\.fa-/, '').replace(/:+before$/, '')));
    if (keep.length === 0) continue;
    keep.forEach(s => found.add(s.trim().replace(/^\.fa-/, '').replace(/:+before$/, '')));
    codepoints.add(cp);
    out.push(`${keep.join(',')}{${rule.body}}`);
  }

  // Eigene Icons aus style.css (content: "\f058" o. ä.)
  for (const m of fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8').matchAll(/content:\s*["']\\(f[0-9a-f]{3})["']/gi)) {
    codepoints.add(parseInt(m[1], 16));
  }

  const missing = [...used].filter(n => !found.has(n));
  if (missing.length) {
    throw new Error(`Unbekannte Font-Awesome-Klassen (Tippfehler oder nicht in FA 6 Free): ${missing.map(n => 'fa-' + n).join(', ')}`);
  }

  const text = String.fromCodePoint(...codepoints);
  const fontFaces = [];
  const fontUrls = {};
  for (const font of FONTS) {
    const subset = await subsetFont(fs.readFileSync(path.join(FA, 'webfonts', font.src)), text, { targetFormat: 'woff2' });
    fs.writeFileSync(path.join(FA, 'webfonts', font.out), subset);
    // Inhalts-Hash in der URL: Fonts werden ein Jahr „immutable“ gecacht, ein neues Icon
    // braucht deshalb eine neue URL.
    const hash = crypto.createHash('sha256').update(subset).digest('hex').slice(0, 10);
    fontUrls[font.out] = `${font.out}?h=${hash}`;
    fontFaces.push(`@font-face{font-family:"${font.family}";font-style:normal;font-weight:${font.weight};font-display:block;src:url(../webfonts/${fontUrls[font.out]}) format("woff2")}`);
    console.log(`${font.out}: ${(subset.length / 1024).toFixed(1)} KB`);
  }

  const header = `${license}\n/* Generiert von scripts/build-icons.js – nicht von Hand bearbeiten. */\n`;
  fs.writeFileSync(OUT_CSS, header + fontFaces.join('') + out.join('') + '\n', 'utf8');
  console.log(`icons.min.css: ${found.size} Icons, ${codepoints.size} Glyphen, ${(fs.statSync(OUT_CSS).size / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
