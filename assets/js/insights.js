// Vercel Web Analytics und Speed Insights (cookielos). Die Skripte liefert Vercel unter
// /_vercel/… nur auf der echten Domain aus; lokal (npm start, Tests) würden sie 404 geben
// und Vorschau-Deployments würden die Statistik verfälschen.
(function () {
    // Nur auf der echten Domain messen; Preview-Deployments (*.vercel.app) und lokale Läufe nicht.
    var host = location.hostname;
    if (host !== 'manufaktur-malerei.de' && host !== 'www.manufaktur-malerei.de') return;
    ['insights', 'speed-insights'].forEach(function (name) {
        var s = document.createElement('script');
        s.defer = true;
        s.src = '/_vercel/' + name + '/script.js';
        document.head.appendChild(s);
    });
})();
