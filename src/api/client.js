// export const BASE_URL = "https://story-api.dicoding.dev/v1";
// import { getToken } from "../utils/store.js";

// function withAuth(headers = {}) {
//   const t = getToken();
//   return t ? { ...headers, Authorization: `Bearer ${t}` } : headers;
// }

// export async function api(path, { method = "GET", headers = {}, body } = {}) {
//   const res = await fetch(`${BASE_URL}${path}`, { method, headers, body });
//   const isJson = res.headers.get("content-type")?.includes("application/json");
//   const data = isJson ? await res.json() : null;
//   if (!res.ok) throw new Error(data?.message || res.statusText);
//   return data;
// }

// export { withAuth };

// Klien fetch dengan header auth (kalau nanti ada endpoint backend)
import { getToken } from "./scripts/utils/store.js";

export function withAuth(headers = {}) {
  const token = getToken();
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

export async function apiGet(url) {
  const res = await fetch(url, { headers: withAuth() });
  if (!res.ok) throw new Error("Request gagal");
  return res.json();
}
