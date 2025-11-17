const CACHE_NAME = "if-pwa-v2";
const OFFLINE_URLS = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  // Skip service worker for authenticated routes to allow proper redirects
  const url = new URL(request.url);
  const protectedRoutes = ['/exercise', '/profile', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // For protected routes, use network-first strategy with redirect: 'follow'
    event.respondWith(
      fetch(request, { redirect: 'follow' })
        .catch(() => caches.match("/"))
    );
    return;
  }

  // For other routes, use cache-first strategy
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match("/"));
    })
  );
});

// Push notifications (payload from server)
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "IF Reminder", body: "Time to check your fasting tracker!" };
  }

  const title = data.title || "IF Reminder";
  const options = {
    body: data.body || "Time to drink water or log your fasting.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: data.url || "/"
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientsArr) => {
      const hadWindow = clientsArr.some((client) => {
        if (client.url === url && "focus" in client) {
          client.focus();
          return true;
        }
        return false;
      });
      if (!hadWindow && clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Background sync stub (if supported and registered as 'sync-logs')
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-logs") {
    event.waitUntil(
      (async () => {
        // In real app, read from IndexedDB and POST to /api/sync
        console.log("Background sync triggered (sync-logs)");
      })()
    );
  }
});