/* =========================================
   HOME.JS – ManuFAKTUR Schenk
   Zentrale Skript-Datei für alle Seiten
   ========================================= */

/* =========================================
   0. THEME & LANGUAGE MANAGEMENT
   ========================================= */
let currentLang = 'de';
let currentTheme = 'light';

try {
    currentLang = localStorage.getItem('manufaktur_lang') || 'de';
    currentTheme = localStorage.getItem('manufaktur_theme') || 
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
} catch (e) {
    currentLang = 'de';
    currentTheme = 'light';
}

/* ---- Übersetzungswörterbuch bei Bedarf nachladen ----
   I18N_DICTIONARY (assets/js/i18n.js) ist ein großer Teil des Codes und wird nur für Englisch
   gebraucht. Deutsche Besucher laden ihn nie; wer die Sprache wechselt, lädt ihn beim ersten Mal.
   Die URL leitet sich von diesem Skript ab, damit das ?v=N der Seite mitgeführt wird. */
const HOME_SCRIPT_URL = document.currentScript ? document.currentScript.src : '';
let i18nLoading = null;

function i18nScriptUrl() {
    if (!HOME_SCRIPT_URL) return 'assets/js/i18n.min.js';
    return HOME_SCRIPT_URL.replace(/Home(\.min)?\.js/, (m, min) => 'assets/js/i18n' + (min || '') + '.js');
}

function ensureI18n() {
    if (typeof I18N_DICTIONARY !== 'undefined') return Promise.resolve();
    if (!i18nLoading) {
        i18nLoading = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = i18nScriptUrl();
            script.onload = resolve;
            script.onerror = () => { i18nLoading = null; reject(new Error('i18n.js konnte nicht geladen werden')); };
            document.head.appendChild(script);
        });
    }
    return i18nLoading;
}

/**
 * Führt fn aus, sobald die Texte für `lang` bereitstehen. Deutsch braucht kein Wörterbuch
 * (die Seite ist deutsch, die Originale stellt applyTranslations aus dem HTML wieder her).
 * Schlägt das Laden fehl (offline), läuft fn trotzdem – dann bleibt es bei deutschen Texten.
 */
function whenI18nReady(lang, fn) {
    if (lang === 'de' || typeof I18N_DICTIONARY !== 'undefined') fn();
    else ensureI18n().then(fn, fn);
}

/** Wörterbuch der aktuellen Sprache oder null, solange es nicht geladen ist. */
function getI18nDict() {
    return (typeof I18N_DICTIONARY !== 'undefined' && I18N_DICTIONARY[currentLang]) || null;
}

// Englisch-Besucher: Laden sofort anstoßen, nicht erst nach DOMContentLoaded.
if (currentLang === 'en') ensureI18n().catch(() => {});

/**
 * Zentrale Texte für Theme-/Sprach-Umschalter-Buttons (Footer).
 * Single Source of Truth für getFooterHTML() sowie die Live-Update-Funktionen,
 * damit sichtbarer Text und aria-label niemals auseinanderlaufen (WCAG 2.5.3).
 */
const TOGGLE_BUTTON_LABELS = {
    theme: {
        dark: {
            text: { de: 'Hellmodus', en: 'Light Mode' },
            aria: { de: 'Zu Hellmodus wechseln', en: 'Switch to Light Mode' }
        },
        light: {
            text: { de: 'Dunkelmodus', en: 'Dark Mode' },
            aria: { de: 'Zu Dunkelmodus wechseln', en: 'Switch to Dark Mode' }
        }
    },
    lang: {
        de: { text: 'EN (English)', aria: 'EN (English) – Sprache zu Englisch wechseln' },
        en: { text: 'DE (Deutsch)', aria: 'DE (Deutsch) – Switch to German' }
    }
};

function getTheme() {
    return currentTheme;
}

function setTheme(theme) {
    currentTheme = (theme === 'dark') ? 'dark' : 'light';
    try {
        localStorage.setItem('manufaktur_theme', currentTheme);
    } catch (e) {}
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (document.body) {
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
    updateThemeButtonUI();
}

function toggleTheme() {
    const newTheme = (currentTheme === 'dark') ? 'light' : 'dark';
    setTheme(newTheme);
    showToast(currentLang === 'en' 
        ? (newTheme === 'dark' ? '🌙 Dark mode activated' : '☀️ Light mode activated')
        : (newTheme === 'dark' ? '🌙 Dunkelmodus aktiviert' : '☀️ Hellmodus aktiviert'));
}

function updateThemeButtonUI() {
    const btn = document.getElementById('theme-toggle-btn');
    const icon = document.getElementById('theme-toggle-icon');
    const text = document.getElementById('theme-toggle-text');
    if (!btn) return;
    const isDark = currentTheme === 'dark';
    const labels = TOGGLE_BUTTON_LABELS.theme[isDark ? 'dark' : 'light'];
    if (icon) {
        icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
    if (text) {
        text.textContent = labels.text[currentLang];
    }
    btn.setAttribute('aria-label', labels.aria[currentLang]);
}

function getLanguage() {
    return currentLang;
}

function setLanguage(lang) {
    currentLang = (lang === 'en') ? 'en' : 'de';
    try {
        localStorage.setItem('manufaktur_lang', currentLang);
    } catch (e) {}
    document.documentElement.setAttribute('lang', currentLang);
    
    // Header & Footer aktualisieren
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    const headerEl = document.querySelector('header');
    if (headerEl) {
        headerEl.outerHTML = getNavHTML(filename);
        initHamburgerMenu();
    }
    const footerEl = document.querySelector('footer');
    if (footerEl) {
        footerEl.outerHTML = getFooterHTML();
    }
    
    updateLanguageButtonUI();
    updateThemeButtonUI();

    // Alles Weitere braucht die Texte der Zielsprache (beim ersten Wechsel auf Englisch erst nach dem Nachladen).
    whenI18nReady(currentLang, () => {
        applyTranslations(currentLang);

        // Galerie Filter & Suche aktualisieren falls vorhanden
        if (typeof filterGallery === 'function') {
            filterGallery();
        }
        // Favoriten-Buttons (Herz-Icons) neu beschriften
        if (typeof initFavButtonsUI === 'function') {
            initFavButtonsUI();
        }

        // Auftrag.html: Zusammenfassung neu lokalisieren, falls Schritt 4 bereits sichtbar ist
        if (typeof buildSummary === 'function' && typeof state !== 'undefined' && state && state.step === 4) {
            buildSummary();
        }
    });
}

function toggleLanguage() {
    const newLang = (currentLang === 'de') ? 'en' : 'de';
    setLanguage(newLang);
    showToast(newLang === 'en' ? '🇬🇧 Switched to English' : '🇩🇪 Auf Deutsch gewechselt');
}

function updateLanguageButtonUI() {
    const btn = document.getElementById('lang-toggle-btn');
    const text = document.getElementById('lang-toggle-text');
    if (!btn) return;
    const labels = TOGGLE_BUTTON_LABELS.lang[currentLang];
    if (text) {
        text.textContent = labels.text;
    }
    btn.setAttribute('aria-label', labels.aria);
}

/* =========================================
   1. SHARED COMPONENTS (Nav & Footer)
   ========================================= */

function initHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        // Hamburger toggled das mobile Nav-Menü
        hamburger.onclick = function () {
            const active = navLinks.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', active ? 'true' : 'false');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.className = active ? 'fa fa-close' : 'fa fa-bars';
            }
            // Alle offenen Dropdowns schließen wenn Menü geschlossen wird
            if (!active) {
                navLinks.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
            }
        };
    }

    // Dropdown-Toggle für Touch-Geräte (mobil)
    // Klick auf den Dropdown-Trigger-Link togglet die .open-Klasse
    document.querySelectorAll('.dropdown > a').forEach(function (trigger) {
        trigger.addEventListener('click', function (e) {
            const isMobile = window.innerWidth <= 1024;
            if (!isMobile) return; // Auf Desktop bleibt :hover aktiv
            e.preventDefault(); // Verhindert Navigation beim ersten Klick (öffnet stattdessen)
            const dropdown = trigger.closest('.dropdown');
            const isOpen = dropdown.classList.contains('open');
            // Alle anderen Dropdowns schließen
            document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
            if (!isOpen) {
                dropdown.classList.add('open');
            }
        });
    });

    // Click-Outside schließt offene Dropdowns
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
        }
    });
}

/**
 * Gibt den HTML-String der gemeinsamen Navigation zurück.
 * Der aktive Link wird anhand der aktuellen URL gesetzt.
 */
function getNavHTML(activePage) {
    const isEn = currentLang === 'en';
    const links = [
        { href: 'Home.html', icon: 'fa fa-home', label: 'Home' },
        { href: 'UeberMich.html', icon: 'fa-solid fa-address-card', label: isEn ? 'About Me' : 'Über mich' },
        { href: 'Leistungen.html', icon: 'fa fa-palette', label: isEn ? 'Services' : 'Leistungen' },
        { href: 'Bildergalerie.html', icon: 'fa fa-images', label: isEn ? 'Gallery' : 'Galerie' },
        { href: 'Auftrag.html', icon: 'fa fa-pen-ruler', label: isEn ? 'Commission' : 'Auftrag', title: isEn ? 'Configure Commission' : 'Auftrag konfigurieren' },
    ];

    const navItems = links.map(l => {
        const isActive = activePage === l.href;
        return `<li${isActive ? ' class="active"' : ''}><a href="${l.href}"${l.title ? ` title="${l.title}"` : ''}><i class="${l.icon}" aria-hidden="true"></i> <span>${l.label}</span></a></li>`;
    }).join('\n            ');

    const isKontaktActive = ['Kontakt.html', 'Impressum.html', 'Datenschutz.html'].includes(activePage);

    return `
  <header>
    <nav aria-label="${isEn ? 'Main navigation' : 'Hauptmenü'}">
      <div class="nav-brand">
        <a href="Home.html" class="headline" aria-label="${isEn ? 'ManuFAKTUR Home' : 'ManuFAKTUR Startseite'}" title="${isEn ? 'Home' : 'Startseite'}">
          <img src="assets/images/logos/logo-transparent.png" alt="ManuFAKTUR Schenk Logo" class="nav-logo">
        </a>
      </div>
      <button class="hamburger" aria-label="${isEn ? 'Open menu' : 'Menü öffnen'}" aria-expanded="false">
        <i class="fa fa-bars" aria-hidden="true"></i>
      </button>
      <ul class="nav-links">
            ${navItems}
            <li class="dropdown${isKontaktActive ? ' active' : ''}">
              <a href="Kontakt.html" class="cursor-pointer" title="${isEn ? 'Contact' : 'Kontakt'}">
                <i class="fa-solid fa-envelope" aria-hidden="true"></i> <span>${isEn ? 'Contact' : 'Kontakt'}</span>
                <i class="fa fa-caret-down" aria-hidden="true"></i>
              </a>
              <div class="dropdown-content">
                <a href="Kontakt.html"><i class="fa-solid fa-envelope" aria-hidden="true"></i> <span>${isEn ? 'Contact Form' : 'Kontaktformular'}</span></a>
                <a href="Impressum.html"><i class="fa-solid fa-paragraph" aria-hidden="true"></i> <span>${isEn ? 'Imprint' : 'Impressum'}</span></a>
                <a href="Datenschutz.html"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> <span>${isEn ? 'Privacy Policy' : 'Datenschutz'}</span></a>
              </div>
            </li>
      </ul>
    </nav>
  </header>`;
}

/**
 * Gibt den HTML-String des gemeinsamen Footers zurück.
 */
function getFooterHTML() {
    const isEn = currentLang === 'en';
    const isDark = currentTheme === 'dark';
    return `
  <footer>
    <div class="footer-section">
      <h2>ManuFAKTUR</h2>
      <p class="footer-tagline">${isEn ? 'Custom Paintings & Craftsmanship' : 'Individuelle Malerei & Handwerkskunst'}</p>
      <p><i class="fa fa-envelope" aria-hidden="true"></i> <a href="mailto:manufaktur-malerei@web.de">manufaktur-malerei@web.de</a></p>
      <p><i class="fa fa-phone" aria-hidden="true"></i> <a href="tel:+491632662435">+49 163 2662435</a></p>
    </div>
    <div class="footer-section">
      <h2>Manuela Schenk</h2>
      <p>53175 Bonn &bull; ${isEn ? 'Germany' : 'Deutschland'}</p>
      <div class="social-icons">
        <a href="https://www.instagram.com/manufakturmalerei?igsh=MXVncGlnZDNpeWc4ag==" target="_blank" rel="noopener" class="instagram" aria-label="${isEn ? 'Follow on Instagram' : 'Folge uns auf Instagram'}"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a>
        <a href="https://wa.me/491632662435" target="_blank" rel="noopener" class="whatsapp" aria-label="${isEn ? 'Contact on WhatsApp' : 'Kontaktiere uns auf WhatsApp'}"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a>
      </div>
    </div>
    <div class="footer-section">
      <h2>${isEn ? 'Legal' : 'Rechtliches'}</h2>
      <p>&copy; ${new Date().getFullYear()} ManuFAKTUR Schenk</p>
      <p class="font-size-09rem">
        <a href="Impressum.html">${isEn ? 'Imprint' : 'Impressum'}</a> |
        <a href="Datenschutz.html">${isEn ? 'Privacy Policy' : 'Datenschutz'}</a>
      </p>
    </div>
    <div class="footer-section footer-settings">
      <h2>${isEn ? 'Preferences' : 'Einstellungen'}</h2>
      <div class="footer-controls-group">
        <button type="button" id="theme-toggle-btn" class="footer-toggle-btn" aria-label="${TOGGLE_BUTTON_LABELS.theme[isDark ? 'dark' : 'light'].aria[currentLang]}" title="${isEn ? 'Toggle Dark / Light Mode' : 'Dark / Light Mode wechseln'}">
          <i class="${isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}" id="theme-toggle-icon" aria-hidden="true"></i>
          <span id="theme-toggle-text">${TOGGLE_BUTTON_LABELS.theme[isDark ? 'dark' : 'light'].text[currentLang]}</span>
        </button>
        <button type="button" id="lang-toggle-btn" class="footer-toggle-btn" aria-label="${TOGGLE_BUTTON_LABELS.lang[currentLang].aria}" title="${isEn ? 'Switch to German' : 'Auf Englisch wechseln'}">
          <i class="fa-solid fa-globe" aria-hidden="true"></i>
          <span id="lang-toggle-text">${TOGGLE_BUTTON_LABELS.lang[currentLang].text}</span>
        </button>
      </div>
    </div>
  </footer>`;
}

/**
 * Liest die aktuelle Seite aus der URL und injiziert Nav + Footer.
 * Wird vor DOMContentLoaded aufgerufen, damit alles sofort da ist.
 */
(function injectSharedComponents() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    // Theme & Lang sofort anwenden
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (document.body && currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    document.documentElement.setAttribute('lang', currentLang);

    // Header nur auf Nicht-Hero-Seiten injizieren
    const headerEl = document.querySelector('header');
    if (headerEl) {
        headerEl.outerHTML = getNavHTML(filename);
    }

    // Footer injizieren
    const footerEl = document.querySelector('footer');
    if (footerEl) {
        footerEl.outerHTML = getFooterHTML();
    }
})();

/* Das Übersetzungswörterbuch I18N_DICTIONARY liegt in assets/js/i18n.js und wird bei Bedarf nachgeladen (ensureI18n). */

/*
 * Deutsch steht im HTML. Damit HTML und I18N_DICTIONARY.de nicht auseinanderlaufen können,
 * merkt sich applyTranslations beim ersten Aufruf die deutschen Originale aller statischen
 * data-i18n*-Elemente und setzt beim Zurückschalten auf Deutsch genau diese wieder ein.
 * I18N_DICTIONARY.de wird nur noch für per JS erzeugte Inhalte (Navigation, Footer,
 * Meldungen) gebraucht.
 */
const I18N_BINDINGS = [
    ['data-i18n', 'text'],
    ['data-i18n-html', 'html'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-aria-label', 'aria-label'],
    ['data-i18n-title', 'title'],
    ['data-i18n-alt', 'alt']
];
const i18nOriginals = new WeakMap();
let i18nOriginalsCaptured = false;

function readI18nSlot(el, slot) {
    if (slot === 'text') return el.textContent;
    if (slot === 'html') return el.innerHTML;
    return el.getAttribute(slot);
}

function writeI18nSlot(el, slot, value) {
    if (slot === 'text') el.textContent = value;
    else if (slot === 'html') el.innerHTML = value;
    else el.setAttribute(slot, value);
}

function rememberI18nOriginal(el, slot) {
    let store = i18nOriginals.get(el);
    if (!store) { store = {}; i18nOriginals.set(el, store); }
    if (!(slot in store)) store[slot] = readI18nSlot(el, slot);
}

// Einmalig vor der ersten Übersetzung: Header und Footer werden per JS sprachabhängig neu gebaut
// und brauchen deshalb keine Originale.
function captureI18nOriginals() {
    if (i18nOriginalsCaptured) return;
    i18nOriginalsCaptured = true;
    I18N_BINDINGS.forEach(([attr, slot]) => {
        document.querySelectorAll(`[${attr}]`).forEach(el => {
            if (!el.closest('header, footer')) rememberI18nOriginal(el, slot);
        });
    });
}

function applyTranslations(lang) {
    // Ohne Wörterbuch (Deutsch, nie übersetzt) ist die Seite bereits im Originalzustand.
    if (typeof I18N_DICTIONARY === 'undefined') return;
    const t = I18N_DICTIONARY[lang] || I18N_DICTIONARY.de;
    captureI18nOriginals();

    I18N_BINDINGS.forEach(([attr, slot]) => {
        document.querySelectorAll(`[${attr}]`).forEach(el => {
            const store = i18nOriginals.get(el);
            const value = (lang === 'de' && store && slot in store) ? store[slot] : t[el.getAttribute(attr)];
            if (value !== undefined && value !== null) writeI18nSlot(el, slot, value);
        });
    });

    // Galerie-Karten (Titel, Technik, Maße aus artworks-data.js)
    translateGalleryCards(lang);

    // Konfigurator: Fortschrittsanzeige (aria-valuetext) folgt den Schrittnamen
    if (typeof updateProgressAria === 'function') updateProgressAria();
}

/* =========================================
   2. GALERIE: FILTER, LIVE-SUCHE, FAVORITEN & DATEN
   ========================================= */
// ARTWORKS_METADATA und ARTWORKS_METADATA_EN liegen in assets/js/artworks-data.js
// (nur auf Seiten mit Galerie/Lightbox/Favoriten eingebunden).


/**
 * Liefert die Metadaten eines Kunstwerks in der aktuell aktiven Sprache.
 * Fällt bei fehlender Übersetzung auf die deutschen Basisdaten zurück.
 */
function getArtMeta(itemId) {
    if (!itemId || typeof ARTWORKS_METADATA === 'undefined' || !ARTWORKS_METADATA[itemId]) return null;
    const base = ARTWORKS_METADATA[itemId];
    if (currentLang === 'en' && typeof ARTWORKS_METADATA_EN !== 'undefined' && ARTWORKS_METADATA_EN[itemId]) {
        return Object.assign({}, base, ARTWORKS_METADATA_EN[itemId]);
    }
    return base;
}

/**
 * Übersetzt die Galerie-Karten (aria-label, alt/title, Bildunterschrift) anhand von
 * ARTWORKS_METADATA_EN. Auf Deutsch werden die Originale aus dem HTML wiederhergestellt.
 */
function translateGalleryCards(lang) {
    if (typeof ARTWORKS_METADATA === 'undefined') return;
    const isEn = lang === 'en';
    document.querySelectorAll('.gallery-item[id]').forEach(item => {
        const meta = ARTWORKS_METADATA[item.id];
        if (!meta) return;
        const link = item.querySelector('a');
        const img = item.querySelector('img');
        const caption = item.querySelector('.gallery-caption');
        const targets = [[link, 'aria-label'], [img, 'alt'], [img, 'title'], [caption, 'text']].filter(([el]) => el);
        targets.forEach(([el, slot]) => rememberI18nOriginal(el, slot));

        if (!isEn) {
            targets.forEach(([el, slot]) => {
                const original = i18nOriginals.get(el)[slot];
                if (original === null) el.removeAttribute(slot);
                else writeI18nSlot(el, slot, original);
            });
            return;
        }

        const metaEn = typeof ARTWORKS_METADATA_EN !== 'undefined' ? ARTWORKS_METADATA_EN[item.id] : null;
        const title = (metaEn && metaEn.title) || meta.title;
        const technik = (metaEn && metaEn.technik) || meta.technik;
        const masse = meta.masse;
        if (link) link.setAttribute('aria-label', `Enlarge: ${title} (${technik}, ${masse})`);
        if (img) {
            img.setAttribute('alt', `Hand-painted artwork "${title}" – ${technik}, ${masse}, by Manuela Schenk`);
            img.setAttribute('title', title);
        }
        if (caption) caption.textContent = `${title} (${technik}, ${masse})`;
    });
}

let visibleGalleryLinks = [];
let currentIndex = 0;
let activeCategory = 'alle';

function getFavorites() {
    try {
        const favs = localStorage.getItem('manufaktur_favorites');
        return favs ? JSON.parse(favs) : [];
    } catch {
        return [];
    }
}

function saveFavorites(favs) {
    try {
        localStorage.setItem('manufaktur_favorites', JSON.stringify(favs));
    } catch (e) {
        console.error('Konnte Favoriten nicht speichern', e);
    }
}

function toggleFavorite(itemId, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (!itemId) return;

    let favs = getFavorites();
    const index = favs.indexOf(itemId);
    let isAdded = false;

    if (index > -1) {
        favs.splice(index, 1);
        isAdded = false;
        showToast(currentLang === 'en' ? 'Artwork removed from favorites.' : 'Kunstwerk aus Favoriten entfernt.');
    } else {
        favs.push(itemId);
        isAdded = true;
        showToast(currentLang === 'en' ? '❤️ Artwork added to favorites!' : '❤️ Kunstwerk zu Favoriten hinzugefügt!');
    }

    saveFavorites(favs);
    updateFavButtonsUI(itemId, isAdded);
    updateFavBadgeCount();

    if (activeCategory === 'favoriten') {
        filterGallery();
    }
}

// Deutsche Verfügbarkeitstexte für die Lightbox, solange das Wörterbuch (nur für Englisch) nicht geladen ist.
// Muss mit den status_*-Schlüsseln in assets/js/i18n.js (de) übereinstimmen.
const STATUS_TEXTS_DE = {
    status_verfuegbar: 'Verfügbar',
    status_reserviert: 'Reserviert',
    status_verkauft: 'Verkauft – gerne male ich Dir ein ähnliches Motiv'
};

/** Liefert die sprachabhängige Beschriftung für Favoriten-Buttons (Herz-Icons). */
function favButtonLabel(isAdded) {
    const dict = getI18nDict();
    if (dict) return isAdded ? dict.lb_btn_fav_remove : dict.lb_btn_fav_add;
    return isAdded ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen';
}

function updateFavButtonsUI(itemId, isAdded) {
    const itemEl = document.getElementById(itemId);
    if (itemEl) {
        const btn = itemEl.querySelector('.fav-toggle-btn');
        if (btn) {
            btn.classList.toggle('active', isAdded);
            btn.setAttribute('aria-label', favButtonLabel(isAdded));
            const icon = btn.querySelector('i');
            if (icon) {
                icon.className = isAdded ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            }
        }
    }

    // Lightbox fav btn update
    const lbFavBtn = document.getElementById('lightbox-fav-btn');
    if (lbFavBtn && visibleGalleryLinks[currentIndex]) {
        const currentItem = visibleGalleryLinks[currentIndex].closest('.gallery-item');
        if (currentItem && currentItem.id === itemId) {
            lbFavBtn.classList.toggle('active', isAdded);
            const heartIcon = isAdded ? '<i class="fa-solid fa-heart color-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
            lbFavBtn.innerHTML = `${heartIcon} ${favButtonLabel(isAdded)}`;
        }
    }
}

function updateFavBadgeCount() {
    const favCountEl = document.getElementById('fav-count');
    if (favCountEl) {
        const favs = getFavorites();
        favCountEl.innerText = favs.length;
    }
}

function initFavButtonsUI() {
    const items = document.querySelectorAll('.gallery-item');
    const favs = getFavorites();
    items.forEach(item => {
        let itemId = item.getAttribute('id');
        if (!itemId) {
            const link = item.querySelector('a');
            if (link) {
                const match = link.href.match(/([^/]+)\.webp$/i);
                if (match) {
                    itemId = match[1];
                    item.setAttribute('id', itemId);
                }
            }
        }
        if (!itemId) return;

        let btn = item.querySelector('.fav-toggle-btn');
        if (!btn) {
            btn = document.createElement('button');
            btn.className = 'fav-toggle-btn';
            btn.setAttribute('type', 'button');
            btn.setAttribute('title', favButtonLabel(false));
            btn.onclick = function(e) { toggleFavorite(itemId, e); };
            item.appendChild(btn);
        }

        const isAdded = favs.includes(itemId);
        btn.classList.toggle('active', isAdded);
        btn.setAttribute('aria-label', favButtonLabel(isAdded));
        btn.innerHTML = isAdded ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
    });
    updateFavBadgeCount();
}

function clearGallerySearch() {
    const searchInput = document.getElementById('gallery-search');
    if (searchInput) {
        searchInput.value = '';
        filterGallery();
        searchInput.focus();
    }
}


function sortGallery(sortOption) {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    const items = Array.from(grid.querySelectorAll('.gallery-item'));
    if (items.length === 0) return;

    // Ursprüngliche Index-Position für stabiles Zurücksetzen / Neueste zuerst merken
    items.forEach((item, idx) => {
        if (!item.hasAttribute('data-original-index')) {
            item.setAttribute('data-original-index', idx);
        }
    });

    items.sort((a, b) => {
        const idxA = parseInt(a.getAttribute('data-original-index') || '0', 10);
        const idxB = parseInt(b.getAttribute('data-original-index') || '0', 10);
        const titleA = (a.querySelector('.gallery-caption')?.innerText || '').toLowerCase();
        const titleB = (b.querySelector('.gallery-caption')?.innerText || '').toLowerCase();

        if (sortOption === 'title-asc') return titleA.localeCompare(titleB, 'de');
        if (sortOption === 'title-desc') return titleB.localeCompare(titleA, 'de');
        if (sortOption === 'newest') return idxB - idxA;
        // 'default': Originale kuratierte Reihenfolge wiederherstellen
        return idxA - idxB;
    });

    items.forEach(item => grid.appendChild(item));
    updateGalleryLinks();
    showToast(currentLang === 'en' ? 'Gallery re-sorted' : 'Galerie neu sortiert');
}

let currentLbScene = 'detail';
let customWallScalePercent = 55;
let wallFramePosX = 0;
let wallFramePosY = 0;
let isDraggingWallFrame = false;
let dragStartX = 0;
let dragStartY = 0;

const KI_ROOM_IMAGES = {
    'livingroom': 'assets/images/rooms/livingroom.webp',
    'bedroom': 'assets/images/rooms/bedroom.webp',
    'darkloft': 'assets/images/rooms/darkloft.webp',
    'beigelounge': 'assets/images/rooms/beigelounge.webp',
    'detail': ''
};

function resetWallFramePosition() {
    wallFramePosX = 0;
    wallFramePosY = 0;
    updateWallFrameTransform();
    showToast(currentLang === 'en' ? '🎯 Position centered' : '🎯 Position zentriert');
}

function updateWallFrameTransform() {
    const container = document.getElementById('wall-frame-container');
    if (!container) return;

    if (currentViewAngle === 'side3d') {
        container.style.transform = `perspective(900px) rotateY(-26deg) rotateX(6deg) scale(0.92) translate(${wallFramePosX}px, ${wallFramePosY}px)`;
    } else {
        container.style.transform = `translate(${wallFramePosX}px, ${wallFramePosY}px)`;
    }
}

function initWallFrameDragLogic() {
    const container = document.getElementById('wall-frame-container');
    if (!container) return;

    const startDrag = (e) => {
        if (currentLbScene === 'detail' || isZoomActive) return;
        isDraggingWallFrame = true;
        container.classList.add('is-dragging');
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragStartX = clientX - wallFramePosX;
        dragStartY = clientY - wallFramePosY;
    };

    const doDrag = (e) => {
        if (!isDraggingWallFrame) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        let newX = clientX - dragStartX;
        let newY = clientY - dragStartY;

        const maxOffset = 260;
        newX = Math.max(-maxOffset, Math.min(maxOffset, newX));
        newY = Math.max(-180, Math.min(180, newY));

        wallFramePosX = newX;
        wallFramePosY = newY;
        updateWallFrameTransform();
    };

    const stopDrag = () => {
        if (isDraggingWallFrame) {
            isDraggingWallFrame = false;
            container.classList.remove('is-dragging');
        }
    };

    container.addEventListener('mousedown', startDrag);
    container.addEventListener('touchstart', startDrag, { passive: true });

    window.addEventListener('mousemove', doDrag);
    window.addEventListener('touchmove', doDrag, { passive: true });

    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
}

function updateLbWallScale(val) {
    customWallScalePercent = parseInt(val) || 55;
    const valEl = document.getElementById('lb-scale-val');
    if (valEl) valEl.innerText = `${customWallScalePercent}%`;

    const container = document.getElementById('wall-frame-container');
    if (container && currentLbScene !== 'detail') {
        container.style.maxWidth = `${customWallScalePercent}%`;
        container.style.maxHeight = `${customWallScalePercent * 1.15}%`;
    }
}

function setLightboxScene(scene, btn) {
    currentLbScene = scene || 'detail';
    
    const stage = document.getElementById('lightbox-wall-stage');
    const badge = document.getElementById('wall-badge-tag');
    const dragHint = document.getElementById('wall-drag-hint');
    const sceneBar = document.getElementById('lightbox-scene-bar');
    const scaleControl = document.getElementById('lb-wall-scale-control');
    const sceneBtns = document.querySelectorAll('.lightbox-scene-bar .scene-btn');
    
    sceneBtns.forEach(b => {
        const sc = b.getAttribute('data-scene');
        if (sc === currentLbScene || b === btn) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });

    if (currentLbScene === 'detail') {
        if (sceneBar) sceneBar.classList.add('hidden');
        if (scaleControl) scaleControl.classList.add('hidden');
        if (dragHint) dragHint.classList.add('hidden');
        if (stage) {
            stage.className = 'lightbox-wall-stage scene-detail';
            stage.style.backgroundImage = 'none';
            stage.style.backgroundColor = '#0f172a';
            if (badge) badge.classList.add('hidden');
        }
    } else {
        if (sceneBar) sceneBar.classList.remove('hidden');
        if (scaleControl) scaleControl.classList.remove('hidden');
        if (dragHint) dragHint.classList.remove('hidden');
        if (stage) {
            stage.className = 'lightbox-wall-stage scene-' + currentLbScene;
            const bgUrl = KI_ROOM_IMAGES[currentLbScene] || KI_ROOM_IMAGES['livingroom'];
            stage.style.backgroundImage = `url('${bgUrl}')`;
            stage.style.backgroundColor = 'transparent';
            if (badge) {
                badge.classList.remove('hidden');
                const isEn = currentLang === 'en';
                const labelMap = isEn ? {
                    'livingroom': 'Living Room',
                    'bedroom': 'Bedroom',
                    'darkloft': 'Loft / Concrete',
                    'beigelounge': 'Beige Lounge'
                } : {
                    'livingroom': 'Wohnzimmer',
                    'bedroom': 'Schlafzimmer',
                    'darkloft': 'Loft / Beton',
                    'beigelounge': 'Beige Lounge'
                };
                badge.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> ${isEn ? 'AI wall preview' : 'KI-Wandvorlage'} (${labelMap[currentLbScene] || labelMap.livingroom})`;
            }
        }
    }
    adjustWallFrameScale();
}

function adjustWallFrameScale() {
    const img = document.getElementById('lightbox-img');
    const container = document.getElementById('wall-frame-container');
    if (!img || !container) return;

    if (currentLbScene === 'detail') {
        container.style.maxWidth = '100%';
        container.style.maxHeight = '68vh';
        container.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        return;
    }

    container.style.maxWidth = `${customWallScalePercent}%`;
    container.style.maxHeight = `${customWallScalePercent * 1.15}%`;
    container.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.55), 0 10px 20px rgba(0, 0, 0, 0.35)';
}

let currentViewAngle = 'front';

/**
 * Pfad zur verkleinerten Fassung eines Werks (…/lightbox/ID.webp → …/thumbs/ID-{width}w.webp).
 * Links, die nicht dem Schema folgen, bleiben unverändert.
 */
function artworkVariantSrc(link, width) {
    const href = link.getAttribute('href') || '';
    const m = href.match(/^(.*)\/lightbox\/([^/]+)\.webp$/);
    return m ? `${m[1]}/thumbs/${m[2]}-${width}w.webp` : link.href;
}

/**
 * Großansicht passend zum Bildschirm: Schmale Geräte bekommen die 1000-px-Fassung
 * (≈ ein Drittel der Dateigröße), alle anderen das 1600-px-Original.
 */
function lightboxImageSrc(link) {
    const devicePixels = window.innerWidth * (window.devicePixelRatio || 1);
    return devicePixels <= 1100 ? artworkVariantSrc(link, 1000) : link.href;
}

function setLightboxViewAngle(angle, btn) {
    currentViewAngle = angle || 'front';
    
    document.querySelectorAll('.view-thumb-btn').forEach(b => {
        const v = b.getAttribute('data-view');
        if (v === currentViewAngle || b === btn) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });

    const stage = document.getElementById('lightbox-wall-stage');
    const container = document.getElementById('wall-frame-container');
    const img = document.getElementById('lightbox-img');
    const badge = document.getElementById('wall-badge-tag');

    if (!container || !img) return;

    // Reset 3D transform
    container.style.transform = 'none';

    if (currentViewAngle === 'front') {
        setLightboxScene('detail');
        if (visibleGalleryLinks[currentIndex]) {
            img.src = lightboxImageSrc(visibleGalleryLinks[currentIndex]);
        }
    } else if (currentViewAngle === 'room') {
        setLightboxScene('livingroom');
        if (visibleGalleryLinks[currentIndex]) {
            img.src = lightboxImageSrc(visibleGalleryLinks[currentIndex]);
        }
    } else if (currentViewAngle === 'back') {
        if (stage) {
            stage.style.backgroundImage = 'none';
            stage.style.backgroundColor = '#0f172a';
        }
        img.src = 'assets/images/rooms/canvas_back.webp';
        if (badge) {
            badge.classList.remove('hidden');
            badge.innerHTML = `<i class="fa-solid fa-square-check" aria-hidden="true"></i> ${currentLang === 'en' ? 'Stretcher frame & back (solid spruce)' : 'Keilrahmen & Rückseite (massives Fichtenholz)'}`;
        }
        container.style.maxWidth = '75%';
        container.style.maxHeight = '52vh';
    } else if (currentViewAngle === 'side3d') {
        setLightboxScene('detail');
        if (visibleGalleryLinks[currentIndex]) {
            img.src = lightboxImageSrc(visibleGalleryLinks[currentIndex]);
        }
        container.style.transform = 'perspective(900px) rotateY(-26deg) rotateX(6deg) scale(0.92)';
        container.style.boxShadow = '-20px 25px 50px rgba(0, 0, 0, 0.65), -5px 8px 15px rgba(0, 0, 0, 0.4)';
        if (badge) {
            badge.classList.remove('hidden');
            badge.innerHTML = `<i class="fa-solid fa-cube" aria-hidden="true"></i> ${currentLang === 'en' ? '3D side view (painted edge)' : '3D-Seitenansicht (gemalter Rand)'}`;
        }
    } else if (currentViewAngle === 'artist') {
        if (stage) {
            stage.style.backgroundImage = "url('assets/images/rooms/artist_studio.webp')";
            stage.style.backgroundColor = 'transparent';
        }
        if (visibleGalleryLinks[currentIndex]) {
            img.src = lightboxImageSrc(visibleGalleryLinks[currentIndex]);
        }
        if (badge) {
            badge.classList.remove('hidden');
            badge.innerHTML = `<i class="fa-solid fa-palette" aria-hidden="true"></i> ${currentLang === 'en' ? 'Handmade in the Bonn studio' : 'Handgemacht im Atelier Bonn'}`;
        }
    }
}

/* 90-Degree Image Rotation & Click-Toggle Zoom State */
let currentRotationAngle = 0;
let isZoomActive = false;

function rotateLightboxImage(deg) {
    const img = document.getElementById('lightbox-img');
    if (!img) return;
    currentRotationAngle = (currentRotationAngle + (deg || 90)) % 360;
    img.style.transform = `rotate(${currentRotationAngle}deg)`;
    showToast(currentLang === 'en' ? `Image rotated ${currentRotationAngle}°` : `Bild um ${currentRotationAngle}° gedreht`);
}

function toggleLightboxZoom() {
    isZoomActive = !isZoomActive;
    const btn = document.getElementById('btn-toggle-zoom');
    const lens = document.getElementById('lightbox-magnifier');
    if (btn) btn.classList.toggle('active', isZoomActive);
    if (!isZoomActive && lens) lens.style.display = 'none';
    showToast(currentLang === 'en'
        ? (isZoomActive ? '🔍 Magnifier activated (hover over the image)' : 'Magnifier deactivated')
        : (isZoomActive ? '🔍 Lupe aktiviert (Fahre über das Bild)' : 'Lupe deaktiviert'));
}

/* Magnifier Zoom Lens for Lightbox (Mouse & Touch Supported) */
function initLightboxMagnifier() {
    const lightboxImg = document.getElementById('lightbox-img');
    const lens = document.getElementById('lightbox-magnifier');
    const mediaCol = document.querySelector('.lightbox-media-col');
    if (!lightboxImg || !lens || !mediaCol) return;

    mediaCol.removeEventListener('mousemove', handleMove);
    mediaCol.removeEventListener('mouseleave', hideLens);
    mediaCol.removeEventListener('touchmove', handleTouchMove);
    mediaCol.removeEventListener('touchend', hideLens);

    mediaCol.addEventListener('mousemove', handleMove);
    mediaCol.addEventListener('mouseleave', hideLens);
    mediaCol.addEventListener('touchmove', handleTouchMove, { passive: true });
    mediaCol.addEventListener('touchend', hideLens);

    function handleTouchMove(e) {
        if (e.touches && e.touches[0]) {
            handleMove(e.touches[0]);
        }
    }

    function handleMove(e) {
        if (!isZoomActive) {
            lens.style.display = 'none';
            return;
        }

        const imgBounds = lightboxImg.getBoundingClientRect();
        const colBounds = mediaCol.getBoundingClientRect();

        const clientX = e.clientX;
        const clientY = e.clientY;

        const relX = clientX - imgBounds.left;
        const relY = clientY - imgBounds.top;

        // Display lens only when cursor/finger is over artwork bounds
        if (relX < 0 || relX > imgBounds.width || relY < 0 || relY > imgBounds.height) {
            lens.style.display = 'none';
            return;
        }

        lens.style.display = 'block';
        lens.style.backgroundImage = `url('${lightboxImg.src}')`;

        const zoomRatio = 3.0;
        lens.style.backgroundSize = `${imgBounds.width * zoomRatio}px ${imgBounds.height * zoomRatio}px`;

        const lensW = (lens.offsetWidth || 150) / 2;
        const lensH = (lens.offsetHeight || 150) / 2;

        const colX = clientX - colBounds.left;
        const colY = clientY - colBounds.top;

        lens.style.left = `${colX - lensW}px`;
        lens.style.top = `${colY - lensH}px`;

        const bgPosX = -(relX * zoomRatio - lensW);
        const bgPosY = -(relY * zoomRatio - lensH);
        lens.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
    }

    function hideLens() {
        lens.style.display = 'none';
    }
}

let isFilterHistoryPushed = false;
let isLightboxOpen = false;
let savedGalleryScrollY = 0;
let isClosingLightboxFromPopstate = false;
let isFlyerModalOpen = false;
let closeLightboxUI = null;
let closeFlyerModalUI = null;

function applyFilterUI(category) {
    activeCategory = category || 'alle';
    const btnContainer = document.getElementById('filter-container');
    if (btnContainer) {
        const btns = btnContainer.getElementsByClassName('filter-btn');
        for (let i = 0; i < btns.length; i++) {
            const isActive = btns[i].dataset.filter === activeCategory;
            btns[i].classList.toggle('active', isActive);
            btns[i].setAttribute('aria-pressed', isActive ? 'true' : 'false');
        }
    }
    filterGallery();
}

function filterSelection(category, isPopState = false) {
    const targetCategory = category || 'alle';

    if (!isPopState && window.history && window.history.pushState) {
        if (targetCategory !== 'alle') {
            if (!isFilterHistoryPushed) {
                window.history.pushState({ galleryFilter: targetCategory }, '', window.location.pathname + window.location.search);
                isFilterHistoryPushed = true;
            } else {
                window.history.replaceState({ galleryFilter: targetCategory }, '', window.location.pathname + window.location.search);
            }
        } else if (targetCategory === 'alle' && isFilterHistoryPushed) {
            isFilterHistoryPushed = false;
            applyFilterUI('alle');
            window.history.back();
            return;
        }
    }

    applyFilterUI(targetCategory);
}

// Globales PopState Event: Behandelt Zurück-Taste für Modale (Lightbox, Flyer) & Filter
window.addEventListener('popstate', function (event) {
    if (isClosingLightboxFromPopstate) {
        isClosingLightboxFromPopstate = false;
        return;
    }

    // 1. Lightbox ist geöffnet -> Schließen, Scrollposition beibehalten, Filter nicht verändern
    if (isLightboxOpen && typeof closeLightboxUI === 'function') {
        closeLightboxUI(false);
        if (event.state && event.state.galleryFilter && event.state.galleryFilter !== activeCategory) {
            applyFilterUI(event.state.galleryFilter);
        }
        return;
    }

    // 2. Flyer-Modal ist geöffnet -> Schließen
    if (isFlyerModalOpen && typeof closeFlyerModalUI === 'function') {
        closeFlyerModalUI(false);
        return;
    }

    // 3. Galerie-Filter Navigation
    const filterContainer = document.getElementById('filter-container');
    if (filterContainer) {
        const targetFilter = (event.state && event.state.galleryFilter) ? event.state.galleryFilter : 'alle';
        if (activeCategory !== targetFilter) {
            isFilterHistoryPushed = (targetFilter !== 'alle');
            applyFilterUI(targetFilter);
        }
    }
});

function filterGallery() {
    const searchInput = document.getElementById('gallery-search');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const items = document.getElementsByClassName('gallery-item');
    let visibleCount = 0;
    const favs = getFavorites();

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const dataKat = item.getAttribute('data-kategorie') || '';
        const itemId = item.getAttribute('id') || '';
        const imgEl = item.querySelector('img');
        const captionEl = item.querySelector('.gallery-caption');
        const itemText = (captionEl ? captionEl.innerText : '') + ' ' + (imgEl ? imgEl.alt : '');

        let matchesCategory = false;
        if (activeCategory === 'alle') {
            matchesCategory = true;
        } else if (activeCategory === 'favoriten') {
            matchesCategory = favs.includes(itemId);
        } else {
            matchesCategory = dataKat.includes(activeCategory);
        }

        const matchesSearch = (!searchTerm || itemText.toLowerCase().includes(searchTerm));

        if (matchesCategory && matchesSearch) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    }

    const noResults = document.getElementById('no-gallery-results');
    if (noResults) {
        if (visibleCount === 0) {
            noResults.classList.remove('hidden');
            const titleEl = noResults.querySelector('p');
            const subEl = noResults.querySelector('small');
            const dict = getI18nDict();
            if (activeCategory === 'favoriten') {
                if (titleEl) titleEl.innerText = dict ? dict.gallery_empty_fav_title : 'Noch keine Favoriten gemerkt.';
                if (subEl) subEl.innerText = dict ? dict.gallery_empty_fav_text : 'Klicke auf das Herz-Symbol auf den Kunstwerken, um deine persönlichen Lieblingswerke hier zu speichern.';
            } else {
                if (titleEl) titleEl.innerText = dict ? dict.gallery_empty_search_title : 'Keine passenden Gemälde gefunden.';
                if (subEl) subEl.innerText = dict ? dict.gallery_empty_search_text : 'Versuche es mit einem anderen Suchbegriff oder setze den Kategorie-Filter zurück.';
            }
        } else {
            noResults.classList.add('hidden');
        }
    }

    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) {
        clearBtn.style.display = searchTerm ? 'block' : 'none';
    }

    const countBadge = document.getElementById('search-count-badge');
    if (countBadge) {
        const isEnCount = currentLang === 'en';
        const catMap = isEnCount ? {
            'alle': 'all categories',
            'tiere': 'Animals',
            'landschaften': 'Landscapes',
            'pflanzen': 'Botanicals',
            'sonstiges': 'Still Life & More',
            'favoriten': '❤️ Saved Favorites'
        } : {
            'alle': 'alle Kategorien',
            'tiere': 'Tiere',
            'landschaften': 'Landschaften',
            'pflanzen': 'Pflanzen',
            'sonstiges': 'Sonstiges',
            'favoriten': '❤️ Gemerkte Kunstwerke'
        };
        const catLabel = catMap[activeCategory] || activeCategory;
        countBadge.innerHTML = isEnCount
            ? `<i class="fa-solid fa-images" aria-hidden="true"></i> Showing ${visibleCount} of ${items.length} artworks (${catLabel})`
            : `<i class="fa-solid fa-images" aria-hidden="true"></i> Zeige ${visibleCount} von ${items.length} Kunstwerken (${catLabel})`;
    }

    const liveCounterEl = document.getElementById('gallery-counter');
    if (liveCounterEl) {
        const isEnCounter = currentLang === 'en';
        if (visibleCount === items.length) {
            liveCounterEl.textContent = isEnCounter
                ? `${items.length} paintings`
                : `${items.length} Gemälde`;
        } else {
            liveCounterEl.textContent = isEnCounter
                ? `${visibleCount} of ${items.length} paintings`
                : `${visibleCount} von ${items.length} Gemälden`;
        }
    }

    updateFavBadgeCount();
    updateGalleryLinks();
}

function updateGalleryLinks() {
    visibleGalleryLinks = Array.from(document.querySelectorAll('.gallery-item'))
        .filter(item => item.style.display !== 'none')
        .map(item => item.querySelector('a'));
}

/* =========================================
   3. DOM READY (Initialisierung)
   ========================================= */
document.addEventListener('DOMContentLoaded', function () {

    // --- A. Filter Buttons & Live-Suche ---
    // Laufen über die Delegation in Abschnitt 4b (applyFilterUI setzt den aktiven Button).

    // Favoriten UI & Links initialisieren
    initFavButtonsUI();
    updateGalleryLinks();

    // --- B. Hamburger Menü (Mobil) ---
    // Wird bereits vollständig von initHamburgerMenu() (oben) behandelt.

    // --- C. Lightbox & Slideshow & Gesten ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('caption');
    const lbCounter = document.getElementById('lightbox-counter');
    const lbWhatsappBtn = document.getElementById('lightbox-whatsapp-btn');
    const lbShareBtn = document.getElementById('lightbox-share-btn');
    const lbFavBtn = document.getElementById('lightbox-fav-btn');
    let lastFocusedElement = null;

    function preloadNextPrevImages(index) {
        if (!visibleGalleryLinks || visibleGalleryLinks.length <= 1) return;
        const nextIdx = (index + 1) % visibleGalleryLinks.length;
        const prevIdx = (index - 1 + visibleGalleryLinks.length) % visibleGalleryLinks.length;

        [nextIdx, prevIdx].forEach(i => {
            if (visibleGalleryLinks[i]) {
                const img = new Image();
                img.src = lightboxImageSrc(visibleGalleryLinks[i]);
            }
        });
    }

    function openLightbox(index, isFromPopstate = false) {
        if (!lightbox || visibleGalleryLinks.length === 0) return;

        if (!isLightboxOpen) {
            savedGalleryScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
            isLightboxOpen = true;
        }

        lastFocusedElement = document.activeElement;
        document.body.style.overflow = 'hidden';
        currentIndex = index;

        if (currentIndex >= visibleGalleryLinks.length) currentIndex = 0;
        if (currentIndex < 0) currentIndex = visibleGalleryLinks.length - 1;

        lightbox.style.display = 'flex';

        const link = visibleGalleryLinks[currentIndex];
        const item = link.closest('.gallery-item');
        const itemId = item ? item.id : '';
        const imgInside = link.querySelector('img');
        const captionDiv = link.querySelector('.gallery-caption');
        const titleText = captionDiv ? captionDiv.innerText : (imgInside ? imgInside.alt : '');

        if (lightboxImg) {
            lightboxImg.src = lightboxImageSrc(link);
            lightboxImg.alt = titleText;
            lightboxImg.onload = function() {
                adjustWallFrameScale();
            };
        }

        // Populiere Thumbnails in "Weitere Ansichten"
        const thumbFront = document.getElementById('thumb-img-front');
        const thumbSide = document.getElementById('thumb-img-side');
        // Kleine Vorschaukacheln brauchen nicht das 1600-px-Original.
        if (thumbFront) thumbFront.src = artworkVariantSrc(link, 400);
        if (thumbSide) thumbSide.src = artworkVariantSrc(link, 400);

        // Beim ersten Öffnen: Erstmal nur das reine Bild mit der Beschreibung anzeigen
        setLightboxViewAngle('front');
        setLightboxScene('detail');

        // Image Preloading for smooth slideshow navigation
        preloadNextPrevImages(currentIndex);

        // Reset Rotation & Zoom State when opening/changing slide
        currentRotationAngle = 0;
        isZoomActive = false;
        if (lightboxImg) lightboxImg.style.transform = 'rotate(0deg)';

        const zoomBtn = document.getElementById('btn-toggle-zoom');
        if (zoomBtn) zoomBtn.classList.remove('active');
        const lens = document.getElementById('lightbox-magnifier');
        if (lens) lens.style.display = 'none';

        // Infopanel Titel & Beschreibung befüllen
        const infoTitle = document.getElementById('lightbox-info-title');
        const infoDesc = document.getElementById('lightbox-info-description');
        const detailTechnik = document.getElementById('lb-detail-technik');
        const detailMasse = document.getElementById('lb-detail-masse');
        const detailKat = document.getElementById('lb-detail-kat');
        const statusRow = document.getElementById('lb-detail-status-row');
        const statusVal = document.getElementById('lb-detail-status');

        const artMeta = getArtMeta(itemId);

        const realTitle = artMeta ? artMeta.title : (titleText || 'Handgemaltes Unikat');
        const realDesc = artMeta ? artMeta.desc : 'Dieses einzigartige Werk wurde von Manuela Schenk in sorgfältiger Handarbeit gefertigt.';
        const realTechnik = artMeta ? artMeta.technik : 'Acryl / Öl auf Leinwand';
        const realMasse = artMeta ? artMeta.masse : 'Unikatmaß';
        const realKat = artMeta ? artMeta.kategorie : (item ? (item.getAttribute('data-kategorie') || 'Kunstwerk') : 'Kunstwerk');

        const isEn = currentLang === 'en';
        const techniqueTranslations = {
            'Acryl auf Leinwand': 'Acrylic on Canvas',
            'Öl auf Leinwand': 'Oil on Canvas',
            'Multimediatechnik auf Papier': 'Mixed Media on Paper',
            'Ölkreide auf Papier, Rahmen aus Birkenholz': 'Oil Pastel on Paper, Birchwood Frame',
            'Acryl auf Karton': 'Acrylic on Board',
            'Öl auf Karton': 'Oil on Board'
        };
        const categoryTranslations = {
            'landschaften': 'Landscapes',
            'tiere': 'Animals',
            'pflanzen': 'Botanicals',
            'sonstiges': 'Still Life & More'
        };
        const displayTechnik = isEn ? (techniqueTranslations[realTechnik] || realTechnik) : realTechnik;
        const displayKat = isEn ? (categoryTranslations[realKat.toLowerCase()] || (realKat.charAt(0).toUpperCase() + realKat.slice(1))) : (realKat.charAt(0).toUpperCase() + realKat.slice(1));
        if (infoTitle) infoTitle.innerText = realTitle;
        if (infoDesc) infoDesc.innerText = realDesc;
        if (detailTechnik) detailTechnik.innerText = displayTechnik;
        if (detailMasse) detailMasse.innerText = realMasse;
        if (detailKat) detailKat.innerText = displayKat;

        // Verfügbarkeit (optionales Feld "status" in artworks-data.js).
        // Schlüssel: status_verfuegbar, status_reserviert, status_verkauft
        if (statusRow && statusVal) {
            const dict = getI18nDict() || STATUS_TEXTS_DE;
            const statusText = (artMeta && artMeta.status) ? dict['status_' + artMeta.status] : '';
            statusVal.textContent = statusText || '';
            statusRow.classList.toggle('hidden', !statusText);
        }

        if (captionText) {
            captionText.innerHTML = `${realTitle} <span class="caption-meta font-size-085rem color-text-muted">(${displayTechnik}, ${realMasse})</span>`;
        }

        // Bildzähler
        if (lbCounter) {
            lbCounter.innerText = isEn ? `Image ${currentIndex + 1} of ${visibleGalleryLinks.length}` : `Bild ${currentIndex + 1} von ${visibleGalleryLinks.length}`;
        }

        // WhatsApp Link
        if (lbWhatsappBtn) {
            const waMsg = isEn 
                ? `Hello Manuela, I am interested in your artwork "${realTitle}" (${displayTechnik}, ${realMasse}) [#${itemId || 'Gallery'}] from your gallery.`
                : `Hallo Manuela, ich habe Interesse am Kunstwerk "${realTitle}" (${realTechnik}, ${realMasse}) [#${itemId || 'Galerie'}] aus deiner Bildergalerie.`;
            lbWhatsappBtn.href = `https://wa.me/491632662435?text=${encodeURIComponent(waMsg)}`;
        }

        // Share Link Button & Web Share API
        window.shareCurrentArtwork = function() {
            const shareUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, 'Bildergalerie.html') + (itemId ? '#' + itemId : '');
            const shareTitle = `${realTitle} – ManuFAKTUR Schenk`;
            const shareText = isEn
                ? `Check out this hand-painted artwork "${realTitle}" (${displayTechnik}, ${realMasse}) by Manuela Schenk:`
                : `Sieh dir dieses handgemalte Kunstwerk "${realTitle}" (${displayTechnik}, ${realMasse}) von Manuela Schenk an:`;

            if (navigator.share && navigator.canShare && navigator.canShare({ url: shareUrl, title: shareTitle, text: shareText })) {
                navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl
                }).catch((err) => {
                    if (err && err.name !== 'AbortError') {
                        fallbackCopyShareLink(shareUrl);
                    }
                });
            } else {
                fallbackCopyShareLink(shareUrl);
            }
        };

        function fallbackCopyShareLink(url) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(() => {
                    showToast(isEn ? '🔗 Direct link to artwork copied!' : '🔗 Direktlink zum Gemälde kopiert!');
                }).catch(() => {
                    promptCopyFallback(url);
                });
            } else {
                promptCopyFallback(url);
            }
        }

        function promptCopyFallback(url) {
            try {
                const tempInput = document.createElement('input');
                tempInput.value = url;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                showToast(isEn ? '🔗 Direct link to artwork copied!' : '🔗 Direktlink zum Gemälde kopiert!');
            } catch (e) {
                showToast('Link: ' + url);
            }
        }

        if (lbShareBtn) {
            lbShareBtn.onclick = window.shareCurrentArtwork;
        }

        // Favorit Button in Lightbox
        if (lbFavBtn && itemId) {
            const isFav = getFavorites().includes(itemId);
            lbFavBtn.classList.toggle('active', isFav);
            lbFavBtn.innerHTML = isFav 
                ? (isEn ? '<i class="fa-solid fa-heart color-heart"></i> Remove from Favorites' : '<i class="fa-solid fa-heart color-heart"></i> Aus Favoriten entfernen')
                : (isEn ? '<i class="fa-regular fa-heart"></i> Add to Favorites' : '<i class="fa-regular fa-heart"></i> Zu Favoriten hinzufügen');
            lbFavBtn.onclick = function(e) {
                toggleFavorite(itemId, e);
            };
        }

        // Room Visualizer Button in Lightbox: Schaltet den KI-Raumhintergrund ein
        const lbRoomBtn = document.getElementById('lightbox-room-btn');
        if (lbRoomBtn) {
            lbRoomBtn.onclick = function() {
                setLightboxViewAngle('room', document.querySelector('.view-thumb-btn[data-view="room"]'));
                setLightboxScene('livingroom', document.querySelector('.scene-btn[data-scene="livingroom"]'));
                showToast(currentLang === 'en' ? '✨ AI wall preview activated!' : '✨ KI-Wandvorlage im Raum aktiviert!');
            };
        }

        // Lupe / Magnifier Zoom initialisieren
        initLightboxMagnifier();

        // History & Hash in URL setzen (pushState beim ersten Öffnen, replaceState beim Weiterschalten/Slideshow)
        if (!isFromPopstate && window.history) {
            const stateObj = {
                modal: 'lightbox',
                artworkId: itemId,
                galleryFilter: activeCategory || 'alle'
            };
            const targetUrl = itemId ? ('#' + itemId) : (window.location.pathname + window.location.search);

            if (window.history.state && window.history.state.modal === 'lightbox') {
                if (window.history.replaceState) {
                    window.history.replaceState(stateObj, '', targetUrl);
                }
            } else if (window.history.pushState) {
                window.history.pushState(stateObj, '', targetUrl);
            }
        }

        const closeBtn = lightbox.querySelector('.close');
        if (closeBtn) closeBtn.focus();
    }

    // Touch Swipe Steuerung für Mobilgeräte in Lightbox
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    if (lightbox) {
        lightbox.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        lightbox.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        const threshold = 40;
        // Nur horizontal wischen wenn horizontale Bewegung signifikant größer als vertikale ist
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
            if (diffX < 0) {
                changeSlide(1); // Swipe Links -> Nächstes Bild
            } else {
                changeSlide(-1); // Swipe Rechts -> Vorheriges Bild
            }
        }
    }

    // Klicks auf Galerie-Bilder / Karten zuverlässig abfangen
    document.addEventListener('click', function (e) {
        if (e.target.closest('.fav-toggle-btn')) return;

        const galleryItem = e.target.closest('.gallery-item');
        if (galleryItem) {
            const link = galleryItem.querySelector('a');
            if (link) {
                e.preventDefault();
                updateGalleryLinks();
                let index = visibleGalleryLinks.indexOf(link);
                if (index === -1) {
                    visibleGalleryLinks = Array.from(document.querySelectorAll('.gallery-item'))
                        .filter(item => item.style.display !== 'none')
                        .map(item => item.querySelector('a'))
                        .filter(a => a !== null);
                    index = visibleGalleryLinks.indexOf(link);
                }
                if (index !== -1) {
                    openLightbox(index);
                }
            }
        }
    });

    // "Ähnliches anfragen" Button in Lightbox
    const lightboxInquiryBtn = document.getElementById('lightbox-inquiry-btn');
    if (lightboxInquiryBtn) {
        lightboxInquiryBtn.addEventListener('click', function () {
            if (visibleGalleryLinks.length > 0 && visibleGalleryLinks[currentIndex]) {
                const link = visibleGalleryLinks[currentIndex];
                const img = link.querySelector('img');
                const item = link.closest('.gallery-item');
                const kat = item ? (item.getAttribute('data-kategorie') || '') : '';
                // URL-Parameter bleiben deutsch: Titel aus den Basisdaten, nicht aus der Übersetzung.
                const meta = (item && typeof ARTWORKS_METADATA !== 'undefined') ? ARTWORKS_METADATA[item.id] : null;
                const refTitle = meta ? meta.title : (img ? (img.title || img.alt || '') : '');
                window.location.href = `Auftrag.html?ref=${encodeURIComponent(refTitle)}&kat=${encodeURIComponent(kat)}`;
            } else {
                window.location.href = 'Auftrag.html';
            }
        });
    }

    // Pfeil-Navigation global verfügbar machen
    window.changeSlide = function (n) {
        openLightbox(currentIndex + n);
    };

    // Default Share-Funktion für den Fall, dass sie vor dem ersten Lightbox-Öffnen aufgerufen wird
    if (!window.shareCurrentArtwork) {
        window.shareCurrentArtwork = function() {
            if (visibleGalleryLinks && visibleGalleryLinks[currentIndex]) {
                openLightbox(currentIndex);
            }
        };
    }

    // Schließen & Scroll-Restaurierung
    closeLightboxUI = function (triggerHistoryBack = true) {
        if (!lightbox || !isLightboxOpen) return;

        lightbox.style.display = 'none';
        isLightboxOpen = false;
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';

        // Exakte Scrollposition der Galerie wiederherstellen
        if (typeof savedGalleryScrollY === 'number') {
            window.scrollTo({
                top: savedGalleryScrollY,
                left: 0,
                behavior: 'instant'
            });
        }

        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }

        if (triggerHistoryBack && window.history) {
            if (window.history.state && window.history.state.modal === 'lightbox') {
                isClosingLightboxFromPopstate = true;
                window.history.back();
            } else if (window.history.replaceState) {
                window.history.replaceState(
                    { galleryFilter: activeCategory || 'alle' },
                    '',
                    window.location.pathname + window.location.search
                );
            }
        }
    };

    const closeLightboxFn = function () {
        closeLightboxUI(true);
    };
    window.closeLightbox = closeLightboxFn;

    if (lightbox) {
        const closeBtn = lightbox.querySelector('.close');
        // <button>: Enter/Leertaste lösen bereits nativ einen Klick aus.
        if (closeBtn) closeBtn.addEventListener('click', closeLightboxFn);

        lightbox.addEventListener('click', function (event) {
            if (event.target === lightbox) {
                closeLightboxFn();
            }
        });
    }

    // Tastaturbedienung für die Lightbox (ignoriert Texteingaben)
    document.addEventListener('keydown', function (e) {
        if (lightbox && (lightbox.style.display === 'flex' || lightbox.style.display === 'block')) {
            if (e.key === 'Tab') {
                trapFocus(lightbox, e);
                return;
            }
            const activeTag = document.activeElement ? document.activeElement.tagName : '';
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;
            if (e.key === 'Escape') {
                closeLightboxFn();
            } else if (e.key === 'ArrowRight') {
                changeSlide(1);
            } else if (e.key === 'ArrowLeft') {
                changeSlide(-1);
            }
        }
    });

    // Deep-Link Prüfung auf Seitenaufruf (#DSC_6622a)
    function checkDeepLink() {
        const hash = window.location.hash ? window.location.hash.substring(1) : '';
        if (hash) {
            const targetItem = document.getElementById(hash);
            if (targetItem) {
                const link = targetItem.querySelector('a');
                if (link) {
                    setTimeout(() => {
                        updateGalleryLinks();
                        const index = visibleGalleryLinks.indexOf(link);
                        if (index !== -1) openLightbox(index);
                    }, 250);
                }
            }
        }
    }
    checkDeepLink();

    // --- D. FAQ Akkordeon ---
    const accHeaders = document.querySelectorAll('.accordion-header');
    accHeaders.forEach(header => {
        header.setAttribute('aria-expanded', 'false');
        header.addEventListener('click', function () {
            const active = this.classList.toggle('active');
            this.setAttribute('aria-expanded', active ? 'true' : 'false');
            const content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    // --- E. Nach oben Button ---
    const backToTopButton = document.querySelector('.back-to-top');
    if (backToTopButton) {
        const updateBackToTop = function () {
            const show = document.body.scrollTop > 200 || document.documentElement.scrollTop > 200;
            backToTopButton.style.display = show ? 'flex' : 'none';
        };
        window.addEventListener('scroll', updateBackToTop, { passive: true });
        updateBackToTop();
    }

    // --- F. 3D Visitenkarte & Postkarte Flipping ---
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
        card.addEventListener('click', function () {
            this.classList.toggle('flipped');
        });
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.classList.toggle('flipped');
            }
        });
    });

    // --- G. Rechtsklick-Schutz (Toast) ---
    document.addEventListener('contextmenu', function (e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            showToast(currentLang === 'en' ? 'Copyright protected © Manuela Schenk' : 'Urheberrechtlich geschützt © Manuela Schenk');
        }
    });

    // --- H. Kontaktformular: URL-Parameter auslesen & Formular vorausfüllen ---
    prefillContactForm();

    // (Kontaktformular-Versand wird in runOnDOMReady über initContactForm eingerichtet.)

    initReveal();

}); // Ende DOMContentLoaded


/* =========================================
   4. GLOBALE HILFSFUNKTIONEN
   ========================================= */

// Nach oben scrollen
function topFunction() {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

// Reveal-Animation: Abschnitte einblenden, sobald sie ins Bild kommen.
// IntersectionObserver statt Scroll-Listener – kein Layout-Lesen bei jedem Scroll-Ereignis.
function initReveal() {
    const reveals = document.querySelectorAll('.reveal:not(.active)');
    if (reveals.length === 0) return;

    if (!('IntersectionObserver' in window)) {
        reveals.forEach(el => el.classList.add('active'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -80px 0px' });

    reveals.forEach(el => observer.observe(el));
}

// Flyer Modal
closeFlyerModalUI = function (triggerHistoryBack = true) {
    const modal = document.getElementById('flyerModal');
    if (modal && isFlyerModalOpen) {
        modal.style.display = 'none';
        isFlyerModalOpen = false;
        document.body.style.overflow = '';

        if (triggerHistoryBack && window.history && window.history.state && window.history.state.modal === 'flyer') {
            isClosingLightboxFromPopstate = true;
            window.history.back();
        }
    }
};

function openFlyerModal(element) {
    const modal = document.getElementById('flyerModal');
    const modalImg = document.getElementById('modalImg');
    if (modal && modalImg) {
        modal.style.display = 'flex';
        modalImg.src = element.src;
        document.body.style.overflow = 'hidden';
        isFlyerModalOpen = true;

        if (window.history && window.history.pushState) {
            window.history.pushState({ modal: 'flyer' }, '', window.location.href);
        }

        const closeBtn = modal.querySelector('.close');
        if (closeBtn) closeBtn.focus();
    }
}

function closeFlyerModal() {
    closeFlyerModalUI(true);
}

// Esc-Taste schließt auch das Flyer-Modal; Tab bleibt im Dialog
document.addEventListener('keydown', function (e) {
    const modal = document.getElementById('flyerModal');
    if (modal && isFlyerModalOpen) {
        if (e.key === 'Escape') closeFlyerModal();
        else if (e.key === 'Tab') trapFocus(modal, e);
    }
});

/**
 * Fokusfalle für modale Dialoge (WCAG 2.4.3): Tab/Umschalt+Tab springen
 * vom letzten zum ersten bedienbaren Element des Dialogs und umgekehrt.
 */
function trapFocus(container, e) {
    const focusable = Array.from(container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.getClientRects().length > 0 && !el.closest('.hidden'));
    if (focusable.length === 0) { e.preventDefault(); return; }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (!container.contains(active)) {
        e.preventDefault();
        first.focus();
    } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
    }
}

// Toast Nachricht anzeigen
let toastTimer = null;
function showToast(message) {
    const x = document.getElementById('toast');
    if (x) {
        if (message) {
            // Nur als Text einsetzen – Meldungen können URLs oder andere Nutzerdaten enthalten.
            const icon = document.createElement('i');
            icon.className = 'fa fa-info-circle';
            icon.setAttribute('aria-hidden', 'true');
            x.replaceChildren(icon, ' ' + message);
        }
        x.className = 'show';
        // Schnell aufeinanderfolgende Meldungen sollen sich nicht gegenseitig vorzeitig ausblenden.
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { x.className = ''; }, 3000);
    }
}

// DSGVO Zwei-Klick Google Maps
window.loadGoogleMap = function () {
    const container = document.getElementById('map-container');
    if (container) {
        container.innerHTML = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2527.233853688376!2d7.134801276840789!3d50.69704476957748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bee3f119f2ffc1%3A0xc9c318a1fed01d18!2sR%C3%BCdesheimer%20Str.%2014%2C%2053175%20Bonn!5e0!3m2!1sde!2sde!4v1766414742106!5m2!1sde!2sde" width="100%" height="380" class="gmap-iframe" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Google Maps Karte vom Standort von ManuFAKTUR Schenk in Bonn"></iframe>';
    }
};

/* =========================================
   4b. KLICK-DELEGATION (ersetzt vormalige inline
   onclick/oninput/onchange/oncontextmenu-Attribute für CSP)
   ========================================= */
document.addEventListener('contextmenu', function (e) {
    if (e.target.matches('img[draggable="false"]')) e.preventDefault();
});

document.addEventListener('click', function (e) {
    if (e.target.closest('.back-to-top')) { topFunction(); return; }
    if (e.target.closest('#load-map-btn')) { window.loadGoogleMap(); return; }

    // Footer wird bei jedem Sprachwechsel neu aufgebaut – deshalb delegiert.
    if (e.target.closest('#theme-toggle-btn')) { toggleTheme(); return; }
    if (e.target.closest('#lang-toggle-btn')) { toggleLanguage(); return; }

    if (e.target.closest('#lightbox .prev')) { window.changeSlide(-1); return; }
    if (e.target.closest('#lightbox .next')) { window.changeSlide(1); return; }

    const sceneBtn = e.target.closest('.scene-btn[data-scene]');
    if (sceneBtn) { setLightboxScene(sceneBtn.dataset.scene, sceneBtn); return; }

    const viewBtn = e.target.closest('.view-thumb-btn[data-view]');
    if (viewBtn) { setLightboxViewAngle(viewBtn.dataset.view, viewBtn); return; }

    if (e.target.closest('#btn-rotate-img')) { rotateLightboxImage(90); return; }
    if (e.target.closest('#btn-toggle-zoom')) { toggleLightboxZoom(); return; }
    if (e.target.closest('#btn-reset-pos')) { resetWallFramePosition(); return; }
    if (e.target.closest('#lightbox-share-btn')) { window.shareCurrentArtwork(); return; }

    if (e.target.closest('.flyer-image')) { openFlyerModal(e.target.closest('.flyer-image')); return; }
    if (e.target.closest('#flyerModal')) { closeFlyerModal(); return; }

    if (e.target.closest('#clear-search-btn')) { clearGallerySearch(); return; }
    const filterBtn = e.target.closest('.filter-btn[data-filter]');
    if (filterBtn) { filterSelection(filterBtn.dataset.filter); return; }
});

document.addEventListener('input', function (e) {
    if (e.target.id === 'lb-scale-slider') updateLbWallScale(e.target.value);
    if (e.target.id === 'gallery-search') filterGallery();
});

document.addEventListener('change', function (e) {
    if (e.target.id === 'gallery-sort-select') sortGallery(e.target.value);
});

/* =========================================
   5. KONTAKTFORMULAR: URL-PARAMETER AUSLESEN
   ========================================= */
function prefillContactForm() {
    const params = new URLSearchParams(window.location.search);
    const motiv = params.get('motiv');
    const format = params.get('format');
    const technik = params.get('technik');
    const preis = params.get('preis');
    const referenz = params.get('ref');

    if (!motiv && !format && !technik) return; // Keine Parameter → nichts tun

    // Betreff-Auswahl vorbelegen
    const subjectSelect = document.getElementById('subject');
    if (subjectSelect) {
        // Passende Option suchen oder neue hinzufügen
        const matchMap = {
            'Tierportrait': 'Auftragsarbeit Tierportrait',
            'Landschaft': 'Auftragsarbeit Landschaft',
        };
        const targetValue = matchMap[motiv] || 'Allgemeine Anfrage';
        for (const option of subjectSelect.options) {
            if (option.value === targetValue) {
                option.selected = true;
                break;
            }
        }
    }

    // Nachricht vorausfüllen
    const messageField = document.getElementById('message');
    if (messageField) {
        const preisText = preis ? `\n• Geschätzter Preis: ${preis}` : '';
        const referenzText = referenz ? `\n• Referenz-Gemälde aus der Galerie: ${referenz.slice(0, 200)}` : '';
        messageField.value =
            `Hallo Manuela,\n\nüber den Auftrags-Konfigurator habe ich folgende Auswahl getroffen:\n\n` +
            `• Motiv: ${motiv || '–'}\n` +
            `• Format: ${format || '–'}\n` +
            `• Technik: ${technik || '–'}${referenzText}${preisText}\n\n` +
            `Bitte melde dich bei mir für die genaue Abstimmung.\n\nViele Grüße`;
    }

    // Hinweis-Banner anzeigen
    const prefillBanner = document.getElementById('prefill-banner');
    if (prefillBanner) {
        prefillBanner.style.display = 'flex';
    }
}

/* =========================================
   6. KONTAKTFORMULAR: ERFOLGSMELDUNG
   ========================================= */
const CONTACT_EMAIL = 'manufaktur-malerei@web.de';
const CONTACT_MIN_FILL_MS = 3000;

/** mailto:-Link mit Betreff und bereits getippter Nachricht, damit bei einem Fehler nichts verloren geht. */
function buildContactMailtoHref(form) {
    const field = name => {
        const el = form.elements[name];
        return el && typeof el.value === 'string' ? el.value.trim() : '';
    };
    const subject = field('subject') || 'Anfrage über die Website';
    const body = [field('message'), field('name'), field('email')]
        .filter(Boolean).join('\n\n').slice(0, 1500);
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form || form.dataset.initContactForm) return;
    form.dataset.initContactForm = 'true';
    const shownAt = Date.now();

    form.addEventListener('submit', async function (e) {
        const action = form.getAttribute('action');
        const isEn = currentLang === 'en';

        const accessKey = form.querySelector('input[name="access_key"]');
        if (!action || !accessKey || !accessKey.value || accessKey.value === 'DEIN_WEB3FORMS_KEY') {
            e.preventDefault();
            const msg = isEn
                ? '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> The contact form is not yet configured with an access key. Please email directly to <a href="mailto:manufaktur-malerei@web.de">manufaktur-malerei@web.de</a>'
                : '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Das Formular ist noch nicht vollständig konfiguriert. Bitte schreibe direkt an <a href="mailto:manufaktur-malerei@web.de">manufaktur-malerei@web.de</a>';
            showFormFeedback('error', msg);
            return;
        }

        e.preventDefault();

        // Honeypot: ein Mensch sieht das Feld nicht. Bots bekommen scheinbar Erfolg, es wird aber nichts gesendet.
        const honeypot = form.querySelector('input[name="botcheck"]');
        if (honeypot && honeypot.checked) return;

        // Zu schnell abgeschickt (Bots füllen und senden sofort): erst nach kurzer Zeit erneut versuchen lassen.
        if (Date.now() - shownAt < CONTACT_MIN_FILL_MS) {
            showFormFeedback('error', isEn
                ? '<i class="fa fa-exclamation-circle" aria-hidden="true"></i> Please check your entries and click “Send Message” again.'
                : '<i class="fa fa-exclamation-circle" aria-hidden="true"></i> Bitte prüfe kurz deine Angaben und klicke dann erneut auf „Nachricht senden“.');
            return;
        }

        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> ${isEn ? 'Sending...' : 'Sende...'}`;
        }

        try {
            const data = new FormData(form);
            const response = await fetch(action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            const result = await response.json().catch(() => null);

            if (response.ok && (!result || result.success !== false)) {
                form.reset();
                const successMsg = isEn
                    ? '<i class="fa fa-check-circle" aria-hidden="true"></i> Thank you! Your inquiry has been sent successfully. I will get back to you shortly.'
                    : '<i class="fa fa-check-circle" aria-hidden="true"></i> Vielen Dank! Deine Nachricht wurde gesendet. Ich melde mich bald bei dir.';
                showFormFeedback('success', successMsg);
            } else {
                const errorDetail = result && result.message ? ` (${result.message})` : '';
                const errorMsg = isEn
                    ? `<i class="fa fa-exclamation-circle" aria-hidden="true"></i> An error occurred while sending${errorDetail}. Please try again or contact me directly at <a href="${buildContactMailtoHref(form)}">manufaktur-malerei@web.de</a>`
                    : `<i class="fa fa-exclamation-circle" aria-hidden="true"></i> Es ist ein Fehler aufgetreten${errorDetail}. Bitte versuche es erneut oder schreibe direkt an <a href="${buildContactMailtoHref(form)}">manufaktur-malerei@web.de</a>`;
                showFormFeedback('error', errorMsg);
            }
        } catch {
            const connMsg = isEn
                ? `<i class="fa fa-exclamation-circle" aria-hidden="true"></i> Connection error. Please contact me directly at <a href="${buildContactMailtoHref(form)}">manufaktur-malerei@web.de</a>`
                : `<i class="fa fa-exclamation-circle" aria-hidden="true"></i> Verbindungsfehler. Bitte schreibe direkt an <a href="${buildContactMailtoHref(form)}">manufaktur-malerei@web.de</a>`;
            showFormFeedback('error', connMsg);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa fa-paper-plane" aria-hidden="true"></i> ${isEn ? 'Send Message' : 'Nachricht senden'}`;
            }
        }
    });
}

function showFormFeedback(type, message) {
    let feedback = document.getElementById('form-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'form-feedback';
        feedback.setAttribute('role', 'alert');
        feedback.setAttribute('aria-live', 'polite');
        const form = document.querySelector('.contact-form');
        if (form) form.insertAdjacentElement('afterend', feedback);
    }
    feedback.className = `form-feedback form-feedback--${type}`;
    feedback.innerHTML = message;
    feedback.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
}

/* =========================================
   7. NEUE FEATURES INITIALISIERUNG
   ========================================= */

// Favoriten-Auswahl in Step 1 des Auftrags-Konfigurators
function initFavoritesInConfigurator() {
    const favContainer = document.getElementById('config-saved-favorites');
    if (!favContainer) return;

    const favIds = getFavorites();
    if (favIds.length === 0) {
        favContainer.classList.add('hidden');
        return;
    }

    const grid = favContainer.querySelector('.fav-cards-grid');
    if (!grid || typeof ARTWORKS_METADATA === 'undefined') return;

    grid.replaceChildren();
    favIds.forEach(id => {
        // Favoriten stammen aus localStorage: nur bekannte Werk-IDs anzeigen.
        const baseMeta = Object.prototype.hasOwnProperty.call(ARTWORKS_METADATA, id) ? ARTWORKS_METADATA[id] : null;
        if (!baseMeta) return;
        const title = getArtMeta(id).title;
        const folder = id.startsWith('bild') ? 'artworks' : 'img';

        const card = document.createElement('div');
        card.className = 'fav-card-item';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-pressed', 'false');

        const img = document.createElement('img');
        img.src = `assets/images/${folder}/thumbs/${id}-400w.webp`;
        img.alt = '';
        img.loading = 'lazy';
        const caption = document.createElement('div');
        caption.className = 'fav-thumb-caption';
        caption.textContent = title;
        card.append(img, caption);

        const select = function () {
            grid.querySelectorAll('.fav-card-item').forEach(c => {
                c.classList.remove('selected');
                c.setAttribute('aria-pressed', 'false');
            });
            card.classList.add('selected');
            card.setAttribute('aria-pressed', 'true');
            // Intern bleibt der deutsche Titel gespeichert, angezeigt wird die aktive Sprache.
            showConfigReference(baseMeta.title, title);
        };
        card.addEventListener('click', select);
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                select();
            }
        });
        grid.appendChild(card);
    });

    favContainer.classList.toggle('hidden', grid.children.length === 0);
}

/**
 * Merkt das Referenz-Gemälde im Konfigurator-Zustand und zeigt es in Schritt 1 an.
 * Der Titel kann aus der URL stammen und wird deshalb nur als Text eingefügt.
 */
function showConfigReference(refTitle, displayTitle) {
    if (typeof state !== 'undefined' && state) {
        state.referenz = refTitle;
        if (typeof saveConfig === 'function') saveConfig();
    }
    const hintEl = document.getElementById('hint-1');
    if (!hintEl) return;
    const icon = document.createElement('i');
    icon.className = 'fa fa-circle-info';
    icon.setAttribute('aria-hidden', 'true');
    const strong = document.createElement('strong');
    strong.textContent = displayTitle || refTitle;
    const label = currentLang === 'en' ? 'Selected reference painting' : 'Ausgewählte Motiv-Referenz';
    hintEl.replaceChildren(icon, ` ${label}: `, strong);
    hintEl.style.display = 'block';
    hintEl.style.color = 'var(--primary-color)';
}

// Client Foto Upload Vorschau in Step 4 des Konfigurators
function initPhotoUploadPreview() {
    const fileInput = document.getElementById('client-photo-input');
    const previewBox = document.getElementById('photo-preview-box');
    const previewImg = document.getElementById('photo-preview-img');
    const fileNameText = document.getElementById('photo-file-name');

    if (fileInput && previewBox && previewImg) {
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                if (file.size > 10 * 1024 * 1024) {
                    showToast(currentLang === 'en' ? 'Note: File is larger than 10 MB.' : 'Hinweis: Datei ist größer als 10 MB.');
                }
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    if (fileNameText) fileNameText.innerText = `${file.name} (${Math.round(file.size / 1024)} KB)`;
                    previewBox.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            } else {
                previewBox.style.display = 'none';
            }
        });
    }
}

// Service Worker Registrieren
function registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('sw.js').then(reg => {
            console.log('Service Worker registriert:', reg.scope);
        }).catch(err => {
            console.warn('Service Worker Info:', err);
        });
    }
}

// URL-Parameter für Auftrag.html verarbeiten
function initUrlParamPrefill() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const kat = params.get('kat');

    if (ref || kat) {
        const optionCards = document.querySelectorAll('.option-card');
        if (optionCards.length > 0 && kat) {
            const katLower = kat.toLowerCase();
            optionCards.forEach(card => {
                const val = (card.getAttribute('data-value') || '').toLowerCase();
                const isMatch = (
                    (katLower.includes('land') && val.includes('land')) ||
                    (katLower.includes('tier') && val.includes('tier')) ||
                    (katLower.includes('pflanz') && (val.includes('still') || val.includes('pflanz'))) ||
                    (katLower.includes('sonstig') && val.includes('sonstig')) ||
                    val.includes(katLower) || katLower.includes(val)
                );
                if (isMatch) {
                    card.click();
                }
            });
        }
        
        if (ref && document.getElementById('hint-1')) {
            showConfigReference(ref.slice(0, 200));
        }
    }
}

// Testimonials Karussell
function initTestimonialsCarousel() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.testimonial-dot');
    const prevBtn = document.getElementById('testi-prev');
    const nextBtn = document.getElementById('testi-next');

    const pauseBtn = document.getElementById('testi-pause');
    const container = document.getElementById('testimonial-container');
    const section = document.getElementById('testimonials-carousel');

    if (slides.length === 0) return;

    let currentSlide = 0;
    let timer = null;
    // WCAG 2.2.2: Automatischer Wechsel ist abschaltbar; bei „Bewegung reduzieren“ startet er gar nicht.
    let userPaused = prefersReducedMotion();
    let hoverPaused = false;

    function showSlide(index) {
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach((s, i) => {
            s.classList.toggle('active', i === currentSlide);
            s.setAttribute('aria-hidden', i === currentSlide ? 'false' : 'true');
        });
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === currentSlide);
            if (i === currentSlide) d.setAttribute('aria-current', 'true');
            else d.removeAttribute('aria-current');
        });
    }

    function updateTimer() {
        clearInterval(timer);
        timer = null;
        const running = !userPaused && !hoverPaused;
        if (running) timer = setInterval(() => showSlide(currentSlide + 1), 6000);
        // Während des automatischen Wechsels nicht jede Folie vorlesen, sonst schon.
        if (container) container.setAttribute('aria-live', running ? 'off' : 'polite');
        if (pauseBtn) {
            pauseBtn.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
            const icon = pauseBtn.querySelector('i');
            if (icon) icon.className = userPaused ? 'fa fa-play' : 'fa fa-pause';
        }
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { showSlide(currentSlide + 1); updateTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { showSlide(currentSlide - 1); updateTimer(); });
    if (pauseBtn) pauseBtn.addEventListener('click', () => { userPaused = !userPaused; updateTimer(); });

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => { showSlide(idx); updateTimer(); });
    });

    // Beim Lesen (Maus darüber oder Tastaturfokus im Bereich) nicht weiterblättern.
    if (section) {
        const pause = () => { hoverPaused = true; updateTimer(); };
        const resume = () => { hoverPaused = false; updateTimer(); };
        section.addEventListener('mouseenter', pause);
        section.addEventListener('mouseleave', resume);
        section.addEventListener('focusin', pause);
        section.addEventListener('focusout', (e) => {
            if (!section.contains(e.relatedTarget)) resume();
        });
    }

    showSlide(0);
    updateTimer();
}

function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

function runOnDOMReady(fn) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        fn();
    }
}

runOnDOMReady(function () {
    initHamburgerMenu();
    updateThemeButtonUI();
    updateLanguageButtonUI();
    if (currentLang !== 'de') {
        whenI18nReady(currentLang, () => applyTranslations(currentLang));
    }
    initFavoritesInConfigurator();
    initPhotoUploadPreview();
    initUrlParamPrefill();
    initContactForm();
    initTestimonialsCarousel();
    initWallFrameDragLogic();
    registerServiceWorker();
});

/* =========================================
   8. GALERIE-FILTER START
   ========================================= */
runOnDOMReady(function () {
    if (document.getElementById('filter-container')) {
        const hash = window.location.hash ? window.location.hash.substring(1) : '';
        if (window.history && window.history.replaceState && (!window.history.state || !window.history.state.galleryFilter)) {
            if (hash) {
                window.history.replaceState({ galleryFilter: 'alle' }, '', window.location.pathname + window.location.search);
            } else {
                window.history.replaceState({ galleryFilter: 'alle' }, '', window.location.href);
            }
        }
        filterSelection('alle', true);
    }
});