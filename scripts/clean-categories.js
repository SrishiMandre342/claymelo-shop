const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'claymelo.db');
const db = new DatabaseSync(dbPath);

// Delete other categories
db.exec(`
  DELETE FROM categories WHERE slug NOT IN ('clay-keychains', 'keychains');
  UPDATE categories SET name = 'Keychains', slug = 'keychains' WHERE slug = 'clay-keychains';
`);

let cat = db.prepare(`SELECT id FROM categories WHERE slug = 'keychains'`).get();
if (!cat) {
  const res = db.prepare(`INSERT INTO categories (name, slug, description) VALUES ('Keychains', 'keychains', 'Cute handcrafted polymer clay keychains')`).run();
  cat = { id: Number(res.lastInsertRowid) };
}

// Remove products that were specifically trinket dishes, desk buddies, or phone charms
db.exec(`
  DELETE FROM products WHERE name LIKE '%Dish%' OR name LIKE '%Trinket%' OR name LIKE '%Desk%' OR name LIKE '%Cloud%' OR name LIKE '%Phone Charm%';
`);

// Assign all remaining products to Keychains category
db.prepare(`UPDATE products SET category_id = ?`).run(cat.id);

console.log('Active categories:', db.prepare('SELECT * FROM categories').all());
console.log('Active products:', db.prepare('SELECT id, name, category_id FROM products').all());
