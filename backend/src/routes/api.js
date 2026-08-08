const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { run, get, all } = require('../../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'madrasa_milad_secret_key_2026';

// Middleware for auth
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access token required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// -------------------------------------------------------------
// AUTH ROUTES
// -------------------------------------------------------------
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Default seed password check or bcrypt check
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    }
    // Fallback for simple testing
    if (!isMatch && (password === 'password123' || password === user.password)) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Fetch judge profile if judge
    let judgeInfo = null;
    if (user.role === 'judge') {
      judgeInfo = await get('SELECT * FROM judges WHERE user_id = ? OR email = ?', [user.id, user.email]);
    }

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        judgeInfo
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
// DASHBOARD STATS
// -------------------------------------------------------------
router.get('/reports/dashboard-stats', async (req, res) => {
  try {
    const totalStudents = await get('SELECT COUNT(*) as count FROM students');
    const totalPrograms = await get('SELECT COUNT(*) as count FROM programs');
    const totalJudges = await get('SELECT COUNT(*) as count FROM judges');
    const totalHouses = await get('SELECT COUNT(*) as count FROM houses');
    const totalCategories = await get('SELECT COUNT(*) as count FROM categories');
    
    const runningPrograms = await get("SELECT COUNT(*) as count FROM programs WHERE status = 'running'");
    const completedPrograms = await get("SELECT COUNT(*) as count FROM programs WHERE status = 'completed'");
    const pendingPrograms = await get("SELECT COUNT(*) as count FROM programs WHERE status = 'pending'");
    
    const totalParticipants = await get('SELECT COUNT(*) as count FROM program_participants');

    const houses = await all('SELECT * FROM houses ORDER BY total_points DESC');
    const categoryStats = await all(`
      SELECT c.name as category_name, COUNT(p.id) as program_count 
      FROM categories c 
      LEFT JOIN programs p ON p.category_id = c.id 
      GROUP BY c.id
    `);

    res.json({
      cards: {
        totalStudents: totalStudents.count,
        totalPrograms: totalPrograms.count,
        totalJudges: totalJudges.count,
        totalHouses: totalHouses.count,
        totalCategories: totalCategories.count,
        runningPrograms: runningPrograms.count,
        completedPrograms: completedPrograms.count,
        pendingPrograms: pendingPrograms.count,
        totalParticipants: totalParticipants.count
      },
      houses,
      categoryStats
    });
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
      WHERE s.id = ?
    `, [req.params.id]);

    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Participated programs & marks
    const participations = await all(`
      SELECT pp.*, p.name as program_name, p.code as program_code, r.prize, r.points_awarded, r.total_score
      FROM program_participants pp
      JOIN programs p ON pp.program_id = p.id
      LEFT JOIN results r ON r.program_id = p.id AND r.student_id = pp.student_id
      WHERE pp.student_id = ?
    `, [req.params.id]);

    res.json({ student, participations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/students', async (req, res) => {
  try {
    const {
      admission_no, name, category_name, arabic_name, gender, dob, age, class_name,
      division, house_id, parent_name, phone, email, address
    } = req.body;

    const count = await get('SELECT COUNT(*) as c FROM students');
    const student_id = `STU-${1000 + count.c + 1}`;

    const result = await run(`
      INSERT INTO students (student_id, admission_no, name, category_name, arabic_name, gender, dob, age, class_name, division, house_id, parent_name, phone, email, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [student_id, admission_no, name, category_name || 'Kiddies', arabic_name || '', gender || 'male', dob, age || 10, class_name, division || 'A', house_id, parent_name || '', phone || '', email || '', address || '']);

    res.json({ success: true, id: result.id, student_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/students/:id', async (req, res) => {
  try {
    const { name, category_name, arabic_name, gender, dob, age, class_name, division, house_id, parent_name, phone, email, address, admission_no } = req.body;
    await run(`
      UPDATE students 
      SET name = ?, category_name = ?, arabic_name = ?, gender = ?, dob = ?, age = ?, class_name = ?, division = ?, house_id = ?, parent_name = ?, phone = ?, email = ?, address = ?, admission_no = COALESCE(?, admission_no)
      WHERE id = ?
    `, [name, category_name || 'Kiddies', arabic_name || '', gender || 'male', dob, age || 10, class_name, division || 'A', house_id, parent_name || '', phone || '', email || '', address || '', admission_no, req.params.id]);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/students/:id', async (req, res) => {
  try {
    await run('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// HOUSE MANAGEMENT
// -------------------------------------------------------------
router.get('/houses', async (req, res) => {
  try {
    const houses = await all('SELECT * FROM houses ORDER BY total_points DESC');
    for (let h of houses) {
      const studentCount = await get('SELECT COUNT(*) as count FROM students WHERE house_id = ?', [h.id]);
      const medals = await get(`
        SELECT 
          SUM(CASE WHEN r.prize = '1st' THEN 1 ELSE 0 END) as gold,
          SUM(CASE WHEN r.prize = '2nd' THEN 1 ELSE 0 END) as silver,
          SUM(CASE WHEN r.prize = '3rd' THEN 1 ELSE 0 END) as bronze
        FROM results r
        JOIN students s ON r.student_id = s.id
        WHERE s.house_id = ?
      `, [h.id]);

      h.student_count = studentCount.count;
      h.gold = medals.gold || 0;
      h.silver = medals.silver || 0;
      h.bronze = medals.bronze || 0;
    }
    res.json(houses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/houses', async (req, res) => {
  try {
    const { name, code, color_hex, motto, captain_name } = req.body;
    const result = await run(`
      INSERT INTO houses (code, name, color_hex, motto, captain_name, total_points)
      VALUES (?, ?, ?, ?, ?, 0)
    `, [code, name, color_hex || '#10B981', motto, captain_name]);
    res.json({ success: true, id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/houses/:id', async (req, res) => {
  try {
    const { name, code, color_hex, motto, captain_name } = req.body;
    await run(`
      UPDATE houses 
      SET name = ?, code = ?, color_hex = ?, motto = ?, captain_name = ?
      WHERE id = ?
    `, [name, code, color_hex, motto, captain_name, req.params.id]);
    res.json({ success: true });
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
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN venues v ON p.venue_id = v.id
      ORDER BY p.id ASC
    `);

    for (let p of programs) {
      const judges = await all(`
        SELECT j.* FROM judges j
        JOIN program_judges pj ON pj.judge_id = j.id
        WHERE pj.program_id = ?
      `, [p.id]);

      const participantCount = await get('SELECT COUNT(*) as count FROM program_participants WHERE program_id = ?', [p.id]);
      
      const winners = await all(`
        SELECT r.prize, r.total_score, r.points_awarded, s.name as student_name, s.admission_no, h.name as house_name, h.color_hex as house_color
        FROM results r
        JOIN students s ON r.student_id = s.id
        LEFT JOIN houses h ON s.house_id = h.id
        WHERE r.program_id = ?
        ORDER BY r.total_score DESC
        LIMIT 3
      `, [p.id]);

      p.assigned_judges = judges;
      p.participant_count = participantCount.count;
      p.winners = winners;
    }

    res.json(programs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/programs/:id', async (req, res) => {
  try {
    const program = await get(`
      SELECT p.*, c.name as category_name, v.name as venue_name, v.stage_number
      FROM programs p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN venues v ON p.venue_id = v.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (!program) return res.status(404).json({ error: 'Program not found' });

    const participants = await all(`
      SELECT pp.*, s.name as student_name, s.student_id as student_code, s.arabic_name, s.class_name, h.name as house_name, h.color_hex as house_color
      FROM program_participants pp
      JOIN students s ON pp.student_id = s.id
      LEFT JOIN houses h ON s.house_id = h.id
      WHERE pp.program_id = ?
      ORDER BY pp.chest_no ASC
    `, [req.params.id]);

    const judges = await all(`
      SELECT j.* FROM judges j
      JOIN program_judges pj ON pj.judge_id = j.id
      WHERE pj.program_id = ?
    `, [req.params.id]);

    res.json({ program, participants, judges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/programs', async (req, res) => {
  try {
    const { code, name, category_id, age_group, type, venue_id, program_date, start_time, end_time, max_participants, status } = req.body;
    const result = await run(`
      INSERT INTO programs (code, name, category_id, age_group, type, venue_id, program_date, start_time, end_time, max_participants, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [code, name, category_id, age_group || 'Sub Junior', type || 'individual', venue_id, program_date, start_time, end_time, max_participants || 20, status || 'pending']);
    res.json({ success: true, id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/programs/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await run('UPDATE programs SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/programs/:id', async (req, res) => {
  try {
    const { code, name, category_id, age_group, type, venue_id, program_date, start_time, end_time, max_participants, status } = req.body;
    await run(`
      UPDATE programs 
      SET code = ?, name = ?, category_id = ?, age_group = ?, type = ?, venue_id = ?, program_date = ?, start_time = ?, end_time = ?, max_participants = ?, status = ?
      WHERE id = ?
    `, [code, name, category_id, age_group, type, venue_id, program_date, start_time, end_time, max_participants, status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/programs/:id', async (req, res) => {
  try {
    await run('DELETE FROM programs WHERE id = ?', [req.params.id]);
    await run('DELETE FROM program_judges WHERE program_id = ?', [req.params.id]);
    await run('DELETE FROM program_participants WHERE program_id = ?', [req.params.id]);
    await run('DELETE FROM marks WHERE program_id = ?', [req.params.id]);
    await run('DELETE FROM results WHERE program_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// CATEGORIES & VENUES & JUDGES
// -------------------------------------------------------------
router.get('/categories', async (req, res) => {
  try {
    const categories = await all('SELECT * FROM categories');
    res.json(categories);
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
    const assignedPrograms = await all(`
      SELECT p.*, c.name as category_name, v.name as venue_name
      FROM programs p
      JOIN program_judges pj ON pj.program_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN venues v ON p.venue_id = v.id
      WHERE pj.judge_id = ?
    `, [req.params.judgeId]);

    res.json(assignedPrograms);
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

    // Check existing
    const existing = await get('SELECT id, status FROM marks WHERE program_id = ? AND student_id = ? AND judge_id = ?', [program_id, student_id, judge_id]);

    if (existing && existing.status === 'final') {
      return res.status(400).json({ error: 'Cannot modify mark. Final marks have already been submitted.' });
    }

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

    // Trigger Socket Broadcast if final
    const io = req.app.get('io');
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

    // Average mark per student across judges
    const studentScores = await all(`
      SELECT 
        student_id, 
        AVG(total_mark) as avg_score,
        AVG(presentation) as avg_pres,
        AVG(pronunciation) as avg_pron
      FROM marks 
      WHERE program_id = ? AND status = 'final'
      GROUP BY student_id
      ORDER BY avg_score DESC, avg_pres DESC, avg_pron DESC
    `, [programId]);

    if (studentScores.length === 0) {
      return res.status(400).json({ error: 'No final marks submitted yet for this program.' });
    }

    // Clear existing results for program
    await run('DELETE FROM results WHERE program_id = ?', [programId]);

    // Award prizes
    const prizes = [
      { prize: '1st', points: 10 },
      { prize: '2nd', points: 7 },
      { prize: '3rd', points: 5 }
    ];

    for (let i = 0; i < studentScores.length; i++) {
      const s = studentScores[i];
      const p = prizes[i] || { prize: 'participation', points: 3 };
      
      await run(`
        INSERT INTO results (program_id, student_id, total_score, prize, points_awarded)
        VALUES (?, ?, ?, ?, ?)
      `, [programId, s.student_id, s.avg_score, p.prize, p.points]);

      // Update student's house points
      const student = await get('SELECT house_id FROM students WHERE id = ?', [s.student_id]);
      if (student && student.house_id) {
        await run('UPDATE houses SET total_points = total_points + ? WHERE id = ?', [p.points, student.house_id]);
      }
    }

    await run("UPDATE programs SET status = 'completed' WHERE id = ?", [programId]);

    const io = req.app.get('io');
    if (io) {
      io.emit('results_published', { programId });
    }

    res.json({ success: true, count: studentScores.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/results/program/:programId', async (req, res) => {
  try {
    const results = await all(`
      SELECT r.*, s.name as student_name, s.student_id as student_code, s.arabic_name, s.class_name, h.name as house_name, h.color_hex as house_color
      FROM results r
      JOIN students s ON r.student_id = s.id
      LEFT JOIN houses h ON s.house_id = h.id
      WHERE r.program_id = ?
      ORDER BY r.total_score DESC
    `, [req.params.programId]);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ANNOUNCEMENTS & GALLERY & NOTICES
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
    res.json({ success: true, id: result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/gallery', async (req, res) => {
  try {
    const gallery = await all('SELECT * FROM gallery ORDER BY id DESC');
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM settings');
    const settingsObj = {};
    rows.forEach(r => settingsObj[r.key_name] = r.value);
    res.json(settingsObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
