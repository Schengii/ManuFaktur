/* =========================================
   HOME.JS – ManuFAKTUR Schenk
   Zentrale Skript-Datei für alle Seiten
   ========================================= */

/* =========================================
   1. SHARED COMPONENTS (Nav & Footer)
   ========================================= */

/**
 * Gibt den HTML-String der gemeinsamen Navigation zurück.
 * Der aktive Link wird anhand der aktuellen URL gesetzt.
 */
function getNavHTML(activePage) {
    const links = [
        { href: 'Home.html', icon: 'fa fa-home', label: 'Start' },
        { href: 'UeberMich.html', icon: 'fa-solid fa-address-card', label: 'Über mich' },
        { href: 'Leistungen.html', icon: 'fa fa-palette', label: 'Leistungen' },
        { href: 'Bildergalerie.html', icon: 'fa fa-images', label: 'Galerie' },
        { href: 'Auftrag.html', icon: 'fa fa-pen-ruler', label: 'Auftrag', title: 'Auftrag konfigurieren' },
    ];

    const navItems = links.map(l => {
        const isActive = activePage === l.href;
        return `<li${isActive ? ' class="active"' : ''}><a href="${l.href}"${l.title ? ` title="${l.title}"` : ''}><i class="${l.icon}" aria-hidden="true"></i> ${l.label}</a></li>`;
    }).join('\n            ');

    const isKontaktActive = ['Kontakt.html', 'Impressum.html', 'Datenschutz.html'].includes(activePage);

    return `
  <header>
    <nav aria-label="Hauptmenü">
      <div class="nav-brand">
        <a href="Home.html" class="headline" aria-label="ManuFAKTUR Startseite" title="Startseite">
          <img src="assets/images/logos/logo-transparent.png" alt="ManuFAKTUR Schenk Logo" class="nav-logo">
        </a>
      </div>
      <button class="hamburger" aria-label="Menü öffnen" aria-expanded="false">
        <i class="fa fa-bars" aria-hidden="true"></i>
      </button>
      <ul class="nav-links">
            ${navItems}
            <li class="dropdown${isKontaktActive ? ' active' : ''}">
              <a href="Kontakt.html" class="cursor-pointer" title="Kontakt">
                <i class="fa-solid fa-envelope" aria-hidden="true"></i> Kontakt
                <i class="fa fa-caret-down" aria-hidden="true"></i>
              </a>
              <div class="dropdown-content">
                <a href="Kontakt.html"><i class="fa-solid fa-envelope" aria-hidden="true"></i> Kontaktformular</a>
                <a href="Impressum.html"><i class="fa-solid fa-paragraph" aria-hidden="true"></i> Impressum</a>
                <a href="Datenschutz.html"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i> Datenschutz</a>
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
    return `
  <footer>
    <div class="footer-section">
      <h4>ManuFAKTUR</h4>
      <i class="fa fa-envelope" aria-hidden="true"></i>
          <a href="mailto:manufaktur-malerei@web.de">manufaktur-malerei@web.de</a>
      <p><i class="fa fa-phone" aria-hidden="true"></i> Telefon: Auf Anfrage</p>
    </div>
    <div class="footer-section">
      <h4>Manuela Schenk</h4>
      <p>53175 Bonn &bull; Deutschland</p>
      <div class="social-icons">
        <a href="https://www.instagram.com/manufakturmalerei?igsh=MXVncGlnZDNpeWc4ag==" target="_blank" rel="noopener" class="instagram" aria-label="Folge uns auf Instagram"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a>
        <a href="https://wa.me/491632662435" target="_blank" rel="noopener" class="whatsapp" aria-label="Kontaktiere uns auf WhatsApp"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a>
        <a href="https://www.linkedin.com/in/manuela-schenk" target="_blank" rel="noopener" class="linkedin" aria-label="Verbinde dich auf LinkedIn"><i class="fa-brands fa-linkedin" aria-hidden="true"></i></a>
      </div>
    </div>
    <div class="footer-section">
      <h4>Rechtliches</h4>
      <p>&copy; ${new Date().getFullYear()} ManuFAKTUR Schenk</p>
      <p class="font-size-09rem">
        <a href="Impressum.html">Impressum</a> |
        <a href="Datenschutz.html">Datenschutz</a>
      </p>
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
   2. GALERIE: FILTER, LIVE-SUCHE, FAVORITEN & DATEN
   ========================================= */
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
    const favs = getFavorites();
    const items = document.getElementsByClassName('gallery-item');
    for (let i = 0; i < items.length; i++) {
        const itemId = items[i].id;
        if (itemId) {
            const isFav = favs.includes(itemId);
            let btn = items[i].querySelector('.fav-toggle-btn');
            if (!btn) {
                btn = document.createElement('button');
                btn.className = 'fav-toggle-btn' + (isFav ? ' active' : '');
                btn.setAttribute('aria-label', isFav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen');
                btn.innerHTML = `<i class="${isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}" aria-hidden="true"></i>`;
                btn.onclick = function(e) { toggleFavorite(itemId, e); };
                items[i].appendChild(btn);
            }
        }
    }
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

let activeFormat = 'alle';

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

/* Room Visualizer Logic */
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
    }
}

function closeRoomVisualizer() {
    const modal = document.getElementById('roomVisualizerModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function setRoomBackdrop(preset, btn) {
    const stage = document.getElementById('room-stage');
    if (!stage) return;

    document.querySelectorAll('.room-preset-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const backdrops = {
        'livingroom': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
        'bedroom': 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80',
        'gallerywall': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&q=80'
    };

    if (backdrops[preset]) {
        stage.style.backgroundImage = `url('${backdrops[preset]}')`;
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

/* Magnifier Zoom Lens for Lightbox */
function initLightboxMagnifier() {
    const lightboxImg = document.getElementById('lightbox-img');
    const lens = document.getElementById('lightbox-magnifier');
    if (!lightboxImg || !lens) return;

    lightboxImg.removeEventListener('mousemove', moveLens);
    lightboxImg.removeEventListener('mouseleave', hideLens);

    lightboxImg.addEventListener('mousemove', moveLens);
    lightboxImg.addEventListener('mouseleave', hideLens);

    function moveLens(e) {
        lens.style.display = 'block';
        lens.style.backgroundImage = `url('${lightboxImg.src}')`;

        const bounds = lightboxImg.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;

        const zoomRatio = 2.5;
        lens.style.backgroundSize = `${bounds.width * zoomRatio}px ${bounds.height * zoomRatio}px`;

        const lensW = lens.offsetWidth / 2;
        const lensH = lens.offsetHeight / 2;

        lens.style.left = `${e.clientX - lensW}px`;
        lens.style.top = `${e.clientY - lensH}px`;
        lens.style.backgroundPosition = `-${x * zoomRatio - lensW}px -${y * zoomRatio - lensH}px`;
    }

    function hideLens() {
        lens.style.display = 'none';
    }
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

        const matchesSearch = (!searchTerm || itemText.toLowerCase().includes(searchTerm));
        const matchesFormat = (activeFormat === 'alle' || detectedFormat === activeFormat);

        if (matchesCategory && matchesSearch && matchesFormat) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    }

    const noResults = document.getElementById('no-gallery-results');
    if (noResults) {
        noResults.style.display = (visibleCount === 0) ? 'block' : 'none';
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

    function openLightbox(index) {
        if (!lightbox || visibleGalleryLinks.length === 0) return;

        lastFocusedElement = document.activeElement;
        document.body.style.overflow = 'hidden';
        currentIndex = index;

        if (currentIndex >= visibleGalleryLinks.length) currentIndex = 0;
        if (currentIndex < 0) currentIndex = visibleGalleryLinks.length - 1;

        const link = visibleGalleryLinks[currentIndex];
        const item = link.closest('.gallery-item');
        const itemId = item ? item.id : '';
        const imgInside = link.querySelector('img');
        const captionDiv = link.querySelector('.gallery-caption');
        const titleText = captionDiv ? captionDiv.innerText : (imgInside ? imgInside.alt : '');

        lightbox.style.display = 'flex';

        // Ladeindikator
        if (lightboxImg) {
            lightboxImg.style.opacity = '0';
            lightboxImg.src = link.href;
            lightboxImg.onload = function () {
                lightboxImg.style.transition = 'opacity 0.3s ease';
                lightboxImg.style.opacity = '1';
            };
        }

        if (captionText) {
            captionText.innerHTML = titleText;
        }

        // Bildzähler
        if (lbCounter) {
            lbCounter.innerText = `Bild ${currentIndex + 1} von ${visibleGalleryLinks.length}`;
        }

        // WhatsApp Link
        if (lbWhatsappBtn) {
            const waMsg = `Hallo Manuela, ich habe Interesse am Kunstwerk "${titleText}" (${itemId || link.href}) aus deiner Galerie.`;
            lbWhatsappBtn.href = `https://wa.me/491632662435?text=${encodeURIComponent(waMsg)}`;
        }

        // Share Link Button
        if (lbShareBtn) {
            lbShareBtn.onclick = function() {
                const shareUrl = window.location.origin + window.location.pathname + (itemId ? '#' + itemId : '');
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        showToast('🔗 Direktlink zum Gemälde kopiert!');
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
            lbFavBtn.innerHTML = isFav ? '<i class="fa-solid fa-heart" style="color:#e74c3c;"></i> Aus Favoriten entfernen' : '<i class="fa-regular fa-heart"></i> Zu Favoriten hinzufügen';
            lbFavBtn.onclick = function(e) {
                toggleFavorite(itemId, e);
            };
        }

        // Room Visualizer Button in Lightbox
        const lbRoomBtn = document.getElementById('lightbox-room-btn');
        if (lbRoomBtn) {
            lbRoomBtn.onclick = function() {
                openRoomVisualizer(link.href, titleText);
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

    // Klicks auf Galerie-Bilder abfangen
    document.addEventListener('click', function (e) {
        const link = e.target.closest('.gallery-item a');
        const galleryGrid = document.querySelector('.gallery-grid');
        if (link && galleryGrid && galleryGrid.contains(link)) {
            e.preventDefault();
            const index = visibleGalleryLinks.indexOf(link);
            openLightbox(index);
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

    // Schließen
    let closeLightboxFn = function () { };
    if (lightbox) {
        const closeBtn = lightbox.querySelector('.close');

        closeLightboxFn = function () {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
            if (history.replaceState) {
                history.replaceState(null, null, window.location.pathname);
            }
            if (lastFocusedElement) lastFocusedElement.focus();
        };

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
            if (event.target === lightbox) closeLightboxFn();
        });
    }

    // Tastaturbedienung für die Lightbox
    document.addEventListener('keydown', function (e) {
        if (lightbox && lightbox.style.display === 'flex') {
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
                        const index = visibleGalleryLinks.indexOf(link);
                        if (index !== -1) openLightbox(index);
                    }, 300);
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
    initGallerySearch();
    initTagChips();
    initFavoritesInConfigurator();
    initPhotoUploadPreview();
    initLightboxInquiry();
    initUrlParamPrefill();
    initPriceCalculator();
    initBeforeAfterSlider();
    initTestimonialsCarousel();
    registerServiceWorker();
});

/* =========================================
   8. GALERIE-FILTER START
   ========================================= */
runOnDOMReady(function () {
    filterSelection('alle');
});