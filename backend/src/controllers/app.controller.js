const APP_CONFIG = require("../config/appConfig");

const getAppVersion = (req, res) => {
  res.json(APP_CONFIG.android);
};

module.exports = {
  getAppVersion,
};
