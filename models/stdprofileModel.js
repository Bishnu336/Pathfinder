const db = require('../config/db');

const createProfileTable = async () => {
  try {
    // Initial table creation if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS student_profiles (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100),
        email VARCHAR(100),
        phone VARCHAR(20),
        english INTEGER,
        subject1 INTEGER,
        subject2 INTEGER,
        optional INTEGER,
        interests TEXT,
        aspirations TEXT,
        activities TEXT,
        location VARCHAR(100),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure all required columns exist
    const addColumnIfMissing = async (column, type) => {
      await db.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='student_profiles' AND column_name='${column}'
          ) THEN
            ALTER TABLE student_profiles ADD COLUMN ${column} ${type};
          END IF;
        END;
        $$;
      `);
    };

    await addColumnIfMissing('stream', 'VARCHAR(100)');
    await addColumnIfMissing('dzongkha', 'INTEGER');

    console.log('✅ student_profiles table ensured, including all required columns.');
  } catch (err) {
    console.error('❌ Error ensuring student_profiles table:', err);
  }
};

module.exports = { createProfileTable };
