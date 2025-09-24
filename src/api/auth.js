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
