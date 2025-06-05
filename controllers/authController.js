const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const userModel = require('../models/userModel');
const mentorshipModel = require('../models/mentorshipModel');
const profileModel = require('../models/stdprofileModel');

// Email transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ------------------- Helper: Calculate Course Recommendation -------------------
function getCourseRecommendation(profile) {
  const scores = [
    profile.english,
    profile.dzongkha,
    profile.subject1,
    profile.subject2,
    profile.optional
  ];

  const validScores = scores.filter(score => typeof score === 'number' && !isNaN(score));
  const avg = validScores.length ? validScores.reduce((sum, val) => sum + val, 0) / validScores.length : 0;

  const stream = (profile.stream || '').toLowerCase();

  if (stream === 'science') {
    if (avg >= 80) return 'MBBS – KGUMSB / BSc or Engineering – CST';
    if (avg >= 70) return 'Engineering – JNEC / BSc – Sherubtse';
    if (avg >= 60) return 'Agriculture or Forestry – CNR / Education – SCE';
    if (avg >= 50) return 'Technical Training – VTI / Language & Culture – CLCS';
    return 'Diploma courses / Consider reattempting exams';
  }

  if (stream === 'commerce') {
    if (avg >= 80) return 'Business Intelligence or Accounting – GCBS / Data Science – Sherubtse';
    if (avg >= 70) return 'B.Com or BBA – GCBS / Digital Communication – Sherubtse';
    if (avg >= 60) return 'Education – SCE / Sustainable Development – CNR';
    if (avg >= 50) return 'Language & Culture – CLCS / Short-term training programs';
    return 'Diploma in Business or IT / Reattempt suggestion';
  }

  if (stream === 'arts') {
    if (avg >= 80) return 'BA in Language & Culture – CLCS / Digital Communication – Sherubtse';
    if (avg >= 70) return 'B.Ed – Paro/Samtse / BA in Political Science – Sherubtse';
    if (avg >= 60) return 'Sustainable Development – CNR / B.Ed in Dzongkha – PCE';
    if (avg >= 50) return 'Short-term skill training / Language programs – CLCS';
    return 'Diploma courses / Try again next year';
  }

  return 'Stream not specified or invalid';
}

// ------------------- Signup -------------------
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

    const link = `http://localhost:3000/verify?email=${email}&token=${token}`;
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
      return res.send('Email verified. <a href="/login">Login</a>');
    }
    res.send('Invalid or expired verification link.');
  } catch (err) {
    res.send('Verification failed.');
  }
};

// ------------------- Login -------------------
exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    
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
      const meetings = await mentorshipModel.getAllMeetings();

      return res.render('admin', {
        user: req.session.user,
        stats,
        users,
        meetings
      });
    }


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

      name: user.name,
      email: user.email,
      role: user.role
    };

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

// ------------------- Post Profile (Save/Update & Recommendation) -------------------
exports.postProfile = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');

  try {
    // Calculate recommendation
    const recommendation = getCourseRecommendation({
      english: parseFloat(req.body.english),
      dzongkha: parseFloat(req.body.dzongkha),
      subject1: parseFloat(req.body.subject1),
      subject2: parseFloat(req.body.subject2),
      optional: parseFloat(req.body.optional),
      stream: req.body.stream
    });

    // Save profile with recommendation
    await profileModel.saveOrUpdateProfile(user.email, {
      ...req.body,
      recommendation
    });

    const profile = await profileModel.getProfileByEmail(user.email);

    res.render('profile', {
      user,
      profile,
      recommendation,
      success: 'Profile submitted successfully.'
    });
  } catch (err) {
    console.error('Error submitting profile:', err);
    res.render('profile', {
      user,
      profile: req.body,
      recommendation: null,
      error: 'Something went wrong. Please try again.'
    });
  }
};

// ------------------- Get Profile -------------------
exports.getProfile = async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/login');

  try {
    const profile = await profileModel.getProfileByEmail(user.email);
    const recommendation = profile ? getCourseRecommendation(profile) : null;

    res.render('profile', {
      user,
      profile,
      recommendation
    });
  } catch (err) {
    console.error('Error loading profile:', err);
    res.render('profile', {
      user,
      profile: null,
      recommendation: null
    });
  }

};
