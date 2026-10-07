export async function sendEmailViaBrevo({ toEmail, toName, subject, htmlContent }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@bookmyprofessional.com";
  const senderName = process.env.BREVO_SENDER_NAME || "BookMyProfessional";

  // If Brevo API key is not configured (e.g. dev/test mode without credentials),
  // simulate a successful send with a mock messageId so authentication flows don't crash.
  if (!apiKey) {
    console.warn("[Brevo] BREVO_API_KEY is not set. Simulating email dispatch to:", toEmail);
    return {
      messageId: `<simulated-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@mock.brevo>`,
      simulated: true,
    };
  }

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [
      {
        email: toEmail,
        name: toName || toEmail.split("@")[0],
      },
    ],
    subject: subject,
    htmlContent: htmlContent,
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Brevo Email Error:", errorData);
    throw new Error(
      errorData?.message ||
        `Failed to send email via Brevo: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Check delivery status of a sent email using Brevo's Transactional Email API.
 * Returns { status: 'sent' | 'delivered' | 'bounced', reason: string, date: string } or null.
 */
export async function checkBrevoEmailStatus(messageId) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !messageId) return null;

  try {
    const cleanId = encodeURIComponent(messageId.replace(/[<>]/g, ""));
    const response = await fetch(`https://api.brevo.com/v3/smtp/emails/${cleanId}`, {
      headers: {
        accept: "application/json",
        "api-key": apiKey,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const events = Array.isArray(data.events) ? data.events : [];

    // Events in Brevo can include: delivered, soft_bounce, hard_bounce, blocked, spam, opened, click
    const hasBounce = events.some((e) =>
      ["soft_bounce", "hard_bounce", "blocked", "spam", "error"].includes(e.name?.toLowerCase())
    );
    if (hasBounce) {
      const bounceEv = events.find((e) =>
        ["soft_bounce", "hard_bounce", "blocked", "spam", "error"].includes(e.name?.toLowerCase())
      );
      return {
        status: "bounced",
        reason: bounceEv?.reason || bounceEv?.name || "Bounced / Blocked",
        date: bounceEv?.time || new Date().toISOString(),
      };
    }

    const hasDelivered = events.some((e) =>
      ["delivered", "opened", "click", "first_opening"].includes(e.name?.toLowerCase())
    );
    if (hasDelivered) {
      const delEv = events.find((e) =>
        ["delivered", "opened", "click", "first_opening"].includes(e.name?.toLowerCase())
      );
      return {
        status: "delivered",
        reason: null,
        date: delEv?.time || new Date().toISOString(),
      };
    }

    return { status: "sent", reason: null, date: data.date };
  } catch (err) {
    console.error("Failed to check Brevo email status:", err);
    return null;
  }
}
