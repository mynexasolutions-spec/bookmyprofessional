import { createClient } from "@/lib/supabase/server";

// ponytail: every admin read swallows errors and returns []/{}/null so the panel renders an
// empty state while supabase/schema.sql is unapplied. Drop the try/catch once the schema is live.

// ponytail: [] on error -> Verification tab shows its empty state.
export async function listPendingDocuments(client) {
  let dbData = [];
  try {
    const supabase = client || (await createClient());
    const { data, error } = await supabase
      .from("documents")
      .select(
        "id, professional_id, type, file_path, status, created_at, professional:profiles!documents_professional_id_fkey(full_name, email)"
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (!error && data) {
      dbData = await Promise.all(data.map(async (doc) => {
        if (!doc.file_path) return doc;
        const { data: urlData } = await supabase
          .storage
          .from("verification-docs")
          .createSignedUrl(doc.file_path, 3600); // 1 hour expiration
        
        return {
          ...doc,
          signedUrl: urlData?.signedUrl || null
        };
      }));
    }
  } catch {
    // Ignore supabase error
  }

  return dbData;
}

// ponytail: schema has no 'reported' review status, so the moderation queue is just 'pending'.
// Add a reported/report_count column + policy when reporting ships.
export async function listPendingReviews(client) {
  let dbData = [];
  try {
    const supabase = client || (await createClient());
    const { data, error } = await supabase
      .from("reviews")
      .select(
        "id, booking_id, professional_id, customer_id, rating, comment, breakdown, status, created_at, professional:professionals(name), customer:profiles(full_name)"
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (!error && data) {
      dbData = data;
    }
  } catch {
    // Ignore supabase error
  }

  return dbData;
}

// ponytail: [] on error -> Bookings tab shows its empty state.
export async function listAllBookings(client) {
  let dbData = [];
  try {
    const supabase = client || (await createClient());
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, customer_id, professional_id, service_title, total_paid, date, time_slot, status, payment_status, created_at, professionals(name), customer:profiles(full_name)"
      )
      .order("created_at", { ascending: false });
    if (!error && data) {
      dbData = data;
    }
  } catch {
    // Ignore supabase error
  }

  return dbData;
}

// ponytail: [] on error -> Users tab shows its empty state.
export async function listUsers(client) {
  try {
    const supabase = client || (await createClient());
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, city, role, suspended, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

// ponytail: [] on error -> Payouts tab shows its empty state.
export async function listPayouts(client) {
  let dbData = [];
  try {
    const supabase = client || (await createClient());
    const { data, error } = await supabase
      .from("payouts")
      .select(
        "id, professional_id, amount, status, method, requested_at, processed_at, professional:profiles(full_name, email)"
      )
      .order("requested_at", { ascending: false });
    if (!error && data) {
      dbData = data;
    }
  } catch {
    // Ignore supabase error
  }

  return dbData;
}

// ponytail: [] on error -> Professionals tab shows its empty state.
export async function listAllProfessionals(client) {
  try {
    const supabase = client || (await createClient());
    const { data, error } = await supabase
      .from("professionals")
      .select(
        "id, name, category, city, verification_status, verified, is_active, rating, review_count, created_at, profile:profiles(full_name)"
      )
      .order("created_at", { ascending: false });
    if (error) throw error;
    
    return (data || []).map(pro => ({
      ...pro,
      name: pro.profile?.full_name || pro.name
    }));
  } catch {
    return [];
  }
}

// ponytail: defaults on error -> Settings tab still renders editable values.
export const DEFAULT_SETTINGS = {
  commission: { rate: 0.1 },
  cancellation: { window_hours: 24 },
};

export async function getSettings(client) {
  try {
    const supabase = client || (await createClient());
    const { data, error } = await supabase.from("settings").select("key, value");
    if (error) throw error;
    const map = { ...DEFAULT_SETTINGS };
    for (const row of data || []) {
      if (row?.key) map[row.key] = row.value ?? map[row.key];
    }
    return map;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function updateSettings(client, key, value) {
  const supabase = client || (await createClient());
  const { data, error } = await supabase
    .from("settings")
    .upsert({ key, value })
    .select("key, value")
    .single();
  if (error) throw error;
  return data;
}

export async function updateUserSuspended(client, userId, suspended) {
  const supabase = client || (await createClient());
  const { error } = await supabase
    .from("profiles")
    .update({ suspended: !!suspended })
    .eq("id", userId);
  if (error) throw error;
  return true;
}

export async function deleteUser(client, userId) {
  const supabase = client || (await createClient());
  
  // Attempt to delete auth user first (might cascade depending on DB setup)
  try {
    await supabase.auth.admin.deleteUser(userId);
  } catch {
    // Ignore auth deletion errors
  }

  // Manually delete dependent records to avoid Foreign Key constraint errors
  // Find user bookings to delete their payments
  const { data: userBookings } = await supabase
    .from("bookings")
    .select("id")
    .or(`customer_id.eq.${userId},professional_id.eq.${userId}`);
  
  if (userBookings && userBookings.length > 0) {
    const bookingIds = userBookings.map(b => b.id);
    await supabase.from("payments").delete().in("booking_id", bookingIds);
  }

  await Promise.all([
    supabase.from("reviews").delete().eq("customer_id", userId),
    supabase.from("reviews").delete().eq("professional_id", userId),
    supabase.from("documents").delete().eq("professional_id", userId),
    supabase.from("payouts").delete().eq("professional_id", userId),
    supabase.from("bookings").delete().eq("customer_id", userId),
    supabase.from("bookings").delete().eq("professional_id", userId),
  ]);

  await supabase.from("professionals").delete().eq("id", userId);

  const { error } = await supabase.from("profiles").delete().eq("id", userId);
  
  if (error) {
    console.error("Failed to delete profile:", error);
    throw error;
  }
  
  return true;
}

export async function updateProfessional(client, id, patch) {
  const supabase = client || (await createClient());
  const { data, error } = await supabase
    .from("professionals")
    .update(patch)
    .eq("id", id)
    .select("id, verification_status, verified, is_active")
    .single();
  if (error) throw error;
  return data;
}

export async function updateBookingStatusAdmin(client, id, status) {
  let dbError = null;
  try {
    const supabase = client || (await createClient());
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) dbError = error;
  } catch (err) {
    dbError = err;
  }

  // Always attempt to update local JSON just in case the booking is a mock booking
  try {
    const fs = require("fs");
    const path = require("path");
    const dbPath = path.join(process.cwd(), "data", "bookings.json");
    if (fs.existsSync(dbPath)) {
      const bookings = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      const idx = bookings.findIndex((b) => b.id === id);
      if (idx >= 0) {
        bookings[idx].status = status;
        fs.writeFileSync(dbPath, JSON.stringify(bookings, null, 2));
        // If we found it locally, consider the operation a success regardless of DB
        return true;
      }
    }
  } catch (e) {
    console.error("Local booking update failed:", e);
  }

  if (dbError) throw dbError;
  return true;
}

async function countRows(supabase, table, apply) {
  try {
    let query = supabase.from(table).select("*", { count: "exact", head: true });
    if (apply) query = apply(query);
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  } catch {
    return 0;
  }
}

// ponytail: counts return 0 and revenue 0 on error -> Overview cards stay renderable.
// Revenue is summed client-side; move to an RPC/view if payment volume grows.
export async function getAnalytics(client) {
  const supabase = client || (await createClient());

  const [users, professionals, bookings, completedBookings, pendingDocs, pendingReviews] =
    await Promise.all([
      countRows(supabase, "profiles"),
      countRows(supabase, "professionals"),
      countRows(supabase, "bookings"),
      countRows(supabase, "bookings", (q) => q.eq("status", "completed")),
      countRows(supabase, "documents", (q) => q.eq("status", "pending")),
      countRows(supabase, "reviews", (q) => q.eq("status", "pending")),
    ]);

  let grossRevenue = 0;
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("amount")
      .eq("status", "released");
    if (error) throw error;
    grossRevenue = (data || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  } catch {
    grossRevenue = 0;
  }

  return {
    users,
    professionals,
    bookings,
    completedBookings,
    pendingDocs,
    pendingReviews,
    grossRevenue: Math.round(grossRevenue * 100) / 100,
  };
}

// ponytail: best-effort audit write — a failed log must not fail the admin action itself.
export async function logAdminAction({ action, entity, entityId, meta } = {}, client) {
  try {
    const supabase = client || (await createClient());
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("audit_log").insert({
      admin_id: user?.id || null,
      action,
      entity: entity || null,
      entity_id: entityId != null ? String(entityId) : null,
      meta: meta || {},
    });
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}
