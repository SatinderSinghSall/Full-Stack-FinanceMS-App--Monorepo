const Subscription = require("../models/Subscription.model");
const calculateRenewalDate = require("../utils/calculateRenewalDate");

exports.createSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      userId: req.userId,
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.log("CREATE SUBSCRIPTION ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      userId: req.userId,
    }).sort({
      nextRenewalDate: 1,
    });

    res.json(subscriptions);
  } catch (error) {
    console.log("GET SUBSCRIPTIONS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    res.json(subscription);
  } catch (error) {
    console.log("GET SUBSCRIPTION ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      },
    );

    res.json(subscription);
  } catch (error) {
    console.log("UPDATE SUBSCRIPTION ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    await Subscription.findByIdAndDelete(req.params.id);

    res.json({
      message: "Subscription deleted",
    });
  } catch (error) {
    console.log("DELETE SUBSCRIPTION ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

exports.createSubscription = async (req, res) => {
  try {
    const { billingCycle, startDate } = req.body;

    const nextRenewalDate = calculateRenewalDate(startDate, billingCycle);

    const subscription = await Subscription.create({
      ...req.body,

      userId: req.userId,

      nextRenewalDate,
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.log("CREATE SUBSCRIPTION ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
