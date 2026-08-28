const AppConfig = require("../models/AppConfig.model");

/**
 * Get current app configuration
 * GET /api/admin/app-config
 */
const getAppConfig = async (req, res) => {
  try {
    const config = await AppConfig.findOne({
      platform: "android",
    }).lean();

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "App configuration not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Get app config error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve app configuration",
    });
  }
};

/**
 * Update app configuration
 * PUT /api/admin/app-config
 */
const updateAppConfig = async (req, res) => {
  try {
    const {
      latestVersion,
      minSupportedVersion,
      forceUpdate,
      playStoreUrl,
      updateMessage,
    } = req.body;

    // Required fields
    if (!latestVersion || !minSupportedVersion || !playStoreUrl) {
      return res.status(400).json({
        success: false,
        message:
          "Latest version, minimum supported version, and Play Store URL are required",
      });
    }

    // Basic semantic version validation
    const versionRegex = /^\d+\.\d+\.\d+$/;

    if (
      !versionRegex.test(latestVersion) ||
      !versionRegex.test(minSupportedVersion)
    ) {
      return res.status(400).json({
        success: false,
        message: "Versions must use the format X.Y.Z, for example 3.2.0",
      });
    }

    // Compare versions
    const compareVersions = (a, b) => {
      const aParts = a.split(".").map(Number);
      const bParts = b.split(".").map(Number);

      for (let i = 0; i < 3; i++) {
        if (aParts[i] > bParts[i]) return 1;
        if (aParts[i] < bParts[i]) return -1;
      }

      return 0;
    };

    // Minimum supported version cannot be greater than latest version
    if (compareVersions(minSupportedVersion, latestVersion) > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum supported version cannot be greater than latest version",
      });
    }

    // Basic Play Store URL validation
    try {
      const url = new URL(playStoreUrl);

      if (
        url.protocol !== "https:" ||
        !url.hostname.includes("play.google.com")
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid Google Play Store URL",
        });
      }
    } catch {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid Play Store URL",
      });
    }

    const config = await AppConfig.findOneAndUpdate(
      {
        platform: "android",
      },
      {
        $set: {
          latestVersion,
          minSupportedVersion,
          forceUpdate: Boolean(forceUpdate),
          playStoreUrl,
          ...(updateMessage !== undefined ? { updateMessage } : {}),
        },
        $setOnInsert: {
          platform: "android",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    ).lean();

    return res.status(200).json({
      success: true,
      message: "App configuration updated successfully",
      data: config,
    });
  } catch (error) {
    console.error("Update app config error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update app configuration",
    });
  }
};

module.exports = {
  getAppConfig,
  updateAppConfig,
};
