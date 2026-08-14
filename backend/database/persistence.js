const fs = require('fs');
const path = require('path');

const localSnapshotPath = path.join(__dirname, 'production_database_store.json');
const tmpSnapshotPath = path.join('/tmp', 'production_database_store.json');

function getLatestSnapshotData() {
  let bestSnapshot = null;
  let bestTime = -1;

  for (const filePath of [tmpSnapshotPath, localSnapshotPath]) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        const time = parsed && parsed.last_synced ? new Date(parsed.last_synced).getTime() : 0;
        if (!bestSnapshot || time >= bestTime) {
          bestSnapshot = parsed;
          bestTime = time;
        }
      }
    } catch (e) {}
  }
  return bestSnapshot;
}

function writeSnapshotData(snapshotData) {
  const jsonStr = JSON.stringify(snapshotData, null, 2);
  for (const filePath of [tmpSnapshotPath, localSnapshotPath]) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, jsonStr, 'utf-8');
      console.log(`[PERSISTENCE] Database snapshot saved to ${filePath}`);
    } catch (e) {
      // Ignore write errors for read-only static Vercel build dirs
    }
  }
}

// Save entire SQLite database state to JSON snapshot file
async function syncDatabaseSnapshot(dbHelpers) {
  try {
    const { all } = dbHelpers;
    const snapshot = {
      settings: await all('SELECT * FROM settings'),
      students: await all('SELECT * FROM students'),
      programs: await all('SELECT * FROM programs'),
      program_participants: await all('SELECT * FROM program_participants'),
      houses: await all('SELECT * FROM houses'),
      categories: await all('SELECT * FROM categories'),
      venues: await all('SELECT * FROM venues'),
      results: await all('SELECT * FROM results'),
      announcements: await all('SELECT * FROM announcements'),
      gallery: await all('SELECT * FROM gallery'),
      marks: await all('SELECT * FROM marks'),
      certificates: await all('SELECT * FROM certificates'),
      audit_logs: await all('SELECT * FROM audit_logs'),
      last_synced: new Date().toISOString()
    };

    writeSnapshotData(snapshot);
  } catch (err) {
    console.error('[PERSISTENCE ERROR] Failed to save database snapshot:', err.message);
  }
}

// Restore SQLite tables from JSON snapshot if empty or after fresh deployment
async function restoreFromDatabaseSnapshot(dbHelpers) {
  try {
    const snapshot = getLatestSnapshotData();
    if (!snapshot) {
      console.log('[PERSISTENCE] No snapshot file found. Using standard initialization.');
      return;
    }
    const { run, get } = dbHelpers;
    console.log(`[PERSISTENCE] Restoring from latest snapshot (Last Synced: ${snapshot.last_synced || 'N/A'})...`);

    // Restore Settings
    if (Array.isArray(snapshot.settings) && snapshot.settings.length > 0) {
      for (const st of snapshot.settings) {
        if (st.key_name) {
          await run(`
            INSERT OR REPLACE INTO settings (key_name, value)
            VALUES (?, ?)
          `, [st.key_name, String(st.value || '')]);
        }
      }
    }

    // Restore Students
    if (Array.isArray(snapshot.students) && snapshot.students.length > 0) {
      const currentCount = await get('SELECT COUNT(*) as count FROM students');
      if (!currentCount || currentCount.count === 0) {
        console.log(`[PERSISTENCE] Restoring ${snapshot.students.length} production students from snapshot...`);
        for (const s of snapshot.students) {
          await run(`
            INSERT OR REPLACE INTO students (id, student_id, admission_no, name, category_name, arabic_name, photo, gender, dob, age, class_name, division, house_id, parent_name, phone, email, address, qr_code, is_archived, archived_at, archived_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [s.id, s.student_id, s.admission_no, s.name, s.category_name, s.arabic_name, s.photo, s.gender, s.dob, s.age, s.class_name, s.division, s.house_id, s.parent_name, s.phone, s.email, s.address, s.qr_code, s.is_archived || 0, s.archived_at, s.archived_by, s.created_at]);
        }
      }
    }

    // Restore Programs
    if (Array.isArray(snapshot.programs) && snapshot.programs.length > 0) {
      const currentCount = await get('SELECT COUNT(*) as count FROM programs');
      if (!currentCount || currentCount.count === 0) {
        console.log(`[PERSISTENCE] Restoring ${snapshot.programs.length} production programs from snapshot...`);
        for (const p of snapshot.programs) {
          await run(`
            INSERT OR REPLACE INTO programs (id, code, name, category_id, age_group, type, gender_category, stage_type, venue_id, program_date, start_time, end_time, max_participants, status, duration_minutes, is_archived, archived_at, archived_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [p.id, p.code || p.stage_type || 'On Stage', p.name, p.category_id, p.age_group, p.type, p.gender_category || 'Male', p.stage_type || p.code || 'On Stage', p.venue_id, p.program_date, p.start_time, p.end_time, p.max_participants, p.status, p.duration_minutes, p.is_archived || 0, p.archived_at, p.archived_by, p.created_at]);
        }
      }
    }

    // Restore Program Participants
    if (Array.isArray(snapshot.program_participants) && snapshot.program_participants.length > 0) {
      const currentCount = await get('SELECT COUNT(*) as count FROM program_participants');
      if (!currentCount || currentCount.count === 0) {
        for (const pp of snapshot.program_participants) {
          await run(`
            INSERT OR REPLACE INTO program_participants (id, program_id, student_id, chest_no, attendance)
            VALUES (?, ?, ?, ?, ?)
          `, [pp.id, pp.program_id, pp.student_id, pp.chest_no, pp.attendance]);
        }
      }
    }

    // Restore Announcements
    if (Array.isArray(snapshot.announcements) && snapshot.announcements.length > 0) {
      const currentCount = await get('SELECT COUNT(*) as count FROM announcements');
      if (!currentCount || currentCount.count === 0) {
        console.log(`[PERSISTENCE] Restoring ${snapshot.announcements.length} announcements from snapshot...`);
        for (const a of snapshot.announcements) {
          await run(`
            INSERT OR REPLACE INTO announcements (id, title, content, priority, posted_by, is_archived, archived_at, archived_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [a.id, a.title, a.content, a.priority, a.posted_by, a.is_archived || 0, a.archived_at, a.archived_by, a.created_at]);
        }
      }
    }

    // Restore Gallery
    if (Array.isArray(snapshot.gallery) && snapshot.gallery.length > 0) {
      const currentCount = await get('SELECT COUNT(*) as count FROM gallery');
      if (!currentCount || currentCount.count === 0) {
        console.log(`[PERSISTENCE] Restoring ${snapshot.gallery.length} gallery media items from snapshot...`);
        for (const g of snapshot.gallery) {
          await run(`
            INSERT OR REPLACE INTO gallery (id, album_name, title, media_type, url, caption, uploaded_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [g.id, g.album_name, g.title, g.media_type, g.url, g.caption, g.uploaded_at]);
        }
      }
    }

    // Restore Results
    if (Array.isArray(snapshot.results) && snapshot.results.length > 0) {
      const currentCount = await get('SELECT COUNT(*) as count FROM results');
      if (!currentCount || currentCount.count === 0) {
        console.log(`[PERSISTENCE] Restoring ${snapshot.results.length} results from snapshot...`);
        for (const r of snapshot.results) {
          await run(`
            INSERT OR REPLACE INTO results (id, program_id, student_id, total_score, prize, points_awarded, tie_breaker_note, is_archived, archived_at, archived_by, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [r.id, r.program_id, r.student_id, r.total_score, r.prize, r.points_awarded, r.tie_breaker_note, r.is_archived || 0, r.archived_at, r.archived_by, r.published_at]);
        }
      }
    }

    console.log('[PERSISTENCE] Snapshot restoration completed successfully.');
  } catch (err) {
    console.error('[PERSISTENCE ERROR] Failed to restore from database snapshot:', err.message);
  }
}

module.exports = {
  syncDatabaseSnapshot,
  restoreFromDatabaseSnapshot,
  writeSnapshotData,
  getLatestSnapshotData
};
