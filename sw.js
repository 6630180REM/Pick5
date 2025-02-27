const CACHE_NAME = 'app-shell-v2'; // Change version to force cache update

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/index.html',
                '/favicon.ico',
                'https://forum.thefanpub.com/uploads/db6257/original/2X/0/0f40017efb8e6f7fdaf666fbce8469e7a2bde2bd.png?v=' + new Date().getTime()
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

// Intercept fetch requests and cache-bust apple-touch-icon
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('apple-touch-icon') || event.request.url.includes('favicon')) {
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
