import { apiRegister } from "../api/story.js";

export default {
  async render() {
    return `
      <div class="auth-shell">
        <section class="auth-card" role="region" aria-labelledby="reg-title">
          <h2 id="reg-title" class="auth-title">Create Account</h2>
          <p class="auth-subtitle">Join us to start sharing your stories.</p>

          <form id="regForm" novalidate>
            <label for="name">Name</label>
            <input id="name" class="input" name="name" required aria-required="true" placeholder="Your name"/>

            <label for="email">Email</label>
            <input id="email" class="input" type="email" name="email" required aria-required="true" placeholder="you@example.com"/>

            <label for="password">Password</label>
            <input id="password" class="input" type="password" name="password" required aria-required="true" minlength="8" placeholder="Min 8 characters"/>

            <div style="margin-top:14px">
              <button id="btnReg" class="btn-primary" type="submit">Create account</button>
            </div>

            <p id="regMsg" role="alert" style="margin-top:10px;color:#16a34a"></p>
            <p class="auth-bottom">Already have an account? <a href="#/login">Sign in</a></p>
          </form>
        </section>
      </div>
    `;
  },

  async afterRender() {
    const form = document.getElementById("regForm");
    const btn = document.getElementById("btnReg");
    const msg = document.getElementById("regMsg");

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.style.color = "#16a34a";
      msg.textContent = "";
      btn.disabled = true;
      btn.textContent = "Creating...";

      const fd = new FormData(form);
      const payload = {
        name: String(fd.get("name") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        password: String(fd.get("password") || "").trim(),
      };

      try {
        await apiRegister(payload);
        msg.textContent = "Registrasi berhasil. Mengarahkan ke halaman masuk…";
        setTimeout(() => (window.location.hash = "#/login"), 700);
      } catch (err) {
        msg.style.color = "#dc2626";
        msg.textContent = err?.message || "Gagal mendaftar.";
      } finally {
        btn.disabled = false;
        btn.textContent = "Create account";
      }
    });
  },
};
