const { saveRegistration } = require('../models/workshopModel');

exports.handleWorkshopRegistration = async (req, res) => {
  console.log('📥 Incoming form data:', req.body);

  const { fullname, email, interest } = req.body;

  if (!fullname || !email || !interest) {
    console.warn("⚠️ One or more fields are missing!", req.body);
    return res.status(400).json({ error: "All fields are required" }); // ← respond properly
  }

  try {
    const result = await saveRegistration(fullname, email, interest);
    console.log('✅ Registration saved:', result);
    return res.status(200).json({ message: "Registration successful" }); // ← FIXED: send response
  } catch (error) {
    console.error('❌ Error saving registration:', error);
    return res.status(500).json({ error: "Failed to save registration" });
  }
};
