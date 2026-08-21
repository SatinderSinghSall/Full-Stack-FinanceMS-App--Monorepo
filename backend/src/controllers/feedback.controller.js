const Feedback = require("../models/Feedback.model");

const submitFeedback = async (req, res, next) => {
  try {
    const { type, priority, email, subject, message } = req.body;
    const userId = req.userId; // Set by authMiddleware

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized user." });
    }

    if (!type || !priority || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    const newFeedback = await Feedback.create({
      user: userId,
      type,
      priority,
      email,
      subject,
      message,
      status: "Pending", // Explicitly default to Pending
    });

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully.",
      data: newFeedback,
    });
  } catch (error) {
    console.error("Feedback Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const getUserFeedback = async (req, res, next) => {
  try {
    const userId = req.userId;
    // Populate the 'user' field to automatically grab the user's name & email from the User model
    const feedbacks = await Feedback.find({ user: userId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    console.error("Fetch Feedback Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { submitFeedback, getUserFeedback };
