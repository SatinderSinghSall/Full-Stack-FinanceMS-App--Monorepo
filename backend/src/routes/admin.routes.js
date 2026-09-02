const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin.controller");
const adminDataController = require("../controllers/adminData.controller");
const adminAuth = require("../middlewares/admin.middleware");
const appConfigController = require("../controllers/adminAppConfig.controller");
const announcementController = require("../controllers/announcement.controller");

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

router.get("/feedbacks", adminDataController.feedbacks);
router.get("/feedbacks/:id", adminDataController.getFeedback);
router.put("/feedbacks/:id", adminDataController.updateFeedback);
router.delete("/feedbacks/:id", adminDataController.deleteFeedback);

router.get("/admins", adminDataController.admins);
router.get("/admins/:id", adminDataController.getAdmin);
router.put("/admins/:id", adminDataController.updateAdmin);
router.delete("/admins/:id", adminDataController.deleteAdmin);

// App Configuration
router.get("/app-config", appConfigController.getAppConfig);
router.get("/appconfigs/:id", adminDataController.getAppConfig);
router.put("/app-config", appConfigController.updateAppConfig);

router.get("/appconfigs", adminDataController.appConfigs);

// Announcements
router.get("/announcements", announcementController.getAnnouncements);
router.get("/announcements/:id", announcementController.getAnnouncement);
router.post("/announcements", announcementController.createAnnouncement);
router.put("/announcements/:id", announcementController.updateAnnouncement);
router.delete("/announcements/:id", announcementController.deleteAnnouncement);

module.exports = router;
