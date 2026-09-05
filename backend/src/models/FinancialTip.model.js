const mongoose = require("mongoose");

const financialTipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    category: {
      type: String,
      enum: [
        "budgeting",
        "saving",
        "expenses",
        "debt",
        "investing",
        "financial-safety",
        "money-habits",
        "goals",
      ],
      default: "money-habits",
    },

    type: {
      type: String,
      enum: ["tip", "guide", "lesson", "warning"],
      default: "tip",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    featured: {
      type: Boolean,
      default: false,
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

financialTipSchema.index({
  isActive: 1,
  featured: 1,
  category: 1,
  startDate: 1,
  endDate: 1,
});

module.exports = mongoose.model("FinancialTip", financialTipSchema);
