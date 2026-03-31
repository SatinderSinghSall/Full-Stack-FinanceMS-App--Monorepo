const Income = require("../models/Income.model");
const ApiError = require("../utils/apiError");

// ➕ Add Income
const addIncome = async (req, res, next) => {
  try {
    const { source, amount, date, note } = req.body;

    if (!source || !amount) {
      return next(new ApiError(400, "Source and amount are required"));
    }

    const income = await Income.create({
      user: req.userId, // ✅ FIX
      source,
      amount,
      date,
      note,
    });

    res.status(201).json({
      success: true,
      data: income,
    });
  } catch (error) {
    next(error);
  }
};

// 📥 Get All Income
const getAllIncome = async (req, res, next) => {
  try {
    const income = await Income.find({ user: req.userId }).sort({
      date: -1,
    });

    res.status(200).json({
      success: true,
      data: income,
    });
  } catch (error) {
    next(error);
  }
};

// ✏️ Update Income
const updateIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.userId }, // ✅ FIX
      req.body,
      { new: true },
    );

    if (!income) {
      return next(new ApiError(404, "Income not found"));
    }

    res.status(200).json({
      success: true,
      data: income,
    });
  } catch (error) {
    next(error);
  }
};

// ❌ Delete Income
const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      user: req.userId, // ✅ FIX
    });

    if (!income) {
      return next(new ApiError(404, "Income not found"));
    }

    res.status(200).json({
      success: true,
      message: "Income deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// 💰 Total Income
const getTotalIncome = async (req, res, next) => {
  try {
    const result = await Income.aggregate([
      { $match: { user: req.userId } }, // ✅ FIX
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      total: result[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addIncome,
  getAllIncome,
  updateIncome,
  deleteIncome,
  getTotalIncome,
};
