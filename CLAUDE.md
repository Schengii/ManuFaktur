# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

Statische Portfolio- und Auftrags-Website für das Bonner Kunst-Atelier **ManuFAKTUR Schenk** (`www.manufaktur-malerei.de`). Reines Vanilla HTML/CSS/JS ohne Framework und ohne Bundler; Node wird nur für Minifizierung, CSP-Hashes, Thumbnails und Tests gebraucht. Das Repo-Root wird unverändert ausgeliefert (Vercel mit `outputDirectory: "."`, alternativ Apache über `.htaccess`).

Code-Kommentare, Commit-Inhalte und UI-Texte sind deutsch; Commits folgen Conventional Commits (`feat:`, `fix:`, `docs:` …).

## Befehle

| Aufgabe | Befehl |
| :--- | :--- |
| Produktions-Build (CSS + JS + CSP-Hashes) | `npm run build` |
| Nur CSS / nur JS minifizieren | `npm run build:css` / `npm run build:js` |
| CSP-Hashes in `vercel.json` neu berechnen | `npm run csp:update` |
| Lokaler Server mit Produktions-CSP (Port 3000) | `npm start` |
| Alle Browser-Tests | `npm test` |
| Einzelnen Test per Namensmuster | `node --test --test-name-pattern="Konfigurator" tests/funktionen.test.js` |
| Thumbnails 400/700/1000w aus `lightbox/` erzeugen | `npm run images:srcset` |

- `npm start` (`scripts/serve.js`) sendet die Header aus `vercel.json` mit, sodass CSP-Verstöße lokal sichtbar werden. `npx serve` oder `python -m http.server` tun das nicht.
- Die Tests laufen mit `node:test` + `playwright-core` gegen ein **installiertes Chrome** (kein Browser-Download). Anderer Browser: `PW_CHANNEL=msedge npm test`.
- Die Tests laden die Seiten so, wie sie ausgeliefert werden – also `*.min.*`. Nach Änderungen an `style.css`/`Home.js` erst `npm run build`, dann `npm test`.
- `scripts/apply-srcset.js` war eine einmalige Migration und ist nicht idempotent (ein zweiter Lauf erzeugt `-700w-400w.webp`-Pfade). Nicht erneut auf bereits umgestellte Seiten anwenden.

## Architektur

### Quellen vs. ausgelieferte Dateien

Alle Seiten binden `style.min.css?v=N` und `Home.min.js?v=N` ein. Bearbeitet werden ausschließlich `style.css` und `Home.js`; die `.min`-Dateien sind generiert, aber **eingecheckt**, weil es beim Deploy keinen Build-Schritt gibt. Die CI (`.github/workflows/ci.yml`) baut neu und schlägt fehl, wenn das Ergebnis vom Commit abweicht – Build-Output also immer mitcommitten.

Bei einem Release müssen drei Stellen zusammenpassen:

1. `?v=N` an `style.min.css` und `Home.min.js` in allen HTML-Seiten,
2. dieselben `?v=N`-URLs in `ASSETS_TO_CACHE` in `sw.js` (der Cache matcht inklusive Query-String, sonst fehlen CSS/JS offline),
3. `CACHE_NAME` in `sw.js` hochzählen, damit alte Caches verworfen werden.

### Skript-Aufbau

- `assets/js/theme-init.js` läuft im `<head>` und setzt `data-theme`/`lang` aus `localStorage`, bevor gerendert wird (kein Aufblitzen des falschen Themes).
- `Home.js` ist **ein** globales Skript für alle Seiten (keine Module). Seiten-spezifische Initialisierer prüfen selbst, ob ihre Elemente existieren, und werden am Dateiende gesammelt über `runOnDOMReady` gestartet.
- `assets/js/auftrag.js` (Konfigurator) wird nur in `Auftrag.html` nach `Home.min.js` geladen, ist nicht minifiziert und teilt sich den globalen Scope mit `Home.js` (`state`, `buildSummary`, `getLanguage` werden gegenseitig benutzt).
- `index.html` ist die Hero-Einstiegsseite und lädt **nicht** `Home.js`, sondern nur `assets/js/index-page.js` mit einem eigenen Mini-Sprachwechsel über `data-i18n-en`.

### Geteilte Navigation und Footer

Jede Seite enthält nur leere `<header></header>`- und `<footer>`-Platzhalter. `Home.js` ersetzt sie sofort beim Laden durch `getNavHTML()`/`getFooterHTML()` und baut beide bei jedem Sprachwechsel **neu** auf. Event-Handler auf Nav-/Footer-Elementen müssen deshalb delegiert sein oder nach dem Neuaufbau erneut registriert werden (`initHamburgerMenu`).

### Content Security Policy

`script-src 'self'` plus SHA-256-Hashes, `style-src 'self'`. Daraus folgt:

- Keine Inline-Handler (`onclick` …). Klicks, `input` und `change` laufen über die Delegations-Blöcke in `Home.js` (Abschnitt „4b. KLICK-DELEGATION“) bzw. am Ende von `auftrag.js`; neue Interaktionen dort ergänzen.
- Keine `style="…"`-Attribute und keine `<style>`-Blöcke im HTML. Styles gehören in `style.css`; dynamische Werte per JS über `el.style.…`.
- Die einzigen Inline-Skripte sind die JSON-LD-Blöcke. Jede Änderung daran ändert den Hash – `npm run csp:update` (Teil von `npm run build`) schreibt die Hashes in `vercel.json`.
- `.htaccess` enthält dieselbe CSP als Kopie und wird vom Skript **nicht** angefasst: nach Hash-Änderungen dort von Hand nachziehen.
- Neue externe Ziele (APIs, Frames) brauchen einen Eintrag in `connect-src`/`frame-src` in beiden Dateien. Erlaubt sind derzeit nur Web3Forms und das Google-Maps-Frame.

### Mehrsprachigkeit

Deutsch steht direkt im HTML; Englisch kommt zur Laufzeit. Elemente tragen `data-i18n`, `data-i18n-html`, `data-i18n-placeholder`, `data-i18n-aria-label`, `data-i18n-title` oder `data-i18n-alt` mit einem Schlüssel aus `I18N_DICTIONARY` (`de` und `en`) in `Home.js`; `applyTranslations()` setzt die Texte. Deutsche Texte existieren damit doppelt (HTML und `I18N_DICTIONARY.de`) und müssen beide gepflegt werden, sonst ändert sich der Text beim Zurückschalten auf Deutsch.

Interne Werte (`data-value`, `data-kategorie`, gespeicherter Konfigurator-Zustand, URL-Parameter) bleiben immer deutsch; für die Anzeige übersetzt `VALUE_LABELS` in `auftrag.js`.

### Galerie-Daten

Ein Werk besteht aus vier zusammengehörigen Teilen, verknüpft über die Werk-ID (z. B. `DSC_6622a`):

- `.gallery-item`-Block in `Bildergalerie.html` mit `id` und `data-kategorie`; der Link zeigt auf `…/lightbox/ID.webp`, das `<img>` nutzt `…/thumbs/ID-{400,700,1000}w.webp`,
- Eintrag in `ARTWORKS_METADATA` (Deutsch: Titel, Technik, Maße, Kategorie, Beschreibung),
- Eintrag in `ARTWORKS_METADATA_EN` (nur Titel, Technik, Beschreibung),
- Bilddateien unter `assets/images/img/` bzw. `assets/images/artworks/`.

`artworks_data.json` wird zur Laufzeit nicht geladen; maßgeblich ist `ARTWORKS_METADATA` in `Home.js`.

### Seitenübergreifender Auftragsablauf

Lightbox „Anfragen“ → `Auftrag.html?ref=<Bildtitel>&kat=<Kategorie>` (Motiv wird vorausgewählt) → Schritt 4 verlinkt auf `Kontakt.html?motiv=…&format=…&technik=…` → `prefillContactForm()` füllt Betreff und Nachricht → Versand per `fetch` an Web3Forms (Honeypot-Feld `botcheck`). URL-Parameter sind Nutzereingaben und dürfen nur als Text, nicht als HTML, ins DOM.

`localStorage`-Schlüssel: `manufaktur_theme`, `manufaktur_lang`, `manufaktur_favorites` (Array von Werk-IDs), `manufaktur_konfigurator_state`.

### Tests

`tests/helpers.js` startet `scripts/serve.js` auf einem freien Port und öffnet jede Seite in einem frischen Browser-Kontext. `open(path, { storage, serviceWorker })` liefert `{ page, context, errors }`; `errors` sammelt Konsolenfehler und damit auch CSP-Verstöße. Service Worker sind standardmäßig blockiert und nur im Offline-Test erlaubt.

## Richtlinien

1. **Build synchron halten:** nach Änderungen an `style.css`, `Home.js` oder JSON-LD `npm run build` ausführen und das Ergebnis committen; `.min`-Dateien nie von Hand ändern.
2. **DSGVO:** keine externen Fonts, CDNs oder Tracker. Schriften und Font Awesome liegen lokal unter `assets/`; Google Maps im Impressum lädt erst nach Klick (`loadGoogleMap`).
3. **Barrierefreiheit (WCAG):** Tastaturbedienbarkeit (`tabindex`, `Enter`/`Space`), ARIA-Zustände (`aria-pressed`, `aria-expanded`, `aria-label`) und semantische Tags beibehalten; sichtbarer Text und `aria-label` müssen zusammenpassen (siehe `TOGGLE_BUTTON_LABELS`).
4. **Nicht versioniert:** `archive_sources/` und `assets/imgTxt/` (Rohdaten, ca. 560 MB) sind per `.gitignore` ausgeschlossen und gehören nicht ins Deployment.
