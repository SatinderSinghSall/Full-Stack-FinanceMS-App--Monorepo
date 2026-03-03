const Budget = require("../models/Budget.model");
const Expense = require("../models/Expense.model");

exports.getDashboardSummary = async (req, res) => {
  const userId = req.userId;

  const budgets = await Budget.find({ userId });
  const expenses = await Expense.find({ userId });

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  res.json({
    totalBudget,
    totalExpenses,
    remainingBalance: totalBudget - totalExpenses,
  });
};
