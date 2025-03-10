const CACHE_NAME = 'pick5-app-v2'; // Increment version number
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
        return self.skipWaiting(); // Force the waiting service worker to become active
      })
  );
});

// Activate event - clean up old caches aggressively
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete ALL existing caches, not just those not in the whitelist
          console.log('Service Worker: clearing ALL previous caches');
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service Worker activate complete');
      return self.clients.claim(); // Take control of all pages immediately
    })
  );
});

// Fetch event - serve from cache or network with network-first strategy
self.addEventListener('fetch', event => {
  console.log('Service Worker fetching: ' + event.request.url);
  
  // Skip cross-origin requests (like Google Scripts)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If network fetch is successful, update the cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        }
        // Fallback to cache if network fails
        return caches.match(event.request);
      })
      .catch(() => {
        // If both network and cache fail, return a fallback
        return caches.match(event.request);
      })
  );
});


self.addEventListener('push', function (event) {
  console.log('Push event received:', event);

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const title = data.title || "Joe's Pick 5 Update";
  const options = {
    body: data.body || 'New update available!',
    icon: './Pick5Logo.png', // Use your app's icon
    badge: './Pick5Logo.png', // Small icon for notification tray
    vibrate: [200, 100, 200], // Vibration pattern (if supported)
    data: {
      url: data.url || '/', // URL to open when clicked
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener('notificationclick', function (event) {
  console.log('Notification clicked:', event.notification);

  event.notification.close(); // Close the notification

  const urlToOpen = event.notification.data.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
