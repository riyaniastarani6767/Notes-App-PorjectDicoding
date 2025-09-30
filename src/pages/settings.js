// import {
//   subscribePush,
//   unsubscribePush,
//   getPushStatus,
// } from "../scripts/utils/push.js";

// export default {
//   async render() {
//     return `
//       <section class="card" aria-labelledby="st-title">
//         <h1 id="st-title">Pengaturan</h1>
//         <div style="display:flex;gap:12px;align-items:center">
//           <span>Status: <strong id="push-status">checking...</strong></span>
//           <button id="btn-sub" class="btn">Enable Push</button>
//           <button id="btn-unsub" class="btn btn-outline">Disable Push</button>
//         </div>
//       </section>
//     `;
//   },
//   async afterRender() {
//     const statusEl = document.getElementById("push-status");
//     const btnSub = document.getElementById("btn-sub");
//     const btnUnsub = document.getElementById("btn-unsub");

//     async function refresh() {
//       const on = await getPushStatus();
//       statusEl.textContent = on ? "Aktif" : "Tidak aktif";
//     }
//     btnSub.addEventListener("click", async () => {
//       btnSub.disabled = true;
//       try {
//         await subscribePush();
//       } finally {
//         btnSub.disabled = false;
//         refresh();
//       }
//     });
//     btnUnsub.addEventListener("click", async () => {
//       btnUnsub.disabled = true;
//       try {
//         await unsubscribePush();
//       } finally {
//         btnUnsub.disabled = false;
//         refresh();
//       }
//     });
//     refresh();
//   },
// };

import { enablePush, sendTestPush } from "../scripts/utils/push.js";

export default {
  async render() {
    return `
      <section class="card">
        <h1>Pengaturan</h1>
        <button id="btn-enable-push" class="btn">Aktifkan Notifikasi</button>
        <button id="btn-test-push" class="btn" style="margin-left:8px">Kirim Notifikasi Uji</button>
        <p id="push-status" style="margin-top:8px;font-size:14px;"></p>
      </section>
    `;
  },
  async afterRender() {
    const statusEl = document.getElementById("push-status");
    document
      .getElementById("btn-enable-push")
      ?.addEventListener("click", async () => {
        try {
          await enablePush();
          statusEl.textContent = "Subscription terkirim ✓";
        } catch (e) {
          statusEl.textContent = "Gagal: " + e.message;
        }
      });
    document
      .getElementById("btn-test-push")
      ?.addEventListener("click", async () => {
        try {
          await sendTestPush();
          statusEl.textContent = "Server mengirim push uji.";
        } catch (e) {
          statusEl.textContent = "Gagal kirim uji: " + e.message;
        }
      });
  },
};
