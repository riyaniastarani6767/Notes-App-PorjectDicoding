// // src/api/auth.js
// import { api } from "./client.js";
// import { saveAuth, clearAuth } from "../utils/store.js"; // atau ../scripts/utils/store.js kalau di sana

// export async function register({ name, email, password }) {
//   return api("/register", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ name, email, password }),
//   });
// }

// export async function login({ email, password }) {
//   const data = await api("/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//   });
//   const token = data?.loginResult?.token;
//   const name = data?.loginResult?.name;
//   if (token) saveAuth({ token, name });
//   return data;
// }

// // ✅ HANYA INI. Jangan ada deklarasi lain bernama `logout`.
// export function logout() {
//   clearAuth();
// }

// API auth minimal (dummy). Ganti dengan API asli jika ada.
import { saveAuth, clearAuth } from "../scripts/utils/store.js";

const BASE_URL = ""; // set kalau perlu, mis. "/api"

export async function login({ email, password }) {
  // Dummy: anggap selalu sukses
  await new Promise((r) => setTimeout(r, 300));
  saveAuth({ token: "dummy-token", name: email.split("@")[0] || "User" });
  return { ok: true };
}

export async function register({ name, email, password }) {
  await new Promise((r) => setTimeout(r, 300));
  return { ok: true };
}

export async function logout() {
  try {
    if (BASE_URL) await fetch(`${BASE_URL}/logout`, { method: "POST" });
  } catch (e) {
    // abaikan error jaringan
  } finally {
    clearAuth();
  }
}
