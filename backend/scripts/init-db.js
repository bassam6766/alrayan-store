/**
 * scripts/init-db.js
 * - ينشئ قاعدة البيانات والجداول
 * - يُنشئ حساب الأدمن من .env
 * - يُدخل بيانات تجريبية (أقسام + منتجات + بانرات)
 *
 * تشغيل: node scripts/init-db.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'alrayan_store',
  ADMIN_USERNAME = 'admin',
  ADMIN_PASSWORD = 'alrayan2026',
} = process.env;

async function run() {
  // 1) اتصال بدون قاعدة (لإنشاءها إن لم توجد)
  const root = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf-8');
  console.log('▶ تطبيق schema.sql ...');
  await root.query(schema);
  await root.end();
  console.log('✓ Schema applied');

  // 2) اتصال بالقاعدة لإدراج البيانات
  const db = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  // أدمن
  const [admins] = await db.execute('SELECT id FROM admins WHERE username = ?', [ADMIN_USERNAME]);
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  if (admins.length === 0) {
    await db.execute('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [ADMIN_USERNAME, hash]);
    console.log(`✓ أدمن جديد: ${ADMIN_USERNAME}`);
  } else {
    await db.execute('UPDATE admins SET password_hash = ? WHERE username = ?', [hash, ADMIN_USERNAME]);
    console.log(`✓ تحديث كلمة مرور الأدمن: ${ADMIN_USERNAME}`);
  }

  // أقسام
  const [catCount] = await db.execute('SELECT COUNT(*) AS c FROM categories');
  if (catCount[0].c === 0) {
    const cats = [
      ['detergents', 'المنظفات والمعطرات', 'Detergents & Fresheners'],
      ['plasticware', 'الأدوات البلاستيكية', 'Plasticware'],
      ['paper', 'الورقيات والمناديل', 'Paper Products'],
      ['tableware', 'الصحون ومستلزمات المائدة', 'Tableware'],
      ['storage', 'تغليف وحفظ الأطعمة', 'Food Storage & Wrapping'],
      ['protection', 'منتجات الوقاية', 'Protection Products'],
    ];
    for (const [slug, ar, en] of cats) {
      await db.execute(
        'INSERT INTO categories (id, slug, name_ar, name_en, image_url) VALUES (?, ?, ?, ?, ?)',
        [uuid(), slug, ar, en, '']
      );
    }
    console.log(`✓ ${cats.length} أقسام`);
  }

  // منتجات
  const [pCount] = await db.execute('SELECT COUNT(*) AS c FROM products');
  if (pCount[0].c === 0) {
    const products = [
      ['علب بلاستيكية لحفظ الطعام (طقم 5 قطع)', 'Food Storage Containers (Set of 5)', 3.500, 'plasticware', 1, 1, 'علب بلاستيكية شفافة عالية الجودة', 'Premium clear plastic containers'],
      ['بخاخ منظف متعدد الاستخدامات', 'Multi-Purpose Cleaner Spray', 1.250, 'detergents', 1, 1, 'منظف فعّال لجميع الأسطح', 'Powerful all-surface cleaner'],
      ['مناديل ورقية فاخرة (علبة)', 'Premium Tissue Box', 0.750, 'paper', 1, 1, 'مناديل ناعمة بثلاث طبقات', 'Soft 3-ply premium tissues'],
      ['صحون ورقية بيضاء (50 حبة)', 'White Paper Plates (50 pcs)', 1.500, 'tableware', 0, 1, 'صحون ورقية متينة', 'Durable paper plates'],
      ['أكياس حفظ الطعام (رول)', 'Food Storage Bags (Roll)', 0.900, 'storage', 0, 1, 'أكياس بلاستيكية شفافة', 'Clear plastic bags'],
      ['قفازات فينيل (100 قفاز)', 'Vinyl Gloves (100 pcs)', 2.250, 'protection', 1, 1, 'قفازات فينيل آمنة', 'Safe vinyl gloves'],
      ['منظف أرضيات معطر', 'Scented Floor Cleaner', 1.750, 'detergents', 0, 1, 'منظف بقوة فائقة', 'Powerful floor cleaner'],
      ['ورق ألمنيوم (رول كبير)', 'Aluminum Foil (Large Roll)', 1.100, 'storage', 0, 1, 'ورق ألمنيوم متين', 'Durable aluminum foil'],
    ];
    for (const [nameAr, nameEn, price, cat, feat, stock, dAr, dEn] of products) {
      await db.execute(
        'INSERT INTO products (id, name_ar, name_en, description_ar, description_en, price, image_url, category, featured, in_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [uuid(), nameAr, nameEn, dAr, dEn, price, 'images/placeholder.jpg', cat, feat, stock]
      );
    }
    console.log(`✓ ${products.length} منتجات`);
  }

  // بانرات
  const [bCount] = await db.execute('SELECT COUNT(*) AS c FROM banners');
  if (bCount[0].c === 0) {
    const banners = [
      ['عروض الأسبوع', 'Weekly Offers', 'خصومات تصل إلى 30٪', 'Up to 30% off', 'تسوّق العروض', 'Shop Offers', '#all-products', 1],
      ['مجموعة المطبخ الذهبية', 'Golden Kitchen Collection', 'أناقة في كل قطعة', 'Elegance for every kitchen', 'اكتشف الآن', 'Discover', '#categories', 2],
      ['الجديد في الورقيات', 'New in Paper', 'مناديل وصحون فاخرة', 'Premium tissues & paper', 'تصفّح', 'Browse', '#all-products', 3],
    ];
    for (const [tAr, tEn, sAr, sEn, cAr, cEn, href, sort] of banners) {
      await db.execute(
        'INSERT INTO banners (id, title_ar, title_en, subtitle_ar, subtitle_en, image_url, cta_label_ar, cta_label_en, cta_href, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)',
        [uuid(), tAr, tEn, sAr, sEn, 'images/placeholder.jpg', cAr, cEn, href, sort]
      );
    }
    console.log(`✓ ${banners.length} بانرات`);
  }

  await db.end();
  console.log('\n✅ التهيئة اكتملت. شغّل: npm start');
}

run().catch((e) => {
  console.error('❌ فشل التهيئة:', e.message);
  process.exit(1);
});
