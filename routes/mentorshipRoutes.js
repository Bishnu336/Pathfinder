const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ✅ Import DB connection
const mentorshipController = require('../controllers/mentorshipcontroller');
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
