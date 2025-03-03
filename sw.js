const CACHE_NAME = 'pick5-app-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './Pick5Logo.png'
];
// Install event - cache the app shell
self.addEventListener('install', event => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker install complete');
        return self.skipWaiting();
      })
  );
});
// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activate complete');
      return self.clients.claim();
    })
  );
});
// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  console.log('Service Worker fetching: ' + event.request.url);

  // Skip cross-origin requests (like Google Scripts)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          console.log('Service Worker: serving from cache');
          return response;
        }

        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it's a one-time use stream
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});
