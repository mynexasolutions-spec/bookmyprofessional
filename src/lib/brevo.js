export async function sendEmailViaBrevo({ toEmail, toName, subject, htmlContent }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@bookmyprofessional.com";
  const senderName = process.env.BREVO_SENDER_NAME || "Book my professional";

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
      "accept": "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Brevo Email Error:", errorData);
    throw new Error(`Failed to send email via Brevo: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}
