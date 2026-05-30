/**
 * Al-Rayan Store — Express + MySQL Backend
 * ------------------------------------------
 * • Endpoints under /api
 * • JWT Bearer auth for admin
 * • File uploads stored in /uploads (served at /uploads/<filename>)
 *
 * تشغيل:
 *   1) cp .env.example .env  ثم عدّل القيم
 *   2) npm install
 *   3) npm run init-db
 *   4) npm start
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuid } = require('uuid');

const {
  PORT = 8001,
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'alrayan_store',
  JWT_SECRET = 'change-me',
  WHATSAPP_NUMBER = '',
  CORS_ORIGIN = '*',
  PUBLIC_BASE_URL = '',
} = process.env;

// ----------------- DB pool -----------------
const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
});

// ----------------- App ---------------------
const app = express();
app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',') }));
app.use(express.json({ limit: '2mb' }));

// Uploads
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '1y', immutable: true }));

// ----------------- Helpers -----------------
function publicUrl(req, relativePath) {
  if (PUBLIC_BASE_URL) return `${PUBLIC_BASE_URL.replace(/\/$/, '')}${relativePath}`;
  return `${req.protocol}://${req.get('host')}${relativePath}`;
}

function authRequired(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ detail: 'Not authenticated' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ detail: 'Invalid token' });
  }
}

function rowToBool(row, keys) {
  for (const k of keys) if (row && row[k] !== undefined) row[k] = !!row[k];
  return row;
}

function mapProduct(r) {
  return rowToBool(r, ['featured', 'in_stock']);
}
function mapBanner(r) {
  r.order = r.sort_order;
  delete r.sort_order;
  return rowToBool(r, ['active']);
}
function mapOrder(r) {
  if (typeof r.items === 'string') {
    try { r.items = JSON.parse(r.items); } catch { r.items = []; }
  }
  return r;
}

// Multer (memory) — then write to disk with uuid filename
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype);
    if (!ok) return cb(new Error('Unsupported file type'));
    cb(null, true);
  },
});

// ----------------- Routes ------------------
const api = express.Router();

api.get('/', (_req, res) => res.json({ message: 'Al-Rayan Store API' }));

api.get('/settings', (_req, res) => {
  res.json({
    whatsapp_number: WHATSAPP_NUMBER,
    brand_name_ar: 'الريان',
    brand_name_en: 'Al-Rayan',
  });
});

// ----- Auth -----
api.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ detail: 'username & password required' });
  const [rows] = await pool.execute('SELECT * FROM admins WHERE username = ?', [username]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ detail: 'Invalid credentials' });
  }
  const token = jwt.sign({ sub: username, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, username });
});

api.get('/auth/me', authRequired, (req, res) => {
  res.json({ username: req.user.sub, role: 'admin' });
});

// ----- Categories -----
api.get('/categories', async (_req, res) => {
  const [rows] = await pool.execute('SELECT id, slug, name_ar, name_en, image_url FROM categories ORDER BY created_at ASC');
  res.json(rows);
});

// ----- Products -----
api.get('/products', async (req, res) => {
  const params = [];
  let q = 'SELECT * FROM products WHERE 1=1';
  if (req.query.category) { q += ' AND category = ?'; params.push(req.query.category); }
  if (req.query.featured !== undefined) { q += ' AND featured = ?'; params.push(req.query.featured === 'true' ? 1 : 0); }
  q += ' ORDER BY created_at DESC';
  const [rows] = await pool.execute(q, params);
  res.json(rows.map(mapProduct));
});

api.get('/products/:id', async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ detail: 'Not found' });
  res.json(mapProduct(rows[0]));
});

api.post('/products', authRequired, async (req, res) => {
  const id = uuid();
  const p = req.body;
  await pool.execute(
    `INSERT INTO products (id, name_ar, name_en, description_ar, description_en, price, image_url, category, featured, in_stock)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [id, p.name_ar, p.name_en, p.description_ar || '', p.description_en || '', p.price, p.image_url || '', p.category, p.featured ? 1 : 0, p.in_stock ? 1 : 0]
  );
  const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
  res.json(mapProduct(rows[0]));
});

api.put('/products/:id', authRequired, async (req, res) => {
  const p = req.body;
  const [r] = await pool.execute(
    `UPDATE products SET name_ar=?, name_en=?, description_ar=?, description_en=?, price=?, image_url=?, category=?, featured=?, in_stock=? WHERE id=?`,
    [p.name_ar, p.name_en, p.description_ar || '', p.description_en || '', p.price, p.image_url || '', p.category, p.featured ? 1 : 0, p.in_stock ? 1 : 0, req.params.id]
  );
  if (r.affectedRows === 0) return res.status(404).json({ detail: 'Not found' });
  const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
  res.json(mapProduct(rows[0]));
});

api.delete('/products/:id', authRequired, async (req, res) => {
  const [r] = await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
  if (r.affectedRows === 0) return res.status(404).json({ detail: 'Not found' });
  res.json({ deleted: true });
});

// ----- Banners -----
api.get('/banners', async (req, res) => {
  const activeOnly = req.query.active_only !== 'false';
  const [rows] = await pool.execute(
    activeOnly ? 'SELECT * FROM banners WHERE active = 1 ORDER BY sort_order ASC' : 'SELECT * FROM banners ORDER BY sort_order ASC'
  );
  res.json(rows.map(mapBanner));
});

api.post('/banners', authRequired, async (req, res) => {
  const id = uuid();
  const b = req.body;
  await pool.execute(
    `INSERT INTO banners (id, title_ar, title_en, subtitle_ar, subtitle_en, image_url, cta_label_ar, cta_label_en, cta_href, active, sort_order)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [id, b.title_ar, b.title_en, b.subtitle_ar || '', b.subtitle_en || '', b.image_url, b.cta_label_ar || '', b.cta_label_en || '', b.cta_href || '', b.active ? 1 : 0, b.order || 0]
  );
  const [rows] = await pool.execute('SELECT * FROM banners WHERE id = ?', [id]);
  res.json(mapBanner(rows[0]));
});

api.put('/banners/:id', authRequired, async (req, res) => {
  const b = req.body;
  const [r] = await pool.execute(
    `UPDATE banners SET title_ar=?, title_en=?, subtitle_ar=?, subtitle_en=?, image_url=?, cta_label_ar=?, cta_label_en=?, cta_href=?, active=?, sort_order=? WHERE id=?`,
    [b.title_ar, b.title_en, b.subtitle_ar || '', b.subtitle_en || '', b.image_url, b.cta_label_ar || '', b.cta_label_en || '', b.cta_href || '', b.active ? 1 : 0, b.order || 0, req.params.id]
  );
  if (r.affectedRows === 0) return res.status(404).json({ detail: 'Not found' });
  const [rows] = await pool.execute('SELECT * FROM banners WHERE id = ?', [req.params.id]);
  res.json(mapBanner(rows[0]));
});

api.delete('/banners/:id', authRequired, async (req, res) => {
  const [r] = await pool.execute('DELETE FROM banners WHERE id = ?', [req.params.id]);
  if (r.affectedRows === 0) return res.status(404).json({ detail: 'Not found' });
  res.json({ deleted: true });
});

// ----- Orders -----
api.post('/orders', async (req, res) => {
  const { items, total, lang = 'ar', customer_name = '', customer_phone = '' } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ detail: 'items required' });
  const id = uuid();
  await pool.execute(
    `INSERT INTO orders (id, items, total, lang, customer_name, customer_phone, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [id, JSON.stringify(items), total || 0, lang, customer_name, customer_phone]
  );
  const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
  res.json(mapOrder(rows[0]));
});

api.get('/orders', authRequired, async (_req, res) => {
  const [rows] = await pool.execute('SELECT * FROM orders ORDER BY created_at DESC LIMIT 500');
  res.json(rows.map(mapOrder));
});

api.patch('/orders/:id', authRequired, async (req, res) => {
  const status = req.query.status || req.body?.status;
  if (!status) return res.status(400).json({ detail: 'status required' });
  const [r] = await pool.execute('UPDATE orders SET status=? WHERE id=?', [status, req.params.id]);
  if (r.affectedRows === 0) return res.status(404).json({ detail: 'Not found' });
  res.json({ updated: true });
});

// ----- Upload -----
api.post('/upload', authRequired, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ detail: 'file required' });
  const ext = (req.file.originalname.split('.').pop() || 'bin').toLowerCase();
  const id = uuid();
  const filename = `${id}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filepath, req.file.buffer);
  res.json({
    id,
    filename,
    url: publicUrl(req, `/uploads/${filename}`),
    size: req.file.size,
    mime: req.file.mimetype,
  });
});

// ----------------- Mount -------------------
app.use('/api', api);

// Health check
app.get('/', (_req, res) => res.send('Al-Rayan Backend running. See /api'));

// Error handler (multer errors)
app.use((err, _req, res, _next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ detail: 'File too large (max 5MB)' });
  if (err && err.message === 'Unsupported file type') return res.status(400).json({ detail: err.message });
  console.error(err);
  res.status(500).json({ detail: 'Internal error' });
});

app.listen(PORT, () => console.log(`✅ Al-Rayan API running on http://localhost:${PORT}`));
