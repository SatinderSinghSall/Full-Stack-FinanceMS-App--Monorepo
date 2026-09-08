const mongoose = require("mongoose");

const emailCampaignSchema = new mongoose.Schema(
  {
    campaignId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    htmlContent: {
      type: String,
      required: true,
    },

    textContent: {
      type: String,
      default: "",
    },

    buttonText: {
      type: String,
      default: "",
      trim: true,
    },

    buttonUrl: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["draft", "active", "completed"],
      default: "draft",
      index: true,
    },

    sentCount: {
      type: Number,
      default: 0,
    },

    failedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("EmailCampaign", emailCampaignSchema);
