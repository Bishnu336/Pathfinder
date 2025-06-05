const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ✅ Import DB connection
const mentorshipController = require('../controllers/mentorshipController');
const { getAllMeetings } = require('../models/mentorshipModel');

// ✅ GET: Render manage meetings page
router.get('/manage-meetings', async (req, res) => {
  try {
    const meetings = await getAllMeetings();
    res.render('managemeeting', { meetings });
  } catch (err) {
    console.error("❌ Failed to load meetings:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ POST: Schedule new meeting
router.post('/schedule', mentorshipController.scheduleMeeting);

// ✅ POST: Update meeting
router.post('/update-meeting/:id', async (req, res) => {
  const { id } = req.params;
  const { topic, date, time, name, email, professor } = req.body;

  try {
    await db.query(
      `UPDATE mentorship_meetings 
       SET topic = $1, date = $2, time = $3, name = $4, email = $5, professor = $6
       WHERE id = $7`,
      [topic, date, time, name, email, professor, id]
    );
    res.redirect('/manage-meetings');
  } catch (err) {
    console.error("❌ Update failed:", err.message);
    res.status(500).send("Failed to update meeting.");
  }
});

// ✅ POST: Delete meeting
router.post('/delete-meeting/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM mentorship_meetings WHERE id = $1', [id]);
    res.redirect('/manage-meetings');
  } catch (err) {
    console.error("❌ Delete failed:", err.message);
    res.status(500).send("Failed to delete meeting.");
  }
});

module.exports = router;


// ✅ GET: Schedule meeting page dynamically by mentorId
router.get('/schedule/:mentorId', (req, res) => {
  const mentors = {
    sm1: {
      name: 'Dr. Sarah Chen',
      title: 'MIT Academic Advisor',
      rating: '⭐ 4.8 (98 students)',
      tags: ['STEM Programs', 'Research Projects', 'Scholarship Applications'],
      image: '/images/dr.1.png',
      description: 'Dr. Sarah specializes in guiding students through academic planning...'
    },
    sm2: {
      name: 'Prof. Sonam Tenzin',
      title: 'MIT Admissions Mentor',
      rating: '⭐ 4.7 (110 students)',
      tags: ['College Applications', 'Interview Prep', 'Leadership'],
      image: '/images/sonam.png',
      description: 'Prof. Sonam helps students prepare competitive college applications...'
    },
    sm3: {
      name: 'Dr. Wangmo',
      title: 'Career Advisor, Sherubtse College',
      rating: '⭐ 4.9 (156 students)',
      tags: ['Career Planning', 'Resume Writing', 'Scholarships'],
      image: '/images/wangmo.png',
      description: 'Dr. Wangmo guides students through career exploration and opportunities...'
    }
  };

  const mentor = mentors[req.params.mentorId];

  if (!mentor) return res.status(404).send('Mentor not found');

  res.render('sm', { mentor });
});
