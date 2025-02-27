self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('app-shell-v1').then((cache) => {
            return cache.addAll([
                '/index.html',
                '/favicon.ico',
                'https://forum.thefanpub.com/uploads/db6257/original/2X/0/0f40017efb8e6f7fdaf666fbce8469e7a2bde2bd.png'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('apple-touch-icon')) {
        event.respondWith(
            fetch(event.request.url + '?v=' + new Date().getTime(), { cache: 'reload' })
        );
    }
});
