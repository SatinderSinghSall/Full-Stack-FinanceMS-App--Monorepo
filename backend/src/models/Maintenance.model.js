const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      default: "Maintenance in Progress",
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
      default:
        "FinTrack is currently undergoing maintenance. We appreciate your patience.",
    },

    allowUserAccess: {
      type: Boolean,
      default: true,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

maintenanceSchema.index({
  enabled: 1,
  startDate: 1,
  endDate: 1,
});

module.exports = mongoose.model("Maintenance", maintenanceSchema);
