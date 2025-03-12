// Import the latest Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js');

// Firebase configuration (use your Firebase config here)
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

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message: ', payload);
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background message body.',
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
