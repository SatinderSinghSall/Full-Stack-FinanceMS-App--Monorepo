const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin.controller");
const adminDataController = require("../controllers/adminData.controller");
const adminAuth = require("../middlewares/admin.middleware");

// Authentication
router.post("/auth/login", adminController.login);

// Protected routes
router.use(adminAuth);

router.get("/auth/me", adminController.me);

router.get("/dashboard", adminController.dashboard);

// Collections
router.get("/users", adminDataController.users);
router.get("/users/:id", adminDataController.getUser);
router.put("/users/:id", adminDataController.updateUser);
router.delete("/users/:id", adminDataController.deleteUser);

router.get("/budgets", adminDataController.budgets);
router.get("/budgets/:id", adminDataController.getBudget);
router.put("/budgets/:id", adminDataController.updateBudget);
router.delete("/budgets/:id", adminDataController.deleteBudget);

router.get("/expenses", adminDataController.expenses);
router.get("/expenses/:id", adminDataController.getExpense);
router.put("/expenses/:id", adminDataController.updateExpense);
router.delete("/expenses/:id", adminDataController.deleteExpense);

router.get("/incomes", adminDataController.incomes);
router.get("/incomes/:id", adminDataController.getIncome);
router.put("/incomes/:id", adminDataController.updateIncome);
router.delete("/incomes/:id", adminDataController.deleteIncome);

router.get("/savings", adminDataController.savings);
router.get("/savings/:id", adminDataController.getSaving);
router.put("/savings/:id", adminDataController.updateSaving);
router.delete("/savings/:id", adminDataController.deleteSaving);

router.get("/subscriptions", adminDataController.subscriptions);
router.get("/subscriptions/:id", adminDataController.getSubscription);
router.put("/subscriptions/:id", adminDataController.updateSubscription);
router.delete("/subscriptions/:id", adminDataController.deleteSubscription);

module.exports = router;
