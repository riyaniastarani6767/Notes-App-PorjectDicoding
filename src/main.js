// // src/main.js
// import "./styles/main.css";
// import { render } from "./routers/router.js";

// window.addEventListener("load", render);

// let swRefreshing = false;
// const RELOAD_ONCE_KEY = "sw_reload_once_v1";

// const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(
//   location.hostname
// );

// if ("serviceWorker" in navigator && (isLocalhost || import.meta.env.PROD)) {
//   navigator.serviceWorker
//     .register("/sw.js")
//     .then(async (reg) => {
//       console.log("[SW] registered:", reg.scope);

//       navigator.serviceWorker.addEventListener("controllerchange", () => {
//         if (swRefreshing) return;
//         console.log("[SW] controller changed → reload once");
//         window.location.reload();
//       });

//       await navigator.serviceWorker.ready;

//       if (!navigator.serviceWorker.controller) {
//         if (!sessionStorage.getItem(RELOAD_ONCE_KEY)) {
//           sessionStorage.setItem(RELOAD_ONCE_KEY, "1");
//           console.log("[SW] not controlling yet → reload once");
//           location.reload();
//           return;
//         } else {
//           console.log("[SW] skip second reload");
//         }
//       } else {
//         console.log(
//           "[SW] page is controlled by:",
//           navigator.serviceWorker.controller.scriptURL
//         );
//       }

//       try {
//         if ("Notification" in window) {
//           const asked = localStorage.getItem("notif_asked_v1");
//           if (Notification.permission === "default" && !asked) {
//             localStorage.setItem("notif_asked_v1", "1");
//             const result = await Notification.requestPermission();
//             console.log("[Notif] permission:", result);
//           }
//         }
//       } catch (e) {
//         console.warn("[Notif] requestPermission error:", e);
//       }
//     })
//     .catch((err) => console.error("[SW] register error:", err));
// }

// // ==== PWA install prompt ====
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
import "./styles/main.css";
import { render } from "./routers/router.js";

window.addEventListener("load", render);

let swRefreshing = false;
const RELOAD_ONCE_KEY = "sw_reload_once_v1";

const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(
  location.hostname
);

if ("serviceWorker" in navigator && (isLocalhost || import.meta.env.PROD)) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(async (reg) => {
      console.log("[SW] registered:", reg.scope);

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (swRefreshing) return;
        console.log("[SW] controller changed → reload once");
        window.location.reload();
      });

      await navigator.serviceWorker.ready;

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

      // ⚠️ Dihapus: auto-permission Notification.requestPermission() di onload.
      // Izin notifikasi sekarang hanya diminta via interaksi user (settings.js → enablePush()).
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
