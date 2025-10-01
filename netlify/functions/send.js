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

// netlify/functions/send.js
const webpush = require("web-push");
const { getStore } = require("@netlify/blobs");

webpush.setVapidDetails(
  "mailto:example@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.handler = async () => {
  const store = getStore("push-subs");
  const raw = (await store.get("list")) || "[]";
  const list = JSON.parse(raw);

  if (!list.length) return { statusCode: 400, body: "No subscriptions" };

  const payload = JSON.stringify({
    title: "Hai dari Server 👋",
    body: "Ini notifikasi uji.",
    url: "/#/",
  });

  const alive = [];
  await Promise.all(
    list.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, payload);
        alive.push(sub);
      } catch (e) {
        // hapus yang invalid/expired; sisanya tetap dipertahankan
        if (!(e.statusCode === 404 || e.statusCode === 410)) alive.push(sub);
      }
    })
  );

  await store.set("list", JSON.stringify(alive), {
    contentType: "application/json",
  });
  return { statusCode: 200, body: "sent" };
};
