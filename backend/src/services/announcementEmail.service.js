const User = require("../models/User.model");

/**
 * Escape user/admin-provided content before inserting it into HTML.
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
 * Format announcement message for HTML email.
 *
 * Blank lines create separate paragraphs.
 * Single line breaks inside a paragraph become <br>.
 */
const formatAnnouncementMessage = (value = "") => {
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
        >${paragraph.replace(/\r?\n/g, "<br />")}</p>
      `,
    )
    .join("");
};

/**
 * Send an announcement email to all registered users.
 */
const sendAnnouncementToAllUsers = async ({
  title,
  message,
  type = "info",
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
    console.log("No users found for announcement email.");

    return {
      total: 0,
      sent: 0,
      failed: 0,
    };
  }

  const safeTitle = escapeHtml(title.trim());

  const announcementTypeLabels = {
    info: "Important Update",
    success: "Good News",
    warning: "Important Notice",
    feature: "New Feature",
  };

  const announcementLabel =
    announcementTypeLabels[type] || "FinTrack Announcement";

  const appUrl =
    "https://play.google.com/store/apps/details?id=com.satinder_singh_sall.mobileapp";

  const results = [];

  const batchSize = 5;

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(
      batch.map(async (user) => {
        const userName = user.name?.trim() || "FinTrack User";

        const safeUserName = escapeHtml(userName);

        const formattedMessage = formatAnnouncementMessage(message);

        const emailData = {
          from:
            process.env.EMAIL_FROM ||
            `"FinTrack" <${process.env.NODEMAILER_EMAIL}>`,

          to: user.email,

          subject: `New Announcement from FinTrack — ${title}`,

          /*
           * Plain-text fallback
           */
          text: `
Hello ${userName},

A new announcement has been published in FinTrack.

${title}

${message}

To view the complete announcement and any additional details, open the FinTrack app:

${appUrl}


HOW TO CHECK ANNOUNCEMENTS IN THE FINTRACK APP

Option 1 — Dashboard

1. Open the FinTrack app.
2. Sign in to your account.
3. Go to your Dashboard.
4. Scroll down a little.
5. Look for the Announcements section.


Option 2 — Sidebar

1. Open the FinTrack sidebar/menu.
2. Select Announcements.
3. Browse your available announcements there.


If you've already received this email or checked the announcement, please ignore this email.

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
    A new announcement is available in your FinTrack app.
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
              >${safeUserName},</p>


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
                A new announcement is available
              </h1>


              <p
                style="
                  margin:0;
                  font-size:15px;
                  line-height:26px;
                  color:#6b7280;
                "
              >
                We have published a new announcement in FinTrack
                that may be important or useful to you.
              </p>

            </td>

          </tr>


          <!-- ========================================= -->
          <!-- ANNOUNCEMENT -->
          <!-- ========================================= -->

          <tr>

            <td
              style="
                padding:10px 40px 10px;
              "
            >


              <!-- Announcement Type -->

              <div
                style="
                  margin-bottom:12px;
                  font-size:11px;
                  line-height:18px;
                  font-weight:700;
                  letter-spacing:1.2px;
                  text-transform:uppercase;
                  color:#2563eb;
                "
              >
                ${announcementLabel}
              </div>


              <!-- Announcement Title -->

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


              <!-- Announcement Message -->

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
                  >${formattedMessage}</td>

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
                View the full announcement in FinTrack
              </p>


              <p
                style="
                  margin:0 0 22px;
                  font-size:14px;
                  line-height:23px;
                  color:#6b7280;
                "
              >
                Open the FinTrack app to view the complete
                announcement and any additional details.
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
          <!-- HOW TO CHECK ANNOUNCEMENTS -->
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
                      How to check Announcements in the
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
                      You can access your announcements from
                      two convenient places inside the app.
                    </p>


                    <!-- Dashboard -->

                    <p
                      style="
                        margin:0 0 8px;
                        font-size:14px;
                        line-height:22px;
                        font-weight:700;
                        color:#111827;
                      "
                    >
                      Option 1 — Dashboard
                    </p>


                    <ol
                      style="
                        margin:0 0 22px;
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
                        Go to your <strong>Dashboard</strong>.
                      </li>

                      <li>
                        Scroll down a little.
                      </li>

                      <li>
                        Look for the
                        <strong>Announcements</strong>
                        section.
                      </li>

                    </ol>


                    <!-- Sidebar -->

                    <p
                      style="
                        margin:0 0 8px;
                        font-size:14px;
                        line-height:22px;
                        font-weight:700;
                        color:#111827;
                      "
                    >
                      Option 2 — Sidebar
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
                        Open the FinTrack
                        <strong>sidebar/menu</strong>.
                      </li>

                      <li>
                        Select
                        <strong>Announcements</strong>.
                      </li>

                      <li>
                        Browse your available announcements
                        there.
                      </li>

                    </ol>

                  </td>

                </tr>

              </table>

            </td>

          </tr>


          <!-- ========================================= -->
          <!-- EXISTING EMAIL NOTICE -->
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
                completed the requested action, please ignore
                this email.
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


        <!-- ========================================= -->
        <!-- OUTSIDE EMAIL -->
        <!-- ========================================= -->

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
        };

        const response = await fetch(
          `${process.env.EMAIL_SERVICE_URL}/api/send`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-email-service-secret": process.env.EMAIL_SERVICE_SECRET,
            },
            body: JSON.stringify(emailData),
          },
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || `Email service returned ${response.status}`,
          );
        }

        return result;
      }),
    );

    results.push(...batchResults);

    // Give Gmail a short break between batches
    if (i + batchSize < users.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  const sent = results.filter((result) => result.status === "fulfilled").length;

  const failed = results.filter(
    (result) => result.status === "rejected",
  ).length;

  if (failed > 0) {
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `Announcement email failed for ${users[index].email}:`,
          result.reason,
        );
      }
    });
  }

  console.log(
    `Announcement email completed: ${sent} sent, ${failed} failed, ${users.length} total.`,
  );

  return {
    total: users.length,
    sent,
    failed,
  };
};

module.exports = {
  sendAnnouncementToAllUsers,
};
