const bcrypt = require("bcryptjs");

const User = require("../models/User.model");
const Budget = require("../models/Budget.model");
const Expense = require("../models/Expense.model");
const Income = require("../models/Income.model");
const Saving = require("../models/Saving.model");
const Subscription = require("../models/Subscription.model");
const Feedback = require("../models/Feedback.model");
const Admin = require("../models/Admin.model");

const getCollection = (Model) => async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Model.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),

      Model.countDocuments(),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Users
|--------------------------------------------------------------------------
*/

// GET /api/admin/users/:id
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Admin get user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load user",
    });
  }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, email, password } = req.body;

    const user = await User.findById(id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Name
    |--------------------------------------------------------------------------
    */

    if (name !== undefined) {
      if (typeof name !== "string") {
        return res.status(400).json({
          success: false,
          message: "Name must be a string",
        });
      }

      const trimmedName = name.trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      user.name = trimmedName;
    }

    /*
    |--------------------------------------------------------------------------
    | Email
    |--------------------------------------------------------------------------
    */

    if (email !== undefined) {
      if (typeof email !== "string") {
        return res.status(400).json({
          success: false,
          message: "Email must be a string",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty",
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Another user already uses this email",
        });
      }

      user.email = normalizedEmail;
    }

    /*
    |--------------------------------------------------------------------------
    | Password
    |--------------------------------------------------------------------------
    |
    | Password is optional during an edit.
    | Empty / omitted password = keep current password.
    |
    */

    if (password !== undefined && password !== "") {
      if (typeof password !== "string") {
        return res.status(400).json({
          success: false,
          message: "Password must be a string",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const safeUser = user.toObject();

    delete safeUser.password;

    res.json({
      success: true,
      message: "User updated successfully",
      data: safeUser,
    });
  } catch (error) {
    console.error("Admin update user error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("_id name email").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Check related financial records
    |--------------------------------------------------------------------------
    */

    const [budgets, expenses, incomes, savings, subscriptions] =
      await Promise.all([
        Budget.countDocuments({
          userId: id,
        }),

        Expense.countDocuments({
          userId: id,
        }),

        Income.countDocuments({
          user: id,
        }),

        Saving.countDocuments({
          userId: id,
        }),

        Subscription.countDocuments({
          userId: id,
        }),
      ]);

    const relatedRecords = {
      budgets,
      expenses,
      incomes,
      savings,
      subscriptions,
    };

    const totalRelatedRecords =
      budgets + expenses + incomes + savings + subscriptions;

    if (totalRelatedRecords > 0) {
      return res.status(409).json({
        success: false,
        code: "USER_HAS_RELATED_DATA",
        message:
          "This user has related financial records and cannot be deleted.",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
          relatedRecords,
          totalRelatedRecords,
        },
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "User deleted successfully",
      data: {
        id: user._id,
      },
    });
  } catch (error) {
    console.error("Admin delete user error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Budgets
|--------------------------------------------------------------------------
*/

// GET /api/admin/budgets/:id
exports.getBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findById(id).lean();

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.json({
      success: true,
      data: budget,
    });
  } catch (error) {
    console.error("Admin get budget error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load budget",
    });
  }
};

// PUT /api/admin/budgets/:id
exports.updateBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const { category, limit, month } = req.body;

    const budget = await Budget.findById(id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Category
    |--------------------------------------------------------------------------
    */

    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category is required",
        });
      }

      budget.category = category.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | Limit
    |--------------------------------------------------------------------------
    */

    if (limit !== undefined) {
      const numericLimit = Number(limit);

      if (Number.isNaN(numericLimit) || numericLimit < 0) {
        return res.status(400).json({
          success: false,
          message: "Budget limit must be a number greater than or equal to 0",
        });
      }

      budget.limit = numericLimit;
    }

    /*
    |--------------------------------------------------------------------------
    | Month
    |--------------------------------------------------------------------------
    */

    if (month !== undefined) {
      if (typeof month !== "string" || !/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({
          success: false,
          message: "Month must use YYYY-MM format",
        });
      }

      budget.month = month;
    }

    await budget.save();

    res.json({
      success: true,
      message: "Budget updated successfully",
      data: budget,
    });
  } catch (error) {
    console.error("Admin update budget error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update budget",
    });
  }
};

// DELETE /api/admin/budgets/:id
exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findById(id)
      .select("_id category limit month")
      .lean();

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    await Budget.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Budget deleted successfully",
      data: {
        id: budget._id,
      },
    });
  } catch (error) {
    console.error("Admin delete budget error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete budget",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Expenses
|--------------------------------------------------------------------------
*/

// GET /api/admin/expenses/:id
exports.getExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id).lean();

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error("Admin get expense error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load expense",
    });
  }
};

// PUT /api/admin/expenses/:id
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, amount, category, date, notes } = req.body;

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Title
    |--------------------------------------------------------------------------
    */

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title is required",
        });
      }

      expense.title = title.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | Amount
    |--------------------------------------------------------------------------
    */

    if (amount !== undefined) {
      const numericAmount = Number(amount);

      if (Number.isNaN(numericAmount) || numericAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a number greater than or equal to 0",
        });
      }

      expense.amount = numericAmount;
    }

    /*
    |--------------------------------------------------------------------------
    | Category
    |--------------------------------------------------------------------------
    */

    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category is required",
        });
      }

      expense.category = category.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | Date
    |--------------------------------------------------------------------------
    */

    if (date !== undefined) {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expense date",
        });
      }

      expense.date = parsedDate;
    }

    /*
    |--------------------------------------------------------------------------
    | Notes
    |--------------------------------------------------------------------------
    */

    if (notes !== undefined) {
      if (typeof notes !== "string") {
        return res.status(400).json({
          success: false,
          message: "Notes must be a string",
        });
      }

      expense.notes = notes.trim();
    }

    await expense.save();

    res.json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });
  } catch (error) {
    console.error("Admin update expense error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update expense",
    });
  }
};

// DELETE /api/admin/expenses/:id
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id)
      .select("_id title amount category")
      .lean();

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    await Expense.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Expense deleted successfully",
      data: {
        id: expense._id,
      },
    });
  } catch (error) {
    console.error("Admin delete expense error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete expense",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Income
|--------------------------------------------------------------------------
*/

// GET /api/admin/incomes/:id
exports.getIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const income = await Income.findById(id).lean();

    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    res.json({
      success: true,
      data: income,
    });
  } catch (error) {
    console.error("Admin get income error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load income",
    });
  }
};

// PUT /api/admin/incomes/:id
exports.updateIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const { source, amount, date, note } = req.body;

    const income = await Income.findById(id);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Source
    |--------------------------------------------------------------------------
    */

    if (source !== undefined) {
      if (typeof source !== "string" || !source.trim()) {
        return res.status(400).json({
          success: false,
          message: "Source is required",
        });
      }

      income.source = source.trim();
    }

    /*
    |--------------------------------------------------------------------------
    | Amount
    |--------------------------------------------------------------------------
    */

    if (amount !== undefined) {
      const numericAmount = Number(amount);

      if (Number.isNaN(numericAmount) || numericAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a number greater than or equal to 0",
        });
      }

      income.amount = numericAmount;
    }

    /*
    |--------------------------------------------------------------------------
    | Date
    |--------------------------------------------------------------------------
    */

    if (date !== undefined) {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid income date",
        });
      }

      income.date = parsedDate;
    }

    /*
    |--------------------------------------------------------------------------
    | Note
    |--------------------------------------------------------------------------
    */

    if (note !== undefined) {
      if (typeof note !== "string") {
        return res.status(400).json({
          success: false,
          message: "Note must be a string",
        });
      }

      income.note = note.trim();
    }

    await income.save();

    res.json({
      success: true,
      message: "Income updated successfully",
      data: income,
    });
  } catch (error) {
    console.error("Admin update income error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update income",
    });
  }
};

// DELETE /api/admin/incomes/:id
exports.deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;

    const income = await Income.findById(id).select("_id source amount").lean();

    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    await Income.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Income deleted successfully",
      data: {
        id: income._id,
      },
    });
  } catch (error) {
    console.error("Admin delete income error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete income",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Savings
|--------------------------------------------------------------------------
*/

// GET /api/admin/savings/:id
exports.getSaving = async (req, res) => {
  try {
    const { id } = req.params;

    const saving = await Saving.findById(id).lean();

    if (!saving) {
      return res.status(404).json({
        success: false,
        message: "Saving not found",
      });
    }

    res.json({
      success: true,
      data: saving,
    });
  } catch (error) {
    console.error("Admin get saving error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load saving",
    });
  }
};

// PUT /api/admin/savings/:id
exports.updateSaving = async (req, res) => {
  try {
    const { id } = req.params;
    const { goal, amount } = req.body;

    const saving = await Saving.findById(id);

    if (!saving) {
      return res.status(404).json({
        success: false,
        message: "Saving not found",
      });
    }

    if (goal !== undefined) {
      if (typeof goal !== "string" || !goal.trim()) {
        return res.status(400).json({
          success: false,
          message: "Goal is required",
        });
      }

      saving.goal = goal.trim();
    }

    if (amount !== undefined) {
      const numericAmount = Number(amount);

      if (Number.isNaN(numericAmount) || numericAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a number greater than or equal to 0",
        });
      }

      saving.amount = numericAmount;
    }

    await saving.save();

    res.json({
      success: true,
      message: "Saving updated successfully",
      data: saving,
    });
  } catch (error) {
    console.error("Admin update saving error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update saving",
    });
  }
};

// DELETE /api/admin/savings/:id
exports.deleteSaving = async (req, res) => {
  try {
    const { id } = req.params;

    const saving = await Saving.findById(id).select("_id goal amount").lean();

    if (!saving) {
      return res.status(404).json({
        success: false,
        message: "Saving not found",
      });
    }

    await Saving.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Saving deleted successfully",
      data: {
        id: saving._id,
      },
    });
  } catch (error) {
    console.error("Admin delete saving error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete saving",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Subscriptions
|--------------------------------------------------------------------------
*/

// GET /api/admin/subscriptions/:id
exports.getSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id).lean();

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error("Admin get subscription error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load subscription",
    });
  }
};

// PUT /api/admin/subscriptions/:id
exports.updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    /*
     * userId is intentionally NOT accepted here.
     * An admin can edit the subscription itself,
     * but cannot move it to another user.
     */

    const allowedFields = [
      "name",
      "category",
      "amount",
      "currency",
      "billingCycle",
      "startDate",
      "nextRenewalDate",
      "reminderDaysBefore",
      "autoRenew",
      "paymentMethod",
      "notes",
      "status",
      "icon",
      "color",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        subscription[field] = req.body[field];
      }
    }

    // Basic validation
    if (typeof subscription.name !== "string" || !subscription.name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subscription name is required",
      });
    }

    subscription.name = subscription.name.trim();

    const amount = Number(subscription.amount);

    if (Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a number greater than or equal to 0",
      });
    }

    subscription.amount = amount;

    if (
      !["weekly", "monthly", "quarterly", "yearly"].includes(
        subscription.billingCycle,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid billing cycle",
      });
    }

    if (!["active", "cancelled"].includes(subscription.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription status",
      });
    }

    const reminderDays = Number(subscription.reminderDaysBefore);

    if (Number.isNaN(reminderDays) || reminderDays < 0) {
      return res.status(400).json({
        success: false,
        message: "Reminder days must be 0 or greater",
      });
    }

    subscription.reminderDaysBefore = reminderDays;

    await subscription.save();

    res.json({
      success: true,
      message: "Subscription updated successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Admin update subscription error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update subscription",
    });
  }
};

// DELETE /api/admin/subscriptions/:id
exports.deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id)
      .select("_id name amount currency")
      .lean();

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    await Subscription.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Subscription deleted successfully",
      data: {
        id: subscription._id,
      },
    });
  } catch (error) {
    console.error("Admin delete subscription error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete subscription",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Feedback
|--------------------------------------------------------------------------
*/

// GET /api/admin/feedbacks/:id
exports.getFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id)
      .populate("user", "name email")
      .lean();

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Admin get feedback error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load feedback",
    });
  }
};

// PUT /api/admin/feedbacks/:id
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    if (status !== undefined) {
      if (!["Pending", "In Progress", "Resolved"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }
      feedback.status = status;
    }

    if (priority !== undefined) {
      if (!["Low", "Medium", "High"].includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority value",
        });
      }
      feedback.priority = priority;
    }

    await feedback.save();

    res.json({
      success: true,
      message: "Feedback updated successfully",
      data: feedback,
    });
  } catch (error) {
    console.error("Admin update feedback error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update feedback",
    });
  }
};

// DELETE /api/admin/feedbacks/:id
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id).select("_id").lean();

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    await Feedback.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Feedback deleted successfully",
      data: {
        id: feedback._id,
      },
    });
  } catch (error) {
    console.error("Admin delete feedback error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete feedback",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Admins (Added CRUD Operations)
|--------------------------------------------------------------------------
*/

// GET /api/admin/admins/:id
exports.getAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id).select("-password").lean();

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("Admin get admin error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load admin",
    });
  }
};

// PUT /api/admin/admins/:id
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, isActive } = req.body;

    const admin = await Admin.findById(id).select("+password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }
      admin.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty",
        });
      }
      const normalizedEmail = email.trim().toLowerCase();
      const existingAdmin = await Admin.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          message: "Another admin already uses this email",
        });
      }
      admin.email = normalizedEmail;
    }

    if (password !== undefined && password !== "") {
      if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }
      admin.password = await bcrypt.hash(password, 10);
    }

    if (role !== undefined) {
      admin.role = role;
    }

    if (isActive !== undefined) {
      admin.isActive = isActive;
    }

    await admin.save();

    const safeAdmin = admin.toObject();
    delete safeAdmin.password;

    res.json({
      success: true,
      message: "Admin updated successfully",
      data: safeAdmin,
    });
  } catch (error) {
    console.error("Admin update admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update admin",
    });
  }
};

// DELETE /api/admin/admins/:id
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves if requested (optional safety check)
    if (req.admin && req.admin.id === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account while logged in",
      });
    }

    const admin = await Admin.findById(id).select("_id name email").lean();

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    await Admin.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Admin deleted successfully",
      data: {
        id: admin._id,
      },
    });
  } catch (error) {
    console.error("Admin delete admin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete admin",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Collections
|--------------------------------------------------------------------------
*/

exports.users = getCollection(User);
exports.budgets = getCollection(Budget);
exports.expenses = getCollection(Expense);
exports.incomes = getCollection(Income);
exports.savings = getCollection(Saving);
exports.subscriptions = getCollection(Subscription);
exports.feedbacks = getCollection(Feedback);
exports.admins = getCollection(Admin);
