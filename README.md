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
- **Funktion:** Interaktive High-End Kunstgalerie für alle 53 Gemälde mit KI-Wandvorlagen, Drag & Drop Positionierung, Skalierung, Echtheitszertifikat & Multiperspektiven.
- **Inhalt & Features:**
  - **Perfektionierte HD-Lupenfunktion (`🔍 Lupe Zoom`):** Mathematisch präzise Maus- & Touch-Lupenlinse mit relativer Container-Offset-Berechnung für flüssigen Zoom ohne Ruckeln.
  - **Reine Erstansicht im Lightbox-Modal:** Beim Anklicken eines Galeriebildes öffnet sich die Lightbox in der klaren **Pur-/Frontansicht** mit Bild, Titel, Beschreibung und Produktspezifikationen.
  - **Aktivierbare KI-Wandvorlagen:** Erst nach Klick auf den Button `In deinem Raum ansehen` werden die KI-Wandfilter-Leiste (*Wohnzimmer, Schlafzimmer, Loft, Beige Lounge*) und die Wandbühne eingeblendet.
  - **Interaktive Drag & Drop Positionierung:** Im KI-Raummodus kann der Nutzer das Gemälde frei auf der Raumwand nach oben, unten, links oder rechts verschieben (`🎯 Zentrieren` setzt die Position zurück).
  - **Interaktive Wand-Skalierung (`25% - 90%` Slider):** Stufenloses Skalieren der Bildgröße für das perfekte Maßverhältnis zum Raumhintergrund.
  - **Größen- & Maßstabsvergleich (`📐 Größenvergleich`):** Interaktives Modal, das das Kunstwerk im direkten Größenvergleich neben einer 1,75 m großen Person und Möbeln zeigt.
  - **Echtheitszertifikat (`🏆 Echtheitszertifikat`):** Zertifikat-Modal mit Siegel vom Atelier Bonn, Unikat-Garantie, handsignierter Signatur von Manuela Schenk und Seriennummer.
  - **„Weitere Ansichten:“ (Multiperspektivische Galerie):** 5 interaktive Blickwinkel (*Frontansicht, Wandansicht, Keilrahmen-Rückseite, 3D-Seitenansicht, Atelier*).
  - **Farbton-Filter & Format-Chips:** Sofortige Filterung nach Farbschemata (*Rot/Warm, Gold/Gelb, Blau/Kühl, Grün/Natur, Neutral*) und Formaten.
  - **Runde Detail-Lupe auf Galerie-Karten:** Vergrößerungs-Lupe oben rechts auf jeder Galerie-Karte (`.gallery-zoom-circle`).
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
- **Funktion:** Kontaktseite mit Anfragen-Formular.
- **Inhalt:** Formular mit Formspree-Integration, Kontaktdaten, Social-Media-Links (Instagram, WhatsApp, LinkedIn) und Vorab-Hinweis-Banner bei Weiterleitungen aus dem Konfigurator.

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
  - Galerie-Filterung, Format-Chips, Live-Suche & Sortierung.
  - Lightbox-Slideshow, Tastatursteuerung & Touch-Swipe-Gesten.
  - Multiperspektivische KI-Wandbühnen-Steuerung (`setLightboxScene` & `setLightboxViewAngle`).
  - Preiskalkulator-Berechnungsmathematik.
  - Vorher/Nachher-Slider Event-Handling.
  - Testimonial-Carousel Zeit- & Klicksteuerung.
  - LocalStorage State-Persistence & URL-Parameter-Parsing (`runOnDOMReady`).

---

## 🛠️ Technologien & Standards

- **Core:** HTML5, Vanilla CSS3, JavaScript (ES6+).
- **DSGVO-Konformität:** 100 % lokale Einbindung aller Fonts und Icon-Sets (keine externen Aufrufe an Google Fonts oder CDN-Server).
- **Performance:** WebP-Bildformate (Reduktion von 500 MB auf <3 MB = **99% Ersparnis**), `loading="lazy"`, `decoding="async"`, `width`/`height` Attribute gegen CLS.
- **SEO:** Schema.org JSON-LD strukturierte Daten, Open Graph Meta-Tags, sprechende Bild-Alts, XML-Sitemap.

---

## 🚀 Lokale Entwicklung

Zum Ausführen der Webseite auf einem lokalen Testserver im Projektverzeichnis ausführen:

```bash
# Mit Python 3:
python -m http.server 8080
```

Anschließend im Browser öffnen: `http://localhost:8080`
