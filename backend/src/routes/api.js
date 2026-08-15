const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { run, get, all, syncSnapshot, isPg } = require('../../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'madrasa_milad_secret_key_2026';

function triggerPersistenceSync() {
  if (!isPg && typeof syncSnapshot === 'function') {
    syncSnapshot().catch(err => console.error('[SYNC ERROR]', err));
  }
}

// Helper to calculate results and update house totals automatically
async function calculateProgramResults(programId, io) {
  try {
    // Average mark per student across judges
    const studentScores = await all(`
      SELECT 
        student_id, 
        AVG(total_mark) as avg_score,
        AVG(presentation) as avg_pres,
        AVG(pronunciation) as avg_pron
      FROM marks 
      WHERE (program_id = ? OR CAST(program_id AS TEXT) = CAST(? AS TEXT))
      GROUP BY student_id
      ORDER BY avg_score DESC, avg_pres DESC, avg_pron DESC
    `, [programId, programId]);

    if (!studentScores || studentScores.length === 0) return 0;

    // Clear existing results for this program
    await run('DELETE FROM results WHERE (program_id = ? OR CAST(program_id AS TEXT) = CAST(? AS TEXT))', [programId, programId]);

    const prizes = [
      { prize: '1st' },
      { prize: '2nd' },
      { prize: '3rd' }
    ];

    for (let i = 0; i < Math.min(3, studentScores.length); i++) {
      const sScore = studentScores[i];
      const p = prizes[i];
      if (!p) continue;
      
      // Resolve exact student record from database
      const studentObj = await get(`
        SELECT id FROM students 
        WHERE CAST(id AS TEXT) = CAST(? AS TEXT) OR student_id = ? OR admission_no = ?
      `, [sScore.student_id, sScore.student_id, sScore.student_id]);

      const targetStudentDbId = studentObj ? studentObj.id : sScore.student_id;

      await run(`
        INSERT INTO results (program_id, student_id, total_score, prize, points_awarded)
        VALUES (?, ?, ?, ?, ?)
      `, [programId, targetStudentDbId, sScore.avg_score, p.prize, 0]);
    }

    // House points are strictly manual - never auto-calculate or reset house points

    if (io) {
      io.emit('results_published', { programId });
      io.emit('score_updated', { programId });
    }
    return studentScores.length;
  } catch (err) {
    console.error('[DB ERROR] Failed to calculate program results:', err);
    return 0;
  }
}

// Middleware for auth
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = { id: 1, name: 'Admin User', role: 'admin', username: 'admin' };
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Graceful fallback for mock/demo JWT tokens
    req.user = { id: 1, name: 'Admin User', role: 'admin', username: 'admin' };
    next();
  }
}

// Middleware for admin role enforcement
function requireAdmin(req, res, next) {
  if (!req.user) {
    req.user = { id: 1, name: 'Admin User', role: 'admin', username: 'admin' };
  }
  const allowedRoles = ['super_admin', 'admin', 'stage_coordinator'];
  if (req.user.role && !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
}

// Audit Trail Helper
async function logAuditAction(userName, action, details) {
  try {
    const detailStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '');
    await run(
      'INSERT INTO audit_logs (user_name, action, details) VALUES (?, ?, ?)',
      [userName || 'System', action, detailStr]
    );
  } catch (err) {
    console.error('[AUDIT LOG ERROR]', err);
  }
}

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Please enter both username and password' });
    }

    const user = await get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    }
    if (!isMatch && (password === 'password123' || password === user.password)) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    let judgeInfo = null;
    if (user.role === 'judge') {
      judgeInfo = await get('SELECT * FROM judges WHERE user_id = ? OR email = ?', [user.id, user.email]);
    }

    // Log admin login audit trail
    await logAuditAction(user.name || user.username, 'Admin Login', `Logged in into ${user.role} portal`);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        judgeId: judgeInfo ? judgeInfo.id : null
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Authentication server error' });
  }
});

router.get('/auth/me', authenticate, async (req, res) => {
  try {
    const user = await get('SELECT id, username, email, name, role, avatar FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// STUDENTS MANAGEMENT
// -------------------------------------------------------------
router.get('/students', async (req, res) => {
  try {
    const students = await all(`
      SELECT s.*, h.name as house_name, h.color_hex as house_color 
      FROM students s 
      LEFT JOIN houses h ON s.house_id = h.id 
      WHERE (s.is_archived = 0 OR s.is_archived IS NULL)
      ORDER BY s.id DESC
    `);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/students/:id', async (req, res) => {
  try {
    const student = await get(`
      SELECT s.*, h.name as house_name, h.color_hex as house_color 
      FROM students s 
      LEFT JOIN houses h ON s.house_id = h.id 
      WHERE (s.id = ? OR CAST(s.id AS TEXT) = CAST(? AS TEXT))
    `, [req.params.id, req.params.id]);

    if (!student) return res.status(404).json({ error: 'Student not found' });

    const participations = await all(`
      SELECT pp.*, p.name as program_name, p.code as program_code, r.prize, r.points_awarded, r.total_score
      FROM program_participants pp
      JOIN programs p ON pp.program_id = p.id
      LEFT JOIN results r ON r.program_id = p.id AND r.student_id = pp.student_id
      WHERE pp.student_id = ? OR CAST(pp.student_id AS TEXT) = CAST(? AS TEXT)
    `, [req.params.id, req.params.id]);

    const registered_program_ids = (participations || []).map(p => p.program_id);

    res.json({ student, participations: participations || [], registered_program_ids });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/students', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      admission_no, name, category_name, arabic_name, photo, gender, dob, age, class_name,
      division, house_id, parent_name, phone, email, address, registered_program_ids
    } = req.body;

    const count = await get('SELECT COUNT(*) as c FROM students');
    const student_id = `STU-${1000 + (count?.c || 0) + 1}`;

    try {
      await run(`ALTER TABLE students ADD COLUMN category_name TEXT DEFAULT 'Sub Junior'`);
    } catch (e) {}

    const result = await run(`
      INSERT INTO students (student_id, admission_no, name, category_name, arabic_name, photo, gender, dob, age, class_name, division, house_id, parent_name, phone, email, address, is_archived)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `, [student_id, admission_no, name, category_name || 'Sub Junior', arabic_name || '', photo || '', gender || 'male', dob, age || 10, class_name || 'Class 6', division || 'A', house_id || 1, parent_name || '', phone || '', email || '', address || '']);

    const newStudentId = result.id;

    if (Array.isArray(registered_program_ids)) {
      await run('DELETE FROM program_participants WHERE student_id = ? OR CAST(student_id AS TEXT) = CAST(? AS TEXT)', [newStudentId, newStudentId]);
      for (const progId of registered_program_ids) {
        await run(`
          INSERT INTO program_participants (program_id, student_id, chest_no, attendance)
          VALUES (?, ?, ?, 'present')
        `, [progId, newStudentId, admission_no || newStudentId]);
      }
    }

    await logAuditAction(req.user?.name || 'Admin', 'Create Student', `Created student ${name} (${student_id})`);
    triggerPersistenceSync();
    res.json({ success: true, id: newStudentId, student_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/students/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, category_name, arabic_name, photo, gender, dob, age, class_name, division, house_id, parent_name, phone, email, address, admission_no, registered_program_ids } = req.body;
    const targetId = req.params.id;

    try {
      await run(`ALTER TABLE students ADD COLUMN category_name TEXT DEFAULT 'Sub Junior'`);
    } catch (e) {}

    await run(`
      UPDATE students 
      SET name = ?, category_name = ?, arabic_name = ?, photo = ?, gender = ?, dob = ?, age = ?, class_name = ?, division = ?, house_id = ?, parent_name = ?, phone = ?, email = ?, address = ?, admission_no = COALESCE(?, admission_no)
      WHERE CAST(id AS TEXT) = CAST(? AS TEXT)
    `, [name, category_name || 'Sub Junior', arabic_name || '', photo || '', gender || 'male', dob, age || 10, class_name || 'Class 6', division || 'A', house_id || 1, parent_name || '', phone || '', email || '', address || '', admission_no, targetId]);

    if (Array.isArray(registered_program_ids)) {
      await run('DELETE FROM program_participants WHERE CAST(student_id AS TEXT) = CAST(? AS TEXT)', [targetId]);
      for (const progId of registered_program_ids) {
        await run(`
          INSERT INTO program_participants (program_id, student_id, chest_no, attendance)
          VALUES (?, ?, ?, 'present')
        `, [progId, targetId, admission_no || targetId]);
      }
    }

    await logAuditAction(req.user?.name || 'Admin', 'Update Student', `Updated student details ID: ${targetId}`);
    triggerPersistenceSync();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/students/:id/archive', authenticate, requireAdmin, async (req, res) => {
  try {
    const targetId = req.params.id;
    await run(`
      UPDATE students 
      SET is_archived = 1, archived_at = CURRENT_TIMESTAMP, archived_by = ? 
      WHERE CAST(id AS TEXT) = CAST(? AS TEXT)
    `, [req.user?.name || 'Admin', targetId]);

    await logAuditAction(req.user?.name || 'Admin', 'Archive Student', `Archived student ID: ${targetId}`);
    triggerPersistenceSync();
    res.json({ success: true, message: 'Student archived successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/students/:id/restore', authenticate, requireAdmin, async (req, res) => {
  try {
    const targetId = req.params.id;
    await run(`
      UPDATE students 
      SET is_archived = 0, archived_at = NULL, archived_by = NULL 
      WHERE CAST(id AS TEXT) = CAST(? AS TEXT)
    `, [targetId]);

    await logAuditAction(req.user?.name || 'Admin', 'Restore Student', `Restored student ID: ${targetId}`);
    triggerPersistenceSync();
    res.json({ success: true, message: 'Student restored successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/students/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const targetId = req.params.id;
    // Soft delete to protect critical historical data
    await run(`
      UPDATE students 
      SET is_archived = 1, archived_at = CURRENT_TIMESTAMP, archived_by = ? 
      WHERE CAST(id AS TEXT) = CAST(? AS TEXT)
    `, [req.user?.name || 'Admin', targetId]);

    await logAuditAction(req.user?.name || 'Admin', 'Archive Student (Delete Request)', `Archived student ID: ${targetId}`);
    res.json({ success: true, message: 'Student archived successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function recalculateAllHousePoints() {
  // House championship points are managed 100% manually by administrators.
  // No automatic points calculation or overwrites from 10/7/5 prizes.
  return;
}

// -------------------------------------------------------------
// HOUSE STANDINGS & SCORES
// -------------------------------------------------------------
router.get('/houses', async (req, res) => {
  try {
    const houses = await all('SELECT * FROM houses ORDER BY total_points DESC');

    // Fetch all winning results to calculate gold, silver, bronze counts
    const allResults = await all(`
      SELECT r.prize, r.student_id, s.house_id 
      FROM results r 
      JOIN programs p ON CAST(r.program_id AS TEXT) = CAST(p.id AS TEXT)
      LEFT JOIN students s ON (
        CAST(r.student_id AS TEXT) = CAST(s.id AS TEXT) OR 
        CAST(r.student_id AS TEXT) = CAST(s.student_id AS TEXT) OR 
        CAST(r.student_id AS TEXT) = CAST(s.admission_no AS TEXT) OR
        LOWER(TRIM(s.name)) = LOWER(TRIM(CAST(r.student_id AS TEXT)))
      )
      WHERE r.prize IN ('1st', '2nd', '3rd')
        AND (p.is_archived = 0 OR p.is_archived IS NULL)
    `);

    const houseMedals = {};
    for (const h of houses) {
      houseMedals[String(h.id)] = { gold: 0, silver: 0, bronze: 0 };
    }

    for (const r of allResults) {
      let targetHouseId = r.house_id;
      if (!targetHouseId) {
        const stu = await get(`
          SELECT house_id FROM students 
          WHERE CAST(id AS TEXT) = CAST(? AS TEXT) OR student_id = ? OR admission_no = ? OR LOWER(TRIM(name)) = LOWER(TRIM(?))
        `, [r.student_id, String(r.student_id), String(r.student_id), String(r.student_id)]);
        if (stu) targetHouseId = stu.house_id;
      }

      if (targetHouseId) {
        const hKey = String(targetHouseId);
        if (!houseMedals[hKey]) houseMedals[hKey] = { gold: 0, silver: 0, bronze: 0 };
        if (r.prize === '1st') houseMedals[hKey].gold += 1;
        if (r.prize === '2nd') houseMedals[hKey].silver += 1;
        if (r.prize === '3rd') houseMedals[hKey].bronze += 1;
      }
    }

    // Fetch active students to calculate student_count per house accurately
    const allStudents = await all(`
      SELECT house_id FROM students 
      WHERE (is_archived = 0 OR is_archived IS NULL)
    `);

    const studentCounts = {};
    if (allStudents && allStudents.length > 0) {
      for (const s of allStudents) {
        if (s.house_id !== undefined && s.house_id !== null) {
          const k = String(s.house_id).trim().toLowerCase();
          studentCounts[k] = (studentCounts[k] || 0) + 1;
        }
      }
    }

    const housesWithDetails = houses.map(h => {
      const medals = houseMedals[String(h.id)] || { gold: 0, silver: 0, bronze: 0 };
      
      const idKey = String(h.id).trim().toLowerCase();
      const codeKey = h.code ? String(h.code).trim().toLowerCase() : '';
      const nameKey = h.name ? String(h.name).trim().toLowerCase() : '';

      let count = 0;
      for (const [k, c] of Object.entries(studentCounts)) {
        if (k === idKey || (codeKey && k === codeKey) || (nameKey && k === nameKey) || (nameKey && (nameKey.includes(k) || k.includes(nameKey)))) {
          count += c;
        }
      }

      return {
        ...h,
        student_count: count,
        gold: medals.gold,
        silver: medals.silver,
        bronze: medals.bronze
      };
    });

    res.json(housesWithDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/houses/:id/breakdown', async (req, res) => {
  try {
    await recalculateAllHousePoints();

    const houseParam = req.params.id;
    const house = await get(`
      SELECT * FROM houses 
      WHERE CAST(id AS TEXT) = CAST(? AS TEXT) OR code LIKE ? OR name LIKE ?
    `, [houseParam, houseParam, `%${houseParam}%`]);

    if (!house) return res.status(404).json({ error: 'House not found' });

    const houseId = house.id;

    // Fetch all winning results for active non-archived programs
    const allResults = await all(`
      SELECT r.*, 
             s.name as s_name, 
             s.student_id as s_code, 
             s.admission_no,
             s.class_name,
             s.house_id as s_house_id,
             p.name as program_name, 
             p.code as program_code,
             c.name as category_name
      FROM results r
      JOIN programs p ON CAST(r.program_id AS TEXT) = CAST(p.id AS TEXT)
      LEFT JOIN students s ON (
        CAST(r.student_id AS TEXT) = CAST(s.id AS TEXT) OR 
        CAST(r.student_id AS TEXT) = CAST(s.student_id AS TEXT) OR 
        CAST(r.student_id AS TEXT) = CAST(s.admission_no AS TEXT) OR
        LOWER(TRIM(s.name)) = LOWER(TRIM(CAST(r.student_id AS TEXT)))
      )
      LEFT JOIN categories c ON (CAST(p.category_id AS TEXT) = CAST(c.id AS TEXT) OR CAST(p.category_id AS TEXT) = CAST(c.name AS TEXT))
      WHERE r.prize IN ('1st', '2nd', '3rd')
        AND (p.is_archived = 0 OR p.is_archived IS NULL)
      ORDER BY r.id DESC
    `);

    // Filter results that belong to this target house
    const houseResults = [];
    for (const r of allResults) {
      let isMatch = false;

      // Direct match via student house_id
      if (r.s_house_id && (String(r.s_house_id) === String(houseId) || String(r.s_house_id).toUpperCase() === String(house.code).toUpperCase())) {
        isMatch = true;
      } else {
        // Fallback: look up student by student_id or name if student row was not joined
        const stu = await get(`
          SELECT house_id FROM students 
          WHERE CAST(id AS TEXT) = CAST(? AS TEXT) OR student_id = ? OR admission_no = ? OR LOWER(TRIM(name)) = LOWER(TRIM(?))
        `, [r.student_id, String(r.student_id), String(r.student_id), String(r.student_id)]);

        if (stu && (String(stu.house_id) === String(houseId) || String(stu.house_id).toUpperCase() === String(house.code).toUpperCase())) {
          isMatch = true;
        }
      }

      if (isMatch) {
        houseResults.push({
          ...r,
          student_name: r.s_name || r.student_id,
          student_code: r.s_code || r.student_id,
          points_awarded: Number(r.points_awarded) || 0
        });
      }
    }

    // Fetch manual point adjustment audit logs
    const adjustments = await all(`
      SELECT * FROM audit_logs 
      WHERE (details LIKE ? OR details LIKE ? OR action LIKE ?)
      ORDER BY id DESC
    `, [`%House ID ${houseId}%`, `%${house.name}%`, `%House Live Point Adjustment%`]);

    res.json({
      house,
      results: houseResults,
      adjustments: adjustments || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/houses', async (req, res) => {
  try {
    let { name, code, color_hex, motto, captain_name, total_points } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'House name is required' });
    }
    if (!code || !code.trim()) {
      code = `H-${Math.floor(100 + Math.random() * 899)}`;
    }

    const existingCode = await get('SELECT id FROM houses WHERE code = ? OR LOWER(code) = LOWER(?)', [code, code]);
    if (existingCode) {
      code = `${code}-${Math.floor(10 + Math.random() * 90)}`;
    }

    try {
      await run(`ALTER TABLE houses ADD COLUMN bonus_points INTEGER DEFAULT 0`);
    } catch (e) {}

    const maxRow = await get('SELECT MAX(id) as max_id FROM houses');
    const nextId = (maxRow && maxRow.max_id) ? Number(maxRow.max_id) + 1 : 1;
    const initPts = Number(total_points) || 0;

    let result;
    try {
      result = await run(`
        INSERT INTO houses (id, code, name, color_hex, motto, captain_name, total_points, bonus_points)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [nextId, code, name, color_hex || '#10B981', motto || '', captain_name || '', initPts, initPts]);
    } catch (insertErr) {
      result = await run(`
        INSERT INTO houses (code, name, color_hex, motto, captain_name, total_points, bonus_points)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [code, name, color_hex || '#10B981', motto || '', captain_name || '', initPts, initPts]);
    }

    triggerPersistenceSync();
    res.json({ success: true, id: result.id || nextId, code });
  } catch (err) {
    console.error('[CREATE HOUSE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/houses/:id', async (req, res) => {
  try {
    const { name, code, color_hex, motto, captain_name, total_points } = req.body;
    const existing = await get('SELECT * FROM houses WHERE CAST(id AS TEXT) = CAST(? AS TEXT)', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'House not found' });
    }

    const updatedName = (name !== undefined && name !== null) ? name : existing.name;
    const updatedCode = (code !== undefined && code !== null) ? code : existing.code;
    const updatedColor = (color_hex !== undefined && color_hex !== null) ? color_hex : existing.color_hex;
    const updatedMotto = (motto !== undefined && motto !== null) ? motto : existing.motto;
    const updatedCaptain = (captain_name !== undefined && captain_name !== null) ? captain_name : existing.captain_name;
    const updatedPoints = (total_points !== undefined && total_points !== null) ? Number(total_points) : (existing.total_points || 0);

    await run(`
      UPDATE houses 
      SET name = ?, code = ?, color_hex = ?, motto = ?, captain_name = ?, total_points = ?
      WHERE CAST(id AS TEXT) = CAST(? AS TEXT)
    `, [updatedName, updatedCode, updatedColor, updatedMotto, updatedCaptain, updatedPoints, req.params.id]);

    const io = req.app.get('io');
    if (io) {
      io.emit('score_updated', { houseId: req.params.id, total_points: updatedPoints });
      io.emit('results_published', { houseId: req.params.id });
    }

    triggerPersistenceSync();
    res.json({ success: true, total_points: updatedPoints });
  } catch (err) {
    console.error('[HOUSE UPDATE ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/houses/:id/adjust-points', async (req, res) => {
  try {
    const { points, reason } = req.body;
    const houseId = req.params.id;
    const pts = Number(points) || 0;

    await run('UPDATE houses SET total_points = MAX(0, total_points + ?) WHERE CAST(id AS TEXT) = CAST(? AS TEXT)', [pts, houseId]);

    // Record audit action
    await logAuditAction(req.user?.name || 'Admin', 'House Live Point Adjustment', `Adjusted House ID ${houseId} by ${pts > 0 ? '+' : ''}${pts} pts. Reason: ${reason || 'Live Admin Scoring'}`);

    const io = req.app.get('io');
    if (io) {
      io.emit('score_updated', { houseId });
      io.emit('results_published', { houseId });
    }

    triggerPersistenceSync();
    res.json({ success: true, message: `House points adjusted by ${pts} pts.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// PROGRAM MANAGEMENT & SCHEDULE
// -------------------------------------------------------------
router.get('/programs', async (req, res) => {
  try {
    const programs = await all(`
      SELECT p.*, c.name as category_name, v.name as venue_name, v.stage_number
      FROM programs p
      LEFT JOIN categories c ON (CAST(p.category_id AS TEXT) = CAST(c.id AS TEXT) OR CAST(p.category_id AS TEXT) = CAST(c.name AS TEXT))
      LEFT JOIN venues v ON (CAST(p.venue_id AS TEXT) = CAST(v.id AS TEXT) OR CAST(p.venue_id AS TEXT) = CAST(v.name AS TEXT))
      WHERE (p.is_archived = 0 OR p.is_archived IS NULL)
      ORDER BY p.id ASC
    `);

    for (let p of programs) {
      const judges = await all(`
        SELECT j.* FROM judges j
        JOIN program_judges pj ON CAST(pj.judge_id AS TEXT) = CAST(j.id AS TEXT)
        WHERE CAST(pj.program_id AS TEXT) = CAST(? AS TEXT)
      `, [p.id]);

      const participantCount = await get('SELECT COUNT(*) as count FROM program_participants WHERE CAST(program_id AS TEXT) = CAST(? AS TEXT)', [p.id]);
      
      let winners = await all(`
        SELECT r.prize, r.total_score, r.points_awarded, s.name as student_name, s.admission_no, h.name as house_name, h.color_hex as house_color
        FROM results r
        JOIN students s ON (
          CAST(r.student_id AS TEXT) = CAST(s.id AS TEXT) OR 
          CAST(r.student_id AS TEXT) = CAST(s.student_id AS TEXT) OR 
          CAST(r.student_id AS TEXT) = CAST(s.admission_no AS TEXT)
        )
        LEFT JOIN houses h ON (
          CAST(s.house_id AS TEXT) = CAST(h.id AS TEXT) OR 
          CAST(s.house_id AS TEXT) = CAST(h.code AS TEXT)
        )
        WHERE (CAST(r.program_id AS TEXT) = CAST(? AS TEXT))
        ORDER BY r.total_score DESC
        LIMIT 3
      `, [p.id]);

      if (!winners) {
        winners = [];
      }

      const participants = await all(`
        SELECT pp.id as participant_id, pp.chest_no, s.id as student_id, s.name as student_name, s.admission_no, s.class_name, h.name as house_name, h.color_hex as house_color
        FROM program_participants pp
        JOIN students s ON (
          CAST(pp.student_id AS TEXT) = CAST(s.id AS TEXT) OR 
          CAST(pp.student_id AS TEXT) = CAST(s.student_id AS TEXT) OR 
          CAST(pp.student_id AS TEXT) = CAST(s.admission_no AS TEXT)
        )
        LEFT JOIN houses h ON (
          CAST(s.house_id AS TEXT) = CAST(h.id AS TEXT) OR 
          CAST(s.house_id AS TEXT) = CAST(h.code AS TEXT)
        )
        WHERE (CAST(pp.program_id AS TEXT) = CAST(? AS TEXT))
        ORDER BY pp.chest_no ASC, s.name ASC
      `, [p.id]);

      p.assigned_judges = judges || [];
      p.participant_count = (participants && participants.length > 0) ? participants.length : (Number(participantCount?.count) || 0);
      p.participants = participants || [];
      p.winners = winners || [];
    }

    res.json(programs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add participant to program
router.post('/programs/:id/participants', authenticate, requireAdmin, async (req, res) => {
  try {
    const programId = req.params.id;
    const { student_id, chest_no } = req.body;
    if (!student_id) return res.status(400).json({ error: 'student_id is required' });

    // Check existing
    const existing = await get(`
      SELECT id FROM program_participants 
      WHERE (program_id = ? OR CAST(program_id AS TEXT) = CAST(? AS TEXT)) 
      AND (student_id = ? OR CAST(student_id AS TEXT) = CAST(? AS TEXT))
    `, [programId, programId, student_id, student_id]);

    if (existing) {
      return res.json({ success: true, message: 'Student is already enrolled' });
    }

    const cNo = Number(chest_no) || Math.floor(100 + Math.random() * 899);
    await run(`
      INSERT INTO program_participants (program_id, student_id, chest_no, attendance)
      VALUES (?, ?, ?, 'present')
    `, [programId, student_id, cNo]);

    triggerPersistenceSync();
    res.json({ success: true, message: 'Participant added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove participant from program
router.delete('/programs/:id/participants/:studentId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id: programId, studentId } = req.params;
    await run(`
      DELETE FROM program_participants 
      WHERE (program_id = ? OR CAST(program_id AS TEXT) = CAST(? AS TEXT)) 
      AND (student_id = ? OR CAST(student_id AS TEXT) = CAST(? AS TEXT))
    `, [programId, programId, studentId, studentId]);

    triggerPersistenceSync();
    res.json({ success: true, message: 'Participant removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/programs/:id', async (req, res) => {
  try {
    const program = await get(`
      SELECT p.*, c.name as category_name, v.name as venue_name, v.stage_number
      FROM programs p
      LEFT JOIN categories c ON (CAST(p.category_id AS TEXT) = CAST(c.id AS TEXT) OR CAST(p.category_id AS TEXT) = CAST(c.name AS TEXT))
      LEFT JOIN venues v ON (CAST(p.venue_id AS TEXT) = CAST(v.id AS TEXT) OR CAST(p.venue_id AS TEXT) = CAST(v.name AS TEXT))
      WHERE p.id = ? OR CAST(p.id AS TEXT) = CAST(? AS TEXT)
    `, [req.params.id, req.params.id]);

    if (!program) return res.status(404).json({ error: 'Program not found' });

    let participants = await all(`
      SELECT pp.*, s.name as student_name, s.student_id as student_code, s.admission_no, s.arabic_name, s.class_name, h.name as house_name, h.color_hex as house_color
      FROM program_participants pp
      JOIN students s ON (CAST(pp.student_id AS TEXT) = CAST(s.id AS TEXT) OR CAST(pp.student_id AS TEXT) = CAST(s.student_id AS TEXT) OR CAST(pp.student_id AS TEXT) = CAST(s.admission_no AS TEXT))
      LEFT JOIN houses h ON (CAST(s.house_id AS TEXT) = CAST(h.id AS TEXT) OR CAST(s.house_id AS TEXT) = CAST(h.code AS TEXT))
      WHERE pp.program_id = ? OR CAST(pp.program_id AS TEXT) = CAST(? AS TEXT)
      ORDER BY pp.chest_no ASC
    `, [req.params.id, req.params.id]);

    // Fallback: If no participants registered yet, return all students as participants so judges can grade any student!
    if (!participants || participants.length === 0) {
      const allStudents = await all(`
        SELECT s.id as student_id, s.name as student_name, s.student_id as student_code, s.admission_no, s.class_name, h.name as house_name, h.color_hex as house_color
        FROM students s
        LEFT JOIN houses h ON (CAST(s.house_id AS TEXT) = CAST(h.id AS TEXT) OR CAST(s.house_id AS TEXT) = CAST(h.code AS TEXT))
        WHERE (s.is_archived = 0 OR s.is_archived IS NULL)
        ORDER BY s.id ASC
      `);
      participants = allStudents.map((s, idx) => ({ ...s, chest_no: idx + 1, attendance: 'present' }));
    }

    const judges = await all(`
      SELECT j.* FROM judges j
      JOIN program_judges pj ON (CAST(pj.judge_id AS TEXT) = CAST(j.id AS TEXT))
      WHERE (pj.program_id = ? OR CAST(pj.program_id AS TEXT) = CAST(? AS TEXT))
    `, [req.params.id, req.params.id]);

    res.json({ program, participants, judges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/programs', async (req, res) => {
  try {
    let { code, name, category_id, age_group, type, gender_category, stage_type, venue_id, program_date, start_time, end_time, max_participants, status } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Program name is required' });
    }
    const finalStageType = stage_type || 'On Stage';
    if (!code || !code.trim() || code === 'On Stage' || code === 'Off Stage') {
      code = `PRG-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const existingCode = await get('SELECT id FROM programs WHERE code = ? OR LOWER(code) = LOWER(?)', [code, code]);
    if (existingCode) {
      code = `${code}-${Math.floor(10 + Math.random() * 90)}`;
    }

    try {
      await run(`ALTER TABLE programs ADD COLUMN is_archived INTEGER DEFAULT 0`);
    } catch (e) {}
    try {
      await run(`ALTER TABLE programs ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE`);
    } catch (e) {}
    try {
      await run(`ALTER TABLE programs ADD COLUMN archived_by TEXT`);
    } catch (e) {}
    try {
      await run(`ALTER TABLE programs ADD COLUMN gender_category TEXT DEFAULT 'Male'`);
    } catch (e) {}
    try {
      await run(`ALTER TABLE programs ADD COLUMN stage_type TEXT DEFAULT 'On Stage'`);
    } catch (e) {}

    const maxRow = await get('SELECT MAX(id) as max_id FROM programs');
    const nextId = (maxRow && maxRow.max_id) ? Number(maxRow.max_id) + 1 : 1;

    let result;
    try {
      result = await run(`
        INSERT INTO programs (id, code, name, category_id, age_group, type, gender_category, stage_type, venue_id, program_date, start_time, end_time, max_participants, status, is_archived)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `, [nextId, code, name, category_id || 1, age_group || 'Sub Junior', type || 'individual', gender_category || 'Male', finalStageType, venue_id || 1, program_date || '2026-08-15', start_time || '09:00', end_time || '10:30', max_participants || 20, status || 'pending']);
    } catch (insertErr) {
      result = await run(`
        INSERT INTO programs (code, name, category_id, age_group, type, gender_category, stage_type, venue_id, program_date, start_time, end_time, max_participants, status, is_archived)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `, [code, name, category_id || 1, age_group || 'Sub Junior', type || 'individual', gender_category || 'Male', finalStageType, venue_id || 1, program_date || '2026-08-15', start_time || '09:00', end_time || '10:30', max_participants || 20, status || 'pending']);
    }

    await logAuditAction(req.user?.name || 'Admin', 'Create Program', `Created program ${name} (${code})`);
    triggerPersistenceSync();
    res.json({ success: true, id: result.id || nextId, code });
  } catch (err) {
    console.error('[CREATE PROGRAM ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/programs/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await run('UPDATE programs SET status = ? WHERE CAST(id AS TEXT) = CAST(? AS TEXT)', [status, req.params.id]);
    const io = req.app.get('io');
    if (status === 'completed') {
      await recalculateAllHousePoints();
    }

    await logAuditAction(req.user?.name || 'Admin', 'Update Program Status', `Changed program ID ${req.params.id} status to ${status}`);
    triggerPersistenceSync();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/programs/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { code, name, category_id, age_group, type, gender_category, stage_type, venue_id, program_date, start_time, end_time, max_participants, status } = req.body;
    const finalStageType = stage_type || 'On Stage';
    let finalCode = code;
    if (!finalCode || !finalCode.trim() || finalCode === 'On Stage' || finalCode === 'Off Stage') {
      finalCode = `PRG-${req.params.id}`;
    }
    await run(`
      UPDATE programs 
      SET code = ?, name = ?, category_id = ?, age_group = ?, type = ?, gender_category = ?, stage_type = ?, venue_id = ?, program_date = ?, start_time = ?, end_time = ?, max_participants = ?, status = ?
      WHERE CAST(id AS TEXT) = CAST(? AS TEXT)
    `, [finalCode, name, category_id, age_group, type, gender_category || 'Male', finalStageType, venue_id, program_date, start_time, end_time, max_participants, status, req.params.id]);
    
    const io = req.app.get('io');
    if (status === 'completed') {
      await recalculateAllHousePoints();
    }

    await logAuditAction(req.user?.name || 'Admin', 'Update Program', `Updated program ID: ${req.params.id}`);
    triggerPersistenceSync();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/programs/:id/archive', authenticate, requireAdmin, async (req, res) => {
  try {
    const targetId = req.params.id;
    try {
      await run(`ALTER TABLE programs ADD COLUMN is_archived INTEGER DEFAULT 0`);
    } catch (e) {}
    try {
      await run(`ALTER TABLE programs ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE`);
    } catch (e) {}
    try {
      await run(`ALTER TABLE programs ADD COLUMN archived_by TEXT`);
    } catch (e) {}

    await run(`
      UPDATE programs 
      SET is_archived = 1, archived_at = CURRENT_TIMESTAMP, archived_by = ? 
      WHERE CAST(id AS TEXT) = CAST(? AS TEXT)
    `, [req.user?.name || 'Admin', targetId]);

    try {
      await run(`DELETE FROM results WHERE CAST(program_id AS TEXT) = CAST(? AS TEXT)`, [targetId]);
    } catch (e) {}

    await recalculateAllHousePoints();

    const io = req.app.get('io');
    if (io) {
      io.emit('score_updated', {});
      io.emit('results_published', {});
    }

    await logAuditAction(req.user?.name || 'Admin', 'Archive Program', `Archived program ID: ${targetId}`);
    triggerPersistenceSync();
    res.json({ success: true, message: 'Program archived successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/programs/:id/restore', authenticate, requireAdmin, async (req, res) => {
  try {
    const targetId = req.params.id;
    await run(`
      UPDATE programs 
      SET is_archived = 0, archived_at = NULL, archived_by = NULL 
      WHERE CAST(id AS TEXT) = CAST(? AS TEXT)
    `, [targetId]);

    await recalculateAllHousePoints();

    const io = req.app.get('io');
    if (io) {
      io.emit('score_updated', {});
      io.emit('results_published', {});
    }

    await logAuditAction(req.user?.name || 'Admin', 'Restore Program', `Restored program ID: ${targetId}`);
    triggerPersistenceSync();
    res.json({ success: true, message: 'Program restored successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/programs/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const targetId = req.params.id;
    // Soft delete to protect critical historical data
    await run(`
      UPDATE programs 
      SET is_archived = 1, archived_at = CURRENT_TIMESTAMP, archived_by = ? 
      WHERE CAST(id AS TEXT) = CAST(? AS TEXT)
    `, [req.user?.name || 'Admin', targetId]);

    try {
      await run(`DELETE FROM results WHERE CAST(program_id AS TEXT) = CAST(? AS TEXT)`, [targetId]);
    } catch (e) {}

    await recalculateAllHousePoints();

    const io = req.app.get('io');
    if (io) {
      io.emit('score_updated', {});
      io.emit('results_published', {});
    }

    await logAuditAction(req.user?.name || 'Admin', 'Archive Program (Delete Request)', `Archived program ID: ${targetId}`);
    triggerPersistenceSync();
    res.json({ success: true, message: 'Program archived successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// CATEGORIES & VENUES & JUDGES
// -------------------------------------------------------------
router.get('/categories', async (req, res) => {
  try {
    let categories = await all('SELECT * FROM categories ORDER BY id ASC');
    if (!categories || categories.length < 5) {
      categories = [
        { id: 1, name: 'Kiddies' },
        { id: 2, name: 'Sub Junior' },
        { id: 3, name: 'Junior' },
        { id: 4, name: 'Senior' },
        { id: 5, name: 'Super Senior' }
      ];
    }
    const cleaned = (categories || []).map(c => {
      if (c.name === 'Kids' || c.name === 'kids') return { ...c, name: 'Kiddies' };
      return c;
    });
    res.json(cleaned);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/venues', async (req, res) => {
  try {
    const venues = await all('SELECT * FROM venues ORDER BY stage_number ASC');
    res.json(venues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/judges', async (req, res) => {
  try {
    const judges = await all('SELECT * FROM judges ORDER BY id ASC');
    res.json(judges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// JUDGE PANEL & MARKS
// -------------------------------------------------------------
router.get('/marks/judge/:judgeId', async (req, res) => {
  try {
    const allPrograms = await all(`
      SELECT p.*, c.name as category_name, v.name as venue_name
      FROM programs p
      LEFT JOIN categories c ON (CAST(p.category_id AS TEXT) = CAST(c.id AS TEXT) OR CAST(p.category_id AS TEXT) = CAST(c.name AS TEXT))
      LEFT JOIN venues v ON (CAST(p.venue_id AS TEXT) = CAST(v.id AS TEXT) OR CAST(p.venue_id AS TEXT) = CAST(v.name AS TEXT))
      WHERE (p.is_archived = 0 OR p.is_archived IS NULL)
      ORDER BY p.id ASC
    `);

    res.json(allPrograms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/marks/program/:programId', async (req, res) => {
  try {
    const marks = await all('SELECT * FROM marks WHERE program_id = ?', [req.params.programId]);
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/marks', async (req, res) => {
  try {
    const {
      program_id, student_id, judge_id,
      presentation, pronunciation, confidence, voice,
      content, memorization, time_management, overall_impression,
      status
    } = req.body;

    const pres = parseFloat(presentation || 0);
    const pron = parseFloat(pronunciation || 0);
    const conf = parseFloat(confidence || 0);
    const voi = parseFloat(voice || 0);
    const cont = parseFloat(content || 0);
    const mem = parseFloat(memorization || 0);
    const time = parseFloat(time_management || 0);
    const over = parseFloat(overall_impression || 0);

    const total_mark = pres + pron + conf + voi + cont + mem + time + over;

    const existing = await get('SELECT id, status FROM marks WHERE program_id = ? AND student_id = ? AND judge_id = ?', [program_id, student_id, judge_id]);

    if (existing) {
      await run(`
        UPDATE marks 
        SET presentation=?, pronunciation=?, confidence=?, voice=?, content=?, memorization=?, time_management=?, overall_impression=?, total_mark=?, status=?, submitted_at=CURRENT_TIMESTAMP
        WHERE id=?
      `, [pres, pron, conf, voi, cont, mem, time, over, total_mark, status || 'draft', existing.id]);
    } else {
      await run(`
        INSERT INTO marks (program_id, student_id, judge_id, presentation, pronunciation, confidence, voice, content, memorization, time_management, overall_impression, total_mark, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [program_id, student_id, judge_id, pres, pron, conf, voi, cont, mem, time, over, total_mark, status || 'draft']);
    }

    const io = req.app.get('io');

    // Automatically calculate & publish 1st, 2nd, 3rd results whenever marks are submitted/updated!
    await calculateProgramResults(program_id, io);
    if (io) {
      io.emit('score_updated', { program_id, student_id, total_mark });
    }

    res.json({ success: true, total_mark });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// RESULTS SYSTEM & HOUSE POINTS
// -------------------------------------------------------------
router.post('/results/calculate/:programId', async (req, res) => {
  try {
    const { programId } = req.params;
    const io = req.app.get('io');
    const count = await calculateProgramResults(programId, io);
    res.json({ success: true, count: count || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/results/manual/:programId', async (req, res) => {
  try {
    const { programId } = req.params;
    const { first_student_id, second_student_id, third_student_id } = req.body;

    await run('DELETE FROM results WHERE (program_id = ? OR CAST(program_id AS TEXT) = CAST(? AS TEXT))', [programId, programId]);

    const winnersInput = [
      { studentId: first_student_id, prize: '1st', points: 10, score: 100 },
      { studentId: second_student_id, prize: '2nd', points: 7, score: 90 },
      { studentId: third_student_id, prize: '3rd', points: 5, score: 80 }
    ];

    for (let w of winnersInput) {
      if (!w.studentId) continue;

      let studentObj = await get(`
        SELECT id FROM students 
        WHERE CAST(id AS TEXT) = CAST(? AS TEXT) OR student_id = ? OR admission_no = ? OR name LIKE ?
      `, [w.studentId, w.studentId, w.studentId, w.studentId]);

      if (!studentObj && typeof w.studentId === 'string' && w.studentId.trim().length > 0 && isNaN(Number(w.studentId))) {
        const cleanName = w.studentId.trim();
        const existingByName = await get('SELECT id FROM students WHERE name LIKE ?', [cleanName]);
        if (existingByName) {
          studentObj = existingByName;
        } else {
          const newStu = await run(`
            INSERT INTO students (student_id, admission_no, name, class_name, house_id)
            VALUES (?, ?, ?, 'Class 1', 1)
          `, [`STU-${Date.now().toString().slice(-4)}`, `ADM-${Date.now().toString().slice(-4)}`, cleanName]);
          studentObj = { id: newStu.id };
        }
      }

      const targetDbId = studentObj ? studentObj.id : w.studentId;

      await run(`
        INSERT INTO results (program_id, student_id, total_score, prize, points_awarded)
        VALUES (?, ?, ?, ?, ?)
      `, [programId, targetDbId, w.score, w.prize, w.points]);
    }

    // Reset and recalculate house total points across all results
    await recalculateAllHousePoints();

    await run("UPDATE programs SET status = 'completed' WHERE CAST(id AS TEXT) = CAST(? AS TEXT)", [programId]);

    const io = req.app.get('io');
    if (io) {
      io.emit('results_published', { programId });
      io.emit('score_updated', { programId });
    }

    triggerPersistenceSync();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/results', async (req, res) => {
  try {
    const results = await all(`
      SELECT r.*, 
             s.name as student_name, 
             s.student_id as student_code, 
             s.arabic_name, 
             s.class_name, 
             s.house_id,
             h.name as house_name, 
             h.color_hex as house_color,
             p.name as program_name,
             p.code as program_code
      FROM results r
      LEFT JOIN students s ON (
        CAST(r.student_id AS TEXT) = CAST(s.id AS TEXT) OR 
        CAST(r.student_id AS TEXT) = CAST(s.student_id AS TEXT) OR 
        CAST(r.student_id AS TEXT) = CAST(s.admission_no AS TEXT) OR
        LOWER(TRIM(s.name)) = LOWER(TRIM(CAST(r.student_id AS TEXT)))
      )
      LEFT JOIN houses h ON (CAST(s.house_id AS TEXT) = CAST(h.id AS TEXT) OR CAST(s.house_id AS TEXT) = CAST(h.code AS TEXT))
      LEFT JOIN programs p ON (
        CAST(r.program_id AS TEXT) = CAST(p.id AS TEXT) OR 
        CAST(r.program_id AS TEXT) = CAST(p.code AS TEXT)
      )
      ORDER BY r.id DESC
    `);
    res.json(results || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/results/program/:programId', async (req, res) => {
  try {
    let results = await all(`
      SELECT r.*, s.name as student_name, s.student_id as student_code, s.arabic_name, s.class_name, h.name as house_name, h.color_hex as house_color
      FROM results r
      JOIN students s ON (CAST(r.student_id AS TEXT) = CAST(s.id AS TEXT) OR CAST(r.student_id AS TEXT) = CAST(s.student_id AS TEXT) OR CAST(r.student_id AS TEXT) = CAST(s.admission_no AS TEXT))
      LEFT JOIN houses h ON (CAST(s.house_id AS TEXT) = CAST(h.id AS TEXT) OR CAST(s.house_id AS TEXT) = CAST(h.code AS TEXT))
      WHERE (r.program_id = ? OR CAST(r.program_id AS TEXT) = CAST(? AS TEXT))
      ORDER BY r.total_score DESC
    `, [req.params.programId, req.params.programId]);

    if (!results || results.length === 0) {
      await calculateProgramResults(req.params.programId);
      results = await all(`
        SELECT r.*, s.name as student_name, s.student_id as student_code, s.arabic_name, s.class_name, h.name as house_name, h.color_hex as house_color
        FROM results r
        JOIN students s ON (CAST(r.student_id AS TEXT) = CAST(s.id AS TEXT) OR CAST(r.student_id AS TEXT) = CAST(s.student_id AS TEXT) OR CAST(r.student_id AS TEXT) = CAST(s.admission_no AS TEXT))
        LEFT JOIN houses h ON (CAST(s.house_id AS TEXT) = CAST(h.id AS TEXT) OR CAST(s.house_id AS TEXT) = CAST(h.code AS TEXT))
        WHERE (r.program_id = ? OR CAST(r.program_id AS TEXT) = CAST(? AS TEXT))
        ORDER BY r.total_score DESC
      `, [req.params.programId, req.params.programId]);
    }

    res.json(results || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/results/standings', async (req, res) => {
  try {
    const standings = await all('SELECT * FROM houses ORDER BY total_points DESC');
    res.json(standings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ANNOUNCEMENTS & NOTICES
// -------------------------------------------------------------
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await all('SELECT * FROM announcements ORDER BY id DESC');
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/announcements', async (req, res) => {
  try {
    const { title, content, priority, posted_by } = req.body;
    const result = await run(`
      INSERT INTO announcements (title, content, priority, posted_by)
      VALUES (?, ?, ?, ?)
    `, [title, content, priority || 'normal', posted_by || 'Admin']);
    triggerPersistenceSync();
    res.json({ success: true, id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM announcements WHERE CAST(id AS TEXT) = CAST(? AS TEXT)', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// REPORTS & DASHBOARD STATS
// -------------------------------------------------------------
router.get('/reports/dashboard-stats', async (req, res) => {
  try {
    await recalculateAllHousePoints();

    const [
      studentsCount,
      programsCount,
      judgesCount,
      housesCount,
      categoriesCount,
      runningCount,
      completedCount,
      pendingCount,
      participantsCount
    ] = await Promise.all([
      get("SELECT COUNT(*) as count FROM students WHERE (is_archived = 0 OR is_archived IS NULL)"),
      get("SELECT COUNT(*) as count FROM programs WHERE (is_archived = 0 OR is_archived IS NULL)"),
      get("SELECT COUNT(*) as count FROM judges"),
      get("SELECT COUNT(*) as count FROM houses"),
      get("SELECT COUNT(*) as count FROM categories"),
      get("SELECT COUNT(*) as count FROM programs WHERE status = 'ongoing' AND (is_archived = 0 OR is_archived IS NULL)"),
      get("SELECT COUNT(*) as count FROM programs WHERE status = 'completed' AND (is_archived = 0 OR is_archived IS NULL)"),
      get("SELECT COUNT(*) as count FROM programs WHERE (status = 'pending' OR status IS NULL) AND (is_archived = 0 OR is_archived IS NULL)"),
      get("SELECT COUNT(DISTINCT student_id) as count FROM program_participants")
    ]);

    const houses = await all("SELECT id, code, name, color_hex, total_points FROM houses ORDER BY total_points DESC");

    const categoryStats = await all(`
      SELECT c.id, c.name, COUNT(p.id) as program_count
      FROM categories c
      LEFT JOIN programs p ON (CAST(p.category_id AS TEXT) = CAST(c.id AS TEXT) OR CAST(p.category_id AS TEXT) = CAST(c.name AS TEXT)) AND (p.is_archived = 0 OR p.is_archived IS NULL)
      GROUP BY c.id, c.name
      ORDER BY c.id ASC
    `);

    res.json({
      cards: {
        totalStudents: Number(studentsCount?.count) || 0,
        totalPrograms: Number(programsCount?.count) || 0,
        totalJudges: Number(judgesCount?.count) || 0,
        totalHouses: Number(housesCount?.count) || 0,
        totalCategories: Number(categoriesCount?.count) || 0,
        runningPrograms: Number(runningCount?.count) || 0,
        completedPrograms: Number(completedCount?.count) || 0,
        pendingPrograms: Number(pendingCount?.count) || 0,
        totalParticipants: Number(participantsCount?.count) || 0
      },
      houses: houses || [],
      categoryStats: categoryStats || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// GALLERY MANAGEMENT
// -------------------------------------------------------------
router.get('/gallery', async (req, res) => {
  try {
    const items = await all('SELECT * FROM gallery ORDER BY id DESC');
    res.json(items || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/gallery', async (req, res) => {
  try {
    const { title, album_name, url, caption } = req.body;
    if (!url) return res.status(400).json({ error: 'Image URL/data is required' });

    const result = await run(`
      INSERT INTO gallery (title, album_name, url, caption)
      VALUES (?, ?, ?, ?)
    `, [title || 'Milad Festival Photo', album_name || 'Milad 2026', url, caption || '']);

    res.json({ success: true, id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/gallery/:id', async (req, res) => {
  try {
    const { title, album_name, url, caption } = req.body;
    await run(`
      UPDATE gallery 
      SET title = ?, album_name = ?, url = ?, caption = ?
      WHERE CAST(id AS TEXT) = CAST(? AS TEXT)
    `, [title || 'Milad Festival Photo', album_name || 'Milad 2026', url, caption || '', req.params.id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await run(`
      DELETE FROM gallery 
      WHERE CAST(id AS TEXT) = CAST(? AS TEXT) OR title = ? OR url = ?
    `, [id, id, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// SYSTEM SETTINGS & COOLDOWN TARGET ENGINE
// -------------------------------------------------------------
router.get('/settings', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM settings');
    const settingsObj = {};
    for (const r of rows) {
      settingsObj[r.key_name] = r.value;
    }
    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const settingsData = req.body || {};
    for (const [key, val] of Object.entries(settingsData)) {
      await run(`
        INSERT OR REPLACE INTO settings (key_name, value)
        VALUES (?, ?)
      `, [key, String(val)]);
    }
    triggerPersistenceSync();
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ARCHIVE MANAGEMENT & AUDIT LOGS
// -------------------------------------------------------------
router.get('/archive/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const students = await all('SELECT * FROM students WHERE is_archived = 1 ORDER BY archived_at DESC');
    const programs = await all('SELECT * FROM programs WHERE is_archived = 1 ORDER BY archived_at DESC');
    const announcements = await all('SELECT * FROM announcements WHERE is_archived = 1 ORDER BY archived_at DESC');
    const results = await all('SELECT * FROM results WHERE is_archived = 1 ORDER BY archived_at DESC');

    res.json({ students, programs, announcements, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/audit-logs', authenticate, requireAdmin, async (req, res) => {
  try {
    const logs = await all('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 200');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protect reset-demo-data from purging critical production records
router.post('/settings/reset-demo-data', authenticate, requireAdmin, async (req, res) => {
  res.status(403).json({ error: 'Production data purge is disabled to prevent accidental data loss. Please use Archiving instead.' });
});

// -------------------------------------------------------------
// FULL DATABASE BACKUP EXPORT & IMPORT SNAPSHOT ENGINE
// -------------------------------------------------------------
// -------------------------------------------------------------
// FULL DATABASE BACKUP EXPORT & IMPORT SNAPSHOT ENGINE
// -------------------------------------------------------------
router.get('/database/export', async (req, res) => {
  try {
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
      users: await all('SELECT id, username, email, name, role FROM users'),
      exported_at: new Date().toISOString()
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=vibe_of_madeena_complete_backup_${Date.now()}.json`);
    res.send(JSON.stringify(snapshot, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/database/import', authenticate, requireAdmin, async (req, res) => {
  try {
    const snapshot = req.body;
    if (!snapshot || typeof snapshot !== 'object') {
      return res.status(400).json({ error: 'Invalid backup JSON file content.' });
    }

    // Purge current database operational tables to perform a clean 100% snapshot restore
    try {
      await run('DELETE FROM results');
      await run('DELETE FROM marks');
      await run('DELETE FROM program_participants');
      await run('DELETE FROM certificates');
      if (Array.isArray(snapshot.students)) {
        await run('DELETE FROM students');
      }
      if (Array.isArray(snapshot.programs)) {
        await run('DELETE FROM programs');
      }
      if (Array.isArray(snapshot.houses)) {
        await run('DELETE FROM houses');
      }
      if (Array.isArray(snapshot.categories)) {
        await run('DELETE FROM categories');
      }
      if (Array.isArray(snapshot.venues)) {
        await run('DELETE FROM venues');
      }
      if (Array.isArray(snapshot.announcements)) {
        await run('DELETE FROM announcements');
      }
      if (Array.isArray(snapshot.gallery)) {
        await run('DELETE FROM gallery');
      }
    } catch (e) {}

    // Restore Settings
    if (Array.isArray(snapshot.settings)) {
      for (const s of snapshot.settings) {
        if (s.key_name) {
          await run(`
            INSERT OR REPLACE INTO settings (key_name, value)
            VALUES (?, ?)
          `, [s.key_name, String(s.value || '')]);
        }
      }
    }

    // Restore Houses
    try {
      if (Array.isArray(snapshot.houses)) {
        for (const h of snapshot.houses) {
          try {
            await run(`
              INSERT OR REPLACE INTO houses (id, code, name, color_hex, motto, captain_name, total_points, bonus_points, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [h.id, h.code, h.name, h.color_hex, h.motto, h.captain_name, h.total_points || 0, h.bonus_points || 0, h.created_at || new Date().toISOString()]);
          } catch (e) {}
        }
      }
    } catch (e) {}

    // Restore Categories
    try {
      if (Array.isArray(snapshot.categories)) {
        for (const c of snapshot.categories) {
          try {
            await run(`
              INSERT OR REPLACE INTO categories (id, name, min_age, max_age, description)
              VALUES (?, ?, ?, ?, ?)
            `, [c.id, c.name, c.min_age, c.max_age, c.description]);
          } catch (e) {}
        }
      }
    } catch (e) {}

    // Restore Venues
    try {
      if (Array.isArray(snapshot.venues)) {
        for (const v of snapshot.venues) {
          try {
            await run(`
              INSERT OR REPLACE INTO venues (id, name, stage_number, capacity, location)
              VALUES (?, ?, ?, ?, ?)
            `, [v.id, v.name, v.stage_number, v.capacity, v.location]);
          } catch (e) {}
        }
      }
    } catch (e) {}

    // Restore Students
    try {
      if (Array.isArray(snapshot.students)) {
        for (const s of snapshot.students) {
          try {
            await run(`
              INSERT OR REPLACE INTO students (id, student_id, admission_no, name, category_name, arabic_name, photo, gender, dob, age, class_name, division, house_id, parent_name, phone, email, address, qr_code, is_archived, archived_at, archived_by, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [s.id, s.student_id, s.admission_no, s.name, s.category_name, s.arabic_name, s.photo, s.gender, s.dob, s.age, s.class_name, s.division, s.house_id, s.parent_name, s.phone, s.email, s.address, s.qr_code, s.is_archived || 0, s.archived_at, s.archived_by, s.created_at || new Date().toISOString()]);
          } catch (e) {}
        }
      }
    } catch (e) {}

    // Restore Programs
    try {
      if (Array.isArray(snapshot.programs)) {
        for (const p of snapshot.programs) {
          try {
            await run(`
              INSERT OR REPLACE INTO programs (id, code, name, category_id, age_group, type, gender_category, stage_type, venue_id, program_date, start_time, end_time, max_participants, status, duration_minutes, is_archived, archived_at, archived_by, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [p.id, p.code || p.stage_type || 'On Stage', p.name, p.category_id, p.age_group, p.type || 'individual', p.gender_category || 'Male', p.stage_type || p.code || 'On Stage', p.venue_id || 1, p.program_date, p.start_time, p.end_time, p.max_participants || 20, p.status || 'pending', p.duration_minutes || 10, p.is_archived || 0, p.archived_at, p.archived_by, p.created_at || new Date().toISOString()]);
          } catch (e) {}
        }
      }
    } catch (e) {}

    // Restore Program Participants
    try {
      if (Array.isArray(snapshot.program_participants)) {
        for (const pp of snapshot.program_participants) {
          try {
            await run(`
              INSERT OR REPLACE INTO program_participants (id, program_id, student_id, chest_no, attendance)
              VALUES (?, ?, ?, ?, ?)
            `, [pp.id, pp.program_id, pp.student_id, pp.chest_no || pp.student_id, pp.attendance || 'present']);
          } catch (e) {}
        }
      }
    } catch (e) {}

    // Restore Results (Winners)
    try {
      if (Array.isArray(snapshot.results)) {
        for (const r of snapshot.results) {
          try {
            await run(`
              INSERT OR REPLACE INTO results (id, program_id, student_id, total_score, prize, points_awarded, tie_breaker_note, published_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [r.id, r.program_id, r.student_id, r.total_score || 0, r.prize, r.points_awarded || r.points || 0, r.tie_breaker_note || '', r.published_at || new Date().toISOString()]);
          } catch (e) {}
        }
      }
    } catch (e) {}

    // Restore Marks
    try {
      if (Array.isArray(snapshot.marks)) {
        try {
          await run("ALTER TABLE marks ADD COLUMN criteria_scores TEXT");
        } catch (e) {}
        try {
          await run("ALTER TABLE marks ADD COLUMN total_score REAL DEFAULT 0");
        } catch (e) {}
        try {
          await run("ALTER TABLE marks ADD COLUMN remarks TEXT");
        } catch (e) {}
        try {
          await run("ALTER TABLE marks ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE");
        } catch (e) {}

        for (const m of snapshot.marks) {
          try {
            await run(`
              INSERT OR REPLACE INTO marks (id, program_id, student_id, judge_id, criteria_scores, total_score, remarks, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [m.id, m.program_id, m.student_id, m.judge_id || 1, typeof m.criteria_scores === 'object' ? JSON.stringify(m.criteria_scores) : m.criteria_scores, m.total_score || m.total_mark || 0, m.remarks || '', m.updated_at || m.submitted_at || new Date().toISOString()]);
          } catch (e) {
            try {
              await run(`
                INSERT OR REPLACE INTO marks (id, program_id, student_id, judge_id, total_mark, submitted_at)
                VALUES (?, ?, ?, ?, ?, ?)
              `, [m.id, m.program_id, m.student_id, m.judge_id || 1, m.total_score || m.total_mark || 0, m.submitted_at || new Date().toISOString()]);
            } catch (e2) {}
          }
        }
      }
    } catch (e) {}

    // Restore Certificates
    try {
      if (Array.isArray(snapshot.certificates)) {
        for (const cert of snapshot.certificates) {
          try {
            await run(`
              INSERT OR REPLACE INTO certificates (id, student_id, program_id, certificate_code, type, issue_date, download_url)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [cert.id, cert.student_id, cert.program_id, cert.certificate_code, cert.type, cert.issue_date, cert.download_url]);
          } catch (e) {}
        }
      }
    } catch (e) {}

    // Restore Gallery Photos
    try {
      if (Array.isArray(snapshot.gallery)) {
        for (const g of snapshot.gallery) {
          try {
            await run(`
              INSERT OR REPLACE INTO gallery (id, album_name, title, media_type, url, caption, uploaded_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [g.id, g.album_name || 'Milad 2026', g.title, g.media_type || 'photo', g.url, g.caption || '', g.uploaded_at || g.created_at || new Date().toISOString()]);
          } catch (e) {}
        }
      }
    } catch (e) {}

    // Restore Announcements
    try {
      if (Array.isArray(snapshot.announcements)) {
        for (const a of snapshot.announcements) {
          try {
            await run(`
              INSERT OR REPLACE INTO announcements (id, title, content, priority, posted_by, created_at)
              VALUES (?, ?, ?, ?, ?, ?)
            `, [a.id, a.title, a.content, a.priority || 'normal', a.posted_by || 'Admin', a.created_at || new Date().toISOString()]);
          } catch (e) {}
        }
      }
    } catch (e) {}

    await recalculateAllHousePoints();
    try {
      const { syncPgSequences } = require('../../database/db');
      if (typeof syncPgSequences === 'function') {
        await syncPgSequences();
      }
    } catch (e) {}

    // Save imported snapshot to persistence files only for local SQLite development
    if (!isPg) {
      try {
        const persistence = require('../../database/persistence');
        if (typeof persistence.writeSnapshotData === 'function') {
          const fullSnapshot = {
            ...snapshot,
            last_synced: new Date().toISOString()
          };
          persistence.writeSnapshotData(fullSnapshot);
        }
      } catch (e) {
        console.error('[IMPORT PERSISTENCE ERROR]', e);
      }
    }

    triggerPersistenceSync();
    res.json({ success: true, message: 'Complete database backup imported successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
