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
  console.log('[DB] Initializing SQLite database schema and seed data...');
  
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
    arabic_name TEXT,
    photo TEXT,
    gender TEXT DEFAULT 'male',
    dob DATE,
    age INTEGER DEFAULT 10,
    class_name TEXT NOT NULL,
    division TEXT NOT NULL,
    house_id INTEGER,
    parent_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    qr_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (house_id) REFERENCES houses(id)
  )`);

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

  // Ensure house count is strictly 2 by default
  const houseRows = await all('SELECT * FROM houses');
  if (houseRows.length > 2) {
    console.log('[DB] Trimming houses to strictly 2 houses...');
    await run('UPDATE students SET house_id = 1 WHERE house_id NOT IN (1, 2)');
    await run('DELETE FROM houses WHERE id NOT IN (1, 2)');
  }

  // Check if seed needed
  const userCount = await get('SELECT COUNT(*) as count FROM users');
  if (userCount && userCount.count === 0) {
    console.log('[DB] Seeding initial data into SQLite...');

    // ONLY TWO HOUSES
    await run(`INSERT INTO houses (id, code, name, color_hex, motto, captain_name, total_points) VALUES 
      (1, 'H-GRN', 'Green House', '#10B981', 'Courage and Devotion in Faith', 'Ahmad Bin Ziyad', 145),
      (2, 'H-BLU', 'Blue House', '#3B82F6', 'Knowledge is Light and Guidance', 'Muhammed Fayaz', 132)`);

    // Categories
    await run(`INSERT INTO categories (id, name, min_age, max_age, description) VALUES
      (1, 'Kids', 5, 8, 'Class 1 to Class 3'),
      (2, 'Sub Junior', 9, 11, 'Class 4 to Class 6'),
      (3, 'Junior', 12, 14, 'Class 7 to Class 9'),
      (4, 'Senior', 15, 18, 'Class 10 to Higher Secondary')`);

    // Venues
    await run(`INSERT INTO venues (id, name, stage_number, capacity, location) VALUES
      (1, 'Auditorium Main Stage (Imam Bukhari Stage)', 1, 500, 'Main Building Ground Floor'),
      (2, 'Stage 2 (Imam Shafi Stage)', 2, 200, 'Academic Block 1st Floor'),
      (3, 'Stage 3 (Imam Ghazali Hall)', 3, 150, 'Library Extension Block'),
      (4, 'Open Air Stage (Syed Alavi Hall)', 4, 300, 'Madrasa Courtyard Area')`);

    // Users (password: password123)
    const passHash = '$2a$10$e8w8S5P0dK0xG9Jv8sJ6Ue2xXyY.7m3v5Z8m3v5Z8m3v5Z8m3v5Z8';
    await run(`INSERT INTO users (id, username, email, password, name, role) VALUES
      (1, 'superadmin', 'superadmin@madrasa.org', '${passHash}', 'Usthad Sayyid Muhammed', 'super_admin'),
      (2, 'admin', 'admin@madrasa.org', '${passHash}', 'Usthad Abdul Rahman', 'admin'),
      (3, 'judge1', 'judge1@madrasa.org', '${passHash}', 'Qari Zakariya Al-Hafiz', 'judge'),
      (4, 'judge2', 'judge2@madrasa.org', '${passHash}', 'Dr. Luqman Hakeem', 'judge'),
      (5, 'coordinator1', 'stage1@madrasa.org', '${passHash}', 'Umer Farooq', 'stage_coordinator')`);

    // Judges
    await run(`INSERT INTO judges (id, judge_code, name, qualification, phone, email, specialization, user_id) VALUES
      (1, 'JDG-001', 'Qari Zakariya Al-Hafiz', 'M.A. Islamic Studies', '+91 9876543210', 'judge1@madrasa.org', 'Tajweed & Quran Recitation', 3),
      (2, 'JDG-002', 'Dr. Luqman Hakeem', 'Ph.D. Arabic Literature', '+91 9876543211', 'judge2@madrasa.org', 'Arabic & Malayalam Eloquence', 4),
      (3, 'JDG-003', 'Usthad Zainul Abideen', 'Fazil Baqavi', '+91 9876543212', 'zain@madrasa.org', 'Nasheed & Voice Culture', NULL)`);

    // Students (assigned to House 1 or House 2)
    await run(`INSERT INTO students (id, student_id, admission_no, name, arabic_name, gender, dob, age, class_name, division, house_id, parent_name, phone, email, address) VALUES
      (1, 'STU-1001', 'ADM-2024-01', 'Muhammed Danish', 'محمد دانش', 'male', '2012-05-14', 14, 'Class 8', 'A', 1, 'Ibrahim K.T.', '+91 9123456789', 'danish@mail.com', 'Green Villa, Calicut Road'),
      (2, 'STU-1002', 'ADM-2024-02', 'Ahmad Zayan', 'أحمد زيان', 'male', '2013-08-20', 13, 'Class 7', 'B', 2, 'Kassim Ali', '+91 9123456790', 'zayan@mail.com', 'Noor Manzil, Madrasa Nagar'),
      (3, 'STU-1003', 'ADM-2024-03', 'Fathima Zahra', 'فاطمة الزهراء', 'female', '2014-02-10', 12, 'Class 6', 'A', 1, 'Muhammed Shareef', '+91 9123456791', 'zahra@mail.com', 'Rose Garden, Beach Road'),
      (4, 'STU-1004', 'ADM-2024-04', 'Aisha Raihana', 'عائشة ريحانة', 'female', '2011-11-05', 15, 'Class 9', 'A', 2, 'Abdul Latheef', '+91 9123456792', 'aisha@mail.com', 'Baitul Noor, Market Street'),
      (5, 'STU-1005', 'ADM-2024-05', 'Omar Abdullah', 'عمر عبد الله', 'male', '2015-09-12', 11, 'Class 5', 'B', 1, 'Abdullah K.', '+91 9123456793', 'omar@mail.com', 'Al-Madina House, Town Hall')`);

    // Programs
    await run(`INSERT INTO programs (id, code, name, category_id, age_group, type, venue_id, program_date, start_time, end_time, max_participants, status, duration_minutes) VALUES
      (1, 'PRG-101', 'Quran Recitation (Tilawat)', 3, 'Junior', 'individual', 1, '2026-08-15', '09:00', '10:30', 10, 'running', 90),
      (2, 'PRG-102', 'Hifz Competition (Juz 30)', 2, 'Sub Junior', 'individual', 2, '2026-08-15', '09:30', '11:00', 8, 'pending', 90),
      (3, 'PRG-103', 'Arabic Elocution (Speech)', 4, 'Senior', 'individual', 1, '2026-08-15', '11:00', '12:30', 12, 'pending', 90),
      (4, 'PRG-104', 'Malayalam Speech', 3, 'Junior', 'individual', 3, '2026-08-15', '10:00', '11:30', 10, 'completed', 90),
      (5, 'PRG-105', 'Nasheed (Islamic Song)', 3, 'Junior', 'individual', 4, '2026-08-15', '11:30', '13:00', 15, 'pending', 90),
      (6, 'PRG-106', 'Duff Performance (Group)', 4, 'Senior', 'group', 1, '2026-08-15', '14:00', '16:00', 6, 'pending', 120),
      (7, 'PRG-107', 'Islamic Quiz', 3, 'Junior', 'group', 2, '2026-08-15', '14:00', '15:30', 8, 'pending', 90),
      (8, 'PRG-108', 'Arabic Calligraphy', 4, 'Senior', 'individual', 3, '2026-08-15', '14:00', '16:00', 15, 'pending', 120)`);

    // Program Judges
    await run(`INSERT INTO program_judges (program_id, judge_id) VALUES (1, 1), (1, 2), (2, 1), (2, 3), (3, 2), (3, 3), (4, 2)`);

    // Program Participants
    await run(`INSERT INTO program_participants (program_id, student_id, chest_no, attendance) VALUES 
      (1, 1, 101, 'present'), (1, 2, 102, 'present'), (1, 3, 103, 'present'), (1, 4, 104, 'present'), (1, 5, 105, 'present'),
      (4, 1, 201, 'present'), (4, 2, 202, 'present'), (4, 3, 203, 'present')`);

    // Marks for Program 4
    await run(`INSERT INTO marks (program_id, student_id, judge_id, presentation, pronunciation, confidence, voice, content, memorization, time_management, overall_impression, total_mark, status) VALUES
      (4, 1, 2, 14.0, 14.5, 13.0, 13.5, 14.0, 10.0, 9.5, 9.0, 97.5, 'final'),
      (4, 2, 2, 13.0, 13.0, 12.5, 12.0, 13.0, 9.0, 9.0, 8.5, 90.0, 'final'),
      (4, 3, 2, 12.0, 12.5, 11.5, 11.0, 12.0, 8.5, 8.0, 8.0, 83.5, 'final')`);

    // Results
    await run(`INSERT INTO results (program_id, student_id, total_score, prize, points_awarded) VALUES
      (4, 1, 97.5, '1st', 10),
      (4, 2, 90.0, '2nd', 7),
      (4, 3, 83.5, '3rd', 5)`);

    // Announcements
    await run(`INSERT INTO announcements (title, content, priority, posted_by) VALUES
      ('Welcome to Milad-un-Nabi Festival 2026', 'We are delighted to announce the grand inauguration of Madrasa Milad Festival 2026. All programs start at 9:00 AM sharp at Stage 1.', 'high', 'Madrasa Committee'),
      ('Live Leaderboard Active', 'Parents and guests can watch live real-time scores and house standings on the digital screens or on our official website portal.', 'normal', 'IT Cell')`);

    // Gallery
    await run(`INSERT INTO gallery (album_name, title, media_type, url, caption) VALUES
      ('Milad 2026 Highlights', 'Opening Ceremony & Qiraat Recitation', 'photo', 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=800&q=80', 'Inaugural prayer session led by Principal Usthad'),
      ('Stage 1 Events', 'Duff Group Performance', 'photo', 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80', 'Senior students presenting traditional Duff song')`);

    // Settings
    await run(`INSERT INTO settings (key_name, value) VALUES
      ('school_name', 'Madrasat-ul-Huda Islamic Academy'),
      ('milad_title', 'Grand Milad-un-Nabi Fest 2026'),
      ('academic_year', '2026-2027'),
      ('point_1st', '10'),
      ('point_2nd', '7'),
      ('point_3rd', '5'),
      ('point_participation', '3'),
      ('theme_primary', '#065F46')`);

    console.log('[DB] Seed data inserted successfully!');
  }
}

module.exports = {
  db,
  run,
  get,
  all,
  initDb
};
