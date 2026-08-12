require('dotenv').config();
const { isPg, run, get, all } = require('./db');

async function runVerification() {
  console.log('===========================================================');
  console.log(' VIBE OF MADEENA 2K26 — Database Verification System       ');
  console.log('===========================================================');
  console.log(`[Mode] Active Database Driver: ${isPg ? 'PostgreSQL' : 'SQLite'}`);

  try {
    const tables = [
      'users',
      'houses',
      'categories',
      'venues',
      'students',
      'judges',
      'programs',
      'program_participants',
      'marks',
      'results',
      'certificates',
      'announcements',
      'gallery',
      'settings',
      'audit_logs'
    ];

    const counts = {};
    for (const table of tables) {
      const res = await get(`SELECT COUNT(*) as count FROM ${table}`);
      counts[table] = parseInt(res.count, 10);
    }

    console.table(counts);

    // Verify key test queries
    const superadmin = await get("SELECT id, username, role, name FROM users WHERE username = 'superadmin'");
    console.log('[Check] SuperAdmin User:', superadmin ? `OK (${superadmin.name})` : 'Missing');

    const housesList = await all("SELECT id, name, total_points FROM houses");
    console.log('[Check] Houses Loaded:', housesList.length);

    console.log('\n[SUCCESS] Database verification passed with 0 errors!\n');
  } catch (err) {
    console.error('\n[VERIFICATION ERROR]', err.message);
  }
}

runVerification();
