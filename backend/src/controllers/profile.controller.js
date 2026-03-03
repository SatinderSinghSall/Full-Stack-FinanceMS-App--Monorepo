const User = require("../models/User.model");
const Budget = require("../models/Budget.model");
const Expense = require("../models/Expense.model");

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.userId).select("name email createdAt");

  const budgetsCount = await Budget.countDocuments({
    userId: req.userId,
  });

  const expensesCount = await Expense.countDocuments({
    userId: req.userId,
  });

  res.json({
    user,
    stats: {
      budgetsCount,
      expensesCount,
    },
  });
};
