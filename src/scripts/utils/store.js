const TOKEN_KEY = "auth_token";
const NAME_KEY = "auth_name";

export function saveAuth({ token, name }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (name) localStorage.setItem(NAME_KEY, name);
}
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
}
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function isAuthed() {
  return !!getToken();
}
export function getName() {
  return localStorage.getItem(NAME_KEY) || "Pengguna";
}
