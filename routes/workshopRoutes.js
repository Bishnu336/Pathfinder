const express = require('express');
const router = express.Router();
const workshopController = require('../controllers/workshopController');

// Show the main workshop page
router.get('/workshop', (req, res) => {
  res.render('workshop', {
    showSettings: req.session.showSettings || false,
    settings: req.session.settings || {}
  });
});

// Handle form submission
router.post('/workshop/register', workshopController.handleWorkshopRegistration);

// Show registration success page
router.get('/workshop/success', (req, res) => {
  res.render('workshop/rsuccess', {
    showSettings: req.session.showSettings || false,
    settings: req.session.settings || {}
  });
});

module.exports = router;
