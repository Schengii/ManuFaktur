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
    if (dataKat.indexOf(kategorie) > -1) {
      x[i].style.display = "block"; 
    }
  }
}


filterSelection("alle");




/* =========================================
   2. DOM-LOGIK (Wartet bis Seite geladen ist)
   ========================================= */
document.addEventListener('DOMContentLoaded', function() {

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


    // --- B. Lightbox & Slideshow (Galerie) ---
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var captionText = document.getElementById('caption');
    var closeBtn = document.querySelector('#lightbox .close');
    
    var galleryLinks = Array.from(document.querySelectorAll('.gallery-item a'));
    var currentIndex = 0; 

    function openLightbox(index) {
        if (!lightbox) return; 

        // Verhindert Scrollen im Hintergrund
        document.body.style.overflow = 'hidden';
        currentIndex = index;
        var link = galleryLinks[currentIndex];
        
        lightbox.style.display = "flex"; 
        lightboxImg.src = link.href;     
        
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

    galleryLinks.forEach(function(link, index) {
        link.addEventListener('click', function(event) {
            event.preventDefault(); 
            openLightbox(index);    
        });
    });

    window.changeSlide = function(n) {
        currentIndex += n;
        if (currentIndex >= galleryLinks.length) currentIndex = 0;
        if (currentIndex < 0) currentIndex = galleryLinks.length - 1;
        openLightbox(currentIndex);
    };

    if (closeBtn) {
        closeBtn.onclick = function() {
            lightbox.style.display = "none";
            // Scrollen wieder erlauben
            document.body.style.overflow = 'auto';
        };
    }

    if (lightbox) {
        lightbox.addEventListener('click', function(event) {
            if (event.target === lightbox) {
                lightbox.style.display = "none";
                // Scrollen wieder erlauben
                document.body.style.overflow = 'auto';
            }
        });
    }

    document.addEventListener('keydown', function(event) {
        if (lightbox && lightbox.style.display === "flex") {
            if (event.key === "ArrowLeft") changeSlide(-1);
            if (event.key === "ArrowRight") changeSlide(1);
            if (event.key === "Escape") lightbox.style.display = "none";
        }
    });

    // --- C. Nach oben Button ---
    var mybutton = document.getElementById("myBtn");
    window.onscroll = function() {scrollFunction()};

    function scrollFunction() {
      var mybutton = document.getElementById("myBtn");
      if (!mybutton) return;
      if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
      } else {
        mybutton.style.display = "none";
      }
    }

});

// Globale Funktionen (müssen außerhalb von DOMContentLoaded stehen)
function topFunction() {
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function openFlyerModal(element) {
    var modal = document.getElementById("flyerModal");
    var modalImg = document.getElementById("modalImg");
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



// Scroll-Reveal Effekt //
window.addEventListener('scroll', reveal);

window.addEventListener('load', reveal);

function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var revealTop = reveals[i].getBoundingClientRect().top;
        if (revealTop < windowHeight - 150) {
            reveals[i].classList.add("active");
        }
    }
}