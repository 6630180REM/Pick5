@@ -1,10 +1,11 @@
 const CACHE_NAME = 'pick5-app-v1';
 const CACHE_NAME = 'pick5-app-v2'; // Increment version number
 const urlsToCache = [
   './',
   './index.html',
   './manifest.json',
   './Pick5Logo.png'
 ];
 
 // Install event - cache the app shell
 self.addEventListener('install', event => {
   console.log('Service Worker installing');
 @@ -16,67 +17,58 @@ self.addEventListener('install', event => {
       })
       .then(() => {
         console.log('Service Worker install complete');
         return self.skipWaiting();
         return self.skipWaiting(); // Force the waiting service worker to become active
       })
   );
 });
 // Activate event - clean up old caches
 
 // Activate event - clean up old caches aggressively
 self.addEventListener('activate', event => {
   console.log('Service Worker activating');
   const cacheWhitelist = [CACHE_NAME];
   event.waitUntil(
     caches.keys().then(cacheNames => {
       return Promise.all(
         cacheNames.map(cacheName => {
           if (cacheWhitelist.indexOf(cacheName) === -1) {
             console.log('Service Worker: clearing old cache');
             return caches.delete(cacheName);
           }
           // Delete ALL existing caches, not just those not in the whitelist
           console.log('Service Worker: clearing ALL previous caches');
           return caches.delete(cacheName);
         })
       );
     }).then(() => {
       console.log('Service Worker activate complete');
       return self.clients.claim();
       return self.clients.claim(); // Take control of all pages immediately
     })
   );
 });
 // Fetch event - serve from cache or network
 
 // Fetch event - serve from cache or network with network-first strategy
 self.addEventListener('fetch', event => {
   console.log('Service Worker fetching: ' + event.request.url);
 
   
   // Skip cross-origin requests (like Google Scripts)
   if (!event.request.url.startsWith(self.location.origin)) {
     return;
   }
 
   
   event.respondWith(
     caches.match(event.request)
     fetch(event.request)
       .then(response => {
         // Cache hit - return response
         if (response) {
           console.log('Service Worker: serving from cache');
           return response;
         }
 
         // Clone the request because it's a one-time use stream
         const fetchRequest = event.request.clone();
 
         return fetch(fetchRequest).then(response => {
           // Check if we received a valid response
           if (!response || response.status !== 200 || response.type !== 'basic') {
             return response;
           }
 
           // Clone the response because it's a one-time use stream
         // If network fetch is successful, update the cache
         if (response && response.status === 200) {
           const responseToCache = response.clone();
 
           caches.open(CACHE_NAME)
             .then(cache => {
               cache.put(event.request, responseToCache);
             });
 
           return response;
         });
         }
         // Fallback to cache if network fails
         return caches.match(event.request);
       })
       .catch(() => {
         // If both network and cache fail, return a fallback
         return caches.match(event.request);
       })
   );
 });
