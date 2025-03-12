navigator.serviceWorker.register('/firebase-messaging-sw.js')
  .then((registration) => {
    console.log('Firebase messaging service worker registered:', registration);
  }).catch((error) => {
    console.error('Firebase messaging service worker registration failed:', error);
  });
