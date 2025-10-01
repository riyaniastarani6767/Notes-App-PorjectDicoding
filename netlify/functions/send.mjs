// const webpush = require("web-push");
// webpush.setVapidDetails(
//   "mailto:example@example.com",
//   process.env.VAPID_PUBLIC_KEY,
//   process.env.VAPID_PRIVATE_KEY
// );

// exports.handler = async () => {
//   const list = Array.from(globalThis.__SUBS__ || []);
//   if (!list.length) return { statusCode: 400, body: "No subscriptions" };

//   const payload = JSON.stringify({
//     title: "Hai dari Server 👋",
//     body: "Ini notifikasi uji.",
//     url: "/#/",
//   });
//   await Promise.all(
//     list.map(async (s) => {
//       const sub = JSON.parse(s);
//       try {
//         await webpush.sendNotification(sub, payload);
//       } catch (e) {
//         if (e.statusCode === 404 || e.statusCode === 410)
//           globalThis.__SUBS__.delete(s);
//       }
//     })
//   );

//   return { statusCode: 201, body: "sent" };
// };

// // netlify/functions/send.js
// const webpush = require("web-push");
// const { getStore } = require("@netlify/blobs");

// webpush.setVapidDetails(
//   "mailto:example@example.com",
//   process.env.VAPID_PUBLIC_KEY,
//   process.env.VAPID_PRIVATE_KEY
// );

// exports.handler = async () => {
//   const store = getStore("push-subs");
//   const raw = (await store.get("list")) || "[]";
//   const list = JSON.parse(raw);

//   if (!list.length) return { statusCode: 400, body: "No subscriptions" };

//   const payload = JSON.stringify({
//     title: "Hai dari Server 👋",
//     body: "Ini notifikasi uji.",
//     url: "/#/",
//   });

//   const alive = [];
//   await Promise.all(
//     list.map(async (sub) => {
//       try {
//         await webpush.sendNotification(sub, payload);
//         alive.push(sub);
//       } catch (e) {
//         // hapus yang invalid/expired; sisanya tetap dipertahankan
//         if (!(e.statusCode === 404 || e.statusCode === 410)) alive.push(sub);
//       }
//     })
//   );

//   await store.set("list", JSON.stringify(alive), {
//     contentType: "application/json",
//   });
//   return { statusCode: 200, body: "sent" };
// };

// netlify/functions/send.js
// netlify/functions/send.mjs
import webpushPkg from "web-push";
const webpush = webpushPkg;

webpush.setVapidDetails(
  "mailto:example@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function handler(event) {
  try {
    const payload = JSON.stringify({
      title: "Hai dari Server 👋",
      body: "Ini notifikasi uji.",
      url: "/#/",
    });

    // 1) Ambil subscription dari body (opsi tanpa storage)
    const subs = [];
    try {
      const body = JSON.parse(event.body || "{}");
      const direct = body?.subscription || body?.sub;
      if (direct?.endpoint) subs.push(direct);
    } catch {
      /* ignore */
    }

    // 2) Tambah dari Blobs kalau tersedia
    try {
      const { getStore } = await import("@netlify/blobs");
      const store = getStore("push-subs");
      const raw = (await store.get("list")) || "[]";
      const list = JSON.parse(raw);
      for (const s of list) subs.push(s);
    } catch {
      // Blobs tidak tersedia → tidak apa
    }

    if (!subs.length) {
      return { statusCode: 400, body: "No subscriptions" };
    }

    const alive = [];
    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(sub, payload);
          alive.push(sub);
        } catch (e) {
          // buang yang invalid/expired jika sumbernya dari Blobs (kalau ada)
          // (tanpa Blobs kita tidak menyimpan apa pun, jadi aman)
        }
      })
    );

    // Jika Blobs ada, update list dengan yang masih hidup
    try {
      const { getStore } = await import("@netlify/blobs");
      const store = getStore("push-subs");
      await store.set("list", JSON.stringify(alive), {
        contentType: "application/json",
      });
    } catch {
      // Blobs tidak ada → abaikan
    }

    return { statusCode: 200, body: "sent" };
  } catch (e) {
    return { statusCode: 502, body: e.message || "Server error" };
  }
}
