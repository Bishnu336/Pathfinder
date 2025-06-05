require('dotenv').config(); // Load .env variables

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mentorshipRoutes = require('./routes/mentorshipRoutes'); 
const workshopRoutes = require('./routes/workshopRoutes');
const adminRoutes = require('./routes/adminRoutes');
const profileRoutes = require('./routes/profileRoutes');
const collegeRoutes = require('./routes/collegeRoutes.js');

// ---------- DB Setup ----------
const db = require('./config/db');
db.one("SELECT NOW()")
  .then(data => console.log('✅ DB connected. Time:', data.now))
  .catch(err => console.error('❌ DB connection failed:', err));

const { createMeetingsTable } = require('./models/mentorshipModel');
const { createWorkshopTable } = require('./models/workshopModel');
const { createProfileTable } = require('./models/stdprofileModel');

createMeetingsTable();
createWorkshopTable();
createProfileTable();

// ---------- Express App ----------
const app = express();

// ---------- Session Setup ----------
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

// Share session info with views
app.use((req, res, next) => {
  res.locals.showSettings = req.session.showSettings || false;
  res.locals.settings = req.session.settings || {};
  res.locals.user = req.session.user || null;
  next();
});

// ---------- View Engine ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- Middleware ----------
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Routes ----------
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use('/', mentorshipRoutes);
app.use('/', workshopRoutes);
app.use('/', adminRoutes);
app.use('/', profileRoutes);
app.use('/colleges', collegeRoutes);

// ---------- Page Routes ----------
app.get('/', (req, res) => res.render('index'));
app.get('/home', (req, res) => res.render('home'));
app.get('/resources', (req, res) => res.render('resources'));
app.get('/dashboard', (req, res) => res.render('dashboard'));
app.get('/mentorship', (req, res) => res.render('mentorship'));
app.get('/application', (req, res) => res.render('application'));
app.get('/test', (req, res) => res.render('test'));
app.get('/view', (req, res) => res.render('view'));
app.get('/workshop', (req, res) => res.render('workshop'));
app.get('/rsuccess', (req, res) => res.render('rsuccess'));

app.get('/sm1', (req, res) => res.render('sm1'));
app.get('/profile1', (req, res) => res.render('profile1'));
app.get('/sm2', (req, res) => res.render('sm2'));
app.get('/profile2', (req, res) => res.render('profile2'));
app.get('/sm3', (req, res) => res.render('sm3'));
app.get('/profile3', (req, res) => res.render('profile3'));

// ---------- Start Server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
