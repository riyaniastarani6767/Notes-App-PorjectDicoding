import HomePage from "../pages/home.js";
import AddPage from "../pages/add.js";
import LoginPage from "../pages/login.js";
import RegisterPage from "../pages/register.js";
import AboutPage from "../pages/about.js";

import {
  isAuthed,
  getName,
  clearAuth as clearSession,
} from "../scripts/utils/store.js";
import { apiLogout } from "../api/story.js";

const routes = {
  "#/": HomePage,
  "#/add": AddPage,
  "#/login": LoginPage,
  "#/register": RegisterPage,
  "#/about": AboutPage,
};

function requiresAuth(hash) {
  return ["#/", "#/add"].includes(hash);
}
function isAuthPage(hash) {
  return ["#/login", "#/register"].includes(hash);
}

function navbar() {
  const authed = isAuthed();
  const name = getName();
  return `
    <nav aria-label="Navigasi utama">
      <a href="#/" data-link>StoryMap</a>
      <a href="#/" data-link>Beranda</a>
      <a href="#/add" data-link>Tambah</a>
      <a href="#/about" data-link>Tentang</a>
      <div class="spacer" aria-hidden="true"></div>
      ${
        authed
          ? `<span>Hai, <b>${name}</b></span>
             <button class="btn-outline" data-logout aria-label="Keluar">Keluar</button>`
          : `<a class="btn" href="#/login">Masuk</a>
             <a class="btn-outline" href="#/register">Daftar</a>`
      }
    </nav>
  `;
}
function footer() {
  const year = new Date().getFullYear();
  return `<footer class="footer">© ${year} StoryMap</footer>`;
}

async function _render() {
  const root = document.getElementById("app");
  const hash = window.location.hash || "#/";

  // redirect supaya user login gak lihat halaman auth
  if (isAuthPage(hash) && isAuthed()) {
    window.location.hash = "#/";
    return;
  }
  // guard halaman yang butuh login
  if (requiresAuth(hash) && !isAuthed()) {
    window.location.hash = "#/login";
    return;
  }

  const Page = routes[hash] || AboutPage;

  // mode body untuk auth (dipakai buat hide skip-link & set background)
  if (isAuthPage(hash)) document.body.classList.add("auth");
  else document.body.classList.remove("auth");

  if (isAuthPage(hash)) {
    // AUTH LAYOUT (tanpa navbar/footer/container)
    root.innerHTML = await Page.render?.();
  } else {
    // APP LAYOUT
    root.innerHTML = `
      ${navbar()}
      <main class="container">
        ${await Page.render?.()}
      </main>
      ${footer()}
    `;
  }

  await Page.afterRender?.();

  const btnLogout = document.querySelector("[data-logout]");
  if (btnLogout) {
    btnLogout.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await apiLogout();
      } finally {
        clearSession();
        window.location.hash = "#/login";
      }
    });
  }

  document.querySelectorAll("nav a[data-link]").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === hash);
  });
}

export function render() {
  if (!document.startViewTransition) return _render();
  document.startViewTransition(_render);
}
window.addEventListener("hashchange", render);
