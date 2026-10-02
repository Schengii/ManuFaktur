# GEMINI.md – Entwicklungs- & Verhaltensrichtlinien für Gemini & Antigravity

Willkommen im Repository **ManuFAKTUR Schenk** (`Schengii/ManuFaktur`).
Dieses Dokument definiert Architektur, Entwicklungsrichtlinien, Build-Befehle und Sicherheitsregeln für Google Gemini und die Antigravity-Plattform.

---

## 🎨 Projekt-Überblick

Elegante, responsive und barrierefreie Webanwendung für das Bonner Kunst-Atelier **ManuFAKTUR Schenk** (Manuela Schenk).

- **Technologie-Stack:** Reines Vanilla HTML5, modernes CSS3 (CSS-Variablen/Tokens, Flexbox, CSS Grid, 3D-Transforms) und Vanilla JavaScript (ES6+).
- **Deployment:** Statisch (Vercel & Apache `.htaccess` mit HTTP/2 Server Push & striktem CSP).
- **Formulare:** Web3Forms API mit integriertem Honeypot-Spamschutz (`name="botcheck"`).
- **Datenschutz (DSGVO):** 100 % lokal gehostete Schriften (`Lato`, `Playfair Display`, `Dancing Script`) & Font Awesome Icons. Keine externen CDNs, Google Fonts oder Tracker. 2-Klick-Lösung für Google Maps.

---

## 💻 Wichtige Befehle & Workflows

| Befehl | Zweck |
| :--- | :--- |
| `npm run build` | **Vollständiger Build:** Kompiliert CSS + JS und aktualisiert die CSP-Hashes |
| `npm run build:css` | Minifiziert `style.css` nach `style.min.css` (clean-css) |
| `npm run build:js` | Minifiziert `Home.js` nach `Home.min.js` (terser) |
| `npm run csp:update` | Berechnet SHA-256-Hashes für Inline-Skripte und aktualisiert `.htaccess` & `vercel.json` |
| `npm run images:srcset` | Generiert responsive Thumbnails (`-300w`, `-600w`, `-900w`) mit sharp |
| `npm test` | Führt Playwright-End-to-End- & Integritätstests aus (`tests/funktionen.test.js`) |
| `npm start` | Startet den lokalen HTTP-Server auf Port 3000 (`scripts/serve.js`) |

---

## 🚨 Goldene Regeln für Code-Änderungen

1. **Quellcode vs. Minifizierte Dateien:**
   - **Niemals** `style.min.css` oder `Home.min.js` direkt editieren!
   - Änderungen immer in `style.css` bzw. `Home.js` vornehmen und anschließend **immer** `npm run build` ausführen.
2. **CSP-Hashes synchron halten:**
   - Bei Änderungen an Inline-Skripten in HTML-Dateien muss `npm run csp:update` (oder `npm run build`) ausgeführt werden, damit `.htaccess` und `vercel.json` die passenden SHA-256-Hashes enthalten.
3. **Mehrsprachigkeit (i18n):**
   - Neue Texte müssen zweisprachig im `I18N_DICTIONARY` in `Home.js` hinterlegt werden (`de` und `en`).
   - HTML-Elemente erhalten das Attribut `data-i18n="schluessel"`.
4. **Barrierefreiheit (WCAG 2.1 AA):**
   - Tastaturbedienbarkeit sicherstellen (`Tab`, `Enter`, `Escape` für Modals).
   - ARIA-Attribute (`aria-expanded`, `aria-label`, `aria-pressed`) konsistent pflegen.
   - Farbkontraste im Dark- und Light-Mode beachten.
5. **Datenschutz:**
   - Keine externen Ressourcen (Fonts, Scripts, Stylesheets, Analytics) einbinden. Alle Abhängigkeiten verbleiben im Ordner `assets/`.
