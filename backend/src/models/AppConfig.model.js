const mongoose = require("mongoose");

const appConfigSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ["android", "ios"],
      required: true,
      unique: true,
    },

    latestVersion: {
      type: String,
      required: true,
      trim: true,
    },

    minSupportedVersion: {
      type: String,
      required: true,
      trim: true,
    },

    forceUpdate: {
      type: Boolean,
      default: false,
    },

    playStoreUrl: {
      type: String,
      required: true,
      trim: true,
    },

    updateMessage: {
      type: String,
      default:
        "A new version of FinTrack is available with improvements and new features.",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("AppConfig", appConfigSchema);
