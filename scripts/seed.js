const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.join(__dirname, '..', 'data', 'claymelo.db');
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);

// Create schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    recipient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    flat_house TEXT NOT NULL,
    street TEXT NOT NULL,
    area TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    original_price REAL,
    stock INTEGER NOT NULL DEFAULT 1,
    is_available INTEGER NOT NULL DEFAULT 1,
    is_featured INTEGER NOT NULL DEFAULT 0,
    category_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    is_primary INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS wishlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    session_id TEXT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    user_id INTEGER,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    address_json TEXT NOT NULL,
    subtotal REAL NOT NULL,
    shipping_fee REAL NOT NULL,
    total_amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'PENDING',
    order_status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    price_at_purchase REAL NOT NULL,
    quantity INTEGER NOT NULL,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    payment_gateway TEXT NOT NULL,
    transaction_ref TEXT,
    utr_number TEXT,
    amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'INITIATED',
    gateway_response_json TEXT,
    verified_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS shipping_zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    base_rate REAL NOT NULL,
    free_shipping_threshold REAL
  );

  CREATE TABLE IF NOT EXISTS shipping_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone_id INTEGER,
    rule_type TEXT NOT NULL,
    rule_value TEXT NOT NULL,
    rate REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS store_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

console.log('Seeding store settings...');
const settings = [
  ['store_name', 'ClayMelo 🍄'],
  ['store_tagline', 'Handmade clay creations, made with love.'],
  ['upi_id', 'sisterclaymelo@upi'],
  ['upi_name', 'ClayMelo Boutique'],
  ['instagram_url', 'https://instagram.com/claymelo.shop'],
  ['contact_phone', '+91 98765 43210'],
  ['contact_email', 'hello@claymelo.com'],
  ['free_shipping_threshold', '999'],
  ['payment_mode', 'sandbox'],
  ['is_store_active', '1'],
];

const insertSetting = db.prepare(`INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)`);
for (const [k, v] of settings) {
  insertSetting.run(k, v);
}

console.log('Seeding admin user...');
const adminEmail = process.env.ADMIN_EMAIL || 'admin@claymelo.com';
const adminPass = process.env.ADMIN_PASSWORD || 'ClaymeloAdmin2026!';
const adminCheck = db.prepare(`SELECT id FROM users WHERE email = ?`).get(adminEmail);
if (!adminCheck) {
  const adminHash = hashPassword(adminPass);
  db.prepare(`
    INSERT INTO users (email, password_hash, full_name, phone, role)
    VALUES (?, ?, ?, ?, 'admin')
  `).run(adminEmail, adminHash, 'ClayMelo Admin', '+919876543210');
  console.log(`Admin user created: ${adminEmail}`);
}

console.log('Seeding shipping rules...');
db.exec(`DELETE FROM shipping_rules;`);
const insertRule = db.prepare(`INSERT INTO shipping_rules (rule_type, rule_value, rate) VALUES (?, ?, ?)`);
insertRule.run('default', 'all', 79);
insertRule.run('state', 'karnataka', 49);
insertRule.run('state', 'tamil nadu', 65);
insertRule.run('state', 'kerala', 65);
insertRule.run('state', 'maharashtra', 70);
insertRule.run('pincode', '560001', 39);

console.log('Seeding product categories...');
const categories = [
  { name: 'Clay Keychains', slug: 'clay-keychains', desc: 'Handcrafted polymer clay keychains' },
  { name: 'Trinket Dishes', slug: 'trinket-dishes', desc: 'Glazed clay vanity & jewelry dishes' },
  { name: 'Desk Buddies', slug: 'desk-buddies', desc: 'Miniature clay companions for desks' },
  { name: 'Phone Charms', slug: 'phone-charms', desc: 'Handmade clay charms for phones & bags' },
];

const insertCategory = db.prepare(`INSERT OR IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)`);
for (const cat of categories) {
  insertCategory.run(cat.name, cat.slug, cat.desc);
}

// Clean old demo product images from product_images table
db.exec(`
  DELETE FROM product_images WHERE image_url LIKE '%mushroom-keychain%' OR image_url LIKE '%strawberry-dish%' OR image_url LIKE '%matcha-frog%' OR image_url LIKE '%peach-cat%' OR image_url LIKE '%cloud-desk%';
`);

console.log('Database initialized cleanly without any AI-generated image assets.');
