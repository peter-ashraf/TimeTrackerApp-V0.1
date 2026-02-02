// Service Worker - Offline support and caching
const CACHE_NAME = 'timetracker-v2.1.2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',

  '/css/styles.css',

  '/js/config.js',
  '/js/utils.js',
  '/js/main.js',

  '/js/app/app.core.js',
  '/js/app/app.system.js',
  '/js/app/app.periods.js',
  '/js/app/app.logic.js',
  '/js/app/app.csv.js',
  '/js/app/app.ui.js'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))  // ✅ FIXED: Changed from urlsToCache to ASSETS
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
