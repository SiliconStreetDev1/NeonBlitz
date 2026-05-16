// @ts-check

const CACHE_NAME = 'neon-blitz-v26';
// The core assets required to boot the engine offline
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './Audio/Tracks/intro.json'
];

// Install Event: Pre-cache the critical shell
self.addEventListener('install', /** @param {any} event */ (event) => {
  // @ts-ignore
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

// Activate Event: Clean up old caches and take control immediately
self.addEventListener('activate', /** @param {any} event */ (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ PWA: Deleting old cache version:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => (/** @type {any} */ (self)).clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate strategy
self.addEventListener('fetch', /** @param {any} event */ (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // FATAL FIX: Never cache 404 errors or failed network responses!
        if (networkResponse.ok) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request.url.split('?')[0], networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => cachedResponse); 
      return cachedResponse || fetchPromise;
    })
  );
});