exports.saveProfile = (req, res) => {
  const profileData = req.body;
  console.log("Received profile data:", profileData);

  // Save to DB here if needed

  res.redirect('/dashboard'); // or res.render('confirmation');
};
