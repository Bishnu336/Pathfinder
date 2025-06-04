const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController'); // ✅ Add this

// ---------- AUTH ROUTES ----------
router.get('/signup', (req, res) => res.render('signup', { error: null }));
router.get('/login', (req, res) => res.render('login', { error: null }));

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.get('/verify', authController.verifyEmail);
router.get('/profile', authController.getProfile);

// ---------- PASSWORD RESET ROUTES ----------
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { error: null });
});
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password', (req, res) => {
  const { email, token } = req.query;
  res.render('reset-password', { email, token, error: null });
});
router.post('/reset-password', authController.resetPassword);

// ---------- ADMIN DASHBOARD ROUTE ----------
router.get('/admin', (req, res, next) => {
  const user = req.session.user;

  if (!user || user.role !== 'admin') {
    return res.redirect('/login');
  }

  return adminController.getAdminDashboard(req, res, next); // ✅ FIXED
});

module.exports = router;
