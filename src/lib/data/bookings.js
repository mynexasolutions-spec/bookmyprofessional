import { createClient } from "@/lib/supabase/client";
import { createPaymentForBooking, getCommissionRate } from "./payments";

import { toUtcInstant } from "@/lib/datetime";
function generateBookingId() {
  return `BMP-${Math.floor(10000 + Math.random() * 90000)}`;
}

function userFacing(message) {
  const err = new Error(message);
  err.isUserFacing = true;
  return err;
}

// Next `count` calendar days (local) for the slot picker.
export function nextBookingDates(count = 14) {
  const today = new Date();
  const out = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const day = d.toLocaleDateString("en-US", { weekday: "short" });
    out.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      day,
      num: String(d.getDate()),
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : day,
    });
  }
  return out;
}

function normalizeSlots(availability) {
  return Array.isArray(availability?.slots) ? availability.slots : [];
}

async function fetchTimezone(supabase, professionalId) {
  if (!professionalId) return null;
  try {
    const { data, error } = await supabase
      .from("professionals")
      .select("timezone")
      .eq("id", professionalId)
      .single();
    if (error) throw error;
    return data?.timezone || null;
  } catch {
    return null; // ponytail: timezone column unapplied -> toUtcInstant falls back to UTC.
  }
}

function mapBooking(row) {
  const pro = row.professionals || {};
  const customer = row.customer || {};
  let reviews = [];
  if (Array.isArray(row.reviews)) {
    reviews = row.reviews;
  } else if (row.reviews && typeof row.reviews === 'object') {
    reviews = [row.reviews];
  }

  return {
    id: row.id,
    proId: row.professional_id,
    proName: pro.name || "Professional",
    proRole: pro.role_title || "",
    proAvatar: pro.image_url || "",
    serviceTitle: row.service_title || "",
    servicePrice: Number(row.service_price) || 0,
    platformFee: Number(row.platform_fee) || 0,
    totalPaid: Number(row.total_paid) || 0,
    date: row.date,
    timeSlot: row.time_slot,
    startsAt: row.starts_at || null,
    address: row.address || "",
    customerNotes: row.notes || "None provided",
    customerName: customer.full_name || "Customer",
    customerEmail: customer.email || "",
    customerPhone: customer.phone || "",
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method || "",
    createdAt: row.created_at,
    hasReview: reviews.length > 0,
    reviewRating: reviews.length > 0 ? reviews[0].rating : null,
  };
}

// ponytail: null when supabase is unavailable / no session, so the context can fall back to INITIAL_BOOKINGS.
export async function listMyBookings(client) {
  try {
    const supabase = client || createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;

    let dbBookings = [];
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "*, professionals(name, role_title, image_url), customer:profiles(full_name, email, phone), reviews(id, rating)"
        )
        .order("created_at", { ascending: false });

      if (!error && data) dbBookings = data.map(mapBooking);
    } catch (err) {}

    return dbBookings;
  } catch {
    return null;
  }
}

// ponytail: empty list on error keeps the slot picker usable while schema.sql is unapplied.
export async function listTakenSlots(professionalId, date, client) {
  try {
    const supabase = client || createClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("time_slot, status, payment_status")
      .eq("professional_id", professionalId)
      .eq("date", date)
      .in("status", ["upcoming", "in_progress", "completed"]);
    if (error) throw error;
    const validSlots = (data || []).filter(r => !(r.status === 'upcoming' && r.payment_status === 'unpaid'));
    return validSlots.map((r) => r.time_slot);
  } catch {
    return [];
  }
}

// A professional only offers slots on their configured working days. Empty list = every day.
function isWorkingDay(date, days) {
  if (!Array.isArray(days) || days.length === 0) return true;
  const weekday = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" });
  return days.some((d) => String(d).toLowerCase() === weekday.toLowerCase());
}

// Slots the professional offers on `date` (their working days only), minus the ones already booked.
export async function getAvailableSlots(professionalId, date, availability, client) {
  const fallback = normalizeSlots(availability);
  try {
    const supabase = client || createClient();
    const { data, error } = await supabase
      .from("professionals")
      .select("availability")
      .eq("id", professionalId)
      .single();
    if (error) throw error;
    const avail = data?.availability || availability || {};
    const base = normalizeSlots(avail);
    const slots = base.length ? base : fallback;
    if (!isWorkingDay(date, avail.days)) return [];
    const taken = new Set(await listTakenSlots(professionalId, date, supabase));
    return slots.filter((s) => !taken.has(s));
  } catch {
    // ponytail: professionals read failed (schema unapplied) -> use the caller's availability, still respect working days.
    if (!isWorkingDay(date, availability?.days)) return [];
    return fallback;
  }
}

export async function createBooking(payload, client) {
  const supabase = client || createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth?.user) throw userFacing("Please sign in to confirm your booking.");

  const {
    pro,
    service,
    date,
    timeSlot,
    address,
    notes,
    paymentMethod,
  } = payload || {};

  const servicePrice = Number(service?.price ?? pro?.price ?? 0);
  const platformFee = 0;
  const totalPaid = servicePrice + platformFee;

  const timezone = pro?.timezone || (await fetchTimezone(supabase, pro?.id)) || "UTC";

  const row = {
    id: generateBookingId(),
    customer_id: auth.user.id,
    professional_id: pro?.id ?? null,
    service_id: service?.id ?? null,
    service_title: service?.title ?? null,
    service_price: servicePrice,
    platform_fee: platformFee,
    total_paid: totalPaid,
    date,
    time_slot: timeSlot,
    address: address ?? null,
    notes: notes ?? null,
    status: "upcoming",
    payment_status: payload.paymentStatus || "paid",
    payment_method: paymentMethod ?? null,
    starts_at: toUtcInstant(date, timeSlot, timezone),
  };

  let { data, error } = await supabase
    .from("bookings")
    .insert(row)
    .select("*, professionals(name, role_title, image_url)")
    .single();

  // ponytail: starts_at column may not be migrated yet -> retry without it so the booking still persists.
  if (error && /starts_at/.test(error.message || "")) {
    const withoutStartsAt = { ...row };
    delete withoutStartsAt.starts_at;
    ({ data, error } = await supabase
      .from("bookings")
      .insert(withoutStartsAt)
      .select("*, professionals(name, role_title, image_url)")
      .single());
  }

  if (error) {
    if (error.code === "23505") {
      throw userFacing("Sorry, that time slot was just booked. Please pick another slot.");
    }
    throw error;
  }

  const booking = mapBooking(data);

  // ponytail: escrow row is best-effort — the booking stays valid even if the payments insert fails.
  try {
    const rate = await getCommissionRate(supabase);
    await createPaymentForBooking(booking, rate, supabase);
  } catch {
    // reconcile the escrow row once the payments table exists
  }

  return booking;
}

export async function updateBookingStatus(bookingId, status, client) {
  const supabase = client || createClient();
  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .select("*, professionals(name, role_title, image_url)")
    .single();
  if (error) {
    // ponytail: the DB trigger owns the state machine; just translate its rejection for the UI.
    if (error.code === "P0001" || /invalid booking status transition/i.test(error.message || "")) {
      throw userFacing("That status change isn't allowed from the current booking state.");
    }
    throw error;
  }
  return mapBooking(data);
}

async function getCancellationWindowHours(supabase) {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "cancellation")
      .single();
    if (error) throw error;
    const hours = Number(data?.value?.window_hours);
    return Number.isFinite(hours) ? hours : 2;
  } catch {
    return 2; // ponytail: default window until the settings row exists in the environment.
  }
}

export async function cancelBooking(bookingId, client) {
  const supabase = client || createClient();

  const { data: row, error: readError } = await supabase
    .from("bookings")
    .select("*, professionals(name, role_title, image_url)")
    .eq("id", bookingId)
    .single();
  if (readError) throw readError;

  let startsAt = row?.starts_at ? new Date(row.starts_at) : null;
  if (!startsAt) {
    const timezone = await fetchTimezone(supabase, row?.professional_id);
    const iso = toUtcInstant(row?.date, row?.time_slot, timezone);
    startsAt = iso ? new Date(iso) : null;
  }

  if (startsAt && !Number.isNaN(startsAt.getTime())) {
    const windowHours = await getCancellationWindowHours(supabase);
    const cutoff = startsAt.getTime() - windowHours * 60 * 60 * 1000;
    if (Date.now() > cutoff) {
      throw userFacing(
        `Cancellation window has passed. Bookings can only be cancelled more than ${windowHours} hours before the appointment.`
      );
    }
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .select("*, professionals(name, role_title, image_url)")
    .single();
  if (error) throw error;
  return mapBooking(data);
}
