const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin.model");
const User = require("../models/User.model");
const Budget = require("../models/Budget.model");
const Expense = require("../models/Expense.model");
const Income = require("../models/Income.model");
const Saving = require("../models/Saving.model");
const Subscription = require("../models/Subscription.model");

const generateAdminToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      role: admin.role,
      type: "admin",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const token = generateAdminToken(admin);

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.me = async (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
  });
};

exports.dashboard = async (req, res) => {
  try {
    const [
      users,
      budgets,
      expenses,
      incomes,
      savings,
      subscriptions,
      incomeTotals,
      expenseTotals,
      savingsTotals,
      expenseByCategory,
      recentExpenses,
      recentIncome,
    ] = await Promise.all([
      // Collection counts
      User.countDocuments(),
      Budget.countDocuments(),
      Expense.countDocuments(),
      Income.countDocuments(),
      Saving.countDocuments(),
      Subscription.countDocuments(),

      // Total income
      Income.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]),

      // Total expenses
      Expense.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]),

      // Total savings
      Saving.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]),

      // Expenses grouped by category
      Expense.aggregate([
        {
          $group: {
            _id: {
              $ifNull: ["$category", "Other"],
            },
            amount: {
              $sum: "$amount",
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            amount: 1,
            count: 1,
          },
        },
        {
          $sort: {
            amount: -1,
          },
        },
      ]),

      // Latest expenses
      Expense.find({})
        .sort({
          date: -1,
          createdAt: -1,
        })
        .limit(5)
        .lean(),

      // Latest income
      Income.find({})
        .sort({
          date: -1,
          createdAt: -1,
        })
        .limit(5)
        .lean(),
    ]);

    const totalIncome = incomeTotals[0]?.total || 0;

    const totalExpenses = expenseTotals[0]?.total || 0;

    const totalSavings = savingsTotals[0]?.total || 0;

    res.json({
      success: true,

      data: {
        overview: {
          users,
          budgets,
          expenses,
          incomes,
          savings,
          subscriptions,
        },

        financial: {
          totalIncome,
          totalExpenses,
          totalSavings,
          balance: totalIncome - totalExpenses,
        },

        expenseByCategory,

        recentExpenses,

        recentIncome,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
    });
  }
};
