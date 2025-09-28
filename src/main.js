// // // src/main.js

// import "./styles/main.css";
// import { render } from "./routers/router.js";

// window.addEventListener("load", render);

// // --- Service Worker register ---
// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker.register("/sw.js");
//   });
// }

// // --- Install prompt ---
// let deferredPrompt;
// const installBtnId = "btn-install-pwa";

// // tambahkan tombol install di nav kamu (atau buat sendiri di DOM)
// window.addEventListener("beforeinstallprompt", (e) => {
//   e.preventDefault();
//   deferredPrompt = e;
//   const btn = document.getElementById(installBtnId);
//   if (btn) btn.style.display = "inline-flex";
// });

// export async function handleInstallClick() {
//   if (!deferredPrompt) return;
//   const result = await deferredPrompt.prompt();
//   // result.outcome = 'accepted' | 'dismissed'
//   deferredPrompt = null;
//   const btn = document.getElementById(installBtnId);
//   if (btn) btn.style.display = "none";
// }

// src/main.js
import "./styles/main.css";
import { render } from "./routers/router.js";

// Render SPA segera
window.addEventListener("load", render);

// --- Service Worker register (DAFTARKAN SECEPAT MUNGKIN) ---
if ("serviceWorker" in navigator) {
  // jangan tunggu window 'load' lagi
  navigator.serviceWorker
    .register("/sw.js")
    .then(async (reg) => {
      console.log("[SW] registered:", reg.scope);

      // tunggu sampai siap (activated)
      await navigator.serviceWorker.ready;

      // jika belum mengontrol, paksa reload sekali agar terkendali
      if (!navigator.serviceWorker.controller) {
        console.log("[SW] not controlling yet → reload once");
        location.reload();
      } else {
        console.log(
          "[SW] page is controlled by:",
          navigator.serviceWorker.controller.scriptURL
        );
      }
    })
    .catch((err) => console.error("[SW] register error:", err));
}

// --- Install prompt ---
let deferredPrompt;
const installBtnId = "btn-install-pwa";

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById(installBtnId);
  if (btn) btn.style.display = "inline-flex";
});

export async function handleInstallClick() {
  if (!deferredPrompt) return;
  const result = await deferredPrompt.prompt();
  // result.outcome: 'accepted' | 'dismissed'
  deferredPrompt = null;
  const btn = document.getElementById(installBtnId);
  if (btn) btn.style.display = "none";
}
