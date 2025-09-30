// // src/main.js
// import "./styles/main.css";
// import { render } from "./routers/router.js";

// // Render SPA segera
// window.addEventListener("load", render);

// // --- Service Worker register (DAFTARKAN SECEPAT MUNGKIN) ---
// if ("serviceWorker" in navigator) {
//   // jangan tunggu window 'load' lagi
//   navigator.serviceWorker
//     .register("/sw.js")
//     .then(async (reg) => {
//       console.log("[SW] registered:", reg.scope);

//       // tunggu sampai siap (activated)
//       await navigator.serviceWorker.ready;

//       // jika belum mengontrol, paksa reload sekali agar terkendali
//       if (!navigator.serviceWorker.controller) {
//         console.log("[SW] not controlling yet → reload once");
//         location.reload();
//       } else {
//         console.log(
//           "[SW] page is controlled by:",
//           navigator.serviceWorker.controller.scriptURL
//         );
//       }
//     })
//     .catch((err) => console.error("[SW] register error:", err));
// }

// // --- Install prompt ---
// let deferredPrompt;
// const installBtnId = "btn-install-pwa";

// window.addEventListener("beforeinstallprompt", (e) => {
//   e.preventDefault();
//   deferredPrompt = e;
//   const btn = document.getElementById(installBtnId);
//   if (btn) btn.style.display = "inline-flex";
// });

// export async function handleInstallClick() {
//   if (!deferredPrompt) return;
//   const result = await deferredPrompt.prompt();
//   // result.outcome: 'accepted' | 'dismissed'
//   deferredPrompt = null;
//   const btn = document.getElementById(installBtnId);
//   if (btn) btn.style.display = "none";
// }

// src/main.js
import "./styles/main.css";
import { render } from "./routers/router.js";

// Render SPA segera
window.addEventListener("load", render);

/* ================= Service Worker =================
   Aktifkan HANYA di production supaya saat "npm run dev"
   tidak terkunci cache. Di production, kita auto-reload
   saat SW baru mengontrol halaman. */
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(async (reg) => {
      console.log("[SW] registered:", reg.scope);

      // reload otomatis saat SW versi baru mengambil alih
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("[SW] controller changed → reload");
        window.location.reload();
      });

      // tunggu sampai siap (activated)
      await navigator.serviceWorker.ready;

      // jika belum mengontrol, reload sekali agar terkendali
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

/* ================= Install Prompt ================= */
let deferredPrompt;
const installBtnId = "btn-install-pwa";

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById(installBtnId);
  if (btn) btn.style.display = "inline-flex"; // tampilkan tombol install
});

export async function handleInstallClick() {
  if (!deferredPrompt) return;
  const result = await deferredPrompt.prompt(); // { outcome: 'accepted'|'dismissed' }
  deferredPrompt = null;
  const btn = document.getElementById(installBtnId);
  if (btn) btn.style.display = "none";
  console.log("[PWA] install result:", result?.outcome);
}
