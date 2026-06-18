/* =========================================
   1. GALERIE: FILTER & DATEN
   ========================================= */
var visibleGalleryLinks = [];
var currentIndex = 0;

function filterSelection(kategorie) {
    var x = document.getElementsByClassName("gallery-item");
    if (kategorie == "alle") kategorie = "";
    
    for (var i = 0; i < x.length; i++) {
        var dataKat = x[i].getAttribute("data-kategorie");
        if (!dataKat) {
            x[i].style.display = "block";
            continue;
        }
        x[i].style.display = "none";
        if (dataKat.indexOf(kategorie) > -1) {
            x[i].style.display = "block"; 
        }
    }
    updateGalleryLinks();
}

function updateGalleryLinks() {
    visibleGalleryLinks = Array.from(document.querySelectorAll('.gallery-item'))
        .filter(item => item.style.display !== 'none')
        .map(item => item.querySelector('a'));
}

/* =========================================
   2. DOM READY (Initialisierung)
   ========================================= */
document.addEventListener('DOMContentLoaded', function() {

    // --- A. Filter Buttons ---
    var btnContainer = document.getElementById("filter-container");
    if (btnContainer) {
        var btns = btnContainer.getElementsByClassName("filter-btn");
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener("click", function(){
                var current = btnContainer.getElementsByClassName("active");
                if (current.length > 0) { 
                    current[0].classList.remove("active");
                }
                this.classList.add("active");
            });
        }
    }
    
    // Initiale Liste erstellen
    updateGalleryLinks();

    // --- B. Hamburger Menü (Mobil) ---
    var hamburger = document.querySelector('.hamburger');
    var navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            var active = navLinks.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', active ? 'true' : 'false');
            // Toggle hamburger icon if needed (between fa-bars and fa-times)
            var icon = hamburger.querySelector('i');
            if (icon) {
                if (active) {
                    icon.className = "fa fa-close";
                } else {
                    icon.className = "fa fa-bars";
                }
            }
        });
    }

    // --- C. Lightbox & Slideshow ---
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var captionText = document.getElementById('caption');
    var lastFocusedElement = null;
    
    function openLightbox(index) {
        if (!lightbox || visibleGalleryLinks.length === 0) return; 

        // Speichere das Element, das vor dem Öffnen den Fokus hatte
        lastFocusedElement = document.activeElement;
        
        document.body.style.overflow = 'hidden'; 
        currentIndex = index;
        
        // Grenzen prüfen
        if (currentIndex >= visibleGalleryLinks.length) currentIndex = 0;
        if (currentIndex < 0) currentIndex = visibleGalleryLinks.length - 1;

        var link = visibleGalleryLinks[currentIndex];
        lightbox.style.display = "flex"; 
        lightboxImg.src = link.href;     
        
        var imgInside = link.querySelector('img');
        var captionDiv = link.querySelector('.gallery-caption');
        captionText.innerHTML = captionDiv ? captionDiv.innerText : (imgInside ? imgInside.alt : "");
        
        // Setze Fokus auf die Schließen-Schaltfläche der Lightbox für Barrierefreiheit
        var closeBtn = lightbox.querySelector('.close');
        if (closeBtn) {
            closeBtn.focus();
        }
    }

    // Klicks auf Galerie-Bilder abfangen
    document.addEventListener('click', function(e) {
        var link = e.target.closest('.gallery-item a');
        if (link && document.querySelector('.gallery-grid').contains(link)) {
            e.preventDefault();
            var index = visibleGalleryLinks.indexOf(link);
            openLightbox(index);
        }
    });

    // Pfeil-Navigation global verfügbar machen
    window.changeSlide = function(n) {
        openLightbox(currentIndex + n);
    };

    // Schließen
    if (lightbox) {
        var closeBtn = lightbox.querySelector('.close');
        
        var closeLightbox = function() {
            lightbox.style.display = "none";
            document.body.style.overflow = 'auto';
            // Fokus wiederherstellen
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
        };

        if (closeBtn) {
            closeBtn.onclick = closeLightbox;
            // Tastaturunterstützung für Schließen-Button
            closeBtn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    closeLightbox();
                }
            });
        }
        
        // Schließen bei Klick neben das Bild
        lightbox.addEventListener('click', function(event) {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Tastaturbedienung für die Lightbox
    document.addEventListener('keydown', function(e) {
        if (lightbox && lightbox.style.display === "flex") {
            if (e.key === "Escape") {
                lightbox.style.display = "none";
                document.body.style.overflow = 'auto';
                if (lastFocusedElement) lastFocusedElement.focus();
            } else if (e.key === "ArrowRight") {
                changeSlide(1);
            } else if (e.key === "ArrowLeft") {
                changeSlide(-1);
            }
        }
    });

    // --- D. FAQ Akkordeon ---
    var accHeaders = document.querySelectorAll('.accordion-header');
    accHeaders.forEach(header => {
        // Setze initialen Zustand für Barrierefreiheit
        header.setAttribute('aria-expanded', 'false');
        
        header.addEventListener('click', function() {
            var active = this.classList.toggle('active');
            this.setAttribute('aria-expanded', active ? 'true' : 'false');
            
            var content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // --- E. Nach oben Button ---
    var backToTopButton = document.querySelector('.back-to-top');
    window.onscroll = function() {
        if (backToTopButton) {
            if (document.body.scrollTop > 150 || document.documentElement.scrollTop > 150) {
                backToTopButton.style.display = "flex"; // use flex to align icon
            } else {
                backToTopButton.style.display = "none";
            }
        }
    };

    // --- F. 3D Visitenkarte Flipping via Tastatur ---
    var flipCard = document.querySelector('.flip-card');
    if (flipCard) {
        // Klick-Event für Mobilgeräte oder Maus
        flipCard.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
        // Tastaturunterstützung (Leertaste/Enter)
        flipCard.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.classList.toggle('flipped');
            }
        });
    }

    // --- G. Rechtsklick-Schutz (Toast) ---
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault(); 
            showToast();        
        }
    });

    reveal();

}); // Ende DOMContentLoaded

/* =========================================
   3. GLOBALE HILFSFUNKTIONEN
   ========================================= */

// Nach oben scrollen
function topFunction() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// Reveal Animation beim Scrollen
function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var revealTop = reveals[i].getBoundingClientRect().top;
        if (revealTop < windowHeight - 80) {
            reveals[i].classList.add("active");
        }
    }
}
window.addEventListener('scroll', reveal);

// Flyer Modal (wird per onclick im HTML aufgerufen)
function openFlyerModal(element) {
    var modal = document.getElementById("flyerModal");
    var modalImg = document.getElementById("modalImg");
    if (modal && modalImg) {
        modal.style.display = "flex"; 
        modalImg.src = element.src;   
        document.body.style.overflow = 'hidden'; 
        
        // Fokus auf Schließen Button setzen
        var closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.focus();
        }
    }
}

function closeFlyerModal() {
    var modal = document.getElementById("flyerModal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = 'auto';
    }
}

// Esc-Taste schließt auch das Flyer-Modal
document.addEventListener('keydown', function(e) {
    var modal = document.getElementById("flyerModal");
    if (modal && modal.style.display === "flex") {
        if (e.key === "Escape") {
            closeFlyerModal();
        }
    }
});

// Toast Nachricht anzeigen
function showToast() {
    var x = document.getElementById("toast");
    if (x) {
        x.className = "show";
        setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }
}

// DSGVO Zwei-Klick Google Maps Ladefunktion
window.loadGoogleMap = function() {
    var container = document.getElementById('map-container');
    if (container) {
        container.innerHTML = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2527.233853688376!2d7.134801276840789!3d50.69704476957748!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47bee3f119f2ffc1%3A0xc9c318a1fed01d18!2sR%C3%BCdesheimer%20Str.%2014%2C%2053175%20Bonn!5e0!3m2!1sde!2sde!4v1766414742106!5m2!1sde!2sde" width="100%" height="380" style="border:0; border-radius:12px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Google Maps Karte vom Standort von ManuFAKTUR Schenk in Bonn"></iframe>';
    }
};

// Start-Filter setzen
filterSelection("alle");