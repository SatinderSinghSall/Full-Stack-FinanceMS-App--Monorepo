const nodemailer = require("nodemailer");
const User = require("../models/User.model");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

/**
 * Escape dynamic content before inserting it into HTML.
 */
const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Format Financial Tip content.
 *
 * Blank lines create separate paragraphs.
 * Single line breaks create <br />.
 */
const formatContent = (value = "") => {
  const escaped = escapeHtml(value.trim());

  const paragraphs = escaped
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs
    .map(
      (paragraph) => `
        <p
          style="
            margin:0 0 16px;
            font-size:15px;
            line-height:27px;
            color:#374151;
          "
        >
          ${paragraph.replace(/\r?\n/g, "<br />")}
        </p>
      `,
    )
    .join("");
};

/**
 * Send a Financial Tip email to all registered users.
 */
const sendFinancialTipToAllUsers = async ({
  title,
  shortDescription,
  content,
  category = "money-habits",
  type = "tip",
}) => {
  const users = await User.find({
    email: {
      $exists: true,
      $ne: "",
    },
  })
    .select("name email")
    .lean();

  if (!users.length) {
    console.log("No users found for financial tip email.");

    return {
      total: 0,
      sent: 0,
      failed: 0,
    };
  }

  const safeTitle = escapeHtml(title.trim());
  const safeShortDescription = escapeHtml(shortDescription.trim());

  const typeLabels = {
    tip: "Financial Tip",
    guide: "Financial Guide",
    lesson: "Financial Lesson",
    warning: "Financial Safety",
  };

  const categoryLabels = {
    budgeting: "Budgeting",
    saving: "Saving",
    expenses: "Expenses",
    debt: "Debt",
    investing: "Investing",
    "financial-safety": "Financial Safety",
    "money-habits": "Money Habits",
    goals: "Financial Goals",
  };

  const typeLabel = typeLabels[type] || "Financial Tip";
  const categoryLabel = categoryLabels[category] || "Personal Finance";

  const appUrl =
    "https://play.google.com/store/apps/details?id=com.satinder_singh_sall.mobileapp";

  const results = await Promise.allSettled(
    users.map((user) => {
      const userName = user.name?.trim() || "FinTrack User";
      const safeUserName = escapeHtml(userName);

      const formattedContent = formatContent(content);

      return transporter.sendMail({
        from:
          process.env.EMAIL_FROM ||
          `"FinTrack" <${process.env.NODEMAILER_EMAIL}>`,

        to: user.email,

        subject: `New Financial Tip from FinTrack — ${title}`,

        /*
         * Plain-text fallback
         */
        text: `
Hello ${userName},

A new financial resource is available in FinTrack.

${title}

${shortDescription}

${content}

Open FinTrack to read the complete financial tip:

${appUrl}


HOW TO CHECK FINANCIAL TIPS IN THE FINTRACK APP

1. Open the FinTrack app.
2. Sign in to your account.
3. Open the Financial Tips section.
4. Select the tip you would like to read.
5. You can read the complete financial tip and its details inside the app.


If you've already received this email or already checked this financial tip, please ignore this email.

Thank you for using FinTrack! 💙

— The FinTrack Team


NEED TO REACH US?

If you would like to contact us, send us a message directly through the FinTrack app.

You can reach us from:

- Sidebar → Support & Feedback
- Profile → Support & Feedback
- Settings → Support & Feedback

We typically reply within 2–5 hours.


You are receiving this email because you are registered with the FinTrack app.


Founder & Curator

Satinder Singh Sall

Visit Portfolio:
https://satinder-portfolio.vercel.app/

Visit Satinder Poetry:
https://satinderpoetry.com


© ${new Date().getFullYear()} FinTrack.
All rights reserved.
        `.trim(),

        /*
         * HTML EMAIL
         */
        html: `
<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${safeTitle} | FinTrack</title>

</head>


<body
  style="
    margin:0;
    padding:0;
    background:#f3f4f6;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
    color:#111827;
  "
>

  <!-- Preheader -->

  <div
    style="
      display:none;
      max-height:0;
      overflow:hidden;
      opacity:0;
      color:transparent;
    "
  >
    A new financial tip is available in your FinTrack app.
  </div>


  <!-- Main Background -->

  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background:#f3f4f6;"
  >

    <tr>

      <td
        align="center"
        style="padding:40px 16px;"
      >


        <!-- ========================================= -->
        <!-- EMAIL CONTAINER -->
        <!-- ========================================= -->

        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:640px;
            background:#ffffff;
            border-radius:14px;
            overflow:hidden;
            border:1px solid #e5e7eb;
          "
        >


          <!-- ========================================= -->
          <!-- HEADER -->
          <!-- ========================================= -->

          <tr>

            <td
              style="
                background:#111827;
                padding:28px 34px;
              "
            >

              <div
                style="
                  font-size:25px;
                  line-height:32px;
                  font-weight:700;
                  color:#ffffff;
                  letter-spacing:-0.5px;
                "
              >
                FinTrack
              </div>


              <div
                style="
                  margin-top:5px;
                  font-size:13px;
                  line-height:20px;
                  color:#9ca3af;
                "
              >
                Your personal finance companion
              </div>

            </td>

          </tr>


          <!-- ========================================= -->
          <!-- INTRODUCTION -->
          <!-- ========================================= -->

          <tr>

            <td
              style="
                padding:40px 40px 20px;
              "
            >

              <p
                style="
                  margin:0 0 10px;
                  font-size:16px;
                  line-height:26px;
                  color:#374151;
                "
              >
                Hello ${safeUserName},
              </p>


              <h1
                style="
                  margin:0 0 14px;
                  font-size:28px;
                  line-height:36px;
                  font-weight:700;
                  letter-spacing:-0.5px;
                  color:#111827;
                "
              >
                A new financial resource is available
              </h1>


              <p
                style="
                  margin:0;
                  font-size:15px;
                  line-height:26px;
                  color:#6b7280;
                "
              >
                We’ve published a new financial resource in
                FinTrack that may help you learn, plan, and make
                more informed financial decisions.
              </p>

            </td>

          </tr>


          <!-- ========================================= -->
          <!-- FINANCIAL TIP -->
          <!-- ========================================= -->

          <tr>

            <td
              style="
                padding:10px 40px 10px;
              "
            >


              <!-- Type -->

              <div
                style="
                  margin-bottom:8px;
                  font-size:11px;
                  line-height:18px;
                  font-weight:700;
                  letter-spacing:1.2px;
                  text-transform:uppercase;
                  color:#2563eb;
                "
              >
                ${typeLabel}
              </div>


              <!-- Category -->

              <div
                style="
                  margin-bottom:14px;
                  font-size:12px;
                  line-height:20px;
                  color:#6b7280;
                "
              >
                Category: <strong>${categoryLabel}</strong>
              </div>


              <!-- Title -->

              <h2
                style="
                  margin:0 0 18px;
                  font-size:24px;
                  line-height:32px;
                  font-weight:700;
                  color:#111827;
                  letter-spacing:-0.3px;
                "
              >
                ${safeTitle}
              </h2>


              <!-- Short Description -->

              <div
                style="
                  margin-bottom:20px;
                  padding:18px 20px;
                  background:#eff6ff;
                  border:1px solid #dbeafe;
                  border-radius:10px;
                "
              >

                <p
                  style="
                    margin:0;
                    font-size:15px;
                    line-height:25px;
                    color:#1e3a8a;
                  "
                >
                  ${safeShortDescription}
                </p>

              </div>


              <!-- Full Content -->

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background:#f8fafc;
                  border:1px solid #e5e7eb;
                  border-radius:10px;
                "
              >

                <tr>

                  <td
                    style="
                      padding:24px;
                    "
                  >

                    ${formattedContent}

                  </td>

                </tr>

              </table>

            </td>

          </tr>


          <!-- ========================================= -->
          <!-- CTA -->
          <!-- ========================================= -->

          <tr>

            <td
              align="center"
              style="
                padding:30px 40px 35px;
              "
            >

              <p
                style="
                  margin:0 0 8px;
                  font-size:18px;
                  line-height:26px;
                  font-weight:700;
                  color:#111827;
                "
              >
                Read the full financial tip in FinTrack
              </p>


              <p
                style="
                  margin:0 0 22px;
                  font-size:14px;
                  line-height:23px;
                  color:#6b7280;
                "
              >
                Open the FinTrack app to explore the complete
                content and any additional details.
              </p>


              <!-- CTA Button -->

              <table
                role="presentation"
                cellpadding="0"
                cellspacing="0"
                border="0"
                align="center"
              >

                <tr>

                  <td
                    align="center"
                    style="
                      border-radius:8px;
                      background:#2563eb;
                    "
                  >

                    <a
                      href="${appUrl}"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="
                        display:inline-block;
                        padding:14px 26px;
                        font-size:15px;
                        line-height:20px;
                        font-weight:700;
                        color:#ffffff;
                        text-decoration:none;
                        border-radius:8px;
                      "
                    >
                      Open FinTrack App
                    </a>

                  </td>

                </tr>

              </table>


              <p
                style="
                  margin:16px 0 0;
                  font-size:11px;
                  line-height:18px;
                  color:#9ca3af;
                "
              >
                Tap the button above to open FinTrack on
                Google Play.
              </p>

            </td>

          </tr>


          <!-- ========================================= -->
          <!-- HOW TO CHECK FINANCIAL TIPS -->
          <!-- ========================================= -->

          <tr>

            <td
              style="
                padding:0 40px 34px;
              "
            >

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background:#ffffff;
                  border:1px solid #e5e7eb;
                  border-radius:12px;
                "
              >

                <tr>

                  <td
                    style="
                      padding:26px;
                    "
                  >

                    <h3
                      style="
                        margin:0 0 8px;
                        font-size:18px;
                        line-height:26px;
                        font-weight:700;
                        color:#111827;
                      "
                    >
                      How to check Financial Tips in the
                      FinTrack App
                    </h3>


                    <p
                      style="
                        margin:0 0 22px;
                        font-size:13px;
                        line-height:21px;
                        color:#6b7280;
                      "
                    >
                      Follow these simple steps to access your
                      financial tips inside FinTrack.
                    </p>


                    <ol
                      style="
                        margin:0;
                        padding-left:20px;
                        font-size:13px;
                        line-height:25px;
                        color:#4b5563;
                      "
                    >

                      <li>
                        Open the <strong>FinTrack</strong> app.
                      </li>

                      <li>
                        Sign in to your account.
                      </li>

                      <li>
                        Open the
                        <strong>Financial Tips</strong>
                        section.
                      </li>

                      <li>
                        Select the financial tip you would like
                        to read.
                      </li>

                      <li>
                        Read the complete tip and explore its
                        details inside the app.
                      </li>

                    </ol>

                  </td>

                </tr>

              </table>

            </td>

          </tr>


          <!-- ========================================= -->
          <!-- EMAIL NOTICE -->
          <!-- ========================================= -->

          <tr>

            <td
              style="
                padding:0 40px;
              "
            >

              <p
                style="
                  margin:0;
                  font-size:12px;
                  line-height:20px;
                  color:#6b7280;
                "
              >
                If you've already received this email or
                already checked this financial tip, please
                ignore this email.
              </p>


              <p
                style="
                  margin:14px 0 0;
                  font-size:14px;
                  line-height:22px;
                  color:#374151;
                "
              >
                Thank you for using FinTrack! 💙
              </p>


              <p
                style="
                  margin:10px 0 0;
                  font-size:14px;
                  line-height:22px;
                  font-weight:600;
                  color:#111827;
                "
              >
                — The FinTrack Team
              </p>

            </td>

          </tr>


          <!-- ========================================= -->
          <!-- FOOTER DIVIDER -->
          <!-- ========================================= -->

          <tr>

            <td
              style="
                padding:0 40px;
              "
            >

              <div
                style="
                  height:1px;
                  background:#e5e7eb;
                  margin:28px 0 24px;
                "
              ></div>

            </td>

          </tr>


          <!-- ========================================= -->
          <!-- CONTACT SUPPORT -->
          <!-- ========================================= -->

          <tr>

            <td
              style="
                padding:0 40px;
              "
            >

              <div
                style="
                  padding:18px;
                  background:#f8fafc;
                  border:1px solid #e5e7eb;
                  border-radius:10px;
                "
              >

                <p
                  style="
                    margin:0 0 8px;
                    font-size:14px;
                    font-weight:bold;
                    color:#111827;
                  "
                >
                  Need to reach us?
                </p>


                <p
                  style="
                    margin:0;
                    font-size:13px;
                    line-height:1.7;
                    color:#4b5563;
                  "
                >
                  If you would like to contact us, send us a
                  message directly through the FinTrack app.
                </p>


                <p
                  style="
                    margin:10px 0 0;
                    font-size:13px;
                    line-height:1.7;
                    color:#4b5563;
                  "
                >
                  You can reach us from:
                </p>


                <ul
                  style="
                    margin:8px 0 0;
                    padding-left:20px;
                    font-size:13px;
                    line-height:1.8;
                    color:#4b5563;
                  "
                >

                  <li>
                    <strong>Sidebar</strong>
                    → Support &amp; Feedback
                  </li>

                  <li>
                    <strong>Profile</strong>
                    → Support &amp; Feedback
                  </li>

                  <li>
                    <strong>Settings</strong>
                    → Support &amp; Feedback
                  </li>

                </ul>


                <p
                  style="
                    margin:12px 0 0;
                    font-size:13px;
                    line-height:1.7;
                    color:#4b5563;
                  "
                >
                  We typically reply within
                  <strong>2–5 hours</strong>.
                </p>

              </div>

            </td>

          </tr>


          <!-- ========================================= -->
          <!-- WHY YOU RECEIVED THIS EMAIL -->
          <!-- ========================================= -->

          <tr>

            <td
              style="
                padding:22px 40px 0;
              "
            >

              <p
                style="
                  margin:0;
                  font-size:11px;
                  line-height:1.7;
                  color:#9ca3af;
                  text-align:center;
                "
              >
                You are receiving this email because you are
                registered with the FinTrack app.
              </p>

            </td>

          </tr>


          <!-- ========================================= -->
          <!-- FOUNDER -->
          <!-- ========================================= -->

          <tr>

            <td
              style="
                padding:24px 40px 0;
              "
            >

              <div
                style="
                  padding-top:22px;
                  border-top:1px solid #f0f0f0;
                  text-align:center;
                "
              >

                <p
                  style="
                    margin:0;
                    font-size:11px;
                    font-weight:bold;
                    text-transform:uppercase;
                    letter-spacing:1px;
                    color:#9ca3af;
                  "
                >
                  Founder &amp; Curator
                </p>


                <p
                  style="
                    margin:6px 0 0;
                    font-size:15px;
                    font-weight:bold;
                    color:#111827;
                  "
                >
                  Satinder Singh Sall
                </p>


                <p
                  style="
                    margin:12px 0 0;
                    font-size:12px;
                    line-height:1.7;
                  "
                >

                  <a
                    href="https://satinder-portfolio.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="
                      color:#2563eb;
                      text-decoration:none;
                      font-weight:600;
                    "
                  >
                    Visit Portfolio
                  </a>

                </p>


                <p
                  style="
                    margin:5px 0 0;
                    font-size:12px;
                    line-height:1.7;
                  "
                >

                  <a
                    href="https://satinderpoetry.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="
                      color:#2563eb;
                      text-decoration:none;
                      font-weight:600;
                    "
                  >
                    Visit Satinder Poetry
                  </a>

                </p>

              </div>

            </td>

          </tr>


          <!-- ========================================= -->
          <!-- COPYRIGHT -->
          <!-- ========================================= -->

          <tr>

            <td
              style="
                padding:24px 40px 30px;
              "
            >

              <p
                style="
                  margin:0;
                  font-size:10px;
                  line-height:1.6;
                  color:#b0b7c3;
                  text-align:center;
                "
              >
                © ${new Date().getFullYear()} FinTrack.
                All rights reserved.
              </p>

            </td>

          </tr>


        </table>


        <!-- Outside Email -->

        <p
          style="
            margin:18px 0 0;
            font-size:10px;
            line-height:18px;
            color:#9ca3af;
          "
        >
          FinTrack — Manage your money. Understand your future.
        </p>


      </td>

    </tr>

  </table>

</body>

</html>
        `.trim(),
      });
    }),
  );

  const sent = results.filter((result) => result.status === "fulfilled").length;

  const failed = results.filter(
    (result) => result.status === "rejected",
  ).length;

  if (failed > 0) {
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `Financial tip email failed for ${users[index].email}:`,
          result.reason,
        );
      }
    });
  }

  console.log(
    `Financial tip email completed: ${sent} sent, ${failed} failed, ${users.length} total.`,
  );

  return {
    total: users.length,
    sent,
    failed,
  };
};

module.exports = {
  sendFinancialTipToAllUsers,
};
