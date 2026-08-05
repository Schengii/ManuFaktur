# 🎨 ManuFAKTUR Schenk – Kunst & Auftragsmalerei Webanwendung

Eine moderne, elegante und barrierefreie Webanwendung für das Kunst-Atelier **ManuFAKTUR Schenk** (Manuela Schenk aus Bonn). Die Webseite präsentiert handgemalte Kunstwerke (Tierportraits, Landschaften, Stillleben) und bietet Besuchern einen interaktiven 4-Schritte-Auftragskonfigurator, eine hochoptimierte Bildergalerie mit KI-Raumhintergründen, multiperspektivischer "Weitere Ansichten"-Galerie, Live-Suche, Vorab-Preiskalkulator, Vorher/Nachher-Vergleichsslider sowie ein Kundenstimmen-Karussell.

---

## 📁 Ordnerstruktur

```text
ManuFaktur/
├── index.html                  # Einstiegsseite (Weiterleitung zu Home.html)
├── Home.html                   # Startseite (Hero, Highlights, News, Testimonials-Carousel)
├── Bildergalerie.html          # Filterbare Galerie (53 Kunstwerke, KI-Wandvorlagen, "Weitere Ansichten", WebP, Lightbox)
├── Leistungen.html             # Leistungsübersicht, Vorab-Preiskalkulator, Vorher/Nachher-Slider, FAQ
├── Auftrag.html                # Interaktiver 4-Schritte-Auftragskonfigurator mit Preisschätzung
├── UeberMich.html              # Porträt & Steckbrief der Künstlerin, Zeitstrahl, 3D-Visitenkarte
├── Kontakt.html                # Kontaktformular mit Formspree-Integration & Direktkontakt
├── Impressum.html              # Rechtliches Impressum (Anbieterkennzeichnung)
├── Datenschutz.html            # DSGVO-Datenschutzerklärung
│
├── style.css                   # Zentrales CSS-Designsystem & Stylesheet (Tokens, 3D-Perspektiven, Layout, Animationen)
├── Home.js                     # Zentrale JS-Logik (Shared Components, Galerie, KI-Raumbühne, Konfigurator, Features)
│
├── robots.txt                  # SEO-Indexierungsanweisungen für Suchmaschinen-Crawler
├── sitemap.xml                 # XML-Sitemap mit allen Seitenpfaden
│
├── remove-bg.ps1               # PowerShell-Skript zur automatischen Logo-Freistellung
├── trim-logo.ps1               # PowerShell-Skript zum Ränder-Beschneiden von Logos
│
└── assets/                     # Medien & Statische Ressourcen
    ├── documents/              # Dokumente & Downloads (Flyer PDF, Visitenkarte VCF)
    │   ├── flyer.pdf
    │   └── visitenkarte.vcf
    │
    ├── fonts/                  # Lokale Schriftarten für 100% DSGVO-Konformität
    │   ├── dancingscript-700-normal.woff2
    │   ├── playfairdisplay-400-normal.woff2
    │   ├── playfairdisplay-700-normal.woff2
    │   ├── lato-300-normal.woff2
    │   ├── lato-400-normal.woff2
    │   └── lato-700-normal.woff2
    │
    ├── vendor/                 # Drittanbieter-Bibliotheken (lokal)
    │   └── font-awesome/       # Font Awesome Icons (CSS & Webfonts)
    │
    └── images/                 # Bildressourcen
        ├── logos/              # Atelier-Logos & Favicons (.png, .svg)
        ├── flyer/              # Flyer-Vorschauseiten (.png)
        ├── manuela-balou.png   # Künstlerin & Hund Balou
        ├── rooms/              # KI-generierte Raumkulissen & Ansichten
        │   ├── livingroom.png  # KI-Wohnzimmer Wandvorlage
        │   ├── bedroom.png     # KI-Schlafzimmer Wandvorlage
        │   ├── darkloft.png    # KI-Dark Loft Betonwand
        │   ├── beigelounge.png # KI-Beige Lounge
        │   ├── canvas_back.png # Keilrahmen-Rückseite mit Aufhängung
        │   └── artist_studio.png # Atelier-Atmosphäre von Manuela Schenk
        │
        └── img/                # Hochauflösende Gemälde & WebP-Formate
            ├── DSC_6622a.jpg ... DSC_6790a.jpg (Originale Kamerafotos)
            ├── thumbs/          # WebP-Grid-Thumbnails (~40-80 KB, max. 600px)
            └── lightbox/        # WebP-Lightbox-Großansichten (~200-350 KB, max. 1600px)
```

---

## 📄 Detaillierter Inhalt der Dateien & Features

### 1. `Home.html` / `index.html`
- **Funktion:** Startseite der Webanwendung.
- **Inhalt:**
  - Willkommensbereich mit Atelier-Logo und Einleitungstext.
  - Aktuelle Neuigkeiten und Ankündigungen.
  - Highlights-Raster mit ausgewählten Gemälden.
  - **Kundenstimmen-Karussell:** Interaktiver Testimonial-Slider mit Sternebewertungen und Zitaten zufriedener Auftraggeber.
  - Schema.org JSON-LD Strukturierte Daten (`ArtGallery`).

### 2. `Bildergalerie.html` & Lightbox-System
- **Funktion:** Interaktive High-End Kunstgalerie für alle 53 Gemälde mit KI-Wandvorlagen, Drag & Drop Positionierung, Skalierung & Multiperspektiven.
- **Inhalt & Features:**
  - **Perfekt ausgerichtete Bildausrichtung (Upright Auto-Orientation):** Sämtliche 53 WebP-Thumbnails und Lightbox-Großansichten wurden anhand ihrer Aufnahmeparameter und Bildachsen automatisch korrigiert und aufgerichtet, sodass jedes Kunstwerk direkt richtig herum nach oben weist.
  - **Kompakte Galerie-Filterleiste:** Aufgeräumtes Suchfeld sowie nebeneinander platzierte Kategorie-Filter (*Alle, Tiere, Landschaften, Pflanzen, Sonstiges, Gemerkt/Favoriten*) und direkt rechts folgendem **Sortieren-Dropdown** (*A-Z, Z-A*).
  - **Detaillierte Werk-IDs & Favoriten-Herz-Buttons (`.fav-toggle-btn`):** Jedes der 53 Kunstwerke besitzt eine explizite HTML `id="DSC_..."` sowie dynamisch initialisierte Herz-Buttons zur Favoriten-Speicherung.
  - **LCP-Ladeoptimierung:** Die ersten 4 Kunstwerke oberhalb des Fold-Bereichs werden mit `loading="eager"` und `fetchpriority="high"` geladen für herausragende Google PageSpeed & Lighthouse LCP-Werte.
  - **Barrierefreie Tastatur- & Input-Schutzsteuerung:** Pfeiltasten-Navigation überspringt aktive Formularfelder, damit Benutzereingaben ungestört bleiben.
  - **Benutzerfreundliche Leerzustände (Empty-State):** Angepasste Hilfetexte bei 0 Treffern oder noch leeren Favoriten.
  - **Perfektionierte HD-Lupenfunktion (`🔍 Lupe Zoom`):** Mathematisch präzise Maus- & Touch-Lupenlinse mit relativer Container-Offset-Berechnung für flüssigen Zoom ohne Ruckeln.
  - **Reine Erstansicht im Lightbox-Modal:** Beim Anklicken eines Galeriebildes öffnet sich die Lightbox in der klaren **Pur-/Frontansicht** mit Bild, Titel, Beschreibung und Produktspezifikationen.
  - **Aktivierbare KI-Wandvorlagen:** Erst nach Klick auf den Button `In deinem Raum ansehen` werden die KI-Wandfilter-Leiste (*Wohnzimmer, Schlafzimmer, Loft, Beige Lounge*) und die Wandbühne eingeblendet.
  - **Interaktive Drag & Drop Positionierung:** Im KI-Raummodus kann der Nutzer das Gemälde frei auf der Raumwand nach oben, unten, links oder rechts verschieben (`🎯 Zentrieren` setzt die Position zurück).
  - **Interaktive Wand-Skalierung (`25% - 90%` Slider):** Stufenloses Skalieren der Bildgröße für das perfekte Maßverhältnis zum Raumhintergrund.
  - **„Weitere Ansichten:“ (Multiperspektivische Galerie):** 5 interaktive Blickwinkel (*Frontansicht, Wandansicht, Keilrahmen-Rückseite, 3D-Seitenansicht, Atelier*).
  - **Clean Galerie-Karten:** Übersichtliche Galerie-Karten mit ungestörtem Herz-Favoriten-Button oben rechts (`.fav-toggle-btn`).
  - Schema.org JSON-LD Strukturierte Daten (`ImageGallery`).

### 3. `Auftrag.html`
- **Funktion:** Interaktiver 4-Schritte-Auftragskonfigurator.
- **Schritte:**
  1. **Motiv:** Auswahl zwischen Tierportrait, Landschaft, Stillleben oder Wunschmotiv.
  2. **Format:** Auswahl der Leinwandgröße (20×30 cm bis 60×80 cm oder Wunschmaß) mit visueller Größenanzeige.
  3. **Technik:** Auswahl der Maltechnik (Acryl, Öl, Bleistift, Aquarell).
  4. **Zusammenfassung:** Dynamische Preisschätzung, Notizfeld & direkte Formularübermittlung.
- **Features:** State-Wiederherstellung bei versehentlichem Schließen (localStorage) & automatisches Vorausfüllen bei Weiterleitung aus der Galerie via URL-Parametern (`?ref=...&kat=...`).

### 4. `Leistungen.html`
- **Funktion:** Übersicht über das Leistungsangebot der Künstlerin.
- **Inhalt:**
  - Dienstleistungskarten für Hundeportraits, Haustiere, Lieblingsorte & Formate.
  - **Vorab-Preiskalkulator:** Interaktives Widget zur Sofort-Berechnung eines geschätzten Richtpreises basierend auf Format, Technik und Motivanzahl.
  - **Vorher/Nachher-Vergleichsslider:** Interaktiver Schieberegler zum direkten Vergleich zwischen Vorlagenfoto und fertigem Acrylgemälde.
  - FAQ-Akkordeon für häufige Fragen zu Fotovorlagen, Lieferzeiten und Versand.
  - Schema.org JSON-LD Strukturierte Daten (`Service`).

### 5. `UeberMich.html`
- **Funktion:** persönliche Vorstellung von Manuela Schenk.
- **Inhalt:**
  - Steckbrief (Wohnort Bonn, Frauchen von Hund Balou, Techniken, Motivation).
  - Zeitstrahl („Mein Weg zur Kunst“ von 2010 bis heute).
  - Vorher/Nachher-Präzisionsslider.
  - Interaktive 3D-Flip-Visitenkarte mit VCF-Kontaktkarten-Download.
  - Schema.org JSON-LD Strukturierte Daten (`Person`).

### 6. `Kontakt.html`
- **Funktion:** Kontaktseite mit Anfragen-Formular & DSGVO-Standortkarte.
- **Inhalt:** Formular mit Formspree-Integration, Kontaktdaten, Social-Media-Links (Instagram, WhatsApp, LinkedIn), 2-Klick DSGVO Google Maps Standorts-Karte für Bonn (`#map-container`) und Vorab-Hinweis-Banner bei Weiterleitungen aus dem Konfigurator.

### 7. `Impressum.html` & `Datenschutz.html`
- **Funktion:** Rechtssichere Pflichtangaben nach deutschem Recht und DSGVO.

### 8. `style.css`
- **Funktion:** Zentrales Designsystem.
- **Inhalt:** CSS-Variablen (`:root` Farbtokens: warmes Gold `#7a5a1f`, Marineblau `#1a2d52`, Linnen `#faf8f5`), CSS Grid/Flexbox Layouts, 3D-Perspektivtransformationen (`rotateY`), Micro-Animations, Glassmorphism-Effekte, WCAG-Barrierefreiheit & responsive Breakpoints (Desktop, Tablet, Smartphone).

### 9. `Home.js`
- **Funktion:** Zentrale JavaScript-Architektur.
- **Inhalt:**
  - Automatische Injektion von shared `<header>` Navigation und `<footer>`.
  - Hamburger-Mobilmenü-Steuerung.
  - Galerie-Filterung, Format-Chips, Farb-Chips, Schnell-Tag-Chips, Live-Suche & Sortierung.
  - Dynamisches Favoriten-Management (`initFavButtonsUI`, `toggleFavorite`, Badge-Counter & LocalStorage).
  - DSGVO 2-Klick Google Maps Ladefunktion (`loadGoogleMap`).
  - Lightbox-Slideshow, Tastatursteuerung & Touch-Swipe-Gesten.
  - Multiperspektivische KI-Wandbühnen-Steuerung (`setLightboxScene` & `setLightboxViewAngle`).
  - Preiskalkulator-Berechnungsmathematik.
  - Vorher/Nachher-Slider Event-Handling.
  - Testimonial-Carousel Zeit- & Klicksteuerung.
  - LocalStorage State-Persistence & URL-Parameter-Parsing (`runOnDOMReady`).

---

## 🛠️ Technologien & Standards

- **Core:** HTML5, Vanilla CSS3, JavaScript (ES6+).
- **DSGVO-Konformität:** 100 % lokale Einbindung aller Fonts (`Dancing Script`, `Playfair Display`, `Lato`) und Font Awesome Webfonts (keine externen Aufrufe an Google Fonts oder CDN-Server).
- **Barrierefreiheit (WCAG 2.1 AA / AAA):**
  - **Rot-Grün-Schwäche (Colorblindness):** Alle aktiven Zustände (Filter-Buttons, Navigation, Favoriten) nutzen neben Farbaccenten zusätzliche Form- und Textindikatoren (Symbole, fette Schrift, Border, Unterstreichung).
  - **Lese-Rechtschreib-Schwäche (Dyslexia-Friendliness):** Optimierter Zeilenabstand (`1.65`), Wortabstand (`0.04em`) und Zeichenabstand (`0.02em`) mit klarer serifenloser Typografie (`Lato`).
  - **Tastatur- & Screenreader-Support:** Sichtbare Fokus-Ringe (`:focus-visible`), ARIA-Attribute (`role="dialog"`, `aria-label`, `aria-expanded`), automatische Schutzsteuerung bei Texteingaben.
- **Responsive Design & Touch-Targets:** Flüssige Typografie (`clamp()`), kein horizontales Scrollen auf Smartphones, Touch-Targets mit mindestens 44px Höhe.
- **Micro-Animations:** Button-Shimmer-Effekt (`.btn::before`), Card Hover Elevation (`translateY(-6px)`), sanfte Scroll-Reveals und Puls-Effekte.
- **Performance & SEO:** WebP-Bildformate (99% Ersparnis), LCP-Optimierung, Schema.org JSON-LD strukturierte Daten, Open Graph Meta-Tags, PWA Web App Manifest & Service Worker.

---

## 🚀 Veröffentlichungs-Checkliste (Release Readiness)

1. **Formspree E-Mail-ID (`Kontakt.html`):** Ersetzen der Formspree-ID `DEINE_FORMSPREE_ID` durch deine echte ID vor der Live-Schaltung.
2. **HTTPS-Verschlüsselung:** Aktivierung eines SSL-Zertifikats beim Hoster für PWA Service Worker Funktionalität (`sw.js`).
3. **XML-Sitemap:** Aktualisierung der Datumsangaben in `sitemap.xml`.

---

## 💻 Lokale Entwicklung

Zum Ausführen der Webseite auf einem lokalen Testserver im Projektverzeichnis ausführen:

```bash
# Mit Python 3:
python -m http.server 8080
```

Anschließend im Browser öffnen: `http://localhost:8080`
