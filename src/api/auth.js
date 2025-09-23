// // API auth minimal (dummy). Ganti dengan API asli jika ada.
// import { saveAuth, clearAuth } from "../scripts/utils/store.js";

// const BASE_URL = ""; // set kalau perlu, mis. "/api"

// export async function login({ email, password }) {
//   // Dummy: anggap selalu sukses
//   await new Promise((r) => setTimeout(r, 300));
//   saveAuth({ token: "dummy-token", name: email.split("@")[0] || "User" });
//   return { ok: true };
// }

// export async function register({ name, email, password }) {
//   await new Promise((r) => setTimeout(r, 300));
//   return { ok: true };
// }

// export async function logout() {
//   try {
//     if (BASE_URL) await fetch(`${BASE_URL}/logout`, { method: "POST" });
//   } catch (e) {
//     // abaikan error jaringan
//   } finally {
//     clearAuth();
//   }
// }

const BASE = "https://story-api.dicoding.dev/v1";

export async function apiRegister({ name, email, password }) {
  const res = await fetch(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Register failed");
  return data; // { error:false, message:"User created successfully" }
}

export async function apiLogin({ email, password }) {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  // loginResult: { userId, name, token }
  return data.loginResult;
}

export async function apiLogout() {
  // Story API tidak punya endpoint logout. Cukup hapus token lokal.
  return true;
}
