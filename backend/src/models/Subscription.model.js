const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "Other",
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    billingCycle: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "yearly"],
      default: "monthly",
    },

    startDate: {
      type: Date,
      required: true,
    },

    nextRenewalDate: {
      type: Date,
      required: true,
    },

    reminderDaysBefore: {
      type: Number,
      default: 3,
    },

    autoRenew: {
      type: Boolean,
      default: true,
    },

    paymentMethod: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
    },

    icon: {
      type: String,
      default: "",
    },

    color: {
      type: String,
      default: "#6366F1",
    },
  },
  {
    timestamps: true,
  },
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
