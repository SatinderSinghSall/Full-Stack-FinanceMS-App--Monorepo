const router = require("express").Router();
const { getProfile } = require("../controllers/profile.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth, getProfile);

module.exports = router;
