// ============================================
// admin.js — Admin dashboard
// ============================================

// Guard
if (!API.token()) { location.replace("login.html"); }

const Admin = {
  tab: "products",
  products: [],
  categories: [],
  banners: [],
  orders: [],
  productSearch: "",
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
    const v = el.getAttribute("data-i18n_text");
    const parts = Object.fromEntries(v.split("|").map((p) => p.split(":").map((s) => s.trim())));
    el.textContent = parts[Lang.current] || "";
  });
  document.querySelectorAll("[data-brand-letter]").forEach((el) => el.textContent = Lang.isRTL() ? "ر" : "R");
  document.getElementById("lang-toggle").innerHTML = "🌐 " + (Lang.isRTL() ? "EN" : "عربي");
  document.getElementById("product-search").placeholder = Lang.isRTL() ? "ابحث..." : "Search...";
  updateDashTitle();
}
function updateDashTitle() {
  const t = Lang.t();
  const map = { products: t.admin.products, banners: t.admin.banners, orders: t.admin.orders };
  document.getElementById("dash-title").textContent = map[Admin.tab];
}

// ============== Tabs ==============
function switchTab(tab) {
  Admin.tab = tab;
  document.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("active", b.getAttribute("data-tab") === tab));
  document.querySelectorAll("[data-pane]").forEach((p) => p.style.display = p.getAttribute("data-pane") === tab ? "" : "none");
  updateDashTitle();
  if (tab === "products") renderProducts();
  if (tab === "banners") renderBanners();
  if (tab === "orders") renderOrders();
}

// ============== Data ==============
async function loadAll() {
  try {
    const [c, p, b, o] = await Promise.all([
      API.get("/categories"),
      API.get("/products"),
      API.get("/banners?active_only=false"),
      API.get("/orders"),
    ]);
    Admin.categories = c; Admin.products = p; Admin.banners = b; Admin.orders = o;
    renderProducts(); renderBanners(); renderOrders();
    document.getElementById("orders-count-badge").textContent = o.length ? `(${o.length})` : "";
  } catch (e) {
    if (e.status === 401) { localStorage.removeItem("alrayan_token"); location.replace("login.html"); }
    toast(e.message || "Error", "error");
  }
}

// ============== Products ==============
function renderProducts() {
  const t = Lang.t();
  const wrap = document.getElementById("products-table-wrap");
  let list = Admin.products;
  if (Admin.productSearch) {
    const s = Admin.productSearch.toLowerCase();
    list = list.filter((p) => p.name_ar.toLowerCase().includes(s) || p.name_en.toLowerCase().includes(s));
  }
  const rows = list.map((p) => {
    const cat = Admin.categories.find((c) => c.slug === p.category);
    const catName = cat ? (Lang.isRTL() ? cat.name_ar : cat.name_en) : p.category;
    const name = Lang.isRTL() ? p.name_ar : p.name_en;
    const alt = Lang.isRTL() ? p.name_en : p.name_ar;
    return `
      <tr>
        <td>
          <div class="row-name">
            <div class="row-img"><img src="${API.resolveImage(p.image_url)}" alt="" onerror="this.src='images/placeholder.jpg'"/></div>
            <div>
              <div>${escapeHtml(name)}</div>
              <div class="alt">${escapeHtml(alt)}</div>
            </div>
          </div>
        </td>
        <td>${escapeHtml(catName)}</td>
        <td><span class="price-value">${Number(p.price).toFixed(3)}</span> <small style="color:var(--color-muted)">${t.product.kd}</small></td>
        <td>
          ${p.featured ? `<span class="pill pill-gold">${t.product.featured}</span>` : ""}
          ${p.in_stock ? `<span class="pill pill-green">${t.admin.in_stock}</span>` : `<span class="pill pill-red">${t.product.oos}</span>`}
        </td>
        <td>
          <div class="row-actions">
            <button class="btn-icon" data-edit-p="${p.id}" aria-label="edit">✎</button>
            <button class="btn-icon danger" data-del-p="${p.id}" aria-label="delete">🗑</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th data-i18n_text="ar:المنتج|en:Product">${Lang.isRTL() ? "المنتج" : "Product"}</th>
          <th>${t.admin.category}</th>
          <th>${t.admin.price}</th>
          <th>${Lang.isRTL() ? "الحالة" : "Status"}</th>
          <th style="text-align:end;">${Lang.isRTL() ? "إجراءات" : "Actions"}</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="5" style="text-align:center; padding:64px 0; color:var(--color-muted);">${t.admin.no_products}</td></tr>`}</tbody>
    </table>
  `;

  wrap.querySelectorAll("[data-edit-p]").forEach((b) => b.addEventListener("click", () => openProductForm(b.getAttribute("data-edit-p"))));
  wrap.querySelectorAll("[data-del-p]").forEach((b) => b.addEventListener("click", () => deleteProduct(b.getAttribute("data-del-p"))));
}

function openProductForm(id) {
  const t = Lang.t();
  const editing = id ? Admin.products.find((p) => p.id === id) : null;
  const f = editing || { name_ar: "", name_en: "", description_ar: "", description_en: "", price: "", image_url: "", category: Admin.categories[0]?.slug || "", featured: false, in_stock: true };

  openModal(editing ? t.admin.edit_product : t.admin.add_product, `
    <form id="p-form" style="padding: 24px;">
      <div class="form-grid-2">
        <div class="form-row"><label>${t.admin.name_ar}</label><input id="f_name_ar" dir="rtl" value="${escapeAttr(f.name_ar)}" required/></div>
        <div class="form-row"><label>${t.admin.name_en}</label><input id="f_name_en" dir="ltr" value="${escapeAttr(f.name_en)}" required/></div>
      </div>
      <div class="form-grid-2">
        <div class="form-row"><label>${t.admin.desc_ar}</label><textarea id="f_desc_ar" dir="rtl">${escapeHtml(f.description_ar || "")}</textarea></div>
        <div class="form-row"><label>${t.admin.desc_en}</label><textarea id="f_desc_en" dir="ltr">${escapeHtml(f.description_en || "")}</textarea></div>
      </div>
      <div class="form-grid-2">
        <div class="form-row"><label>${t.admin.price}</label><input id="f_price" type="number" step="0.001" min="0" value="${escapeAttr(String(f.price))}" required/></div>
        <div class="form-row"><label>${t.admin.category}</label>
          <select id="f_cat" required>
            ${Admin.categories.map(c => `<option value="${c.slug}" ${c.slug === f.category ? "selected" : ""}>${escapeHtml(Lang.isRTL() ? c.name_ar : c.name_en)}</option>`).join("")}
          </select>
        </div>
      </div>
      ${imagePickerHTML("f_image", f.image_url)}
      <div class="checkbox-row form-row">
        <label><input type="checkbox" id="f_feat" ${f.featured ? "checked" : ""}/> ${t.admin.featured}</label>
        <label><input type="checkbox" id="f_stock" ${f.in_stock ? "checked" : ""}/> ${t.admin.in_stock}</label>
      </div>
      <div style="display:flex; gap:12px; padding-top:24px; border-top:1px solid var(--color-border);">
        <button class="btn" type="submit">${t.admin.save}</button>
        <button class="btn btn-outline" type="button" id="p-cancel">${t.admin.cancel}</button>
      </div>
    </form>
  `);

  bindImagePicker("f_image");
  document.getElementById("p-cancel").addEventListener("click", closeModal);
  document.getElementById("p-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      name_ar: document.getElementById("f_name_ar").value.trim(),
      name_en: document.getElementById("f_name_en").value.trim(),
      description_ar: document.getElementById("f_desc_ar").value,
      description_en: document.getElementById("f_desc_en").value,
      price: parseFloat(document.getElementById("f_price").value || 0),
      image_url: document.getElementById("f_image_url").value.trim(),
      category: document.getElementById("f_cat").value,
      featured: document.getElementById("f_feat").checked,
      in_stock: document.getElementById("f_stock").checked,
    };
    try {
      if (editing) await API.put(`/products/${editing.id}`, payload);
      else await API.post("/products", payload);
      toast(Lang.isRTL() ? "تم الحفظ" : "Saved", "success");
      closeModal(); await loadAll();
    } catch (err) { toast(err.message || "Error", "error"); }
  });
}

async function deleteProduct(id) {
  if (!confirm(Lang.t().admin.confirm_delete)) return;
  try { await API.del(`/products/${id}`); toast(Lang.isRTL() ? "تم الحذف" : "Deleted", "success"); await loadAll(); }
  catch (err) { toast(err.message || "Error", "error"); }
}

// ============== Banners ==============
function renderBanners() {
  const t = Lang.t();
  const grid = document.getElementById("banners-grid");
  if (Admin.banners.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--color-muted); padding:64px 0;">${t.admin.no_banners}</div>`;
    return;
  }
  grid.innerHTML = Admin.banners.map((b) => `
    <div class="banner-card">
      <div class="b-img"><img src="${API.resolveImage(b.image_url)}" alt="" onerror="this.src='images/placeholder.jpg'"/></div>
      <div class="b-body">
        <div style="display:flex; justify-content:space-between; align-items:start; gap:8px; margin-bottom:4px;">
          <h3>${escapeHtml(Lang.isRTL() ? b.title_ar : b.title_en)}</h3>
          ${b.active ? `<span class="pill pill-green">${t.admin.active}</span>` : `<span class="pill" style="color:var(--color-muted); border-color:var(--color-border);">—</span>`}
        </div>
        <p class="b-sub">${escapeHtml((Lang.isRTL() ? b.subtitle_ar : b.subtitle_en) || "")}</p>
        <div class="b-acts">
          <button data-edit-b="${b.id}">✎ ${t.admin.edit}</button>
          <button data-del-b="${b.id}">🗑 ${t.admin.delete}</button>
        </div>
      </div>
    </div>
  `).join("");
  grid.querySelectorAll("[data-edit-b]").forEach((b) => b.addEventListener("click", () => openBannerForm(b.getAttribute("data-edit-b"))));
  grid.querySelectorAll("[data-del-b]").forEach((b) => b.addEventListener("click", () => deleteBanner(b.getAttribute("data-del-b"))));
}

function openBannerForm(id) {
  const t = Lang.t();
  const editing = id ? Admin.banners.find((b) => b.id === id) : null;
  const f = editing || { title_ar: "", title_en: "", subtitle_ar: "", subtitle_en: "", image_url: "", cta_label_ar: "", cta_label_en: "", cta_href: "", active: true, order: 0 };

  openModal(editing ? t.admin.edit_banner : t.admin.add_banner, `
    <form id="b-form" style="padding: 24px;">
      <div class="form-grid-2">
        <div class="form-row"><label>${t.admin.title_ar}</label><input id="b_title_ar" dir="rtl" value="${escapeAttr(f.title_ar)}" required/></div>
        <div class="form-row"><label>${t.admin.title_en}</label><input id="b_title_en" dir="ltr" value="${escapeAttr(f.title_en)}" required/></div>
      </div>
      <div class="form-grid-2">
        <div class="form-row"><label>${t.admin.sub_ar}</label><textarea id="b_sub_ar" dir="rtl">${escapeHtml(f.subtitle_ar || "")}</textarea></div>
        <div class="form-row"><label>${t.admin.sub_en}</label><textarea id="b_sub_en" dir="ltr">${escapeHtml(f.subtitle_en || "")}</textarea></div>
      </div>
      <div class="form-grid-2">
        <div class="form-row"><label>${t.admin.cta_ar}</label><input id="b_cta_ar" dir="rtl" value="${escapeAttr(f.cta_label_ar || "")}"/></div>
        <div class="form-row"><label>${t.admin.cta_en}</label><input id="b_cta_en" dir="ltr" value="${escapeAttr(f.cta_label_en || "")}"/></div>
      </div>
      <div class="form-grid-2">
        <div class="form-row"><label>${t.admin.cta_href}</label><input id="b_href" dir="ltr" placeholder="#all-products" value="${escapeAttr(f.cta_href || "")}"/></div>
        <div class="form-row"><label>${t.admin.order}</label><input id="b_order" type="number" value="${escapeAttr(String(f.order || 0))}"/></div>
      </div>
      ${imagePickerHTML("b_image", f.image_url)}
      <div class="checkbox-row form-row">
        <label><input type="checkbox" id="b_active" ${f.active ? "checked" : ""}/> ${t.admin.active}</label>
      </div>
      <div style="display:flex; gap:12px; padding-top:24px; border-top:1px solid var(--color-border);">
        <button class="btn" type="submit">${t.admin.save}</button>
        <button class="btn btn-outline" type="button" id="b-cancel">${t.admin.cancel}</button>
      </div>
    </form>
  `);

  bindImagePicker("b_image");
  document.getElementById("b-cancel").addEventListener("click", closeModal);
  document.getElementById("b-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      title_ar: document.getElementById("b_title_ar").value.trim(),
      title_en: document.getElementById("b_title_en").value.trim(),
      subtitle_ar: document.getElementById("b_sub_ar").value,
      subtitle_en: document.getElementById("b_sub_en").value,
      cta_label_ar: document.getElementById("b_cta_ar").value,
      cta_label_en: document.getElementById("b_cta_en").value,
      cta_href: document.getElementById("b_href").value,
      order: parseInt(document.getElementById("b_order").value || 0, 10),
      image_url: document.getElementById("b_image_url").value.trim(),
      active: document.getElementById("b_active").checked,
    };
    try {
      if (editing) await API.put(`/banners/${editing.id}`, payload);
      else await API.post("/banners", payload);
      toast(Lang.isRTL() ? "تم الحفظ" : "Saved", "success");
      closeModal(); await loadAll();
    } catch (err) { toast(err.message || "Error", "error"); }
  });
}

async function deleteBanner(id) {
  if (!confirm(Lang.t().admin.confirm_delete)) return;
  try { await API.del(`/banners/${id}`); toast(Lang.isRTL() ? "تم الحذف" : "Deleted", "success"); await loadAll(); }
  catch (err) { toast(err.message || "Error", "error"); }
}

// ============== Orders ==============
function renderOrders() {
  const t = Lang.t();
  const stats = document.getElementById("orders-stats");
  const total = Admin.orders.length;
  const pending = Admin.orders.filter((o) => o.status === "pending").length;
  const delivered = Admin.orders.filter((o) => o.status === "delivered").length;
  const revenue = Admin.orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);

  stats.innerHTML = `
    <div class="stat-card"><div class="stat-label">${t.admin.stat_total}</div><div class="stat-value">${total}</div></div>
    <div class="stat-card"><div class="stat-label">${t.admin.stat_pending}</div><div class="stat-value">${pending}</div></div>
    <div class="stat-card"><div class="stat-label">${t.admin.stat_delivered}</div><div class="stat-value">${delivered}</div></div>
    <div class="stat-card highlight"><div class="stat-label">${t.admin.stat_revenue}</div><div class="stat-value">${revenue.toFixed(3)} ${t.product.kd}</div></div>
  `;

  const wrap = document.getElementById("orders-table-wrap");
  if (Admin.orders.length === 0) {
    wrap.innerHTML = `<div style="text-align:center; padding:64px; color:var(--color-muted);">${t.admin.no_orders}</div>`;
    return;
  }
  const rows = Admin.orders.map((o) => {
    const itemsHTML = (o.items || []).map((it) => `
      <li><span>${escapeHtml(Lang.isRTL() ? it.name_ar : it.name_en)}</span>
      <span style="color:var(--color-muted); margin-inline-start:8px;">× ${it.qty}</span></li>
    `).join("");
    const date = new Date(o.created_at).toLocaleString(Lang.isRTL() ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short" });
    const statusOpts = ["pending", "confirmed", "delivered", "cancelled"].map((s) =>
      `<option value="${s}" ${o.status === s ? "selected" : ""}>${t.admin["status_" + s]}</option>`
    ).join("");
    return `
      <tr>
        <td style="font-size:12px; color:var(--color-text-2);">${date}</td>
        <td><ul style="list-style:none; padding:0; margin:0; font-size:12px;">${itemsHTML}</ul></td>
        <td><span class="price-value">${Number(o.total).toFixed(3)}</span> <small style="color:var(--color-muted)">${t.product.kd}</small></td>
        <td><select class="status-select st-${o.status}" data-order="${o.id}">${statusOpts}</select></td>
      </tr>
    `;
  }).join("");

  wrap.innerHTML = `
    <table>
      <thead><tr>
        <th>${t.admin.order_date}</th><th>${t.admin.order_items}</th><th>${t.admin.order_total}</th><th>${t.admin.order_status}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  wrap.querySelectorAll("[data-order]").forEach((sel) => sel.addEventListener("change", async (e) => {
    const id = sel.getAttribute("data-order");
    const status = e.target.value;
    try { await API.patch(`/orders/${id}?status=${status}`); toast(Lang.isRTL() ? "تم التحديث" : "Updated", "success"); await loadAll(); }
    catch (err) { toast(err.message || "Error", "error"); }
  }));
}

// ============== Modal & Image Picker ==============
function openModal(title, html) {
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = html;
  document.getElementById("modal-drawer").classList.add("open");
  document.getElementById("modal-overlay").classList.add("open");
}
function closeModal() {
  document.getElementById("modal-drawer").classList.remove("open");
  document.getElementById("modal-overlay").classList.remove("open");
}

function imagePickerHTML(idPrefix, value) {
  const t = Lang.t();
  return `
    <div class="form-row">
      <label>${t.admin.image_url}</label>
      <input type="file" id="${idPrefix}_file" accept="image/jpeg,image/png,image/webp,image/gif" style="display:none"/>
      <div class="upload-area" id="${idPrefix}_upload_btn">
        <span id="${idPrefix}_upload_label">⬆ ${t.admin.upload}</span>
      </div>
      <div class="divider-or">${t.admin.or}</div>
      <input type="text" id="${idPrefix}_url" dir="ltr" placeholder="https://..." value="${escapeAttr(value || "")}"/>
      <div class="img-preview" style="${value ? "" : "display:none"}" id="${idPrefix}_preview"><img id="${idPrefix}_preview_img" src="${value ? API.resolveImage(value) : ""}" alt=""/></div>
    </div>
  `;
}
function bindImagePicker(idPrefix) {
  const fileInput = document.getElementById(`${idPrefix}_file`);
  const btn = document.getElementById(`${idPrefix}_upload_btn`);
  const label = document.getElementById(`${idPrefix}_upload_label`);
  const urlInput = document.getElementById(`${idPrefix}_url`);
  const preview = document.getElementById(`${idPrefix}_preview`);
  const previewImg = document.getElementById(`${idPrefix}_preview_img`);

  btn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    label.textContent = Lang.t().admin.uploading;
    btn.style.pointerEvents = "none";
    try {
      const res = await API.upload(file);
      urlInput.value = res.url;
      previewImg.src = res.url;
      preview.style.display = "block";
      toast(Lang.isRTL() ? "تم رفع الصورة" : "Image uploaded", "success");
    } catch (err) { toast(err.message || "Upload failed", "error"); }
    finally {
      label.innerHTML = "⬆ " + Lang.t().admin.upload;
      btn.style.pointerEvents = "auto";
      fileInput.value = "";
    }
  });
  urlInput.addEventListener("input", () => {
    const v = urlInput.value.trim();
    if (v) { previewImg.src = API.resolveImage(v); preview.style.display = "block"; }
    else preview.style.display = "none";
  });
}

// ============== Helpers ==============
function escapeHtml(s) { return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function escapeAttr(s) { return escapeHtml(s); }

// ============== Init ==============
document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => switchTab(b.getAttribute("data-tab"))));
document.getElementById("logout-btn").addEventListener("click", () => { localStorage.removeItem("alrayan_token"); location.replace("login.html"); });
document.getElementById("lang-toggle").addEventListener("click", () => { Lang.toggle(); applyI18n(); renderProducts(); renderBanners(); renderOrders(); });
document.getElementById("product-search").addEventListener("input", (e) => { Admin.productSearch = e.target.value; renderProducts(); });
document.getElementById("add-product-btn").addEventListener("click", () => openProductForm(null));
document.getElementById("add-banner-btn").addEventListener("click", () => openBannerForm(null));
document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal-overlay").addEventListener("click", closeModal);

(async function init() {
  applyI18n();
  // Verify token
  try {
    const me = await API.get("/auth/me");
    document.getElementById("sidebar-user").textContent = me.username;
  } catch { localStorage.removeItem("alrayan_token"); return location.replace("login.html"); }
  await loadAll();
})();
