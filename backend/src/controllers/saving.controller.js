const Saving = require("../models/Saving.model");

/* ---------------- CREATE SAVING ---------------- */

exports.createSaving = async (req, res) => {
  try {
    const { goal, amount } = req.body;

    if (!goal || amount == null) {
      return res.status(400).json({
        message: "Goal and amount are required",
      });
    }

    const saving = await Saving.create({
      userId: req.userId,
      goal,
      amount,
    });

    res.status(201).json(saving);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create saving",
    });
  }
};

/* ---------------- GET SAVINGS ---------------- */

exports.getSavings = async (req, res) => {
  try {
    const savings = await Saving.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.json(savings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch savings",
    });
  }
};

/* ---------------- UPDATE SAVING ---------------- */

exports.updateSaving = async (req, res) => {
  try {
    const saving = await Saving.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      req.body,
      { new: true },
    );

    if (!saving) {
      return res.status(404).json({
        message: "Saving not found",
      });
    }

    res.json(saving);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update saving",
    });
  }
};

/* ---------------- DELETE SAVING ---------------- */

exports.deleteSaving = async (req, res) => {
  try {
    const saving = await Saving.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!saving) {
      return res.status(404).json({
        message: "Saving not found",
      });
    }

    res.json({
      message: "Saving deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete saving",
    });
  }
};
