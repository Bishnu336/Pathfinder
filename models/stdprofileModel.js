const db = require('../config/db');

// ---------- Table Creation ----------
const createProfileTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS student_profiles (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(20),
        stream VARCHAR(100),
        english INTEGER,
        subject1 INTEGER,
        subject2 INTEGER,
        optional INTEGER,
        dzongkha INTEGER,
        interests TEXT,
        aspirations TEXT,
        activities TEXT,
        location VARCHAR(100),
        recommendation TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ student_profiles table ensured.');
  } catch (err) {
    console.error('❌ Error ensuring student_profiles table:', err);
  }
};

// ---------- Save or Update Profile ----------
const saveOrUpdateProfile = async (email, data) => {
  try {
    const existing = await db.query(
      'SELECT id FROM student_profiles WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      // Update
      await db.query(
        `UPDATE student_profiles SET 
          full_name=$1, phone=$2, stream=$3,
          english=$4, subject1=$5, subject2=$6, optional=$7, dzongkha=$8,
          interests=$9, aspirations=$10, activities=$11, location=$12, recommendation=$13
         WHERE email=$14`,
        [
          data.full_name,
          data.phone,
          data.stream,
          data.english,
          data.subject1,
          data.subject2,
          data.optional,
          data.dzongkha,
          data.interests,
          data.aspirations,
          data.activities,
          data.location,
          data.recommendation,
          email
        ]
      );
    } else {
      // Insert
      await db.query(
        `INSERT INTO student_profiles (
          full_name, email, phone, stream, 
          english, subject1, subject2, optional, dzongkha,
          interests, aspirations, activities, location, recommendation
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          data.full_name,
          email,
          data.phone,
          data.stream,
          data.english,
          data.subject1,
          data.subject2,
          data.optional,
          data.dzongkha,
          data.interests,
          data.aspirations,
          data.activities,
          data.location,
          data.recommendation
        ]
      );
    }
  } catch (err) {
    console.error('❌ Error saving/updating profile:', err);
    throw err;
  }
};

// ---------- Get Profile ----------
const getProfileByEmail = async (email) => {
  try {
    const result = await db.query(
      'SELECT * FROM student_profiles WHERE email = $1',
      [email]
    );

    if (!result || !result.rows || result.rows.length === 0) {
      console.warn(`⚠️ No profile found for email = ${email}`);
      return null;
    }

    return result.rows[0];
  } catch (err) {
    console.error('❌ Error loading profile:', err);
    throw err;
  }
};

module.exports = {
  createProfileTable,
  saveOrUpdateProfile,
  getProfileByEmail
};
