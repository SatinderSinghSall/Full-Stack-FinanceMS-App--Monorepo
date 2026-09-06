const express = require("express");

const {
  getMaintenanceStatus,
} = require("../controllers/maintenance.controller");

const router = express.Router();

/**
 * GET /api/maintenance
 *
 * Public/mobile endpoint.
 * Returns the currently applicable maintenance status.
 */
router.get("/", getMaintenanceStatus);

module.exports = router;
