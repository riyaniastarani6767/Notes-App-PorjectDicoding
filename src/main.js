// // src/main.js
// import "./styles/main.css";
// import { render } from "./routers/router.js";

// window.addEventListener("load", render);

// if (import.meta.env.PROD && "serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("/sw.js")
//     .then(async (reg) => {
//       console.log("[SW] registered:", reg.scope);

//       navigator.serviceWorker.addEventListener("controllerchange", () => {
//         console.log("[SW] controller changed → reload");
//         window.location.reload();
//       });

//       await navigator.serviceWorker.ready;

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
//   deferredPrompt = null;
//   const btn = document.getElementById(installBtnId);
//   if (btn) btn.style.display = "none";
//   console.log("[PWA] install result:", result?.outcome);
// }

// // src/main.js
// import "./styles/main.css";
// import { render } from "./routers/router.js";

// window.addEventListener("load", render);

// // Daftarkan SW (tetap PROD-only agar tidak mengganggu dev flow kamu)
// if (import.meta.env.PROD && "serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("/sw.js")
//     .then(async (reg) => {
//       console.log("[SW] registered:", reg.scope);

//       navigator.serviceWorker.addEventListener("controllerchange", () => {
//         console.log("[SW] controller changed → reload");
//         window.location.reload();
//       });

//       await navigator.serviceWorker.ready;

//       if (!navigator.serviceWorker.controller) {
//         console.log("[SW] not controlling yet → reload once");
//         location.reload();
//       } else {
//         console.log(
//           "[SW] page is controlled by:",
//           navigator.serviceWorker.controller.scriptURL
//         );
//       }

//       // ====== PERMINTAAN IZIN NOTIFIKASI (sekali saja) ======
//       try {
//         if ("Notification" in window) {
//           const asked = localStorage.getItem("notif_asked_v1");
//           if (Notification.permission === "default" && !asked) {
//             localStorage.setItem("notif_asked_v1", "1");
//             const result = await Notification.requestPermission();
//             console.log("[Notif] permission:", result);
//             // Basic (+2 pts) cukup sampai sini. Tidak wajib subscribe pushManager.
//             // Jika nanti mau, taruh di bawah ini:
//             // if (result === "granted") {
//             //   const sub = await reg.pushManager.subscribe({
//             //     userVisibleOnly: true,
//             //     applicationServerKey: "<VAPID_PUBLIC_KEY>"
//             //   });
//             //   console.log("[Push] subscribed:", JSON.stringify(sub));
//             // }
//           }
//         }
//       } catch (e) {
//         console.warn("[Notif] requestPermission error:", e);
//       }
//       // =======================================================
//     })
//     .catch((err) => console.error("[SW] register error:", err));
// }

// // PWA install prompt (punyamu tetap, tidak diubah)
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
//   deferredPrompt = null;
//   const btn = document.getElementById(installBtnId);
//   if (btn) btn.style.display = "none";
//   console.log("[PWA] install result:", result?.outcome);
// }

// src/main.js
// src/main.js
import "./styles/main.css";
import { render } from "./routers/router.js";

window.addEventListener("load", render);

// ===== Helper: cegah reload berulang saat controllerchange =====
let swRefreshing = false;
const RELOAD_ONCE_KEY = "sw_reload_once_v1";

// === Register Service Worker di DEV & PROD ===
// (DEV: localhost / 127.0.0.1 / ::1) atau saat build PROD
const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(
  location.hostname
);

if ("serviceWorker" in navigator && (isLocalhost || import.meta.env.PROD)) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(async (reg) => {
      console.log("[SW] registered:", reg.scope);

      // Reload sekali ketika controller berganti (SW baru mengambil alih)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (swRefreshing) return; // guard agar tak looping
        swRefreshing = true;
        console.log("[SW] controller changed → reload once");
        window.location.reload();
      });

      // Tunggu SW siap
      await navigator.serviceWorker.ready;

      // Jika belum mengontrol halaman, reload sekali saja (bukan berulang)
      if (!navigator.serviceWorker.controller) {
        if (!sessionStorage.getItem(RELOAD_ONCE_KEY)) {
          sessionStorage.setItem(RELOAD_ONCE_KEY, "1");
          console.log("[SW] not controlling yet → reload once");
          location.reload();
          return;
        } else {
          console.log("[SW] skip second reload");
        }
      } else {
        console.log(
          "[SW] page is controlled by:",
          navigator.serviceWorker.controller.scriptURL
        );
      }

      // ====== Minta izin notifikasi (sekali saja, berlaku DEV & PROD) ======
      try {
        if ("Notification" in window) {
          const asked = localStorage.getItem("notif_asked_v1");
          if (Notification.permission === "default" && !asked) {
            localStorage.setItem("notif_asked_v1", "1");
            const result = await Notification.requestPermission();
            console.log("[Notif] permission:", result);
            // Basic (+2 pts): cukup sampai sini (tidak wajib subscribe pushManager)
          }
        }
      } catch (e) {
        console.warn("[Notif] requestPermission error:", e);
      }
      // =====================================================================
    })
    .catch((err) => console.error("[SW] register error:", err));
}

// ==== PWA install prompt ====
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
  deferredPrompt = null;
  const btn = document.getElementById(installBtnId);
  if (btn) btn.style.display = "none";
  console.log("[PWA] install result:", result?.outcome);
}
