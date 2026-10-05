# Changelog

Alle nennenswerten Änderungen an **ManuFAKTUR Schenk** werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/) und dieses Projekt hält sich an [Semantic Versioning](https://semver.org/lang/de/).

---

## [Unreleased]

### Behoben
- Dunkelmodus- und Sprach-Umschalter im Footer funktionierten wegen der CSP nicht (Inline-`onclick`) – jetzt per Event-Delegation.
- Offline-Modus: Service Worker cachte veraltete Asset-Versionen; `?v=N` und `CACHE_NAME` werden jetzt per `npm run release` gemeinsam hochgezählt, `npm run version:check` prüft das in der CI.
- `?ref=`-Parameter im Konfigurator wurde als HTML eingefügt (Einschleusen von Markup möglich) – jetzt nur als Text.
- Mehrere Bedienelemente blieben unsichtbar, weil `.hidden` (`!important`) Inline-Styles überstimmte (Keine-Treffer-Meldung, Wand-Badge, Favoriten im Konfigurator).
- Nach dem Wechsel Englisch → Deutsch standen teils andere deutsche Texte als im HTML; jetzt werden die HTML-Originale wiederhergestellt.
- Erfundene Kundenstimmen in der Lightbox entfernt.
- `.htaccess` enthielt eine veraltete CSP-Kopie; `npm run csp:update` schreibt die Policy jetzt in beide Dateien.

### Hinzugefügt
- Qualitätssicherung: ESLint (`npm run lint`, in der CI), axe-core-Test über alle Seiten in Hell und Dunkel, Lighthouse-CI mit Schwellen (`lighthouserc.json`).
- Kontaktformular: Absenden unter 3 Sekunden nach dem Laden wird abgewiesen, ausgefülltes Honeypot sendet nichts, bei Fehlern enthält der `mailto:`-Link Betreff und Nachricht.
- Skripte: `images:lightbox`, `sw:assets`, `lint`.
- Barrierefreiheit: Fokusfalle in Lightbox und Flyer-Modal, echte Buttons für Schließen/Vor/Zurück, Pause-Schalter und Tastaturbedienung im Kundenstimmen-Karussell, `prefers-reduced-motion`, `aria-valuenow`/`aria-valuetext` an der Konfigurator-Fortschrittsanzeige, Toast als `role="status"`.
- Motiv-Referenz aus der Galerie wird im Konfigurator gemerkt und in die Kontaktanfrage übernommen.
- Optionales Feld `status` je Werk (verfügbar/reserviert/verkauft) mit Anzeige in der Lightbox.
- Strukturierte Daten: `FAQPage` (Leistungen) und `VisualArtwork` je Werk (generiert).
- Link-Vorschaubilder 1200 × 630 als JPEG (`assets/images/og/`).
- Skripte: `release`, `version:check`, `icons`, `partials`, `jsonld`, `check:gallery`, `sitemap`, `images:og`.

### Geändert
- Das Übersetzungswörterbuch liegt in `assets/js/i18n.js` und wird nur für Englisch nachgeladen: `Home.min.js` sinkt von 99 auf 52 KB (gzip 32 → 15 KB), Lighthouse-Performance steigt auf Home 92, Auftrag/Leistungen/Kontakt 97–98.
- Lightbox-Bilder neu kodiert (WebP 80): 31 → 21 MB.
- Die Precache-Liste in `sw.js` wird beim Build erzeugt (neu darin: `i18n.min.js`, `index-page.js`, alle Schriftschnitte).
- CSS/JS werden bei Vercel als `immutable` ausgeliefert, `sw.js` mit `no-cache`; der lokale Server komprimiert wie Vercel (gzip).
- Navigationspunkt „Start“ heißt „Home“ (Lighthouse bewertete „Start“ als nichtssagenden Linktext).
- Font Awesome: statt `all.min.css` und kompletter Webfonts (≈ 390 KB) nur noch ein automatisch erzeugtes Subset der benutzten Icons (≈ 28 KB).
- Galerie-Daten (`ARTWORKS_METADATA`) in `assets/js/artworks-data.js` ausgelagert und nur auf Seiten mit Galerie geladen; das veraltete `artworks_data.json` entfällt.
- Lightbox-Markup existiert nur noch einmal (`partials/lightbox.html`).
- Lightbox lädt auf schmalen Bildschirmen die 1000-px-Fassung, Vorschaukacheln die 400-px-Fassung; versteckte Raumbilder laden erst bei Bedarf.
- Reveal-Animation per IntersectionObserver statt Scroll-Listener; doppelte Playfair-Display-Schriftdatei entfernt.
- Bilder werden 30 Tage statt „immutable“ ein Jahr gecacht; Icon-Fonts tragen einen Inhalts-Hash in der URL.
- Übersetzung vollständig über `data-i18n*`-Attribute; 43 ungenutzte Wörterbuch-Einträge und toter Filtercode entfernt.

---

## [1.3.0] - 2026-09-27


### Hinzugefügt
- **Automatisierte CSP-Hash-Generierung:** Skript `scripts/update-csp-hashes.js` zur dynamischen Berechnung und Aktualisierung von SHA-256-Inline-Skript-Hashes in `vercel.json` (`.htaccess` wurde damals noch nicht automatisch aktualisiert).
- **Responsive Bildauslieferung (`srcset`):** Skript `scripts/gen-srcset.js` und `scripts/apply-srcset.js` zur Erzeugung von responsiven Thumbnails (`-400w`, `-700w`, `-1000w`) für optimale Ladezeiten auf Mobilgeräten.
- Flyer-Assets und semantische Überschriftenstruktur (`h1`-`h4`) für verbesserte Zugänglichkeit (A11y) und SEO.
- Automatisierte Playwright-basierte Funktions- und Regressions-Tests in `tests/funktionen.test.js`.

### Geändert
- Build-Pipeline in `package.json` erweitert: `npm run build` führt nun `build:css`, `build:js` und `csp:update` kombiniert aus.
- Cache-Busting-Versionen auf allen statischen HTML-Seiten aktualisiert.

---

## [1.2.0] - 2026-09-26

### Hinzugefügt
- **Web3Forms-Integration:** Umstellung des Kontakt- und Anfrageformulars von Formspree auf Web3Forms inklusive integriertem Honeypot-Spamschutz (`botcheck`).
- **Mehrsprachige Kundenstimmen:** Internationalisierung der Testimonial-Autorennamen und -Inhalte über das `I18N_DICTIONARY`.
- **WebP-Konvertierung:** Umwandlung von Bildressourcen in das moderne WebP-Format zur deutlichen Reduzierung der Datenmenge.

### Behoben
- Idempotente Listener-Registrierung in `initContactForm()` zur Vermeidung doppelter Event-Trigger.
- Schreibweise von Atelierpartnern in `UeberMich.html`.

---

## [1.1.0] - 2026-09-19

### Hinzugefügt
- **CLAUDE.md:** Umfassender Entwicklungsleitfaden und Architektur-Dokumentation für Claude Code und KI-Assistenten.
- **Content Security Policy (CSP):** Strikte Sicherheitsheader in `.htaccess` und `vercel.json` implementiert (`default-src 'self'`, script-hashes, frame-ancestors 'none').
- **History-State & Scroll-Restoration:** Zurück-Button des Browsers schließt geöffnete Lightbox- und Flyer-Modals ohne Neuladen der Seite.
- **Service Worker Cache v18:** PWA Offline-Resilienz und Asset-Caching in `sw.js` optimiert.

### Geändert
- Bereinigung von über 43 MB ungenutzter Bildressourcen.
- Galerie-Filter: Tastatur-Navigation, `aria-pressed`-Attribute und Fokus-Indikatoren optimiert.
- Lightbox: Touch-Swipe-Gesten auf Smartphones verbessert.

---

## [1.0.0] - 2026-09-10

### Hinzugefügt
- **Initialer Release** der Webanwendung für das Atelier *ManuFAKTUR Schenk*.
- **Startseite (`Home.html`):** Hero-Sektion, Atelier-Highlights, dynamische Neuigkeiten und Testimonial-Karussell.
- **Bildergalerie (`Bildergalerie.html`):** Präsentation von 57 Kunstwerken mit Filterung (Tiere, Landschaften, Stillleben, etc.), KI-Raumbühne, Detail-Lupe und Vollbild-Lightbox.
- **Auftragskonfigurator (`Auftrag.html`):** Interaktiver 4-Schritte-Assistent zur unverbindlichen Preiskalkulation und Angebotsanfrage.
- **Atelier & Künstlerin (`UeberMich.html`):** Biografie, Dozierendenliste, 3D-Kipp-Visitenkarte und interaktiver Atelier-Flyer.
- **Leistungen & FAQ (`Leistungen.html`):** Übersicht über Techniken, Formate, Auftragsablauf und FAQ-Akkordeon.
- **100 % DSGVO-Konformität:** Vollständig lokale Schriftarten (Lato, Playfair Display, Dancing Script), lokale Font Awesome Icons und 2-Klick Google Maps-Lösung.
- **Dark/Light Mode:** System-Präferenz-Erkennung mit manueller Umschaltmöglichkeit und Speicherung in `localStorage`.
- **Zweisprachigkeit (DE/EN):** Vollständige Lokalisierung aller UI-Elemente und Texte per clientseitigem i18n-System.
