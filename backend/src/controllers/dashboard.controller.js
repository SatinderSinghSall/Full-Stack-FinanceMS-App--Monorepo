const Budget = require("../models/Budget.model");
const Expense = require("../models/Expense.model");

exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.userId;

    /* ---------- TOTAL BUDGET ---------- */

    const budgets = await Budget.find({ userId });

    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);

    /* ---------- TOTAL EXPENSES ---------- */

    const expenses = await Expense.find({ userId });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    /* ---------- RECENT EXPENSES ---------- */

    const recentExpenses = await Expense.find({ userId })
      .sort({ createdAt: -1 }) // newest first
      .limit(5)
      .select("title amount category createdAt");

    /* ---------- RESPONSE ---------- */

    res.json({
      totalBudget,
      totalExpenses,
      remainingBalance: totalBudget - totalExpenses,
      recentExpenses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load dashboard summary" });
  }
};
