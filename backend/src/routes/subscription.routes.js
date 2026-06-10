const express = require("express");

const {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
} = require("../controllers/subscription.controller.js");

const protect = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.use(protect);

router.route("/").post(createSubscription).get(getSubscriptions);

router
  .route("/:id")
  .get(getSubscriptionById)
  .put(updateSubscription)
  .delete(deleteSubscription);

module.exports = router;
