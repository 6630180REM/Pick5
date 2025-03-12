importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyB5r_KL2eKVFd66VQU_5pznKrVHa9xzCfc",
    authDomain: "joespick5push.firebaseapp.com",
    projectId: "joespick5push",
    storageBucket: "joespick5push.firebasestorage.app",
    messagingSenderId: "783669343677",
    appId: "1:783669343677:web:c1f72d2a2a58b0349a4ed4"
};

const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
