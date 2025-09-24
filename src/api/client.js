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
