# CLAUDE.md – Projekt-Leitfaden & Kontext für ManuFAKTUR Schenk

Willkommen im Repository **ManuFAKTUR Schenk** (`Schengii/ManuFaktur`).
Dieses Dokument definiert Architektur, Entwicklungsrichtlinien, Build-Befehle und Verhaltensregeln für Claude Code und KI-Assistenten.

---

## 🎨 Projekt-Überblick
Elegante, responsive und barrierefreie Portfolio- und Auftrags-Webanwendung für das Bonner Kunst-Atelier **ManuFAKTUR Schenk** (Manuela Schenk).

- **Stack:** Reines Vanilla HTML5, modernes CSS3 (Design-Tokens, CSS Grid/Flexbox, 3D-Card-Transforms, Dark/Light Mode) und Vanilla JavaScript (ES6+).
- **Hosting / Deployment:** Statisch (Vercel & Apache `.htaccess` optimiert).
- **Formulare:** Web3Forms API (`https://api.web3forms.com/submit`) mit Honeypot-Spamschutz (`name="botcheck"`).
- **Datenschutz & DSGVO:** 100 % lokale Schriften (`Lato`, `Playfair Display`, `Dancing Script`) & lokale Font Awesome Icons. Keine externen Google Fonts oder Tracker. 2-Klick Google Maps Lösung im Impressum.

---

## 💻 Wichtige Entwicklungs- & Build-Befehle

| Aufgabe | Befehl |
| :--- | :--- |
| **Produktions-Build (CSS & JS)** | `npm run build` |
| **Nur CSS minifizieren** | `npm run build:css` (`clean-css-cli`) |
| **Nur JS minifizieren** | `npm run build:js` (`terser`) |
| **Lokaler Dev-Server** | `npx serve -p 3000` |

---

## 📁 Kern-Dateistruktur

```text
ManuFaktur/
├── index.html                  # Einstiegsseite / Redirect
├── Home.html                   # Startseite (Hero, Highlights, Neuigkeiten, Kundenstimmen)
├── Bildergalerie.html          # Galerie (57 Werke, KI-Wandbühne, Multiperspektiven, Lupe)
├── Auftrag.html                # Interaktiver 4-Schritte-Auftragskonfigurator
├── Leistungen.html             # Leistungsangebot & FAQ-Akkordeon
├── UeberMich.html              # Porträt, Werdegang, Dozierende, 3D-Visitenkarte & Flyer
├── Kontakt.html                # Kontaktformular (Web3Forms) & Direktkontakt
├── Impressum.html              # Rechtliche Anbieterkennzeichnung & 2-Klick Maps
├── Datenschutz.html            # DSGVO-Datenschutzerklärung
├── 404.html                    # Individuelle 404-Fehlerseite
│
├── style.css                   # Master-Designsystem & Theme Tokens (CSS-Variablen)
├── style.min.css               # Minifizierte CSS-Datei für Produktion
├── Home.js                     # Zentrale Logik, i18n-Wörterbuch, Galerie-Filter, Modals
├── Home.min.js                 # Minifizierte JS-Datei für Produktion
├── sw.js                       # PWA Service Worker (Cache-First für Assets, Network-First für HTML)
├── manifest.json               # PWA Web App Manifest
├── sitemap.xml                 # XML-Sitemap für Suchmaschinen
├── robots.txt                  # Robots-Crawler-Steuerung
├── vercel.json                 # Vercel Deployment- und CSP-Header
└── .htaccess                   # Apache Webserver-Konfiguration (HTTPS, CSP, HSTS, Caching)
```

---

## 📌 Richtlinien für Änderungen

1. **Produktions-Build immer synchron halten:**
   - Änderungen an `style.css` und `Home.js` müssen immer mit `npm run build` nach `style.min.css` und `Home.min.js` kompiliert werden.
   - Cache-Busting-Parameter in HTML-Dateien (`?v=...`) und die Service-Worker-Cache-Version in `sw.js` bei Release-Änderungen anpassen.
2. **Mehrsprachigkeit (i18n):**
   - Texte werden über `I18N_DICTIONARY` in `Home.js` für Deutsch (`de`) und Englisch (`en`) gepflegt.
3. **Barrierefreiheit (WCAG):**
   - Tastaturbedienbarkeit (`tabindex`, `Enter`/`Space`), ARIA-Attribute (`aria-expanded`, `aria-label`) und semantische Tags beibehalten.
