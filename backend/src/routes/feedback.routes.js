const express = require("express");
const router = express.Router();
const {
  submitFeedback,
  getUserFeedback,
} = require("../controllers/feedback.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// POST /api/feedback
router.post("/", authMiddleware, submitFeedback);
router.get("/", authMiddleware, getUserFeedback);

module.exports = router;
