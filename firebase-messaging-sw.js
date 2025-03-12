importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5r_KL2eKVFd66VQU_5pznKrVHa9xzCfc",
  authDomain: "joespick5push.firebaseapp.com",
  projectId: "joespick5push",
  storageBucket: "joespick5push.firebasestorage.app",
  messagingSenderId: "783669343677",
  appId: "1:783669343677:web:c1f72d2a2a58b0349a4ed4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message:', payload);
  
  // Customize notification based on payload
  const notificationTitle = payload.notification?.title || "Joe's Pick 5";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: '/Pick5Logo.png',
    badge: '/Pick5Logo.png'
  };
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle token refresh
self.addEventListener('pushsubscriptionchange', event => {
  console.log('Push subscription change detected');
  event.waitUntil(
    clients.matchAll().then(clients => {
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

// Add message handler to communicate with the page
self.addEventListener('message', event => {
  console.log('Service worker received message:', event.data);
  // You can add additional message handling here if needed
});
