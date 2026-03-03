const Budget = require("../models/Budget.model");

exports.createBudget = async (req, res) => {
  const { category, limit } = req.body;

  if (!category || limit == null) {
    return res.status(400).json({ message: "Category and limit are required" });
  }

  const month = new Date().toISOString().slice(0, 7); // YYYY-MM

  const budget = await Budget.create({
    userId: req.userId,
    category,
    limit,
    month,
  });

  res.status(201).json(budget);
};

exports.getBudgets = async (req, res) => {
  const budgets = await Budget.find({ userId: req.userId });
  res.json(budgets);
};

exports.updateBudget = async (req, res) => {
  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true },
  );
  res.json(budget);
};

exports.deleteBudget = async (req, res) => {
  await Budget.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });
  res.json({ message: "Budget deleted" });
};
