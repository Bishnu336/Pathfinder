const express = require('express');
const router = express.Router();

router.get('/cst', (req, res) => {
  res.render('cst', { settings: req.session.settings || {} });
});

router.get('/gedu', (req, res) => {
  res.render('gedu', { settings: req.session.settings || {} });
});

router.get('/paro', (req, res) => {
  res.render('paro', { settings: req.session.settings || {} });
});

router.get('/sherubtse', (req, res) => {
  res.render('sherubtse', { settings: req.session.settings || {} });
});

router.get('/cnr', (req, res) => {
  res.render('cnr', { settings: req.session.settings || {} });
});

router.get('/clcs', (req, res) => {
  res.render('clcs', { settings: req.session.settings || {} });
});

router.get('/kgumsb', (req, res) => {
  res.render('kgumsb', { settings: req.session.settings || {} });
});

router.get('/gcit', (req, res) => {
  res.render('gcit', { settings: req.session.settings || {} });
});

module.exports = router;
