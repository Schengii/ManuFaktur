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
    
    applyTranslations(currentLang);
    updateLanguageButtonUI();
    updateThemeButtonUI();
    
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
        { href: 'Home.html', icon: 'fa fa-home', label: isEn ? 'Home' : 'Start' },
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

/* =========================================
   BILINGUAL TRANSLATION DICTIONARY
   ========================================= */
const I18N_DICTIONARY = {
    de: {
        skip_link: 'Zum Hauptinhalt springen',
        back_to_top: 'Nach oben',
        home_welcome_title: 'Herzlich Willkommen',
        home_welcome_text: 'Hier entstehen meine Bilder, alle von mir in liebevoller Detailarbeit handgemalt.<br>Qualität und Individualität sind mein Markenzeichen. Ich male für Dich Tierportraits oder Landschaften.',
        badge_handpainted: '100% Handgemalt',
        badge_studio: 'Atelier aus Bonn',
        badge_shipping: 'Sicherer Versand in DE',
        badge_detail: 'Liebevolle Detailarbeit',
        highlights_title: 'Aktuelle Highlights',
        highlights_intro: 'Eine kleine Auswahl meiner neuesten Gemälde.',
        testimonials_title: 'Das sagen meine Kunden',
        testimonials_intro: 'Echte Erfahrungen & Rückmeldungen von begeisterten Meistbestellern:',
        cta_text: 'Entdecke die Vielfalt handgemalter Originale oder lass Dein ganz persönliches Wunschmotiv anfertigen.',
        about_page_title: 'Über mich',
        about_intro: 'Lerne die Künstlerin hinter den Bildern kennen.',
        about_profile_title: 'Steckbrief',
        about_lbl_loc: 'Wohnort:',
        about_lbl_dog: 'Frauchen von:',
        about_lbl_motifs: 'Motive:',
        about_lbl_tech: 'Techniken:',
        about_lbl_edu: 'Ausbildung:',
        about_lbl_motive: 'Motivation:',
        about_profile_loc: 'Bonn (Bad Godesberg)',
        about_profile_dog: 'Balou',
        about_profile_motifs: 'Tierportraits, Lieblingsorte & Landschaften',
        about_profile_tech: 'Acryl, Öl, Ölkreide, Mischtechniken',
        about_profile_edu: 'Alanus Hochschule Alfter, Art Studio Bonn-Friesdorf',
        about_profile_motive: 'Freude am Festhalten lebendiger Emotionen & Momente',
        about_greeting: 'Hallo, ich bin Manuela,',
        about_subtitle: '...Künstlerin aus Bonn, Hundeliebhaberin und Frauchen von Balou',
        about_p1: 'Ich liebe es, <strong>besondere Momente</strong>, <strong>Tiere</strong> oder <strong>Landschaften</strong> mit Pinsel und lebendigen Farben auf Leinwand oder handgeschöpftem Papier festzuhalten.',
        about_p2: 'Meine Werke erzählen Geschichten: sei es der treue Blick eines Hundes, die Weite der französischen Atlantikküste oder historische Impressionen meiner Heimat Bonn und des Siebengebirges.',
        about_p3: 'Ich male das, was mich berührt und fasziniert – in traditioneller <strong>Ölmalerei</strong>, leuchtenden <strong>Acrylfarben</strong> sowie feinen <strong>Ölkreide- und Multimediatechniken</strong>.',
        about_p4: 'Jedes Bild ist ein handgemaltes Unikat, welches mit viel Liebe zum Detail und fundiertem künstlerischen Handwerk entsteht.',
        about_p5: 'Gerne male ich auch Dein persönliches Wunschmotiv! Schau Dir meine <a href="Leistungen.html">Leistungen</a> an oder schreibe mir direkt über das <a href="Kontakt.html">Kontaktformular</a>.',
        services_page_title: 'Leistungen',
        services_intro: 'Individuelle Kunstwerke, ganz nach deinen Vorstellungen gestaltet.',
        services_offer_title: 'Was ich anbiete',
        service_dog_title: 'Dein Hund auf Leinwand',
        service_dog_desc: 'Du hast Dir schon immer mal ein einzigartiges Portrait Deines treuen Begleiters gewünscht? Egal ob weißer Malteser oder schwarzer Labrador - jeder Hund ist ein besonderes Motiv.',
        service_pets_title: 'Weitere tierische Freunde',
        service_pets_desc: 'Natürlich male ich nicht nur Hunde! Auch andere tierische Familienmitglieder wie Papageien, Katzen oder auch Wildtiere sind wunderbare Motive für ausdrucksstarke Gemälde.',
        service_places_title: 'Deine Lieblingsorte',
        service_places_desc: 'Besondere Landschaften und Orte haben eine ganz eigene Magie. Wenn du solche Lieblingsorte hast, zaubere ich sie Dir als dauerhaftes Erinnerungsstück auf Leinwand.',
        service_formats_title: 'Mögliche Formate',
        service_formats_desc: 'Für Dein einzigartiges Kunstwerk biete ich verschiedene Größen und Formate an. Da alle Bilder mit viel Zeit und Liebe gemalt werden, mache ich Dir auf Anfrage gerne ein individuelles Angebot.',
        faq_title: 'Häufig gestellte Fragen (FAQ)',
        faq_1_q: 'Was kostet ein Bild?',
        faq_1_a: 'Der Preis gestaltet sich nach Größe des Bildes. Die Bezahlung erfolgt gegen Vorkasse (inkl. Porto und Verpackung).',
        faq_2_q: 'Wie lange dauert die Erstellung eines Bildes?',
        faq_2_a: 'Je nach Technik (Acryl trocknet schneller als Öl) und aktueller Auftragslage dauert die Fertigstellung in der Regel einige Wochen. Bitte bestelle rechtzeitig, wenn es ein Geschenk sein soll!',
        faq_4_q_cancellation: 'Widerrufsrecht bei Auftragsarbeiten',
        faq_4_a_cancellation: 'Bei individuell nach Deinen persönlichen Wünschen und Vorgaben angefertigten Kunstwerken (wie z.&nbsp;B. Tierportraits nach Fotovorlage) besteht gemäß §&nbsp;312g Abs.&nbsp;2 Nr.&nbsp;1 BGB kein gesetzliches Widerrufsrecht, da das Werk ein eindeutig auf Dich zugeschnittenes Unikat ist. Vor Beginn und während des Malprozesses stimme ich aber alle Details und Zwischenschritte eng mit Dir ab, damit Du mit Deinem Ergebnis wunschlos glücklich bist.',
        gallery_page_title: 'Bildergalerie',
        gallery_intro: 'Entdecke meine handgemalten Unikate aus verschiedenen Schaffensphasen.',
        filter_all: 'Alle Werke',
        filter_animals: 'Tiere',
        filter_landscapes: 'Landschaften',
        filter_plants: 'Pflanzen',
        filter_other: 'Sonstiges',
        filter_favorites: 'Favoriten',
        search_placeholder: 'Gemälde, Motive oder Techniken durchsuchen...',
        sort_label: 'Sortierung:',
        sort_aria: 'Galerie sortieren',
        sort_default: 'Standard',
        sort_newest: 'Neueste zuerst',
        sort_title_asc: 'Titel (A-Z)',
        sort_title_desc: 'Titel (Z-A)',
        gallery_empty_fav_title: 'Noch keine Favoriten gemerkt.',
        gallery_empty_fav_text: 'Klicke auf das Herz-Symbol auf den Kunstwerken, um deine persönlichen Lieblingswerke hier zu speichern.',
        gallery_empty_search_title: 'Keine passenden Gemälde gefunden.',
        gallery_empty_search_text: 'Versuche es mit einem anderen Suchbegriff oder setze den Kategorie-Filter zurück.',
        scene_label: 'KI-Wandvorlage:',
        scene_label_short: 'KI-Wandvorlage',
        scene_living: 'Wohnzimmer',
        scene_living_title: 'Wohnzimmer-Wand',
        scene_bedroom: 'Schlafzimmer',
        scene_bedroom_title: 'Schlafzimmer-Wand',
        scene_loft: 'Loft / Beton',
        scene_loft_title: 'Dark Loft Wand',
        scene_lounge: 'Beige Lounge',
        scene_lounge_title: 'Beige Lounge Wand',
        scene_pure: 'Pur (Detail)',
        scene_pure_title: 'Pur ohne Hintergrund',
        wall_drag_hint: 'Ziehen zum Verschieben',
        lb_rotate_title: 'Um 90° drehen',
        lb_rotate_aria: 'Bild um 90 Grad drehen',
        lb_zoom_title: 'Lupe aktivieren/deaktivieren',
        lb_zoom_aria: 'Lupe aktivieren',
        lb_scale_label: 'Skalierung:',
        lb_scale_aria: 'Gemäldegröße an der Wand skalieren',
        lb_center_title: 'Gemäldeposition auf der Wand zentrieren',
        lb_label_technik: 'Technik:',
        lb_label_masse: 'Maße / Format:',
        lb_label_kat: 'Kategorie:',
        lb_label_herkunft: 'Herkunft:',
        lb_val_herkunft: 'Atelier Bonn',
        lb_label_rahmung: 'Rahmung:',
        lb_label_status: 'Verfügbarkeit:',
        status_verfuegbar: 'Verfügbar',
        status_reserviert: 'Reserviert',
        status_verkauft: 'Verkauft – gerne male ich Dir ein ähnliches Motiv',
        lb_val_rahmung: 'Sofort aufhängbar (Keilrahmen)',
        lb_views_title: 'Weitere Ansichten:',
        lb_view_front: 'Frontansicht',
        lb_view_front_title: 'Frontansicht Pur',
        lb_view_room: 'Wandansicht',
        lb_view_room_title: 'Wand & Raumansicht',
        lb_view_back: 'Keilrahmen',
        lb_view_back_title: 'Rückseite & Keilrahmen',
        lb_view_side: '3D-Perspektive',
        lb_view_side_title: '3D-Seitenansicht & Textur',
        lb_view_artist: 'Atelier',
        lb_view_artist_title: 'Künstlerin & Atelier',
        lb_inquiry_aria: 'Dieses Motiv als Auftrag anfragen',
        lb_fav_default: 'Zu Favoriten',
        clear_search_aria: 'Suche zurücksetzen',
        lb_btn_inquiry: 'Motiv als Auftrag anfragen',
        lb_btn_room: 'In deinem Raum ansehen',
        lb_btn_fav_add: 'Zu Favoriten hinzufügen',
        lb_btn_fav_remove: 'Aus Favoriten entfernen',
        lb_share_btn: 'Gemälde teilen',
        lb_share_aria: 'Gemälde teilen',
        lb_rotate: '90° Drehen',
        lb_zoom: 'Lupe Zoom',
        lb_center: 'Zentrieren',
        order_page_title: 'Auftrag konfigurieren',
        order_intro: 'In nur 4 Schritten zu deinem individuellen Kunstwerk – erhalte eine unverbindliche Preisschätzung und sende deine Anfrage direkt ab.',
        step_1_lbl: 'Motiv',
        step_2_lbl: 'Format',
        step_3_lbl: 'Technik',
        step_4_lbl: 'Zusammenfassung',
        step_1_heading: 'Schritt 1: Wähle dein Motiv',
        step_1_sub: 'Was soll auf deinem einzigartigen Kunstwerk zu sehen sein?',
        step_2_heading: 'Schritt 2: Wähle das gewünschte Format',
        step_2_sub: 'Welche Größe passt am besten in dein Zuhause?',
        step_3_heading: 'Schritt 3: Wähle die Maltechnik',
        step_3_sub: 'Welcher Malstil und welche Farbgebung sprechen dich am meisten an?',
        step_4_heading: 'Schritt 4: Zusammenfassung & Anfrage',
        step_4_sub: 'Überprüfe deine Konfiguration und sende deine unverbindliche Anfrage an Manuela ab.',
        contact_page_title: 'Kontakt',
        contact_intro: 'Ich freue mich über Deine Nachricht, Fragen zu meinen Werken oder Auftragsanfragen.',
        contact_btn_send: 'Nachricht senden',
        map_title: 'Google Maps Karte aktivieren',
        map_text: 'Aus Datenschutzgründen wird die interaktive Karte erst nach einem Klick geladen.',
        map_btn: 'Karte laden',
        imprint_page_title: 'Impressum',
        privacy_page_title: 'Datenschutzerklärung',
        notfound_title: '404 – Seite nicht gefunden',
        notfound_text: 'Diese Leinwand ist noch leer. Die gesuchte Seite existiert nicht (mehr) oder wurde verschoben.',
        notfound_btn: 'Zur Startseite',
        notfound_btn2: 'Zur Bildergalerie',

        // Global UI (Lightbox/Modal, seitenübergreifend wiederverwendet)
        ui_close: 'Schließen',
        ui_prev_image: 'Vorheriges Bild',
        ui_next_image: 'Nächstes Bild',
        ui_lightbox_label: 'Bilder-Großansicht',

        // Home.html
        hl_owls_aria: 'Großansicht: Zwei Eulen',
        hl_owls_alt: 'Handgemaltes Acrylbild mit zwei kleinen Eulen auf einem Ast vor blauem Hintergrund',
        hl_owls_caption: 'Zwei Eulen (Acryl auf Leinwand)',
        hl_godesburg_aria: 'Großansicht: Godesburg Stadtansicht',
        hl_godesburg_alt: 'Handgemaltes Landschaftsbild der historischen Godesburg in Bonn bei Dämmerung',
        hl_godesburg_caption: 'Godesburg Stadtansicht (Acryl auf Leinwand)',
        hl_rheinaue_aria: 'Großansicht: Rheinaue Bonn',
        hl_rheinaue_alt: 'Handgemaltes Acrylbild des herbstlichen Rheinaue-Sees in Bonn mit Bäumen und Spiegelungen',
        hl_rheinaue_caption: 'Rheinaue Bonn (Acryl auf Leinwand)',
        hl_feld_aria: 'Großansicht: Feldweg',
        hl_feld_alt: 'Handgemaltes Acrylbild eines idyllischen Feldwegs im Sommer unter blauem Himmel',
        hl_feld_caption: 'Feldweg im Sommer (Acryl auf Leinwand)',
        testi1_quote: '„Das Portrait von unserem Schäferhund Balou ist einfach fantastisch geworden. Manuela hat seinen treuen Blick exakt eingefangen. Wir sind überglücklich!“',
        testi1_author: '– Begeisterte Kundenfamilie',
        testi1_location: 'Bonn-Bad Godesberg · Tierportrait in Acryl',
        testi2_quote: '„Ich habe ein Landschaftsbild der Rheinaue als Geschenk zur Hochzeit bestellt. Die Abstimmung war super unkompliziert und das Brautpaar war zu Tränen gerührt.“',
        testi2_author: '– Eine Kundin',
        testi2_location: 'Rhein-Sieg-Kreis · Landschaftsgemälde',
        testi3_quote: '„Wunderschöne Arbeit! Man merkt bei jedem Pinselstrich die Liebe zum Detail. Das Bild hat jetzt einen zentralen Ehrenplatz in unserem Wohnzimmer.“',
        testi3_author: '– Ein Kunde',
        testi3_location: 'Köln · Hundeportrait & Stillleben',
        testi_prev_aria: 'Vorherige Kundenstimme',
        testi_next_aria: 'Nächste Kundenstimme',
        testi_pause_aria: 'Automatischen Wechsel anhalten',
        testi_stars_aria: '5 von 5 Sternen',
        testi_dot_1: 'Kundenstimme 1 anzeigen',
        testi_dot_2: 'Kundenstimme 2 anzeigen',
        testi_dot_3: 'Kundenstimme 3 anzeigen',
        home_btn_gallery: 'Zur Galerie',
        home_btn_flyer: 'Flyer Download',

        // UeberMich.html
        process_h2: 'Der Entstehungsprozess eines Kunstwerks',
        process_intro: 'Kunst für dein Zuhause',
        process1_title: 'Anfertigung mehrerer Skizzen',
        process1_text: 'Exakte Übertragung deines Fotomotivs auf die Leinwand als feine Vorzeichnung.',
        process2_title: 'verschiedene Farbaufträge',
        process2_text: 'Auftrag der ersten Farbschichten für Tiefe, Schatten und charakteristische Lichtakzente.',
        process3_title: 'feinste Ausarbeitung',
        process3_text: 'Feinste Ausarbeitung von Augen, Fellstruktur oder Lichtreflexen sowie Schlussversiegelung.',
        edu_h2: 'Künstlerische Ausbildung & Dozierende',
        edu_intro: 'Fundiertes Handwerk durch kontinuierliche Weiterbildung an anerkannten Kunstakademien:',
        edu1_place: 'Alfter bei Bonn',
        edu1_text: 'Jahreskurs <em>„Ein Jahr für die Kunst“</em> sowie vertiefende Seminare und Intensivwochen zur künstlerischen Professionalisierung.',
        edu1_dozenten_label: 'Dozierende:',
        edu2_place: 'Bad Godesberg · Friesdorf',
        edu2_text: 'Intensiver Privatunterricht in fortgeschrittenen Maltechniken, Farbenlehre, Pinselduktus und Komposition.',
        edu3_place: 'Aachen & Bonn',
        edu3_text: 'Fachkurse in figürlichem Zeichnen, Porträtmalerei, Landschaftsstudien und klassischer Öl- und Acrylmalerei.',
        tl5_title: 'Kunst für Dein Zuhause',
        tl5_text: 'Mit vielen individuellen Unikaten und vielen glücklichen Auftraggebern schaffe ich bleibende Werte und persönliche Erinnerungsstücke.',
        flyer_h2: 'Mein Info-Flyer',
        flyer_text: 'Klicke auf ein Bild für die Großansicht oder lade dir den Flyer als PDF herunter.',
        flyer_front_alt: 'Vorderseite des Informationsflyers von ManuFAKTUR Schenk',
        flyer_back_alt: 'Rückseite des Informationsflyers von ManuFAKTUR Schenk',
        flyer_btn: 'Flyer herunterladen (PDF)',

        // Leistungen.html (Ergänzungen)
        faq_3_q_ship: 'Versand',
        faq_3_a_ship: 'Nach Fertigstellung und Trocknung verschicke ich Dein Bild sicher per Post. Die genauen Versandkosten stimmen wir individuell vorab ab.',
        leist_cta_text: 'Hast Du noch weitere Fragen oder eigene Wünsche?',
        leist_cta_btn1: 'Auftrag konfigurieren',
        leist_cta_btn2: 'Kontaktiere mich gerne!',

        // Kontakt.html & Über Mich (Visitenkarte)
        kontakt_vcard_title: 'Digitale Visitenkarte',
        kontakt_vcard_hint: 'Bewege die Maus über die Karte oder tippe sie an, um sie umzudrehen.',
        kontakt_vcard_aria: 'Digitale Visitenkarte von Manuela Schenk. Drücke Enter oder die Leertaste zum Umdrehen.',
        kontakt_vcard_badge: 'Visitenkarte',
        kontakt_vcard_role: 'Künstlerin & Inhaberin',
        kontakt_vcard_save: 'Kontakt speichern (.vcf)',
        kontakt_vcard_pdf: 'Visitenkarte (PDF)',
        kontakt_city: 'Bonn, Deutschland',
        kontakt_address: '53175 Bonn, Deutschland',
        social_ig_label: 'Folge mir auf Instagram',
        social_wa_label: 'Schreibe mir auf WhatsApp',
        kontakt_prefill_text: '<strong>Deine Konfiguration wurde übertragen!</strong> Das Formular wurde mit deinen Auswahlen aus dem Konfigurator vorausgefüllt.',
        kontakt_label_name: 'Dein Name',
        kontakt_ph_name: 'Wie dürfen wir dich ansprechen?',
        kontakt_label_email: 'Deine E-Mail-Adresse',
        kontakt_ph_email: 'deine.email@beispiel.de',
        kontakt_label_subject: 'Betreff',
        kontakt_opt_general: 'Allgemeine Anfrage',
        kontakt_opt_animal: 'Auftrag: Tierportrait',
        kontakt_opt_landscape: 'Auftrag: Landschaft',
        kontakt_opt_purchase: 'Kaufinteresse an einem Bild',
        kontakt_label_message: 'Deine Nachricht:',
        kontakt_ph_message: 'Deine Nachricht...',
        kontakt_privacy_label: 'Ich stimme zu, dass meine Angaben aus dem Kontaktformular zur Beantwortung meiner Anfrage erhoben und verarbeitet werden. Hinweis: Du kannst Deine Einwilligung jederzeit für die Zukunft per E‑Mail widerrufen. Detaillierte Informationen findest Du in unserer <a href="Datenschutz.html" target="_blank" rel="noopener">Datenschutzerklärung</a>.',

        // Impressum.html
        impressum_map_title: 'Google Maps laden',
        impressum_map_text: 'Um die interaktive Karte anzuzeigen, klicken Sie bitte auf "Karte laden". Dadurch stimmen Sie der Übertragung Ihrer IP-Adresse an Google und der Verarbeitung von Cookies gemäß der Datenschutzrichtlinien von Google zu. (Details in unserer <a href="Datenschutz.html" target="_blank" rel="noopener">Datenschutzerklärung</a>)',
        impressum_map_btn: 'Karte laden',
        impressum_h_ddg: 'Angaben gemäß § 5 DDG',
        impressum_h_contact: 'Kontakt',
        impressum_contact_block: 'Telefon: +49 (0) 163 2662435<br>E-Mail: <a href="mailto:manufaktur-malerei@web.de">manufaktur-malerei@web.de</a><br>Anschrift: Rüdesheimer Straße 14, 53175 Bonn',
        impressum_h_vat: 'Umsatzsteuer',
        impressum_vat_text: 'Gemäß § 19 Abs. 1 UStG (Kleinunternehmerregelung) wird keine Umsatzsteuer berechnet.',
        impressum_h_editor: 'Redaktionell verantwortlich und Erstellung der Webseite',
        impressum_dev_credit: 'Programmierung &amp; Design Code:<br><a href="https://github.com/Schengii?tab=repositories" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github" aria-hidden="true"></i> Repository auf GitHub</a>',
        impressum_h_copyright: 'Urheberrechtshinweis (Copyright Bildergalerie)',
        impressum_copyright_text: 'Alle Bilder wurden selbst gemalt und dürfen nicht ohne ausdrückliche Erlaubnis weder verändert, öffentlich genutzt, noch kopiert werden.<br>*** Für die Bilder gilt ein Copyright durch die Künstlerin Manuela Schenk. *** <br>Die Bilder gehören der ManuFAKTUR, bei unrechtmäßiger Nutzung behalten wir uns rechtliche Schritte vor und bringen diese zur Anzeige.',
        impressum_h_eu: 'EU-Streitschlichtung',
        impressum_eu_text: 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>.<br> Unsere E-Mail-Adresse finden Sie oben im Impressum.',
        impressum_h_dispute: 'Verbraucherstreitbeilegung / Universalschlichtungsstelle',
        impressum_dispute_text: 'Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',

        // Datenschutz.html
        dsgvo_h1: '1. Datenschutz auf einen Blick',
        dsgvo_h1_1: 'Allgemeine Hinweise',
        dsgvo_h1_1_text: 'Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.',
        dsgvo_h1_2: 'Datenerfassung auf unserer Website',
        dsgvo_h1_2_text1: '<strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br>Die Datenverarbeitung auf dieser Website erfolgt durch die Websitebetreiberin Manuela Schenk (ManuFAKTUR). Die vollständigen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.',
        dsgvo_h1_2_text2: '<strong>Wie erfassen wir Ihre Daten?</strong><br>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen (z. B. Daten, die Sie in das Kontaktformular eingeben). Andere Daten werden automatisch oder nach Ihrer ausdrücklichen Einwilligung beim Besuch der Website durch IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).',
        dsgvo_h2: '2. Hosting und Server-Log-Files',
        dsgvo_h2_text: 'Wir hosten die Inhalte unserer Website bei einem Hoster in Deutschland. Der Hoster erhebt automatisch Informationen in sogenannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt (IP-Adresse, Browsertyp, Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage). Diese Daten werden zur Gewährleistung eines sicheren und fehlerfreien Betriebs erhoben (Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO).',
        dsgvo_h3: '3. Lokale Einbindung von Schriftarten & Symbolen (DSGVO-konform)',
        dsgvo_h3_intro: 'Um die Privatsphäre unserer Besucher bestmöglich zu schützen, nutzen wir keine externen CDNs (Content Delivery Networks) von Drittanbietern:',
        dsgvo_h3_li1: '<strong>Google Fonts:</strong> Alle verwendeten Schriften (Lato, Playfair Display, Dancing Script) sind lokal auf unserem Webserver gespeichert und werden von dort geladen. Es findet keine Verbindung zu Servern von Google statt.',
        dsgvo_h3_li2: '<strong>Font Awesome:</strong> Die verwendeten Icons und Stylesheets von Font Awesome sind ebenfalls vollständig lokal auf unserem Webserver gehostet. Es erfolgt kein Datentransfer zu Drittservern.',
        dsgvo_h4: '4. Einwilligungspflichtige Dienste von Drittanbietern',
        dsgvo_h4_1: 'Google Maps (Zwei-Klick-Lösung)',
        dsgvo_h4_1_text: 'Auf unserer Website ist eine Karte von Google Maps eingebunden. Um zu verhindern, dass bereits beim Laden der Seite Ihre IP-Adresse an Google übertragen wird, nutzen wir eine datenschutzfreundliche Zwei-Klick-Lösung. Die Karte ist standardmäßig deaktiviert. Erst wenn Sie aktiv auf die Schaltfläche "Karte laden" klicken, willigen Sie ein, dass eine Verbindung zu den Servern von Google (Google Ireland Limited) aufgebaut wird. Rechtsgrundlage für diese Verarbeitung ist Ihre Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO. Sie können diese Einwilligung jederzeit für die Zukunft widerrufen.',
        dsgvo_h5: '5. Datenerfassung über das Kontaktformular & Web3Forms',
        dsgvo_h5_text1: 'Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Formular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns verarbeitet.',
        dsgvo_h5_formspree: 'Für die technische Übermittlung von Formularanfragen nutzen wir den Dienst <strong>Web3Forms</strong> (Web3Forms, c/o Surjith S M, India / Cloudflare infrastructure). Wenn Sie das Formular absenden, werden Ihre eingegebenen Daten verschlüsselt an die Server von Web3Forms übertragen und per E-Mail an uns weitergeleitet. Web3Forms speichert Ihre Formulardaten nicht dauerhaft in Datenbanken, sondern leitet diese direkt an unsere E-Mail-Adresse weiter. Rechtsgrundlage ist die Anbahnung oder Erfüllung eines Vertrags (Art. 6 Abs. 1 lit. b DSGVO) sowie unser berechtigtes Interesse an einer verlässlichen und spamgeschützten Bearbeitung von Kundenanfragen (Art. 6 Abs. 1 lit. f DSGVO).',
        dsgvo_h6: '6. Lokale Speicherung im Browser (LocalStorage gemäß § 25 Abs. 2 Nr. 2 TDDG)',
        dsgvo_h6_text: 'Diese Website verwendet die lokale Speicherfunktion Ihres Browsers (LocalStorage). Wir speichern darin ausschließlich Ihre gewählte Spracheinstellung (manufaktur_lang), das gewünschte Farbdesign (manufaktur_theme) sowie Ihre persönliche Merkliste von Kunstwerken (manufaktur_favorites). Es werden keine Tracking-Cookies gesetzt und keine personenbezogenen Nutzungsprofile erstellt. Die Speicherung ist technisch erforderlich, um die von Ihnen ausdrücklich gewünschten Anzeigeeinstellungen sitzungsübergreifend bereitzustellen (§ 25 Abs. 2 Nr. 2 TDDG).',
        dsgvo_h7: '7. SSL- bzw. TLS-Verschlüsselung',
        dsgvo_h7_text: 'Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel Anfragen über das Kontaktformular, eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://“ auf „https://“ wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.',
        dsgvo_h8: '8. Ihre Rechte bezüglich Ihrer Daten',
        dsgvo_h8_text: 'Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit folgende Rechte:<br>• <strong>Recht auf Auskunft (Art. 15 DSGVO):</strong> Sie können Auskunft über Ihre von uns verarbeiteten personenbezogenen Daten verlangen.<br>• <strong>Recht auf Berichtigung (Art. 16 DSGVO):</strong> Sie können die Berichtigung unrichtiger Daten verlangen.<br>• <strong>Recht auf Löschung (Art. 17 DSGVO):</strong> Sie können die Löschung Ihrer bei uns gespeicherten personenbezogenen Daten verlangen.<br>• <strong>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO):</strong> Sie können die Einschränkung der Datenverarbeitung verlangen.<br>• <strong>Recht auf Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie können verlangen, Ihre Daten in einem strukturierten, gängigen Format zu erhalten.<br>• <strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Sie haben das Recht, jederzeit gegen die Verarbeitung Ihrer personenbezogenen Daten Widerspruch einzulegen.<br>• <strong>Widerruf Ihrer Einwilligung (Art. 7 Abs. 3 DSGVO):</strong> Sie können erteilte Einwilligungen jederzeit für die Zukunft per E-Mail widerrufen.<br>• <strong>Beschwerderecht bei der zuständigen Aufsichtsbehörde (Art. 77 DSGVO):</strong> Zuständige Aufsichtsbehörde ist die Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW), Kavalleriestraße 2–4, 40213 Düsseldorf.',

        // Auftrag.html Konfigurator (data-i18n)
        auftrag_restore_text: 'Du hast eine gespeicherte Konfiguration. <button type="button" id="restore-btn">Wiederherstellen</button> oder <button type="button" id="clear-btn">Neu starten</button>.',
        auftrag_fav_title: 'Aus deinen gemerkten Favoriten wählen',
        auftrag_fav_hint: 'Klicke auf eines deiner gemerkten Lieblingswerke, um es als Motiv-Inspiration zu übernehmen:',
        auftrag_motiv1_title: 'Tierportrait',
        auftrag_motiv1_desc: 'Hund, Katze, Pferd oder jedes andere Tier – als unvergängliches Gemälde.',
        auftrag_motiv2_title: 'Landschaft',
        auftrag_motiv2_desc: 'Ein besonderer Ort, eine Urlaubserinnerung oder eine traumhafte Szene.',
        auftrag_motiv3_title: 'Stillleben / Pflanzen',
        auftrag_motiv3_desc: 'Blumen, Früchte oder andere Objekte als dekoratives Gemälde.',
        auftrag_motiv4_title: 'Sonstiges / Eigene Idee',
        auftrag_motiv4_desc: 'Du hast eine ganz eigene Idee? Ich male nach deinem Wunschmotiv.',
        auftrag_motiv4_price: 'Auf Anfrage',
        auftrag_hint1: 'Bitte wähle ein Motiv, um fortzufahren.',
        auftrag_next_format: 'Weiter: Format',
        auftrag_format1_small: 'Klein',
        auftrag_format2_small: 'Beliebt',
        auftrag_format3_small: 'Mittel',
        auftrag_format4_small: 'Groß',
        auftrag_format5_small: 'XL',
        auftrag_format6_title: 'Individuell',
        auftrag_format6_small: 'Wunschformat · auf Anfrage',
        auftrag_hint2: 'Bitte wähle ein Format, um fortzufahren.',
        auftrag_back: 'Zurück',
        auftrag_next_technik: 'Weiter: Technik',
        auftrag_tech1_title: 'Acrylfarben',
        auftrag_tech1_desc: 'Schnelle Trocknungszeit',
        auftrag_tech1_delivery: 'Lieferung in einigen Wochen',
        auftrag_tech2_title: 'Ölfarben',
        auftrag_tech2_desc: 'längere Trocknungszeit',
        auftrag_tech2_delivery: 'Lieferung in einigen Wochen',
        auftrag_hint3: 'Bitte wähle eine Technik, um fortzufahren.',
        auftrag_next_summary: 'Zur Zusammenfassung',
        auftrag_summary_motiv: 'Motiv',
        auftrag_summary_format: 'Format',
        auftrag_summary_technik: 'Technik',
        auftrag_summary_lieferzeit: 'Lieferzeit',
        auftrag_price_note: '* Endpreis nach individueller Absprache. Versand innerhalb DE kostenpflichtig.',
        auftrag_photo_h4: 'Eigenes Fotovorlage-Bild auswählen (Optional)',
        auftrag_photo_hint: 'Wähle hier dein Haustier- oder Landschaftsfoto aus, um es als Vorschau zu prüfen. Das Foto bleibt auf deinem Gerät und wird nicht mit der Anfrage übertragen.',
        auftrag_photo_input_label: 'Fotovorlage auswählen',
        auftrag_photo_preview_alt: 'Fotovorlage Vorschau',
        auftrag_photo_loaded: 'Fotovorlage geladen',
        auftrag_photo_ready: 'Bitte sende das Foto nach deiner Anfrage per E-Mail oder WhatsApp.',
        auftrag_summary_referenz: 'Referenz',
        auftrag_submit: 'Jetzt unverbindlich anfragen'
    },
    en: {
        skip_link: 'Skip to main content',
        back_to_top: 'Back to top',
        home_welcome_title: 'Welcome',
        home_welcome_text: 'Here my paintings come to life, all lovingly hand-painted by me in exquisite detail.<br>Quality and individuality are my hallmarks. I create custom animal portraits and landscapes for you.',
        badge_handpainted: '100% Hand-painted',
        badge_studio: 'Studio in Bonn, Germany',
        badge_shipping: 'Insured Shipping in DE',
        badge_detail: 'Loving Attention to Detail',
        highlights_title: 'Current Highlights',
        highlights_intro: 'A curated selection of my newest original paintings.',
        testimonials_title: 'What My Clients Say',
        testimonials_intro: 'Genuine experiences & feedback from happy art enthusiasts:',
        cta_text: 'Discover the collection of hand-painted originals or commission your very own personal motif.',
        about_page_title: 'About Me',
        about_intro: 'Get to know the artist behind the canvas.',
        about_profile_title: 'Profile',
        about_lbl_loc: 'Location:',
        about_lbl_dog: 'Owner of:',
        about_lbl_motifs: 'Motifs:',
        about_lbl_tech: 'Techniques:',
        about_lbl_edu: 'Education:',
        about_lbl_motive: 'Motivation:',
        about_profile_loc: 'Bonn (Bad Godesberg), Germany',
        about_profile_dog: 'Balou',
        about_profile_motifs: 'Animal portraits, favorite places & landscapes',
        about_profile_tech: 'Acrylic, Oil, Oil Pastel, Mixed Media',
        about_profile_edu: 'Alanus University Alfter, Art Studio Bonn-Friesdorf',
        about_profile_motive: 'The joy of capturing vibrant emotions & living moments',
        about_greeting: 'Hello, I am Manuela,',
        about_subtitle: '...artist from Bonn, dog lover and owner of Balou',
        about_p1: 'I love capturing <strong>special moments</strong>, <strong>animals</strong> or <strong>landscapes</strong> with fine brushes and vivid pigments on high-grade canvas or handmade cotton paper.',
        about_p2: 'My paintings tell heartfelt stories: whether the loyal gaze of a dog, the serenity of the French Atlantic coast, or historic impressions of my home city Bonn and the Siebengebirge.',
        about_p3: 'I paint what inspires and touches me – in traditional <strong>oil painting</strong>, radiant <strong>acrylic colors</strong>, and nuanced <strong>oil pastel and mixed media techniques</strong>.',
        about_p4: 'Every single artwork is a hand-painted unique original created with great attention to detail and proven artistic craftsmanship.',
        about_p5: 'I would be delighted to paint your personal custom motif! Feel free to view my <a href="Leistungen.html">services</a> or contact me directly via the <a href="Kontakt.html">contact form</a>.',
        services_page_title: 'Services & Techniques',
        services_intro: 'Unique, custom artworks crafted according to your personal vision.',
        services_offer_title: 'What I Offer',
        service_dog_title: 'Your Dog on Canvas',
        service_dog_desc: 'Have you always dreamed of a timeless portrait of your loyal four-legged companion? From white Maltese to black Labrador – every dog is a wonderful motif.',
        service_pets_title: 'More Animal Companions',
        service_pets_desc: 'Of course I do not only paint dogs! Cats, horses, parrots, wildlife and all animal friends make expressive, soulful paintings.',
        service_places_title: 'Your Favorite Places',
        service_places_desc: 'Special landscapes and cherished places hold their own magic. If you have such memories, I will transform them into lasting art on canvas.',
        service_formats_title: 'Available Formats',
        service_formats_desc: 'I offer a wide variety of custom sizes and proportions. Since every piece is painted with time and passion, I gladly provide a personal non-binding offer.',
        faq_title: 'Frequently Asked Questions (FAQ)',
        faq_1_q: 'What does a painting cost?',
        faq_1_a: 'The price depends on the size of the painting. Payment is made in advance (incl. postage and packaging).',
        faq_2_q: 'How long does it take to create a painting?',
        faq_2_a: 'Depending on the technique (acrylic dries faster than oil) and current commissions, completion typically takes a few weeks. Please order well in advance for gifts!',
        faq_4_q_cancellation: 'Right of Withdrawal for Custom Artworks',
        faq_4_a_cancellation: 'For artworks created individually according to your personal wishes and specifications (such as pet portraits from photo references), there is no statutory right of withdrawal pursuant to § 312g (2) No. 1 German Civil Code (BGB), as the work is clearly tailored to you personally. However, before starting and throughout the painting process, I closely coordinate all details and milestones with you so that you will be completely thrilled with your finished painting.',
        gallery_page_title: 'Art Gallery',
        gallery_intro: 'Discover my hand-painted originals across diverse styles and creative periods.',
        filter_all: 'All Works',
        filter_animals: 'Animals',
        filter_landscapes: 'Landscapes',
        filter_plants: 'Botanicals',
        filter_other: 'Still Life & More',
        filter_favorites: 'Favorites',
        search_placeholder: 'Search paintings, motifs, techniques or sizes...',
        sort_label: 'Sort by:',
        sort_aria: 'Sort gallery',
        sort_default: 'Default',
        sort_newest: 'Newest first',
        sort_title_asc: 'Title (A-Z)',
        sort_title_desc: 'Title (Z-A)',
        gallery_empty_fav_title: 'No favorites saved yet.',
        gallery_empty_fav_text: 'Click the heart icon on any artwork to save your personal favorites here.',
        gallery_empty_search_title: 'No matching paintings found.',
        gallery_empty_search_text: 'Try a different search term or reset the category filter.',
        scene_label: 'AI Wall Preview:',
        scene_label_short: 'AI Wall Preview',
        scene_living: 'Living Room',
        scene_living_title: 'Living Room Wall',
        scene_bedroom: 'Bedroom',
        scene_bedroom_title: 'Bedroom Wall',
        scene_loft: 'Loft / Concrete',
        scene_loft_title: 'Dark Loft Wall',
        scene_lounge: 'Beige Lounge',
        scene_lounge_title: 'Beige Lounge Wall',
        scene_pure: 'Pure (Detail)',
        scene_pure_title: 'Pure, No Background',
        wall_drag_hint: 'Drag to Move',
        lb_rotate_title: 'Rotate 90°',
        lb_rotate_aria: 'Rotate image by 90 degrees',
        lb_zoom_title: 'Activate/Deactivate Magnifier',
        lb_zoom_aria: 'Activate magnifier',
        lb_scale_label: 'Scale:',
        lb_scale_aria: "Scale the painting's size on the wall",
        lb_center_title: 'Center the painting position on the wall',
        lb_label_technik: 'Technique:',
        lb_label_masse: 'Size / Format:',
        lb_label_kat: 'Category:',
        lb_label_herkunft: 'Origin:',
        lb_val_herkunft: 'Studio Bonn',
        lb_label_rahmung: 'Framing:',
        lb_label_status: 'Availability:',
        status_verfuegbar: 'Available',
        status_reserviert: 'Reserved',
        status_verkauft: 'Sold – I am happy to paint a similar motif for you',
        lb_val_rahmung: 'Ready to Hang (Stretcher Frame)',
        lb_views_title: 'More Views:',
        lb_view_front: 'Front View',
        lb_view_front_title: 'Pure Front View',
        lb_view_room: 'Wall View',
        lb_view_room_title: 'Wall & Room View',
        lb_view_back: 'Back',
        lb_view_back_title: 'Back & Stretcher Frame',
        lb_view_side: '3D Perspective',
        lb_view_side_title: '3D Side View & Texture',
        lb_view_artist: 'Studio',
        lb_view_artist_title: 'Artist & Studio',
        lb_inquiry_aria: 'Request this motif as a commission',
        lb_fav_default: 'Favorite',
        clear_search_aria: 'Clear search',
        lb_btn_inquiry: 'Inquire this Motif as Commission',
        lb_btn_room: 'View in Your Room',
        lb_btn_fav_add: 'Add to Favorites',
        lb_btn_fav_remove: 'Remove from Favorites',
        lb_share_btn: 'Share Artwork',
        lb_share_aria: 'Share artwork',
        lb_rotate: 'Rotate 90°',
        lb_zoom: 'Magnifier Zoom',
        lb_center: 'Center',
        order_page_title: 'Configure Commission',
        order_intro: 'In just 4 simple steps to your custom artwork – receive a non-binding price estimate and submit your request directly.',
        step_1_lbl: 'Motif',
        step_2_lbl: 'Size',
        step_3_lbl: 'Medium',
        step_4_lbl: 'Summary',
        step_1_heading: 'Step 1: Choose Your Motif',
        step_1_sub: 'What would you like to have painted on your unique artwork?',
        step_2_heading: 'Step 2: Choose Your Format & Size',
        step_2_sub: 'Which canvas dimensions suit your space best?',
        step_3_heading: 'Step 3: Choose Your Medium & Technique',
        step_3_sub: 'Which medium and artistic texture appeals most to you?',
        step_4_heading: 'Step 4: Summary & Inquiry',
        step_4_sub: 'Review your selected configuration and submit your non-binding inquiry directly to Manuela.',
        contact_page_title: 'Contact',
        contact_intro: 'I look forward to hearing from you, whether with questions regarding existing artworks or commission requests.',
        contact_btn_send: 'Send Message',
        map_title: 'Activate Google Maps',
        map_text: 'For privacy reasons, the interactive map is only loaded after your consent click.',
        map_btn: 'Load Map',
        imprint_page_title: 'Imprint',
        privacy_page_title: 'Privacy Policy',
        notfound_title: '404 – Page Not Found',
        notfound_text: 'This canvas is still empty. The page you are looking for does not exist (anymore) or has been moved.',
        notfound_btn: 'Back to Home',
        notfound_btn2: 'To the Gallery',

        // Global UI (Lightbox/Modal, reused across pages)
        ui_close: 'Close',
        ui_prev_image: 'Previous Image',
        ui_next_image: 'Next Image',
        ui_lightbox_label: 'Enlarged Image View',

        // Home.html
        hl_owls_aria: 'Enlarge: Two Owls',
        hl_owls_alt: 'Hand-painted acrylic painting of two small owls on a branch against a blue background',
        hl_owls_caption: 'Two Owls (Acrylic on Canvas)',
        hl_godesburg_aria: 'Enlarge: Godesburg Cityscape',
        hl_godesburg_alt: 'Hand-painted landscape of the historic Godesburg castle in Bonn at dusk',
        hl_godesburg_caption: 'Godesburg Cityscape (Acrylic on Canvas)',
        hl_rheinaue_aria: 'Enlarge: Rheinaue Bonn',
        hl_rheinaue_alt: 'Hand-painted acrylic painting of the autumnal Rheinaue lake in Bonn with trees and reflections',
        hl_rheinaue_caption: 'Rheinaue Bonn (Acrylic on Canvas)',
        hl_feld_aria: 'Enlarge: Field Path',
        hl_feld_alt: 'Hand-painted acrylic painting of an idyllic field path in summer under a blue sky',
        hl_feld_caption: 'Field Path in Summer (Acrylic on Canvas)',
        testi1_quote: '"The portrait of our German Shepherd Balou turned out simply fantastic. Manuela captured his loyal gaze perfectly. We are overjoyed!"',
        testi1_author: '– Delighted Client Family',
        testi1_location: 'Bonn-Bad Godesberg · Animal Portrait in Acrylic',
        testi2_quote: '"I ordered a landscape painting of the Rheinaue as a wedding gift. The coordination was super easy, and the bride and groom were moved to tears."',
        testi2_author: '– A Client',
        testi2_location: 'Rhein-Sieg District · Landscape Painting',
        testi3_quote: '"Beautiful work! You can feel the love for detail in every brushstroke. The painting now has a central place of honor in our living room."',
        testi3_author: '– A Client',
        testi3_location: 'Cologne · Dog Portrait & Still Life',
        testi_prev_aria: 'Previous testimonial',
        testi_next_aria: 'Next testimonial',
        testi_pause_aria: 'Pause automatic rotation',
        testi_stars_aria: '5 out of 5 stars',
        testi_dot_1: 'Show testimonial 1',
        testi_dot_2: 'Show testimonial 2',
        testi_dot_3: 'Show testimonial 3',
        home_btn_gallery: 'View Gallery',
        home_btn_flyer: 'Flyer Download',

        // UeberMich.html
        process_h2: 'How Each Artwork Is Created',
        process_intro: 'Art for your home',
        process1_title: 'Creating several sketches',
        process1_text: 'Precise transfer of your photo motif onto the canvas as a fine preliminary sketch.',
        process2_title: 'Various layers of color',
        process2_text: 'Applying the first layers of paint for depth, shadow and characteristic highlights.',
        process3_title: 'Finest detailing',
        process3_text: 'Fine detailing of eyes, fur texture or light reflections, followed by the final sealing.',
        edu_h2: 'Artistic Training & Instructors',
        edu_intro: 'A solid craft built through continuous training at recognized art academies:',
        edu1_place: 'Alfter near Bonn',
        edu1_text: 'The year-long course <em>"A Year for the Arts"</em> as well as in-depth seminars and intensive weeks for artistic professionalization.',
        edu1_dozenten_label: 'Instructors:',
        edu2_place: 'Bad Godesberg · Friesdorf',
        edu2_text: 'Intensive private lessons in advanced painting techniques, color theory, brushwork and composition.',
        edu3_place: 'Aachen & Bonn',
        edu3_text: 'Specialized courses in figure drawing, portrait painting, landscape studies and classical oil and acrylic painting.',
        tl5_title: 'Art for Your Home',
        tl5_text: 'With many individual originals and many happy clients, I create lasting value and personal keepsakes.',
        flyer_h2: 'My Info Flyer',
        flyer_text: 'Click on an image for a larger view or download the flyer as a PDF.',
        flyer_front_alt: 'Front side of the ManuFAKTUR Schenk information flyer',
        flyer_back_alt: 'Back side of the ManuFAKTUR Schenk information flyer',
        flyer_btn: 'Download Flyer (PDF)',

        // Leistungen.html (additions)
        faq_3_q_ship: 'Shipping',
        faq_3_a_ship: 'Once finished and fully dry, I ship your painting by post. Exact shipping costs are individually coordinated in advance.',
        leist_cta_text: 'Do you have further questions or your own wishes?',
        leist_cta_btn1: 'Configure Commission',
        leist_cta_btn2: "I'd Love to Hear From You!",

        // Kontakt.html & About Me (Business Card)
        kontakt_vcard_title: 'Digital Business Card',
        kontakt_vcard_hint: 'Move your mouse over the card or tap it to flip it.',
        kontakt_vcard_aria: 'Digital business card of Manuela Schenk. Press Enter or Space to flip.',
        kontakt_vcard_badge: 'Business Card',
        kontakt_vcard_role: 'Artist & Owner',
        kontakt_vcard_save: 'Save Contact (.vcf)',
        kontakt_vcard_pdf: 'Business Card (PDF)',
        kontakt_city: 'Bonn, Germany',
        kontakt_address: '53175 Bonn, Germany',
        social_ig_label: 'Follow me on Instagram',
        social_wa_label: 'Message me on WhatsApp',
        kontakt_prefill_text: '<strong>Your configuration has been transferred!</strong> The form has been pre-filled with your selections from the configurator.',
        kontakt_label_name: 'Your Name',
        kontakt_ph_name: 'What should we call you?',
        kontakt_label_email: 'Your Email Address',
        kontakt_ph_email: 'your.name@example.com',
        kontakt_label_subject: 'Subject',
        kontakt_opt_general: 'General Inquiry',
        kontakt_opt_animal: 'Commission: Animal Portrait',
        kontakt_opt_landscape: 'Commission: Landscape',
        kontakt_opt_purchase: 'Interested in Purchasing a Painting',
        kontakt_label_message: 'Your Message:',
        kontakt_ph_message: 'Your message...',
        kontakt_privacy_label: 'I agree that my details from the contact form will be collected and processed to answer my inquiry. Note: You can revoke your consent at any time for the future by email. Detailed information can be found in our <a href="Datenschutz.html" target="_blank" rel="noopener">Privacy Policy</a>.',

        // Impressum.html
        impressum_map_title: 'Load Google Maps',
        impressum_map_text: 'To display the interactive map, please click "Load Map". By doing so, you consent to the transmission of your IP address to Google and the processing of cookies in accordance with Google\'s privacy policies. (Details in our <a href="Datenschutz.html" target="_blank" rel="noopener">Privacy Policy</a>)',
        impressum_map_btn: 'Load Map',
        impressum_h_ddg: 'Information pursuant to § 5 DDG (Digital Services Act)',
        impressum_h_contact: 'Contact',
        impressum_contact_block: 'Phone: +49 (0) 163 2662435<br>Email: <a href="mailto:manufaktur-malerei@web.de">manufaktur-malerei@web.de</a><br>Address: Rüdesheimer Straße 14, 53175 Bonn, Germany',
        impressum_h_vat: 'VAT',
        impressum_vat_text: 'Pursuant to § 19 (1) of the German VAT Act (UStG – small business regulation), no VAT is charged.',
        impressum_h_editor: 'Editorially Responsible and Website Creation',
        impressum_dev_credit: 'Programming &amp; Design Code:<br><a href="https://github.com/Schengii?tab=repositories" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github" aria-hidden="true"></i> Repository on GitHub</a>',
        impressum_h_copyright: 'Copyright Notice (Gallery Images)',
        impressum_copyright_text: 'All paintings were hand-painted by the artist herself and may not be modified, publicly used, or copied without her explicit permission.<br>*** All images are copyrighted by the artist Manuela Schenk. *** <br>The images belong to ManuFAKTUR; in the event of unlawful use, we reserve the right to take legal action.',
        impressum_h_eu: 'EU Dispute Resolution',
        impressum_eu_text: 'The European Commission provides a platform for online dispute resolution (ODR): <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>.<br> Our email address can be found above in this legal notice.',
        impressum_h_dispute: 'Consumer Dispute Resolution',
        impressum_dispute_text: 'We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.',

        dsgvo_h1: '1. Privacy at a Glance',
        dsgvo_h1_1: 'General Information',
        dsgvo_h1_1_text: 'The following information provides a simple overview of what happens to your personal data when you visit this website. Personal data is any data that can be used to personally identify you.',
        dsgvo_h1_2: 'Data Collection on Our Website',
        dsgvo_h1_2_text1: '<strong>Who is responsible for data collection on this website?</strong><br>Data processing on this website is carried out by the website operator Manuela Schenk (ManuFAKTUR), whose full contact details can be found in the legal notice (Impressum) of this website.',
        dsgvo_h1_2_text2: '<strong>How do we collect your data?</strong><br>Your data is collected in part when you provide it to us (e.g. data you enter into the contact form). Other data is collected automatically, or after your consent, by IT systems when you visit the website. This is primarily technical data (e.g. internet browser, operating system, or time of page access).',
        dsgvo_h2: '2. Hosting and Server Log Files',
        dsgvo_h2_text: 'We host our website content with a provider in Germany. The host automatically collects information in so-called server log files, which your browser automatically transmits to us (IP address, browser type, operating system, referrer URL, host name of accessing machine, time of server request). This data is collected to ensure secure and trouble-free operation (Legal basis: Art. 6 (1)(f) GDPR).',
        dsgvo_h3: '3. Local Integration of Fonts & Icons (GDPR-compliant)',
        dsgvo_h3_intro: 'To best protect the privacy of our visitors, we do not use third-party CDNs (Content Delivery Networks) for fonts or icons:',
        dsgvo_h3_li1: '<strong>Google Fonts:</strong> All fonts used (Lato, Playfair Display, Dancing Script) are stored locally on our web server and loaded from there. There is no connection to Google\'s servers.',
        dsgvo_h3_li2: '<strong>Font Awesome:</strong> The Font Awesome icons and stylesheets used are likewise hosted locally on our web server. No data is transferred to third-party servers.',
        dsgvo_h4: '4. Third-Party Services Requiring Consent',
        dsgvo_h4_1: 'Google Maps (Two-Click Solution)',
        dsgvo_h4_1_text: 'Our website includes a Google Maps map. To prevent your IP address from being transmitted to Google as soon as the page loads, we use a privacy-friendly two-click solution. The map is disabled by default. Only when you actively click the "Load Map" button do you consent to a connection being established with Google\'s servers (Google Ireland Limited). The legal basis for this processing is your consent pursuant to Art. 6 (1)(a) GDPR. You can revoke this consent at any time for the future.',
        dsgvo_h5: '5. Data Collection via the Contact Form & Web3Forms',
        dsgvo_h5_text1: 'If you send us inquiries via the contact form, the information you provide there, including any contact details you enter, will be processed by us for the purpose of handling your inquiry and in case of follow-up questions.',
        dsgvo_h5_formspree: 'For the technical transmission of form inquiries, we use the service <strong>Web3Forms</strong> (Web3Forms, c/o Surjith S M, India / Cloudflare infrastructure). When you submit the form, your entered data is transmitted in encrypted form to Web3Forms\' servers and forwarded to us by email. Web3Forms does not permanently store form submissions in databases, forwarding them directly to our email address. The legal basis is the initiation or performance of a contract (Art. 6 (1)(b) GDPR) and our legitimate interest in the reliable and spam-protected handling of customer inquiries (Art. 6 (1)(f) GDPR).',
        dsgvo_h6: '6. Local Storage in Browser (LocalStorage pursuant to § 25 (2) No. 2 TDDG)',
        dsgvo_h6_text: 'This website uses your browser\'s local storage function (LocalStorage). We solely store your chosen language preference (manufaktur_lang), selected color theme (manufaktur_theme), and your personal favorites wishlist of artworks (manufaktur_favorites). No tracking cookies are set and no personal user profiles are created. Storage is technically necessary to provide your explicitly requested display settings across sessions (§ 25 (2) No. 2 TDDG).',
        dsgvo_h7: '7. SSL / TLS Encryption',
        dsgvo_h7_text: 'For security reasons and to protect the transmission of confidential content, such as inquiries via the contact form, this site uses SSL or TLS encryption. You can recognize an encrypted connection by the change in the browser address line from "http://" to "https://" and by the lock symbol in your browser bar.',
        dsgvo_h8: '8. Your Rights Regarding Your Data',
        dsgvo_h8_text: 'Under applicable statutory provisions, you have the following rights at any time:<br>• <strong>Right of access (Art. 15 GDPR):</strong> You can request information about your personal data processed by us.<br>• <strong>Right to rectification (Art. 16 GDPR):</strong> You can request the correction of inaccurate data.<br>• <strong>Right to erasure (Art. 17 GDPR):</strong> You can request the deletion of your personal data stored with us.<br>• <strong>Right to restriction of processing (Art. 18 GDPR):</strong> You can request the restriction of data processing.<br>• <strong>Right to data portability (Art. 20 GDPR):</strong> You can request to receive your data in a structured, commonly used format.<br>• <strong>Right to object (Art. 21 GDPR):</strong> You have the right to object at any time to the processing of your personal data.<br>• <strong>Revocation of your consent (Art. 7 (3) GDPR):</strong> You can revoke given consent at any time for the future via email.<br>• <strong>Right to lodge a complaint with a supervisory authority (Art. 77 GDPR):</strong> The competent supervisory authority is the State Commissioner for Data Protection and Freedom of Information of North Rhine-Westphalia (LDI NRW), Kavalleriestraße 2–4, 40213 Düsseldorf, Germany.',

        // Auftrag.html Configurator (data-i18n)
        auftrag_restore_text: 'You have a saved configuration. <button type="button" id="restore-btn">Restore</button> or <button type="button" id="clear-btn">Start Over</button>.',
        auftrag_fav_title: 'Choose from Your Saved Favorites',
        auftrag_fav_hint: 'Click one of your saved favorite artworks to use it as motif inspiration:',
        auftrag_motiv1_title: 'Animal Portrait',
        auftrag_motiv1_desc: 'Dog, cat, horse or any other animal – as an everlasting painting.',
        auftrag_motiv2_title: 'Landscape',
        auftrag_motiv2_desc: 'A special place, a holiday memory, or a dreamlike scene.',
        auftrag_motiv3_title: 'Still Life / Plants',
        auftrag_motiv3_desc: 'Flowers, fruit, or other objects as a decorative painting.',
        auftrag_motiv4_title: 'Other / Custom Idea',
        auftrag_motiv4_desc: 'Do you have your own idea? I paint according to your desired motif.',
        auftrag_motiv4_price: 'Upon Request',
        auftrag_hint1: 'Please choose a motif to continue.',
        auftrag_next_format: 'Next: Format',
        auftrag_format1_small: 'Small',
        auftrag_format2_small: 'Popular',
        auftrag_format3_small: 'Medium',
        auftrag_format4_small: 'Large',
        auftrag_format5_small: 'XL',
        auftrag_format6_title: 'Custom',
        auftrag_format6_small: 'Custom size · upon request',
        auftrag_hint2: 'Please choose a format to continue.',
        auftrag_back: 'Back',
        auftrag_next_technik: 'Next: Technique',
        auftrag_tech1_title: 'Acrylic Paint',
        auftrag_tech1_desc: 'Fast drying time',
        auftrag_tech1_delivery: 'Delivery in a few weeks',
        auftrag_tech2_title: 'Oil Paint',
        auftrag_tech2_desc: 'longer drying time',
        auftrag_tech2_delivery: 'Delivery in a few weeks',
        auftrag_hint3: 'Please choose a technique to continue.',
        auftrag_next_summary: 'To the Summary',
        auftrag_summary_motiv: 'Motif',
        auftrag_summary_format: 'Format',
        auftrag_summary_technik: 'Technique',
        auftrag_summary_lieferzeit: 'Delivery Time',
        auftrag_price_note: '* Final price subject to individual agreement. Shipping within Germany subject to charge.',
        auftrag_photo_h4: 'Select Your Own Photo Reference (Optional)',
        auftrag_photo_hint: 'Select your pet or landscape photo here to preview it. The photo stays on your device and is not transmitted with the inquiry.',
        auftrag_photo_input_label: 'Select photo reference',
        auftrag_photo_preview_alt: 'Photo reference preview',
        auftrag_photo_loaded: 'Photo reference loaded',
        auftrag_photo_ready: 'Please send the photo by email or WhatsApp after your inquiry.',
        auftrag_summary_referenz: 'Reference',
        auftrag_submit: 'Send Non-Binding Inquiry Now'
    }
};

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

/** Liefert die sprachabhängige Beschriftung für Favoriten-Buttons (Herz-Icons). */
function favButtonLabel(isAdded) {
    const dict = (typeof I18N_DICTIONARY !== 'undefined' && I18N_DICTIONARY[currentLang]) ? I18N_DICTIONARY[currentLang] : null;
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
                const match = link.href.match(/([^\/]+)\.webp$/i);
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

function initGalleryZoomCircles() {
    initFavButtonsUI();
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
            const dict = (typeof I18N_DICTIONARY !== 'undefined' && I18N_DICTIONARY[currentLang]) ? I18N_DICTIONARY[currentLang] : null;
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
            const dict = I18N_DICTIONARY[currentLang] || I18N_DICTIONARY.de;
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
function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form || form.dataset.initContactForm) return;
    form.dataset.initContactForm = 'true';

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
                    ? `<i class="fa fa-exclamation-circle" aria-hidden="true"></i> An error occurred while sending${errorDetail}. Please try again or contact me directly at <a href="mailto:manufaktur-malerei@web.de">manufaktur-malerei@web.de</a>`
                    : `<i class="fa fa-exclamation-circle" aria-hidden="true"></i> Es ist ein Fehler aufgetreten${errorDetail}. Bitte versuche es erneut oder schreibe direkt an <a href="mailto:manufaktur-malerei@web.de">manufaktur-malerei@web.de</a>`;
                showFormFeedback('error', errorMsg);
            }
        } catch {
            const connMsg = isEn
                ? '<i class="fa fa-exclamation-circle" aria-hidden="true"></i> Connection error. Please contact me directly at <a href="mailto:manufaktur-malerei@web.de">manufaktur-malerei@web.de</a>'
                : '<i class="fa fa-exclamation-circle" aria-hidden="true"></i> Verbindungsfehler. Bitte schreibe direkt an <a href="mailto:manufaktur-malerei@web.de">manufaktur-malerei@web.de</a>';
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
        applyTranslations(currentLang);
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