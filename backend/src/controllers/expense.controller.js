const Expense = require("../models/Expense.model");

exports.createExpense = async (req, res) => {
  const expense = await Expense.create({
    ...req.body,
    userId: req.userId,
  });
  res.status(201).json(expense);
};

exports.getExpenses = async (req, res) => {
  const expenses = await Expense.find({ userId: req.userId }).sort({
    date: -1,
  });
  res.json(expenses);
};

exports.updateExpense = async (req, res) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true },
  );
  res.json(expense);
};

exports.deleteExpense = async (req, res) => {
  await Expense.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });
  res.json({ message: "Expense deleted" });
};
