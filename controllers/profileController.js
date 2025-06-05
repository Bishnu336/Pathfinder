exports.saveProfile = async (req, res) => {
  const user = req.session.user;
  const profileData = req.body;

  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    await profileModel.saveOrUpdateProfile(user.id, profileData);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error saving profile:', err);
    res.status(500).json({ success: false, error: 'Failed to save profile' });
  }
};
