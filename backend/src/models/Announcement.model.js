const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    type: {
      type: String,
      enum: ["info", "success", "warning", "feature"],
      default: "info",
    },

    isActive: {
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

    action: {
      enabled: {
        type: Boolean,
        default: false,
      },

      label: {
        type: String,
        trim: true,
        maxlength: 50,
      },

      route: {
        type: String,
        trim: true,
        maxlength: 200,
      },
    },
  },
  {
    timestamps: true,
  },
);

announcementSchema.index({
  isActive: 1,
  startDate: 1,
  endDate: 1,
});

module.exports = mongoose.model("Announcement", announcementSchema);
