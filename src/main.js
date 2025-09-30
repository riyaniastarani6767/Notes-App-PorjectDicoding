// src/main.js
import "./styles/main.css";
import { render } from "./routers/router.js";

window.addEventListener("load", render);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(async (reg) => {
      console.log("[SW] registered:", reg.scope);

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("[SW] controller changed → reload");
        window.location.reload();
      });

      await navigator.serviceWorker.ready;

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
