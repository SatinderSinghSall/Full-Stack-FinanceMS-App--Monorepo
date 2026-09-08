const crypto = require("crypto");
const mongoose = require("mongoose");

const User = require("../models/User.model");
const EmailCampaign = require("../models/EmailCampaign.model");
const EmailCampaignRecipient = require("../models/EmailCampaignRecipient.model");

const { sendBatchEmails } = require("../services/email.service");

/**
 * ---------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------
 */

const getDailyLimit = () => {
  const limit = Number(process.env.EMAIL_DAILY_LIMIT);

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("EMAIL_DAILY_LIMIT must be a positive integer.");
  }

  return limit;
};

const isValidEmail = (email) => {
  if (!email || typeof email !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

const escapeHtml = (value) => {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Generate a unique campaign ID automatically.
 *
 * Example:
 * fintrack-20260908-a8f42c91
 */
const generateCampaignId = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const random = crypto.randomBytes(4).toString("hex");

  return `fintrack-${date}-${random}`;
};

/**
 * Build the final HTML email.
 *
 * Campaign content comes from the Admin Panel.
 */
const createEmailHtml = ({
  name,
  subject,
  htmlContent,
  buttonText,
  buttonUrl,
}) => {
  const safeName = escapeHtml(name || "there");
  const safeSubject = escapeHtml(subject || "");
  const safeButtonText = escapeHtml(buttonText || "");
  const safeButtonUrl = escapeHtml(buttonUrl || "");

  const buttonHtml =
    buttonText && buttonUrl
      ? `
        <p style="margin: 30px 0;">
          <a
            href="${safeButtonUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #111827;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            "
          >
            ${safeButtonText}
          </a>
        </p>
      `
      : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>${safeSubject}</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background: #f5f7fa;
          font-family: Arial, Helvetica, sans-serif;
          color: #1f2937;
        "
      >
        <div
          style="
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          "
        >
          <div
            style="
              background: #ffffff;
              border-radius: 12px;
              padding: 32px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            "
          >
            <!-- Greeting -->

            <p style="margin-top: 0;">
              Hi ${safeName},
            </p>

            <!-- Campaign Content -->

            <div>
              ${htmlContent}
            </div>

            <!-- Optional CTA -->

            ${buttonHtml}

            <!-- Existing email notice -->

            <p>
              If you've already received this email or completed the
              requested action, please ignore this email.
            </p>

            <p>
              Thank you for using FinTrack! 💙
            </p>

            <p style="margin-bottom: 0;">
              — The FinTrack Team
            </p>

            <!-- Footer Divider -->

            <div
              style="
                height: 1px;
                background: #e5e7eb;
                margin: 28px 0 24px;
              "
            ></div>

            <!-- Contact Support -->

            <div
              style="
                padding: 18px;
                background: #f8fafc;
                border: 1px solid #e5e7eb;
                border-radius: 10px;
              "
            >
              <p
                style="
                  margin: 0 0 8px;
                  font-size: 14px;
                  font-weight: bold;
                  color: #111827;
                "
              >
                Need to reach us?
              </p>

              <p
                style="
                  margin: 0;
                  font-size: 13px;
                  line-height: 1.7;
                  color: #4b5563;
                "
              >
                If you would like to contact us, send us a message
                directly through the FinTrack app.
              </p>

              <p
                style="
                  margin: 10px 0 0;
                  font-size: 13px;
                  line-height: 1.7;
                  color: #4b5563;
                "
              >
                You can reach us from:
              </p>

              <ul
                style="
                  margin: 8px 0 0;
                  padding-left: 20px;
                  font-size: 13px;
                  line-height: 1.8;
                  color: #4b5563;
                "
              >
                <li>
                  <strong>Sidebar</strong> → Support &amp; Feedback
                </li>

                <li>
                  <strong>Profile</strong> → Support &amp; Feedback
                </li>

                <li>
                  <strong>Settings</strong> → Support &amp; Feedback
                </li>
              </ul>

              <p
                style="
                  margin: 12px 0 0;
                  font-size: 13px;
                  line-height: 1.7;
                  color: #4b5563;
                "
              >
                We typically reply within
                <strong>2–5 hours</strong>.
              </p>
            </div>

            <!-- Why you received this email -->

            <p
              style="
                margin: 22px 0 0;
                font-size: 11px;
                line-height: 1.7;
                color: #9ca3af;
                text-align: center;
              "
            >
              You are receiving this email because you are registered
              with the FinTrack app.
            </p>

            <!-- Founder -->

            <div
              style="
                margin-top: 24px;
                padding-top: 22px;
                border-top: 1px solid #f0f0f0;
                text-align: center;
              "
            >
              <p
                style="
                  margin: 0;
                  font-size: 11px;
                  font-weight: bold;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  color: #9ca3af;
                "
              >
                Founder &amp; Curator
              </p>

              <p
                style="
                  margin: 6px 0 0;
                  font-size: 15px;
                  font-weight: bold;
                  color: #111827;
                "
              >
                Satinder Singh Sall
              </p>

              <p
                style="
                  margin: 12px 0 0;
                  font-size: 12px;
                  line-height: 1.7;
                "
              >
                <a
                  href="https://satinder-portfolio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    color: #2563eb;
                    text-decoration: none;
                    font-weight: 600;
                  "
                >
                  Visit Portfolio
                </a>
              </p>

              <p
                style="
                  margin: 5px 0 0;
                  font-size: 12px;
                  line-height: 1.7;
                "
              >
                <a
                  href="https://satinderpoetry.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    color: #2563eb;
                    text-decoration: none;
                    font-weight: 600;
                  "
                >
                  Visit Satinder Poetry
                </a>
              </p>
            </div>

            <!-- Copyright -->

            <p
              style="
                margin: 24px 0 0;
                font-size: 10px;
                line-height: 1.6;
                color: #b0b7c3;
                text-align: center;
              "
            >
              © ${new Date().getFullYear()} FinTrack.
              All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const createEmailText = ({ name, textContent, buttonText, buttonUrl }) => {
  const safeName = name || "there";

  const buttonTextSection =
    buttonText && buttonUrl ? `\n\n${buttonText}\n${buttonUrl}` : "";

  return `Hi ${safeName},

${textContent || ""}${buttonTextSection}

If you've already received this email or completed the requested action, please ignore this email.

Thank you for using FinTrack! 💙

— The FinTrack Team`;
};

/**
 * ---------------------------------------------------------
 * Recipient synchronization
 * ---------------------------------------------------------
 *
 * Make sure every current user has a recipient record
 * for this specific campaign.
 *
 * Existing recipient records are never overwritten.
 */

const syncCampaignRecipients = async (campaignId) => {
  const users = await User.find({
    email: {
      $exists: true,
      $ne: "",
    },
  })
    .select("_id name email")
    .lean();

  if (users.length === 0) {
    return;
  }

  const recipientOperations = users.map((user) => ({
    updateOne: {
      filter: {
        campaign: campaignId,
        user: user._id,
      },

      update: {
        $setOnInsert: {
          campaign: campaignId,
          user: user._id,
          email: user.email,
          status: "pending",
        },
      },

      upsert: true,
    },
  }));

  await EmailCampaignRecipient.bulkWrite(recipientOperations);
};

/**
 * ---------------------------------------------------------
 * Campaign statistics
 * ---------------------------------------------------------
 */

const getCampaignStats = async (campaign) => {
  const dailyLimit = getDailyLimit();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [sentCount, failedCount, pendingCount, sentToday] = await Promise.all([
    EmailCampaignRecipient.countDocuments({
      campaign: campaign._id,
      status: "sent",
    }),

    EmailCampaignRecipient.countDocuments({
      campaign: campaign._id,
      status: "failed",
    }),

    EmailCampaignRecipient.countDocuments({
      campaign: campaign._id,
      status: "pending",
    }),

    EmailCampaignRecipient.countDocuments({
      campaign: campaign._id,
      status: "sent",
      sentAt: {
        $gte: startOfToday,
      },
    }),
  ]);

  const remainingToday = Math.max(dailyLimit - sentToday, 0);

  return {
    _id: campaign._id.toString(),

    campaignId: campaign.campaignId,
    name: campaign.name,
    subject: campaign.subject,

    htmlContent: campaign.htmlContent,
    textContent: campaign.textContent,

    buttonText: campaign.buttonText,
    buttonUrl: campaign.buttonUrl,

    status: campaign.status,

    sentCount,
    failedCount,
    pendingCount,

    dailyLimit,
    sentToday,
    remainingToday,

    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
  };
};

/**
 * ---------------------------------------------------------
 * Synchronize stored campaign counters
 * ---------------------------------------------------------
 */

const syncCampaignCounters = async (campaign) => {
  const [sentCount, failedCount, pendingCount] = await Promise.all([
    EmailCampaignRecipient.countDocuments({
      campaign: campaign._id,
      status: "sent",
    }),

    EmailCampaignRecipient.countDocuments({
      campaign: campaign._id,
      status: "failed",
    }),

    EmailCampaignRecipient.countDocuments({
      campaign: campaign._id,
      status: "pending",
    }),
  ]);

  campaign.sentCount = sentCount;
  campaign.failedCount = failedCount;

  /**
   * A campaign only becomes completed when every recipient
   * has been processed.
   */
  if (pendingCount === 0) {
    campaign.status = "completed";
  } else if (campaign.status !== "draft") {
    campaign.status = "active";
  }

  await campaign.save();

  return {
    sentCount,
    failedCount,
    pendingCount,
  };
};

/**
 * ---------------------------------------------------------
 * CREATE EMAIL CAMPAIGN
 * ---------------------------------------------------------
 *
 * POST /api/admin/email-campaigns
 *
 * Admin creates a brand-new campaign.
 *
 * campaignId is generated by the backend.
 */

exports.createEmailCampaign = async (req, res) => {
  try {
    const { name, subject, htmlContent, textContent, buttonText, buttonUrl } =
      req.body;

    /**
     * Validate required fields.
     */
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Campaign name is required.",
      });
    }

    if (typeof subject !== "string" || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email subject is required.",
      });
    }

    if (typeof htmlContent !== "string" || !htmlContent.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email content is required.",
      });
    }

    /**
     * Validate optional button fields.
     */
    if (
      buttonText !== undefined &&
      buttonText !== null &&
      typeof buttonText !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Button text must be a string.",
      });
    }

    if (
      buttonUrl !== undefined &&
      buttonUrl !== null &&
      typeof buttonUrl !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Button URL must be a string.",
      });
    }

    /**
     * If button text is provided, require button URL.
     */
    if (buttonText?.trim() && !buttonUrl?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Button URL is required when button text is provided.",
      });
    }

    /**
     * If button URL is provided, require button text.
     */
    if (buttonUrl?.trim() && !buttonText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Button text is required when button URL is provided.",
      });
    }

    /**
     * Generate unique campaign ID.
     */
    const campaignId = generateCampaignId();

    /**
     * Create campaign as DRAFT.
     *
     * It becomes ACTIVE when the admin sends it.
     */
    const campaign = await EmailCampaign.create({
      campaignId,

      name: name.trim(),
      subject: subject.trim(),

      htmlContent: htmlContent.trim(),
      textContent: typeof textContent === "string" ? textContent.trim() : "",

      buttonText: typeof buttonText === "string" ? buttonText.trim() : "",

      buttonUrl: typeof buttonUrl === "string" ? buttonUrl.trim() : "",

      status: "draft",
    });

    /*
     * Create pending recipient records immediately.
     *
     * This makes the campaign statistics available
     * immediately after creation and allows the Admin
     * Panel to show the correct pending count.
     */
    await syncCampaignRecipients(campaign._id);

    const stats = await getCampaignStats(campaign.toObject());

    return res.status(201).json({
      success: true,
      message: "Email campaign created successfully.",
      data: stats,
    });
  } catch (error) {
    console.error("Create email campaign error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create email campaign.",
      error: error.message,
    });
  }
};

/**
 * ---------------------------------------------------------
 * GET ALL EMAIL CAMPAIGNS
 * ---------------------------------------------------------
 *
 * GET /api/admin/email-campaigns
 */

exports.getEmailCampaigns = async (req, res) => {
  try {
    const campaigns = await EmailCampaign.find({})
      .sort({ createdAt: -1 })
      .lean();

    const data = await Promise.all(
      campaigns.map(async (campaign) => {
        const stats = await getCampaignStats(campaign);

        return {
          _id: campaign._id.toString(),

          campaignId: campaign.campaignId,
          name: campaign.name,
          subject: campaign.subject,

          status: campaign.status,

          sentCount: stats.sentCount,
          failedCount: stats.failedCount,
          pendingCount: stats.pendingCount,

          dailyLimit: stats.dailyLimit,
          sentToday: stats.sentToday,
          remainingToday: stats.remainingToday,

          createdAt: campaign.createdAt,
          updatedAt: campaign.updatedAt,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get email campaigns error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load email campaigns.",
      error: error.message,
    });
  }
};

/**
 * ---------------------------------------------------------
 * GET SINGLE EMAIL CAMPAIGN
 * ---------------------------------------------------------
 *
 * GET /api/admin/email-campaigns/:id
 */

exports.getEmailCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email campaign ID.",
      });
    }

    const campaign = await EmailCampaign.findById(id).lean();

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Email campaign not found.",
      });
    }

    const recipients = await EmailCampaignRecipient.find({
      campaign: campaign._id,
    })
      .populate("user", "name email")
      .sort({ createdAt: 1 })
      .lean();

    const stats = await getCampaignStats(campaign);

    return res.status(200).json({
      success: true,

      data: {
        campaign: {
          _id: campaign._id,

          campaignId: campaign.campaignId,
          name: campaign.name,
          subject: campaign.subject,

          htmlContent: campaign.htmlContent,
          textContent: campaign.textContent,

          buttonText: campaign.buttonText,
          buttonUrl: campaign.buttonUrl,

          status: campaign.status,

          sentCount: stats.sentCount,
          failedCount: stats.failedCount,

          createdAt: campaign.createdAt,
          updatedAt: campaign.updatedAt,
        },

        statistics: {
          sentCount: stats.sentCount,
          failedCount: stats.failedCount,
          pendingCount: stats.pendingCount,

          dailyLimit: stats.dailyLimit,
          sentToday: stats.sentToday,
          remainingToday: stats.remainingToday,
        },

        recipients: recipients.map((recipient) => ({
          _id: recipient._id,

          campaign: recipient.campaign,

          user: recipient.user?._id || recipient.user || null,

          email: recipient.email,

          status: recipient.status,

          resendEmailId: recipient.resendEmailId || null,

          sentAt: recipient.sentAt || null,

          error: recipient.error || null,

          createdAt: recipient.createdAt,

          updatedAt: recipient.updatedAt,

          userName: recipient.user?.name || null,

          userEmail: recipient.user?.email || null,
        })),
      },
    });
  } catch (error) {
    console.error("Get email campaign error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load email campaign.",
      error: error.message,
    });
  }
};

/**
 * ---------------------------------------------------------
 * UPDATE EMAIL CAMPAIGN
 * ---------------------------------------------------------
 *
 * PUT /api/admin/email-campaigns/:id
 *
 * Draft campaigns can be fully edited.
 *
 * Once sending has started, the campaign content is locked.
 */

exports.updateEmailCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email campaign ID.",
      });
    }

    const campaign = await EmailCampaign.findById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Email campaign not found.",
      });
    }

    /**
     * Prevent changing a campaign after
     * sending has started.
     */
    if (campaign.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft campaigns can be edited.",
      });
    }

    const { name, subject, htmlContent, textContent, buttonText, buttonUrl } =
      req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Campaign name is required.",
      });
    }

    if (typeof subject !== "string" || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email subject is required.",
      });
    }

    if (typeof htmlContent !== "string" || !htmlContent.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email content is required.",
      });
    }

    if (buttonText?.trim() && !buttonUrl?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Button URL is required when button text is provided.",
      });
    }

    if (buttonUrl?.trim() && !buttonText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Button text is required when button URL is provided.",
      });
    }

    campaign.name = name.trim();
    campaign.subject = subject.trim();

    campaign.htmlContent = htmlContent.trim();

    campaign.textContent =
      typeof textContent === "string" ? textContent.trim() : "";

    campaign.buttonText =
      typeof buttonText === "string" ? buttonText.trim() : "";

    campaign.buttonUrl = typeof buttonUrl === "string" ? buttonUrl.trim() : "";

    await campaign.save();

    const stats = await getCampaignStats(campaign.toObject());

    return res.status(200).json({
      success: true,
      message: "Email campaign updated successfully.",
      data: stats,
    });
  } catch (error) {
    console.error("Update email campaign error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update email campaign.",
      error: error.message,
    });
  }
};

/**
 * ---------------------------------------------------------
 * DELETE EMAIL CAMPAIGN
 * ---------------------------------------------------------
 *
 * DELETE /api/admin/email-campaigns/:id
 */

exports.deleteEmailCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email campaign ID.",
      });
    }

    const campaign = await EmailCampaign.findById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Email campaign not found.",
      });
    }

    /**
     * Delete recipient records first.
     */
    await EmailCampaignRecipient.deleteMany({
      campaign: campaign._id,
    });

    await EmailCampaign.deleteOne({
      _id: campaign._id,
    });

    return res.status(200).json({
      success: true,
      message: "Email campaign deleted successfully.",
    });
  } catch (error) {
    console.error("Delete email campaign error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete email campaign.",
      error: error.message,
    });
  }
};

/**
 * ---------------------------------------------------------
 * SEND EMAIL CAMPAIGN
 * ---------------------------------------------------------
 *
 * POST /api/admin/email-campaigns/:id/send
 *
 * Sends the current batch of pending recipients.
 */

exports.sendEmailCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const dailyLimit = getDailyLimit();
    const emailFrom = process.env.EMAIL_FROM;

    /**
     * Validate configuration.
     */
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "RESEND_API_KEY is not configured.",
      });
    }

    if (!emailFrom) {
      return res.status(500).json({
        success: false,
        message: "EMAIL_FROM is not configured.",
      });
    }

    /**
     * Validate campaign ID.
     */
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email campaign ID.",
      });
    }

    /**
     * Find campaign.
     */
    const campaign = await EmailCampaign.findById(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Email campaign not found.",
      });
    }

    /**
     * Completed campaign cannot be sent again.
     */
    if (campaign.status === "completed") {
      const stats = await getCampaignStats(campaign.toObject());

      return res.status(200).json({
        success: true,
        message: "This email campaign has already been completed.",
        data: stats,
      });
    }

    /**
     * Make sure campaign content exists.
     */
    if (!campaign.subject || !campaign.htmlContent) {
      return res.status(400).json({
        success: false,
        message:
          "Campaign subject and email content are required before sending.",
      });
    }

    /**
     * Campaign is now active.
     */
    if (campaign.status === "draft") {
      campaign.status = "active";
      await campaign.save();
    }

    /**
     * Make sure every current user exists
     * in this campaign's recipient queue.
     */
    await syncCampaignRecipients(campaign._id);

    /**
     * Calculate today's successful sends.
     */
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sentToday = await EmailCampaignRecipient.countDocuments({
      campaign: campaign._id,
      status: "sent",
      sentAt: {
        $gte: startOfToday,
      },
    });

    const remainingDailyCapacity = Math.max(dailyLimit - sentToday, 0);

    /**
     * Daily limit reached.
     */
    if (remainingDailyCapacity === 0) {
      const stats = await getCampaignStats(campaign.toObject());

      return res.status(200).json({
        success: true,
        message: "Today's email limit has been reached. Try again tomorrow.",
        data: stats,
      });
    }

    /**
     * Get pending recipients.
     *
     * Oldest recipients are sent first.
     */
    const recipients = await EmailCampaignRecipient.find({
      campaign: campaign._id,
      status: "pending",
    })
      .populate("user", "name")
      .sort({ createdAt: 1 })
      .limit(remainingDailyCapacity)
      .lean();

    /**
     * Nothing is pending.
     */
    if (recipients.length === 0) {
      const counters = await syncCampaignCounters(campaign);

      const freshCampaign = await EmailCampaign.findById(campaign._id).lean();

      const stats = await getCampaignStats(freshCampaign);

      return res.status(200).json({
        success: true,
        message:
          counters.pendingCount === 0
            ? "Email campaign completed."
            : "No pending recipients found.",
        data: stats,
      });
    }

    /**
     * Separate valid and invalid emails.
     */
    const validRecipients = [];
    const invalidRecipients = [];

    for (const recipient of recipients) {
      if (isValidEmail(recipient.email)) {
        validRecipients.push(recipient);
      } else {
        invalidRecipients.push(recipient);
      }
    }

    /**
     * Mark invalid email addresses as failed.
     */
    if (invalidRecipients.length > 0) {
      await EmailCampaignRecipient.updateMany(
        {
          _id: {
            $in: invalidRecipients.map((recipient) => recipient._id),
          },

          status: "pending",
        },

        {
          $set: {
            status: "failed",
            error: "Invalid email address.",
          },
        },
      );
    }

    /**
     * No valid recipients remain.
     */
    if (validRecipients.length === 0) {
      const counters = await syncCampaignCounters(campaign);

      const freshCampaign = await EmailCampaign.findById(campaign._id).lean();

      const stats = await getCampaignStats(freshCampaign);

      return res.status(200).json({
        success: true,

        message:
          counters.pendingCount === 0
            ? "Email campaign completed."
            : "Invalid email addresses were skipped. Please click send again.",

        data: stats,
      });
    }

    /**
     * Build Resend batch using the
     * campaign content stored in MongoDB.
     */
    const emails = validRecipients.map((recipient) => {
      const userName = recipient.user?.name || "there";

      return {
        from: emailFrom,

        to: [recipient.email],

        subject: campaign.subject,

        html: createEmailHtml({
          name: userName,
          subject: campaign.subject,
          htmlContent: campaign.htmlContent,
          buttonText: campaign.buttonText,
          buttonUrl: campaign.buttonUrl,
        }),

        text: createEmailText({
          name: userName,
          textContent: campaign.textContent,
          buttonText: campaign.buttonText,
          buttonUrl: campaign.buttonUrl,
        }),
      };
    });

    /**
     * Unique idempotency key for this
     * exact send request.
     */
    const idempotencyKey = `fintrack/${campaign.campaignId}/${new Date()
      .toISOString()
      .slice(0, 10)}/${crypto.randomUUID()}`;

    let data;
    let error;

    try {
      const result = await sendBatchEmails(emails, idempotencyKey);

      data = result?.data;
      error = result?.error;
    } catch (sendError) {
      error = sendError;
    }

    /**
     * If Resend rejects the batch,
     * keep recipients pending so the
     * admin can retry later.
     */
    if (error) {
      console.error("Resend batch error:", error);

      await EmailCampaignRecipient.updateMany(
        {
          _id: {
            $in: validRecipients.map((recipient) => recipient._id),
          },

          status: "pending",
        },

        {
          $set: {
            error: error.message || "Resend batch failed.",
          },
        },
      );

      return res.status(502).json({
        success: false,

        message:
          "Resend failed to accept the email batch. The recipients remain pending and can be retried.",

        error: error.message,
      });
    }

    /**
     * Resend batch result.
     *
     * Support both:
     *
     * data = [...]
     *
     * and:
     *
     * data = { data: [...] }
     */
    const resendResults = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : [];

    /**
     * Only mark recipients as sent when
     * Resend returned a corresponding result.
     */
    const successfulCount = Math.min(
      validRecipients.length,
      resendResults.length,
    );

    const sentAt = new Date();

    const recipientUpdates = validRecipients
      .slice(0, successfulCount)
      .map((recipient, index) => {
        const resendEmailId = resendResults[index]?.id || null;

        return {
          updateOne: {
            filter: {
              _id: recipient._id,
              status: "pending",
            },

            update: {
              $set: {
                status: "sent",
                sentAt,
                resendEmailId,
                error: null,
              },
            },
          },
        };
      });

    /**
     * Mark successful recipients as sent.
     */
    if (recipientUpdates.length > 0) {
      await EmailCampaignRecipient.bulkWrite(recipientUpdates);
    }

    /**
     * Valid recipients without a Resend
     * result remain pending.
     */
    if (successfulCount < validRecipients.length) {
      const unmatchedRecipients = validRecipients.slice(successfulCount);

      await EmailCampaignRecipient.updateMany(
        {
          _id: {
            $in: unmatchedRecipients.map((recipient) => recipient._id),
          },

          status: "pending",
        },

        {
          $set: {
            error:
              "Resend did not return a successful email ID for this recipient.",
          },
        },
      );
    }

    /**
     * Synchronize campaign counters.
     */
    const counters = await syncCampaignCounters(campaign);

    const freshCampaign = await EmailCampaign.findById(campaign._id).lean();

    const stats = await getCampaignStats(freshCampaign);

    return res.status(200).json({
      success: true,

      message:
        counters.pendingCount === 0
          ? "Email campaign completed."
          : "Today's email batch was sent successfully.",

      data: stats,
    });
  } catch (error) {
    console.error("Send email campaign error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send email campaign.",
      error: error.message,
    });
  }
};
