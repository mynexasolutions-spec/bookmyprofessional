// Server-only email via Brevo. Never import from a client component.
import { createClient } from "@supabase/supabase-js";

export function shouldEmail(prefs, kind) {
  // account-critical mail always sends; other kinds honour the user's notification prefs.
  if (kind === "account") return true;
  const p = prefs || {};
  return p[kind] !== false;
}

function wrapHtml(text) {
  const safe = String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<div style="font-family:sans-serif;white-space:pre-line">${safe}</div>`;
}

// Best-effort: true on success, false on any failure or missing key/config. Never throws.
export async function sendEmail({ to, subject, text, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !to) return false;

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME,
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: html || wrapHtml(text),
      }),
    });

    if (!response.ok) {
      console.error("Brevo email failed:", response.status, await response.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (error) {
    console.error("Brevo email error:", error?.message || error);
    return false;
  }
}

// Loads the recipient profile with the service-role client, gates on prefs, then sends.
// Best-effort: true/false, never throws.
export async function sendUserEmail(userId, { subject, text, html, kind = "bookings" }) {
  try {
    if (!userId) return false;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("email, full_name, notification_prefs")
      .eq("id", userId)
      .maybeSingle();

    if (error || !profile?.email) return false;
    if (!shouldEmail(profile.notification_prefs, kind)) return false;

    return await sendEmail({ to: profile.email, subject, text, html });
  } catch (error) {
    console.error("sendUserEmail error:", error?.message || error);
    return false;
  }
}