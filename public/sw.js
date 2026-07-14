const CACHE_NAME = 'ecocollect-v2';
const MAP_CACHE_NAME = 'ecocollect-maps-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
];

// Install Event - cache core static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use catch to prevent total failure if an asset 404s
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(asset => 
          cache.add(asset).catch(err => console.warn('[SW] Failed to cache', asset, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== MAP_CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate & Map Caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // COMPLETELY bypass Service Worker during local development to prevent Next.js HMR freezing
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }

  // Bypass non-GET requests, Supabase API, and Next.js HMR/Dev tools
  if (
    request.method !== 'GET' || 
    url.origin.includes('supabase.co') ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.includes('/__nextjs')
  ) {
    return;
  }

  // Bypass Mapbox API requests (Mapbox handles its own IndexedDB WebGL caching natively)
  // Intercepting Mapbox through the Service Worker causes severe latency and UI freezing.
  if (url.hostname.includes('api.mapbox.com') || url.hostname.includes('events.mapbox.com')) {
    return;
  }

  // Standard Static Assets (Stale-While-Revalidate)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        if (request.mode === 'navigate') {
          return caches.match('/offline');
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});
