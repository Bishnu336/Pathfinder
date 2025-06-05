const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getCourseRecommendation } = require('../utils/recommendation');


router.use(express.json());

router.post('/profile', async (req, res) => {

  try {

    const {
      full_name, email, phone, stream,
      english, dzongkha, subject1, subject2, optional,
      interests, aspirations, activities, location
    } = req.body;

    const eng = parseInt(english);
    const dzo = parseInt(dzongkha);
    const s1 = parseInt(subject1);
    const s2 = parseInt(subject2);
    const opt = optional ? parseInt(optional) : 0;

    const recommendation = getCourseRecommendation({
      english: eng,
      dzongkha: dzo,
      subject1: s1,
      subject2: s2,
      optional: opt,
      stream
    });

    await db.query(`
      INSERT INTO student_profiles (
        full_name, email, phone, stream,
        english, dzongkha, subject1, subject2, optional,
        interests, aspirations, activities, location, recommendation
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14
      )
    `, [
      full_name, email, phone, stream,
      eng, dzo, s1, s2, opt,
      interests, aspirations, activities, location, recommendation
    ]);

   res.render('profile', {
  profile: {
    full_name, email, phone, stream,
    english, dzongkha, subject1, subject2, optional,
    interests, aspirations, activities, location
  },
  recommendation,
  settings: req.session.settings || {},
  showSettings: req.session.showSettings || false
});


  } catch (err) {
    console.error('❌ Error saving profile:', err);
    res.status(500).render('profile', {
      profile: req.body,
      error: 'Failed to save profile.',
      settings: req.session.settings || {},
      showSettings: req.session.showSettings || false
    });
  }
});

module.exports = router;
