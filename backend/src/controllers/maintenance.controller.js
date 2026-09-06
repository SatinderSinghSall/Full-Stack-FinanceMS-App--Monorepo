const Maintenance = require("../models/Maintenance.model");

const DEFAULT_TITLE = "Maintenance in Progress";

const DEFAULT_MESSAGE =
  "FinTrack is currently undergoing maintenance. We appreciate your patience.";

/**
 * Get or create the single global maintenance configuration.
 */
const getOrCreateMaintenance = async () => {
  let maintenance = await Maintenance.findOne().sort({
    createdAt: 1,
  });

  if (!maintenance) {
    maintenance = await Maintenance.create({
      enabled: false,
      title: DEFAULT_TITLE,
      message: DEFAULT_MESSAGE,
      allowUserAccess: true,
      startDate: new Date(),
      endDate: null,
    });
  }

  return maintenance;
};

/**
 * GET /api/admin/maintenance
 *
 * Get the current maintenance configuration for the admin panel.
 */
const getMaintenance = async (req, res) => {
  try {
    const maintenance = await getOrCreateMaintenance();

    return res.status(200).json({
      success: true,
      data: maintenance,
    });
  } catch (error) {
    console.error("Get maintenance error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve maintenance settings",
    });
  }
};

/**
 * PUT /api/admin/maintenance
 *
 * Update the global maintenance configuration.
 */
const updateMaintenance = async (req, res) => {
  try {
    const { enabled, title, message, allowUserAccess, startDate, endDate } =
      req.body;

    const maintenance = await getOrCreateMaintenance();

    // Enabled
    if (enabled !== undefined) {
      if (typeof enabled !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Enabled must be a boolean",
        });
      }

      maintenance.enabled = enabled;
    }

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

      maintenance.title = title.trim();
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

      maintenance.message = message.trim();
    }

    // User access
    if (allowUserAccess !== undefined) {
      if (typeof allowUserAccess !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Allow user access must be a boolean",
        });
      }

      maintenance.allowUserAccess = allowUserAccess;
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

      maintenance.startDate = parsedStartDate;
    }

    // End date
    if (endDate !== undefined) {
      if (endDate === null || endDate === "") {
        maintenance.endDate = null;
      } else {
        const parsedEndDate = new Date(endDate);

        if (Number.isNaN(parsedEndDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid end date",
          });
        }

        maintenance.endDate = parsedEndDate;
      }
    }

    // Validate date relationship
    if (maintenance.endDate && maintenance.endDate <= maintenance.startDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    await maintenance.save();

    return res.status(200).json({
      success: true,
      message: "Maintenance settings updated successfully",
      data: maintenance,
    });
  } catch (error) {
    console.error("Update maintenance error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update maintenance settings",
    });
  }
};

/**
 * GET /api/maintenance
 *
 * Public/mobile endpoint.
 * Returns the maintenance state currently applicable to users.
 */
const getMaintenanceStatus = async (req, res) => {
  try {
    const maintenance = await Maintenance.findOne().sort({
      createdAt: 1,
    });

    if (!maintenance) {
      return res.status(200).json({
        success: true,
        data: {
          enabled: false,
          title: DEFAULT_TITLE,
          message: DEFAULT_MESSAGE,
          allowUserAccess: true,
          startDate: null,
          endDate: null,
        },
      });
    }

    const now = new Date();

    const isWithinSchedule =
      maintenance.startDate <= now &&
      (!maintenance.endDate || maintenance.endDate > now);

    const isActive = maintenance.enabled && isWithinSchedule;

    return res.status(200).json({
      success: true,
      data: {
        enabled: isActive,
        title: maintenance.title,
        message: maintenance.message,
        allowUserAccess: maintenance.allowUserAccess,
        startDate: maintenance.startDate,
        endDate: maintenance.endDate,
      },
    });
  } catch (error) {
    console.error("Get maintenance status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve maintenance status",
    });
  }
};

module.exports = {
  getMaintenance,
  updateMaintenance,
  getMaintenanceStatus,
};
