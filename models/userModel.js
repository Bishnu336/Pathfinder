const db = require('../config/db');
const bcrypt = require('bcrypt');

// Auto-create users table if it doesn't exist
const createUsersTable = async () => {
  try {
    await db.none(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(10) CHECK (role IN ('user', 'admin')) NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        token TEXT,
        reset_token TEXT,
        reset_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Users table ready");
  } catch (err) {
    console.error("❌ Error creating users table:", err);
  }
};

createUsersTable();

module.exports = {
  // Create a new user
  createUser: async (name, email, hashedPassword, role, token) => {
    return db.one(
      `INSERT INTO users(name, email, password, role, token, verified)
       VALUES($1, $2, $3, $4, $5, FALSE) RETURNING *`,
      [name, email, hashedPassword, role, token]
    );
  },

  // Find user by email
  findUserByEmail: async (email) => {
    return db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
  },

  // Verify user email
  verifyUser: async (email) => {
    return db.none(
      `UPDATE users SET verified = true, token = NULL WHERE email = $1`,
      [email]
    );
  },

  // Set reset token
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

  // Get dashboard stats
  getAdminStats: async () => {
    const totalUsers = await db.one('SELECT COUNT(*) FROM users');
    const verifiedUsers = await db.one('SELECT COUNT(*) FROM users WHERE verified = true');
    const adminCount = await db.one("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    const userCount = await db.one("SELECT COUNT(*) FROM users WHERE role = 'user'");

    return {
      totalUsers: parseInt(totalUsers.count),
      verifiedUsers: parseInt(verifiedUsers.count),
      adminCount: parseInt(adminCount.count),
      userCount: parseInt(userCount.count)
    };
  },

  // ✅ NEW: Get all meetings for admin dashboard
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
