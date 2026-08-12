require('dotenv').config();
const path = require('path');
const fs = require('fs');

const DATABASE_URL = process.env.DATABASE_URL;
const isPg = Boolean(DATABASE_URL && DATABASE_URL.trim().length > 0);

let pgPool = null;
let sqliteDb = null;

if (isPg) {
  const { Pool } = require('pg');
  const poolConfig = {
    connectionString: DATABASE_URL,
    ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false }
  };
  pgPool = new Pool(poolConfig);
  console.log('[DB] Configured for PostgreSQL (DATABASE_URL)');
} else {
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(__dirname, 'madrasa_milad.sqlite');
  sqliteDb = new sqlite3.Database(dbPath);
  console.log('[DB] Configured for local SQLite (madrasa_milad.sqlite)');
}

// Convert SQLite ? placeholders and syntax to PostgreSQL syntax when isPg is true
function translateQuery(sql, params = []) {
  if (!isPg) {
    return { sql, params };
  }

  let paramIndex = 1;
  let pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);

  // Handle SQLite INSERT OR REPLACE FOR PostgreSQL
  if (pgSql.includes('INSERT OR REPLACE INTO')) {
    if (pgSql.includes('INSERT OR REPLACE INTO settings')) {
      pgSql = pgSql.replace('INSERT OR REPLACE INTO settings', 'INSERT INTO settings') + ' ON CONFLICT (key_name) DO UPDATE SET value = EXCLUDED.value';
    } else if (pgSql.includes('INSERT OR REPLACE INTO program_judges')) {
      pgSql = pgSql.replace('INSERT OR REPLACE INTO program_judges', 'INSERT INTO program_judges') + ' ON CONFLICT (program_id, judge_id) DO NOTHING';
    } else if (pgSql.includes('INSERT OR REPLACE INTO users')) {
      pgSql = pgSql.replace('INSERT OR REPLACE INTO users', 'INSERT INTO users') + ' ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email';
    } else {
      pgSql = pgSql.replace('INSERT OR REPLACE INTO', 'INSERT INTO') + ' ON CONFLICT (id) DO NOTHING';
    }
  }

  // Append RETURNING id for INSERT queries if not already present
  if (/^\s*INSERT\s+INTO\s+/i.test(pgSql) && !/RETURNING/i.test(pgSql) && !/ON CONFLICT DO NOTHING/i.test(pgSql)) {
    pgSql += ' RETURNING id';
  }

  return { sql: pgSql, params };
}

// Unified run() helper
async function run(sql, params = []) {
  if (isPg) {
    const { sql: pgSql, params: pgParams } = translateQuery(sql, params);
    try {
      const res = await pgPool.query(pgSql, pgParams);
      const insertedId = res.rows && res.rows[0] && res.rows[0].id ? res.rows[0].id : null;
      return { id: insertedId, changes: res.rowCount };
    } catch (err) {
      console.error('[PG RUN ERROR]', err.message, 'Query:', pgSql);
      throw err;
    }
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }
}

// Unified get() helper
async function get(sql, params = []) {
  if (isPg) {
    const { sql: pgSql, params: pgParams } = translateQuery(sql, params);
    try {
      const res = await pgPool.query(pgSql, pgParams);
      return res.rows[0] || null;
    } catch (err) {
      console.error('[PG GET ERROR]', err.message, 'Query:', pgSql);
      throw err;
    }
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

// Unified all() helper
async function all(sql, params = []) {
  if (isPg) {
    const { sql: pgSql, params: pgParams } = translateQuery(sql, params);
    try {
      const res = await pgPool.query(pgSql, pgParams);
      return res.rows || [];
    } catch (err) {
      console.error('[PG ALL ERROR]', err.message, 'Query:', pgSql);
      throw err;
    }
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

// Initialize Database (Schema & Seeds)
async function initDb() {
  if (isPg) {
    console.log('[DB] Initializing PostgreSQL database tables and indexes...');
    const pgSchemaPath = path.join(__dirname, 'pg_schema.sql');
    if (fs.existsSync(pgSchemaPath)) {
      const schemaSql = fs.readFileSync(pgSchemaPath, 'utf-8');
      await pgPool.query(schemaSql);
      console.log('[DB] PostgreSQL schema initialized successfully.');
    }
  } else {
    console.log('[DB] Initializing SQLite database schema for production...');
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
      is_archived INTEGER DEFAULT 0,
      archived_at DATETIME,
      archived_by TEXT,
      FOREIGN KEY (house_id) REFERENCES houses(id)
    )`);

    // Ensure category_name and other columns exist on pre-existing SQLite/Postgres tables
    const studentCols = [
      "category_name TEXT DEFAULT 'Kiddies'",
      "is_archived INTEGER DEFAULT 0",
      "archived_at DATETIME",
      "archived_by TEXT",
      "qr_code TEXT"
    ];
    for (const colDef of studentCols) {
      try {
        await run(`ALTER TABLE students ADD COLUMN ${colDef}`);
      } catch (e) {
        // Column already exists
      }
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
      is_archived INTEGER DEFAULT 0,
      archived_at DATETIME,
      archived_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (venue_id) REFERENCES venues(id)
    )`);

    // Ensure is_archived and other columns exist on pre-existing SQLite/Postgres programs table
    const programCols = [
      "is_archived INTEGER DEFAULT 0",
      "archived_at DATETIME",
      "archived_by TEXT",
      "duration_minutes INTEGER DEFAULT 10",
      "age_group TEXT DEFAULT 'Sub Junior'",
      "type TEXT DEFAULT 'individual'",
      "status TEXT DEFAULT 'pending'"
    ];
    for (const colDef of programCols) {
      try {
        await run(`ALTER TABLE programs ADD COLUMN ${colDef}`);
      } catch (e) {}
    }

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
      is_archived INTEGER DEFAULT 0,
      archived_at DATETIME,
      archived_by TEXT,
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
      is_archived INTEGER DEFAULT 0,
      archived_at DATETIME,
      archived_by TEXT,
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
      is_archived INTEGER DEFAULT 0,
      archived_at DATETIME,
      archived_by TEXT,
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
  }

  // Ensure default seeds exist if empty
  const houseRows = await all('SELECT * FROM houses');
  if (houseRows.length === 0) {
    await run(`INSERT INTO houses (id, code, name, color_hex, motto, captain_name, total_points) VALUES 
      (1, 'H-GRN', 'Green House', '#10B981', 'Courage and Devotion in Faith', 'Captain 1', 0),
      (2, 'H-BLU', 'Blue House', '#3B82F6', 'Knowledge is Light and Guidance', 'Captain 2', 0)`);
  }

  const categoryRows = await all('SELECT * FROM categories');
  if (categoryRows.length < 5) {
    await run(`INSERT INTO categories (id, name, min_age, max_age, description) VALUES
      (1, 'Kiddies', 5, 7, 'Kiddies Category'),
      (2, 'Sub Junior', 8, 10, 'Sub Junior Category'),
      (3, 'Junior', 11, 13, 'Junior Category'),
      (4, 'Senior', 14, 16, 'Senior Category'),
      (5, 'Super Senior', 17, 20, 'Super Senior Category')
      ON CONFLICT DO NOTHING`);
  }

  const venueCount = await get('SELECT COUNT(*) as count FROM venues');
  if (!venueCount || parseInt(venueCount.count, 10) === 0) {
    await run(`INSERT INTO venues (id, name, stage_number, capacity, location) VALUES
      (1, 'Stage 1 (Imam Bukhari Stage)', 1, 500, 'Main Auditorium'),
      (2, 'Stage 2 (Imam Shafi Stage)', 2, 200, 'Academic Hall'),
      (3, 'Stage 3 (Imam Ghazali Hall)', 3, 150, 'Library Extension')
      ON CONFLICT DO NOTHING`);
  }

  const userCount = await get('SELECT COUNT(*) as count FROM users');
  if (!userCount || parseInt(userCount.count, 10) === 0) {
    const passHash = '$2a$10$e8w8S5P0dK0xG9Jv8sJ6Ue2xXyY.7m3v5Z8m3v5Z8m3v5Z8m3v5Z8';
    await run(`INSERT INTO houses (id, code, name, color_hex, motto, captain_name, total_points) VALUES 
      (1, 'H-GRN', 'Green House', '#10B981', 'Courage and Devotion in Faith', 'Captain 1', 0) ON CONFLICT DO NOTHING`);
    await run(`INSERT INTO users (id, username, email, password, name, role) VALUES
      (1, 'superadmin', 'superadmin@madrasa.org', '${passHash}', 'Usthad Sayyid Muhammed', 'super_admin'),
      (2, 'admin', 'admin@madrasa.org', '${passHash}', 'Usthad Abdul Rahman', 'admin'),
      (3, 'judge1', 'judge1@madrasa.org', '${passHash}', 'Qari Zakariya Al-Hafiz', 'judge')
      ON CONFLICT DO NOTHING`);
  }

  // Restore from production snapshot if SQLite tables are empty
  if (!isPg) {
    const persistence = require('./persistence');
    await persistence.restoreFromDatabaseSnapshot({ run, get, all });
    await persistence.syncDatabaseSnapshot({ run, get, all });
  }

  console.log(`[DB] Database initialized successfully. Mode: ${isPg ? 'PostgreSQL' : 'SQLite'}`);
}

const persistence = require('./persistence');

module.exports = {
  isPg,
  pgPool,
  db: sqliteDb,
  run,
  get,
  all,
  initDb,
  syncSnapshot: () => (!isPg ? persistence.syncDatabaseSnapshot({ run, get, all }) : Promise.resolve())
};
