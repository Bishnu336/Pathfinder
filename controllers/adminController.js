const { getAllUsers } = require('../models/userModel');
const { getAllMeetings } = require('../models/mentorshipModel');
const { getCourseRecommendation } = require('../utils/recommendation'); // ✅ Keep this only

// ✅ DO NOT redefine getCourseRecommendation here

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
