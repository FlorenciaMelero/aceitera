const CACHE = 'mp-lubricentro-v1';
const PRECACHE = ['/icons/icon-192.svg', '/icons/icon-512.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // API portal: siempre red (datos frescos)
  if (url.pathname.startsWith('/api/portal/') && !url.pathname.endsWith('/qr')) {
    event.respondWith(fetch(request));
    return;
  }

  // Assets estáticos: cache first
  if (url.pathname.startsWith('/icons/') || url.pathname === '/sw.js') {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }
});
