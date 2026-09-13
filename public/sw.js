// Leovra Enterprises Service Worker v1
const CACHE_NAME = 'leovra-v1';
const isProd = self.location.pathname.startsWith('/Leovra');
const PREFIX = isProd ? '/Leovra' : '';

const PRECACHE_URLS = [
  PREFIX + '/',
  PREFIX + '/index.html',
  PREFIX + '/hero-earring.jpg',
  PREFIX + '/hero-tshirt.jpg',
  PREFIX + '/hero-lowers.jpg',
  PREFIX + '/brand-logo.svg',
  PREFIX + '/robots.txt',
  PREFIX + '/sitemap.xml'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip Firebase Realtime Database, Shiprocket and external APIs
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('shiprocket.co') ||
    (url.protocol !== 'http:' && url.protocol !== 'https:')
  ) {
    return;
  }

  // Cache-First strategy for static assets: js, css, images, fonts, webp
  if (
    url.pathname.includes('/assets/') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ico)$/i)
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);
      })
    );
    return;
  }

  // Stale-While-Revalidate / Network-first for HTML navigation
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
