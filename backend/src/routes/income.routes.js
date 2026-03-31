const express = require("express");
const {
  addIncome,
  getAllIncome,
  updateIncome,
  deleteIncome,
  getTotalIncome,
} = require("../controllers/income.controller");
const protect = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(protect);

router.route("/").post(addIncome).get(getAllIncome);

router.get("/total", getTotalIncome);

router.route("/:id").put(updateIncome).delete(deleteIncome);

module.exports = router;
