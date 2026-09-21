const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const secret = req.headers["x-email-service-secret"];

  if (secret !== process.env.EMAIL_SERVICE_SECRET) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const { to, subject, text, html } = req.body;

    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        success: false,
        message: "Missing email data",
      });
    }

    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `"FinTrack" <${process.env.NODEMAILER_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent:", info.messageId);

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Email sending failed:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
