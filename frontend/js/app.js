// ============================================
// app.js — Storefront logic (index.html)
// ============================================

const State = {
  products: [],
  categories: [],
  banners: [],
  cart: JSON.parse(localStorage.getItem("alrayan_cart") || "[]"),
  selectedCategory: null,
  search: "",
  whatsapp: "",
  brandLetter() { return Lang.isRTL() ? "ر" : "R"; },
};

// ============== i18n ==============
function applyI18n() {
  const t = Lang.t();
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const path = el.getAttribute("data-i18n").split(".");
    let v = t; for (const k of path) v = v?.[k];
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll("[data-i18n_text]").forEach((el) => {
    const v = el.getAttribute("data-i18n_text"); // "ar:..|en:.."
    const parts = Object.fromEntries(v.split("|").map((p) => p.split(":").map((s) => s.trim())));
    el.textContent = parts[Lang.current] || "";
  });
  // dynamic placeholders
  document.title = (Lang.isRTL() ? "الريان | متجر الأدوات البلاستيكية والمنظفات" : "Al-Rayan | Premium Plasticware & Detergents");
  const search = document.getElementById("search-input");
  if (search) search.placeholder = t.sec.search_ph;
  const langBtn1 = document.getElementById("lang-toggle");
  const langBtn2 = document.getElementById("lang-toggle-mobile");
  const langText = Lang.isRTL() ? "EN" : "عربي";
  if (langBtn1) langBtn1.innerHTML = `🌐 ${langText}`;
  if (langBtn2) langBtn2.textContent = langText;
  // brand letter
  document.querySelectorAll("[data-brand-letter]").forEach((el) => el.textContent = State.brandLetter());
}

// ============== Settings ==============
async function loadSettings() {
  try {
    const s = await API.get("/settings");
    State.whatsapp = s.whatsapp_number || "";
  } catch (e) { /* silent */ }
}

// ============== Banners ==============
async function loadBanners() {
  try {
    State.banners = await API.get("/banners");
    renderBanners();
  } catch { /* */ }
}

let bannerActive = 0;
let bannerTimer = null;
function renderBanners() {
  const slider = document.getElementById("banner-slider");
  const dots = document.getElementById("banner-dots");
  if (!slider || !dots) return;

  // remove existing slides (keep nav buttons + dots container)
  slider.querySelectorAll(".banner-slide").forEach((s) => s.remove());

  if (State.banners.length === 0) {
    slider.parentElement.style.display = "none";
    return;
  }

  const t = Lang.t();
  State.banners.forEach((b, idx) => {
    const slide = document.createElement("div");
    slide.className = "banner-slide" + (idx === 0 ? " active" : "");
    slide.innerHTML = `
      <div class="banner-text">
        <div class="eyebrow"><span class="line"></span><span class="text">${String(idx+1).padStart(2,"0")} / ${String(State.banners.length).padStart(2,"0")}</span></div>
        <h3>${Lang.isRTL() ? b.title_ar : b.title_en}</h3>
        <p>${Lang.isRTL() ? (b.subtitle_ar||"") : (b.subtitle_en||"")}</p>
        ${(b.cta_label_ar || b.cta_label_en) ? `<button class="btn" style="align-self:flex-start" data-cta="${b.cta_href || ""}">${Lang.isRTL() ? b.cta_label_ar : b.cta_label_en}</button>` : ""}
      </div>
      <div class="banner-img"><img src="${API.resolveImage(b.image_url)}" alt="" onerror="this.src='images/placeholder.jpg'"/></div>
    `;
    slider.insertBefore(slide, slider.querySelector(".banner-prev"));
  });

  // CTA wiring
  slider.querySelectorAll("[data-cta]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const href = btn.getAttribute("data-cta");
      if (!href) return;
      if (href.startsWith("#")) document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
      else window.open(href, "_blank");
    });
  });

  // Dots
  dots.innerHTML = "";
  State.banners.forEach((_, i) => {
    const d = document.createElement("button");
    if (i === 0) d.classList.add("active");
    d.addEventListener("click", () => setBanner(i));
    dots.appendChild(d);
  });

  if (bannerTimer) clearInterval(bannerTimer);
  if (State.banners.length > 1) {
    bannerTimer = setInterval(() => setBanner((bannerActive + 1) % State.banners.length), 6000);
  }
}
function setBanner(i) {
  const slides = document.querySelectorAll(".banner-slide");
  const dots = document.querySelectorAll("#banner-dots button");
  slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
  dots.forEach((d, idx) => d.classList.toggle("active", idx === i));
  bannerActive = i;
}

// ============== Categories ==============
async function loadCategories() {
  try {
    State.categories = await API.get("/categories");
    renderCategories();
    renderFilters();
  } catch { /* */ }
}
function renderCategories() {
  const grid = document.getElementById("cat-grid");
  if (!grid) return;
  grid.innerHTML = State.categories.map((c) => `
    <button class="cat-card" data-cat="${c.slug}">
      ${c.image_url ? `<img src="${API.resolveImage(c.image_url)}" alt="" onerror="this.src='images/placeholder.jpg'"/>` : `<img src="images/placeholder.jpg" alt=""/>`}
      <div class="overlay"></div>
      <div class="name">${Lang.isRTL() ? c.name_ar : c.name_en}</div>
    </button>
  `).join("");
  grid.querySelectorAll("[data-cat]").forEach((b) => {
    b.addEventListener("click", () => {
      State.selectedCategory = b.getAttribute("data-cat");
      renderFilters(); renderProducts();
      setTimeout(() => document.getElementById("all-products").scrollIntoView({ behavior: "smooth" }), 80);
    });
  });
}

function renderFilters() {
  const wrap = document.getElementById("filters");
  if (!wrap) return;
  const t = Lang.t();
  wrap.innerHTML = "";
  const all = document.createElement("button");
  all.className = "filter-btn" + (!State.selectedCategory ? " active" : "");
  all.textContent = t.sec.filter_all;
  all.addEventListener("click", () => { State.selectedCategory = null; renderFilters(); renderProducts(); });
  wrap.appendChild(all);
  State.categories.forEach((c) => {
    const b = document.createElement("button");
    b.className = "filter-btn" + (State.selectedCategory === c.slug ? " active" : "");
    b.textContent = Lang.isRTL() ? c.name_ar : c.name_en;
    b.addEventListener("click", () => { State.selectedCategory = c.slug; renderFilters(); renderProducts(); });
    wrap.appendChild(b);
  });
}

// ============== Products ==============
async function loadProducts() {
  try {
    State.products = await API.get("/products");
    renderProducts();
    renderBestSellers();
  } catch { /* */ }
}

function productCardHTML(p) {
  const t = Lang.t();
  const name = Lang.isRTL() ? p.name_ar : p.name_en;
  const disabled = !p.in_stock ? "disabled" : "";
  return `
    <div class="product" data-pid="${p.id}">
      <div class="product-img">
        <img src="${API.resolveImage(p.image_url)}" alt="${escapeHtml(name)}" loading="lazy" onerror="this.src='images/placeholder.jpg'"/>
        ${p.featured ? `<div class="product-badge">${t.product.featured}</div>` : ""}
        ${!p.in_stock ? `<div class="product-oos">${t.product.oos}</div>` : ""}
      </div>
      <div class="product-body">
        <h3 class="product-name">${escapeHtml(name)}</h3>
        <div class="product-foot">
          <div>
            <div class="price-label">${t.product.kd}</div>
            <div class="price-value">${Number(p.price).toFixed(3)}</div>
          </div>
          <button class="add-btn" data-add="${p.id}" ${disabled} aria-label="${t.product.add}">+</button>
        </div>
      </div>
    </div>
  `;
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  const noRes = document.getElementById("no-results");
  if (!grid) return;
  let list = State.products;
  if (State.selectedCategory) list = list.filter((p) => p.category === State.selectedCategory);
  if (State.search.trim()) {
    const s = State.search.toLowerCase();
    list = list.filter((p) =>
      p.name_ar.toLowerCase().includes(s) ||
      p.name_en.toLowerCase().includes(s) ||
      (p.description_ar||"").toLowerCase().includes(s) ||
      (p.description_en||"").toLowerCase().includes(s)
    );
  }
  grid.innerHTML = list.map(productCardHTML).join("");
  if (list.length === 0) { noRes.style.display = "block"; noRes.textContent = Lang.t().sec.no_results; }
  else noRes.style.display = "none";

  grid.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => addToCart(b.getAttribute("data-add"))));
}

function renderBestSellers() {
  const grid = document.getElementById("bestsellers-grid");
  if (!grid) return;
  const list = State.products.filter((p) => p.featured);
  if (list.length === 0) { document.getElementById("bestsellers").style.display = "none"; return; }
  grid.innerHTML = list.map(productCardHTML).join("");
  grid.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => addToCart(b.getAttribute("data-add"))));
}

// ============== Cart ==============
function saveCart() { localStorage.setItem("alrayan_cart", JSON.stringify(State.cart)); }
function cartTotal() { return State.cart.reduce((s, i) => s + i.price * i.qty, 0); }
function cartCount() { return State.cart.reduce((s, i) => s + i.qty, 0); }

function addToCart(pid) {
  const p = State.products.find((x) => x.id === pid);
  if (!p) return;
  const ex = State.cart.find((x) => x.id === p.id);
  if (ex) ex.qty += 1;
  else State.cart.push({ id: p.id, name_ar: p.name_ar, name_en: p.name_en, price: Number(p.price), image_url: p.image_url, qty: 1 });
  saveCart(); renderCart(); openCart();
  toast(Lang.t().product.added, "success");
}
function removeFromCart(id) { State.cart = State.cart.filter((i) => i.id !== id); saveCart(); renderCart(); }
function setQty(id, q) {
  if (q <= 0) return removeFromCart(id);
  const it = State.cart.find((x) => x.id === id); if (!it) return;
  it.qty = q; saveCart(); renderCart();
}
function openCart() { document.getElementById("cart-drawer").classList.add("open"); document.getElementById("cart-overlay").classList.add("open"); }
function closeCart() { document.getElementById("cart-drawer").classList.remove("open"); document.getElementById("cart-overlay").classList.remove("open"); }

function renderCart() {
  const t = Lang.t();
  const items = document.getElementById("cart-items");
  const empty = document.getElementById("cart-empty");
  const foot = document.getElementById("cart-foot");
  const countEl = document.getElementById("cart-count");
  const totalEl = document.getElementById("cart-total");

  // counter
  const c = cartCount();
  if (c > 0) { countEl.style.display = "flex"; countEl.textContent = c; }
  else countEl.style.display = "none";

  if (State.cart.length === 0) {
    items.innerHTML = "";
    items.appendChild(empty);
    empty.style.display = "block";
    foot.style.display = "none";
    return;
  }
  empty.style.display = "none";
  foot.style.display = "block";
  totalEl.textContent = `${cartTotal().toFixed(3)} ${t.product.kd}`;

  items.innerHTML = State.cart.map((i) => `
    <div class="cart-item">
      <div class="thumb"><img src="${API.resolveImage(i.image_url)}" alt="" onerror="this.src='images/placeholder.jpg'"/></div>
      <div class="info">
        <div class="name">${escapeHtml(Lang.isRTL() ? i.name_ar : i.name_en)}</div>
        <div class="price">${(i.price * i.qty).toFixed(3)} ${t.product.kd}</div>
        <div class="qty-row">
          <button class="qty-btn" data-minus="${i.id}">−</button>
          <span class="qty-val">${i.qty}</span>
          <button class="qty-btn" data-plus="${i.id}">+</button>
          <button class="cart-remove" data-remove="${i.id}">🗑</button>
        </div>
      </div>
    </div>
  `).join("");

  items.querySelectorAll("[data-minus]").forEach((b) => b.addEventListener("click", () => setQty(b.getAttribute("data-minus"), (State.cart.find(x=>x.id===b.getAttribute("data-minus"))?.qty||0) - 1)));
  items.querySelectorAll("[data-plus]").forEach((b) => b.addEventListener("click", () => setQty(b.getAttribute("data-plus"), (State.cart.find(x=>x.id===b.getAttribute("data-plus"))?.qty||0) + 1)));
  items.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () => removeFromCart(b.getAttribute("data-remove"))));
}

async function checkout() {
  if (State.cart.length === 0) return;
  const t = Lang.t();
  const items = State.cart.map((i) => ({ product_id: i.id, name_ar: i.name_ar, name_en: i.name_en, price: Number(i.price), qty: i.qty }));
  const total = cartTotal();

  // Save order (fire-and-forget)
  API.post("/orders", { items, total, lang: Lang.current }).catch(() => {});

  // Build WhatsApp message
  const lines = State.cart.map((i) => {
    const name = Lang.isRTL() ? i.name_ar : i.name_en;
    return `• ${name} × ${i.qty} = ${(i.price * i.qty).toFixed(3)} ${t.product.kd}`;
  });
  const msg = `${t.cart.intro}\n\n${lines.join("\n")}\n\n${t.cart.total}: ${total.toFixed(3)} ${t.product.kd}`;
  const url = `https://wa.me/${State.whatsapp}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

// ============== Helpers ==============
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ============== Init ==============
function bindEvents() {
  // Nav scroll
  document.querySelectorAll("[data-scroll]").forEach((b) => b.addEventListener("click", () => {
    document.getElementById(b.getAttribute("data-scroll"))?.scrollIntoView({ behavior: "smooth" });
    document.getElementById("mobile-menu")?.classList.remove("open");
  }));

  // Lang toggle
  document.getElementById("lang-toggle")?.addEventListener("click", () => { Lang.toggle(); applyI18n(); renderAll(); });
  document.getElementById("lang-toggle-mobile")?.addEventListener("click", () => { Lang.toggle(); applyI18n(); renderAll(); });

  // Cart
  document.getElementById("cart-open").addEventListener("click", openCart);
  document.getElementById("cart-close").addEventListener("click", closeCart);
  document.getElementById("cart-overlay").addEventListener("click", closeCart);
  document.getElementById("checkout-btn").addEventListener("click", checkout);

  // Search
  const search = document.getElementById("search-input");
  const clear = document.getElementById("search-clear");
  search.addEventListener("input", (e) => {
    State.search = e.target.value;
    clear.style.display = State.search ? "flex" : "none";
    renderProducts();
  });
  clear.addEventListener("click", () => { State.search = ""; search.value = ""; clear.style.display = "none"; renderProducts(); });

  // Mobile menu
  document.getElementById("menu-toggle").addEventListener("click", () => document.getElementById("mobile-menu").classList.toggle("open"));

  // Banner nav
  document.querySelector(".banner-prev")?.addEventListener("click", () => setBanner((bannerActive - 1 + State.banners.length) % State.banners.length));
  document.querySelector(".banner-next")?.addEventListener("click", () => setBanner((bannerActive + 1) % State.banners.length));

  // Scroll shadow on nav
  window.addEventListener("scroll", () => document.getElementById("nav").classList.toggle("scrolled", window.scrollY > 20));
}

function renderAll() {
  renderBanners();
  renderCategories();
  renderFilters();
  renderProducts();
  renderBestSellers();
  renderCart();
}

(async function init() {
  applyI18n();
  bindEvents();
  renderCart();
  await Promise.all([loadSettings(), loadBanners(), loadCategories(), loadProducts()]);
})();
