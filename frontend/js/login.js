// ============================================
// login.js — Admin login (login.html)
// ============================================
function applyI18nLogin() {
  const t = Lang.t();
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const path = el.getAttribute("data-i18n").split(".");
    let v = t; for (const k of path) v = v?.[k];
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll("[data-i18n_text]").forEach((el) => {
    const v = el.getAttribute("data-i18n_text");
    const parts = Object.fromEntries(v.split("|").map((p) => p.split(":").map((s) => s.trim())));
    el.textContent = parts[Lang.current] || "";
  });
  document.querySelectorAll("[data-brand-letter]").forEach((el) => el.textContent = Lang.isRTL() ? "ر" : "R");
  const btn = document.getElementById("lang-toggle");
  if (btn) btn.textContent = Lang.isRTL() ? "EN" : "عربي";
  document.title = Lang.isRTL() ? "الإدارة | الريان" : "Admin | Al-Rayan";
}

document.getElementById("lang-toggle").addEventListener("click", () => { Lang.toggle(); applyI18nLogin(); });

// If already logged in, go to admin
if (API.token()) {
  API.get("/auth/me").then(() => location.replace("admin.html")).catch(() => localStorage.removeItem("alrayan_token"));
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const errBox = document.getElementById("login-error");
  errBox.style.display = "none";
  const btn = document.getElementById("login-submit");
  btn.disabled = true; btn.textContent = "...";
  try {
    const res = await API.post("/auth/login", { username, password });
    localStorage.setItem("alrayan_token", res.token);
    location.href = "admin.html";
  } catch (err) {
    errBox.style.display = "block";
    errBox.textContent = err.message || Lang.t().admin.invalid;
    btn.disabled = false;
    applyI18nLogin();
  }
});

applyI18nLogin();
