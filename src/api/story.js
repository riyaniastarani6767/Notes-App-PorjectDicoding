import { getToken, saveAuth, clearAuth } from "../scripts/utils/store.js";

const BASE = "https://story-api.dicoding.dev/v1";

function withAuth(headers = {}) {
  const t = getToken();
  return t ? { ...headers, Authorization: `Bearer ${t}` } : headers;
}

export async function apiRegister({ name, email, password }) {
  const res = await fetch(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Register gagal");
  return data;
}

export async function apiLogin({ email, password }) {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login gagal");
  const token = data?.loginResult?.token;
  const name = data?.loginResult?.name || email.split("@")[0];
  saveAuth({ token, name });
  return data;
}

export async function apiLogout() {
  clearAuth(); // API tidak menyediakan logout server; cukup hapus token
}

export async function apiGetStories({
  page = 1,
  size = 20,
  withLocation = true,
} = {}) {
  const qs = new URLSearchParams({
    page,
    size,
    location: withLocation ? 1 : 0,
  });
  const res = await fetch(`${BASE}/stories?${qs.toString()}`, {
    headers: withAuth(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal memuat stories");
  return data; // { listStory: [...] }
}

export async function apiAddStory({ photoFile, description, lat, lon }) {
  const fd = new FormData();
  fd.append("photo", photoFile);
  fd.append("description", description);
  if (lat != null && lon != null) {
    fd.append("lat", lat);
    fd.append("lon", lon);
  }
  const res = await fetch(`${BASE}/stories`, {
    method: "POST",
    headers: withAuth(),
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal menambah story");
  return data;
}
