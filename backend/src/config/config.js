const { config: conf } = require("dotenv");

const env = process.env.NODE_ENV || "development";

conf({
  path: `.env.${env}`,
});

const _config = {
  emailUsername: process.env.NODEMAILER_EMAIL,
  emailPassword: process.env.NODEMAILER_PASSWORD,
};

const config = Object.freeze(_config);

module.exports = { config };
