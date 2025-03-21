// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB5r_KL2eKVFd66VQU_5pznKrVHa9xzCfc",
    authDomain: "joespick5push.firebaseapp.com",
    projectId: "joespick5push",
    storageBucket: "joespick5push.firebasestorage.app",
    messagingSenderId: "783669343677",
    appId: "1:783669343677:web:d3a43a1a58b920ba9a4ed4",
    measurementId: "G-HNPLN4XZ44"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// REMOVE the onBackgroundMessage handler entirely
// messaging.onBackgroundMessage(function(payload) {
//     console.log('[firebase-messaging-sw.js] Received background message ', payload);
//
//     // ... removed ...
// });

// Handle notification click
self.addEventListener('notificationclick', function(event) {
    console.log('Notification clicked:', event.notification);

    event.notification.close();

    // Always direct to the Pick5 page
    const urlToOpen = 'https://6630180rem.github.io/Pick5/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
            for (let client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            return clients.openWindow(urlToOpen);
        })
    );
});


// Handle token refresh
self.addEventListener('pushsubscriptionchange', event => {
    console.log('Push subscription change detected');

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(clients => {
            if (clients.length > 0) {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'tokenRefresh'
                    });
                });
            }
        })
    );
});

// Service worker activation
self.addEventListener('activate', function(event) {
    console.log('Service worker activated');
    self.clients.claim(); // Take control of clients immediately
});

// Service worker installation
self.addEventListener('install', function(event) {
    console.log('Service worker installed');
    self.skipWaiting();
});
