const CACHE = "bazarmart-v1";
const URLS = ["/", "/products", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(URLS)));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // For SPA navigation, prefer fresh HTML to avoid blank screens on route changes.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("/"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
