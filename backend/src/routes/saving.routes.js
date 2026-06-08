const express = require("express");

const auth = require("../middlewares/auth.middleware");

const {
  createSaving,
  getSavings,
  updateSaving,
  deleteSaving,
} = require("../controllers/saving.controller");

const router = express.Router();

/* 🔒 PROTECTED ROUTES */

router.use(auth);

/* CRUD */

router.post("/", createSaving);

router.get("/", getSavings);

router.put("/:id", updateSaving);

router.delete("/:id", deleteSaving);

module.exports = router;
