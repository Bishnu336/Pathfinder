const { saveMeeting } = require('../models/mentorshipModel');

const scheduleMeeting = async (req, res) => {
  try {
    const {
      selectedTopic,
      selectedDate,
      selectedTime,
      name,
      email,
      professor
    } = req.body;

    console.log("📥 Received meeting data:", {
      selectedTopic,
      selectedDate,
      selectedTime,
      name,
      email,
      professor
    });

    // ✅ Convert selectedDate to YYYY-MM-DD
    const formattedDate = selectedDate; // Already 'YYYY-MM-DD'

    // Validate inputs
    if (!selectedTopic || !selectedDate || !selectedTime || !name || !email || !professor) {
      console.warn("⚠️ Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    // Save to database
    await saveMeeting({
      topic: selectedTopic,
      date: formattedDate,  // Use formatted date
      time: selectedTime,
      name,
      email,
      professor
    });

    console.log("💾 Meeting saved to DB");
    res.status(200).json({ message: "Meeting scheduled successfully" });

  } catch (error) {
    console.error("❌ Error saving meeting:", error); // log full error object
    res.status(500).json({ message: "Failed to schedule meeting", error: error.message });
  }
};

// Get all meetings
const getAllMeetings = async () => {
  return db.any(`
    SELECT * FROM mentorship_meetings ORDER BY date DESC, time DESC
  `);
};

module.exports = {
  scheduleMeeting,
  getAllMeetings
};
