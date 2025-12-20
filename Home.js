//<script src="https://kit.fontawesome.com/35e5bc9e39" crossorigin="anonymous"></script>

// Bildergalerie.thml Lightbox Funktionalität 
// Warte, bis die Seite komplett geladen ist
document.addEventListener('DOMContentLoaded', function() {

    // Hole Elemente
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var captionText = document.getElementById('caption');
    var closeBtn = document.getElementsByClassName("close")[0];

    // Wähle alle Links in der Galerie aus (die um die Bilder herum sind)
    var galleryLinks = document.querySelectorAll('.gallery-item a');

    // Schleife durch alle Links
    galleryLinks.forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Verhindert das Öffnen im neuen Tab

            lightbox.style.display = "flex"; // Zeige Lightbox
            lightboxImg.src = this.href; // Setze das Bild aus dem Link
            
            // Optional: Setze den Alt-Text als Bildunterschrift
            var imgInside = this.querySelector('img');
            if (imgInside) {
                captionText.innerHTML = imgInside.alt;
            }
        });
    });

    // Schließen beim Klick auf das X
    closeBtn.onclick = function() {
        lightbox.style.display = "none";
    }

    // Schließen beim Klick neben das Bild (auf den dunklen Hintergrund)
    lightbox.addEventListener('click', function(event) {
        if (event.target === lightbox) {
            lightbox.style.display = "none";
        }
    });
});

/* --- Filter Funktion --- */
filterSelection("alle") // Zeige am Anfang alle Bilder

function filterSelection(kategorie) {
  var x, i;
  // Hole alle Elemente mit der Klasse "gallery-item"
  x = document.getElementsByClassName("gallery-item");
  
  if (kategorie == "alle") kategorie = "";
  
  for (i = 0; i < x.length; i++) {
    // Zuerst alles verstecken
    x[i].style.display = "none";
    
    // Wenn das Bild die passende Kategorie hat (oder "alle" gewählt ist), zeige es
    if (x[i].getAttribute("data-kategorie").indexOf(kategorie) > -1) {
      x[i].style.display = "block";
    }
  }
}

// Button "Active" Status wechseln (damit der geklickte Button dunkel bleibt)
var btnContainer = document.getElementById("filter-container");
var btns = btnContainer.getElementsByClassName("filter-btn");

for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function(){
    var current = document.getElementsByClassName("active");
    // Entferne "active" vom alten Button
    if (current.length > 0) { 
      current[0].className = current[0].className.replace(" active", "");
    }
    // Füge "active" zum neuen Button hinzu
    this.className += " active";
  });
}