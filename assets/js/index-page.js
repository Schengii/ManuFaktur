// Nur topFunction und reveal werden benötigt, keine Nav/Footer-Injektion.
// Minimaler eigenständiger Sprachwechsel (ohne Home.js), damit die gespeicherte
// Spracheinstellung auch auf dieser Einstiegsseite respektiert wird.
function topFunction() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
}
window.addEventListener('scroll', function () {
    const btn = document.querySelector('.back-to-top');
    if (btn) btn.style.display = (document.documentElement.scrollTop > 150) ? 'flex' : 'none';
}, { passive: true });
document.addEventListener('click', function (e) {
    if (e.target.closest('.back-to-top')) topFunction();
});
(function () {
    try {
        var lang = localStorage.getItem('manufaktur_lang') || 'de';
        if (lang === 'en') {
            document.querySelectorAll('[data-i18n-en]').forEach(function (el) {
                var icon = el.querySelector('i');
                el.innerHTML = el.getAttribute('data-i18n-en') + (icon ? ' ' + icon.outerHTML : '');
            });
        }
    } catch (e) {}
})();
