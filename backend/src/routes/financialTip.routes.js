const express = require("express");

const {
  getActiveFinancialTips,
} = require("../controllers/financialTip.controller");

const router = express.Router();

/**
 * GET /api/financial-tips
 *
 * Public/mobile endpoint.
 * Returns only currently active financial tips.
 */
router.get("/", getActiveFinancialTips);

module.exports = router;
