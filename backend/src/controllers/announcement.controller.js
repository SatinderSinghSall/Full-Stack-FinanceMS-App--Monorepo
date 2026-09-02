const Announcement = require("../models/Announcement.model");

/**
 * GET /api/admin/announcements
 *
 * Get all announcements for the admin panel.
 */
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Get announcements error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve announcements",
    });
  }
};

/**
 * GET /api/admin/announcements/:id
 *
 * Get a single announcement.
 */
const getAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id).lean();

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error("Get announcement error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve announcement",
    });
  }
};

/**
 * POST /api/admin/announcements
 *
 * Create a new announcement.
 */
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, type, isActive, startDate, endDate, action } =
      req.body;

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

    // Message validation
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 1000 characters",
      });
    }

    // Type validation
    const allowedTypes = ["info", "success", "warning", "feature"];

    const announcementType = type || "info";

    if (!allowedTypes.includes(announcementType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement type",
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

        validatedAction = {
          enabled: true,
          label: action.label.trim(),
          route: action.route.trim(),
        };
      }
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      type: announcementType,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      action: validatedAction,
    });

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("Create announcement error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create announcement",
    });
  }
};

/**
 * PUT /api/admin/announcements/:id
 *
 * Update an existing announcement.
 */
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    const { title, message, type, isActive, startDate, endDate, action } =
      req.body;

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

      announcement.title = title.trim();
    }

    // Message
    if (message !== undefined) {
      if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: "Message cannot be empty",
        });
      }

      if (message.trim().length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Message cannot exceed 1000 characters",
        });
      }

      announcement.message = message.trim();
    }

    // Type
    if (type !== undefined) {
      const allowedTypes = ["info", "success", "warning", "feature"];

      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid announcement type",
        });
      }

      announcement.type = type;
    }

    // Active status
    if (isActive !== undefined) {
      announcement.isActive = Boolean(isActive);
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

      announcement.startDate = parsedStartDate;
    }

    // End date
    if (endDate !== undefined) {
      if (endDate === null || endDate === "") {
        announcement.endDate = null;
      } else {
        const parsedEndDate = new Date(endDate);

        if (Number.isNaN(parsedEndDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid end date",
          });
        }

        announcement.endDate = parsedEndDate;
      }
    }

    // Date relationship validation
    if (
      announcement.endDate &&
      announcement.endDate <= announcement.startDate
    ) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Action
    if (action !== undefined) {
      if (action === null) {
        announcement.action = {
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
          announcement.action = {
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

          announcement.action = {
            enabled: true,
            label: action.label.trim(),
            route: action.route.trim(),
          };
        }
      }
    }

    await announcement.save();

    return res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      data: announcement,
    });
  } catch (error) {
    console.error("Update announcement error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update announcement",
    });
  }
};

/**
 * DELETE /api/admin/announcements/:id
 *
 * Delete an announcement.
 */
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id)
      .select("_id title")
      .lean();

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    await Announcement.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
      data: {
        id: announcement._id,
      },
    });
  } catch (error) {
    console.error("Delete announcement error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete announcement",
    });
  }
};

/**
 * GET /api/app/announcements
 *
 * Get announcements currently visible to mobile users.
 */
const getActiveAnnouncements = async (req, res) => {
  try {
    const now = new Date();

    const announcements = await Announcement.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [{ endDate: null }, { endDate: { $gt: now } }],
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Get active announcements error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve announcements",
    });
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements,
};
