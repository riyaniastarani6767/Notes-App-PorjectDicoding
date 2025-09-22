import { apiLogin } from "../api/story.js";

export default {
  async render() {
    return `
      <div class="auth-shell">
        <section class="auth-card" role="region" aria-labelledby="login-title">
          <h2 id="login-title" class="auth-title">Welcome Back!</h2>
          <p class="auth-subtitle">We missed you! Please enter your details.</p>

          <form id="loginForm" novalidate>
            <label for="email">Email</label>
            <input id="email" class="input" type="email" name="email" required aria-required="true" placeholder="Enter your email"/>

            <label for="password">Password</label>
            <input id="password" class="input" type="password" name="password" required aria-required="true" minlength="6" placeholder="Enter password"/>

            <div style="margin-top:14px">
              <button id="btnLogin" class="btn-primary" type="submit">Sign in</button>
            </div>

            <p id="loginMsg" role="alert" style="color:#dc2626;margin-top:10px"></p>
            <p class="auth-bottom">Don't have an account? <a href="#/register">Sign up</a></p>
          </form>
        </section>
      </div>
    `;
  },

  async afterRender() {
    const form = document.getElementById("loginForm");
    const btn = document.getElementById("btnLogin");
    const msg = document.getElementById("loginMsg");

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      btn.disabled = true;
      btn.textContent = "Signing in...";

      const fd = new FormData(form);
      const email = String(fd.get("email") || "").trim();
      const password = String(fd.get("password") || "").trim();

      try {
        await apiLogin({ email, password });
        window.location.hash = "#/"; // ke dashboard
      } catch (err) {
        msg.textContent =
          err?.message || "Gagal masuk. Periksa email & password.";
      } finally {
        btn.disabled = false;
        btn.textContent = "Sign in";
      }
    });
  },
};
