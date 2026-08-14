-- =============================================================
-- VIBE OF MADEENA 2K26 — PostgreSQL Production Schema DDL
-- =============================================================

-- 1. Users Table (Authentication & Roles)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'public',
  avatar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Houses Table
CREATE TABLE IF NOT EXISTS houses (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  color_hex TEXT NOT NULL DEFAULT '#10B981',
  motto TEXT,
  captain_name TEXT,
  total_points INT DEFAULT 0,
  bonus_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  min_age INT DEFAULT 5,
  max_age INT DEFAULT 20,
  description TEXT
);

-- 4. Venues Table (Stages)
CREATE TABLE IF NOT EXISTS venues (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  stage_number INT NOT NULL,
  capacity INT DEFAULT 100,
  location TEXT
);

-- 5. Students Table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  admission_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_name TEXT DEFAULT 'Kiddies',
  arabic_name TEXT,
  photo TEXT,
  gender TEXT DEFAULT 'male',
  dob DATE,
  age INT DEFAULT 10,
  class_name TEXT NOT NULL,
  division TEXT NOT NULL DEFAULT 'A',
  house_id INT REFERENCES houses(id) ON DELETE SET NULL,
  parent_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  qr_code TEXT,
  is_archived INT DEFAULT 0,
  archived_at TIMESTAMP,
  archived_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Judges Table
CREATE TABLE IF NOT EXISTS judges (
  id SERIAL PRIMARY KEY,
  judge_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  qualification TEXT,
  phone TEXT,
  email TEXT,
  specialization TEXT,
  user_id INT REFERENCES users(id) ON DELETE SET NULL
);

-- 7. Programs Table (Competitions)
CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  age_group TEXT DEFAULT 'Sub Junior',
  type TEXT DEFAULT 'individual',
  gender_category TEXT DEFAULT 'Male',
  stage_type TEXT DEFAULT 'On Stage',
  venue_id INT REFERENCES venues(id) ON DELETE SET NULL,
  program_date DATE,
  start_time TIME,
  end_time TIME,
  max_participants INT DEFAULT 20,
  status TEXT DEFAULT 'pending',
  duration_minutes INT DEFAULT 10,
  is_archived INT DEFAULT 0,
  archived_at TIMESTAMP,
  archived_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Program Judges Table
CREATE TABLE IF NOT EXISTS program_judges (
  program_id INT REFERENCES programs(id) ON DELETE CASCADE,
  judge_id INT REFERENCES judges(id) ON DELETE CASCADE,
  PRIMARY KEY (program_id, judge_id)
);

-- 9. Program Participants Table
CREATE TABLE IF NOT EXISTS program_participants (
  id SERIAL PRIMARY KEY,
  program_id INT REFERENCES programs(id) ON DELETE CASCADE,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  chest_no INT NOT NULL,
  attendance TEXT DEFAULT 'pending',
  UNIQUE (program_id, student_id)
);

-- 10. Marks Table
CREATE TABLE IF NOT EXISTS marks (
  id SERIAL PRIMARY KEY,
  program_id INT REFERENCES programs(id) ON DELETE CASCADE,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  judge_id INT REFERENCES judges(id) ON DELETE CASCADE,
  presentation NUMERIC(5, 2) DEFAULT 0,
  pronunciation NUMERIC(5, 2) DEFAULT 0,
  confidence NUMERIC(5, 2) DEFAULT 0,
  voice NUMERIC(5, 2) DEFAULT 0,
  content NUMERIC(5, 2) DEFAULT 0,
  memorization NUMERIC(5, 2) DEFAULT 0,
  time_management NUMERIC(5, 2) DEFAULT 0,
  overall_impression NUMERIC(5, 2) DEFAULT 0,
  total_mark NUMERIC(6, 2) DEFAULT 0,
  total_score NUMERIC(6, 2) DEFAULT 0,
  criteria_scores TEXT,
  remarks TEXT,
  status TEXT DEFAULT 'draft',
  is_archived INT DEFAULT 0,
  archived_at TIMESTAMP,
  archived_by TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE (program_id, student_id, judge_id)
);

-- 11. Results Table
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  program_id INT REFERENCES programs(id) ON DELETE CASCADE,
  student_id INT REFERENCES students(id) ON DELETE CASCADE,
  total_score NUMERIC(6, 2) NOT NULL,
  prize TEXT NOT NULL,
  points_awarded INT NOT NULL DEFAULT 0,
  tie_breaker_note TEXT,
  is_archived INT DEFAULT 0,
  archived_at TIMESTAMP,
  archived_by TEXT,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  certificate_no TEXT,
  certificate_code TEXT,
  student_id INT REFERENCES students(id) ON DELETE SET NULL,
  program_id INT REFERENCES programs(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  recipient_name TEXT,
  issue_date DATE,
  pdf_url TEXT,
  download_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  posted_by TEXT DEFAULT 'Admin',
  is_archived INT DEFAULT 0,
  archived_at TIMESTAMP,
  archived_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  album_name TEXT NOT NULL DEFAULT 'Milad 2026',
  title TEXT NOT NULL,
  media_type TEXT DEFAULT 'photo',
  url TEXT NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Settings Table
CREATE TABLE IF NOT EXISTS settings (
  key_name TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 16. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Safe Column Additions for Existing PostgreSQL Databases
ALTER TABLE houses ADD COLUMN IF NOT EXISTS bonus_points INT DEFAULT 0;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS gender_category TEXT DEFAULT 'Male';
ALTER TABLE programs ADD COLUMN IF NOT EXISTS stage_type TEXT DEFAULT 'On Stage';
ALTER TABLE marks ADD COLUMN IF NOT EXISTS total_score NUMERIC(6, 2) DEFAULT 0;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS criteria_scores TEXT;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS certificate_code TEXT;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS download_url TEXT;

-- Migration to change existing VARCHAR fields to TEXT so long strings never throw length errors
ALTER TABLE gallery ALTER COLUMN caption TYPE TEXT;
ALTER TABLE gallery ALTER COLUMN title TYPE TEXT;
ALTER TABLE gallery ALTER COLUMN album_name TYPE TEXT;
ALTER TABLE announcements ALTER COLUMN title TYPE TEXT;
ALTER TABLE audit_logs ALTER COLUMN action TYPE TEXT;

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_students_house_id ON students(house_id);
CREATE INDEX IF NOT EXISTS idx_students_admission_no ON students(admission_no);
CREATE INDEX IF NOT EXISTS idx_students_category ON students(category_name);
CREATE INDEX IF NOT EXISTS idx_programs_category_id ON programs(category_id);
CREATE INDEX IF NOT EXISTS idx_programs_venue_id ON programs(venue_id);
CREATE INDEX IF NOT EXISTS idx_program_participants_pid_sid ON program_participants(program_id, student_id);
CREATE INDEX IF NOT EXISTS idx_marks_pid_sid ON marks(program_id, student_id);
CREATE INDEX IF NOT EXISTS idx_results_pid ON results(program_id);

