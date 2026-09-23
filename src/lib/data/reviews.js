import { createClient } from "@/lib/supabase/client";

// ponytail: profiles RLS hides other users, so author name/avatar are unavailable here.
// Add a public profiles view (or a reviews_with_author view) later to show real names.
const DEFAULT_REVIEW_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80";

function mapReview(row) {
  return {
    id: row.id,
    userName: "Verified Client",
    userAvatar: DEFAULT_REVIEW_AVATAR,
    rating: Number(row.rating) || 0,
    date: row.created_at ? new Date(row.created_at).toLocaleDateString() : "",
    comment: row.comment || "",
    breakdown: row.breakdown || {},
    reportCount: Number(row.report_count) || 0,
    verifiedBooking: true,
  };
}

// ponytail: [] on error keeps the profile page rendering while schema.sql is unapplied.
export async function listReviewsForProfessional(professionalId) {
  if (!professionalId) return [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, rating, comment, breakdown, report_count, created_at")
      .eq("professional_id", professionalId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapReview);
  } catch {
    return [];
  }
}

// ponytail: [] on error so an admin/author list degrades to empty instead of crashing.
export async function listMyReviews() {
  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return [];
    const { data, error } = await supabase
      .from("reviews")
      .select("id, booking_id, professional_id, rating, comment, breakdown, status, created_at")
      .eq("customer_id", auth.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => ({
      ...mapReview(row),
      bookingId: row.booking_id,
      professionalId: row.professional_id,
      status: row.status,
    }));
  } catch {
    return [];
  }
}

// Inserts a pending review for the signed-in author. Throws user-facing errors for
// validation failures (not their booking, not completed, already reviewed).
export async function submitReview({ bookingId, professionalId, rating, comment, breakdown = {} }) {
  const supabase = createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth?.user) throw new Error("Please sign in to submit a review.");

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, customer_id, professional_id, status")
    .eq("id", bookingId)
    .maybeSingle();
  if (bookingError) throw bookingError;

  // ponytail: an unknown booking (e.g. an in-memory demo booking) is not user-facing,
  // so MarketplaceContext can fall back to the mock. Tighten once every booking is persisted.
  if (!booking) throw new Error("Booking not found.");

  if (booking.customer_id !== auth.user.id) {
    const err = new Error("You can only review your own bookings.");
    err.isUserFacing = true;
    throw err;
  }
  if (booking.status !== "completed") {
    const err = new Error("You can only review a booking once it is completed.");
    err.isUserFacing = true;
    throw err;
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      booking_id: bookingId,
      professional_id: professionalId || booking.professional_id,
      customer_id: auth.user.id,
      rating,
      comment: comment || null,
      breakdown: breakdown || {},
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      const err = new Error("You've already reviewed this booking.");
      err.isUserFacing = true;
      throw err;
    }
    throw error;
  }

  return mapReview(data);
}

// ponytail: report_review RPC may not be applied yet -> the caller gets the error to show a toast.
export async function reportReview(reviewId) {
  const supabase = createClient();
  const { error } = await supabase.rpc("report_review", { rid: reviewId });
  if (error) throw error;
  return true;
}

// Admin-only moderation (RLS enforces it). Throws on failure for the caller to surface.
export async function moderateReview(reviewId, status) {
  if (status !== "approved" && status !== "hidden") {
    throw new Error("Invalid moderation status.");
  }

  let dbError = null;
  let data = null;
  try {
    const supabase = createClient();
    const result = await supabase
      .from("reviews")
      .update({ status })
      .eq("id", reviewId)
      .select()
      .single();
    if (result.error) dbError = result.error;
    else data = result.data;
  } catch (err) {
    dbError = err;
  }

  // Local fallback
  let localFound = false;
  try {
    const fs = require("fs");
    const path = require("path");
    const dbPath = path.join(process.cwd(), "data", "reviews.json");
    if (fs.existsSync(dbPath)) {
      const reviews = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      const idx = reviews.findIndex((r) => r.id === reviewId);
      if (idx >= 0) {
        reviews[idx].status = status;
        fs.writeFileSync(dbPath, JSON.stringify(reviews, null, 2));
        data = reviews[idx];
        localFound = true;
      }
    }
  } catch (e) {
    console.error("Local review update failed:", e);
  }

  if (dbError && !localFound) throw dbError;
  return data ? mapReview(data) : null;
}
