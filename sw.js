/* Service Worker für ManuFAKTUR Schenk */
// CACHE_NAME und die ?v=N-Parameter werden von `npm run release` hochgezählt
// (scripts/bump-version.js) – nicht von Hand ändern. Die Precache-Liste erzeugt
// scripts/gen-sw-assets.js beim Build.
const CACHE_NAME = 'manufaktur-v30';
const RUNTIME_CACHE = 'manufaktur-runtime';
const RUNTIME_MAX_ENTRIES = 80;
// <generated:assets> (scripts/gen-sw-assets.js – nicht von Hand ändern)
const ASSETS_TO_CACHE = [
  './',
  './404.html',
  './Auftrag.html',
  './Bildergalerie.html',
  './Datenschutz.html',
  './Home.html',
  './Impressum.html',
  './Kontakt.html',
  './Leistungen.html',
  './UeberMich.html',
  './Home.min.js?v=24',
  './assets/js/artworks-data.js?v=24',
  './assets/js/auftrag.js?v=24',
  './assets/js/i18n.min.js?v=24',
  './assets/js/index-page.js?v=24',
  './assets/js/insights.js?v=24',
  './assets/js/theme-init.js?v=24',
  './assets/vendor/font-awesome/css/icons.min.css?v=24',
  './style.min.css?v=24',
  './manifest.json',
  './assets/images/logos/apple-touch-icon.png',
  './assets/images/logos/favicon.png',
  './assets/images/logos/favicon.svg',
  './assets/images/logos/icon-192.png',
  './assets/images/logos/icon-512.png',
  './assets/images/logos/logo-transparent.png',
  './assets/images/logos/logo.png',
  './assets/fonts/dancingscript-700-normal.woff2',
  './assets/fonts/lato-300-normal.woff2',
  './assets/fonts/lato-400-normal.woff2',
  './assets/fonts/lato-700-normal.woff2',
  './assets/fonts/playfairdisplay-700-normal.woff2',
  './assets/vendor/font-awesome/webfonts/fa-brands-400-subset.woff2?h=e348b57609',
  './assets/vendor/font-awesome/webfonts/fa-regular-400-subset.woff2?h=70f52b82e6',
  './assets/vendor/font-awesome/webfonts/fa-solid-900-subset.woff2?h=c820cd70bb'
];
// </generated:assets>

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== RUNTIME_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Hält den Laufzeit-Cache klein: älteste Einträge zuerst verwerfen.
function trimRuntimeCache() {
  return caches.open(RUNTIME_CACHE).then((cache) => {
    return cache.keys().then((keys) => {
      const surplus = keys.length - RUNTIME_MAX_ENTRIES;
      if (surplus <= 0) return;
      return Promise.all(keys.slice(0, surplus).map((key) => cache.delete(key)));
    });
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isHtml = event.request.mode === 'navigate' ||
                 (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'));

  if (isHtml) {
    // Für HTML-Seiten: Network First, Fallback auf Cache (offline)
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // ignoreSearch: Kontakt.html?motiv=… soll offline die gecachte Kontakt.html treffen
          return caches.match(event.request, { ignoreSearch: true }).then((cached) => {
            return cached || caches.match('./Home.html');
          });
        })
    );
    return;
  }

  // Für statische Assets: Cache First / Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Bereits angesehene Bilder auch offline zeigen
        if (networkResponse && networkResponse.status === 200 && event.request.destination === 'image') {
          const copy = networkResponse.clone();
          event.waitUntil(
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, copy)).then(trimRuntimeCache)
          );
        }
        return networkResponse;
      });
    })
  );
});
