const CACHE_NAME = 'cronlens-shell-v1';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith('cronlens-') && cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok && requestUrl.pathname === '/') {
            await caches.open(CACHE_NAME).then((cache) => cache.put('/', response.clone()));
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match('/');
          if (cachedPage) {
            return cachedPage;
          }
          throw new Error('CronLens is offline and no cached app shell is available.');
        }),
    );
    return;
  }

  if (requestUrl.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(async (cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        const response = await fetch(request);
        if (response.ok) {
          await caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, response.clone()));
        }
        return response;
      }),
    );
  }
});
