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

            lightbox.style.display = "block"; // Zeige Lightbox
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