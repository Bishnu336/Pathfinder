const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const userModel = require('../models/userModel');
const mentorshipModel = require('../models/mentorshipModel'); // ✅ Use mentorshipModel instead of meetingModel
const profileModel = require('../models/stdprofileModel');


// Email transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ------------------- Signup (with email verification) -------------------
exports.signup = async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;
  if (password !== confirmPassword) {
    return res.render('signup', { error: 'Passwords do not match.' });
  }

  try {
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.render('signup', { error: 'Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(16).toString('hex');

    await userModel.createUser(name, email, hashedPassword, role, token);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const link = `${baseUrl}/verify?email=${email}&token=${token}`;
    await transporter.sendMail({
      to: email,
      subject: 'Verify your email',
      html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`
    });

    res.send('Signup successful. Please verify your email.');
  } catch (err) {
    console.error('Signup Error:', err);
    res.render('signup', { error: 'Signup failed. Try again.' });
  }
};

// ------------------- Email Verification -------------------
exports.verifyEmail = async (req, res) => {
  const { email, token } = req.query;

  try {
    const user = await userModel.findUserByEmail(email);
    if (user && user.token === token) {
      await userModel.verifyUser(email);
      return res.redirect('/login'); // 🔁 Redirect to login
    }
    res.send('Invalid or expired verification link.');
  } catch (err) {
    res.send('Verification failed.');
  }
};

// ------------------- Login (Admin from .env or user from DB) -------------------
exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // 1. Admin login via .env
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD &&
      role === 'admin'
    ) {
      req.session.user = {
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        role: 'admin'
      };

      const stats = await userModel.getAdminStats();
      const users = await userModel.getAllUsers();
      const meetings = await mentorshipModel.getAllMeetings(); // ✅ Fixed

      return res.render('admin', {
        user: req.session.user,
        stats,
        users,
        meetings
      });
    }

    // 2. Normal user login via DB
    const user = await userModel.findUserByEmail(email);
    if (!user || !user.verified) {
      return res.render('login', { error: 'Email not verified or user not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid email or password.' });
    }

    if (user.role !== role) {
      return res.render('login', { error: `You are not authorized as ${role}.` });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    if (user.role === 'admin') {
      const stats = await userModel.getAdminStats();
      const users = await userModel.getAllUsers();
      const meetings = await mentorshipModel.getAllMeetings(); // ✅ Fixed

      return res.render('admin', {
        user: req.session.user,
        stats,
        users,
        meetings
      });
    }

    res.redirect('/home');
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'Login failed. Try again.' });
  }
};

// ------------------- Forgot Password -------------------
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findUserByEmail(email);
    if (!user) return res.render('forgot-password', { error: 'Email not found.' });

    const token = crypto.randomBytes(16).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await userModel.setResetToken(email, token, expires);

    const link = `http://localhost:3000/reset-password?token=${token}&email=${email}`;
    await transporter.sendMail({
      to: email,
      subject: 'Reset Password',
      html: `<p>Click <a href="${link}">here</a> to reset your password. Valid for 1 hour.</p>`
    });

    res.send('Reset link sent to your email.');
  } catch (err) {
    console.error('Forgot password error:', err);
    res.render('forgot-password', { error: 'Something went wrong.' });
  }
};

// ------------------- Reset Password -------------------
exports.resetPassword = async (req, res) => {
  const { email, token } = req.query;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render('reset-password', { error: 'Passwords do not match.', email, token });
  }

  try {
    const user = await userModel.findUserByEmail(email);
    if (!user || user.reset_token !== token || new Date() > new Date(user.reset_expires)) {
      return res.send('Invalid or expired reset link.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.updatePassword(email, hashedPassword);
    res.send('Password updated. <a href="/login">Login</a>');
  } catch (err) {
    console.error('Reset password error:', err);
    res.send('Reset failed.');
  }
};

// ------------------- Logout -------------------
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

// ------------------- Get Profile -------------------
exports.getProfile = async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect('/login');
  }

  try {
    const profile = await profileModel.getProfileByEmail(user.email);
    const recommendation = profile ? getCourseRecommendation(profile) : null;

    res.render('profile', {
      user,
      profile: profile || null,
      recommendation: recommendation || null
    });
  } catch (err) {
    console.error('Error loading profile:', err);
    res.render('profile', {
      user,
      profile: null,
      recommendation: null,
      error: 'Failed to load profile.'
    });
  }
};

