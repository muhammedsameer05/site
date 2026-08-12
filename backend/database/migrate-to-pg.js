require('dotenv').config();
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];

if (!DATABASE_URL) {
  console.error('\n[MIGRATION ERROR] DATABASE_URL environment variable or command line argument is missing!');
  console.error('Usage: node database/migrate-to-pg.js "postgresql://user:pass@host:5432/dbname"\n');
  process.exit(1);
}

const sqlitePath = path.join(__dirname, 'madrasa_milad.sqlite');
const jsonStorePath = path.join(__dirname, 'production_database_store.json');

const pgPool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false }
});

const sqliteDb = new sqlite3.Database(sqlitePath);

function sqliteAll(query, params = []) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(query, params, (err, rows) => {
      if (err) resolve([]);
      else resolve(rows || []);
    });
  });
}

async function runMigration() {
  console.log('===========================================================');
  console.log(' VIBE OF MADEENA 2K26 — PostgreSQL Data Migration Pipeline ');
  console.log('===========================================================');
  console.log(`[1/4] Connecting to PostgreSQL database...`);

  const client = await pgPool.connect();

  try {
    // 1. Initialize PostgreSQL Schema
    console.log('[2/4] Applying PostgreSQL DDL Schema (pg_schema.sql)...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'pg_schema.sql'), 'utf-8');
    await client.query(schemaSql);

    // 2. Read Source Data from SQLite
    console.log('[3/4] Extracting records from SQLite & JSON backup stores...');

    const tables = [
      'users',
      'houses',
      'categories',
      'venues',
      'students',
      'judges',
      'programs',
      'program_judges',
      'program_participants',
      'marks',
      'results',
      'certificates',
      'announcements',
      'gallery',
      'settings',
      'audit_logs'
    ];

    const sourceData = {};

    for (const table of tables) {
      sourceData[table] = await sqliteAll(`SELECT * FROM ${table}`);
    }

    // Merge JSON store if SQLite tables had no records
    if (fs.existsSync(jsonStorePath)) {
      try {
        const jsonData = JSON.parse(fs.readFileSync(jsonStorePath, 'utf-8'));
        for (const table of Object.keys(jsonData)) {
          if (Array.isArray(jsonData[table]) && (!sourceData[table] || sourceData[table].length === 0)) {
            sourceData[table] = jsonData[table];
          }
        }
      } catch (e) {}
    }

    // 3. Migrate Tables to PostgreSQL
    console.log('[4/4] Inserting & Verifying records in PostgreSQL...');

    const verificationSummary = {};

    // Users
    if (sourceData.users && sourceData.users.length > 0) {
      for (const u of sourceData.users) {
        await client.query(`
          INSERT INTO users (id, username, email, password, name, role, avatar, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            email = EXCLUDED.email,
            password = EXCLUDED.password,
            name = EXCLUDED.name,
            role = EXCLUDED.role
        `, [u.id, u.username, u.email, u.password, u.name, u.role || 'public', u.avatar, u.created_at || new Date()]);
      }
      await client.query("SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users))");
    }
    verificationSummary.users = (await client.query('SELECT COUNT(*) FROM users')).rows[0].count;

    // Houses
    if (sourceData.houses && sourceData.houses.length > 0) {
      for (const h of sourceData.houses) {
        await client.query(`
          INSERT INTO houses (id, code, name, color_hex, motto, captain_name, total_points, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            total_points = EXCLUDED.total_points
        `, [h.id, h.code, h.name, h.color_hex || '#10B981', h.motto, h.captain_name, h.total_points || 0, h.created_at || new Date()]);
      }
      await client.query("SELECT setval('houses_id_seq', (SELECT COALESCE(MAX(id), 1) FROM houses))");
    }
    verificationSummary.houses = (await client.query('SELECT COUNT(*) FROM houses')).rows[0].count;

    // Categories
    if (sourceData.categories && sourceData.categories.length > 0) {
      for (const c of sourceData.categories) {
        await client.query(`
          INSERT INTO categories (id, name, min_age, max_age, description)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name
        `, [c.id, c.name, c.min_age || 5, c.max_age || 20, c.description]);
      }
      await client.query("SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories))");
    }
    verificationSummary.categories = (await client.query('SELECT COUNT(*) FROM categories')).rows[0].count;

    // Venues
    if (sourceData.venues && sourceData.venues.length > 0) {
      for (const v of sourceData.venues) {
        await client.query(`
          INSERT INTO venues (id, name, stage_number, capacity, location)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name
        `, [v.id, v.name, v.stage_number || 1, v.capacity || 100, v.location]);
      }
      await client.query("SELECT setval('venues_id_seq', (SELECT COALESCE(MAX(id), 1) FROM venues))");
    }
    verificationSummary.venues = (await client.query('SELECT COUNT(*) FROM venues')).rows[0].count;

    // Students
    if (sourceData.students && sourceData.students.length > 0) {
      for (const s of sourceData.students) {
        await client.query(`
          INSERT INTO students (id, student_id, admission_no, name, category_name, arabic_name, photo, gender, dob, age, class_name, division, house_id, parent_name, phone, email, address, qr_code, is_archived, archived_at, archived_by, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            is_archived = EXCLUDED.is_archived
        `, [s.id, s.student_id, s.admission_no, s.name, s.category_name || 'Kiddies', s.arabic_name, s.photo, s.gender || 'male', s.dob, s.age || 10, s.class_name, s.division || 'A', s.house_id, s.parent_name, s.phone, s.email, s.address, s.qr_code, s.is_archived || 0, s.archived_at, s.archived_by, s.created_at || new Date()]);
      }
      await client.query("SELECT setval('students_id_seq', (SELECT COALESCE(MAX(id), 1) FROM students))");
    }
    verificationSummary.students = (await client.query('SELECT COUNT(*) FROM students')).rows[0].count;

    // Programs
    if (sourceData.programs && sourceData.programs.length > 0) {
      for (const p of sourceData.programs) {
        await client.query(`
          INSERT INTO programs (id, code, name, category_id, age_group, type, venue_id, program_date, start_time, end_time, max_participants, status, duration_minutes, is_archived, archived_at, archived_by, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            status = EXCLUDED.status,
            is_archived = EXCLUDED.is_archived
        `, [p.id, p.code, p.name, p.category_id, p.age_group || 'Sub Junior', p.type || 'individual', p.venue_id, p.program_date, p.start_time, p.end_time, p.max_participants || 20, p.status || 'pending', p.duration_minutes || 10, p.is_archived || 0, p.archived_at, p.archived_by, p.created_at || new Date()]);
      }
      await client.query("SELECT setval('programs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM programs))");
    }
    verificationSummary.programs = (await client.query('SELECT COUNT(*) FROM programs')).rows[0].count;

    // Program Participants
    if (sourceData.program_participants && sourceData.program_participants.length > 0) {
      for (const pp of sourceData.program_participants) {
        await client.query(`
          INSERT INTO program_participants (id, program_id, student_id, chest_no, attendance)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO UPDATE SET
            attendance = EXCLUDED.attendance
        `, [pp.id, pp.program_id, pp.student_id, pp.chest_no, pp.attendance || 'pending']);
      }
      await client.query("SELECT setval('program_participants_id_seq', (SELECT COALESCE(MAX(id), 1) FROM program_participants))");
    }
    verificationSummary.program_participants = (await client.query('SELECT COUNT(*) FROM program_participants')).rows[0].count;

    // Marks
    if (sourceData.marks && sourceData.marks.length > 0) {
      for (const m of sourceData.marks) {
        await client.query(`
          INSERT INTO marks (id, program_id, student_id, judge_id, presentation, pronunciation, confidence, voice, content, memorization, time_management, overall_impression, total_mark, status, is_archived, archived_at, archived_by, submitted_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          ON CONFLICT (id) DO UPDATE SET
            total_mark = EXCLUDED.total_mark
        `, [m.id, m.program_id, m.student_id, m.judge_id, m.presentation || 0, m.pronunciation || 0, m.confidence || 0, m.voice || 0, m.content || 0, m.memorization || 0, m.time_management || 0, m.overall_impression || 0, m.total_mark || 0, m.status || 'draft', m.is_archived || 0, m.archived_at, m.archived_by, m.submitted_at || new Date()]);
      }
      await client.query("SELECT setval('marks_id_seq', (SELECT COALESCE(MAX(id), 1) FROM marks))");
    }
    verificationSummary.marks = (await client.query('SELECT COUNT(*) FROM marks')).rows[0].count;

    // Results
    if (sourceData.results && sourceData.results.length > 0) {
      for (const r of sourceData.results) {
        await client.query(`
          INSERT INTO results (id, program_id, student_id, total_score, prize, points_awarded, tie_breaker_note, is_archived, archived_at, archived_by, published_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            prize = EXCLUDED.prize,
            points_awarded = EXCLUDED.points_awarded
        `, [r.id, r.program_id, r.student_id, r.total_score, r.prize, r.points_awarded || 0, r.tie_breaker_note, r.is_archived || 0, r.archived_at, r.archived_by, r.published_at || new Date()]);
      }
      await client.query("SELECT setval('results_id_seq', (SELECT COALESCE(MAX(id), 1) FROM results))");
    }
    verificationSummary.results = (await client.query('SELECT COUNT(*) FROM results')).rows[0].count;

    // Announcements
    if (sourceData.announcements && sourceData.announcements.length > 0) {
      for (const a of sourceData.announcements) {
        await client.query(`
          INSERT INTO announcements (id, title, content, priority, posted_by, is_archived, archived_at, archived_by, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            content = EXCLUDED.content
        `, [a.id, a.title, a.content, a.priority || 'normal', a.posted_by || 'Admin', a.is_archived || 0, a.archived_at, a.archived_by, a.created_at || new Date()]);
      }
      await client.query("SELECT setval('announcements_id_seq', (SELECT COALESCE(MAX(id), 1) FROM announcements))");
    }
    verificationSummary.announcements = (await client.query('SELECT COUNT(*) FROM announcements')).rows[0].count;

    // Gallery
    if (sourceData.gallery && sourceData.gallery.length > 0) {
      for (const g of sourceData.gallery) {
        await client.query(`
          INSERT INTO gallery (id, album_name, title, media_type, url, caption, uploaded_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            url = EXCLUDED.url
        `, [g.id, g.album_name || 'Milad 2026', g.title, g.media_type || 'photo', g.url, g.caption, g.uploaded_at || new Date()]);
      }
      await client.query("SELECT setval('gallery_id_seq', (SELECT COALESCE(MAX(id), 1) FROM gallery))");
    }
    verificationSummary.gallery = (await client.query('SELECT COUNT(*) FROM gallery')).rows[0].count;

    // Settings
    if (sourceData.settings && sourceData.settings.length > 0) {
      for (const st of sourceData.settings) {
        await client.query(`
          INSERT INTO settings (key_name, value)
          VALUES ($1, $2)
          ON CONFLICT (key_name) DO UPDATE SET value = EXCLUDED.value
        `, [st.key_name, st.value]);
      }
    }
    verificationSummary.settings = (await client.query('SELECT COUNT(*) FROM settings')).rows[0].count;

    console.log('\n===========================================================');
    console.log('   PostgreSQL Data Migration & Verification Complete!    ');
    console.log('===========================================================');
    console.table(verificationSummary);
    console.log('\n[SUCCESS] All records successfully migrated & verified in PostgreSQL.\n');

  } catch (err) {
    console.error('\n[MIGRATION ERROR]', err);
  } finally {
    client.release();
    await pgPool.end();
    sqliteDb.close();
  }
}

runMigration();
