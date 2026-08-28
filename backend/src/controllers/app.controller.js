const AppConfig = require("../models/AppConfig.model");

const getAppVersion = async (req, res) => {
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

    return res.json({
      success: true,
      latestVersion: config.latestVersion,
      minSupportedVersion: config.minSupportedVersion,
      forceUpdate: config.forceUpdate,
      playStoreUrl: config.playStoreUrl,
      updateMessage: config.updateMessage,
    });
  } catch (error) {
    console.error("Get app version error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve app configuration",
    });
  }
};

module.exports = {
  getAppVersion,
};
