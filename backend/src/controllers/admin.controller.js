const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin.model");
const User = require("../models/User.model");
const Budget = require("../models/Budget.model");
const Expense = require("../models/Expense.model");
const Income = require("../models/Income.model");
const Saving = require("../models/Saving.model");
const Subscription = require("../models/Subscription.model");
const Feedback = require("../models/Feedback.model");
const AppConfig = require("../models/AppConfig.model");
const Announcement = require("../models/Announcement.model");
const FinancialTip = require("../models/FinancialTip.model");
const Maintenance = require("../models/Maintenance.model");
const EmailCampaign = require("../models/EmailCampaign.model");
const EmailCampaignRecipient = require("../models/EmailCampaignRecipient.model");

/* ============================================================================
   HELPERS
============================================================================ */

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

const getPeriodConfig = (period) => {
  const now = new Date();

  switch (period) {
    case "7d":
      return {
        period: "7d",
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        bucket: "day",
      };

    case "90d":
      return {
        period: "90d",
        startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        bucket: "week",
      };

    case "6m":
      return {
        period: "6m",
        startDate: new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000),
        bucket: "month",
      };

    case "1y":
      return {
        period: "1y",
        startDate: new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000),
        bucket: "month",
      };

    case "30d":
    default:
      return {
        period: "30d",
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        bucket: "day",
      };
  }
};

const getDateGroupExpression = (field, bucket) => {
  if (bucket === "month") {
    return {
      $dateToString: {
        format: "%Y-%m",
        date: `$${field}`,
      },
    };
  }

  if (bucket === "week") {
    return {
      $dateToString: {
        format: "%Y-%m-%d",
        date: {
          $dateTrunc: {
            date: `$${field}`,
            unit: "week",
          },
        },
      },
    };
  }

  return {
    $dateToString: {
      format: "%Y-%m-%d",
      date: `$${field}`,
    },
  };
};

const formatTrendLabel = (value, bucket) => {
  if (!value) return "";

  if (bucket === "month") {
    const [year, month] = value.split("-");

    const date = new Date(Number(year), Number(month) - 1, 1);

    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
    });
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

/* ============================================================================
   AUTHENTICATION
============================================================================ */

/**
 * POST /api/admin/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const admin = await Admin.findOne({
      email: normalizedEmail,
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

    return res.json({
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
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Admin login failed",
    });
  }
};

/**
 * GET /api/admin/auth/me
 */
exports.me = async (req, res) => {
  return res.json({
    success: true,
    admin: req.admin,
  });
};

/* ============================================================================
   DASHBOARD
============================================================================ */

/**
 * GET /api/admin/dashboard
 *
 * Supported periods:
 *   ?period=7d
 *   ?period=30d
 *   ?period=90d
 *   ?period=6m
 *   ?period=1y
 *
 * Returns:
 *   overview
 *   financial
 *   expenseByCategory
 *   recentExpenses
 *   recentIncome
 *   recentFeedback
 *   trends
 *   recentActivity
 *   alerts
 *   systemHealth
 *   subscriptionMetrics
 *   app
 */
exports.dashboard = async (req, res) => {
  try {
    const { period, startDate, bucket } = getPeriodConfig(req.query.period);

    /*
     * ================================================================
     * BASIC OVERVIEW
     * ================================================================
     */

    const [
      admins,
      users,
      budgets,
      expenses,
      incomes,
      savings,
      subscriptions,
      feedbacks,
      appConfigs,
      announcements,
      financialTips,
      maintenance,
      emailCampaigns,
      emailCampaignRecipients,

      /*
       * Financial totals
       */
      incomeTotals,
      expenseTotals,
      savingsTotals,

      /*
       * Expense category analytics
       */
      expenseByCategory,

      /*
       * Recent records
       */
      recentExpenses,
      recentIncome,
      recentFeedback,

      /*
       * Period-specific trend data
       */
      adminTrends,
      userTrends,
      budgetTrends,
      expenseTrends,
      incomeTrends,
      savingTrends,
      subscriptionTrends,
      feedbackTrends,
      appConfigTrends,
      announcementTrends,
      financialTipTrends,
      maintenanceTrends,
      emailCampaignTrends,
      emailCampaignRecipientTrends,

      /*
       * Subscription analytics
       */
      activeSubscriptions,
      cancelledSubscriptions,
      expiredSubscriptions,
      autoRenewSubscriptions,
      subscriptionAmount,

      /*
       * Alerts
       */
      pendingFeedback,
      highPriorityFeedback,
      failedEmailRecipients,

      /*
       * Maintenance
       */
      activeMaintenance,

      /*
       * App configuration
       */
      appConfigsData,

      /*
       * Email campaigns
       */
      failedCampaigns,
    ] = await Promise.all([
      /* Overview ---------------------------------------------------- */

      Admin.countDocuments(),

      User.countDocuments(),

      Budget.countDocuments(),

      Expense.countDocuments(),

      Income.countDocuments(),

      Saving.countDocuments(),

      Subscription.countDocuments(),

      Feedback.countDocuments(),

      AppConfig.countDocuments(),

      Announcement.countDocuments(),

      FinancialTip.countDocuments(),

      Maintenance.countDocuments(),

      EmailCampaign.countDocuments(),

      EmailCampaignRecipient.countDocuments(),

      /* Financial totals -------------------------------------------- */

      Income.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $ifNull: ["$amount", 0],
              },
            },
          },
        },
      ]),

      Expense.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $ifNull: ["$amount", 0],
              },
            },
          },
        },
      ]),

      Saving.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $ifNull: ["$amount", 0],
              },
            },
          },
        },
      ]),

      /* Expense categories ------------------------------------------ */

      Expense.aggregate([
        {
          $group: {
            _id: {
              $ifNull: ["$category", "Other"],
            },
            amount: {
              $sum: {
                $ifNull: ["$amount", 0],
              },
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

      /* Recent records ---------------------------------------------- */

      Expense.find({})
        .sort({
          date: -1,
          createdAt: -1,
        })
        .limit(7)
        .lean(),

      Income.find({})
        .sort({
          date: -1,
          createdAt: -1,
        })
        .limit(7)
        .lean(),

      Feedback.find({})
        .populate("user", "name email")
        .sort({
          createdAt: -1,
        })
        .limit(7)
        .lean(),

      /* Trends ------------------------------------------------------ */

      Admin.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: getDateGroupExpression("createdAt", bucket),
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: getDateGroupExpression("createdAt", bucket),
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      Budget.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: getDateGroupExpression("createdAt", bucket),
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      Expense.aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: getDateGroupExpression("date", bucket),
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      Income.aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: getDateGroupExpression("date", bucket),
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      Saving.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: getDateGroupExpression("createdAt", bucket),
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      Subscription.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: getDateGroupExpression("createdAt", bucket),
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      Feedback.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: getDateGroupExpression("createdAt", bucket),
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      AppConfig.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: getDateGroupExpression("createdAt", bucket),
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      Announcement.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: getDateGroupExpression("createdAt", bucket),
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      FinancialTip.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: getDateGroupExpression("createdAt", bucket),
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      Maintenance.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: getDateGroupExpression("createdAt", bucket),
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      EmailCampaign.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: getDateGroupExpression("createdAt", bucket),
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      EmailCampaignRecipient.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
            },
          },
        },
        {
          $group: {
            _id: getDateGroupExpression("createdAt", bucket),
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      /* Subscription analytics ------------------------------------- */

      Subscription.countDocuments({
        status: "active",
      }),

      Subscription.countDocuments({
        status: "cancelled",
      }),

      /*
       * Your schema only has active/cancelled.
       *
       * An "expired" subscription here means:
       * status is still active, but nextRenewalDate is in the past.
       *
       * This is derived operationally; it does NOT modify the record.
       */
      Subscription.countDocuments({
        status: "active",
        nextRenewalDate: {
          $lt: new Date(),
        },
      }),

      Subscription.countDocuments({
        status: "active",
        autoRenew: true,
      }),

      Subscription.aggregate([
        {
          $match: {
            status: "active",
          },
        },
        {
          $group: {
            _id: null,
            amount: {
              $sum: {
                $ifNull: ["$amount", 0],
              },
            },
          },
        },
      ]),

      /* Alerts ------------------------------------------------------ */

      Feedback.countDocuments({
        status: "Pending",
      }),

      Feedback.countDocuments({
        priority: "High",
        status: {
          $ne: "Resolved",
        },
      }),

      EmailCampaignRecipient.countDocuments({
        status: "failed",
      }),

      /* Maintenance ------------------------------------------------- */

      Maintenance.findOne({
        enabled: true,
      })
        .sort({
          startDate: -1,
          createdAt: -1,
        })
        .lean(),

      /* App configuration ------------------------------------------- */

      AppConfig.find({})
        .sort({
          platform: 1,
        })
        .lean(),

      /* Failed email campaigns -------------------------------------- */

      EmailCampaign.find({
        failedCount: {
          $gt: 0,
        },
      })
        .sort({
          updatedAt: -1,
        })
        .limit(5)
        .lean(),
    ]);

    /* =========================================================================
       FINANCIAL CALCULATIONS
    ========================================================================= */

    const totalIncome = safeNumber(incomeTotals[0]?.total);

    const totalExpenses = safeNumber(expenseTotals[0]?.total);

    const totalSavings = safeNumber(savingsTotals[0]?.total);

    const balance = totalIncome - totalExpenses;

    /* =========================================================================
       TREND MERGING
    ========================================================================= */

    const trendMap = new Map();

    const ensureTrend = (key) => {
      if (!trendMap.has(key)) {
        trendMap.set(key, {
          raw: key,
          label: formatTrendLabel(key, bucket),

          admins: 0,
          users: 0,
          budgets: 0,
          expenses: 0,
          incomes: 0,
          savings: 0,
          subscriptions: 0,
          feedbacks: 0,
          appConfigs: 0,
          announcements: 0,
          financialTips: 0,
          maintenance: 0,
          emailCampaigns: 0,
          emailCampaignRecipients: 0,
        });
      }

      return trendMap.get(key);
    };

    adminTrends.forEach((item) => {
      ensureTrend(item._id).admins = safeNumber(item.count);
    });

    userTrends.forEach((item) => {
      ensureTrend(item._id).users = safeNumber(item.count);
    });

    budgetTrends.forEach((item) => {
      ensureTrend(item._id).budgets = safeNumber(item.count);
    });

    expenseTrends.forEach((item) => {
      ensureTrend(item._id).expenses = safeNumber(item.count);
    });

    incomeTrends.forEach((item) => {
      ensureTrend(item._id).incomes = safeNumber(item.count);
    });

    savingTrends.forEach((item) => {
      ensureTrend(item._id).savings = safeNumber(item.count);
    });

    subscriptionTrends.forEach((item) => {
      ensureTrend(item._id).subscriptions = safeNumber(item.count);
    });

    feedbackTrends.forEach((item) => {
      ensureTrend(item._id).feedbacks = safeNumber(item.count);
    });

    appConfigTrends.forEach((item) => {
      ensureTrend(item._id).appConfigs = safeNumber(item.count);
    });

    announcementTrends.forEach((item) => {
      ensureTrend(item._id).announcements = safeNumber(item.count);
    });

    financialTipTrends.forEach((item) => {
      ensureTrend(item._id).financialTips = safeNumber(item.count);
    });

    maintenanceTrends.forEach((item) => {
      ensureTrend(item._id).maintenance = safeNumber(item.count);
    });

    emailCampaignTrends.forEach((item) => {
      ensureTrend(item._id).emailCampaigns = safeNumber(item.count);
    });

    emailCampaignRecipientTrends.forEach((item) => {
      ensureTrend(item._id).emailCampaignRecipients = safeNumber(item.count);
    });

    const trends = Array.from(trendMap.values())
      .sort((a, b) => a.raw.localeCompare(b.raw))
      .map(({ raw, ...item }) => item);

    /* =========================================================================
       RECENT ACTIVITY
    ========================================================================= */

    const [
      recentUsers,
      recentSubscriptions,
      recentAnnouncements,
      recentMaintenance,
      recentCampaigns,
    ] = await Promise.all([
      User.find({})
        .select("_id name email createdAt")
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean(),

      Subscription.find({})
        .select("_id name amount currency status createdAt")
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean(),

      Announcement.find({})
        .select("_id title type createdAt")
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean(),

      Maintenance.find({})
        .select("_id title enabled startDate endDate createdAt")
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean(),

      EmailCampaign.find({})
        .select("_id name status sentCount failedCount createdAt")
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean(),
    ]);

    const recentActivity = [
      ...recentUsers.map((user) => ({
        id: `user-${user._id}`,
        type: "user",
        title: "New user registered",
        description: user.name || user.email || "New user",
        date: user.createdAt,
        href: `/users/${user._id}`,
      })),

      ...recentExpenses.map((expense) => ({
        id: `expense-${expense._id}`,
        type: "expense",
        title: expense.title || "New expense",
        description: expense.category || "Other",
        date: expense.date || expense.createdAt,
        amount: safeNumber(expense.amount),
        href: `/expenses/${expense._id}`,
      })),

      ...recentIncome.map((income) => ({
        id: `income-${income._id}`,
        type: "income",
        title: income.source || "New income",
        description: "Income record",
        date: income.date || income.createdAt,
        amount: safeNumber(income.amount),
        href: `/incomes/${income._id}`,
      })),

      ...recentSubscriptions.map((subscription) => ({
        id: `subscription-${subscription._id}`,
        type: "subscription",
        title: subscription.name || "Subscription",
        description: subscription.status || "Subscription record",
        date: subscription.createdAt,
        amount: safeNumber(subscription.amount),
        href: `/subscriptions/${subscription._id}`,
      })),

      ...recentFeedback.map((feedback) => ({
        id: `feedback-${feedback._id}`,
        type: "feedback",
        title: feedback.subject || "New feedback",
        description: feedback.status || "Feedback",
        date: feedback.createdAt,
        href: `/feedbacks/${feedback._id}`,
      })),

      ...recentAnnouncements.map((announcement) => ({
        id: `announcement-${announcement._id}`,
        type: "announcement",
        title: announcement.title || "Announcement",
        description: announcement.type || "Announcement created",
        date: announcement.createdAt,
        href: `/announcements/${announcement._id}`,
      })),

      ...recentMaintenance.map((item) => ({
        id: `maintenance-${item._id}`,
        type: "maintenance",
        title: item.title || "Maintenance configuration",
        description: item.enabled
          ? "Maintenance enabled"
          : "Maintenance disabled",
        date: item.createdAt,
        href: "/maintenance",
      })),

      ...recentCampaigns.map((campaign) => ({
        id: `email-${campaign._id}`,
        type: "email",
        title: campaign.name || "Email campaign",
        description: campaign.status || "Campaign",
        date: campaign.createdAt,
        href: `/email-campaigns/${campaign._id}`,
      })),
    ]
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 12);

    /* =========================================================================
       ALERTS
    ========================================================================= */

    const alerts = [];

    if (activeMaintenance) {
      alerts.push({
        id: `maintenance-${activeMaintenance._id}`,
        type: "warning",
        title: "Maintenance mode is enabled",
        description:
          activeMaintenance.title ||
          activeMaintenance.message ||
          "The platform is currently in maintenance mode.",
        href: "/maintenance",
      });
    }

    if (highPriorityFeedback > 0) {
      alerts.push({
        id: "high-priority-feedback",
        type: "error",
        title: "High-priority feedback needs attention",
        description: `${highPriorityFeedback} high-priority feedback record(s) are unresolved.`,
        href: "/feedbacks",
      });
    } else if (pendingFeedback > 0) {
      alerts.push({
        id: "pending-feedback",
        type: "info",
        title: "Feedback requires review",
        description: `${pendingFeedback} pending feedback record(s) are waiting for review.`,
        href: "/feedbacks",
      });
    }

    if (failedEmailRecipients > 0) {
      alerts.push({
        id: "failed-email-recipients",
        type: "error",
        title: "Email delivery failures detected",
        description: `${failedEmailRecipients} email recipient(s) have failed delivery.`,
        href: "/email-campaigns",
      });
    }

    if (failedCampaigns.length > 0) {
      alerts.push({
        id: "failed-campaigns",
        type: "warning",
        title: "Email campaigns have failures",
        description: `${failedCampaigns.length} campaign(s) contain failed deliveries.`,
        href: "/email-campaigns",
      });
    }

    /*
     * Force-update alert
     */
    const forceUpdateConfig = appConfigsData.find(
      (config) => config.forceUpdate === true,
    );

    if (forceUpdateConfig) {
      alerts.push({
        id: `force-update-${forceUpdateConfig._id}`,
        type: "warning",
        title: `${forceUpdateConfig.platform} force update is enabled`,
        description: `Minimum supported version is ${forceUpdateConfig.minSupportedVersion || "not specified"}.`,
        href: "/app-version",
      });
    }

    /* =========================================================================
       APP RELEASE STATUS
    ========================================================================= */

    const appConfigsByPlatform = appConfigsData.reduce((result, config) => {
      result[config.platform] = config;
      return result;
    }, {});

    /*
     * Your current frontend expects a single app object.
     *
     * If Android and iOS differ, Android is used as the primary
     * display configuration, with iOS as fallback.
     */
    const primaryAppConfig =
      appConfigsByPlatform.android ||
      appConfigsByPlatform.ios ||
      appConfigsData[0];

    const app = primaryAppConfig
      ? {
          currentVersion: primaryAppConfig.latestVersion,
          minimumVersion: primaryAppConfig.minSupportedVersion,
          platform: primaryAppConfig.platform,
          releaseDate: primaryAppConfig.updatedAt,
        }
      : undefined;

    /* =========================================================================
       SUBSCRIPTION ANALYTICS
    ========================================================================= */

    const activeSubscriptionCount = safeNumber(activeSubscriptions);

    const cancelledSubscriptionCount = safeNumber(cancelledSubscriptions);

    const expiredSubscriptionCount = safeNumber(expiredSubscriptions);

    const autoRenewSubscriptionCount = safeNumber(autoRenewSubscriptions);

    /*
     * This is NOT payment-provider revenue.
     *
     * It is the sum of the configured amounts of active subscriptions.
     * We expose it for the existing dashboard UI, but it should be
     * treated as subscription value rather than actual collected revenue.
     */
    const subscriptionRevenue = safeNumber(subscriptionAmount[0]?.amount);

    /*
     * Churn approximation:
     *
     * cancelled / (active + cancelled)
     *
     * This is a simple record-based ratio, not a true cohort churn metric.
     */
    const subscriptionBase =
      activeSubscriptionCount + cancelledSubscriptionCount;

    const churn =
      subscriptionBase > 0
        ? (cancelledSubscriptionCount / subscriptionBase) * 100
        : 0;

    const subscriptionMetrics = {
      active: activeSubscriptionCount,
      /*
       * Your schema does not have trial subscriptions.
       * We intentionally do not manufacture them.
       */
      expired: expiredSubscriptionCount,
      cancelled: cancelledSubscriptionCount,
      revenue: subscriptionRevenue,
      churn: Number(churn.toFixed(1)),
      autoRenew: autoRenewSubscriptionCount,
    };

    /* =========================================================================
       SYSTEM HEALTH
    ========================================================================= */

    /*
     * The fact that this controller reached this point means:
     *
     * - API request is working
     * - MongoDB queries succeeded
     *
     * We do NOT claim email-provider health because the email provider
     * is not available in the models/controllers provided so far.
     */
    const systemHealth = {
      api: "operational",
      database: "operational",
    };

    /* =========================================================================
       RESPONSE
    ========================================================================= */

    return res.json({
      success: true,

      data: {
        overview: {
          admins,
          users,
          budgets,
          expenses,
          incomes,
          savings,
          subscriptions,
          feedbacks,
          appConfigs,
          announcements,
          financialTips,
          maintenance,
          emailCampaigns,
          emailCampaignRecipients,
        },

        financial: {
          totalIncome,
          totalExpenses,
          totalSavings,
          balance,
        },

        expenseByCategory,

        recentExpenses,

        recentIncome,

        recentFeedback,

        /*
         * New production dashboard data
         */
        trends,

        recentActivity,

        alerts: alerts.slice(0, 6),

        systemHealth,

        subscriptionMetrics,

        app,

        /*
         * Useful metadata for debugging/frontend visibility.
         */
        period,
        periodStart: startDate,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
    });
  }
};
