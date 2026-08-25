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
        filter_favorites: '❤️ Favoriten',
        search_placeholder: 'Gemälde, Motive oder Techniken durchsuchen...',
        sort_label: 'Sortierung:',
        sort_default: 'Standard',
        sort_title_asc: 'Titel (A-Z)',
        sort_title_desc: 'Titel (Z-A)',
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
        notfound_title: 'Seite nicht gefunden',
        notfound_text: 'Die aufgerufene Seite existiert leider nicht oder wurde verschoben.',
        notfound_btn: 'Zur Startseite'
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
        filter_favorites: '❤️ Favorites',
        search_placeholder: 'Search paintings, motifs, techniques or sizes...',
        sort_label: 'Sort by:',
        sort_default: 'Default',
        sort_title_asc: 'Title (A-Z)',
        sort_title_desc: 'Title (Z-A)',
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
        notfound_title: 'Page Not Found',
        notfound_text: 'The requested page does not exist or has been relocated.',
        notfound_btn: 'Back to Home'
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
    setElemHTML('.before-after-section h2', `<i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> ${t.ba_title}`);
    setElemText('.before-after-section .intro-text', t.ba_hint);
    setElemText('.ba-label-before', t.ba_photo);
    setElemText('.ba-label-after', t.ba_painting);

    setElemHTML('.steps-section h2', `<i class="fa-solid fa-list-ol" aria-hidden="true"></i> ${t.steps_title}`);
    const stepCards = document.querySelectorAll('.step-card');
    if (stepCards.length >= 4) {
        stepCards[0].querySelector('h3').textContent = t.step_1_title;
        stepCards[0].querySelector('p').textContent = t.step_1_desc;
        stepCards[1].querySelector('h3').textContent = t.step_2_title;
        stepCards[1].querySelector('p').textContent = t.step_2_desc;
        stepCards[2].querySelector('h3').textContent = t.step_3_title;
        stepCards[2].querySelector('p').textContent = t.step_3_desc;
        stepCards[3].querySelector('h3').textContent = t.step_4_title;
        stepCards[3].querySelector('p').textContent = t.step_4_desc;
    }

    setElemHTML('.faq-section h2', `<i class="fa fa-comments" aria-hidden="true"></i> ${t.faq_title}`);
    const faqItems = document.querySelectorAll('.accordion-item');
    if (faqItems.length >= 4) {
        faqItems[0].querySelector('.accordion-header').innerHTML = `${t.faq_1_q} <i class="fa fa-chevron-down" aria-hidden="true"></i>`;
        faqItems[0].querySelector('.accordion-content p').textContent = t.faq_1_a;
        faqItems[1].querySelector('.accordion-header').innerHTML = `${t.faq_2_q} <i class="fa fa-chevron-down" aria-hidden="true"></i>`;
        faqItems[1].querySelector('.accordion-content p').textContent = t.faq_2_a;
        faqItems[2].querySelector('.accordion-header').innerHTML = `${t.faq_3_q} <i class="fa fa-chevron-down" aria-hidden="true"></i>`;
        faqItems[2].querySelector('.accordion-content p').textContent = t.faq_3_a;
        faqItems[3].querySelector('.accordion-header').innerHTML = `${t.faq_4_q} <i class="fa fa-chevron-down" aria-hidden="true"></i>`;
        faqItems[3].querySelector('.accordion-content p').textContent = t.faq_4_a;
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
    const sortSelect = document.getElementById('gallery-sort');
    if (sortSelect && sortSelect.options.length >= 3) {
        sortSelect.options[0].text = t.sort_default;
        sortSelect.options[1].text = t.sort_title_asc;
        sortSelect.options[2].text = t.sort_title_desc;
    }
    const sortLabel = document.querySelector('.gallery-sort-wrapper label');
    if (sortLabel) sortLabel.innerHTML = `<i class="fa-solid fa-arrow-down-short-wide" aria-hidden="true"></i> ${t.sort_label}`;

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
    setElemHTML('.calc-heading', `<i class="fa-solid fa-calculator" aria-hidden="true"></i> ${t.calc_title}`);
    setElemText('#calc-price-label', t.calc_price_label);

    // Kontakt.html Form & Cards
    const contactCards = document.querySelectorAll('.contact-info .contact-info-card');
    if (contactCards.length >= 2) {
        contactCards[0].querySelector('h3').innerHTML = `<i class="fa-solid fa-address-book" aria-hidden="true"></i> ${t.contact_direct_title}`;
        contactCards[1].querySelector('h3').innerHTML = `<i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${t.contact_studio_title}`;
    }
    setElemText('.contact-studio-desc', t.contact_studio_desc);
    setElemHTML('.contact-form-wrapper h2', `<i class="fa-solid fa-paper-plane" aria-hidden="true"></i> ${t.contact_form_title}`);
    const nameInput = document.getElementById('name');
    if (nameInput) nameInput.setAttribute('placeholder', isEn ? 'John Doe' : 'Max Mustermann');
    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.setAttribute('placeholder', isEn ? 'your.name@example.com' : 'deine.email@beispiel.de');
    const subjectInput = document.getElementById('subject');
    if (subjectInput) subjectInput.setAttribute('placeholder', isEn ? 'e.g. Animal Portrait Commission' : 'z. B. Anfrage Tierportrait');
    const messageInput = document.getElementById('message');
    if (messageInput) messageInput.setAttribute('placeholder', isEn ? 'Describe your idea, pet or desired format...' : 'Beschreibe dein Wunschmotiv, Tier oder Format...');
    setElemHTML('.contact-form .submit-btn', `<i class="fa fa-paper-plane" aria-hidden="true"></i> ${t.contact_btn_send}`);

    // Map 2-click
    setElemText('.map-placeholder-content h4', t.map_title);
    setElemText('.map-placeholder-content p', t.map_text);
    setElemText('.map-placeholder-content .btn', t.map_btn);

    // 404.html
    setElemText('.error-page h1', t.notfound_title);
    setElemText('.error-page p', t.notfound_text);
    setElemHTML('.error-page .btn', `<i class="fa fa-home" aria-hidden="true"></i> ${t.notfound_btn}`);
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
        showToast('Kunstwerk aus Favoriten entfernt.');
    } else {
        favs.push(itemId);
        isAdded = true;
        showToast('❤️ Kunstwerk zu Favoriten hinzugefügt!');
    }

    saveFavorites(favs);
    updateFavButtonsUI(itemId, isAdded);
    updateFavBadgeCount();

    if (activeCategory === 'favoriten') {
        filterGallery();
    }
}

function updateFavButtonsUI(itemId, isAdded) {
    const itemEl = document.getElementById(itemId);
    if (itemEl) {
        const btn = itemEl.querySelector('.fav-toggle-btn');
        if (btn) {
            btn.classList.toggle('active', isAdded);
            btn.setAttribute('aria-label', isAdded ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen');
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
            lbFavBtn.innerHTML = isAdded ? '<i class="fa-solid fa-heart" style="color:#e74c3c;"></i> Aus Favoriten entfernen' : '<i class="fa-regular fa-heart"></i> Zu Favoriten hinzufügen';
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
            btn.setAttribute('title', 'Zu Favoriten hinzufügen');
            btn.onclick = function(e) { toggleFavorite(itemId, e); };
            item.appendChild(btn);
        }

        const isAdded = favs.includes(itemId);
        btn.classList.toggle('active', isAdded);
        btn.setAttribute('aria-label', isAdded ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen');
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
            const artMeta = (itemId && typeof ARTWORKS_METADATA !== 'undefined' && ARTWORKS_METADATA[itemId]) ? ARTWORKS_METADATA[itemId] : null;
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
            const artMeta = (itemId && typeof ARTWORKS_METADATA !== 'undefined' && ARTWORKS_METADATA[itemId]) ? ARTWORKS_METADATA[itemId] : null;
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
    showToast('Galerie neu sortiert');
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
    showToast('🎯 Position zentriert');
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
                showToast('Eigene Wand erfolgreich geladen!');
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
    showToast(`Bild um ${currentRotationAngle}° gedreht`);
}

function toggleLightboxZoom() {
    isZoomActive = !isZoomActive;
    const btn = document.getElementById('btn-toggle-zoom');
    const lens = document.getElementById('lightbox-magnifier');
    if (btn) btn.classList.toggle('active', isZoomActive);
    if (!isZoomActive && lens) lens.style.display = 'none';
    showToast(isZoomActive ? '🔍 Lupe aktiviert (Fahre über das Bild)' : 'Lupe deaktiviert');
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
            if (activeCategory === 'favoriten') {
                if (titleEl) titleEl.innerText = 'Noch keine Favoriten gemerkt.';
                if (subEl) subEl.innerText = 'Klicke auf das Herz-Symbol auf den Kunstwerken, um deine persönlichen Lieblingswerke hier zu speichern.';
            } else {
                if (titleEl) titleEl.innerText = 'Keine passenden Gemälde gefunden.';
                if (subEl) subEl.innerText = 'Versuche es mit einem anderen Suchbegriff oder setze den Kategorie-Filter zurück.';
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
        const catMap = {
            'alle': 'alle Kategorien',
            'tiere': 'Tiere',
            'landschaften': 'Landschaften',
            'pflanzen': 'Pflanzen',
            'sonstiges': 'Sonstiges',
            'favoriten': '❤️ Gemerkte Kunstwerke'
        };
        const catLabel = catMap[activeCategory] || activeCategory;
        countBadge.innerHTML = `<i class="fa-solid fa-images" aria-hidden="true"></i> Zeige ${visibleCount} von ${items.length} Kunstwerken (${catLabel})`;
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

        const artMeta = (itemId && typeof ARTWORKS_METADATA !== 'undefined' && ARTWORKS_METADATA[itemId]) ? ARTWORKS_METADATA[itemId] : null;

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
                showToast('✨ KI-Wandvorlage im Raum aktiviert!');
            };
        }

        // Customer Testimonial Card in Lightbox
        const testimonials = {
            'DSC_6622a': '„Die Farbdynamik in diesem Landschaftsbild verzaubert unseren Flur jeden Tag aufs Neue.“ – Stefan K., Bonn',
            'DSC_6626a': '„Manuela hat das Wesen unseres Hundes mit unglaublicher Liebe zum Detail eingefangen.“ – Elena M., Bad Godesberg',
            'DSC_6689a': '„Wunderschöne Pfingstrosen! Ein Meisterwerk aus Acryl, das voller Leben steckt.“ – Karin S., Köln'
        };
        const lbTestimonialBox = document.getElementById('lightbox-testimonial-box');
        if (lbTestimonialBox) {
            if (testimonials[itemId]) {
                lbTestimonialBox.innerHTML = `<i class="fa-solid fa-quote-left" aria-hidden="true"></i> ${testimonials[itemId]}`;
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
            showToast('Urheberrechtlich geschützt © Manuela Schenk');
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
                    showToast('Hinweis: Datei ist größer als 10 MB.');
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
    filterSelection('alle');
});