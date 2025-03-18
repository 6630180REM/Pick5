importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB5r_KL2eKVFd66VQU_5pznKrVHa9xzCfc",
    authDomain: "joespick5push.firebaseapp.com",
    projectId: "joespick5push",
    storageBucket: "joespick5push.firebasestorage.app",
    messagingSenderId: "783669343677",
    appId: "1:783669343677:web:595231becb8496e59a4ed4",
    measurementId: "G-39P58EZH82"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
    console.log('Received background message:', payload);

    // Check if the payload has data
    if (payload.data) {
        const notificationTitle = payload.data.title || 'Joe\'s Pick 5';
        const notificationOptions = {
            body: payload.data.body || 'New update available!',
            icon: '/Pick5Logo.png',
            badge: '/Pick5Logo.png',
            tag: 'joe-pick5-notification',
            renotify: true,
            data: {
                url: payload.data.url || 'https://6630180rem.github.io/Pick5/',
                source: 'joespick5'
            }
        };

        // return self.registration.showNotification(notificationTitle, notificationOptions);
    } else {
        console.log("payload did not contain data object");
    }

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
});

// Service worker installation
self.addEventListener('install', function(event) {
    console.log('Service worker installed');
    self.skipWaiting();
});
