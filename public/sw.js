const CACHE_NAME = "if-pwa-v3";
const STATIC_CACHE = "if-static-v3";
const OFFLINE_URLS = ["/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  console.log('SW installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log('SW activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
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
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Never cache API calls, auth endpoints, or Supabase requests
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/_next/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname !== self.location.hostname
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // Network-first strategy for all pages (ensures fresh content)
  // This means you'll always get the latest version when online
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful responses
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          
          // Cache static assets (images, fonts, etc.) but not HTML pages
          if (
            request.destination === 'image' ||
            request.destination === 'font' ||
            request.destination === 'style' ||
            request.destination === 'script' ||
            url.pathname.includes('.') // Files with extensions
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache only if network fails (offline)
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // If nothing in cache, return offline page
          if (request.destination === 'document') {
            return caches.match('/');
          }
        });
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