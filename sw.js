const CACHE_NAME = 'app-shell-v3'; // Change version to force update

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/index.html',
                '/manifest.json?v=2',
                '/phone-icon.png?v=' + new Date().getTime()
            ]);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
});

// Intercept fetch requests to ensure latest icons
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('phone-icon.png') || event.request.url.includes('apple-touch-icon')) {
        event.respondWith(
            fetch(event.request.url + '?v=' + new Date().getTime(), { cache: 'reload' })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});
