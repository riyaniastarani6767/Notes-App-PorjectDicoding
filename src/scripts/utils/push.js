// // scripts/utils/push.js

// // (Sebaiknya inject dari env di index.html / Vite, tapi untuk sekarang tetap pakai konstanta ini)
// const VAPID_PUBLIC_KEY =
//   "BMDksHjbS7hoqJkQmdkucSZWEkUe_ZclLfO1OJSST65lsdrN0YWruY00tf2DYh6PZbKcNvxe-jRy1Bfs_zBqE1Q";

// // Pakai path yang diminta reviewer (di-redirect ke Netlify Functions oleh netlify.toml)
// const SUBSCRIBE_URL = "/notifications/subscribe";
// const SEND_TEST_URL = "/notifications/send";

// function urlBase64ToUint8Array(base64String) {
//   const pad = "=".repeat((4 - (base64String.length % 4)) % 4);
//   const base64 = (base64String + pad).replace(/-/g, "+").replace(/_/g, "/");
//   const raw = atob(base64);
//   const out = new Uint8Array(raw.length);
//   for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
//   return out;
// }

// export async function enablePush() {
//   if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
//     throw new Error("Browser tidak mendukung Push API / Service Worker.");
//   }
//   if (!("Notification" in window)) {
//     throw new Error("Notification API tidak tersedia.");
//   }
//   if (!VAPID_PUBLIC_KEY) {
//     throw new Error("VAPID public key tidak ditemukan.");
//   }

//   // diminta setelah interaksi (dipanggil dari click handler)
//   const perm = await Notification.requestPermission();
//   if (perm !== "granted") throw new Error("Izin notifikasi ditolak.");

//   const reg = await navigator.serviceWorker.ready;

//   // Ambil subscription lama atau buat baru
//   let sub = await reg.pushManager.getSubscription();
//   if (!sub) {
//     sub = await reg.pushManager.subscribe({
//       userVisibleOnly: true,
//       applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
//     });
//   }

//   // Selalu kirim ke server (agar tidak 400 "No subscriptions")
//   const res = await fetch(SUBSCRIBE_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     // PushSubscription aman di-JSON.stringify (berisi endpoint, keys, expirationTime)
//     body: JSON.stringify(sub),
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     const text = await res.text().catch(() => "");
//     throw new Error(
//       `Gagal mendaftar subscription: ${res.status} ${text}`.trim()
//     );
//   }

//   // opsional kembalikan respon server
//   return (await res.text().catch(() => "")) || "OK";
// }

// export async function sendTestPush() {
//   const res = await fetch(SEND_TEST_URL, {
//     method: "POST",
//     cache: "no-store",
//   });
//   if (!res.ok) {
//     const text = await res.text().catch(() => "");
//     throw new Error(`Gagal mengirim push uji: ${res.status} ${text}`.trim());
//   }
//   return (await res.text().catch(() => "")) || "OK";
// }

// src/scripts/utils/push.js

// (Bisa ambil dari env kalau sudah diset di Vite/Netlify, kalau belum pakai konstanta ini)
const VAPID_PUBLIC_KEY =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_VAPID_PUBLIC_KEY) ||
  (typeof window !== "undefined" && window.VAPID_PUBLIC_KEY) ||
  "BMDksHjbS7hoqJkQmdkucSZWEkUe_ZclLfO1OJSST65lsdrN0YWruY00tf2DYh6PZbKcNvxe-jRy1Bfs_zBqE1Q";

// Pakai endpoint Netlify Functions LANGSUNG (aman untuk hash routing)
const SUBSCRIBE_URL = "/.netlify/functions/subscribe";
const SEND_TEST_URL = "/.netlify/functions/send";

function urlBase64ToUint8Array(base64String) {
  const pad = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export async function enablePush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Browser tidak mendukung Push API / Service Worker.");
  }
  if (!("Notification" in window)) {
    throw new Error("Notification API tidak tersedia.");
  }
  if (!VAPID_PUBLIC_KEY) {
    throw new Error("VAPID public key tidak ditemukan.");
  }
  if (location.protocol !== "https:" && location.hostname !== "localhost") {
    throw new Error("Push butuh HTTPS (kecuali localhost).");
  }

  // diminta setelah interaksi (dipanggil dari click handler)
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Izin notifikasi ditolak.");

  // pastikan SW sudah ready
  const reg = await navigator.serviceWorker.ready;

  // Ambil subscription lama atau buat baru
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  // Kirim ke server (pakai toJSON agar payload rapi)
  const res = await fetch(SUBSCRIBE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub.toJSON ? sub.toJSON() : sub),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Gagal mendaftar subscription: ${res.status} ${text}`.trim()
    );
  }

  return (await res.text().catch(() => "")) || "OK";
}

export async function sendTestPush() {
  const res = await fetch(SEND_TEST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // banyak contoh function 'send' mengharapkan body; kirim minimal flag
    body: JSON.stringify({ test: true }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gagal mengirim push uji: ${res.status} ${text}`.trim());
  }

  return (await res.text().catch(() => "")) || "OK";
}
