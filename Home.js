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
    // Erstmal ausblenden
    x[i].style.display = "none";
    
    // Prüfen ob Kategorie passt
    if (dataKat.indexOf(kategorie) > -1) {
      x[i].style.display = "block"; 
    }
  }
}
// Standardmäßig einmal ausführen
filterSelection("alle");



/* =========================================
   2. FLYER MODAL FUNKTIONEN (Global)
   ========================================= */
function openFlyerModal(element) {
    var modal = document.getElementById("flyerModal");
    var modalImg = document.getElementById("modalImg");
    
    if (modal && modalImg) {
        modal.style.display = "flex"; 
        modalImg.src = element.src;   
    } else {
        console.error("Flyer-Modal HTML Element fehlt in dieser Datei!");
    }
}

function closeFlyerModal() {
    var modal = document.getElementById("flyerModal");
    if (modal) {
        modal.style.display = "none";
    }
}


/* =========================================
   3. DOM-LOGIK (Wartet bis Seite geladen ist)
   ========================================= */
document.addEventListener('DOMContentLoaded', function() {

    var btnContainer = document.getElementById("filter-container");
    if (btnContainer) {
        var btns = btnContainer.getElementsByClassName("filter-btn");
        for (var i = 0; i < btns.length; i++) {
          btns[i].addEventListener("click", function(){
            var current = document.getElementsByClassName("active");
            if (current.length > 0) { 
              current[0].className = current[0].className.replace(" active", "");
            }
            this.className += " active";
          });
        }
    }

    // --- B. Lightbox & Slideshow (Galerie) ---
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var captionText = document.getElementById('caption');
    
    var closeBtn = document.querySelector('#lightbox .close');
    
    var galleryLinks = Array.from(document.querySelectorAll('.gallery-item a'));
    var currentIndex = 0; 

    // Funktion: Lightbox öffnen
    function openLightbox(index) {
        if (!lightbox) return; 

        currentIndex = index;
        var link = galleryLinks[currentIndex];
        
        lightbox.style.display = "flex"; 
        lightboxImg.src = link.href;     
        
        // Bildunterschrift holen
        var imgInside = link.querySelector('img');
        if (imgInside) {
             var captionDiv = link.querySelector('.gallery-caption');
             if(captionDiv) {
                 captionText.innerHTML = captionDiv.innerText;
             } else {
                 captionText.innerHTML = imgInside.alt; 
             }
        }
    }

    // Klick-Events auf alle Galerie-Bilder setzen
    galleryLinks.forEach(function(link, index) {
        link.addEventListener('click', function(event) {
            event.preventDefault(); 
            openLightbox(index);    
        });
    });

    // Vor / Zurück Funktion (Global verfügbar machen für onclick im HTML)
    window.changeSlide = function(n) {
        currentIndex += n;
        if (currentIndex >= galleryLinks.length) currentIndex = 0;
        if (currentIndex < 0) currentIndex = galleryLinks.length - 1;
        openLightbox(currentIndex);
    };

    // Schließen (X-Button)
    if (closeBtn) {
        closeBtn.onclick = function() {
            lightbox.style.display = "none";
        };
    }

    // Schließen (Klick auf Hintergrund)
    if (lightbox) {
        lightbox.addEventListener('click', function(event) {
            if (event.target === lightbox) {
                lightbox.style.display = "none";
            }
        });
    }

    // Tastatursteuerung
    document.addEventListener('keydown', function(event) {
        if (lightbox && lightbox.style.display === "flex") {
            if (event.key === "ArrowLeft") changeSlide(-1);
            if (event.key === "ArrowRight") changeSlide(1);
            if (event.key === "Escape") lightbox.style.display = "none";
        }
    });

});



/* =========================================
   4. NACH OBEN BUTTON (Logik)
   ========================================= */

// Den Button holen
var mybutton = document.getElementById("myBtn");

// Wenn man 20px scrollt, Button zeigen
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  // Sicherheitscheck, falls Button auf einer Seite fehlt
  var mybutton = document.getElementById("myBtn");
  if (!mybutton) return;

  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// Beim Klicken nach oben scrollen
function topFunction() {
  // Sanftes Scrollen
  window.scrollTo({top: 0, behavior: 'smooth'});
}