self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("crypto-tracker-cache").then((cache) => {
            return cache.addAll([
                "/",
                "/index.html",
                "/assets/**"
            ]);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
