/* Service Worker für ManuFAKTUR Schenk */
const CACHE_NAME = 'manufaktur-v6';
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
  './404.html',
  './style.min.css?v=6',
  './Home.min.js?v=6',
  './manifest.json',
  './assets/images/logos/logo-transparent.png',
  './assets/images/logos/favicon.png',
  './assets/images/logos/favicon.svg',
  './assets/images/logos/apple-touch-icon.png',
  './assets/images/logos/icon-192.png',
  './assets/images/logos/icon-512.png',
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
  if (event.request.method !== 'GET') return;

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
        .catch(() => caches.match(event.request))
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
      return fetch(event.request);
    })
  );
});
