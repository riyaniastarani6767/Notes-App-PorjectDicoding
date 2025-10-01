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
