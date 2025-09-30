// import { api, withAuth } from "./client.js";

// export async function getStories({ page = 1, size = 30, location = 1 } = {}) {
//   return api(`/stories?location=${location}&page=${page}&size=${size}`, {
//     headers: withAuth({ "Content-Type": "application/json" }),
//   });
// }

// export async function addStory({ file, description, lat, lon }) {
//   const form = new FormData();
//   form.append("photo", file);
//   form.append("description", description);
//   if (lat != null) form.append("lat", lat);
//   if (lon != null) form.append("lon", lon);

//   return api("/stories", { method: "POST", headers: withAuth(), body: form });
// }

import { api, withAuth } from "./client.js";

export async function getStories({ page = 1, size = 30, location = 1 } = {}) {
  const t = Date.now(); // cache buster
  return api(`/stories?location=${location}&page=${page}&size=${size}&t=${t}`, {
    headers: withAuth({ "Content-Type": "application/json" }),
    // cegah cache di level fetch/browser
    fetchOptions: { cache: "no-store" }, // jika helper api() meneruskan opsi ini
  });
}

export async function addStory({ file, description, lat, lon }) {
  const form = new FormData();
  form.append("photo", file);
  form.append("description", description);
  if (lat != null) form.append("lat", lat);
  if (lon != null) form.append("lon", lon);

  return api("/stories", { method: "POST", headers: withAuth(), body: form });
}
