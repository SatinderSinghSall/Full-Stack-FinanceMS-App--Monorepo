require("dotenv").config({
  path: ".env.development",
});

const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const Admin = require("./models/Admin.model");

const createAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Admin.create({
      name: "Satinder Singh Sall",
      email,
      password: hashedPassword,
      role: "superadmin",
    });

    console.log("Admin created successfully.");

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();
