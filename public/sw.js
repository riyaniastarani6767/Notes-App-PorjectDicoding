// /* -------------------- PUSH NOTIFICATIONS (versi debug) -------------------- */
// self.addEventListener("push", (event) => {
//   // Ambil payload dengan aman (json() → text() → default)
//   let data = {};
//   try {
//     if (event.data?.json) {
//       data = event.data.json();
//     } else if (event.data?.text) {
//       try {
//         data = JSON.parse(event.data.text());
//       } catch {
//         data = { body: event.data.text() };
//       }
//     }
//   } catch (e) {
//     // tetap kosong kalau gagal parse
//     data = {};
//   }

//   // Nilai default jika payload kosong
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
//     requireInteraction: true, // biar nempel
//     silent: false,
//   };

//   // Log biar kelihatan di console SW (Application → Service Workers → Inspect)
//   event.waitUntil(
//     (async () => {
//       try {
//         console.log("[SW] push received:", data);
//         await self.registration.showNotification(title, options);
//         console.log("[SW] showNotification OK");
//       } catch (err) {
//         console.error("[SW] showNotification ERROR:", err);
//         // Fallback: kirim pesan ke semua tab (opsional)
//         const clis = await clients.matchAll({
//           type: "window",
//           includeUncontrolled: true,
//         });
//         for (const c of clis)
//           c.postMessage({ type: "PUSH_FALLBACK", title, body });
//       }
//     })()
//   );
// });

// /* Klik notifikasi → fokus/buka app + arahkan ke url payload */
// self.addEventListener("notificationclick", (event) => {
//   const url = event.notification?.data?.url || "/#/";
//   event.notification.close();

//   event.waitUntil(
//     (async () => {
//       try {
//         const list = await clients.matchAll({
//           type: "window",
//           includeUncontrolled: true,
//         });
//         // cari tab yang satu origin/scope, kalau ada → fokus & navigate
//         const sameOrigin = list.find((w) =>
//           w.url.startsWith(self.registration.scope)
//         );
//         if (sameOrigin) {
//           await sameOrigin.focus();
//           try {
//             await sameOrigin.navigate(url);
//           } catch {}
//           return;
//         }
//         // kalau tidak ada → buka tab baru
//         await clients.openWindow(url);
//       } catch (e) {
//         console.error("[SW] notificationclick ERROR:", e);
//         try {
//           await clients.openWindow(url);
//         } catch {}
//       }
//     })()
//   );
// });

/* global self, clients */

// ================== VERSION & CACHE ==================
const VERSION = "v1.0.2";
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

// App shell (DEV): pastikan file inti ada biar nggak dinosaurus
const APP_SHELL = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/main.js",
  "/src/styles/main.css",
];

// ================== INSTALL / ACTIVATE ==================
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(APP_SHELL)));
  self.skipWaiting(); // ambil alih lebih cepat
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
    })()
  );
  self.clients.claim(); // kontrol semua tab
});

// ================== FETCH HANDLERS ==================
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  if (req.mode === "navigate") {
    // Navigasi SPA: network-first → cache → offline.html
    event.respondWith(handleNavigation(req));
    return;
  }

  const url = new URL(req.url);
  const isAPI =
    /\/stories/i.test(url.pathname) || url.pathname.includes("/v1/stories");

  if (isAPI) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Static assets: cache-first
  event.respondWith(cacheFirst(req));
});

async function handleNavigation(request) {
  try {
    const fresh = await fetch(request);
    return fresh;
  } catch {
    const staticCache = await caches.open(STATIC_CACHE);
    const shell =
      (await staticCache.match("/index.html")) ||
      (await staticCache.match("/"));
    if (shell) return shell;

    const offline = await staticCache.match("/offline.html");
    return (
      offline || new Response("Offline", { status: 503, statusText: "Offline" })
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((res) => {
      cache.put(request, res.clone());
      return res;
    })
    .catch(() => undefined);

  return (
    cached || (await networkPromise) || new Response("Offline", { status: 503 })
  );
}

async function cacheFirst(request) {
  const hit = await caches.match(request);
  if (hit) return hit;

  try {
    const res = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, res.clone());
    return res;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

// ================== PUSH NOTIFICATIONS (DEBUG ROBUST) ==================
self.addEventListener("push", (event) => {
  let data = {};
  try {
    if (event.data?.json) {
      data = event.data.json();
    } else if (event.data?.text) {
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
  const body = data.body || "Ada update baru.";
  const icon = data.icon || "/icons/icon-192.png";
  const url = data.url || "/#/";

  const options = {
    body,
    icon,
    badge: icon,
    data: { url },
    actions: [{ action: "open", title: "Buka" }],
    requireInteraction: true,
    silent: false,
  };

  event.waitUntil(
    (async () => {
      try {
        console.log("[SW] push received:", data);
        await self.registration.showNotification(title, options);
        console.log("[SW] showNotification OK");
      } catch (err) {
        console.error("[SW] showNotification ERROR:", err);
        // fallback: kirim pesan ke semua tab (opsional)
        const clis = await clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });
        for (const c of clis)
          c.postMessage({ type: "PUSH_FALLBACK", title, body });
      }
    })()
  );
});

// ================== CLICK NOTIFICATION ==================
self.addEventListener("notificationclick", (event) => {
  const targetUrl = event.notification?.data?.url || "/#/";
  event.notification.close();

  event.waitUntil(
    (async () => {
      try {
        const all = await clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });
        // cocokan berdasarkan origin scope SW
        const scopeOrigin = new URL(self.registration.scope).origin;
        const hit = all.find((c) => new URL(c.url).origin === scopeOrigin);

        if (hit) {
          await hit.focus();
          // navigate kadang tidak tersedia/ditolak; coba, kalau gagal buka window baru
          try {
            await hit.navigate(targetUrl);
          } catch {
            await clients.openWindow(targetUrl);
          }
        } else {
          await clients.openWindow(targetUrl);
        }
      } catch (e) {
        console.error("[SW] notificationclick ERROR:", e);
        try {
          await clients.openWindow(targetUrl);
        } catch {}
      }
    })()
  );
});
