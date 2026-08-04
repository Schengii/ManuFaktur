/* Service Worker für ManuFAKTUR Schenk */
const CACHE_NAME = 'manufaktur-v1';
const ASSETS_TO_CACHE = [
  './',
  './Home.html',
  './Bildergalerie.html',
  './Auftrag.html',
  './Leistungen.html',
  './UeberMich.html',
  './Kontakt.html',
  './Impressum.html',
  './Datenschutz.html',
  './style.css',
  './Home.js',
  './manifest.json',
  './assets/images/logos/logo-transparent.png',
  './assets/images/logos/favicon.png',
  './assets/images/logos/favicon.svg',
  './assets/vendor/font-awesome/css/all.min.css'
];

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
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Nur GET-Anfragen cachen
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Im Hintergrund aktualisieren (Stale-while-revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {/* offline fallback silence */});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
