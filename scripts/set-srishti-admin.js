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

const email = 'srishtimandre4@gmail.com';
const pass = 'random_art017';
const hash = hashPassword(pass);

// Delete old rows with this email if any
db.prepare('DELETE FROM users WHERE LOWER(email) = LOWER(?)').run(email);

// Insert as admin
db.prepare(`
  INSERT INTO users (email, password_hash, full_name, phone, role)
  VALUES (?, ?, 'Srishti & Prithvi Mandre', '+919876543210', 'admin')
`).run(email.toLowerCase(), hash);

// Also set up admin@claymelo.com as backup
db.prepare('DELETE FROM users WHERE LOWER(email) = LOWER(?)').run('admin@claymelo.com');
db.prepare(`
  INSERT INTO users (email, password_hash, full_name, phone, role)
  VALUES ('admin@claymelo.com', ?, 'Prithvi Mandre', '+919876543210', 'admin')
`).run(hash);

console.log('Admins registered in database:');
console.log(db.prepare(`SELECT id, email, full_name, role FROM users WHERE role = 'admin'`).all());
