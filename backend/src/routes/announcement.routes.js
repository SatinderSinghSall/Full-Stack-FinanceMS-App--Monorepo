const express = require("express");

const {
  getActiveAnnouncements,
} = require("../controllers/announcement.controller");

const router = express.Router();

/**
 * GET /api/announcements
 *
 * Public/mobile endpoint.
 * Returns only currently active announcements.
 */
router.get("/", getActiveAnnouncements);

module.exports = router;
