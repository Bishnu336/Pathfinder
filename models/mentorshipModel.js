const db = require('../config/db');

// ✅ Create table if it doesn't exist
const createMeetingsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS mentorship_meetings (
        id SERIAL PRIMARY KEY,
        topic VARCHAR(255),
        date DATE,
        time TIME,
        name VARCHAR(100),
        email VARCHAR(100),
        professor VARCHAR(100)
      );
    `);
    console.log("✅ mentorship_meetings table ensured.");
  } catch (err) {
    console.error("❌ Failed to create mentorship_meetings table:", err.message);
  }
};

// ✅ Save meeting
const saveMeeting = async ({ topic, date, time, name, email, professor }) => {
  const query = `
    INSERT INTO mentorship_meetings (topic, date, time, name, email, professor)
    VALUES ($1, $2::date, $3::time, $4, $5, $6)
  `;
  const values = [topic, date, time, name, email, professor];
  await db.query(query, values);
};


// ✅ Get all meetings
const getAllMeetings = async () => {
  try {
    const result = await db.any('SELECT * FROM mentorship_meetings');
    console.log("✅ getAllMeetings result:", result);
    return result; // result is already an array
  } catch (err) {
    console.error('❌ getAllMeetings error:', err.message);
    return [];
  }
};



// ✅ Export all
module.exports = {
  createMeetingsTable,
  saveMeeting,
  getAllMeetings
};
