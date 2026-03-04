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

app.get("/", (req, res) => {
  res.status(200).json({
    message: "FinTrack API is running 🚀",
    status: "OK",
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    timestamp: new Date(),
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    timestamp: new Date(),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  ),
);
