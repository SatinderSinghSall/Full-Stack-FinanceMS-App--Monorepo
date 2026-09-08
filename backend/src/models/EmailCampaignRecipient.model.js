const mongoose = require("mongoose");

const emailCampaignRecipientSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailCampaign",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
      index: true,
    },

    resendEmailId: {
      type: String,
      default: null,
    },

    sentAt: {
      type: Date,
      default: null,
    },

    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// A user can only appear once in the same campaign.
emailCampaignRecipientSchema.index({ campaign: 1, user: 1 }, { unique: true });

module.exports = mongoose.model(
  "EmailCampaignRecipient",
  emailCampaignRecipientSchema,
);
