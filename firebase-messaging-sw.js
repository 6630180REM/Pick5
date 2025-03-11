// This service worker file is needed for Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAlFST5pkmHLNcDJfx73-bPGieWVrm_nVs",
  authDomain: "pick5-push-notifications.firebaseapp.com",
  projectId: "pick5-push-notifications",
  storageBucket: "pick5-push-notifications.firebasestorage.app",
  messagingSenderId: "622059115299",
  appId: "1:622059115299:web:4ec6d0410ee275bcfd7296",
  measurementId: "G-C9TD0KP24Z"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/Pick5Logo.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Optional: Add custom notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click detected.');
  
  event.notification.close();
  
  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: "window"
    })
    .then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client)
          return client.focus();
      }
      if (clients.openWindow)
        return clients.openWindow('/');
    })
  );
});
