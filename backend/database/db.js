const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'madrasa_milad.sqlite');
const db = new sqlite3.Database(dbPath);

// Helper for promise-based queries
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDb() {
  console.log('[DB] Initializing SQLite database schema for production...');
  
  // Create tables if missing
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'public',
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS houses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    color_hex TEXT NOT NULL DEFAULT '#10B981',
    motto TEXT,
    captain_name TEXT,
    total_points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    min_age INTEGER DEFAULT 5,
    max_age INTEGER DEFAULT 20,
    description TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS venues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    stage_number INTEGER NOT NULL,
    capacity INTEGER DEFAULT 100,
    location TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT UNIQUE NOT NULL,
    admission_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category_name TEXT DEFAULT 'Kiddies',
    arabic_name TEXT,
    photo TEXT,
    gender TEXT DEFAULT 'male',
    dob DATE,
    age INTEGER DEFAULT 10,
    class_name TEXT NOT NULL,
    division TEXT NOT NULL DEFAULT 'A',
    house_id INTEGER,
    parent_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    qr_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (house_id) REFERENCES houses(id)
  )`);

  // Migration: add category_name column if missing in existing table
  try {
    await run("ALTER TABLE students ADD COLUMN category_name TEXT DEFAULT 'Kiddies'");
  } catch (e) {
    // Column already exists
  }

  await run(`CREATE TABLE IF NOT EXISTS judges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    judge_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    qualification TEXT,
    phone TEXT,
    email TEXT,
    specialization TEXT,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    age_group TEXT DEFAULT 'Sub Junior',
    type TEXT DEFAULT 'individual',
    venue_id INTEGER,
    program_date DATE,
    start_time TIME,
    end_time TIME,
    max_participants INTEGER DEFAULT 20,
    status TEXT DEFAULT 'pending',
    duration_minutes INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS program_judges (
    program_id INTEGER NOT NULL,
    judge_id INTEGER NOT NULL,
    PRIMARY KEY (program_id, judge_id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS program_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    chest_no INTEGER NOT NULL,
    attendance TEXT DEFAULT 'pending',
    UNIQUE (program_id, student_id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS marks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    judge_id INTEGER NOT NULL,
    presentation REAL DEFAULT 0,
    pronunciation REAL DEFAULT 0,
    confidence REAL DEFAULT 0,
    voice REAL DEFAULT 0,
    content REAL DEFAULT 0,
    memorization REAL DEFAULT 0,
    time_management REAL DEFAULT 0,
    overall_impression REAL DEFAULT 0,
    total_mark REAL DEFAULT 0,
    status TEXT DEFAULT 'draft',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (program_id, student_id, judge_id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    total_score REAL NOT NULL,
    prize TEXT NOT NULL,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    tie_breaker_note TEXT,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    certificate_no TEXT UNIQUE NOT NULL,
    student_id INTEGER,
    program_id INTEGER,
    type TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    issue_date DATE NOT NULL,
    pdf_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'normal',
    posted_by TEXT DEFAULT 'Admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    album_name TEXT NOT NULL DEFAULT 'Milad 2026',
    title TEXT NOT NULL,
    media_type TEXT DEFAULT 'photo',
    url TEXT NOT NULL,
    caption TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await run(`CREATE TABLE IF NOT EXISTS settings (
    key_name TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Migration: Add soft deletion / archiving columns to tables if missing
  const tablesToMigrate = ['students', 'programs', 'results', 'announcements', 'marks'];
  for (const table of tablesToMigrate) {
    try { await run(`ALTER TABLE ${table} ADD COLUMN is_archived INTEGER DEFAULT 0`); } catch (e) {}
    try { await run(`ALTER TABLE ${table} ADD COLUMN archived_at DATETIME`); } catch (e) {}
    try { await run(`ALTER TABLE ${table} ADD COLUMN archived_by TEXT`); } catch (e) {}
  }

  // Ensure houses exist if table is empty (never overwrite existing)
  const houseRows = await all('SELECT * FROM houses');
  if (houseRows.length === 0) {
    await run(`INSERT INTO houses (id, code, name, color_hex, motto, captain_name, total_points) VALUES 
      (1, 'H-GRN', 'Green House', '#10B981', 'Courage and Devotion in Faith', 'Captain 1', 0),
      (2, 'H-BLU', 'Blue House', '#3B82F6', 'Knowledge is Light and Guidance', 'Captain 2', 0)`);
  }

  // Ensure standard 5 categories exist in categories table
  await run("UPDATE categories SET name = 'Kiddies' WHERE name = 'Kids'");

  const categoryRows = await all('SELECT * FROM categories');
  if (categoryRows.length < 5) {
    await run(`DELETE FROM categories`);
    await run(`INSERT INTO categories (id, name, min_age, max_age, description) VALUES
      (1, 'Kiddies', 5, 7, 'Kiddies Category'),
      (2, 'Sub Junior', 8, 10, 'Sub Junior Category'),
      (3, 'Junior', 11, 13, 'Junior Category'),
      (4, 'Senior', 14, 16, 'Senior Category'),
      (5, 'Super Senior', 17, 20, 'Super Senior Category')`);
  }

  // Ensure venues exist if table is empty
  const venueCount = await get('SELECT COUNT(*) as count FROM venues');
  if (!venueCount || venueCount.count === 0) {
    await run(`INSERT INTO venues (id, name, stage_number, capacity, location) VALUES
      (1, 'Stage 1 (Imam Bukhari Stage)', 1, 500, 'Main Auditorium'),
      (2, 'Stage 2 (Imam Shafi Stage)', 2, 200, 'Academic Hall'),
      (3, 'Stage 3 (Imam Ghazali Hall)', 3, 150, 'Library Extension')`);
  }

  // Ensure default admin users exist if table is empty
  const userCount = await get('SELECT COUNT(*) as count FROM users');
  if (!userCount || userCount.count === 0) {
    const passHash = '$2a$10$e8w8S5P0dK0xG9Jv8sJ6Ue2xXyY.7m3v5Z8m3v5Z8m3v5Z8m3v5Z8';
    await run(`INSERT INTO users (id, username, email, password, name, role) VALUES
      (1, 'superadmin', 'superadmin@madrasa.org', '${passHash}', 'Usthad Sayyid Muhammed', 'super_admin'),
      (2, 'admin', 'admin@madrasa.org', '${passHash}', 'Usthad Abdul Rahman', 'admin'),
      (3, 'judge1', 'judge1@madrasa.org', '${passHash}', 'Qari Zakariya Al-Hafiz', 'judge')`);
  }

  // Restore from production snapshot if tables are empty (e.g. fresh Vercel deployment instance)
  const persistence = require('./persistence');
  await persistence.restoreFromDatabaseSnapshot({ run, get, all });

  // Instantly sync live SQLite database state back to disk snapshot
  await persistence.syncDatabaseSnapshot({ run, get, all });

  console.log('[DB] Database initialized safely with strict data persistence! Archiving & Audit Logs ready.');
}

const persistence = require('./persistence');

module.exports = {
  db,
  run,
  get,
  all,
  initDb,
  syncSnapshot: () => persistence.syncDatabaseSnapshot({ run, get, all })
};
