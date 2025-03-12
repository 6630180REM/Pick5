// sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const CACHE_NAME = 'pick5-app-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './Pick5Logo.png'
];

// Firebase config
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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => cachedResponse || fetch(event.request))
  );
});

// Handle background messages
messaging.onBackgroundMessage(payload => {
  console.log('Received background message:', payload);
  const notificationTitle = payload.notification?.title || "Joe's Pick 5";
  const notificationOptions = {
    body: payload.notification?.body || "New update available!",
    icon: './Pick5Logo.png',
    badge: './Pick5Logo.png',
    vibrate: [200, 100, 200],
    data: {
      url: payload.data?.url || 'https://6630180rem.github.io/Pick5/'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  event.notification.close();
  const url = event.notification.data.url || 'https://6630180rem.github.io/Pick5/'; // Fallback URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url); // Fixed the typo
        }
      })
      .catch(error => {
        console.error('Error handling notification click:', error);
      })
  );
});
