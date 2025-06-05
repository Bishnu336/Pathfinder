exports.postProfile = async (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.redirect('/login');
  }

  try {
    await profileModel.saveOrUpdateProfile(user.id, req.body);

    const updatedProfile = await profileModel.getProfileByUserId(user.id);

    res.render('profile', {
      user,
      profile: updatedProfile,
      success: 'Profile saved successfully.'
    });
  } catch (err) {
    console.error('❌ Error saving profile:', err);
    res.render('profile', {
      user,
      profile: req.body,
      error: 'Failed to save profile.'
    });
  }
};
