const FinancialTip = require("../models/FinancialTip.model");

/**
 * GET /api/admin/financial-tips
 *
 * Get all financial tips for the admin panel.
 */
const getFinancialTips = async (req, res) => {
  try {
    const financialTips = await FinancialTip.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: financialTips,
    });
  } catch (error) {
    console.error("Get financial tips error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve financial tips",
    });
  }
};

/**
 * GET /api/admin/financial-tips/:id
 *
 * Get a single financial tip.
 */
const getFinancialTip = async (req, res) => {
  try {
    const { id } = req.params;

    const financialTip = await FinancialTip.findById(id).lean();

    if (!financialTip) {
      return res.status(404).json({
        success: false,
        message: "Financial tip not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: financialTip,
    });
  } catch (error) {
    console.error("Get financial tip error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve financial tip",
    });
  }
};

/**
 * POST /api/admin/financial-tips
 *
 * Create a new financial tip.
 */
const createFinancialTip = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      content,
      category,
      type,
      isActive,
      featured,
      startDate,
      endDate,
      action,
    } = req.body;

    // Title validation
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (title.trim().length > 120) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 120 characters",
      });
    }

    // Short description validation
    if (typeof shortDescription !== "string" || !shortDescription.trim()) {
      return res.status(400).json({
        success: false,
        message: "Short description is required",
      });
    }

    if (shortDescription.trim().length > 300) {
      return res.status(400).json({
        success: false,
        message: "Short description cannot exceed 300 characters",
      });
    }

    // Content validation
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    if (content.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Content cannot exceed 5000 characters",
      });
    }

    // Category validation
    const allowedCategories = [
      "budgeting",
      "saving",
      "expenses",
      "debt",
      "investing",
      "financial-safety",
      "money-habits",
      "goals",
    ];

    const financialTipCategory = category || "money-habits";

    if (!allowedCategories.includes(financialTipCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid financial tip category",
      });
    }

    // Type validation
    const allowedTypes = ["tip", "guide", "lesson", "warning"];

    const financialTipType = type || "tip";

    if (!allowedTypes.includes(financialTipType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid financial tip type",
      });
    }

    // Start date validation
    let parsedStartDate = new Date();

    if (startDate !== undefined && startDate !== null && startDate !== "") {
      parsedStartDate = new Date(startDate);

      if (Number.isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date",
        });
      }
    }

    // End date validation
    let parsedEndDate = null;

    if (endDate !== undefined && endDate !== null && endDate !== "") {
      parsedEndDate = new Date(endDate);

      if (Number.isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid end date",
        });
      }

      if (parsedEndDate <= parsedStartDate) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date",
        });
      }
    }

    // Action validation
    let validatedAction = {
      enabled: false,
    };

    if (action !== undefined && action !== null) {
      if (typeof action !== "object" || Array.isArray(action)) {
        return res.status(400).json({
          success: false,
          message: "Action must be an object",
        });
      }

      const actionEnabled = Boolean(action.enabled);

      if (actionEnabled) {
        if (typeof action.label !== "string" || !action.label.trim()) {
          return res.status(400).json({
            success: false,
            message: "Action label is required when action is enabled",
          });
        }

        if (typeof action.route !== "string" || !action.route.trim()) {
          return res.status(400).json({
            success: false,
            message: "Action route is required when action is enabled",
          });
        }

        if (action.label.trim().length > 50) {
          return res.status(400).json({
            success: false,
            message: "Action label cannot exceed 50 characters",
          });
        }

        if (action.route.trim().length > 200) {
          return res.status(400).json({
            success: false,
            message: "Action route cannot exceed 200 characters",
          });
        }

        validatedAction = {
          enabled: true,
          label: action.label.trim(),
          route: action.route.trim(),
        };
      }
    }

    const financialTip = await FinancialTip.create({
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      content: content.trim(),
      category: financialTipCategory,
      type: financialTipType,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      featured: featured !== undefined ? Boolean(featured) : false,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      action: validatedAction,
    });

    return res.status(201).json({
      success: true,
      message: "Financial tip created successfully",
      data: financialTip,
    });
  } catch (error) {
    console.error("Create financial tip error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create financial tip",
    });
  }
};

/**
 * PUT /api/admin/financial-tips/:id
 *
 * Update an existing financial tip.
 */
const updateFinancialTip = async (req, res) => {
  try {
    const { id } = req.params;

    const financialTip = await FinancialTip.findById(id);

    if (!financialTip) {
      return res.status(404).json({
        success: false,
        message: "Financial tip not found",
      });
    }

    const {
      title,
      shortDescription,
      content,
      category,
      type,
      isActive,
      featured,
      startDate,
      endDate,
      action,
    } = req.body;

    // Title
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      if (title.trim().length > 120) {
        return res.status(400).json({
          success: false,
          message: "Title cannot exceed 120 characters",
        });
      }

      financialTip.title = title.trim();
    }

    // Short description
    if (shortDescription !== undefined) {
      if (typeof shortDescription !== "string" || !shortDescription.trim()) {
        return res.status(400).json({
          success: false,
          message: "Short description cannot be empty",
        });
      }

      if (shortDescription.trim().length > 300) {
        return res.status(400).json({
          success: false,
          message: "Short description cannot exceed 300 characters",
        });
      }

      financialTip.shortDescription = shortDescription.trim();
    }

    // Content
    if (content !== undefined) {
      if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Content cannot be empty",
        });
      }

      if (content.trim().length > 5000) {
        return res.status(400).json({
          success: false,
          message: "Content cannot exceed 5000 characters",
        });
      }

      financialTip.content = content.trim();
    }

    // Category
    if (category !== undefined) {
      const allowedCategories = [
        "budgeting",
        "saving",
        "expenses",
        "debt",
        "investing",
        "financial-safety",
        "money-habits",
        "goals",
      ];

      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid financial tip category",
        });
      }

      financialTip.category = category;
    }

    // Type
    if (type !== undefined) {
      const allowedTypes = ["tip", "guide", "lesson", "warning"];

      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid financial tip type",
        });
      }

      financialTip.type = type;
    }

    // Active status
    if (isActive !== undefined) {
      financialTip.isActive = Boolean(isActive);
    }

    // Featured status
    if (featured !== undefined) {
      financialTip.featured = Boolean(featured);
    }

    // Start date
    if (startDate !== undefined) {
      if (startDate === null || startDate === "") {
        return res.status(400).json({
          success: false,
          message: "Start date cannot be empty",
        });
      }

      const parsedStartDate = new Date(startDate);

      if (Number.isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date",
        });
      }

      financialTip.startDate = parsedStartDate;
    }

    // End date
    if (endDate !== undefined) {
      if (endDate === null || endDate === "") {
        financialTip.endDate = null;
      } else {
        const parsedEndDate = new Date(endDate);

        if (Number.isNaN(parsedEndDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid end date",
          });
        }

        financialTip.endDate = parsedEndDate;
      }
    }

    // Date relationship validation
    if (
      financialTip.endDate &&
      financialTip.endDate <= financialTip.startDate
    ) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Action
    if (action !== undefined) {
      if (action === null) {
        financialTip.action = {
          enabled: false,
        };
      } else {
        if (typeof action !== "object" || Array.isArray(action)) {
          return res.status(400).json({
            success: false,
            message: "Action must be an object",
          });
        }

        const actionEnabled = Boolean(action.enabled);

        if (!actionEnabled) {
          financialTip.action = {
            enabled: false,
          };
        } else {
          if (typeof action.label !== "string" || !action.label.trim()) {
            return res.status(400).json({
              success: false,
              message: "Action label is required when action is enabled",
            });
          }

          if (typeof action.route !== "string" || !action.route.trim()) {
            return res.status(400).json({
              success: false,
              message: "Action route is required when action is enabled",
            });
          }

          if (action.label.trim().length > 50) {
            return res.status(400).json({
              success: false,
              message: "Action label cannot exceed 50 characters",
            });
          }

          if (action.route.trim().length > 200) {
            return res.status(400).json({
              success: false,
              message: "Action route cannot exceed 200 characters",
            });
          }

          financialTip.action = {
            enabled: true,
            label: action.label.trim(),
            route: action.route.trim(),
          };
        }
      }
    }

    await financialTip.save();

    return res.status(200).json({
      success: true,
      message: "Financial tip updated successfully",
      data: financialTip,
    });
  } catch (error) {
    console.error("Update financial tip error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update financial tip",
    });
  }
};

/**
 * DELETE /api/admin/financial-tips/:id
 *
 * Delete a financial tip.
 */
const deleteFinancialTip = async (req, res) => {
  try {
    const { id } = req.params;

    const financialTip = await FinancialTip.findById(id)
      .select("_id title")
      .lean();

    if (!financialTip) {
      return res.status(404).json({
        success: false,
        message: "Financial tip not found",
      });
    }

    await FinancialTip.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Financial tip deleted successfully",
      data: {
        id: financialTip._id,
      },
    });
  } catch (error) {
    console.error("Delete financial tip error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete financial tip",
    });
  }
};

/**
 * GET /api/financial-tips
 *
 * Get financial tips currently visible to mobile users.
 */
const getActiveFinancialTips = async (req, res) => {
  try {
    const now = new Date();

    const financialTips = await FinancialTip.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $gt: now } }],
    })
      .sort({
        featured: -1,
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      data: financialTips,
    });
  } catch (error) {
    console.error("Get active financial tips error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve financial tips",
    });
  }
};

module.exports = {
  getFinancialTips,
  getFinancialTip,
  createFinancialTip,
  updateFinancialTip,
  deleteFinancialTip,
  getActiveFinancialTips,
};
