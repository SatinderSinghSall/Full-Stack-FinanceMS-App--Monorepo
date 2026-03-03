const express = require("express");
const auth = require("../middlewares/auth.middleware");
const { getDashboardSummary } = require("../controllers/dashboard.controller");

const router = express.Router();

router.use(auth);
router.get("/summary", getDashboardSummary);

module.exports = router;
