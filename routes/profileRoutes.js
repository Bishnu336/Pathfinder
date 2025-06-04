const express = require('express');
const router = express.Router();
const db = require('../config/db'); // adjust path if needed

// Middleware to parse JSON
router.use(express.json());

router.post('/profile', async (req, res) => {
  try {
    console.log('📥 Incoming profile data:', req.body);

    const {
      full_name,
      email,
      phone,
      stream,
      english,
      dzongkha,
      subject1,
      subject2,
      optional,
      interests,
      aspirations,
      activities,
      location
    } = req.body;

    // Insert into the student_profiles table
    await db.query(`
      INSERT INTO student_profiles (
        full_name, email, phone, stream,
        english, dzongkha, subject1, subject2, optional,
        interests, aspirations, activities, location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      full_name,
      email,
      phone,
      stream,
      parseInt(english),
      parseInt(dzongkha),
      parseInt(subject1),
      parseInt(subject2),
      parseInt(optional),
      interests,
      aspirations,
      activities,
      location
    ]);

    res.status(200).json({ success: true, message: 'Profile saved successfully!' });
  } catch (err) {
    console.error('❌ Error saving profile:', err);
    res.status(500).json({ success: false, message: 'Error saving profile' });
  }
});

module.exports = router;
