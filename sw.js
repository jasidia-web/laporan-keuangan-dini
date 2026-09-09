const CACHE_NAME = 'buku-kas-v4';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

/* Halaman utama (navigasi/HTML) pakai strategi "network-first": selalu coba
   ambil versi terbaru dari server dulu, dan hanya jatuh ke cache kalau benar-
   benar offline. Ini mencegah aplikasi "terjebak" memakai index.html versi
   lama setelah ada update, seperti yang terjadi sebelumnya. Aset lain (ikon,
   manifest) tetap pakai cache-first seperti biasa karena jarang berubah. */
self.addEventListener('fetch', (e) => {
  const isHTML =
    e.request.mode === 'navigate' ||
    (e.request.method === 'GET' && e.request.headers.get('accept')?.includes('text/html'));

  if (isHTML) {
    e.respondWith(
      fetch(e.request)
        .then((net) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, net.clone()));
          return net;
        })
        .catch(() => caches.open(CACHE_NAME).then((cache) => cache.match(e.request)))
    );
    return;
  }

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
