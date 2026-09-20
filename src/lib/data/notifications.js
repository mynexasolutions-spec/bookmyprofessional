import { createClient } from "@/lib/supabase/client";

export function mapNotification(row) {
  return {
    id: row.id,
    title: row.title || "",
    body: row.body || "",
    type: row.type || "info",
    link: row.link || null,
    read: !!row.read,
    createdAt: row.created_at,
  };
}

// ponytail: [] on error / no session so the bell silently shows an empty state.
export async function listMyNotifications(limit = 20) {
  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return [];
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(mapNotification);
  } catch {
    return [];
  }
}

// ponytail: 0 on error / no session so the badge just hides.
export async function unreadCount() {
  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return 0;
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", auth.user.id)
      .eq("read", false);
    if (error) throw error;
    return count || 0;
  } catch {
    return 0;
  }
}

// ponytail: best-effort mark-as-read — returns false instead of throwing so the menu never crashes.
export async function markRead(id) {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

export async function markAllRead() {
  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return false;
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", auth.user.id)
      .eq("read", false);
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

// ponytail: stubbed — real delivery needs a provider (Resend/SES) key and a server route or
// Edge Function to hold the secret. Swap this single function when that exists.
export async function sendEmail(to, subject, body) {
  return false;
}

// ponytail: server-side enforcement of these prefs is deferred — the triggers/notify function
// write notifications regardless. Read them here for the UI; wire them into notify_booking_event
// (or a send guard) when users actually need to suppress delivery.
export const DEFAULT_NOTIFICATION_PREFS = {
  bookings: true,
  reviewReplies: true,
  announcements: true,
};

// ponytail: defaults on error / no session so the toggles always render.
export async function getNotificationPrefs() {
  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return { ...DEFAULT_NOTIFICATION_PREFS };
    const { data, error } = await supabase
      .from("profiles")
      .select("notification_prefs")
      .eq("id", auth.user.id)
      .maybeSingle();
    if (error) throw error;
    return { ...DEFAULT_NOTIFICATION_PREFS, ...(data?.notification_prefs || {}) };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFS };
  }
}

// Merges `patch` into the stored jsonb. Returns the merged prefs, or null when the write failed.
export async function updateNotificationPrefs(patch) {
  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;
    const current = await getNotificationPrefs();
    const merged = { ...current, ...(patch || {}) };
    const { error } = await supabase
      .from("profiles")
      .update({ notification_prefs: merged })
      .eq("id", auth.user.id);
    if (error) throw error;
    return merged;
  } catch {
    return null;
  }
}
