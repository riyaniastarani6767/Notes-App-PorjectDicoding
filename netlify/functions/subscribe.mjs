// exports.handler = async (event) => {
//   if (event.httpMethod !== "POST")
//     return { statusCode: 405, body: "Method Not Allowed" };
//   try {
//     const sub = JSON.parse(event.body || "{}");
//     if (!sub?.endpoint)
//       return { statusCode: 400, body: "Invalid subscription" };
//     globalThis.__SUBS__ = globalThis.__SUBS__ || new Set();
//     globalThis.__SUBS__.add(JSON.stringify(sub));
//     return {
//       statusCode: 201,
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ ok: true }),
//     };
//   } catch (e) {
//     return { statusCode: 500, body: e.message || "error" };
//   }
// };

// // netlify/functions/subscribe.js
// const { getStore } = require("@netlify/blobs");

// exports.handler = async (event) => {
//   if (event.httpMethod !== "POST")
//     return { statusCode: 405, body: "Method Not Allowed" };

//   try {
//     const body = JSON.parse(event.body || "{}");
//     // dukung dua format: {subscription:{...}} atau langsung objek
//     const sub = body.subscription || body;
//     if (!sub?.endpoint)
//       return { statusCode: 400, body: "Invalid subscription" };

//     const store = getStore("push-subs"); // nama bucket
//     const raw = (await store.get("list")) || "[]";
//     const list = JSON.parse(raw);

//     // hindari duplikat berdasarkan endpoint
//     if (!list.find((s) => s.endpoint === sub.endpoint)) {
//       list.push(sub);
//       await store.set("list", JSON.stringify(list), {
//         contentType: "application/json",
//       });
//     }

//     return { statusCode: 201, body: "OK" };
//   } catch (e) {
//     return { statusCode: 500, body: e.message || "error" };
//   }
// };

// netlify/functions/subscribe.js
// netlify/functions/subscribe.mjs
export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const sub = body.subscription || body;
    if (!sub?.endpoint) {
      return { statusCode: 400, body: "Invalid subscription" };
    }

    // --- Simpan ke Blobs JIKA tersedia; kalau tidak, tetap return OK ---
    try {
      const { getStore } = await import("@netlify/blobs");
      const store = getStore("push-subs");
      const raw = (await store.get("list")) || "[]";
      const list = JSON.parse(raw);
      if (!list.find((s) => s.endpoint === sub.endpoint)) {
        list.push(sub);
        await store.set("list", JSON.stringify(list), {
          contentType: "application/json",
        });
      }
    } catch {
      // Blobs tidak tersedia → abaikan, tetap sukses
    }

    return { statusCode: 201, body: "OK" };
  } catch (e) {
    return { statusCode: 500, body: e.message || "error" };
  }
}
