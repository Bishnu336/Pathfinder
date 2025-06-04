const { getAllUsers } = require('../models/userModel');
const { getAllMeetings } = require('../models/mentorshipModel');

// Helper: Calculate course recommendation
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

// Admin Dashboard Controller
exports.getAdminDashboard = async (req, res) => {
  try {
    const users = await getAllUsers();
    const meetings = await getAllMeetings();

    const stats = {
      totalUsers: users.length || 0,
      activeMentors: users.filter(u => u.role === 'mentor').length || 0,
      meetings: meetings.length || 0,
      feedback: 0 // update if you implement feedback tracking
    };

    console.log('Rendering admin with stats:', stats);
    
    res.render('admin', {
      users,
      meetings,
      stats,
      settings: req.session.settings || {}
    });
  } catch (err) {
    console.error('❌ Admin dashboard error:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Admin Users Page Controller
exports.getUsersPage = async (req, res) => {
  try {
    const searchQuery = req.query.search?.toLowerCase() || '';
    let profiles = await getAllUsers();

    // Add recommendations
    profiles = profiles.map(profile => ({
      ...profile,
      recommendation: getCourseRecommendation(profile)
    }));

    // Filter if search query exists
    if (searchQuery) {
      profiles = profiles.filter(profile =>
        (profile.full_name && profile.full_name.toLowerCase().includes(searchQuery)) ||
        (profile.stream && profile.stream.toLowerCase().includes(searchQuery)) ||
        (profile.recommendation && profile.recommendation.toLowerCase().includes(searchQuery))
      );
    }

    res.render('user', {
      profiles,
      search: req.query.search || ''
    });
  } catch (err) {
    console.error('❌ Error loading users:', err);
    res.status(500).send('Internal Server Error');
  }
};
