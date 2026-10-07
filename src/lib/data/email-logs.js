import { createClient } from "@supabase/supabase-js";
import { checkBrevoEmailStatus } from "@/lib/brevo";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Record a new email/OTP log entry.
 * Primary store: 'email_logs' table in Supabase.
 * Fallback store: 'settings' table with key 'email_logs_list' (persists even if migration is not run).
 */
export async function recordEmailLog({
  messageId,
  recipient,
  type = "signup_otp",
  subject = "Verification Code",
  status = "sent", // 'sent' | 'delivered' | 'bounced' | 'failed'
  errorMessage = null,
  metadata = {},
}) {
  const supabase = getServiceClient();
  const id = `email_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  const record = {
    id,
    message_id: messageId || null,
    recipient: recipient.toLowerCase().trim(),
    type,
    subject,
    status,
    error_message: errorMessage,
    metadata,
    created_at: now,
    updated_at: now,
  };

  if (!supabase) return record;

  // Try saving to 'email_logs' table
  try {
    const { error } = await supabase.from("email_logs").insert(record);
    if (!error) return record;
  } catch {
    // Continue to fallback
  }

  // Fallback: save to settings table under 'email_logs_list'
  try {
    const { data: existing } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "email_logs_list")
      .maybeSingle();

    const list = Array.isArray(existing?.value) ? existing.value : [];
    const updated = [record, ...list].slice(0, 100); // keep recent 100

    if (existing) {
      await supabase.from("settings").update({ value: updated }).eq("key", "email_logs_list");
    } else {
      await supabase.from("settings").insert({ key: "email_logs_list", value: updated });
    }
  } catch (err) {
    console.error("Failed to store email log fallback:", err);
  }

  return record;
}

/**
 * Update an existing email log status (e.g. from Brevo Webhook or poll).
 */
export async function updateEmailLogStatus({
  messageId,
  email,
  status, // 'delivered' | 'bounced' | 'failed'
  reason = null,
  eventTime = new Date().toISOString(),
}) {
  const supabase = getServiceClient();
  if (!supabase) return false;

  let updated = false;

  // Try updating in 'email_logs' table
  try {
    let query = supabase.from("email_logs").update({
      status,
      error_message: reason,
      updated_at: eventTime,
    });

    if (messageId) {
      query = query.eq("message_id", messageId);
    } else if (email) {
      query = query.eq("recipient", email.toLowerCase().trim());
    }

    const { error, count } = await query;
    if (!error && count && count > 0) updated = true;
  } catch {
    // Continue to fallback
  }

  // Also update in settings table fallback
  try {
    const { data: existing } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "email_logs_list")
      .maybeSingle();

    if (existing && Array.isArray(existing.value)) {
      const list = existing.value.map((log) => {
        const matches =
          (messageId && log.message_id === messageId) ||
          (!messageId && email && log.recipient === email.toLowerCase().trim());
        if (matches) {
          return {
            ...log,
            status,
            error_message: reason || log.error_message,
            updated_at: eventTime,
          };
        }
        return log;
      });

      await supabase.from("settings").update({ value: list }).eq("key", "email_logs_list");
      updated = true;
    }
  } catch {
    // Ignore fallback error
  }

  return updated;
}

/**
 * List email logs for admin view with optional live status sync from Brevo.
 */
export async function listEmailLogs({ limit = 50, syncWithBrevo = true } = {}) {
  const supabase = getServiceClient();
  let logs = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("email_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && data && data.length > 0) {
        logs = data;
      }
    } catch {
      // Ignore
    }

    // If table was empty or not found, try settings table
    if (logs.length === 0) {
      try {
        const { data: settingRow } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "email_logs_list")
          .maybeSingle();

        if (settingRow && Array.isArray(settingRow.value)) {
          logs = settingRow.value.slice(0, limit);
        }
      } catch {
        // Ignore
      }
    }
  }

  // If syncWithBrevo is true, check Brevo API for recent 'sent' items to see if they're delivered or bounced
  if (syncWithBrevo && logs.length > 0) {
    const sentLogs = logs.filter((l) => l.status === "sent" && l.message_id).slice(0, 5);
    for (const log of sentLogs) {
      try {
        const statusData = await checkBrevoEmailStatus(log.message_id);
        if (statusData && statusData.status && statusData.status !== "sent") {
          log.status = statusData.status;
          log.error_message = statusData.reason || log.error_message;
          log.updated_at = statusData.date || new Date().toISOString();
          // Update in DB asynchronously
          updateEmailLogStatus({
            messageId: log.message_id,
            status: statusData.status,
            reason: statusData.reason,
          }).catch(() => {});
        }
      } catch {
        // Skip failed Brevo status checks
      }
    }
  }

  return logs;
}
