const express = require("express");
const { getAppVersion } = require("../controllers/app.controller");

const router = express.Router();

router.get("/version", getAppVersion);

module.exports = router;
