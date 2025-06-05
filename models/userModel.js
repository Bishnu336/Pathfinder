const db = require('../config/db');
const bcrypt = require('bcrypt');

// Create table
const createUsersTable = async () => {
  try {
    await db.none(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        token TEXT,
        reset_token TEXT,
        reset_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Users table ready (no role)");
  } catch (err) {
    console.error("❌ Error creating users table:", err);
  }
};

createUsersTable();

module.exports = {
  // Create a new user
  createUser: async (name, email, hashedPassword, token) => {
    return db.one(
      `INSERT INTO users(name, email, password, token, verified)
       VALUES($1, $2, $3, $4, FALSE) RETURNING *`,
      [name, email, hashedPassword, token]
    );
  },

  // Find user by email
  findUserByEmail: async (email) => {
    return db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
  },

  // Verify user
  verifyUser: async (email) => {
    return db.none(
      `UPDATE users SET verified = true, token = NULL WHERE email = $1`,
      [email]
    );
  },

  // Set password reset token
  setResetToken: async (email, token, expires) => {
    return db.none(
      `UPDATE users SET reset_token = $1, reset_expires = $2 WHERE email = $3`,
      [token, expires, email]
    );
  },

  // Update password
  updatePassword: async (email, hashedPassword) => {
    return db.none(
      `UPDATE users 
       SET password = $1, reset_token = NULL, reset_expires = NULL 
       WHERE email = $2`,
      [hashedPassword, email]
    );
  },

  // Get all users
  getAllUsers: async () => {
    return db.any('SELECT * FROM users ORDER BY created_at DESC LIMIT 10');
  },

  // Admin stats (role-based stats removed)
  getAdminStats: async () => {
    const totalUsers = await db.one('SELECT COUNT(*) FROM users');
    const verifiedUsers = await db.one('SELECT COUNT(*) FROM users WHERE verified = true');

    return {
      totalUsers: parseInt(totalUsers.count),
      verifiedUsers: parseInt(verifiedUsers.count)
    };
  },

  // Get all meetings
  getAllMeetings: async () => {
    return db.any(`
      SELECT 
        m.topic,
        m.date,
        m.time,
        u.name,
        u.email,
        m.professor
      FROM meetings m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.date DESC
      LIMIT 10
    `);
  }
};
