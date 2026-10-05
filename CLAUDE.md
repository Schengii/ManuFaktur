# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

Statische Portfolio- und Auftrags-Website für das Bonner Kunst-Atelier **ManuFAKTUR Schenk** (`www.manufaktur-malerei.de`). Reines Vanilla HTML/CSS/JS ohne Framework und ohne Bundler; Node wird nur für Minifizierung, CSP-Hashes, Thumbnails und Tests gebraucht. Das Repo-Root wird unverändert ausgeliefert (Vercel mit `outputDirectory: "."`, alternativ Apache über `.htaccess`).

Code-Kommentare, Commit-Inhalte und UI-Texte sind deutsch; Commits folgen Conventional Commits (`feat:`, `fix:`, `docs:` …).

## Befehle

| Aufgabe | Befehl |
| :--- | :--- |
| Produktions-Build (Partials, JSON-LD, Icons, CSS, JS, CSP) | `npm run build` |
| Release: `?v=N` + `CACHE_NAME` hochzählen, Sitemap, Build | `npm run release` |
| Nur CSS / nur JS minifizieren | `npm run build:css` / `npm run build:js` |
| CSP-Hashes in `vercel.json` und `.htaccess` neu berechnen | `npm run csp:update` |
| Lokaler Server mit Produktions-CSP (Port 3000) | `npm start` |
| ESLint (auch in der CI) | `npm run lint` |
| Alle Browser-Tests (inkl. axe-core-a11y-Test in `tests/a11y.test.js`) | `npm test` |
| Einzelnen Test per Namensmuster | `node --test --test-name-pattern="Konfigurator" tests/funktionen.test.js` |
| Werkdaten ↔ HTML ↔ Bilddateien prüfen | `npm run check:gallery` |
| Asset-Versionen auf Gleichstand prüfen | `npm run version:check` |
| Thumbnails 400/700/1000w aus `lightbox/` erzeugen | `npm run images:srcset` |
| Lightbox-Bilder verkleinern (max. 1600 px, WebP 80, nur bei ≥ 10 % Ersparnis) | `npm run images:lightbox` |
| Lighthouse-Prüfung wie in der CI (Schwellen in `lighthouserc.json`) | `npx @lhci/cli@0.15.1 autorun` |
| Precache-Liste in `sw.js` neu erzeugen (Teil von `npm run build`) | `npm run sw:assets` |
| Link-Vorschaubilder (1200 × 630) erzeugen | `npm run images:og` |

- `npm start` (`scripts/serve.js`) sendet die Header aus `vercel.json` mit, sodass CSP-Verstöße lokal sichtbar werden. `npx serve` oder `python -m http.server` tun das nicht.
- Die Tests laufen mit `node:test` + `playwright-core` gegen ein **installiertes Chrome** (kein Browser-Download). Anderer Browser: `PW_CHANNEL=msedge npm test`.
- Die Tests laden die Seiten so, wie sie ausgeliefert werden – also `*.min.*`. Nach Änderungen an `style.css`/`Home.js` erst `npm run build`, dann `npm test`.

## Architektur

### Quellen vs. ausgelieferte Dateien

Bearbeitet werden die Quellen; `npm run build` erzeugt daraus den Rest. Generierte Dateien sind **eingecheckt**, weil es beim Deploy keinen Build-Schritt gibt. Die CI (`.github/workflows/ci.yml`) baut neu und schlägt fehl, wenn das Ergebnis vom Commit abweicht – Build-Output also immer mitcommitten.

| Quelle | Generiert (nie von Hand ändern) |
| :--- | :--- |
| `style.css`, `Home.js`, `assets/js/i18n.js` | `style.min.css`, `Home.min.js`, `assets/js/i18n.min.js` |
| `partials/lightbox.html` | Block zwischen `<!-- partial:lightbox -->` … `<!-- /partial:lightbox -->` in Home.html und Bildergalerie.html (`scripts/sync-partials.js`) |
| `assets/js/artworks-data.js` | `VisualArtwork`-JSON-LD zwischen `<!-- generated:gallery-jsonld -->`-Markern in Bildergalerie.html |
| benutzte `fa-*`-Klassen in HTML/JS, `content: "\fXXX"` in style.css | `assets/vendor/font-awesome/css/icons.min.css`, `webfonts/*-subset.woff2` |
| JSON-LD-Blöcke | CSP-Hashes in `vercel.json` und `.htaccess` |
| eingebundene CSS/JS-Dateien, Seiten, Logos, Schriften | `ASSETS_TO_CACHE` in `sw.js` zwischen `<generated:assets>`-Markern (`scripts/gen-sw-assets.js`; bricht ab, wenn eine Datei fehlt) |

Icon-Namen deshalb nie dynamisch zusammensetzen (`'fa-' + name`) – `scripts/build-icons.js` findet nur ausgeschriebene Klassen und bricht bei unbekannten Namen ab. `all.min.css` und die vollen Webfonts bleiben nur als Quelle für das Subset im Repo.

Alle Seiten binden CSS/JS mit `?v=N` ein; `sw.js` cacht dieselben URLs (der Cache matcht inklusive Query-String; die Liste wird beim Build erzeugt) und braucht bei jeder Änderung einen neuen `CACHE_NAME`. `vercel.json` liefert `style.min.css`, `Home.min.js` und `assets/**/*.css|js` als `immutable` aus – neue Skripte deshalb immer mit `?v=N` einbinden. `npm run release` (`scripts/bump-version.js`) zählt beides gemeinsam hoch, `npm run version:check` prüft in der CI, dass alle `?v=N` übereinstimmen. Die Version erst hochzählen, wenn der vorige Stand deployt ist.

### Skript-Aufbau

- `assets/js/insights.js` (per `defer` im `<head>`) lädt auf der echten Domain Vercel Web Analytics und Speed Insights von `/_vercel/…`; lokal läuft nichts (sonst 404 in `npm start` und Tests).
- `assets/js/theme-init.js` läuft im `<head>` und setzt `data-theme`/`lang` aus `localStorage`, bevor gerendert wird (kein Aufblitzen des falschen Themes).
- `Home.js` ist **ein** globales Skript für alle Seiten (keine Module). Seiten-spezifische Initialisierer prüfen selbst, ob ihre Elemente existieren, und werden am Dateiende gesammelt über `runOnDOMReady` gestartet.
- `assets/js/i18n.js` enthält `I18N_DICTIONARY` (de + en) und wird von `Home.js` nur bei Bedarf nachgeladen (`ensureI18n`/`whenI18nReady`): beim Start auf Englisch oder beim ersten Sprachwechsel. Deutsche Besucher laden die Datei nie. Code, der Texte aus dem Wörterbuch braucht, nutzt `getI18nDict()` (liefert `null`, solange es fehlt) und muss einen deutschen Fallback haben (siehe `STATUS_TEXTS_DE`).
- `assets/js/auftrag.js` (Konfigurator) wird nur in `Auftrag.html` nach `Home.min.js` geladen, ist nicht minifiziert und teilt sich den globalen Scope mit `Home.js` (`state`, `buildSummary`, `getLanguage` werden gegenseitig benutzt).
- Seitenübergreifende Globals zwischen `Home.js`, `auftrag.js` und `artworks-data.js` sind in `eslint.config.js` deklariert (`no-undef`); neue gemeinsam genutzte Namen dort eintragen.
- `index.html` ist die Hero-Einstiegsseite und lädt **nicht** `Home.js`, sondern nur `assets/js/index-page.js` mit einem eigenen Mini-Sprachwechsel über `data-i18n-en`.

### Geteilte Navigation und Footer

Jede Seite enthält nur leere `<header></header>`- und `<footer>`-Platzhalter. `Home.js` ersetzt sie sofort beim Laden durch `getNavHTML()`/`getFooterHTML()` und baut beide bei jedem Sprachwechsel **neu** auf. Event-Handler auf Nav-/Footer-Elementen müssen deshalb delegiert sein oder nach dem Neuaufbau erneut registriert werden (`initHamburgerMenu`).

### Content Security Policy

`script-src 'self'` plus SHA-256-Hashes, `style-src 'self'`. Daraus folgt:

- Keine Inline-Handler (`onclick` …). Klicks, `input` und `change` laufen über die Delegations-Blöcke in `Home.js` (Abschnitt „4b. KLICK-DELEGATION“) bzw. am Ende von `auftrag.js`; neue Interaktionen dort ergänzen.
- Keine `style="…"`-Attribute und keine `<style>`-Blöcke im HTML. Styles gehören in `style.css`; dynamische Werte per JS über `el.style.…`.
- Die einzigen Inline-Skripte sind die JSON-LD-Blöcke. Jede Änderung daran ändert den Hash – `npm run csp:update` (Teil von `npm run build`) schreibt die Hashes in `vercel.json` und übernimmt die fertige Policy nach `.htaccess`. Andere Direktiven daher nur in `vercel.json` ändern.
- Neue externe Ziele (APIs, Frames) brauchen einen Eintrag in `connect-src`/`frame-src` in beiden Dateien. Erlaubt sind derzeit nur Web3Forms und das Google-Maps-Frame.

### Mehrsprachigkeit

Deutsch steht direkt im HTML; Englisch kommt zur Laufzeit. Übersetzbare Elemente tragen `data-i18n`, `data-i18n-html`, `data-i18n-placeholder`, `data-i18n-aria-label`, `data-i18n-title` oder `data-i18n-alt` mit einem Schlüssel aus `I18N_DICTIONARY` in `assets/js/i18n.js` – keine Übersetzung über CSS-Selektoren oder Indizes. Text mit Icon davor: nur den Text in ein `<span data-i18n>` setzen.

`applyTranslations()` (läuft erst, wenn das Wörterbuch geladen ist) merkt sich beim ersten Aufruf die deutschen Originale aus dem HTML und stellt beim Zurückschalten genau diese wieder her. Für statische Seiteninhalte ist das HTML damit die einzige deutsche Quelle; `I18N_DICTIONARY.de` wird nur für per JS erzeugte Inhalte (Navigation, Footer, Meldungen) gebraucht, braucht aber weiterhin jeden Schlüssel (`de` und `en` haben dieselben Schlüssel). Galerie-Karten übersetzt `translateGalleryCards()` aus den Werkdaten.

Interne Werte (`data-value`, `data-kategorie`, gespeicherter Konfigurator-Zustand, URL-Parameter) bleiben immer deutsch; für die Anzeige übersetzt `VALUE_LABELS` in `auftrag.js`.

### Galerie-Daten

Ein Werk besteht aus vier zusammengehörigen Teilen, verknüpft über die Werk-ID (z. B. `DSC_6622a`):

- `.gallery-item`-Block in `Bildergalerie.html` (bzw. `Home.html` für die vier Highlights) mit `id` und `data-kategorie`; der Link zeigt auf `…/lightbox/ID.webp`, das `<img>` nutzt `…/thumbs/ID-{400,700,1000}w.webp`,
- Eintrag in `ARTWORKS_METADATA` in `assets/js/artworks-data.js` (Deutsch: Titel, Technik, Maße, Kategorie, Beschreibung, optional `status`: `verfuegbar`/`reserviert`/`verkauft`),
- Eintrag in `ARTWORKS_METADATA_EN` in derselben Datei (nur Titel, Technik, Beschreibung),
- Bilddateien unter `assets/images/img/` bzw. `assets/images/artworks/`.

`npm run check:gallery` (auch in der CI) prüft, dass alle vier Teile zusammenpassen. `artworks-data.js` wird nur auf Home, Bildergalerie und Auftrag geladen (vor `Home.min.js`); Code in `Home.js` muss deshalb mit `typeof ARTWORKS_METADATA === 'undefined'` rechnen.

### Seitenübergreifender Auftragsablauf

Lightbox „Anfragen“ → `Auftrag.html?ref=<deutscher Bildtitel>&kat=<Kategorie>` (Motiv wird vorausgewählt, Referenz in `state.referenz` gemerkt) → Schritt 4 verlinkt auf `Kontakt.html?motiv=…&format=…&technik=…&ref=…` → `prefillContactForm()` füllt Betreff und Nachricht → Versand per `fetch` an Web3Forms (Honeypot-Feld `botcheck`; Absenden vor 3 s nach dem Laden wird mit Hinweis abgewiesen; bei Fehlern führt der `mailto:`-Link Betreff und getippte Nachricht mit). URL-Parameter sind Nutzereingaben und dürfen nur als Text, nicht als HTML, ins DOM.

`localStorage`-Schlüssel: `manufaktur_theme`, `manufaktur_lang`, `manufaktur_favorites` (Array von Werk-IDs), `manufaktur_konfigurator_state`.

### Tests

`tests/helpers.js` startet `scripts/serve.js` auf einem freien Port und öffnet jede Seite in einem frischen Browser-Kontext. `open(path, { storage, serviceWorker })` liefert `{ page, context, errors }`; `errors` sammelt Konsolenfehler und damit auch CSP-Verstöße. Service Worker sind standardmäßig blockiert und nur im Offline-Test erlaubt.

## Richtlinien

1. **Build synchron halten:** nach Änderungen an `style.css`, `Home.js`, `partials/`, `assets/js/artworks-data.js`, Icons oder JSON-LD `npm run build` ausführen und das Ergebnis committen; `.min`-Dateien nie von Hand ändern.
2. **DSGVO:** keine externen Fonts, CDNs oder Tracker. Einzige Ausnahme ist die cookielose Vercel-Messung (`insights.js`), die in `Datenschutz.html` benannt ist. Schriften und Font Awesome liegen lokal unter `assets/`; Google Maps im Impressum lädt erst nach Klick (`loadGoogleMap`).
3. **Barrierefreiheit (WCAG):** Tastaturbedienbarkeit (`tabindex`, `Enter`/`Space`), ARIA-Zustände (`aria-pressed`, `aria-expanded`, `aria-label`) und semantische Tags beibehalten; sichtbarer Text und `aria-label` müssen zusammenpassen (siehe `TOGGLE_BUTTON_LABELS`). Klickbare Elemente sind `<button>`, Dialoge nutzen `trapFocus()`, Bewegung respektiert `prefersReducedMotion()` bzw. `@media (prefers-reduced-motion)`.
4. **Nicht versioniert:** `archive_sources/` und `assets/imgTxt/` (Rohdaten, ca. 560 MB) sind per `.gitignore` ausgeschlossen und gehören nicht ins Deployment.
5. **Sichtbarkeit:** `.hidden` setzt `display: none !important` und überstimmt damit `el.style.display`. Elemente mit `.hidden` per `classList` ein-/ausblenden, nicht per Inline-Style.
