// const VERSION = "v1.1.0";
// const STATIC_CACHE = `static-${VERSION}`;
// const RUNTIME_CACHE = `runtime-${VERSION}`;

// const APP_SHELL = ["/", "/index.html", "/offline.html"];

// self.addEventListener("install", (event) => {
//   event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(APP_SHELL)));
//   self.skipWaiting();
// });

// self.addEventListener("activate", (event) => {
//   event.waitUntil(
//     (async () => {
//       const keys = await caches.keys();
//       await Promise.all(
//         keys
//           .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
//           .map((k) => caches.delete(k))
//       );
//       await self.clients.claim(); // kendalikan semua tab
//     })()
//   );
// });

// /* ================== FETCH ================== */
// self.addEventListener("fetch", (event) => {
//   const req = event.request;
//   if (req.method !== "GET") return;

//   // Navigasi SPA → Network First (biar HTML paling baru), fallback shell/offline
//   if (req.mode === "navigate") {
//     event.respondWith(handleNavigation(req));
//     return;
//   }

//   const dest = req.destination; // 'script' | 'style' | 'image' | 'font' | ...
//   // Aset build (JS/CSS/font/img) → Stale-While-Revalidate: cepat + update di belakang
//   if (["script", "style", "font", "image", "worker"].includes(dest)) {
//     event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
//     return;
//   }

//   // Permintaan lain (default) → Cache First lalu jaringan
//   event.respondWith(cacheFirst(req, RUNTIME_CACHE));
// });

// async function handleNavigation(request) {
//   try {
//     // HTML terbaru
//     const fresh = await fetch(request);
//     const cache = await caches.open(STATIC_CACHE);
//     cache.put(request, fresh.clone());
//     return fresh;
//   } catch {
//     // fallback ke shell yang sudah di-cache
//     const cache = await caches.open(STATIC_CACHE);
//     return (
//       (await cache.match("/index.html")) ||
//       (await cache.match("/")) ||
//       (await cache.match("/offline.html")) ||
//       new Response("Offline", { status: 503, statusText: "Offline" })
//     );
//   }
// }

// async function staleWhileRevalidate(request, cacheName) {
//   const cache = await caches.open(cacheName);
//   const cached = await cache.match(request);
//   const networkPromise = fetch(request)
//     .then((res) => {
//       cache.put(request, res.clone());
//       return res;
//     })
//     .catch(() => null);
//   return (
//     cached || (await networkPromise) || new Response("Offline", { status: 503 })
//   );
// }

// async function cacheFirst(request, cacheName) {
//   const cache = await caches.open(cacheName);
//   const hit = await cache.match(request);
//   if (hit) return hit;
//   try {
//     const res = await fetch(request);
//     cache.put(request, res.clone());
//     return res;
//   } catch {
//     return new Response("Offline", { status: 503 });
//   }
// }

// /* ============== PUSH NOTIFICATIONS (Basic/Skilled) ============== */
// self.addEventListener("push", (event) => {
//   let data = {};
//   try {
//     if (event.data?.json) data = event.data.json();
//     else if (event.data?.text) {
//       try {
//         data = JSON.parse(event.data.text());
//       } catch {
//         data = { body: event.data.text() };
//       }
//     }
//   } catch {
//     data = {};
//   }

//   const title = data.title || "StoryMap";
//   const body = data.body || "Ada update baru.";
//   const icon = data.icon || "/icons/icon-192.png";
//   const url = data.url || "/#/";

//   const options = {
//     body,
//     icon,
//     badge: icon,
//     data: { url },
//     actions: [{ action: "open", title: "Buka" }],
//     requireInteraction: true,
//   };

//   event.waitUntil(self.registration.showNotification(title, options));
// });

// self.addEventListener("notificationclick", (event) => {
//   const targetUrl = event.notification?.data?.url || "/#/";
//   event.notification.close();

//   event.waitUntil(
//     (async () => {
//       const all = await clients.matchAll({
//         type: "window",
//         includeUncontrolled: true,
//       });
//       const scopeOrigin = new URL(self.registration.scope).origin;
//       const hit = all.find((c) => new URL(c.url).origin === scopeOrigin);

//       if (hit) {
//         await hit.focus();
//         try {
//           await hit.navigate(targetUrl);
//         } catch {
//           await clients.openWindow(targetUrl);
//         }
//       } else {
//         await clients.openWindow(targetUrl);
//       }
//     })()
//   );
// });
//sw js
// const VERSION = "v1.1.0";
// const STATIC_CACHE = `static-${VERSION}`;
// const RUNTIME_CACHE = `runtime-${VERSION}`;

// const APP_SHELL = ["/", "/index.html", "/offline.html"];

// self.addEventListener("install", (event) => {
//   event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(APP_SHELL)));
//   self.skipWaiting();
// });

// self.addEventListener("activate", (event) => {
//   event.waitUntil(
//     (async () => {
//       const keys = await caches.keys();
//       await Promise.all(
//         keys
//           .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
//           .map((k) => caches.delete(k))
//       );
//       await self.clients.claim();
//     })()
//   );
// });

// /* ================== FETCH ================== */
// self.addEventListener("fetch", (event) => {
//   const req = event.request;
//   if (req.method !== "GET") return;

//   if (req.mode === "navigate") {
//     event.respondWith(handleNavigation(req));
//     return;
//   }

//   const dest = req.destination;
//   if (["script", "style", "font", "image", "worker"].includes(dest)) {
//     event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
//     return;
//   }

//   event.respondWith(cacheFirst(req, RUNTIME_CACHE));
// });

// async function handleNavigation(request) {
//   try {
//     const fresh = await fetch(request);
//     const cache = await caches.open(STATIC_CACHE);
//     cache.put(request, fresh.clone());
//     return fresh;
//   } catch {
//     const cache = await caches.open(STATIC_CACHE);
//     return (
//       (await cache.match("/index.html")) ||
//       (await cache.match("/")) ||
//       (await cache.match("/offline.html")) ||
//       new Response("Offline", { status: 503, statusText: "Offline" })
//     );
//   }
// }

// async function staleWhileRevalidate(request, cacheName) {
//   const cache = await caches.open(cacheName);
//   const cached = await cache.match(request);
//   const networkPromise = fetch(request)
//     .then((res) => {
//       cache.put(request, res.clone());
//       return res;
//     })
//     .catch(() => null);
//   return (
//     cached || (await networkPromise) || new Response("Offline", { status: 503 })
//   );
// }

// async function cacheFirst(request, cacheName) {
//   const cache = await caches.open(cacheName);
//   const hit = await cache.match(request);
//   if (hit) return hit;
//   try {
//     const res = await fetch(request);
//     cache.put(request, res.clone());
//     return res;
//   } catch {
//     return new Response("Offline", { status: 503 });
//   }
// }

// /* ============== PUSH NOTIFICATIONS (Basic) ============== */
// self.addEventListener("push", (event) => {
//   let data = {};
//   try {
//     if (event.data?.json) data = event.data.json();
//     else if (event.data?.text) {
//       try {
//         data = JSON.parse(event.data.text());
//       } catch {
//         data = { body: event.data.text() };
//       }
//     }
//   } catch {
//     data = {};
//   }

//   const title = data.title || "StoryMap";
//   const options = {
//     body: data.body || "Ada update baru.",
//     icon: "/icons/icon-192.png",
//     badge: "/icons/icon-192.png",
//     data: { url: data.url || "/#/" },
//     actions: [{ action: "open", title: "Buka" }],
//     requireInteraction: true,
//   };

//   // Ini hanya dipanggil saat event "push".
//   event.waitUntil(self.registration.showNotification(title, options));
// });

// self.addEventListener("notificationclick", (event) => {
//   const targetUrl = event.notification?.data?.url || "/#/";
//   event.notification.close();

//   event.waitUntil(
//     (async () => {
//       const all = await clients.matchAll({
//         type: "window",
//         includeUncontrolled: true,
//       });
//       const scopeOrigin = new URL(self.registration.scope).origin;
//       const hit = all.find((c) => new URL(c.url).origin === scopeOrigin);

//       if (hit) {
//         await hit.focus();
//         try {
//           await hit.navigate(targetUrl);
//         } catch {
//           await clients.openWindow(targetUrl);
//         }
//       } else {
//         await clients.openWindow(targetUrl);
//       }
//     })()
//   );
// });

/* ================== VERSION & CACHES ================== */
const VERSION = "v1.1.0";
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const APP_SHELL = ["/", "/index.html", "/offline.html"];

/* ================== LIFECYCLE ================== */
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

/* ================== FETCH STRATEGIES ================== */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Navigasi SPA → network-first dgn fallback shell/offline
  if (req.mode === "navigate") {
    event.respondWith(handleNavigation(req));
    return;
  }

  const dest = req.destination; // 'script' | 'style' | 'image' | 'font' | 'worker' | ...
  // Aset statis bundling → stale-while-revalidate
  if (["script", "style", "font", "image", "worker"].includes(dest)) {
    event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
    return;
  }

  // Permintaan lain → cache-first
  event.respondWith(cacheFirst(req, RUNTIME_CACHE));
});

async function handleNavigation(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cache = await caches.open(STATIC_CACHE);
    return (
      (await cache.match("/index.html")) ||
      (await cache.match("/")) ||
      (await cache.match("/offline.html")) ||
      new Response("Offline", { status: 503, statusText: "Offline" })
    );
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((res) => {
      cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  return (
    cached || (await networkPromise) || new Response("Offline", { status: 503 })
  );
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const res = await fetch(request);
    cache.put(request, res.clone());
    return res;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

/* ================== PUSH NOTIFICATIONS ================== */
// Basic handler: tampilkan notif saat event push
self.addEventListener("push", (event) => {
  let data = {};
  try {
    if (event.data?.json) data = event.data.json();
    else if (event.data?.text) {
      try {
        data = JSON.parse(event.data.text());
      } catch {
        data = { body: event.data.text() };
      }
    }
  } catch {
    data = {};
  }

  const title = data.title || "StoryMap";
  const options = {
    body: data.body || "Ada update baru.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url || "/#/" },
    actions: [{ action: "open", title: "Buka" }],
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Klik notifikasi → fokus/tab baru ke URL yang dituju
self.addEventListener("notificationclick", (event) => {
  const targetUrl = event.notification?.data?.url || "/#/";
  event.notification.close();

  event.waitUntil(
    (async () => {
      const all = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const scopeOrigin = new URL(self.registration.scope).origin;
      const hit = all.find((c) => new URL(c.url).origin === scopeOrigin);

      if (hit) {
        await hit.focus();
        try {
          await hit.navigate(targetUrl);
        } catch {
          await clients.openWindow(targetUrl);
        }
      } else {
        await clients.openWindow(targetUrl);
      }
    })()
  );
});

/* ===== Debug helper: trigger notif via postMessage dari halaman ===== */
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "test-notif") {
    const title = e.data.title || "Tes Notifikasi";
    const options = {
      body: e.data.body || "Dipicu via postMessage",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: e.data.url || "/#/" },
    };
    e.waitUntil(self.registration.showNotification(title, options));
  }
});
