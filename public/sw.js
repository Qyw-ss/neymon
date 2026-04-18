const CACHE_NAME = 'neymon-v2';
const ASSETS_CACHE = 'neymon-assets-v2';

// Install: hanya cache file statis yang tidak berubah
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/icon.svg', '/manifest.json']);
    })
  );
});

// Activate: hapus semua cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== ASSETS_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy:
// - HTML (index.html): selalu dari Network agar selalu dapat versi terbaru
// - JS/CSS assets (/assets/*): Cache first karena sudah pakai content hash
// - Lainnya: Network first, fallback ke cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests dan browser extensions
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Firebase & Google requests: selalu dari network
  if (url.hostname.includes('firebase') || url.hostname.includes('google')) {
    return;
  }

  // HTML: Network first (jangan di-cache agar selalu dapat versi terbaru)
  if (event.request.destination === 'document' || url.pathname === '/') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }

  // Assets (JS/CSS dengan hash): Cache first karena aman
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(ASSETS_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      })
    );
    return;
  }

  // Default: network first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
