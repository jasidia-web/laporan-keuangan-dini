const CACHE_NAME = 'buku-kas-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(e.request).then((cached) =>
        cached || fetch(e.request).then((net) => {
          cache.put(e.request, net.clone());
          return net;
        }).catch(() => cached)
      )
    )
  );
});
