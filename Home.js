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
    if (icon) {
        icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
    if (text) {
        if (currentLang === 'en') {
            text.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        } else {
            text.textContent = isDark ? 'Hellmodus' : 'Dunkelmodus';
        }
    }
    btn.setAttribute('aria-label', isDark 
        ? (currentLang === 'en' ? 'Switch to Light Mode' : 'Zu Hellmodus wechseln')
        : (currentLang === 'en' ? 'Switch to Dark Mode' : 'Zu Dunkelmodus wechseln'));
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
    if (text) {
        text.textContent = currentLang === 'de' ? 'EN (English)' : 'DE (Deutsch)';
    }
    btn.setAttribute('aria-label', currentLang === 'de' ? 'Sprache zu Englisch wechseln' : 'Switch language to German');
}

/* =========================================
   1. SHARED COMPONENTS (Nav & Footer)
   ========================================= */

function initHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.onclick = function () {
            const active = navLinks.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', active ? 'true' : 'false');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.className = active ? 'fa fa-close' : 'fa fa-bars';
            }
        };
    }
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
      <h4>ManuFAKTUR</h4>
      <p class="footer-tagline">${isEn ? 'Custom Paintings & Craftsmanship' : 'Individuelle Malerei & Handwerkskunst'}</p>
      <p><i class="fa fa-envelope" aria-hidden="true"></i> <a href="mailto:manufaktur-malerei@web.de">manufaktur-malerei@web.de</a></p>
      <p><i class="fa fa-phone" aria-hidden="true"></i> <span id="footer-phone-text">${isEn ? 'Phone: Upon Request' : 'Telefon: Auf Anfrage'}</span></p>
    </div>
    <div class="footer-section">
      <h4>Manuela Schenk</h4>
      <p>53175 Bonn &bull; ${isEn ? 'Germany' : 'Deutschland'}</p>
      <div class="social-icons">
        <a href="https://www.instagram.com/manufakturmalerei?igsh=MXVncGlnZDNpeWc4ag==" target="_blank" rel="noopener" class="instagram" aria-label="${isEn ? 'Follow on Instagram' : 'Folge uns auf Instagram'}"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a>
        <a href="https://wa.me/491632662435" target="_blank" rel="noopener" class="whatsapp" aria-label="${isEn ? 'Contact on WhatsApp' : 'Kontaktiere uns auf WhatsApp'}"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a>
        <a href="https://www.linkedin.com/in/manuela-schenk" target="_blank" rel="noopener" class="linkedin" aria-label="${isEn ? 'Connect on LinkedIn' : 'Verbinde dich auf LinkedIn'}"><i class="fa-brands fa-linkedin" aria-hidden="true"></i></a>
      </div>
    </div>
    <div class="footer-section">
      <h4>${isEn ? 'Legal' : 'Rechtliches'}</h4>
      <p>&copy; ${new Date().getFullYear()} ManuFAKTUR Schenk</p>
      <p class="font-size-09rem">
        <a href="Impressum.html">${isEn ? 'Imprint' : 'Impressum'}</a> |
        <a href="Datenschutz.html">${isEn ? 'Privacy Policy' : 'Datenschutz'}</a>
      </p>
    </div>
    <div class="footer-section footer-settings">
      <h4>${isEn ? 'Preferences' : 'Einstellungen'}</h4>
      <div class="footer-controls-group">
        <button type="button" id="theme-toggle-btn" class="footer-toggle-btn" onclick="toggleTheme()" aria-label="${isDark ? (isEn ? 'Switch to Light Mode' : 'Zu Hellmodus wechseln') : (isEn ? 'Switch to Dark Mode' : 'Zu Dunkelmodus wechseln')}" title="${isEn ? 'Toggle Dark / Light Mode' : 'Dark / Light Mode wechseln'}">
          <i class="${isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}" id="theme-toggle-icon" aria-hidden="true"></i>
          <span id="theme-toggle-text">${isDark ? (isEn ? 'Light Mode' : 'Hellmodus') : (isEn ? 'Dark Mode' : 'Dunkelmodus')}</span>
        </button>
        <button type="button" id="lang-toggle-btn" class="footer-toggle-btn" onclick="toggleLanguage()" aria-label="${isEn ? 'Switch to German' : 'Sprache zu Englisch wechseln'}" title="${isEn ? 'Switch to German' : 'Auf Englisch wechseln'}">
          <i class="fa-solid fa-globe" aria-hidden="true"></i>
          <span id="lang-toggle-text">${isEn ? 'DE (Deutsch)' : 'EN (English)'}</span>
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
        hero_title: 'ManuFAKTUR',
        hero_subtitle: 'Individuelle Malerei & Handwerkskunst',
        hero_btn: 'Entdecke mehr!',
        home_welcome_title: 'Herzlich Willkommen',
        home_welcome_text: 'Hier entstehen meine Bilder, alle von mir in liebevoller Detailarbeit handgemalt.<br>Qualität und Individualität sind mein Markenzeichen. Ich male für Dich Tierportraits oder Landschaften.',
        badge_handpainted: '100% Handgemalt',
        badge_studio: 'Atelier aus Bonn',
        badge_shipping: 'Versandkostenfrei in DE',
        badge_detail: 'Liebevolle Detailarbeit',
        news_title: 'Neuigkeiten',
        news_1_date: '01. Dezember 2025',
        news_1_title: 'Adventszeit',
        news_1_text: 'Ab sofort male ich auch individuelle Motive für den Advent.',
        news_2_date: '22. November 2025',
        news_2_title: 'Weihnachtskarten jetzt verfügbar!',
        news_2_text: 'Ab sofort male ich auch individuelle Motive für Weihnachtskarten.',
        news_3_date: '10. Oktober 2025',
        news_3_title: 'Neue Tierportraits in der Galerie',
        news_3_text: 'Meine Bildergalerie wurde um viele neue Werke erweitert. Schau gerne vorbei und lass Dich inspirieren!',
        highlights_title: 'Aktuelle Highlights',
        highlights_intro: 'Eine kleine Auswahl meiner neuesten Gemälde aus dem Jahr 2025.',
        testimonials_title: 'Das sagen meine Kunden',
        testimonials_intro: 'Echte Erfahrungen & Rückmeldungen von begeisterten Meistbestellern:',
        cta_title: 'Bereit für Dein individuelles Kunstwerk?',
        cta_text: 'Entdecke die Vielfalt handgemalter Originale oder lass Dein ganz persönliches Wunschmotiv anfertigen.',
        cta_btn_order: 'Jetzt Auftrag anfragen',
        cta_btn_gallery: 'Galerie entdecken',
        about_page_title: 'Über mich',
        about_intro: 'Lerne die Künstlerin hinter den Bildern kennen.',
        about_profile_title: 'Steckbrief',
        about_profile_loc: 'Bonn (Bad Godesberg)',
        about_profile_dog: 'Balou',
        about_profile_motifs: 'Tierportraits, Lieblingsorte & Landschaften',
        about_profile_tech: 'Acryl, Öl, Ölkreide, Mischtechniken',
        about_profile_edu: 'Alanus Hochschule Alfter, Art Studio Maryam Khalili',
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
        ba_title: 'Vom Foto zum Kunstwerk (Vorher / Nachher)',
        ba_hint: 'Ziehe den Schieberegler hin und her, um die Verwandlung von der Fotovorlage zum fertigen Gemälde zu sehen:',
        ba_photo: 'Originalfoto',
        ba_painting: 'Handgemaltes Gemälde',
        steps_title: 'In 4 einfachen Schritten zu Deinem Kunstwerk',
        step_1_title: '1. Fotovorlage senden',
        step_1_desc: 'Sende mir ein oder mehrere Fotos Deines Tieres oder Deines Lieblingsortes.',
        step_2_title: '2. Format & Technik abstimmen',
        step_2_desc: 'Gemeinsam wählen wir die ideale Größe und Maltechnik (Acryl, Öl oder Mischtechnik).',
        step_3_title: '3. Entstehung im Atelier',
        step_3_desc: 'Mit viel Liebe zum Detail und hochwertigen Künstlerfarben entsteht Dein Unikat.',
        step_4_title: '4. Sicherer Versand',
        step_4_desc: 'Sorgfältig verpackt und versichert kommt Dein Bild direkt zu Dir nach Hause.',
        faq_title: 'Häufig gestellte Fragen (FAQ)',
        faq_1_q: 'Welche Qualität muss die Fotovorlage haben?',
        faq_1_a: 'Je schärfer das Foto, desto mehr Details kann ich malen. Ein klares Handyfoto bei Tageslicht, auf dem Augen und Fellstruktur gut zu erkennen sind, reicht meistens völlig aus.',
        faq_2_q: 'Wie lange dauert die Erstellung eines Bildes?',
        faq_2_a: 'Je nach Technik (Acryl trocknet schneller als Öl) und aktueller Auftragslage dauert die Fertigstellung in der Regel 2 bis 4 Wochen. Bitte bestelle rechtzeitig, wenn es ein Geschenk sein soll!',
        faq_3_q: 'Wie lange dauert der Versand?',
        faq_3_a: 'Der Versand innerhalb Deutschlands dauert nach Fertigstellung und Durchtrocknung meist 2 bis 4 Werktage (versichert mit Sendungsverfolgung).',
        faq_4_q: 'Wie läuft die Bezahlung ab?',
        faq_4_a: 'Nach Fertigstellung sende ich Dir ein hochauflösendes Foto des Bildes. Erst wenn Du vollkommen zufrieden bist, begleichst Du die Rechnung bequem per Überweisung oder PayPal.',
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
        sort_default: 'Standard',
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
        room_artwork_alt: 'Gemälde an der Wand',
        room_label_size: 'Größe:',
        room_scale_aria: 'Gemäldegröße anpassen',
        room_label_rotation: 'Drehung:',
        room_rotation_aria: 'Neigung anpassen',
        room_rotate_btn: '90° Drehen',
        room_fit_title: 'Automatisch an Wand anpassen',
        room_fit_btn: 'Auto-Wand-Fit',
        room_backdrop_label: 'Raumkulisse:',
        room_upload_label: 'Eigene Wand hochladen',
        clear_search_aria: 'Suche zurücksetzen',
        format_label: 'Format:',
        color_label: 'Farbe:',
        lb_btn_inquiry: 'Motiv als Auftrag anfragen',
        lb_btn_room: 'In deinem Raum ansehen',
        lb_btn_fav_add: 'Zu Favoriten hinzufügen',
        lb_btn_fav_remove: 'Aus Favoriten entfernen',
        lb_rotate: '90° Drehen',
        lb_zoom: 'Lupe Zoom',
        lb_center: 'Zentrieren',
        room_modal_title: 'In deinem Raum ansehen',
        room_modal_desc: 'Erlebe das Gemälde maßstabsgetreu in verschiedenen Raumkulissen oder auf deiner eigenen Wand.',
        room_preset_living: 'Modernes Wohnzimmer',
        room_preset_bedroom: 'Schlafzimmer',
        room_preset_gallery: 'Galerie-Wand',
        room_btn_close: 'Schließen',
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
        calc_title: 'Preiskalkulator',
        calc_price_label: 'Geschätzter Richtpreis:',
        contact_page_title: 'Kontakt',
        contact_intro: 'Ich freue mich über Deine Nachricht, Fragen zu meinen Werken oder Auftragsanfragen.',
        contact_direct_title: 'Direkter Kontakt',
        contact_studio_title: 'Atelier Standort',
        contact_studio_desc: 'Bonn, Deutschland (Besuche nach Absprache)',
        contact_form_title: 'Nachricht schreiben',
        contact_btn_send: 'Nachricht senden',
        map_title: 'Google Maps Karte aktivieren',
        map_text: 'Aus Datenschutzgründen wird die interaktive Karte erst nach einem Klick geladen.',
        map_btn: 'Karte laden',
        imprint_page_title: 'Impressum',
        imprint_intro: 'Gesetzliche Anbieterkennzeichnung und Angaben gemäß § 5 DDG.',
        privacy_page_title: 'Datenschutzerklärung',
        privacy_intro: 'Informationen über die Verarbeitung deiner personenbezogenen Daten.',
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
        testi1_location: 'Bonn-Bad Godesberg · Tierportrait in Acryl',
        testi2_quote: '„Ich habe ein Landschaftsbild der Rheinaue als Geschenk zur Hochzeit bestellt. Die Abstimmung war super unkompliziert und das Brautpaar war zu Tränen gerührt.“',
        testi2_location: 'Rhein-Sieg-Kreis · Landschaftsgemälde',
        testi3_quote: '„Wunderschöne Arbeit! Man merkt bei jedem Pinselstrich die Liebe zum Detail. Das Bild hat jetzt einen zentralen Ehrenplatz in unserem Wohnzimmer.“',
        testi3_location: 'Köln · Hundeportrait & Stillleben',
        testi_prev_aria: 'Vorherige Kundenstimme',
        testi_next_aria: 'Nächste Kundenstimme',
        home_btn_gallery: 'Zur Galerie',
        home_btn_flyer: 'Flyer Download',

        // UeberMich.html
        process_h2: 'Der Entstehungsprozess eines Kunstwerks',
        process_intro: 'Jedes Gemälde entsteht in präziser Handarbeit in mehreren abgestimmten Phasen:',
        process1_title: 'Skizze & Proportionen',
        process1_text: 'Exakte Übertragung deines Fotomotivs auf die Leinwand als feine Vorzeichnung.',
        process2_title: 'Farbauftrag & Schichtung',
        process2_text: 'Auftrag der ersten Farbschichten für Tiefe, Schatten und charakteristische Lichtakzente.',
        process3_title: 'Details & Veredelung',
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
        timeline_h2: 'Mein Weg zur Kunst',
        tl1_title: 'Die ersten Schritte',
        tl1_text: 'Erste Fachkurse an der VHS Bonn und der Kunstschule Aachen. Die Begeisterung für Farben, Licht und Formen wurde zur lebenslangen Leidenschaft.',
        tl2_title: 'Das erste Tierportrait: Balou',
        tl2_text: 'Das Porträt unseres Hundes Balou markierte den Beginn meiner Spezialisierung auf Tierportraits – die emotionale Resonanz war überwältigend.',
        tl3_title: 'Akademische Vertiefung',
        tl3_text: 'Jahreskurs und Intensivseminare an der Alanus Hochschule Alfter bei Kehlenbach, Genschow, Hendel und Thein zur Verfeinerung von Technik und Ausdruck.',
        tl4_title: 'Gründung der ManuFAKTUR Schenk',
        tl4_text: 'Eröffnung des Ateliers in Bonn-Bad Godesberg und Beginn professioneller Auftragsarbeiten für Kunden aus ganz Deutschland.',
        tl5_date: 'Heute',
        tl5_title: 'Kunst für Dein Zuhause',
        tl5_text: 'Mit über 50 individuellen Unikaten und vielen glücklichen Auftraggebern schaffe ich bleibende Werte und persönliche Erinnerungsstücke.',
        ba_h2: 'Handgemalte Präzision: Vorher & Nachher',
        ba_intro: 'Schiebe den Regler, um die Vorlage mit dem fertigen Acrylgemälde zu vergleichen:',
        ba_after_alt: 'Fertiges handgemaltes Gemälde',
        ba_after_badge: 'Handgemaltes Gemälde',
        ba_before_alt: 'Original Fotovorlage',
        ba_before_badge: 'Original Fotovorlage',
        ba_slider_aria: 'Vorher Nachher Vergleich Schieberegler',
        flyer_h2: 'Mein Info-Flyer',
        flyer_text: 'Klicke auf ein Bild für die Großansicht oder lade dir den Flyer als PDF herunter.',
        flyer_front_alt: 'Vorderseite des Informationsflyers von ManuFAKTUR Schenk',
        flyer_back_alt: 'Rückseite des Informationsflyers von ManuFAKTUR Schenk',
        flyer_btn: 'Flyer herunterladen (PDF)',

        // Leistungen.html (Ergänzungen)
        faq_3_q_ship: 'Wie lange dauert der Versand?',
        faq_3_a_ship: 'Nach Fertigstellung und Trocknung verschicke ich Dein Bild per DHL oder DPD gut gepolstert und <strong>versandkostenfrei</strong> innerhalb Deutschlands.',
        calc_h2: 'Vorab-Preiskalkulator',
        calc_intro: 'Berechne hier unverbindlich einen geschätzten Richtpreis für dein Wunschgemälde:',
        calc_label_motiv: 'Motiv-Kategorie',
        calc_opt_motiv1: 'Tierportrait (Hund, Katze, etc.)',
        calc_opt_motiv2: 'Landschaft & Natur',
        calc_opt_motiv3: 'Stillleben & Blumen',
        calc_opt_motiv4: 'Sonstiges / Wunschidee',
        calc_label_format: 'Format / Leinwandgröße',
        calc_opt_format1: '20 × 30 cm (Klein · ab 90 €)',
        calc_opt_format2: '30 × 40 cm (Beliebt · ab 130 €)',
        calc_opt_format3: '40 × 50 cm (Mittel · ab 175 €)',
        calc_opt_format4: '50 × 70 cm (Groß · ab 230 €)',
        calc_opt_format5: '60 × 80 cm (XL · ab 290 €)',
        calc_label_technik: 'Maltechnik',
        calc_opt_tech1: 'Acryl auf Leinwand (Klassisch)',
        calc_opt_tech2: 'Öl auf Leinwand (+15%)',
        calc_opt_tech3: 'Bleistift / Kohlezeichnung (-15%)',
        calc_opt_tech4: 'Aquarell auf Feinkarton',
        calc_label_anzahl: 'Motive auf einem Bild',
        calc_opt_anzahl1: '1 Hauptmotiv (+0 €)',
        calc_opt_anzahl2: '2 Motive (+35 €)',
        calc_opt_anzahl3: '3 Motive (+65 €)',
        calc_price_title: 'Geschätzter Richtpreis',
        calc_price_hint: 'Genaue Preisvereinbarung erfolgt individuell vor Beginn. Inklusive kostenfreiem Versand innerhalb Deutschlands.',
        calc_btn: 'Jetzt als Auftrag konfigurieren',
        voucher_h2: 'Kunst schenken – Der ManuFAKTUR Gutschein',
        voucher_text: 'Auf der Suche nach einem unvergesslichen Geschenk für Tierliebhaber oder Kunstbegeisterte? Ein maßgeschneiderter Gutschein für ein Auftragsgemälde bringt Augen zum Leuchten.',
        voucher_btn: 'Gutschein anfragen',
        leist_ba_h2: 'Vom Foto zum Unikat: Vorher & Nachher',
        leist_ba_intro: 'Ziehe den Schieberegler, um die Fotovorlage mit dem handgemalten Ergebnis zu vergleichen:',
        leist_ba_before_alt: 'Fotovorlage',
        leist_cta_text: 'Hast Du noch weitere Fragen oder eigene Wünsche?',
        leist_cta_btn1: 'Auftrag konfigurieren',
        leist_cta_btn2: 'Kontaktiere mich gerne!',

        // Kontakt.html
        kontakt_vcard_title: 'Digitale Visitenkarte',
        kontakt_vcard_hint: 'Bewege die Maus über die Karte oder tippe sie an, um sie umzudrehen.',
        kontakt_vcard_aria: 'Digitale Visitenkarte von Manuela Schenk. Drücke Enter oder die Leertaste zum Umdrehen.',
        kontakt_vcard_role: 'Künstlerin & Inhaberin',
        kontakt_vcard_save: 'Kontakt speichern (.vcf)',
        kontakt_city: 'Bonn, Deutschland',
        kontakt_address: '53175 Bonn, Deutschland',
        social_ig_label: 'Folge mir auf Instagram',
        social_wa_label: 'Schreibe mir auf WhatsApp',
        social_li_label: 'Verbinde dich auf LinkedIn',
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
        kontakt_privacy_label: 'Ich stimme zu, dass meine Angaben aus dem Kontaktformular zur Beantwortung meiner Anfrage erhoben und verarbeitet werden. Hinweis: Sie können Ihre Einwilligung jederzeit für die Zukunft per E‑Mail widerrufen. Detaillierte Informationen findest Du in unserer <a href="Datenschutz.html" target="_blank" rel="noopener">Datenschutzerklärung</a>.',
        kontakt_map_h2: 'Standorts-Karte (Bonn)',
        kontakt_map_text: 'Aus Datenschutzgründen wird die Karte erst geladen, wenn du auf den Button klickst. Dabei können Daten an Google übertragen werden.',
        kontakt_map_btn: 'Karte jetzt laden & anzeigen',

        // Impressum.html
        impressum_map_title: 'Google Maps laden',
        impressum_map_text: 'Um die interaktive Karte anzuzeigen, klicken Sie bitte auf "Karte laden". Dadurch stimmen Sie der Übertragung Ihrer IP-Adresse an Google und der Verarbeitung von Cookies gemäß der Datenschutzrichtlinien von Google zu. (Details in unserer <a href="Datenschutz.html" target="_blank" rel="noopener">Datenschutzerklärung</a>)',
        impressum_map_btn: 'Karte laden',
        impressum_h_tmg: 'Angaben gemäß § 5 TMG',
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
        dsgvo_notice_title: 'Wichtiger Hinweis:',
        dsgvo_notice_text: 'Dies ist eine Übersicht der auf dieser Webseite eingesetzten Techniken. Bitte erstellen Sie für den produktiven Einsatz einen individuellen, rechtskonformen Rechtstext, z.B. über einen Datenschutz-Generator (z.B. von e-recht24.de).',
        dsgvo_h1: '1. Datenschutz auf einen Blick',
        dsgvo_h1_1: 'Allgemeine Hinweise',
        dsgvo_h1_1_text: 'Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.',
        dsgvo_h1_2: 'Datenerfassung auf unserer Website',
        dsgvo_h1_2_text1: '<strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.',
        dsgvo_h1_2_text2: '<strong>Wie erfassen wir Ihre Daten?</strong><br>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).',
        dsgvo_h2: '2. Hosting und Server-Log-Files',
        dsgvo_h2_text: 'Wir hosten die Inhalte unserer Website bei einem Hoster in Deutschland. Der Hoster erhebt automatisch Informationen in sogenannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt (IP-Adresse, Browsertyp, Referrer URL, Uhrzeit des Serveraufrufs). Diese Daten werden zur Gewährleistung eines sicheren Betriebs erhoben.',
        dsgvo_h3: '3. Lokale Einbindung von Schriftarten & Symbolen (DSGVO-konform)',
        dsgvo_h3_intro: 'Um die Privatsphäre unserer Besucher bestmöglich zu schützen, nutzen wir keine CDNs (Content Delivery Networks) von Drittanbietern für Schriften oder Icons:',
        dsgvo_h3_li1: '<strong>Google Fonts:</strong> Alle verwendeten Google Fonts (Lato, Playfair Display, Dancing Script) sind lokal auf unserem Webserver gespeichert und werden von dort geladen. Es besteht keine Verbindung zu Servern von Google.',
        dsgvo_h3_li2: '<strong>Font Awesome:</strong> Die verwendeten Icons und Stylesheets von Font Awesome sind ebenfalls lokal auf unserem Webserver gehostet. Es findet kein Datentransfer zu Drittservern statt.',
        dsgvo_h4: '4. Einwilligungspflichtige Dienste von Drittanbietern',
        dsgvo_h4_1: 'Google Maps (Zwei-Klick-Lösung)',
        dsgvo_h4_1_text: 'Auf unserer Website ist eine Karte von Google Maps eingebunden. Um zu verhindern, dass bereits beim Laden der Seite Ihre IP-Adresse an Google übertragen wird, nutzen wir eine sogenannte Zwei-Klick-Lösung. Die Karte ist standardmäßig deaktiviert. Erst wenn Sie aktiv auf die Schaltfläche "Karte laden" klicken, willigen Sie ein, dass eine Verbindung zu den Google-Servern aufgebaut und Cookies gesetzt werden. Rechtsgrundlage für diese Verarbeitung ist Ihre Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO.',
        dsgvo_h5: '5. Datenerfassung über das Kontaktformular',
        dsgvo_h5_text1: 'Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.',
        dsgvo_h5_text2: 'Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO) oder auf Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), falls diese abgefragt wurde.',
        dsgvo_h6: '6. Ihre Rechte bezüglich Ihrer Daten',
        dsgvo_h6_text: 'Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen. Wenden Sie sich hierzu einfach an die im Impressum genannte Adresse.',

        // Auftrag.html Konfigurator (data-i18n)
        auftrag_restore_text: 'Du hast eine gespeicherte Konfiguration. <button onclick="restoreSavedConfig()" id="restore-btn">Wiederherstellen</button> oder <button onclick="clearSavedConfig()" id="clear-btn">Neu starten</button>.',
        auftrag_fav_title: 'Aus deinen gemerkten Favoriten wählen',
        auftrag_fav_hint: 'Klicke auf eines deiner gemerkten Lieblingswerke, um es als Motiv-Inspiration zu übernehmen:',
        auftrag_motiv1_title: 'Tierportrait',
        auftrag_motiv1_desc: 'Hund, Katze, Pferd oder jedes andere Tier – als unvergängliches Gemälde.',
        auftrag_motiv1_price: 'ab 120 €',
        auftrag_motiv2_title: 'Landschaft',
        auftrag_motiv2_desc: 'Ein besonderer Ort, eine Urlaubserinnerung oder eine traumhafte Szene.',
        auftrag_motiv2_price: 'ab 100 €',
        auftrag_motiv3_title: 'Stillleben / Pflanzen',
        auftrag_motiv3_desc: 'Blumen, Früchte oder andere Objekte als dekoratives Gemälde.',
        auftrag_motiv3_price: 'ab 90 €',
        auftrag_motiv4_title: 'Sonstiges / Eigene Idee',
        auftrag_motiv4_desc: 'Du hast eine ganz eigene Idee? Ich male nach deinem Wunschmotiv.',
        auftrag_motiv4_price: 'Auf Anfrage',
        auftrag_hint1: 'Bitte wähle ein Motiv, um fortzufahren.',
        auftrag_next_format: 'Weiter: Format',
        auftrag_format1_small: 'Klein · ideal als Geschenk',
        auftrag_format2_small: 'Beliebt · viele Details',
        auftrag_format3_small: 'Mittel · sehr ausdrucksstark',
        auftrag_format4_small: 'Groß · imposanter Blickfang',
        auftrag_format5_small: 'XL · für große Wände',
        auftrag_format6_title: 'Individuell',
        auftrag_format6_small: 'Wunschformat · auf Anfrage',
        auftrag_hint2: 'Bitte wähle ein Format, um fortzufahren.',
        auftrag_back: 'Zurück',
        auftrag_next_technik: 'Weiter: Technik',
        auftrag_tech1_title: 'Acrylfarben',
        auftrag_tech1_desc: 'Schnelle Trocknungszeit, kräftige Farben und lebhafte Kontraste. Perfekt für detailreiche Portraits.',
        auftrag_tech1_delivery: 'Lieferung in ca. 2–3 Wochen',
        auftrag_tech2_title: 'Ölfarben',
        auftrag_tech2_desc: 'Tiefe, samtige Farbübergänge und klassische Eleganz. Mehr Trocknungszeit, intensives Finish.',
        auftrag_tech2_delivery: 'Lieferung in ca. 4–6 Wochen',
        auftrag_hint3: 'Bitte wähle eine Technik, um fortzufahren.',
        auftrag_next_summary: 'Zur Zusammenfassung',
        auftrag_summary_h3: 'Dein Traumgemälde ✨',
        auftrag_summary_motiv: 'Motiv',
        auftrag_summary_format: 'Format',
        auftrag_summary_technik: 'Technik',
        auftrag_summary_lieferzeit: 'Lieferzeit',
        auftrag_price_label: 'Unverbindliche Preisschätzung',
        auftrag_price_note: '* Endpreis nach individueller Absprache. Versand innerhalb DE kostenlos.',
        auftrag_photo_h4: 'Eigenes Fotovorlage-Bild auswählen (Optional)',
        auftrag_photo_hint: 'Du kannst hier dein Haustier- oder Landschaftsfoto auswählen, um die Vorlage direkt zu prüfen:',
        auftrag_photo_input_label: 'Fotovorlage auswählen',
        auftrag_photo_preview_alt: 'Fotovorlage Vorschau',
        auftrag_photo_loaded: 'Fotovorlage geladen',
        auftrag_photo_ready: 'Bereit für die Anfrage',
        auftrag_submit: 'Jetzt unverbindlich anfragen'
    },
    en: {
        skip_link: 'Skip to main content',
        back_to_top: 'Back to top',
        hero_title: 'ManuFAKTUR',
        hero_subtitle: 'Custom Paintings & Craftsmanship',
        hero_btn: 'Discover More!',
        home_welcome_title: 'Welcome',
        home_welcome_text: 'Here my paintings come to life, all lovingly hand-painted by me in exquisite detail.<br>Quality and individuality are my hallmarks. I create custom animal portraits and landscapes for you.',
        badge_handpainted: '100% Hand-painted',
        badge_studio: 'Studio in Bonn, Germany',
        badge_shipping: 'Free Shipping in DE',
        badge_detail: 'Loving Attention to Detail',
        news_title: 'Latest News',
        news_1_date: 'December 01, 2025',
        news_1_title: 'Advent Season',
        news_1_text: 'Custom holiday and winter motifs are now available upon request.',
        news_2_date: 'November 22, 2025',
        news_2_title: 'Christmas Cards Available Now!',
        news_2_text: 'I am now painting individual custom motifs for fine art Christmas cards.',
        news_3_date: 'October 10, 2025',
        news_3_title: 'New Animal Portraits in Gallery',
        news_3_text: 'My art gallery has been enriched with many new original works. Come explore and get inspired!',
        highlights_title: 'Current Highlights',
        highlights_intro: 'A curated selection of my newest original paintings from 2025.',
        testimonials_title: 'What My Clients Say',
        testimonials_intro: 'Genuine experiences & feedback from happy art enthusiasts:',
        cta_title: 'Ready for Your Custom Artwork?',
        cta_text: 'Discover the collection of hand-painted originals or commission your very own personal motif.',
        cta_btn_order: 'Request Commission Now',
        cta_btn_gallery: 'Explore Gallery',
        about_page_title: 'About Me',
        about_intro: 'Get to know the artist behind the canvas.',
        about_profile_title: 'Profile',
        about_profile_loc: 'Bonn (Bad Godesberg), Germany',
        about_profile_dog: 'Balou',
        about_profile_motifs: 'Animal portraits, favorite places & landscapes',
        about_profile_tech: 'Acrylic, Oil, Oil Pastel, Mixed Media',
        about_profile_edu: 'Alanus University Alfter, Art Studio Maryam Khalili',
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
        ba_title: 'From Photo to Artwork (Before / After)',
        ba_hint: 'Drag the interactive slider to see the transformation from photo reference to finished painting:',
        ba_photo: 'Original Photo',
        ba_painting: 'Hand-painted Artwork',
        steps_title: 'In 4 Simple Steps to Your Artwork',
        step_1_title: '1. Send Photo Reference',
        step_1_desc: 'Send me one or more clear photos of your pet, landscape or favorite place.',
        step_2_title: '2. Select Format & Technique',
        step_2_desc: 'Together we choose the perfect size and medium (acrylic, oil, or mixed media).',
        step_3_title: '3. Creation in Studio',
        step_3_desc: 'Your unique original is hand-crafted with premium artist pigments in my Bonn studio.',
        step_4_title: '4. Safe Delivery',
        step_4_desc: 'Carefully cushioned, safely packaged and insured right to your doorstep.',
        faq_title: 'Frequently Asked Questions (FAQ)',
        faq_1_q: 'What quality does the photo reference need to have?',
        faq_1_a: 'The clearer the photo, the finer the details I can paint. A crisp smartphone photo taken in natural daylight where eyes and fur texture are clearly visible is usually ideal.',
        faq_2_q: 'How long does it take to create a painting?',
        faq_2_a: 'Depending on the technique (acrylic dries faster than oil) and current commissions, completion typically takes 2 to 4 weeks. Please order well in advance for gifts!',
        faq_3_q: 'How long does shipping take?',
        faq_3_a: 'Shipping within Germany takes 2 to 4 business days after full drying and packaging (fully insured with tracking number). International shipping is also available upon request.',
        faq_4_q: 'How does payment work?',
        faq_4_a: 'Upon completion, I send you high-resolution photos of the finished painting. You only finalize payment via bank transfer or PayPal once you are completely thrilled with the result.',
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
        sort_default: 'Default',
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
        room_artwork_alt: 'Painting on the wall',
        room_label_size: 'Size:',
        room_scale_aria: "Adjust the painting's size",
        room_label_rotation: 'Rotation:',
        room_rotation_aria: 'Adjust the tilt',
        room_rotate_btn: 'Rotate 90°',
        room_fit_title: 'Automatically fit to wall',
        room_fit_btn: 'Auto Wall Fit',
        room_backdrop_label: 'Room Backdrop:',
        room_upload_label: 'Upload Your Own Wall',
        clear_search_aria: 'Clear search',
        format_label: 'Format:',
        color_label: 'Color:',
        lb_btn_inquiry: 'Inquire this Motif as Commission',
        lb_btn_room: 'View in Your Room',
        lb_btn_fav_add: 'Add to Favorites',
        lb_btn_fav_remove: 'Remove from Favorites',
        lb_rotate: 'Rotate 90°',
        lb_zoom: 'Magnifier Zoom',
        lb_center: 'Center',
        room_modal_title: 'View in Your Room',
        room_modal_desc: 'Experience the painting true to scale in various interior settings or on your own wall.',
        room_preset_living: 'Modern Living Room',
        room_preset_bedroom: 'Bedroom',
        room_preset_gallery: 'Gallery Wall',
        room_btn_close: 'Close',
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
        calc_title: 'Price Estimator',
        calc_price_label: 'Estimated Price Range:',
        contact_page_title: 'Contact',
        contact_intro: 'I look forward to hearing from you, whether with questions regarding existing artworks or commission requests.',
        contact_direct_title: 'Direct Contact',
        contact_studio_title: 'Studio Location',
        contact_studio_desc: 'Bonn, Germany (Studio visits by appointment)',
        contact_form_title: 'Send a Message',
        contact_btn_send: 'Send Message',
        map_title: 'Activate Google Maps',
        map_text: 'For privacy reasons, the interactive map is only loaded after your consent click.',
        map_btn: 'Load Map',
        imprint_page_title: 'Imprint',
        imprint_intro: 'Legal provider identification and statutory information pursuant to German law (§ 5 DDG).',
        privacy_page_title: 'Privacy Policy',
        privacy_intro: 'Information regarding the processing of your personal data according to GDPR regulations.',
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
        testi1_location: 'Bonn-Bad Godesberg · Animal Portrait in Acrylic',
        testi2_quote: '"I ordered a landscape painting of the Rheinaue as a wedding gift. The coordination was super easy, and the bride and groom were moved to tears."',
        testi2_location: 'Rhein-Sieg District · Landscape Painting',
        testi3_quote: '"Beautiful work! You can feel the love for detail in every brushstroke. The painting now has a central place of honor in our living room."',
        testi3_location: 'Cologne · Dog Portrait & Still Life',
        testi_prev_aria: 'Previous testimonial',
        testi_next_aria: 'Next testimonial',
        home_btn_gallery: 'View Gallery',
        home_btn_flyer: 'Flyer Download',

        // UeberMich.html
        process_h2: 'How Each Artwork Is Created',
        process_intro: 'Every painting is created by hand through several carefully coordinated phases:',
        process1_title: 'Sketch & Proportions',
        process1_text: 'Precise transfer of your photo motif onto the canvas as a fine preliminary sketch.',
        process2_title: 'Color Application & Layering',
        process2_text: 'Applying the first layers of paint for depth, shadow and characteristic highlights.',
        process3_title: 'Details & Finishing',
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
        timeline_h2: 'My Journey into Art',
        tl1_title: 'The First Steps',
        tl1_text: 'First specialized courses at VHS Bonn and the Kunstschule Aachen. My enthusiasm for color, light and form became a lifelong passion.',
        tl2_title: 'The First Animal Portrait: Balou',
        tl2_text: "The portrait of our dog Balou marked the beginning of my specialization in animal portraits – the emotional response was overwhelming.",
        tl3_title: 'Academic Deepening',
        tl3_text: 'Year-long course and intensive seminars at Alanus University Alfter with Kehlenbach, Genschow, Hendel and Thein to refine technique and expression.',
        tl4_title: 'Founding of ManuFAKTUR Schenk',
        tl4_text: 'Opening of the studio in Bonn-Bad Godesberg and the start of professional commissioned work for clients across Germany.',
        tl5_date: 'Today',
        tl5_title: 'Art for Your Home',
        tl5_text: 'With over 50 individual originals and many happy clients, I create lasting value and personal keepsakes.',
        ba_h2: 'Hand-Painted Precision: Before & After',
        ba_intro: 'Drag the slider to compare the reference photo with the finished acrylic painting:',
        ba_after_alt: 'Finished hand-painted artwork',
        ba_after_badge: 'Hand-Painted Artwork',
        ba_before_alt: 'Original photo reference',
        ba_before_badge: 'Original Photo Reference',
        ba_slider_aria: 'Before and after comparison slider',
        flyer_h2: 'My Info Flyer',
        flyer_text: 'Click on an image for a larger view or download the flyer as a PDF.',
        flyer_front_alt: 'Front side of the ManuFAKTUR Schenk information flyer',
        flyer_back_alt: 'Back side of the ManuFAKTUR Schenk information flyer',
        flyer_btn: 'Download Flyer (PDF)',

        // Leistungen.html (additions)
        faq_3_q_ship: 'How long does shipping take?',
        faq_3_a_ship: 'Once finished and fully dry, I ship your painting well-cushioned via DHL or DPD, <strong>free of charge</strong> within Germany.',
        calc_h2: 'Price Estimator',
        calc_intro: 'Calculate a non-binding estimated price for your desired painting here:',
        calc_label_motiv: 'Motif Category',
        calc_opt_motiv1: 'Animal Portrait (dog, cat, etc.)',
        calc_opt_motiv2: 'Landscape & Nature',
        calc_opt_motiv3: 'Still Life & Flowers',
        calc_opt_motiv4: 'Other / Custom Idea',
        calc_label_format: 'Format / Canvas Size',
        calc_opt_format1: '20 × 30 cm (Small · from €90)',
        calc_opt_format2: '30 × 40 cm (Popular · from €130)',
        calc_opt_format3: '40 × 50 cm (Medium · from €175)',
        calc_opt_format4: '50 × 70 cm (Large · from €230)',
        calc_opt_format5: '60 × 80 cm (XL · from €290)',
        calc_label_technik: 'Painting Technique',
        calc_opt_tech1: 'Acrylic on Canvas (Classic)',
        calc_opt_tech2: 'Oil on Canvas (+15%)',
        calc_opt_tech3: 'Pencil / Charcoal Drawing (-15%)',
        calc_opt_tech4: 'Watercolor on Fine Card',
        calc_label_anzahl: 'Motifs in One Painting',
        calc_opt_anzahl1: '1 Main Motif (+€0)',
        calc_opt_anzahl2: '2 Motifs (+€35)',
        calc_opt_anzahl3: '3 Motifs (+€65)',
        calc_price_title: 'Estimated Guide Price',
        calc_price_hint: 'The exact price is agreed individually before starting. Includes free shipping within Germany.',
        calc_btn: 'Configure as a Commission Now',
        voucher_h2: 'Give the Gift of Art – The ManuFAKTUR Voucher',
        voucher_text: 'Looking for an unforgettable gift for animal lovers or art enthusiasts? A custom voucher for a commissioned painting makes eyes light up.',
        voucher_btn: 'Request a Voucher',
        leist_ba_h2: 'From Photo to Original: Before & After',
        leist_ba_intro: 'Drag the slider to compare the photo reference with the hand-painted result:',
        leist_ba_before_alt: 'Photo reference',
        leist_cta_text: 'Do you have further questions or your own wishes?',
        leist_cta_btn1: 'Configure Commission',
        leist_cta_btn2: "I'd Love to Hear From You!",

        // Kontakt.html
        kontakt_vcard_title: 'Digital Business Card',
        kontakt_vcard_hint: 'Move your mouse over the card or tap it to flip it.',
        kontakt_vcard_aria: 'Digital business card of Manuela Schenk. Press Enter or Space to flip.',
        kontakt_vcard_role: 'Artist & Owner',
        kontakt_vcard_save: 'Save Contact (.vcf)',
        kontakt_city: 'Bonn, Germany',
        kontakt_address: '53175 Bonn, Germany',
        social_ig_label: 'Follow me on Instagram',
        social_wa_label: 'Message me on WhatsApp',
        social_li_label: 'Connect on LinkedIn',
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
        kontakt_map_h2: 'Location Map (Bonn)',
        kontakt_map_text: 'For privacy reasons, the map is only loaded once you click the button. This may transfer data to Google.',
        kontakt_map_btn: 'Load & Show Map Now',

        // Impressum.html
        impressum_map_title: 'Load Google Maps',
        impressum_map_text: 'To display the interactive map, please click "Load Map". By doing so, you consent to the transmission of your IP address to Google and the processing of cookies in accordance with Google\'s privacy policies. (Details in our <a href="Datenschutz.html" target="_blank" rel="noopener">Privacy Policy</a>)',
        impressum_map_btn: 'Load Map',
        impressum_h_tmg: 'Information pursuant to § 5 TMG (German Telemedia Act)',
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

        // Datenschutz.html
        dsgvo_notice_title: 'Important Note:',
        dsgvo_notice_text: 'This is an overview of the technologies used on this website. Please create an individual, legally compliant text for productive use, e.g. via a privacy policy generator (such as e-recht24.de).',
        dsgvo_h1: '1. Privacy at a Glance',
        dsgvo_h1_1: 'General Information',
        dsgvo_h1_1_text: 'The following information provides a simple overview of what happens to your personal data when you visit this website. Personal data is any data that can be used to personally identify you.',
        dsgvo_h1_2: 'Data Collection on Our Website',
        dsgvo_h1_2_text1: '<strong>Who is responsible for data collection on this website?</strong><br>Data processing on this website is carried out by the website operator, whose contact details can be found in the legal notice (Impressum) of this website.',
        dsgvo_h1_2_text2: '<strong>How do we collect your data?</strong><br>Your data is collected in part when you provide it to us. This may, for example, be data you enter into a contact form. Other data is collected automatically, or after your consent, by our IT systems when you visit the website. This is primarily technical data (e.g. internet browser, operating system, or time of page access).',
        dsgvo_h2: '2. Hosting and Server Log Files',
        dsgvo_h2_text: 'We host our website content with a provider in Germany. The host automatically collects information in so-called server log files, which your browser automatically transmits to us (IP address, browser type, referrer URL, time of server request). This data is collected to ensure secure operation.',
        dsgvo_h3: '3. Local Integration of Fonts & Icons (GDPR-compliant)',
        dsgvo_h3_intro: 'To best protect the privacy of our visitors, we do not use third-party CDNs (Content Delivery Networks) for fonts or icons:',
        dsgvo_h3_li1: '<strong>Google Fonts:</strong> All Google Fonts used (Lato, Playfair Display, Dancing Script) are stored locally on our web server and loaded from there. There is no connection to Google\'s servers.',
        dsgvo_h3_li2: '<strong>Font Awesome:</strong> The Font Awesome icons and stylesheets used are likewise hosted locally on our web server. No data is transferred to third-party servers.',
        dsgvo_h4: '4. Third-Party Services Requiring Consent',
        dsgvo_h4_1: 'Google Maps (Two-Click Solution)',
        dsgvo_h4_1_text: 'Our website includes a Google Maps map. To prevent your IP address from being transmitted to Google as soon as the page loads, we use a so-called two-click solution. The map is disabled by default. Only when you actively click the "Load Map" button do you consent to a connection being established with Google\'s servers and to cookies being set. The legal basis for this processing is your consent pursuant to Art. 6 (1)(a) GDPR.',
        dsgvo_h5: '5. Data Collection via the Contact Form',
        dsgvo_h5_text1: 'If you send us inquiries via the contact form, the information you provide there, including any contact details you enter, will be stored by us for the purpose of processing your inquiry and in case of follow-up questions. We will not share this data without your consent.',
        dsgvo_h5_text2: 'The processing of this data is based on Art. 6 (1)(b) GDPR, provided your inquiry relates to the fulfillment of a contract or is necessary for carrying out pre-contractual measures. In all other cases, processing is based on our legitimate interest in the effective handling of inquiries addressed to us (Art. 6 (1)(f) GDPR), or on your consent (Art. 6 (1)(a) GDPR) where this was requested.',
        dsgvo_h6: '6. Your Rights Regarding Your Data',
        dsgvo_h6_text: 'You have the right at any time to receive free information about the origin, recipients, and purpose of your stored personal data. You also have the right to request the correction or deletion of this data. If you have given consent to data processing, you can revoke this consent at any time for the future. Simply contact us at the address given in the legal notice.',

        // Auftrag.html Configurator (data-i18n)
        auftrag_restore_text: 'You have a saved configuration. <button onclick="restoreSavedConfig()" id="restore-btn">Restore</button> or <button onclick="clearSavedConfig()" id="clear-btn">Start Over</button>.',
        auftrag_fav_title: 'Choose from Your Saved Favorites',
        auftrag_fav_hint: 'Click one of your saved favorite artworks to use it as motif inspiration:',
        auftrag_motiv1_title: 'Animal Portrait',
        auftrag_motiv1_desc: 'Dog, cat, horse or any other animal – as an everlasting painting.',
        auftrag_motiv1_price: 'from €120',
        auftrag_motiv2_title: 'Landscape',
        auftrag_motiv2_desc: 'A special place, a holiday memory, or a dreamlike scene.',
        auftrag_motiv2_price: 'from €100',
        auftrag_motiv3_title: 'Still Life / Plants',
        auftrag_motiv3_desc: 'Flowers, fruit, or other objects as a decorative painting.',
        auftrag_motiv3_price: 'from €90',
        auftrag_motiv4_title: 'Other / Custom Idea',
        auftrag_motiv4_desc: 'Do you have your own idea? I paint according to your desired motif.',
        auftrag_motiv4_price: 'Upon Request',
        auftrag_hint1: 'Please choose a motif to continue.',
        auftrag_next_format: 'Next: Format',
        auftrag_format1_small: 'Small · ideal as a gift',
        auftrag_format2_small: 'Popular · plenty of detail',
        auftrag_format3_small: 'Medium · very expressive',
        auftrag_format4_small: 'Large · an imposing eye-catcher',
        auftrag_format5_small: 'XL · for large walls',
        auftrag_format6_title: 'Custom',
        auftrag_format6_small: 'Custom size · upon request',
        auftrag_hint2: 'Please choose a format to continue.',
        auftrag_back: 'Back',
        auftrag_next_technik: 'Next: Technique',
        auftrag_tech1_title: 'Acrylic Paint',
        auftrag_tech1_desc: 'Fast drying time, bold colors and vivid contrasts. Perfect for detailed portraits.',
        auftrag_tech1_delivery: 'Delivery in approx. 2–3 weeks',
        auftrag_tech2_title: 'Oil Paint',
        auftrag_tech2_desc: 'Deep, velvety color transitions and classic elegance. Longer drying time, intense finish.',
        auftrag_tech2_delivery: 'Delivery in approx. 4–6 weeks',
        auftrag_hint3: 'Please choose a technique to continue.',
        auftrag_next_summary: 'To the Summary',
        auftrag_summary_h3: 'Your Dream Painting ✨',
        auftrag_summary_motiv: 'Motif',
        auftrag_summary_format: 'Format',
        auftrag_summary_technik: 'Technique',
        auftrag_summary_lieferzeit: 'Delivery Time',
        auftrag_price_label: 'Non-Binding Price Estimate',
        auftrag_price_note: '* Final price subject to individual agreement. Free shipping within Germany.',
        auftrag_photo_h4: 'Select Your Own Photo Reference (Optional)',
        auftrag_photo_hint: 'You can select your pet or landscape photo here to check the reference directly:',
        auftrag_photo_input_label: 'Select photo reference',
        auftrag_photo_preview_alt: 'Photo reference preview',
        auftrag_photo_loaded: 'Photo reference loaded',
        auftrag_photo_ready: 'Ready for the inquiry',
        auftrag_submit: 'Send Non-Binding Inquiry Now'
    }
};

function applyTranslations(lang) {
    const t = I18N_DICTIONARY[lang] || I18N_DICTIONARY.de;
    const isEn = lang === 'en';

    const setElemText = (selector, text) => {
        const el = document.querySelector(selector);
        if (el && text !== undefined) el.textContent = text;
    };
    const setElemHTML = (selector, html) => {
        const el = document.querySelector(selector);
        if (el && html !== undefined) el.innerHTML = html;
    };

    // Generischer data-i18n Mechanismus: robust gegenüber DOM-Änderungen,
    // da er direkt am Element hängt statt an fragilen CSS-Selektoren/Indizes.
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (t[key] !== undefined) el.innerHTML = t[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key] !== undefined) el.setAttribute('placeholder', t[key]);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria-label');
        if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (t[key] !== undefined) el.setAttribute('title', t[key]);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
        const key = el.getAttribute('data-i18n-alt');
        if (t[key] !== undefined) el.setAttribute('alt', t[key]);
    });

    // Skip Link & Back to top
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) skipLink.textContent = t.skip_link;
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) backToTop.setAttribute('title', t.back_to_top);

    // Hero / Index
    setElemText('.hero-content h1', t.hero_title);
    setElemText('.hero-content p', t.hero_subtitle);
    const heroBtn = document.querySelector('.hero-btn');
    if (heroBtn) heroBtn.innerHTML = `${t.hero_btn} <i class="fa fa-angle-right" aria-hidden="true"></i>`;

    // Global Page Title & Intro
    const pageTitle = document.querySelector('h1.page-title');
    if (pageTitle) {
        const raw = pageTitle.textContent.trim();
        if (raw.includes('Über mich') || raw.includes('About Me')) pageTitle.textContent = t.about_page_title;
        else if (raw.includes('Leistungen') || raw.includes('Services')) pageTitle.textContent = t.services_page_title;
        else if (raw.includes('Bildergalerie') || raw.includes('Gallery') || raw.includes('Art Gallery')) pageTitle.textContent = t.gallery_page_title;
        else if (raw.includes('Auftrag') || raw.includes('Commission')) pageTitle.textContent = t.order_page_title;
        else if (raw.includes('Kontakt') || raw.includes('Contact')) pageTitle.textContent = t.contact_page_title;
        else if (raw.includes('Impressum') || raw.includes('Imprint')) pageTitle.textContent = t.imprint_page_title;
        else if (raw.includes('Datenschutz') || raw.includes('Privacy')) pageTitle.textContent = t.privacy_page_title;
    }

    const introText = document.querySelector('p.intro-text:not(.intro-text--subtle)');
    if (introText) {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('uebermich')) introText.textContent = t.about_intro;
        else if (path.includes('leistungen')) introText.textContent = t.services_intro;
        else if (path.includes('bildergalerie')) introText.textContent = t.gallery_intro;
        else if (path.includes('auftrag')) introText.textContent = t.order_intro;
        else if (path.includes('kontakt')) introText.textContent = t.contact_intro;
        else if (path.includes('impressum')) introText.textContent = t.imprint_intro;
        else if (path.includes('datenschutz')) introText.textContent = t.privacy_intro;
    }

    // Home.html Elements
    setElemHTML('.welcome h1', `${t.home_welcome_title} <i class="fa fa-palette" aria-hidden="true"></i>`);
    setElemHTML('.welcome p', t.home_welcome_text);
    const badges = document.querySelectorAll('.hero-trust-badges .trust-badge');
    if (badges.length >= 4) {
        badges[0].innerHTML = `<i class="fa-solid fa-paintbrush" aria-hidden="true"></i> ${t.badge_handpainted}`;
        badges[1].innerHTML = `<i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${t.badge_studio}`;
        badges[2].innerHTML = `<i class="fa-solid fa-truck-fast" aria-hidden="true"></i> ${t.badge_shipping}`;
        badges[3].innerHTML = `<i class="fa-solid fa-heart" aria-hidden="true"></i> ${t.badge_detail}`;
    }

    setElemHTML('.news h2', `<i class="fa fa-bell" aria-hidden="true"></i> ${t.news_title}`);
    const newsBoxes = document.querySelectorAll('.news-box');
    if (newsBoxes.length >= 3) {
        const d1 = newsBoxes[0].querySelector('.news-date'); if (d1) d1.textContent = t.news_1_date;
        const h1 = newsBoxes[0].querySelector('h3'); if (h1) h1.textContent = t.news_1_title;
        const p1 = newsBoxes[0].querySelector('p'); if (p1) p1.textContent = t.news_1_text;
        const d2 = newsBoxes[1].querySelector('.news-date'); if (d2) d2.textContent = t.news_2_date;
        const h2 = newsBoxes[1].querySelector('h3'); if (h2) h2.textContent = t.news_2_title;
        const p2 = newsBoxes[1].querySelector('p'); if (p2) p2.textContent = t.news_2_text;
        const d3 = newsBoxes[2].querySelector('.news-date'); if (d3) d3.textContent = t.news_3_date;
        const h3 = newsBoxes[2].querySelector('h3'); if (h3) h3.textContent = t.news_3_title;
        const p3 = newsBoxes[2].querySelector('p'); if (p3) p3.textContent = t.news_3_text;
    }

    setElemHTML('.latest-work h2', `<i class="fa-solid fa-paintbrush" aria-hidden="true"></i> ${t.highlights_title}`);
    setElemText('.latest-work .intro-text', t.highlights_intro);
    setElemHTML('.testimonials-section h2', `<i class="fa-solid fa-comments" aria-hidden="true"></i> ${t.testimonials_title}`);
    setElemText('.testimonials-section .intro-text', t.testimonials_intro);

    setElemText('.cta-content h2', t.cta_title);
    setElemText('.cta-content p', t.cta_text);
    const ctaBtns = document.querySelectorAll('.cta-buttons .btn');
    if (ctaBtns.length >= 2) {
        ctaBtns[0].innerHTML = `<i class="fa fa-pen-ruler" aria-hidden="true"></i> ${t.cta_btn_order}`;
        ctaBtns[1].innerHTML = `<i class="fa fa-images" aria-hidden="true"></i> ${t.cta_btn_gallery}`;
    }

    // UeberMich.html Elements
    setElemHTML('.info-card h3', `<i class="fa-solid fa-circle-info" aria-hidden="true"></i> ${t.about_profile_title}`);
    const profileList = document.querySelectorAll('.info-card ul li');
    if (profileList.length >= 6) {
        profileList[0].innerHTML = `<strong>${isEn ? 'Location:' : 'Wohnort:'}</strong> ${t.about_profile_loc}`;
        profileList[1].innerHTML = `<strong>${isEn ? 'Owner of:' : 'Frauchen von:'}</strong> ${t.about_profile_dog}`;
        profileList[2].innerHTML = `<strong>${isEn ? 'Motifs:' : 'Motive:'}</strong> ${t.about_profile_motifs}`;
        profileList[3].innerHTML = `<strong>${isEn ? 'Techniques:' : 'Techniken:'}</strong> ${t.about_profile_tech}`;
        profileList[4].innerHTML = `<strong>${isEn ? 'Education:' : 'Ausbildung:'}</strong> ${t.about_profile_edu}`;
        profileList[5].innerHTML = `<strong>${isEn ? 'Motivation:' : 'Motivation:'}</strong> ${t.about_profile_motive}`;
    }
    setElemText('.about-content h4', t.about_greeting);
    setElemText('.about-content i p', t.about_subtitle);
    const aboutPs = document.querySelectorAll('.about-content > p');
    if (aboutPs.length >= 5) {
        aboutPs[0].innerHTML = t.about_p1;
        aboutPs[1].innerHTML = t.about_p2;
        aboutPs[2].innerHTML = t.about_p3;
        aboutPs[3].innerHTML = t.about_p4;
        aboutPs[4].innerHTML = t.about_p5;
    }

    // Leistungen.html Elements
    setElemHTML('.services h2', `<i class="fa fa-palette" aria-hidden="true"></i> ${t.services_offer_title}`);
    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length >= 4) {
        serviceCards[0].querySelector('h3').textContent = t.service_dog_title;
        serviceCards[0].querySelector('p').textContent = t.service_dog_desc;
        serviceCards[1].querySelector('h3').textContent = t.service_pets_title;
        serviceCards[1].querySelector('p').textContent = t.service_pets_desc;
        serviceCards[2].querySelector('h3').textContent = t.service_places_title;
        serviceCards[2].querySelector('p').textContent = t.service_places_desc;
        serviceCards[3].querySelector('h3').textContent = t.service_formats_title;
        serviceCards[3].querySelector('p').textContent = t.service_formats_desc;
    }
    // Bildergalerie.html Filters & UI
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length >= 6) {
        filterBtns[0].textContent = t.filter_all;
        filterBtns[1].textContent = t.filter_animals;
        filterBtns[2].textContent = t.filter_landscapes;
        filterBtns[3].textContent = t.filter_plants;
        filterBtns[4].textContent = t.filter_other;
        filterBtns[5].innerHTML = `<i class="fa-solid fa-heart" aria-hidden="true"></i> ${t.filter_favorites} (<span id="fav-count">${getFavorites().length}</span>)`;
    }
    const gallerySearch = document.getElementById('gallery-search');
    if (gallerySearch) {
        gallerySearch.setAttribute('placeholder', t.search_placeholder);
        gallerySearch.setAttribute('aria-label', t.search_placeholder);
    }
    const sortSelect = document.getElementById('gallery-sort-select');
    if (sortSelect && sortSelect.options.length >= 3) {
        sortSelect.options[0].text = t.sort_default;
        sortSelect.options[1].text = t.sort_title_asc;
        sortSelect.options[2].text = t.sort_title_desc;
    }
    const sortLabel = document.querySelector('.gallery-sort-wrapper label');
    if (sortLabel) sortLabel.innerHTML = `<i class="fa-solid fa-arrow-down-a-z" aria-hidden="true"></i> ${t.sort_label}`;

    // Galerie-Karten (53 Kunstwerke): aria-label, alt/title, Bildunterschrift & "Unikat"-Badge
    translateGalleryCards(lang);

    // Lightbox Buttons
    setElemHTML('#lightbox-inquiry-btn', `<i class="fa-solid fa-palette" aria-hidden="true"></i> ${t.lb_btn_inquiry}`);
    setElemHTML('#lightbox-room-btn', `<i class="fa-solid fa-house-chimney" aria-hidden="true"></i> ${t.lb_btn_room}`);
    setElemHTML('#btn-rotate-img', `<i class="fa-solid fa-rotate-right" aria-hidden="true"></i> ${t.lb_rotate}`);
    setElemHTML('#btn-toggle-zoom', `<i class="fa-solid fa-magnifying-glass-plus" aria-hidden="true"></i> ${t.lb_zoom}`);
    setElemHTML('#btn-reset-pos', `<i class="fa-solid fa-arrows-to-dot" aria-hidden="true"></i> ${t.lb_center}`);

    // Room Visualizer Modal
    setElemHTML('#roomVisualizerModal h2', `<i class="fa-solid fa-house-chimney" aria-hidden="true"></i> ${t.room_modal_title}`);
    setElemText('#roomVisualizerModal p.color-text-muted', t.room_modal_desc);
    const roomPresetBtns = document.querySelectorAll('.room-presets-bar .room-preset-btn');
    if (roomPresetBtns.length >= 3) {
        roomPresetBtns[0].textContent = t.room_preset_living;
        roomPresetBtns[1].textContent = t.room_preset_bedroom;
        roomPresetBtns[2].textContent = t.room_preset_gallery;
    }
    setElemHTML('#roomVisualizerModal .btn-primary', `<i class="fa fa-check" aria-hidden="true"></i> ${t.room_btn_close}`);

    // Auftrag.html Configurator
    const stepIndicators = document.querySelectorAll('.progress-step .step-label');
    if (stepIndicators.length >= 4) {
        stepIndicators[0].textContent = t.step_1_lbl;
        stepIndicators[1].textContent = t.step_2_lbl;
        stepIndicators[2].textContent = t.step_3_lbl;
        stepIndicators[3].textContent = t.step_4_lbl;
    }
    setElemHTML('#panel-1 h2', `<i class="fa fa-paw" aria-hidden="true"></i> ${t.step_1_heading}`);
    setElemText('#panel-1 .config-subtitle', t.step_1_sub);
    setElemHTML('#panel-2 h2', `<i class="fa fa-ruler-combined" aria-hidden="true"></i> ${t.step_2_heading}`);
    setElemText('#panel-2 .config-subtitle', t.step_2_sub);
    setElemHTML('#panel-3 h2', `<i class="fa fa-palette" aria-hidden="true"></i> ${t.step_3_heading}`);
    setElemText('#panel-3 .config-subtitle', t.step_3_sub);
    setElemHTML('#panel-4 h2', `<i class="fa fa-clipboard-check" aria-hidden="true"></i> ${t.step_4_heading}`);
    setElemText('#panel-4 .config-subtitle', t.step_4_sub);
}

/* =========================================
   2. GALERIE: FILTER, LIVE-SUCHE, FAVORITEN & DATEN
   ========================================= */
const ARTWORKS_METADATA = {
    "DSC_6622a": {
        "title": "Godesburg modern",
        "technik": "Multimediatechnik auf Papier",
        "masse": "40 × 50 cm",
        "kategorie": "landschaften",
        "desc": "Eines meiner Lieblingsmotive ist die Godesburg in Bad Godesberg. Hier habe ich sie in einer modernen, ausdrucksstarken Multimediatechnik dargestellt.",
        "badge": "Unikat"
    },
    "DSC_6624a": {
        "title": "Siebengebirge Panorama",
        "technik": "Acryl auf Leinwand",
        "masse": "60 × 70 cm",
        "kategorie": "landschaften",
        "desc": "Auf einer ausgedehnten Wanderung durch das Siebengebirge musste ich diese stimmungsvolle Wald- und Weitblick-Ansicht auf Leinwand festhalten.",
        "badge": "Unikat"
    },
    "DSC_6626a": {
        "title": "Bad Godesberg City mit Godesburg",
        "technik": "Öl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "landschaften",
        "desc": "Diese Ansicht zeigt die historische Godesburg in Bad Godesberg, gesehen vom blühenden Stadtpark aus.",
        "badge": "Unikat"
    },
    "DSC_6628a": {
        "title": "Pförtnerhäuschen am Klufterhof Friesdorf",
        "technik": "Öl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "sonstiges",
        "desc": "Das malerische Pförtnerhäuschen in Bad Godesberg-Friesdorf gehört zum denkmalgeschützten Klufterhof-Ensemble.",
        "badge": "Unikat"
    },
    "DSC_6630a": {
        "title": "Friesdorf Annaberger Straße",
        "technik": "Öl auf Leinwand",
        "masse": "30 × 24 cm",
        "kategorie": "landschaften",
        "desc": "Das historische Turmhaus aus dem 12. Jahrhundert und die Annaberger Straße im Herzen von Bad Godesberg-Friesdorf.",
        "badge": "Unikat"
    },
    "DSC_6632a": {
        "title": "Der Klufterhof Friesdorf",
        "technik": "Öl auf Leinwand",
        "masse": "30 × 40 cm",
        "kategorie": "landschaften",
        "desc": "Der Klufterhof in Friesdorf ist eines der ältesten und schönsten Fachwerkhäuser der Region aus dem frühen 17. Jahrhundert.",
        "badge": "Unikat"
    },
    "DSC_6634a": {
        "title": "Drachenfels am Rhein (Ansicht Nähe Mehlem)",
        "technik": "Öl auf Leinwand",
        "masse": "60 × 70 cm",
        "kategorie": "landschaften",
        "desc": "Bei meinen zahlreichen Spaziergängen entlang der Rheinpromenade kann ich diesen wunderbaren Anblick auf den Drachenfels genießen.",
        "badge": "Unikat"
    },
    "DSC_6636a": {
        "title": "Drachenfels am Rhein im Sommer",
        "technik": "Acryl auf Leinwand",
        "masse": "60 × 70 cm",
        "kategorie": "landschaften",
        "desc": "Diesen herrlichen Anblick auf den geschichtsträchtigen Drachenfels kann man von einer sonnigen Bank in Bad Godesberg-Mehlem genießen.",
        "badge": "Unikat"
    },
    "DSC_6638a": {
        "title": "Godesburg im Sommerlicht",
        "technik": "Acryl auf Leinwand",
        "masse": "30 × 24 cm",
        "kategorie": "landschaften",
        "desc": "Die Godesburg in Bad Godesberg unter strahlend blauem Sommerhimmel mit lebhaften Grünschattierungen.",
        "badge": "Unikat"
    },
    "DSC_6640a": {
        "title": "Gasthaus „Zur Lindenwirtin“ mit Godesburg",
        "technik": "Öl auf Leinwand",
        "masse": "30 × 40 cm",
        "kategorie": "landschaften",
        "desc": "Dieses Werk zeigt eine historische Ansicht des traditionsreichen Gasthauses „Zur Lindenwirtin“ mit der majestätischen Godesburg im Hintergrund.",
        "badge": "Unikat"
    },
    "DSC_6642a": {
        "title": "Spazierweg Rheinaue Bonn",
        "technik": "Acryl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "landschaften",
        "desc": "Ein idyllischer Spazierweg im Bonner Rheinauenpark führt an diesen wunderschönen, knorrigen alten Parkbäumen vorbei.",
        "badge": "Unikat"
    },
    "DSC_6644a": {
        "title": "Historische Godesburg Ansicht",
        "technik": "Acryl auf Leinwand",
        "masse": "30 × 40 cm",
        "kategorie": "landschaften",
        "desc": "Vertikale Architekturstudie der Godesburg mit sanft geschwungenen Hangwegen und warmen Steinfarben.",
        "badge": "Unikat"
    },
    "DSC_6688a": {
        "title": "Blumenbouquet",
        "technik": "Acryl auf Karton",
        "masse": "30 × 30 cm",
        "kategorie": "pflanzen",
        "desc": "Farbenfrohes, lebensfrohes Blumenbouquet mit kontrastreichen Blütenarrangements in geschichteter Acryltechnik.",
        "badge": "Unikat"
    },
    "DSC_6689a": {
        "title": "Kleines Blumenbouquet",
        "technik": "Öl auf Karton",
        "masse": "30 × 30 cm",
        "kategorie": "pflanzen",
        "desc": "Zartes und detailreiches Blumenbouquet in feiner Ölmalerei mit weichen Übergängen und warmen Blütennuancen.",
        "badge": "Unikat"
    },
    "DSC_6693a": {
        "title": "Schafe auf Texel",
        "technik": "Öl auf Leinwand",
        "masse": "30 × 40 cm",
        "kategorie": "tiere",
        "desc": "Im Urlaub auf der Nordseeinsel Texel begegneten uns diese neugierigen, liebenswerten Schafe auf den grünen Deichen.",
        "badge": "Unikat"
    },
    "DSC_6696a": {
        "title": "Eulen im Kottenforst",
        "technik": "Öl auf Leinwand",
        "masse": "30 × 40 cm",
        "kategorie": "tiere",
        "desc": "Zwei kleine Eulen nebeneinander auf einem Ast im dämmrigen Kottenforst Bad Godesberg vor geheimnisvoll blauem Hintergrund.",
        "badge": "Unikat"
    },
    "DSC_6698a": {
        "title": "Blumen modern",
        "technik": "Acryl auf Leinwand",
        "masse": "60 × 70 cm",
        "kategorie": "pflanzen",
        "desc": "Moderne florale Abstraktion mit dynamischen Pinselstrichen und kräftigen Farbflächen auf großzügigem Leinwandformat.",
        "badge": "Unikat"
    },
    "DSC_6700a": {
        "title": "Blütenharmonie im Garten",
        "technik": "Acryl auf Leinwand",
        "masse": "50 × 60 cm",
        "kategorie": "pflanzen",
        "desc": "Frische Blütenkomposition voller Leuchtkraft und natürlicher Eleganz.",
        "badge": "Unikat"
    },
    "DSC_6702a": {
        "title": "Lustige Hühner",
        "technik": "Acryl auf Leinwand",
        "masse": "30 × 60 cm",
        "kategorie": "tiere",
        "desc": "Eine heitere Reihe bunter Hühner im charmanten Breitwand-Querformat – voller Lebensfreude und Witz.",
        "badge": "Unikat"
    },
    "DSC_6703a": {
        "title": "Mohnblumenwiese",
        "technik": "Acryl auf Leinwand",
        "masse": "60 × 70 cm",
        "kategorie": "pflanzen",
        "desc": "Leuchtend rote Sommer-Mohnblumen wiegen sich im Wind auf einer sonnendurchfluteten Wiese.",
        "badge": "Unikat"
    },
    "DSC_6705a": {
        "title": "Bunte Tulpenpracht",
        "technik": "Acryl auf Leinwand",
        "masse": "40 × 40 cm",
        "kategorie": "pflanzen",
        "desc": "Farbenfrohe Frühlings-Tulpen in leuchtenden Acrylfarben im quadratischen Format.",
        "badge": "Unikat"
    },
    "DSC_6707a": {
        "title": "Heuballen an der französischen Atlantikküste",
        "technik": "Öl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "landschaften",
        "desc": "Der Duft der frischen Heuballen an der französischen Atlantikküste inspirierte mich zu diesem Bild – man kann die Sommerbrise förmlich spüren.",
        "badge": "Unikat"
    },
    "DSC_6710a": {
        "title": "Dünenweg an der französischen Atlantikküste",
        "technik": "Acryl auf Leinwand",
        "masse": "100 × 150 cm",
        "kategorie": "landschaften",
        "desc": "Dünenwege laden zur vollkommenen Entspannung ein. Dieser zauberhafte Pfad führt durch den weichen Dünensand direkt ans Meer.",
        "badge": "Unikat"
    },
    "DSC_6711a": {
        "title": "Muschel am Strand",
        "technik": "Acryl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "sonstiges",
        "desc": "Eine einsame Meeresmuschel im warmen Küstensand mit sanften Licht- und Schattenspielen des Meeres.",
        "badge": "Unikat"
    },
    "DSC_6713a": {
        "title": "Leuchtturm auf Texel",
        "technik": "Acryl auf Leinwand",
        "masse": "24 × 30 cm",
        "kategorie": "landschaften",
        "desc": "Zahlreiche Urlaube führten uns nach Texel – der weithin sichtbare rote Leuchtturm im Norden der Insel durfte als Motiv nicht fehlen.",
        "badge": "Unikat"
    },
    "DSC_6715a": {
        "title": "Spazierweg Friedhof Dottendorf (I)",
        "technik": "Ölkreide auf Papier, Rahmen aus Birkenholz",
        "masse": "33 × 43 cm",
        "kategorie": "landschaften",
        "desc": "Auf Parkbänken kann man wunderbar entspannen und diese friedliche Lieblingsansicht mit sanfter Ölkreide festhalten.",
        "badge": "Unikat"
    },
    "DSC_6717a": {
        "title": "Spazierweg am Blausteinsee Eschweiler",
        "technik": "Ölkreide auf Papier, Rahmen aus Birkenholz",
        "masse": "33 × 43 cm",
        "kategorie": "landschaften",
        "desc": "Ein beliebtes Ausflugsziel in der Natur nahe Aachen: Der friedliche Uferweg am Blausteinsee.",
        "badge": "Unikat"
    },
    "DSC_6719a": {
        "title": "Spazierweg Friedhof Dottendorf (II)",
        "technik": "Ölkreide auf Papier, Rahmen aus Birkenholz",
        "masse": "33 × 43 cm",
        "kategorie": "landschaften",
        "desc": "Zarte Birkenbäume und herbstliche Stille in Bonn-Dottendorf – handgerahmt in edlem Birkenholz.",
        "badge": "Unikat"
    },
    "DSC_6722a": {
        "title": "Waldweg Kottenforst Bonn",
        "technik": "Acryl auf Leinwand",
        "masse": "30 × 90 cm",
        "kategorie": "landschaften",
        "desc": "Dieser sonnendurchflutete Waldweg im Bonner Kottenforst ist einer meiner absoluten Lieblingswege zu jeder Jahreszeit.",
        "badge": "Unikat"
    },
    "DSC_6740a": {
        "title": "Tulpenbouquet in Öl",
        "technik": "Öl auf Leinwand",
        "masse": "40 × 40 cm",
        "kategorie": "pflanzen",
        "desc": "Klassische botanische Ölmalerei mit feinen Farbabstufungen und samtigem Glanz.",
        "badge": "Unikat"
    },
    "DSC_6742a": {
        "title": "Balou – Hundeportrait in Öl",
        "technik": "Öl auf Leinwand",
        "masse": "40 × 40 cm",
        "kategorie": "tiere",
        "desc": "Unser Familienhund Balou mit seinem treuen Blick und samtweichem Fell in klassischer Ölmalerei verewigt.",
        "badge": "Unikat"
    },
    "DSC_6744a": {
        "title": "Balou – Hundeportrait modern",
        "technik": "Acryl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "tiere",
        "desc": "Moderne Porträtstudie von Balou mit mutigen Farbkontrasten und ausdrucksstarkem Charakter.",
        "badge": "Unikat"
    },
    "DSC_6747a": {
        "title": "Balou – Hundeportrait Acryl",
        "technik": "Acryl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "tiere",
        "desc": "Fein ausgearbeitetes Acrylportrait von Balou mit lebendigen Lichtreflexen in den Augen.",
        "badge": "Unikat"
    },
    "DSC_6749a": {
        "title": "Magnolientraum",
        "technik": "Acryl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "pflanzen",
        "desc": "So eine traumhafte Ansicht erhält man, wenn man im Frühling von unten in einen blühenden rosa Magnolienbaum schaut.",
        "badge": "Unikat"
    },
    "DSC_6751a": {
        "title": "Klassisches Stillleben",
        "technik": "Öl auf Leinwand",
        "masse": "40 × 50 cm",
        "kategorie": "sonstiges",
        "desc": "Meisterhaft ausgeleuchtetes Stillleben in traditioneller Schichtölmalerei mit harmonischer Raumtiefe.",
        "badge": "Unikat"
    },
    "DSC_6753a": {
        "title": "Rote Paprikaschote",
        "technik": "Acryl auf Leinwand",
        "masse": "19 × 19 cm",
        "kategorie": "sonstiges",
        "desc": "Frische, glänzende Paprikaschote im modernen Kleinformat mit knackigen Glanzlichtern.",
        "badge": "Unikat"
    },
    "DSC_6754a": {
        "title": "Zitronen",
        "technik": "Öl auf Leinwand",
        "masse": "19 × 19 cm",
        "kategorie": "sonstiges",
        "desc": "Sonnengereifte Zitronen mit samtiger Schalenstruktur in leuchtendem Zitronengelb.",
        "badge": "Unikat"
    },
    "DSC_6757a": {
        "title": "Der gallische Hahn",
        "technik": "Acryl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "tiere",
        "desc": "Stolzer gallischer Hahn mit feurigem Kamm und stolzem Blick in lebendigem Farbauftrag.",
        "badge": "Unikat"
    },
    "DSC_6759a": {
        "title": "Frische Erdbeeren",
        "technik": "Acryl auf Leinwand",
        "masse": "19 × 19 cm",
        "kategorie": "sonstiges",
        "desc": "Sommerlich frische Erdbeeren im quadratischen Miniatur-Format – zum Anbeißen schön.",
        "badge": "Unikat"
    },
    "DSC_6760a": {
        "title": "Erdbeeren auf blauem Teller",
        "technik": "Acryl auf Leinwand",
        "masse": "19 × 19 cm",
        "kategorie": "sonstiges",
        "desc": "Satte rote Erdbeeren im wirkungsvollen Farbkontrast auf einem kobaltblauen Keramikteller.",
        "badge": "Unikat"
    },
    "DSC_6763a": {
        "title": "Bunter Hahn",
        "technik": "Acryl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "tiere",
        "desc": "Lebhaftes Vogelportrait mit schillernden Gefiedertönen und charaktervoller Pose.",
        "badge": "Unikat"
    },
    "DSC_6765a": {
        "title": "Rotkehlchen im Winter",
        "technik": "Acryl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "tiere",
        "desc": "Ein bezauberndes Rotkehlchen auf einem Ast mit feinsten Daunen und leuchtend roter Brust.",
        "badge": "Unikat"
    },
    "DSC_6767a": {
        "title": "Parfum Coco Mademoiselle",
        "technik": "Acryl auf Leinwand",
        "masse": "19 × 19 cm",
        "kategorie": "sonstiges",
        "desc": "Elegantes Stillleben des legendären Parfum-Klassikers in pudrigen Rosé- und Goldtönen.",
        "badge": "Unikat"
    },
    "DSC_6769a": {
        "title": "Biene auf Hortensie",
        "technik": "Acryl auf Leinwand",
        "masse": "19 × 19 cm",
        "kategorie": "tiere",
        "desc": "Eine fleißige Honigbiene inmitten eines dichten Meeres himmelblauer Hortensienblüten.",
        "badge": "Unikat"
    },
    "DSC_6771a": {
        "title": "Biene auf Lavendel",
        "technik": "Acryl auf Leinwand",
        "masse": "19 × 19 cm",
        "kategorie": "tiere",
        "desc": "Mediterrane Sommeridylle: Eine Biene bei der Nektarsuche auf duftendem violettem Lavendel.",
        "badge": "Unikat"
    },
    "DSC_6774a": {
        "title": "Stillleben „Le petit déjeuner“",
        "technik": "Acryl auf Leinwand",
        "masse": "19 × 19 cm",
        "kategorie": "sonstiges",
        "desc": "Französisches Frühstück mit frischem Buttercroissant und Kaffee in warmem Morgenlicht.",
        "badge": "Unikat"
    },
    "DSC_6775a": {
        "title": "Kühe in der Normandie (I)",
        "technik": "Acryl auf Leinwand",
        "masse": "24 × 30 cm",
        "kategorie": "tiere",
        "desc": "Diese beiden neugierigen Kühe begegneten uns bei einem erholsamen Sommerspaziergang in der Normandie.",
        "badge": "Unikat"
    },
    "DSC_6778a": {
        "title": "Kühe in der Normandie (II)",
        "technik": "Acryl auf Leinwand",
        "masse": "24 × 30 cm",
        "kategorie": "tiere",
        "desc": "Typische normannische Weidekühe mit ihrer markanten Fleckung in herrlicher Küstenlandschaft.",
        "badge": "Unikat"
    },
    "DSC_6780a": {
        "title": "Burger & Fries Pop-Art",
        "technik": "Acryl auf Leinwand",
        "masse": "24 × 30 cm",
        "kategorie": "sonstiges",
        "desc": "Köstlicher Burger mit knusprigen Pommes Frites als modernes, farbintensives Pop-Art Stillleben.",
        "badge": "Unikat"
    },
    "DSC_6782a": {
        "title": "Seerose im Botanischen Garten Bonn",
        "technik": "Öl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "pflanzen",
        "desc": "Zauberhafte weiße Seerose auf ruhigem Teichwasser im historischen Botanischen Garten Bonn.",
        "badge": "Unikat"
    },
    "DSC_6784a": {
        "title": "Gelbe Frühlings-Tulpen",
        "technik": "Öl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "pflanzen",
        "desc": "Strahlend sonnengelbe Tulpen in zarter Schichtölmalerei mit stimmungsvoller Tiefenwirkung.",
        "badge": "Unikat"
    },
    "DSC_6788a": {
        "title": "Aperol Spritz",
        "technik": "Acryl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "sonstiges",
        "desc": "Erfrischender Aperol Spritz im Weinglas mit Orangenscheibe und klaren Eiswürfeln.",
        "badge": "Unikat"
    },
    "DSC_6790a": {
        "title": "Kühles Bier im Glas",
        "technik": "Acryl auf Leinwand",
        "masse": "18 × 24 cm",
        "kategorie": "sonstiges",
        "desc": "Frisch gezapftes, perlendes Bier mit goldgelber Farbe und dichter weißer Schaumkrone.",
        "badge": "Unikat"
    }
};

/* =========================================
   ENGLISCHE ÜBERSETZUNG DER GALERIE-WERKE
   Enthält nur die zu übersetzenden Felder (title/technik/desc) je Werk-ID.
   Maße, Kategorie und Badge bleiben sprachunabhängig (Zahlen/interne Werte).
   ========================================= */
const ARTWORKS_METADATA_EN = {
    "DSC_6622a": { title: "Godesburg Modern", technik: "Mixed media on paper", desc: "One of my favorite motifs is Godesburg Castle in Bad Godesberg. Here I depicted it in a modern, expressive mixed-media technique." },
    "DSC_6624a": { title: "Siebengebirge Panorama", technik: "Acrylic on canvas", desc: "On an extensive hike through the Siebengebirge hills, I had to capture this atmospheric forest and panoramic view on canvas." },
    "DSC_6626a": { title: "Bad Godesberg City with Godesburg", technik: "Oil on canvas", desc: "This view shows the historic Godesburg Castle in Bad Godesberg, seen from the blooming city park." },
    "DSC_6628a": { title: "Gatehouse at Klufterhof Friesdorf", technik: "Oil on canvas", desc: "The picturesque gatehouse in Bad Godesberg-Friesdorf belongs to the listed Klufterhof ensemble." },
    "DSC_6630a": { title: "Friesdorf Annaberger Straße", technik: "Oil on canvas", desc: "The historic tower house from the 12th century and Annaberger Straße in the heart of Bad Godesberg-Friesdorf." },
    "DSC_6632a": { title: "The Klufterhof Friesdorf", technik: "Oil on canvas", desc: "The Klufterhof in Friesdorf is one of the oldest and most beautiful half-timbered houses in the region, dating from the early 17th century." },
    "DSC_6634a": { title: "Drachenfels on the Rhine (View near Mehlem)", technik: "Oil on canvas", desc: "On my many walks along the Rhine promenade, I get to enjoy this wonderful view of the Drachenfels." },
    "DSC_6636a": { title: "Drachenfels on the Rhine in Summer", technik: "Acrylic on canvas", desc: "This magnificent view of the historic Drachenfels can be enjoyed from a sunny bench in Bad Godesberg-Mehlem." },
    "DSC_6638a": { title: "Godesburg in Summer Light", technik: "Acrylic on canvas", desc: "Godesburg Castle in Bad Godesberg under a radiant blue summer sky with vivid shades of green." },
    "DSC_6640a": { title: '"Zur Lindenwirtin" Inn with Godesburg', technik: "Oil on canvas", desc: 'This work shows a historic view of the traditional "Zur Lindenwirtin" inn with the majestic Godesburg Castle in the background.' },
    "DSC_6642a": { title: "Rheinaue Park Path, Bonn", technik: "Acrylic on canvas", desc: "An idyllic path in Bonn's Rheinaue Park leads past these beautiful, gnarled old park trees." },
    "DSC_6644a": { title: "Historic View of Godesburg", technik: "Acrylic on canvas", desc: "A vertical architectural study of Godesburg Castle with gently curving hillside paths and warm stone tones." },
    "DSC_6688a": { title: "Flower Bouquet", technik: "Acrylic on cardboard", desc: "A colorful, vibrant flower bouquet with high-contrast floral arrangements in layered acrylic technique." },
    "DSC_6689a": { title: "Small Flower Bouquet", technik: "Oil on cardboard", desc: "A delicate, detailed flower bouquet in fine oil painting with soft transitions and warm floral hues." },
    "DSC_6693a": { title: "Sheep on Texel", technik: "Oil on canvas", desc: "While on vacation on the North Sea island of Texel, we encountered these curious, lovable sheep on the green dikes." },
    "DSC_6696a": { title: "Owls in the Kottenforst", technik: "Oil on canvas", desc: "Two small owls side by side on a branch in the dusky Kottenforst forest of Bad Godesberg, set against a mysterious blue background." },
    "DSC_6698a": { title: "Modern Flowers", technik: "Acrylic on canvas", desc: "A modern floral abstraction with dynamic brushstrokes and bold color fields on a generously sized canvas." },
    "DSC_6700a": { title: "Blossom Harmony in the Garden", technik: "Acrylic on canvas", desc: "A fresh floral composition full of radiance and natural elegance." },
    "DSC_6702a": { title: "Funny Chickens", technik: "Acrylic on canvas", desc: "A cheerful row of colorful chickens in a charming wide landscape format – full of joy and wit." },
    "DSC_6703a": { title: "Poppy Meadow", technik: "Acrylic on canvas", desc: "Bright red summer poppies sway in the wind in a sun-drenched meadow." },
    "DSC_6705a": { title: "Colorful Tulip Splendor", technik: "Acrylic on canvas", desc: "Vibrant spring tulips in brilliant acrylic colors in a square format." },
    "DSC_6707a": { title: "Hay Bales on the French Atlantic Coast", technik: "Oil on canvas", desc: "The scent of fresh hay bales on the French Atlantic coast inspired this painting – you can almost feel the summer breeze." },
    "DSC_6710a": { title: "Dune Path on the French Atlantic Coast", technik: "Acrylic on canvas", desc: "Dune paths invite complete relaxation. This enchanting trail leads through soft dune sand straight to the sea." },
    "DSC_6711a": { title: "Seashell on the Beach", technik: "Acrylic on canvas", desc: "A lone seashell in warm coastal sand with gentle plays of light and shadow from the sea." },
    "DSC_6713a": { title: "Lighthouse on Texel", technik: "Acrylic on canvas", desc: "Numerous vacations have taken us to Texel – the red lighthouse, visible from afar in the north of the island, simply had to become a motif." },
    "DSC_6715a": { title: "Cemetery Path, Dottendorf (I)", technik: "Oil pastel on paper, birch wood frame", desc: "Park benches are wonderful places to relax and capture this peaceful favorite view in soft oil pastel." },
    "DSC_6717a": { title: "Path at Lake Blausteinsee, Eschweiler", technik: "Oil pastel on paper, birch wood frame", desc: "A popular nature excursion destination near Aachen: the peaceful shoreline path at Lake Blausteinsee." },
    "DSC_6719a": { title: "Cemetery Path, Dottendorf (II)", technik: "Oil pastel on paper, birch wood frame", desc: "Delicate birch trees and autumnal stillness in Bonn-Dottendorf – hand-framed in fine birch wood." },
    "DSC_6722a": { title: "Forest Path in the Kottenforst, Bonn", technik: "Acrylic on canvas", desc: "This sun-drenched forest path in Bonn's Kottenforst is one of my absolute favorite trails in every season." },
    "DSC_6740a": { title: "Tulip Bouquet in Oil", technik: "Oil on canvas", desc: "A classic botanical oil painting with fine color gradations and a velvety sheen." },
    "DSC_6742a": { title: "Balou – Dog Portrait in Oil", technik: "Oil on canvas", desc: "Our family dog Balou, with his loyal gaze and velvety-soft coat, immortalized in classic oil painting." },
    "DSC_6744a": { title: "Balou – Modern Dog Portrait", technik: "Acrylic on canvas", desc: "A modern portrait study of Balou with bold color contrasts and expressive character." },
    "DSC_6747a": { title: "Balou – Dog Portrait in Acrylic", technik: "Acrylic on canvas", desc: "A finely detailed acrylic portrait of Balou with vivid highlights in the eyes." },
    "DSC_6749a": { title: "Magnolia Dream", technik: "Acrylic on canvas", desc: "This dreamlike view appears when you look up in spring into a blooming pink magnolia tree from below." },
    "DSC_6751a": { title: "Classic Still Life", technik: "Oil on canvas", desc: "A masterfully lit still life in traditional layered oil painting with harmonious depth." },
    "DSC_6753a": { title: "Red Bell Pepper", technik: "Acrylic on canvas", desc: "A fresh, glossy bell pepper in a modern small format with crisp highlights." },
    "DSC_6754a": { title: "Lemons", technik: "Oil on canvas", desc: "Sun-ripened lemons with a velvety peel texture in brilliant lemon yellow." },
    "DSC_6757a": { title: "The Gallic Rooster", technik: "Acrylic on canvas", desc: "A proud Gallic rooster with a fiery comb and proud gaze in vivid brushwork." },
    "DSC_6759a": { title: "Fresh Strawberries", technik: "Acrylic on canvas", desc: "Summer-fresh strawberries in a square miniature format – almost good enough to eat." },
    "DSC_6760a": { title: "Strawberries on a Blue Plate", technik: "Acrylic on canvas", desc: "Rich red strawberries in striking color contrast on a cobalt blue ceramic plate." },
    "DSC_6763a": { title: "Colorful Rooster", technik: "Acrylic on canvas", desc: "A lively bird portrait with shimmering plumage tones and a characterful pose." },
    "DSC_6765a": { title: "Robin in Winter", technik: "Acrylic on canvas", desc: "A charming robin on a branch with the finest down feathers and a brilliant red breast." },
    "DSC_6767a": { title: "Coco Mademoiselle Perfume", technik: "Acrylic on canvas", desc: "An elegant still life of the legendary perfume classic in powdery rosé and gold tones." },
    "DSC_6769a": { title: "Bee on Hydrangea", technik: "Acrylic on canvas", desc: "A busy honeybee amid a dense sea of sky-blue hydrangea blossoms." },
    "DSC_6771a": { title: "Bee on Lavender", technik: "Acrylic on canvas", desc: "A Mediterranean summer idyll: a bee foraging for nectar on fragrant purple lavender." },
    "DSC_6774a": { title: 'Still Life "Le Petit Déjeuner"', technik: "Acrylic on canvas", desc: "A French breakfast with a fresh butter croissant and coffee in warm morning light." },
    "DSC_6775a": { title: "Cows in Normandy (I)", technik: "Acrylic on canvas", desc: "These two curious cows crossed our path on a relaxing summer walk in Normandy." },
    "DSC_6778a": { title: "Cows in Normandy (II)", technik: "Acrylic on canvas", desc: "Typical Normandy pasture cows with their distinctive markings in a beautiful coastal landscape." },
    "DSC_6780a": { title: "Burger & Fries Pop Art", technik: "Acrylic on canvas", desc: "A delicious burger with crispy fries as a modern, vividly colored pop-art still life." },
    "DSC_6782a": { title: "Water Lily at Bonn Botanical Garden", technik: "Oil on canvas", desc: "An enchanting white water lily on calm pond water at Bonn's historic Botanical Garden." },
    "DSC_6784a": { title: "Yellow Spring Tulips", technik: "Oil on canvas", desc: "Radiant sun-yellow tulips in delicate layered oil painting with atmospheric depth." },
    "DSC_6788a": { title: "Aperol Spritz", technik: "Acrylic on canvas", desc: "A refreshing Aperol Spritz in a wine glass with an orange slice and clear ice cubes." },
    "DSC_6790a": { title: "Cold Beer in a Glass", technik: "Acrylic on canvas", desc: "Freshly poured, sparkling beer with a golden color and a dense white foam crown." }
};

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
 * Übersetzt die Galerie-Karten (aria-label, alt/title, Bildunterschrift, "Unikat"-Badge)
 * direkt anhand von ARTWORKS_METADATA_EN, ohne auf 53 einzelne data-i18n-Attribute angewiesen zu sein.
 */
function translateGalleryCards(lang) {
    if (typeof ARTWORKS_METADATA === 'undefined') return;
    const isEn = lang === 'en';
    document.querySelectorAll('.gallery-item[id]').forEach(item => {
        const meta = ARTWORKS_METADATA[item.id];
        if (!meta) return;
        const metaEn = (isEn && typeof ARTWORKS_METADATA_EN !== 'undefined') ? ARTWORKS_METADATA_EN[item.id] : null;
        const title = (metaEn && metaEn.title) || meta.title;
        const technik = (metaEn && metaEn.technik) || meta.technik;
        const masse = meta.masse;
        const link = item.querySelector('a');
        const img = item.querySelector('img');
        const caption = item.querySelector('.gallery-caption');
        if (link) {
            link.setAttribute('aria-label', `${isEn ? 'Enlarge' : 'Großansicht'}: ${title} (${technik}, ${masse})`);
        }
        if (img) {
            const altText = isEn
                ? `Hand-painted artwork "${title}" – ${technik}, ${masse}, by Manuela Schenk`
                : `Handgemaltes Gemälde „${title}“ – ${technik}, ${masse} von Manuela Schenk`;
            img.setAttribute('alt', altText);
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
            const heartIcon = isAdded ? '<i class="fa-solid fa-heart" style="color:#e74c3c;"></i>' : '<i class="fa-regular fa-heart"></i>';
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

let activeFormat = 'alle';
let activeColor = 'alle';

function filterFormat(format) {
    activeFormat = format || 'alle';
    const chips = document.querySelectorAll('.format-chip');
    chips.forEach(chip => {
        const onclickAttr = chip.getAttribute('onclick') || '';
        if (onclickAttr.includes(`'${activeFormat}'`)) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
    filterGallery();
}

function filterColor(color) {
    activeColor = color || 'alle';
    const chips = document.querySelectorAll('.color-chip');
    chips.forEach(chip => {
        const onclickAttr = chip.getAttribute('onclick') || '';
        if (onclickAttr.includes(`'${activeColor}'`)) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
    filterGallery();
}

function openCertModal() {
    const modal = document.getElementById('certModal');
    const titleVal = document.getElementById('cert-title-val');
    const idVal = document.getElementById('cert-id-val');
    const technikVal = document.getElementById('cert-technik-val');
    const sizeVal = document.getElementById('cert-size-val');
    if (modal) {
        if (visibleGalleryLinks[currentIndex]) {
            const link = visibleGalleryLinks[currentIndex];
            const item = link.closest('.gallery-item');
            const itemId = item ? item.id : 'MS-2026';
            const artMeta = getArtMeta(itemId);
            const img = link.querySelector('img');
            
            if (titleVal) titleVal.innerText = artMeta ? artMeta.title : (img ? (img.alt || 'Original Gemälde') : 'Original Gemälde');
            if (idVal) idVal.innerText = `#${itemId || 'MS-2026'}`;
            if (technikVal && artMeta) technikVal.innerText = artMeta.technik;
            if (sizeVal && artMeta) sizeVal.innerText = artMeta.masse;
        }
        modal.style.display = 'flex';
    }
}

function closeCertModal() {
    const modal = document.getElementById('certModal');
    if (modal) modal.style.display = 'none';
}

function openSizeModal() {
    const modal = document.getElementById('sizeModal');
    const img = document.getElementById('size-canvas-img');
    const tag = document.getElementById('size-dimensions-tag');
    if (modal) {
        if (visibleGalleryLinks[currentIndex] && img) {
            const link = visibleGalleryLinks[currentIndex];
            const item = link.closest('.gallery-item');
            const itemId = item ? item.id : '';
            const artMeta = getArtMeta(itemId);
            img.src = link.href;
            if (tag) tag.innerText = artMeta ? artMeta.masse : 'ca. 40 × 50 cm';
        }
        modal.style.display = 'flex';
    }
}

function closeSizeModal() {
    const modal = document.getElementById('sizeModal');
    if (modal) modal.style.display = 'none';
}

function switchGalleryViewMode(mode) {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    grid.classList.remove('view-masonry', 'view-list');
    document.querySelectorAll('.view-mode-btn').forEach(btn => btn.classList.remove('active'));

    const btn = document.getElementById(`btn-view-${mode}`);
    if (btn) btn.classList.add('active');

    if (mode === 'masonry') {
        grid.classList.add('view-masonry');
    } else if (mode === 'list') {
        grid.classList.add('view-list');
    }
}

function sortGallery(sortOption) {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    const items = Array.from(grid.querySelectorAll('.gallery-item'));
    items.sort((a, b) => {
        const titleA = (a.querySelector('.gallery-caption')?.innerText || '').toLowerCase();
        const titleB = (b.querySelector('.gallery-caption')?.innerText || '').toLowerCase();
        if (sortOption === 'title-asc') return titleA.localeCompare(titleB, 'de');
        if (sortOption === 'title-desc') return titleB.localeCompare(titleA, 'de');
        return 0;
    });

    items.forEach(item => grid.appendChild(item));
    updateGalleryLinks();
    showToast(currentLang === 'en' ? 'Gallery re-sorted' : 'Galerie neu sortiert');
}

/* Room Visualizer Logic with Wall Fitting & Rotation */
let roomRotationDeg = 0;
let currentRoomPreset = 'livingroom';

// Vordefinierte Wandpositionen & Blickwinkel je Raumkulisse für realistisches Fitting
const ROOM_WALL_SPECS = {
    'livingroom': { scale: 50, posY: -15, posX: 0, rotateY: 0, shadowOffset: '0 20px 40px rgba(0,0,0,0.45)' },
    'bedroom':    { scale: 44, posY: -28, posX: 0, rotateY: 0, shadowOffset: '0 18px 36px rgba(0,0,0,0.4)' },
    'gallerywall':{ scale: 58, posY: -5,  posX: 0, rotateY: 0, shadowOffset: '0 25px 45px rgba(0,0,0,0.5)' }
};

function openRoomVisualizer(imgSrc, imgAlt) {
    const modal = document.getElementById('roomVisualizerModal');
    const artworkImg = document.getElementById('room-artwork');
    if (modal && artworkImg) {
        if (!imgSrc && visibleGalleryLinks[currentIndex]) {
            const link = visibleGalleryLinks[currentIndex];
            imgSrc = link.href;
            const img = link.querySelector('img');
            imgAlt = img ? img.alt : '';
        }
        artworkImg.src = imgSrc || '';
        artworkImg.alt = imgAlt || 'Gemälde';
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        roomRotationDeg = 0;
        const rotSlider = document.getElementById('room-rotation-slider');
        if (rotSlider) rotSlider.value = 0;

        autoFitToRoomWall();
    }
}

function closeRoomVisualizer() {
    const modal = document.getElementById('roomVisualizerModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

let currentLbScene = 'detail';
let customWallScalePercent = 55;
let wallFramePosX = 0;
let wallFramePosY = 0;
let isDraggingWallFrame = false;
let dragStartX = 0;
let dragStartY = 0;

const KI_ROOM_IMAGES = {
    'livingroom': 'assets/images/rooms/livingroom.png',
    'bedroom': 'assets/images/rooms/bedroom.png',
    'darkloft': 'assets/images/rooms/darkloft.png',
    'beigelounge': 'assets/images/rooms/beigelounge.png',
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
            if (badge) badge.style.display = 'none';
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
                badge.style.display = 'inline-flex';
                const labelMap = {
                    'livingroom': 'Wohnzimmer',
                    'bedroom': 'Schlafzimmer',
                    'darkloft': 'Loft / Beton',
                    'beigelounge': 'Beige Lounge'
                };
                badge.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> KI-Wandvorlage (${labelMap[currentLbScene] || 'Wohnzimmer'})`;
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
            img.src = visibleGalleryLinks[currentIndex].href;
        }
    } else if (currentViewAngle === 'room') {
        setLightboxScene('livingroom');
        if (visibleGalleryLinks[currentIndex]) {
            img.src = visibleGalleryLinks[currentIndex].href;
        }
    } else if (currentViewAngle === 'back') {
        if (stage) {
            stage.style.backgroundImage = 'none';
            stage.style.backgroundColor = '#0f172a';
        }
        img.src = 'assets/images/rooms/canvas_back.png';
        if (badge) {
            badge.style.display = 'inline-flex';
            badge.innerHTML = `<i class="fa-solid fa-square-check"></i> Keilrahmen & Rückseite (Solid Fichtenholz)`;
        }
        container.style.maxWidth = '75%';
        container.style.maxHeight = '52vh';
    } else if (currentViewAngle === 'side3d') {
        setLightboxScene('detail');
        if (visibleGalleryLinks[currentIndex]) {
            img.src = visibleGalleryLinks[currentIndex].href;
        }
        container.style.transform = 'perspective(900px) rotateY(-26deg) rotateX(6deg) scale(0.92)';
        container.style.boxShadow = '-20px 25px 50px rgba(0, 0, 0, 0.65), -5px 8px 15px rgba(0, 0, 0, 0.4)';
        if (badge) {
            badge.style.display = 'inline-flex';
            badge.innerHTML = `<i class="fa-solid fa-cube"></i> 3D-Seitenansicht (Gemalter Rand)`;
        }
    } else if (currentViewAngle === 'artist') {
        if (stage) {
            stage.style.backgroundImage = "url('assets/images/rooms/artist_studio.png')";
            stage.style.backgroundColor = 'transparent';
        }
        if (visibleGalleryLinks[currentIndex]) {
            img.src = visibleGalleryLinks[currentIndex].href;
        }
        if (badge) {
            badge.style.display = 'inline-flex';
            badge.innerHTML = `<i class="fa-solid fa-palette"></i> Handgemacht im Atelier Bonn`;
        }
    }
}

function setRoomBackdrop(preset, btn) {
    const stage = document.getElementById('room-stage');
    if (!stage) return;

    currentRoomPreset = preset || 'livingroom';
    document.querySelectorAll('.room-preset-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const backdrops = {
        'livingroom': KI_ROOM_IMAGES.livingroom,
        'bedroom': KI_ROOM_IMAGES.bedroom,
        'gallerywall': KI_ROOM_IMAGES.darkloft
    };

    if (backdrops[preset]) {
        stage.style.backgroundImage = `url('${backdrops[preset]}')`;
    }

    autoFitToRoomWall();
}

function autoFitToRoomWall() {
    const artworkImg = document.getElementById('room-artwork');
    const scaleSlider = document.getElementById('room-scale-slider');
    const rotSlider = document.getElementById('room-rotation-slider');

    const spec = ROOM_WALL_SPECS[currentRoomPreset] || ROOM_WALL_SPECS['livingroom'];
    let targetScale = spec.scale;

    // Seitenverhältnis-Anpassung: Hochformat / Querformat optimal skalieren
    if (artworkImg && artworkImg.naturalWidth && artworkImg.naturalHeight) {
        const ratio = artworkImg.naturalWidth / artworkImg.naturalHeight;
        if (ratio < 0.8) {
            // Hochformat: Etwas weniger Höhe damit es nicht über das Sofa ragt
            targetScale = Math.round(targetScale * 0.88);
        } else if (ratio > 1.4) {
            // Querformat / Panorama
            targetScale = Math.round(targetScale * 1.1);
        }
    }

    if (scaleSlider) scaleSlider.value = targetScale;
    if (rotSlider) rotSlider.value = roomRotationDeg;

    updateRoomArtworkTransform();
}

function rotateRoomArtwork90() {
    roomRotationDeg = (roomRotationDeg + 90) % 360;
    const rotSlider = document.getElementById('room-rotation-slider');
    if (rotSlider) rotSlider.value = roomRotationDeg > 180 ? roomRotationDeg - 360 : roomRotationDeg;
    updateRoomArtworkTransform();
}

function updateRoomArtworkTransform() {
    const container = document.getElementById('room-artwork-container');
    const artworkImg = document.getElementById('room-artwork');
    const scaleSlider = document.getElementById('room-scale-slider');
    const rotSlider = document.getElementById('room-rotation-slider');

    const scaleValEl = document.getElementById('room-scale-val');
    const rotateValEl = document.getElementById('room-rotate-val');

    const scale = scaleSlider ? parseInt(scaleSlider.value) : 55;
    const rotation = rotSlider ? parseInt(rotSlider.value) : 0;

    if (scaleValEl) scaleValEl.innerText = `${scale}%`;
    if (rotateValEl) rotateValEl.innerText = `${rotation}°`;

    const spec = ROOM_WALL_SPECS[currentRoomPreset] || ROOM_WALL_SPECS['livingroom'];

    if (container) {
        container.style.transform = `translate(${spec.posX}px, ${spec.posY}px)`;
    }

    if (artworkImg) {
        artworkImg.style.maxWidth = `${scale}%`;
        artworkImg.style.maxHeight = `${scale * 1.2}%`;
        artworkImg.style.transform = `rotate(${rotation}deg)`;
        artworkImg.style.boxShadow = spec.shadowOffset;
    }
}

function handleCustomWallUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            const stage = document.getElementById('room-stage');
            if (stage) {
                stage.style.backgroundImage = `url('${e.target.result}')`;
                showToast(currentLang === 'en' ? 'Custom wall loaded successfully!' : 'Eigene Wand erfolgreich geladen!');
            }
        };
        reader.readAsDataURL(file);
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

function filterSelection(category) {
    activeCategory = category || 'alle';
    const btnContainer = document.getElementById('filter-container');
    if (btnContainer) {
        const btns = btnContainer.getElementsByClassName('filter-btn');
        for (let i = 0; i < btns.length; i++) {
            const onclickAttr = btns[i].getAttribute('onclick') || '';
            if (onclickAttr.includes(`'${activeCategory}'`)) {
                btns[i].classList.add('active');
            } else {
                btns[i].classList.remove('active');
            }
        }
    }
    filterGallery();
}

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

        const imgWidth = imgEl ? (parseInt(imgEl.getAttribute('width')) || 600) : 600;
        const imgHeight = imgEl ? (parseInt(imgEl.getAttribute('height')) || 500) : 500;
        const ratio = imgWidth / imgHeight;

        let detectedFormat = 'querformat';
        if (ratio > 1.8 || ratio < 0.55) detectedFormat = 'panorama';
        else if (ratio > 1.15) detectedFormat = 'querformat';
        else if (ratio < 0.85) detectedFormat = 'hochformat';
        else detectedFormat = 'quadratisch';

        let matchesCategory = false;
        if (activeCategory === 'alle') {
            matchesCategory = true;
        } else if (activeCategory === 'favoriten') {
            matchesCategory = favs.includes(itemId);
        } else {
            matchesCategory = dataKat.includes(activeCategory);
        }

        let matchesColor = true;
        if (activeColor !== 'alle') {
            const colorKeywords = {
                'warm': ['rot', 'orange', 'warm', 'feuer', 'sonne', 'herbst', 'herz', 'rosen'],
                'gold': ['gold', 'gelb', 'sonne', 'glanz'],
                'kuehl': ['blau', 'türkis', 'wasser', 'meer', 'schiff', 'fluss', 'see'],
                'gruen': ['grün', 'wald', 'natur', 'wiese', 'blatt', 'baum', 'pflanzen'],
                'neutral': ['grau', 'weiß', 'schwarz', 'braun', 'sand', 'stein', 'stillleben']
            };
            const kwList = colorKeywords[activeColor] || [];
            matchesColor = kwList.some(kw => itemText.toLowerCase().includes(kw));
        }

        const matchesSearch = (!searchTerm || itemText.toLowerCase().includes(searchTerm));
        const matchesFormat = (activeFormat === 'alle' || detectedFormat === activeFormat);

        if (matchesCategory && matchesSearch && matchesFormat && matchesColor) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    }

    const noResults = document.getElementById('no-gallery-results');
    if (noResults) {
        if (visibleCount === 0) {
            noResults.style.display = 'block';
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
            noResults.style.display = 'none';
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

    // --- A. Filter Buttons ---
    const btnContainer = document.getElementById('filter-container');
    if (btnContainer) {
        const btns = btnContainer.getElementsByClassName('filter-btn');
        for (let i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', function () {
                const current = btnContainer.getElementsByClassName('active');
                if (current.length > 0) {
                    current[0].classList.remove('active');
                }
                this.classList.add('active');
            });
        }
    }

    // Galerie Live-Suche Event Listener
    const searchInput = document.getElementById('gallery-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterGallery);
    }

    // Favoriten UI & Links initialisieren
    initFavButtonsUI();
    updateGalleryLinks();

    // --- B. Hamburger Menü (Mobil) ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function () {
            const active = navLinks.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', active ? 'true' : 'false');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.className = active ? 'fa fa-close' : 'fa fa-bars';
            }
        });
    }

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
                img.src = visibleGalleryLinks[i].href;
            }
        });
    }

    function openLightbox(index) {
        if (!lightbox || visibleGalleryLinks.length === 0) return;

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
            lightboxImg.src = link.href;
            lightboxImg.alt = titleText;
            lightboxImg.onload = function() {
                adjustWallFrameScale();
            };
        }

        // Populiere Thumbnails in "Weitere Ansichten"
        const thumbFront = document.getElementById('thumb-img-front');
        const thumbSide = document.getElementById('thumb-img-side');
        if (thumbFront) thumbFront.src = link.href;
        if (thumbSide) thumbSide.src = link.href;

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
        const statusBadge = document.getElementById('lightbox-status-badge');

        const artMeta = getArtMeta(itemId);

        const realTitle = artMeta ? artMeta.title : (titleText || 'Handgemaltes Unikat');
        const realDesc = artMeta ? artMeta.desc : 'Dieses einzigartige Werk wurde von Manuela Schenk in sorgfältiger Handarbeit gefertigt.';
        const realTechnik = artMeta ? artMeta.technik : 'Acryl / Öl auf Leinwand';
        const realMasse = artMeta ? artMeta.masse : 'Unikatmaß';
        const realKat = artMeta ? artMeta.kategorie : (item ? (item.getAttribute('data-kategorie') || 'Kunstwerk') : 'Kunstwerk');
        const realBadge = artMeta ? artMeta.badge : (item && item.querySelector('.gallery-badge') ? item.querySelector('.gallery-badge').innerText : 'Unikat');

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
        const displayBadge = isEn ? 'Unique Original' : realBadge;

        if (infoTitle) infoTitle.innerText = realTitle;
        if (infoDesc) infoDesc.innerText = realDesc;
        if (detailTechnik) detailTechnik.innerText = displayTechnik;
        if (detailMasse) detailMasse.innerText = realMasse;
        if (detailKat) detailKat.innerText = displayKat;

        if (statusBadge) {
            statusBadge.innerText = displayBadge;
            statusBadge.className = 'gallery-badge badge-unikat lightbox-meta-badge';
            statusBadge.style.display = 'inline-block';
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

        // Share Link Button
        if (lbShareBtn) {
            lbShareBtn.onclick = function() {
                const shareUrl = window.location.origin + window.location.pathname + (itemId ? '#' + itemId : '');
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        showToast(isEn ? '🔗 Direct link to artwork copied!' : '🔗 Direktlink zum Gemälde kopiert!');
                    }).catch(() => {
                        showToast('Link: ' + shareUrl);
                    });
                } else {
                    showToast('Link: ' + shareUrl);
                }
            };
        }

        // Favorit Button in Lightbox
        if (lbFavBtn && itemId) {
            const isFav = getFavorites().includes(itemId);
            lbFavBtn.classList.toggle('active', isFav);
            lbFavBtn.innerHTML = isFav 
                ? (isEn ? '<i class="fa-solid fa-heart" style="color:#e74c3c;"></i> Remove from Favorites' : '<i class="fa-solid fa-heart" style="color:#e74c3c;"></i> Aus Favoriten entfernen')
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

        // Customer Testimonial Card in Lightbox
        const testimonials = {
            'DSC_6622a': '„Die Farbdynamik in diesem Landschaftsbild verzaubert unseren Flur jeden Tag aufs Neue.“ – Stefan K., Bonn',
            'DSC_6626a': '„Manuela hat das Wesen unseres Hundes mit unglaublicher Liebe zum Detail eingefangen.“ – Elena M., Bad Godesberg',
            'DSC_6689a': '„Wunderschöne Pfingstrosen! Ein Meisterwerk aus Acryl, das voller Leben steckt.“ – Karin S., Köln'
        };
        const testimonialsEn = {
            'DSC_6622a': '"The color dynamics in this landscape enchant our hallway anew every day." – Stefan K., Bonn',
            'DSC_6626a': '"Manuela captured the essence of our dog with incredible attention to detail." – Elena M., Bad Godesberg',
            'DSC_6689a': '"Beautiful peonies! A masterpiece in acrylic, brimming with life." – Karin S., Cologne'
        };
        const lbTestimonialBox = document.getElementById('lightbox-testimonial-box');
        if (lbTestimonialBox) {
            const testimonialText = (currentLang === 'en' ? testimonialsEn[itemId] : null) || testimonials[itemId];
            if (testimonialText) {
                lbTestimonialBox.innerHTML = `<i class="fa-solid fa-quote-left" aria-hidden="true"></i> ${testimonialText}`;
                lbTestimonialBox.style.display = 'block';
            } else {
                lbTestimonialBox.style.display = 'none';
            }
        }

        // Lupe / Magnifier Zoom initialisieren
        initLightboxMagnifier();

        // Hash in URL setzen ohne Neuladen
        if (itemId && history.replaceState) {
            history.replaceState(null, null, '#' + itemId);
        }

        const closeBtn = lightbox.querySelector('.close');
        if (closeBtn) closeBtn.focus();
    }

    // Touch Swipe Steuerung für Mobilgeräte in Lightbox
    let touchStartX = 0;
    let touchEndX = 0;
    if (lightbox) {
        lightbox.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const threshold = 40;
        if (touchEndX < touchStartX - threshold) {
            changeSlide(1); // Swipe Links -> Nächstes Bild
        }
        if (touchEndX > touchStartX + threshold) {
            changeSlide(-1); // Swipe Rechts -> Vorheriges Bild
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
                const altText = img ? (img.alt || img.title || '') : '';
                const item = link.closest('.gallery-item');
                const kat = item ? (item.getAttribute('data-kategorie') || '') : '';
                window.location.href = `Auftrag.html?ref=${encodeURIComponent(altText)}&kat=${encodeURIComponent(kat)}`;
            } else {
                window.location.href = 'Auftrag.html';
            }
        });
    }

    // Pfeil-Navigation global verfügbar machen
    window.changeSlide = function (n) {
        openLightbox(currentIndex + n);
    };

    // Schließen & Scroll-Restaurierung
    const closeLightboxFn = function () {
        if (lightbox) lightbox.style.display = 'none';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        if (history.replaceState) {
            history.replaceState(null, null, window.location.pathname);
        }
        if (lastFocusedElement) lastFocusedElement.focus();
    };

    if (lightbox) {
        const closeBtn = lightbox.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = closeLightboxFn;
            closeBtn.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    closeLightboxFn();
                }
            });
        }

        lightbox.addEventListener('click', function (event) {
            if (event.target === lightbox) {
                closeLightboxFn();
            }
        });
    }

    // Tastaturbedienung für die Lightbox (ignoriert Texteingaben)
    document.addEventListener('keydown', function (e) {
        if (lightbox && (lightbox.style.display === 'flex' || lightbox.style.display === 'block')) {
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
    window.onscroll = function () {
        if (backToTopButton) {
            const show = document.body.scrollTop > 150 || document.documentElement.scrollTop > 150;
            backToTopButton.style.display = show ? 'flex' : 'none';
        }
    };

    // --- F. 3D Visitenkarte Flipping ---
    const flipCard = document.querySelector('.flip-card');
    if (flipCard) {
        flipCard.addEventListener('click', function () {
            this.classList.toggle('flipped');
        });
        flipCard.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.classList.toggle('flipped');
            }
        });
    }

    // --- G. Rechtsklick-Schutz (Toast) ---
    document.addEventListener('contextmenu', function (e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            showToast(currentLang === 'en' ? 'Copyright protected © Manuela Schenk' : 'Urheberrechtlich geschützt © Manuela Schenk');
        }
    });

    // --- H. Kontaktformular: URL-Parameter auslesen & Formular vorausfüllen ---
    prefillContactForm();

    // --- I. Kontaktformular: Erfolgsmeldung nach Absenden ---
    initContactForm();

    reveal();

}); // Ende DOMContentLoaded


/* =========================================
   4. GLOBALE HILFSFUNKTIONEN
   ========================================= */

// Nach oben scrollen
function topFunction() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Reveal Animation beim Scrollen
function reveal() {
    const reveals = document.querySelectorAll('.reveal');
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const revealTop = reveals[i].getBoundingClientRect().top;
        if (revealTop < windowHeight - 80) {
            reveals[i].classList.add('active');
        }
    }
}
window.addEventListener('scroll', reveal);

// Flyer Modal
function openFlyerModal(element) {
    const modal = document.getElementById('flyerModal');
    const modalImg = document.getElementById('modalImg');
    if (modal && modalImg) {
        modal.style.display = 'flex';
        modalImg.src = element.src;
        document.body.style.overflow = 'hidden';
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) closeBtn.focus();
    }
}

function closeFlyerModal() {
    const modal = document.getElementById('flyerModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Esc-Taste schließt auch das Flyer-Modal
document.addEventListener('keydown', function (e) {
    const modal = document.getElementById('flyerModal');
    if (modal && modal.style.display === 'flex') {
        if (e.key === 'Escape') closeFlyerModal();
    }
});

// Toast Nachricht anzeigen
function showToast(message) {
    const x = document.getElementById('toast');
    if (x) {
        if (message) x.innerHTML = `<i class="fa fa-info-circle" aria-hidden="true"></i> ${message}`;
        x.className = 'show';
        setTimeout(function () { x.className = x.className.replace('show', ''); }, 3000);
    }
}

// DSGVO Zwei-Klick Google Maps
window.loadGoogleMap = function () {
    const container = document.getElementById('map-container');
    if (container) {
        container.innerHTML = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2527.233853688376!2d7.134801276840789!3d50.69704476957748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bee3f119f2ffc1%3A0xc9c318a1fed01d18!2sR%C3%BCdesheimer%20Str.%2014%2C%2053175%20Bonn!5e0!3m2!1sde!2sde!4v1766414742106!5m2!1sde!2sde" width="100%" height="380" style="border:0; border-radius:12px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Google Maps Karte vom Standort von ManuFAKTUR Schenk in Bonn"></iframe>';
    }
};

/* =========================================
   5. KONTAKTFORMULAR: URL-PARAMETER AUSLESEN
   ========================================= */
function prefillContactForm() {
    const params = new URLSearchParams(window.location.search);
    const motiv = params.get('motiv');
    const format = params.get('format');
    const technik = params.get('technik');
    const preis = params.get('preis');

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
        messageField.value =
            `Hallo Manuela,\n\nüber den Auftrags-Konfigurator habe ich folgende Auswahl getroffen:\n\n` +
            `• Motiv: ${motiv || '–'}\n` +
            `• Format: ${format || '–'}\n` +
            `• Technik: ${technik || '–'}${preisText}\n\n` +
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
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        const action = form.getAttribute('action');

        // Nur abfangen wenn echte Formspree-ID vorhanden
        if (!action || action.includes('DEINE_FORMSPREE_ID')) {
            e.preventDefault();
            showFormFeedback('error', '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> Das Formular ist noch nicht konfiguriert. Bitte schreibe direkt an <a href="mailto:manufaktur-malerei@web.de">manufaktur-malerei@web.de</a>');
            return;
        }

        e.preventDefault();
        const submitBtn = form.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> Sende...';
        }

        try {
            const data = new FormData(form);
            const response = await fetch(action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                form.reset();
                showFormFeedback('success', '<i class="fa fa-check-circle" aria-hidden="true"></i> Vielen Dank! Deine Nachricht wurde gesendet. Ich melde mich bald bei dir.');
            } else {
                showFormFeedback('error', '<i class="fa fa-exclamation-circle" aria-hidden="true"></i> Es ist ein Fehler aufgetreten. Bitte versuche es erneut oder schreibe direkt an <a href="mailto:manufaktur-malerei@web.de">manufaktur-malerei@web.de</a>');
            }
        } catch {
            showFormFeedback('error', '<i class="fa fa-exclamation-circle" aria-hidden="true"></i> Verbindungsfehler. Bitte schreibe direkt an <a href="mailto:manufaktur-malerei@web.de">manufaktur-malerei@web.de</a>');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa fa-paper-plane" aria-hidden="true"></i> Nachricht senden';
            }
        }
    });
}

function showFormFeedback(type, message) {
    let feedback = document.getElementById('form-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.id = 'form-feedback';
        const form = document.querySelector('.contact-form');
        if (form) form.insertAdjacentElement('afterend', feedback);
    }
    feedback.className = `form-feedback form-feedback--${type}`;
    feedback.innerHTML = message;
    feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* =========================================
   7. NEUE FEATURES INITIALISIERUNG
   ========================================= */

// Live-Suche in Galerie
function initGallerySearch() {
    const searchInput = document.getElementById('gallery-search');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            filterGallery();
        });
    }
}

// Tag-Chips in Galerie
function initTagChips() {
    const tagChips = document.querySelectorAll('.tag-chip');
    tagChips.forEach(chip => {
        chip.addEventListener('click', function () {
            const tagText = this.getAttribute('data-tag') || this.innerText.replace('#', '').trim();
            const searchInput = document.getElementById('gallery-search');
            if (searchInput) {
                if (searchInput.value.toLowerCase() === tagText.toLowerCase()) {
                    searchInput.value = '';
                    this.classList.remove('active');
                } else {
                    searchInput.value = tagText;
                    tagChips.forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                }
                filterGallery();
            }
        });
    });
}

// Favoriten-Auswahl in Step 1 des Auftrags-Konfigurators
function initFavoritesInConfigurator() {
    const favContainer = document.getElementById('config-saved-favorites');
    if (!favContainer) return;

    const favIds = getFavorites();
    if (favIds.length === 0) {
        favContainer.style.display = 'none';
        return;
    }

    const grid = favContainer.querySelector('.fav-cards-grid');
    if (!grid) return;

    grid.innerHTML = '';
    favIds.forEach(id => {
        const title = id.replace('_', ' ');
        const card = document.createElement('div');
        card.className = 'fav-card-item';
        card.setAttribute('tabindex', '0');
        card.innerHTML = `<img src="assets/images/img/thumbs/${id}.webp" alt="${title}" loading="lazy"><div style="padding:4px; font-size:0.75rem; text-align:center; font-weight:bold;">${id}</div>`;
        
        card.onclick = function() {
            grid.querySelectorAll('.fav-card-item').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            const hintEl = document.getElementById('hint-1');
            if (hintEl) {
                hintEl.innerHTML = `<i class="fa fa-circle-info"></i> Ausgewählte Lieblingswerk-Referenz: <strong>${id}</strong>`;
                hintEl.style.display = 'block';
                hintEl.style.color = 'var(--primary-color)';
            }
        };
        grid.appendChild(card);
    });

    favContainer.style.display = 'block';
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

// Lightbox Anfrage-Button
function initLightboxInquiry() {
    const inquiryBtn = document.getElementById('lightbox-inquiry-btn');
    if (inquiryBtn) {
        inquiryBtn.addEventListener('click', function () {
            if (visibleGalleryLinks.length > 0 && visibleGalleryLinks[currentIndex]) {
                const link = visibleGalleryLinks[currentIndex];
                const img = link.querySelector('img');
                const altText = img ? img.alt : '';
                const item = link.closest('.gallery-item');
                const kat = item ? item.getAttribute('data-kategorie') : '';
                window.location.href = `Auftrag.html?ref=${encodeURIComponent(altText)}&kat=${encodeURIComponent(kat)}`;
            }
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
        
        const hintEl = document.getElementById('hint-1');
        if (hintEl && ref) {
            hintEl.innerHTML = `<i class="fa fa-circle-info"></i> Ausgewählte Motiv-Referenz: <strong>${ref}</strong>`;
            hintEl.style.display = 'block';
            hintEl.style.color = 'var(--primary-color)';
        }
    }
}

// Preiskalkulator Widget
function initPriceCalculator() {
    const calcContainer = document.getElementById('calc-widget');
    if (!calcContainer) return;

    const selectMotiv = document.getElementById('calc-motiv');
    const selectFormat = document.getElementById('calc-format');
    const selectTechnik = document.getElementById('calc-technik');
    const selectAnzahl = document.getElementById('calc-anzahl');
    const priceDisplay = document.getElementById('calc-price');

    function calculate() {
        if (!selectFormat || !priceDisplay) return;
        
        const basePrice = parseInt(selectFormat.value) || 120;
        const motivMult = parseFloat(selectMotiv ? selectMotiv.value : 1.0);
        const technikMult = parseFloat(selectTechnik ? selectTechnik.value : 1.0);
        const anzahlExtra = parseInt(selectAnzahl ? selectAnzahl.value : 0);

        const total = Math.round((basePrice * motivMult * technikMult) + anzahlExtra);
        const minPrice = Math.max(70, total - 15);
        const maxPrice = total + 15;

        priceDisplay.innerText = `ca. ${minPrice} € – ${maxPrice} €`;
    }

    [selectMotiv, selectFormat, selectTechnik, selectAnzahl].forEach(el => {
        if (el) el.addEventListener('change', calculate);
    });

    calculate();
}

// Vorher / Nachher Vergleichsslider
function initBeforeAfterSlider() {
    const slider = document.getElementById('ba-handle-input');
    const beforeLayer = document.getElementById('ba-before-layer');
    const lineHandle = document.getElementById('ba-line-handle');

    if (slider && beforeLayer && lineHandle) {
        slider.addEventListener('input', function () {
            const val = this.value;
            beforeLayer.style.width = val + '%';
            lineHandle.style.left = val + '%';
        });
    }
}

// Testimonials Karussell
function initTestimonialsCarousel() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.testimonial-dot');
    const prevBtn = document.getElementById('testi-prev');
    const nextBtn = document.getElementById('testi-next');

    if (slides.length === 0) return;

    let currentSlide = 0;
    let timer = null;

    function showSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));

        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetTimer(); });

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => { showSlide(idx); resetTimer(); });
    });

    function startTimer() {
        timer = setInterval(nextSlide, 6000);
    }

    function resetTimer() {
        clearInterval(timer);
        startTimer();
    }

    showSlide(0);
    startTimer();
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
    initGallerySearch();
    initTagChips();
    initFavoritesInConfigurator();
    initPhotoUploadPreview();
    initLightboxInquiry();
    initUrlParamPrefill();
    initPriceCalculator();
    initBeforeAfterSlider();
    initTestimonialsCarousel();
    initWallFrameDragLogic();
    registerServiceWorker();
});

/* =========================================
   8. GALERIE-FILTER START
   ========================================= */
runOnDOMReady(function () {
    if (document.getElementById('filter-container')) {
        filterSelection('alle');
    }
});