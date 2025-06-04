const express = require('express');
const router = express.Router();

// Common render function to reuse settings on all pages
function renderWithSettings(req, res, page, data = {}) {
  res.render(page, {
    showSettings: req.session.showSettings || false,
    settings: req.session.settings || {},
    ...data
  });
}

// Homepage
router.get('/home', (req, res) => {
  renderWithSettings(req, res, 'home');
});

// Resources Page
router.get('/resources', (req, res) => {
  renderWithSettings(req, res, 'resources');
});

// Mentorship Page
router.get('/mentorship', (req, res) => {
  const searchQuery = req.query.search || '';
  const selectedExpertise = req.query.expertise || '';
  renderWithSettings(req, res, 'mentorship', {
    searchQuery,
    selectedExpertise
  });
});

// Dashboard Page
router.get('/dashboard', (req, res) => {
  renderWithSettings(req, res, 'dashboard');
});

// Guide Page
router.get('/guide', (req, res) => {
  renderWithSettings(req, res, 'guide');
});

// Toggle settings popup (for no-JS fallback)
router.post('/toggle-settings', (req, res) => {
  req.session.showSettings = !req.session.showSettings;
  const referer = req.get('Referer') || '/home';
  res.redirect(referer);
});

// Save settings preferences
router.post('/save-settings', (req, res) => {
  const { notifications, darkMode, emailUpdates } = req.body;
  req.session.settings = {
    notifications: !!notifications,
    darkMode: !!darkMode,
    emailUpdates: !!emailUpdates
  };
  req.session.showSettings = false;
  const referer = req.get('Referer') || '/home';
  res.redirect(referer);
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});


module.exports = router;
