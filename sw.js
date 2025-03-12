// sw.js
const CACHE_NAME = 'pick5-app-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './Pick5Logo.png'
];

// Install event
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

self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) { // Keep only the latest cache
            console.log('Service Worker: clearing old cache', cacheName);
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

// Fetch event
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        }
        return caches.match(event.request);
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Handle Push Events
self.addEventListener('push', event => {
  console.log('Push event received:', event);
  let notificationData;
  
  try {
    notificationData = event.data ? event.data.json() : { title: "Joe's Pick 5", body: "New update available!" };
  } catch (e) {
    console.error('Could not parse push data:', e);
    notificationData = { title: "Joe's Pick 5", body: "New update available!" };
  }
  
  const options = {
    body: notificationData.body,
    icon: './Pick5Logo.png',
    badge: './Pick5Logo.png',
    vibrate: [200, 100, 200],
    data: {
      url: notificationData.url || 'https://6630180rem.github.io/Pick5/' // Default redirect URL
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Handle Notification Click
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  event.notification.close();
  const url = event.notification.data.url;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
