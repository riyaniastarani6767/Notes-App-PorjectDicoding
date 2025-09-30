// /* ================== VERSION & CACHES ================== */
// const VERSION = "v1.1.0";
// const STATIC_CACHE = `static-${VERSION}`;
// const RUNTIME_CACHE = `runtime-${VERSION}`;

// const APP_SHELL = ["/", "/index.html", "/offline.html"];

// /* ================== LIFECYCLE ================== */
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

// /* ================== FETCH STRATEGIES ================== */
// self.addEventListener("fetch", (event) => {
//   const req = event.request;
//   if (req.method !== "GET") return;

//   // Navigasi SPA → network-first dgn fallback shell/offline
//   if (req.mode === "navigate") {
//     event.respondWith(handleNavigation(req));
//     return;
//   }

//   const dest = req.destination; // 'script' | 'style' | 'image' | 'font' | 'worker' | ...
//   // Aset statis bundling → stale-while-revalidate
//   if (["script", "style", "font", "image", "worker"].includes(dest)) {
//     event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
//     return;
//   }

//   // Permintaan lain → cache-first
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

// /* ================== PUSH NOTIFICATIONS ================== */

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

// self.addEventListener("message", (e) => {
//   if (e.data && e.data.type === "test-notif") {
//     const title = e.data.title || "Tes Notifikasi";
//     const options = {
//       body: e.data.body || "Dipicu via postMessage",
//       icon: "/icons/icon-192.png",
//       badge: "/icons/icon-192.png",
//       data: { url: e.data.url || "/#/" },
//     };
//     e.waitUntil(self.registration.showNotification(title, options));
//   }
// });
/* ================== VERSION & CACHES ================== */
const VERSION = "v1.1.2"; // bump supaya SW pasti update
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

  // 1) hanya proses GET
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // 2) hanya http/https → hindari chrome-extension://, data:, dll
  if (!url.protocol.startsWith("http")) return;

  // 3) Navigasi SPA → network-first + fallback shell/offline
  if (req.mode === "navigate") {
    event.respondWith(handleNavigation(req));
    return;
  }

  // 4) DATA DINAMIS: semua path yang mengandung "/stories" → NETWORK-FIRST
  //    Mencakup: /stories, /stories?..., /stories/123, serta /v1/stories (cross-origin)
  const isStories = /\/stories(\b|\/|\?)/.test(url.pathname);
  if (isStories) {
    event.respondWith(networkFirst(req, RUNTIME_CACHE));
    return;
  }

  // 5) Aset statis (bundling) → stale-while-revalidate
  const dest = req.destination; // 'script' | 'style' | 'image' | 'font' | 'worker' | ...
  if (["script", "style", "font", "image", "worker"].includes(dest)) {
    event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
    return;
  }

  // 6) Lainnya → cache-first (aman untuk resource jarang berubah)
  event.respondWith(cacheFirst(req, RUNTIME_CACHE));
});

/* ---- strategies helpers ---- */
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

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const net = await fetch(request); // ambil dari network dahulu (supaya segar)
    cache.put(request, net.clone()); // simpan utk offline fallback
    return net;
  } catch {
    const cached = await cache.match(request);
    return (
      cached ||
      new Response(JSON.stringify({ list: [] }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      })
    );
  }
}

/* ================== PUSH NOTIFICATIONS ================== */
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
