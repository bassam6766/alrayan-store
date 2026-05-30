// ============================================
// lang.js — ترجمات + إدارة اللغة + API helper
// ============================================
const TRANSLATIONS = {
  ar: {
    brand: "الريان", tagline: "أدوات بلاستيكية ومنظفات",
    nav: { home: "الرئيسية", categories: "الأقسام", bestsellers: "الأكثر مبيعاً", contact: "اتصل بنا", admin: "الإدارة" },
    hero: {
      eyebrow: "متجر الريان للأدوات المنزلية",
      title: "أناقة المنزل تبدأ من التفاصيل",
      subtitle: "اكتشف مجموعتنا المختارة من الأدوات البلاستيكية والمنظفات الفاخرة.",
      cta: "تسوق الآن", cta2: "تعرف علينا",
      delivery: "توصيل في نفس اليوم للطلبات قبل الساعة 6 مساءً",
    },
    sec: {
      categories: "تسوّق حسب القسم", categories_sub: "كل ما يحتاجه منزلك في مكان واحد",
      bestsellers: "الأكثر مبيعاً", bestsellers_sub: "اختيارات عملائنا المفضّلة",
      all: "جميع المنتجات", filter_all: "الكل", search_ph: "ابحث عن منتج...", no_results: "لا توجد نتائج",
    },
    product: { add: "أضف للسلة", added: "تمت الإضافة", oos: "غير متوفر", kd: "د.ك", featured: "مميز" },
    cart: {
      title: "سلة المشتريات", empty: "سلتك فارغة", empty_sub: "أضف منتجات لتبدأ",
      subtotal: "المجموع", checkout: "إتمام الطلب عبر واتساب",
      intro: "السلام عليكم، أود طلب المنتجات التالية من متجر الريان:", total: "الإجمالي",
    },
    footer: {
      about: "متجر الريان — وجهتك المفضّلة للأدوات البلاستيكية والمنظفات.",
      links: "روابط سريعة", contact: "تواصل معنا", rights: "جميع الحقوق محفوظة © متجر الريان",
      hours: "السبت - الخميس: ٩ صباحاً - ١٠ مساءً",
    },
    admin: {
      login_title: "تسجيل دخول الإدارة", username: "اسم المستخدم", password: "كلمة المرور",
      login: "تسجيل الدخول", logout: "تسجيل الخروج", invalid: "بيانات الدخول غير صحيحة",
      dashboard: "لوحة التحكم",
      products: "المنتجات", banners: "البانرات", orders: "الطلبات",
      add_product: "إضافة منتج", edit_product: "تعديل منتج",
      add_banner: "إضافة بانر", edit_banner: "تعديل بانر",
      name_ar: "الاسم بالعربية", name_en: "الاسم بالإنجليزية",
      desc_ar: "الوصف بالعربية", desc_en: "الوصف بالإنجليزية",
      title_ar: "العنوان بالعربية", title_en: "العنوان بالإنجليزية",
      sub_ar: "النص الفرعي بالعربية", sub_en: "النص الفرعي بالإنجليزية",
      cta_ar: "نص الزر بالعربية", cta_en: "نص الزر بالإنجليزية",
      cta_href: "رابط الزر", order: "ترتيب", active: "نشط",
      price: "السعر (د.ك)", category: "القسم", image_url: "رابط الصورة",
      featured: "مميز", in_stock: "متوفر",
      save: "حفظ", cancel: "إلغاء", delete: "حذف", edit: "تعديل",
      confirm_delete: "هل أنت متأكد من الحذف؟",
      no_products: "لا توجد منتجات بعد", no_banners: "لا توجد بانرات", no_orders: "لا توجد طلبات",
      upload: "رفع صورة", uploading: "جاري الرفع...", or: "أو",
      order_status: "الحالة", order_total: "الإجمالي", order_items: "العناصر", order_date: "التاريخ",
      status_pending: "قيد المعالجة", status_confirmed: "مؤكد",
      status_delivered: "تم التسليم", status_cancelled: "ملغي",
      stat_total: "إجمالي الطلبات", stat_pending: "قيد المعالجة", stat_delivered: "تم التسليم", stat_revenue: "الإيرادات",
    },
  },
  en: {
    brand: "Al-Rayan", tagline: "Premium plasticware & detergents",
    nav: { home: "Home", categories: "Categories", bestsellers: "Best Sellers", contact: "Contact", admin: "Admin" },
    hero: {
      eyebrow: "Al-Rayan Home Essentials",
      title: "Where Everyday Becomes Elegant",
      subtitle: "Discover our curated collection of premium plasticware and refined detergents.",
      cta: "Shop Now", cta2: "About Us",
      delivery: "Same-day delivery for orders before 6 PM",
    },
    sec: {
      categories: "Shop by Category", categories_sub: "Everything your home needs",
      bestsellers: "Best Sellers", bestsellers_sub: "Our customers' favorite picks",
      all: "All Products", filter_all: "All", search_ph: "Search products...", no_results: "No results",
    },
    product: { add: "Add to Cart", added: "Added", oos: "Out of Stock", kd: "KD", featured: "Featured" },
    cart: {
      title: "Shopping Cart", empty: "Your cart is empty", empty_sub: "Add items to begin",
      subtotal: "Subtotal", checkout: "Checkout via WhatsApp",
      intro: "Hello, I'd like to order the following items from Al-Rayan:", total: "Total",
    },
    footer: {
      about: "Al-Rayan — your trusted destination for premium plasticware and detergents.",
      links: "Quick Links", contact: "Contact Us", rights: "All rights reserved © Al-Rayan",
      hours: "Sat - Thu: 9 AM - 10 PM",
    },
    admin: {
      login_title: "Admin Login", username: "Username", password: "Password",
      login: "Sign In", logout: "Logout", invalid: "Invalid credentials",
      dashboard: "Dashboard",
      products: "Products", banners: "Banners", orders: "Orders",
      add_product: "Add Product", edit_product: "Edit Product",
      add_banner: "Add Banner", edit_banner: "Edit Banner",
      name_ar: "Name (AR)", name_en: "Name (EN)",
      desc_ar: "Description (AR)", desc_en: "Description (EN)",
      title_ar: "Title (AR)", title_en: "Title (EN)",
      sub_ar: "Subtitle (AR)", sub_en: "Subtitle (EN)",
      cta_ar: "Button Label (AR)", cta_en: "Button Label (EN)",
      cta_href: "Button Link", order: "Order", active: "Active",
      price: "Price (KD)", category: "Category", image_url: "Image URL",
      featured: "Featured", in_stock: "In Stock",
      save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit",
      confirm_delete: "Are you sure to delete?",
      no_products: "No products yet", no_banners: "No banners yet", no_orders: "No orders yet",
      upload: "Upload Image", uploading: "Uploading...", or: "or",
      order_status: "Status", order_total: "Total", order_items: "Items", order_date: "Date",
      status_pending: "Pending", status_confirmed: "Confirmed",
      status_delivered: "Delivered", status_cancelled: "Cancelled",
      stat_total: "Total Orders", stat_pending: "Pending", stat_delivered: "Delivered", stat_revenue: "Revenue",
    },
  },
};

const Lang = {
  current: localStorage.getItem("alrayan_lang") || "ar",
  t() { return TRANSLATIONS[this.current]; },
  isRTL() { return this.current === "ar"; },
  set(l) {
    this.current = l;
    localStorage.setItem("alrayan_lang", l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  },
  toggle() { this.set(this.current === "ar" ? "en" : "ar"); },
  init() { this.set(this.current); },
};

// ============== API helper ==============
const API = {
  base() { return window.APP_CONFIG.API_BASE_URL.replace(/\/$/, ""); },
  token() { return localStorage.getItem("alrayan_token"); },
  resolveImage(url) {
    if (!url) return "images/placeholder.jpg";
    if (/^https?:\/\//.test(url) || url.startsWith("data:")) return url;
    if (url.startsWith("/uploads")) return this.base() + url;
    return url;
  },
  async req(path, opts = {}) {
    const headers = opts.headers || {};
    const token = this.token();
    if (token) headers["Authorization"] = "Bearer " + token;
    if (opts.body && !(opts.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(opts.body);
    }
    const r = await fetch(this.base() + "/api" + path, { ...opts, headers });
    if (!r.ok) {
      const text = await r.text();
      let detail = text;
      try { detail = JSON.parse(text).detail || text; } catch {}
      const err = new Error(detail || r.statusText);
      err.status = r.status;
      throw err;
    }
    if (r.status === 204) return null;
    const ct = r.headers.get("content-type") || "";
    return ct.includes("application/json") ? r.json() : r.text();
  },
  get(p) { return this.req(p); },
  post(p, body) { return this.req(p, { method: "POST", body }); },
  put(p, body) { return this.req(p, { method: "PUT", body }); },
  patch(p, body) { return this.req(p, { method: "PATCH", body }); },
  del(p) { return this.req(p, { method: "DELETE" }); },
  upload(file) {
    const fd = new FormData(); fd.append("file", file);
    return this.req("/upload", { method: "POST", body: fd });
  },
};

// ============== Toast ==============
function toast(msg, type = "info") {
  let host = document.getElementById("toast-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "toast-host";
    document.body.appendChild(host);
  }
  const el = document.createElement("div");
  el.className = "toast toast-" + type;
  el.textContent = msg;
  host.appendChild(el);
  setTimeout(() => { el.classList.add("toast-out"); setTimeout(() => el.remove(), 400); }, 2400);
}

// Initial RTL/LTR setup
Lang.init();
