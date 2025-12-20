/* =========================================
   1. FILTER FUNKTION (Muss außerhalb stehen)
   ========================================= */

// Standardmäßig alle zeigen
filterSelection("alle");

function filterSelection(kategorie) {
  var x, i;
  x = document.getElementsByClassName("gallery-item");
  
  if (kategorie == "alle") kategorie = "";
  
  for (i = 0; i < x.length; i++) {
    // Zuerst ausblenden
    x[i].style.display = "none";
    
    // Prüfen ob Kategorie passt
    if (x[i].getAttribute("data-kategorie").indexOf(kategorie) > -1) {
      x[i].style.display = "block"; // Hier war vorher "block", bei Grid layouts passt sich das aber an
    }
  }
}

// Button "Active" Status Logik
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


/* =========================================
   2. LIGHTBOX & SLIDESHOW (Wartet auf Laden)
   ========================================= */

document.addEventListener('DOMContentLoaded', function() {

    // --- Variablen holen ---
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var captionText = document.getElementById('caption');
    var closeBtn = document.getElementsByClassName("close")[0];
    
    // Alle Links der Galerie sammeln (nur die sichtbaren wären besser, aber so gehts auch)
    // Wir nutzen Array.from, damit wir später mit Index arbeiten können
    var galleryLinks = Array.from(document.querySelectorAll('.gallery-item a'));
    var currentIndex = 0; 

    // --- Funktion: Lightbox öffnen ---
    function openLightbox(index) {
        currentIndex = index;
        var link = galleryLinks[currentIndex];
        
        lightbox.style.display = "flex"; // Flexbox für Zentrierung
        lightboxImg.src = link.href;     // Bild-Quelle setzen
        
        // Bildunterschrift setzen
        var imgInside = link.querySelector('img');
        if (imgInside) {
             // Wenn du die div-Beschriftung nutzt, nimm diese Zeile:
             var captionDiv = link.querySelector('.gallery-caption');
             if(captionDiv) {
                 captionText.innerHTML = captionDiv.innerText;
             } else {
                 captionText.innerHTML = imgInside.alt; 
             }
        }
    }

    // --- Klick-Events für Bilder ---
    galleryLinks.forEach(function(link, index) {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Kein neuer Tab
            openLightbox(index);    // Öffne Lightbox
        });
    });

    // --- Weiter / Zurück Logik ---
    // Wir hängen die Funktion an "window", damit sie im HTML gefunden wird
    window.changeSlide = function(n) {
        currentIndex += n;

        // Endlos-Schleife (Loop)
        if (currentIndex >= galleryLinks.length) {
            currentIndex = 0;
        }
        if (currentIndex < 0) {
            currentIndex = galleryLinks.length - 1;
        }

        // Trick: Wenn das nächste Bild durch den Filter ausgeblendet ist, überspringen
        // Das ist etwas fortgeschritten, aber wir lassen es erstmal simpel:
        openLightbox(currentIndex);
    };

    // --- Schließen (X) ---
    if (closeBtn) {
        closeBtn.onclick = function() {
            lightbox.style.display = "none";
        };
    }

    // --- Schließen (Hintergrundklick) ---
    lightbox.addEventListener('click', function(event) {
        if (event.target === lightbox) {
            lightbox.style.display = "none";
        }
    });

    // --- Tastatursteuerung ---
    document.addEventListener('keydown', function(event) {
        if (lightbox.style.display === "flex") {
            if (event.key === "ArrowLeft") changeSlide(-1);
            if (event.key === "ArrowRight") changeSlide(1);
            if (event.key === "Escape") lightbox.style.display = "none";
        }
    });

}); 