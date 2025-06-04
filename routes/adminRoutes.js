const express = require('express');
const router = express.Router();
const db = require('../config/db');
const adminController = require('../controllers/adminController');

// Route to admin dashboard
router.get('/admin', adminController.getAdminDashboard);

// Course Recommendation Logic
function getCourseRecommendation(profile) {
  const scores = [
    profile.english,
    profile.dzongkha,
    profile.subject1,
    profile.subject2,
    profile.optional
  ];

  const validScores = scores.filter(score => typeof score === 'number' && !isNaN(score));
  const avg = validScores.reduce((sum, val) => sum + val, 0) / validScores.length;

  const stream = (profile.stream || '').toLowerCase();

  if (stream === 'science') {
    if (avg >= 80) return 'MBBS – KGUMSB / BSc or Engineering – CST';
    if (avg >= 70) return 'Engineering – JNEC / BSc – Sherubtse';
    if (avg >= 60) return 'Agriculture or Forestry – CNR / Education – SCE';
    if (avg >= 50) return 'Technical Training – VTI / Language & Culture – CLCS';
    return 'Diploma courses / Consider reattempting exams';
  }

  if (stream === 'commerce') {
    if (avg >= 80) return 'Business Intelligence or Accounting – GCBS / Data Science – Sherubtse';
    if (avg >= 70) return 'B.Com or BBA – GCBS / Digital Communication – Sherubtse';
    if (avg >= 60) return 'Education – SCE / Sustainable Development – CNR';
    if (avg >= 50) return 'Language & Culture – CLCS / Short-term training programs';
    return 'Diploma in Business or IT / Reattempt suggestion';
  }

  if (stream === 'arts') {
    if (avg >= 80) return 'BA in Language & Culture – CLCS / Digital Communication – Sherubtse';
    if (avg >= 70) return 'B.Ed – Paro/Samtse / BA in Political Science – Sherubtse';
    if (avg >= 60) return 'Sustainable Development – CNR / B.Ed in Dzongkha – PCE';
    if (avg >= 50) return 'Short-term skill training / Language programs – CLCS';
    return 'Diploma courses / Try again next year';
  }

  return 'Stream not specified or invalid';
}

// Admin users page with search
router.get('/admin/users', async (req, res) => {
  const search = req.query.search || '';

  try {
    let profiles = await db.any('SELECT * FROM student_profiles ORDER BY submitted_at DESC');

    // Compute recommendations
    const profilesWithRecommendations = profiles.map(profile => {
      const recommendation = getCourseRecommendation(profile);
      return { ...profile, recommendation };
    });

    // Filter in JS if search is applied
    const filtered = search
      ? profilesWithRecommendations.filter(p =>
          p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          p.stream?.toLowerCase().includes(search.toLowerCase()) ||
          p.recommendation?.toLowerCase().includes(search.toLowerCase())
        )
      : profilesWithRecommendations;

    res.render('user', {
      profiles: filtered,
      search
    });
  } catch (err) {
    console.error('❌ Error loading users:', err);
    res.status(500).send('Server error');
  }
});

// Delete profile
router.post('/admin/users/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.none('DELETE FROM student_profiles WHERE id = $1', [id]);

    const redirectFrom = req.query.from;
    if (redirectFrom === 'dashboard') {
      return res.redirect('/admin');
    }

    res.redirect('/admin/users');
  } catch (err) {
    console.error('❌ Error deleting profile:', err);
    res.status(500).send('Server error');
  }
});

// Render edit form
router.get('/admin/users/edit/:id', async (req, res) => {
  try {
    const profile = await db.one('SELECT * FROM student_profiles WHERE id = $1', [req.params.id]);
    res.render('editUser', { profile });
  } catch (err) {
    console.error('❌ Error loading profile for edit:', err);
    res.status(500).send('Server error');
  }
});

// Handle profile update
router.post('/admin/users/edit/:id', async (req, res) => {
  const { id } = req.params;
  const {
    full_name, email, phone, stream,
    english, dzongkha, subject1, subject2, optional, location
  } = req.body;

  try {
    await db.none(
      `UPDATE student_profiles SET 
        full_name = $1, email = $2, phone = $3, stream = $4,
        english = $5, dzongkha = $6, subject1 = $7, subject2 = $8, optional = $9,
        location = $10
      WHERE id = $11`,
      [full_name, email, phone, stream, english, dzongkha, subject1, subject2, optional, location, id]
    );

    res.redirect('/admin/users');
  } catch (err) {
    console.error('❌ Error updating profile:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
