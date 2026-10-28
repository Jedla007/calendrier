// Service Worker — Alimanaka PWA
// Permet le fonctionnement hors-ligne (offline)

var CACHE_NAME = 'alimanaka-v10';
var ASSETS = [
  './index.html',
  './manifest.json',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Installation : mise en cache de tous les fichiers
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key)   { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch : répondre depuis le cache (offline first)
self.addEventListener('fetch', function(event) {
  // Tuiles de carte (Lieux sacrés) : réseau seul, jamais mises en cache
  if (event.request.url.indexOf('arcgisonline.com') !== -1) return;
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        // Mettre en cache les nouvelles ressources
        var resp = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, resp);
        });
        return response;
      }).catch(function() {
        // Hors-ligne et pas en cache : retourner index.html
        return caches.match('./index.html');
      });
    })
  );
});
