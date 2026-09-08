const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendBatchEmails = async (emails, idempotencyKey) => {
  if (!emails || emails.length === 0) {
    return {
      data: [],
      error: null,
    };
  }

  if (emails.length > 100) {
    throw new Error("Resend batch limit is 100 emails per request.");
  }

  return resend.batch.send(emails, {
    idempotencyKey,
  });
};

module.exports = {
  sendBatchEmails,
};
