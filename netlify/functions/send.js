const webpush = require("web-push");
webpush.setVapidDetails(
  "mailto:example@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

exports.handler = async () => {
  const list = Array.from(globalThis.__SUBS__ || []);
  if (!list.length) return { statusCode: 400, body: "No subscriptions" };

  const payload = JSON.stringify({
    title: "Hai dari Server 👋",
    body: "Ini notifikasi uji.",
    url: "/#/",
  });
  await Promise.all(
    list.map(async (s) => {
      const sub = JSON.parse(s);
      try {
        await webpush.sendNotification(sub, payload);
      } catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410)
          globalThis.__SUBS__.delete(s);
      }
    })
  );

  return { statusCode: 201, body: "sent" };
};
