// Vercel Web Analytics und Speed Insights (cookielos). Die Skripte liefert Vercel unter
// /_vercel/… nur auf der echten Domain aus; lokal (npm start, Tests) würden sie 404 geben.
(function () {
    var host = location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') return;
    ['insights', 'speed-insights'].forEach(function (name) {
        var s = document.createElement('script');
        s.defer = true;
        s.src = '/_vercel/' + name + '/script.js';
        document.head.appendChild(s);
    });
})();
