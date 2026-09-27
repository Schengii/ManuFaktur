// Nur topFunction und reveal werden benötigt, keine Nav/Footer-Injektion.
// Minimaler eigenständiger Sprachwechsel (ohne Home.js), damit die gespeicherte
// Spracheinstellung auch auf dieser Einstiegsseite respektiert wird.
function topFunction() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
window.onscroll = function () {
    const btn = document.querySelector('.back-to-top');
    if (btn) btn.style.display = (document.documentElement.scrollTop > 150) ? 'flex' : 'none';
};
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
