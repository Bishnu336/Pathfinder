const db = require('../config/db');

const createWorkshopTable = async () => {
  await db.none(`
    CREATE TABLE IF NOT EXISTS workshop_registrations (
      id SERIAL PRIMARY KEY,
      fullname TEXT NOT NULL,
      email TEXT NOT NULL,
      interest TEXT NOT NULL,
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const saveRegistration = async (fullname, email, interest) => {
  await createWorkshopTable(); // Ensure table exists
  const result = await db.one(
    `INSERT INTO workshop_registrations (fullname, email, interest)
     VALUES ($1, $2, $3) RETURNING *`,
    [fullname, email, interest]
  );
  return result; // ✅ do NOT use result.rows[0] with pg-promise
};

// ✅ Get all registrations (for admin page)
const getAllWorkshops = async () => {
  await createWorkshopTable(); // Ensure table exists
  return db.any('SELECT * FROM workshop_registrations ORDER BY registered_at DESC');
};

module.exports = {
  saveRegistration,
  createWorkshopTable,
  getAllWorkshops // ✅ Make sure this is exported
};
