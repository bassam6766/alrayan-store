# 🛍️ متجر الريان — Al-Rayan Store

حزمة كاملة لمتجر إلكتروني بتصميم ذهبي وأبيض، ثنائي اللغة (عربي/إنجليزي):
- **الباك إند**: Node.js + Express + MySQL
- **الواجهة**: HTML + CSS + JavaScript عادي (بدون أي framework)
- **الميزات**: عرض منتجات، سلة، طلب عبر واتساب، أدمن، رفع صور، إدارة بانرات، سجل طلبات

---

## 📁 محتوى الحزمة

```
alrayan-package/
├── backend/                ← الباك إند Node.js
│   ├── server.js           ← السيرفر الرئيسي
│   ├── schema.sql          ← هيكل قاعدة البيانات
│   ├── package.json
│   ├── .env.example        ← انسخه إلى .env وعدّل القيم
│   ├── scripts/
│   │   └── init-db.js      ← ينشئ الجداول + الأدمن + بيانات تجريبية
│   └── uploads/            ← الصور المرفوعة (يُنشأ تلقائياً)
│
└── frontend/               ← الواجهة (HTML/CSS/JS)
    ├── index.html          ← الصفحة الرئيسية للمتجر
    ├── login.html          ← دخول الأدمن
    ├── admin.html          ← لوحة التحكم
    ├── css/styles.css
    ├── js/
    │   ├── config.js       ← ⚠️ عدّل API_BASE_URL هنا
    │   ├── lang.js         ← ترجمات + API helper
    │   ├── app.js          ← منطق الواجهة
    │   ├── login.js
    │   └── admin.js
    └── images/             ← الصور الثابتة (logo, hero, placeholder)
```

---

## 🚀 التشغيل المحلي (Local)

### 1️⃣ متطلبات
- **Node.js** ≥ 18 ([تحميل](https://nodejs.org))
- **MySQL** ≥ 5.7 (أو **MariaDB** ≥ 10.3)

### 2️⃣ إعداد الباك إند

```bash
cd backend
cp .env.example .env       # ثم افتح .env وعدّل القيم (خصوصاً DB_PASSWORD)
npm install                 # تثبيت الحزم
npm run init-db             # إنشاء قاعدة البيانات + الأدمن + بيانات تجريبية
npm start                   # تشغيل السيرفر
```

سيعمل على: `http://localhost:8001`  
تحقق: افتح `http://localhost:8001/api/` يجب أن يعرض `{"message":"Al-Rayan Store API"}`

### 3️⃣ إعداد الواجهة

افتح ملف `frontend/js/config.js` وتأكد أن `API_BASE_URL` يشير للسيرفر:

```js
window.APP_CONFIG = {
  API_BASE_URL: "http://localhost:8001",
};
```

ثم افتح `frontend/index.html` في المتصفح:
- **الأبسط**: انقر مزدوج على الملف (بعض المتصفحات لن تسمح بالـ fetch — استخدم سيرفر بسيط)
- **الموصى به**: شغّل سيرفر محلي:

```bash
cd frontend
python3 -m http.server 5500
# أو إذا تملك Node:
npx serve .
```

ثم افتح: `http://localhost:5500`

### 4️⃣ تسجيل دخول الأدمن

- الرابط: `http://localhost:5500/login.html`
- **اسم المستخدم**: `admin`
- **كلمة المرور**: `alrayan2026`

(غيّرها من `backend/.env` بعد التشغيل الأول، ثم أعد تشغيل `npm run init-db`)

---

## 🌐 النشر على الاستضافة

### الخيار 1: استضافة مشتركة (cPanel + Node.js + MySQL)
أغلب شركات الاستضافة العربية مثل Hostinger و BlueHost تدعم هذا.

1. **MySQL**:
   - أنشئ قاعدة بيانات جديدة من cPanel ← MySQL Databases
   - أنشئ مستخدم وامنحه صلاحيات على القاعدة
   - استورد ملف `backend/schema.sql` من phpMyAdmin

2. **Node.js Application** (من cPanel):
   - ارفع مجلد `backend/` بالكامل
   - اختر "Setup Node.js App"
   - Startup file: `server.js`
   - Node version: 18 أو أحدث
   - أضف متغيرات البيئة (Environment Variables): انسخ كل المتغيرات من `.env.example`
   - شغّل: `npm install` ثم `npm run init-db` ثم Start

3. **الواجهة**:
   - ارفع محتوى `frontend/` إلى `public_html/`
   - **مهم**: عدّل `frontend/js/config.js` ليشير لرابط الباك إند الفعلي:
     ```js
     API_BASE_URL: "https://api.your-domain.com"
     ```
   - في `backend/.env`، اضبط:
     ```
     CORS_ORIGIN=https://your-domain.com
     PUBLIC_BASE_URL=https://api.your-domain.com
     ```

### الخيار 2: VPS (DigitalOcean / Linode / Hetzner)

```bash
# على السيرفر
sudo apt update && sudo apt install -y mysql-server nodejs npm
sudo mysql_secure_installation

# ادفع المشروع
git clone <your-repo> /opt/alrayan
cd /opt/alrayan/backend
cp .env.example .env  # عدّل القيم
npm install
npm run init-db

# شغّل دائماً مع PM2
sudo npm install -g pm2
pm2 start server.js --name alrayan
pm2 startup && pm2 save

# Nginx reverse proxy للواجهة + الـ API
sudo apt install -y nginx
# (راجع nginx.conf.example في حال احتجت)
```

### الخيار 3: Railway / Render / Fly.io
- ارفع مجلد `backend/` كـ Service
- ربط قاعدة بيانات MySQL مُدارة (PlanetScale / Railway MySQL)
- ارفع `frontend/` على Netlify / Vercel / GitHub Pages
- **لا تنسَ تحديث `API_BASE_URL` في `config.js`**

---

## 🗄️ هيكل قاعدة البيانات

5 جداول رئيسية:

| الجدول | الغرض |
|--------|--------|
| `admins` | حسابات الإدارة (username + bcrypt hash) |
| `categories` | الأقسام (slug, name_ar, name_en, image_url) |
| `products` | المنتجات (الاسم، الوصف، السعر، الصورة، القسم، مميز/متوفر) |
| `banners` | بانرات الصفحة الرئيسية مع CTA |
| `orders` | الطلبات المسجلة (items كـ JSON، total، status) |

راجع `backend/schema.sql` للتفاصيل.

---

## 🔌 API Endpoints

كل المسارات تبدأ بـ `/api/`:

| Method | Path | Auth | الوصف |
|--------|------|------|--------|
| GET    | `/api/` | ✗ | فحص صحة |
| GET    | `/api/settings` | ✗ | إعدادات (رقم واتساب، اسم المتجر) |
| POST   | `/api/auth/login` | ✗ | تسجيل دخول → يرجع JWT |
| GET    | `/api/auth/me` | ✓ | بيانات الأدمن الحالي |
| GET    | `/api/categories` | ✗ | الأقسام |
| GET    | `/api/products?category=&featured=` | ✗ | المنتجات (مع فلاتر) |
| GET    | `/api/products/:id` | ✗ | منتج واحد |
| POST   | `/api/products` | ✓ | إنشاء منتج |
| PUT    | `/api/products/:id` | ✓ | تعديل منتج |
| DELETE | `/api/products/:id` | ✓ | حذف |
| GET    | `/api/banners?active_only=true` | ✗ | البانرات |
| POST   | `/api/banners` | ✓ | إنشاء بانر |
| PUT    | `/api/banners/:id` | ✓ | تعديل |
| DELETE | `/api/banners/:id` | ✓ | حذف |
| POST   | `/api/orders` | ✗ | تسجيل طلب جديد |
| GET    | `/api/orders` | ✓ | كل الطلبات |
| PATCH  | `/api/orders/:id?status=...` | ✓ | تحديث حالة طلب |
| POST   | `/api/upload` (multipart) | ✓ | رفع صورة (max 5MB) |
| GET    | `/uploads/:filename` | ✗ | عرض الصورة المرفوعة |

**صيغة التوكن**: Header `Authorization: Bearer <jwt>`

---

## 🎨 تخصيص التصميم

- **اللون الذهبي الرئيسي**: عدّل `--color-gold` في `frontend/css/styles.css` (السطر الأول من `:root`)
- **اسم المتجر**: عدّل في `frontend/js/lang.js` (`brand`)
- **رقم واتساب**: عدّل `WHATSAPP_NUMBER` في `backend/.env`
- **الترجمات**: عدّل `frontend/js/lang.js` (كل النصوص في الكائن `TRANSLATIONS`)
- **الخطوط**: مستوردة من Google Fonts في أعلى `styles.css`

---

## 🔒 إعدادات الأمان (إنتاج)

قبل النشر تأكد من:

1. ✅ **JWT_SECRET**: غيّره إلى string عشوائي طويل (مثلاً [generate-secret.now.sh](https://generate-secret.now.sh/32))
2. ✅ **ADMIN_PASSWORD**: غيّر كلمة المرور الافتراضية
3. ✅ **CORS_ORIGIN**: ضع نطاق موقعك بدل `*`
4. ✅ **HTTPS**: استخدم Let's Encrypt على Nginx أو Cloudflare
5. ✅ **MySQL**: مستخدم بصلاحيات محدودة على القاعدة فقط
6. ✅ **Backup**: نسخ احتياطي يومي لقاعدة البيانات

---

## 🛠️ استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| `ECONNREFUSED` عند `init-db` | تأكد أن MySQL يعمل: `sudo systemctl start mysql` |
| `Access denied for user` | راجع `DB_USER` و `DB_PASSWORD` في `.env` |
| الواجهة لا تتصل بالـ API | افتح Console (F12) — تحقق من `API_BASE_URL` و `CORS_ORIGIN` |
| `CORS error` | في `backend/.env` اضبط `CORS_ORIGIN` لنطاق الواجهة |
| الصور المرفوعة لا تظهر | اضبط `PUBLIC_BASE_URL` في `backend/.env` لرابط API الكامل |
| 401 على CRUD | انتهت صلاحية التوكن — سجّل دخول مرة أخرى |

---

## 📝 تعديلات شائعة قد تحتاجها

### إضافة قسم جديد
عدّل `backend/scripts/init-db.js` ← مصفوفة `cats`، ثم شغّل `npm run init-db` مرة أخرى (سيتخطى الجداول الموجودة، لكن لإضافة قسم استخدم phpMyAdmin مباشرة أو SQL).

### تغيير العملة (بدل د.ك)
- `frontend/js/lang.js`: غيّر `product.kd` في AR + EN
- `frontend/css/styles.css`: لا تغييرات

### دعم PostgreSQL بدل MySQL
استبدل `mysql2` بـ `pg` في `package.json`، وعدّل استدعاءات `pool.execute` في `server.js` لتستخدم placeholders `$1, $2` بدل `?`.

---

## 📞 الدعم

- المشروع بدون رخصة تقييد — استخدمه و عدّله كما تشاء.
- صنع بـ ♥ لمتجر **الريان**.

---

**نسخة الحزمة**: 1.0.0  
**التاريخ**: فبراير 2026
