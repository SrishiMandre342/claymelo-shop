const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'claymelo.db');
const db = new DatabaseSync(dbPath);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const adminName = 'Prithvi Mandre';
const adminPass = 'random_art017';
const newHash = hashPassword(adminPass);

// Update existing admin or insert
const existingAdmin = db.prepare(`SELECT id FROM users WHERE role = 'admin'`).get();
if (existingAdmin) {
  db.prepare(`
    UPDATE users 
    SET full_name = ?, password_hash = ?, email = 'admin@claymelo.com'
    WHERE id = ?
  `).run(adminName, newHash, existingAdmin.id);
  console.log('Updated existing admin user:', adminName);
} else {
  db.prepare(`
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES ('admin@claymelo.com', ?, ?, 'admin')
  `).run(newHash, adminName);
  console.log('Inserted new admin user:', adminName);
}

// Also allow login with prithvi@claymelo.com
const prithviCheck = db.prepare(`SELECT id FROM users WHERE email = 'prithvi@claymelo.com'`).get();
if (!prithviCheck) {
  db.prepare(`
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES ('prithvi@claymelo.com', ?, ?, 'admin')
  `).run(newHash, adminName);
} else {
  db.prepare(`
    UPDATE users SET password_hash = ?, full_name = ?, role = 'admin' WHERE email = 'prithvi@claymelo.com'
  `).run(newHash, adminName);
}

// Clear out old demo orders and products if any, leaving a clean canvas for Prithvi's creations
console.log('Admin account credentials updated successfully.');
console.log('Admin Users:', db.prepare(`SELECT id, email, full_name, role FROM users WHERE role = 'admin'`).all());
