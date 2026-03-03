const path = require("path");
const dotenv = require("dotenv");

//! To run the backend for DEVELOPMENT -> npm run dev
//! To run the backend for PRODUCTION -> npm start

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({
  path: path.resolve(__dirname, `../${envFile}`),
});

console.log("ENV FILE:", process.env.NODE_ENV);

const app = require("./app");
const connectDB = require("./config/db");

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running in ${process.env.NODE_ENV} on port ${PORT}`),
);
