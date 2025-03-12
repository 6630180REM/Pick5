// sw.js
const CACHE_NAME = 'pick5-app-v2';
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
          if (cacheName !== CACHE_NAME) { // ✅ Keep only the latest cache
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
  const data = event.data ? event.data.json() : { title: "Joe's Pick 5", body: "New update available!" };
  const options = {
    body: data.body,
    icon: './Pick5Logo.png',
    badge: './Pick5Logo.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/' // Default redirect URL
    }
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle Notification Click
self.addEventListener('notificationclick', event => {
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

const firebaseConfig = {
  apiKey: "AIzaSyB5r_KL2eKVFd66VQU_5pznKrVHa9xzCfc",
  authDomain: "joespick5push.firebaseapp.com",
  projectId: "joespick5push",
  storageBucket: "joespick5push.firebasestorage.app",
  messagingSenderId: "783669343677",
  appId: "1:783669343677:web:c1f72d2a2a58b0349a4ed4"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

async function getToken() {
  try {
    const currentToken = await messaging.getToken({
      vapidKey: 'YOUR_PUBLIC_VAPID_KEY'
    });
    console.log('FCM Token:', currentToken); // ✅ Add this to confirm token generation

    if (currentToken) {
      // ✅ Send token to backend
      const response = await fetch('https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec', {
        method: 'POST',
        body: JSON.stringify({ token: currentToken }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.text();
      console.log('Token registration response:', result); // ✅ Add logging
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
  } catch (err) {
    console.error('Error getting token', err);
  }
}


// Request permission and get token
Notification.requestPermission().then((permission) => {
  if (permission === 'granted') {
    getToken();
  }
});
