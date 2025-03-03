const CACHE_NAME = 'pick5-app-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './Pick5Logo.png'
];

// Force the new service worker to become active right away
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

// Clear old caches and take control immediately
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activate complete');
      return self.clients.claim(); // Take control of all clients
    })
  );
});

// Enhanced fetch event handling
self.addEventListener('fetch', event => {
  // Skip cross-origin requests (like Google Scripts)
  // We don't cache them but we still want to fetch them
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          console.log('Service Worker: serving from cache', event.request.url);
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
              console.log('Service Worker: caching new resource', event.request.url);
              cache.put(event.request, responseToCache);
            });
            
          return response;
        })
        .catch(error => {
          console.log('Service Worker: fetch failed', error);
          // Optionally return a fallback response for offline experience
        });
      })
  );
});

// Handle push notifications if you add them later
self.addEventListener('push', event => {
  console.log('Push message received', event);
  // You can implement notification handling here
});
