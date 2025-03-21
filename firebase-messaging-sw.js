// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

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

// Handle background messages (ONLY data messages)
messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Default values (only used if data is missing)
    let notificationTitle = 'Joe\'s Pick 5';
    let notificationOptions = {
        body: 'New update available!',
        icon: '/Pick5Logo.png',
        badge: '/Pick5Logo.png',
        tag: 'joe-pick5-notification',
        renotify: true,
        data: {
            url: 'https://6630180rem.github.io/Pick5/',
            source: 'joespick5'
        }
    };

    // Handle notification in payload.data format ONLY
    if (payload.data) {
        // Override default values with data from payload
        notificationTitle = payload.data.title || notificationTitle;
        notificationOptions.body = payload.data.body || notificationOptions.body;
        if (payload.data.url) {
            notificationOptions.data.url = payload.data.url;
        }
    }

    // Only show notification if payload.data exists. This is critical.
    if (payload.data) {
        return self.registration.showNotification(notificationTitle, notificationOptions);
    }
    return null; // Do not show notification if payload.data is missing.
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
    console.log('Notification clicked:', event);

    event.notification.close();

    // Extract URL from the notification data
    const urlToOpen = event.notification.data && event.notification.data.url
        ? event.notification.data.url
        : 'https://6630180rem.github.io/Pick5/';

    // This looks to see if the current is already open and focuses it
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        })
        .then(function(clientList) {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }

            // If no open window matches, open a new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
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
