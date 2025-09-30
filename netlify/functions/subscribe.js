exports.handler = async (event) => {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method Not Allowed" };
  try {
    const sub = JSON.parse(event.body || "{}");
    if (!sub?.endpoint)
      return { statusCode: 400, body: "Invalid subscription" };
    globalThis.__SUBS__ = globalThis.__SUBS__ || new Set();
    globalThis.__SUBS__.add(JSON.stringify(sub));
    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (e) {
    return { statusCode: 500, body: e.message || "error" };
  }
};
