/* =========================================
   1. FILTER FUNKTION (Galerie)
   ========================================= */
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
        // Suche nach der Kategorie im Attribut
        if (dataKat.indexOf(kategorie) > -1) {
            x[i].style.display = "block"; 
        }
    }
    updateGalleryLinks();
}


// Diese Variable hält die aktuell sichtbaren Bilder für die Lightbox
var visibleGalleryLinks = [];
var currentIndex = 0;

function updateGalleryLinks() {
    visibleGalleryLinks = Array.from(document.querySelectorAll('.gallery-item'))
        .filter(item => item.style.display !== 'none')
        .map(item => item.querySelector('a'));
}



/* =========================================
   2. DOM-LOGIK (Wartet bis Seite geladen ist)
   ========================================= */
document.addEventListener('DOMContentLoaded', function() {

    // --- A. Filter-Buttons Aktiv-Status ---
    var btnContainer = document.getElementById("filter-container");
    if (btnContainer) {
        var btns = btnContainer.getElementsByClassName("filter-btn");
        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener("click", function(){
                var current = btnContainer.getElementsByClassName("active");
                if (current.length > 0) { 
                    current[0].className = current[0].className.replace(" active", "");
                }
                this.className += " active";
            });
        }
    }

    updateGalleryLinks();

    
    // --- B. Lightbox & Slideshow ---
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var captionText = document.getElementById('caption');
    
    function openLightbox(index) {
        if (!lightbox || visibleGalleryLinks.length === 0) return; 

        document.body.style.overflow = 'hidden'; 
        currentIndex = index;
        
        // Sicherstellen, dass der Index im Rahmen bleibt
        if (currentIndex >= visibleGalleryLinks.length) currentIndex = 0;
        if (currentIndex < 0) currentIndex = visibleGalleryLinks.length - 1;

        var link = visibleGalleryLinks[currentIndex];
        lightbox.style.display = "flex"; 
        lightboxImg.src = link.href;     
        
        var imgInside = link.querySelector('img');
        var captionDiv = link.querySelector('.gallery-caption');
        captionText.innerHTML = captionDiv ? captionDiv.innerText : (imgInside ? imgInside.alt : "");
    }



    // Event-Delegation für Klicks auf Galerie-Bilder (funktioniert auch nach Filtern)
    document.addEventListener('click', function(e) {
        var link = e.target.closest('.gallery-item a');
        if (link && document.querySelector('.gallery-grid').contains(link)) {
            e.preventDefault();
            var index = visibleGalleryLinks.indexOf(link);
            openLightbox(index);
        }
    });

    // Globale Funktion für die Pfeile
    window.changeSlide = function(n) {
        openLightbox(currentIndex + n);
    };

    // Schließen-Logik
    var closeBtn = document.querySelector('#lightbox .close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            lightbox.style.display = "none";
            document.body.style.overflow = 'auto';
        };
    }

    if (lightbox) {
        lightbox.addEventListener('click', function(event) {
            if (event.target === lightbox) {
                lightbox.style.display = "none";
                document.body.style.overflow = 'auto';
            }
        });
    }

    // --- C. FAQ Akkordeon ---
    var accHeaders = document.querySelectorAll('.accordion-header');
    accHeaders.forEach(header => {
        header.addEventListener('click', function() {
            // Icon rotieren (CSS Klasse umschalten)
            this.classList.toggle('active');
            
            var content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // --- D. Nach oben Button ---
    var mybutton = document.getElementById("myBtn");
    window.onscroll = function() {
        if (mybutton) {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                mybutton.style.display = "block";
            } else {
                mybutton.style.display = "none";
            }
        }
    };
});



/* =========================================
   3. GLOBALE HILFSFUNKTIONEN
   ========================================= */
function topFunction() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var revealTop = reveals[i].getBoundingClientRect().top;
        if (revealTop < windowHeight - 100) {
            reveals[i].classList.add("active");
        }
    }
}

window.addEventListener('scroll', reveal);
window.addEventListener('load', reveal);

// Start-Filter setzen
filterSelection("alle");



/* =========================================
   4. FLYER MODAL (Global)
   ========================================= */
function openFlyerModal(element) {
    var modal = document.getElementById("flyerModal");
    var modalImg = document.getElementById("modalImg");
    // Sicherheitscheck, ob das Modal auf der Seite existiert
    if (modal && modalImg) {
        modal.style.display = "flex"; 
        modalImg.src = element.src;   
    }
}

function closeFlyerModal() {
    var modal = document.getElementById("flyerModal");
    if (modal) {
        modal.style.display = "none";
    }
}