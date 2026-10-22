
function triggerPayoutRequestedNotification(payoutId) {
  try {
    const origin = typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    fetch(`${origin}/api/notifications/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'payout_requested', payoutId }),
    }).catch(() => {});
  } catch {
    // Non-blocking notification dispatch
  }
}
import { createClient } from "@/lib/supabase/client";
import {
  validatePayoutDetails,
  hasValidPayoutDetails,
  formatPayoutMethod,
} from "@/lib/payout-validation";

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

// ponytail: default 10% rate until the settings table exists in the target environment.
export async function getCommissionRate(client) {
  try {
    const supabase = client || createClient();
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "commission")
      .single();
    if (error) throw error;
    const rate = Number(data?.value?.rate);
    return Number.isFinite(rate) ? rate : 0.1;
  } catch {
    return 0.1;
  }
}

export async function createPaymentForBooking(booking, commissionRate = 0.1, client) {
  const supabase = client || createClient();
  const amount = round2(booking.totalPaid ?? booking.total_paid ?? 0);
  const commission = round2(amount * commissionRate);
  const proPayout = round2(amount - commission);

  // Escrow row starts "pending" (payment initiated, not captured). The PayU callback/webhook
  // flips it to "held" with the real mihpayid once the charge is confirmed.
  const { data, error } = await supabase
    .from("payments")
    .insert({
      booking_id: booking.id,
      amount,
      commission,
      pro_payout: proPayout,
      status: "pending",
      provider: "payu",
      provider_ref: null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function releasePayment(bookingId, client) {
  const supabase = client || createClient();
  const { error } = await supabase
    .from("payments")
    .update({ status: "released" })
    .eq("booking_id", bookingId);
  if (error) throw error;
  return true;
}

export async function refundPayment(bookingId, client) {
  const origin = typeof window !== 'undefined'
    ? window.location.origin
    : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

  const res = await fetch(`${origin}/api/payu/refund`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId })
  });
  const data = await res.json().catch(() => ({}));

  // Only mark refunded once PayU confirms the refund actually went through.
  if (!res.ok || data.status !== 1) {
    const err = new Error(data.message || 'Refund failed at the payment gateway. Please contact support.');
    err.isUserFacing = true;
    throw err;
  }

  const supabase = client || createClient();
  const { error } = await supabase
    .from("payments")
    .update({ status: "refunded" })
    .eq("booking_id", bookingId);
  if (error) throw error;
  await supabase
    .from("bookings")
    .update({ payment_status: "refunded" })
    .eq("id", bookingId);
  return true;
}

// ponytail: null on error so the vendor page can fall back to proVendorState.payoutHistory.
export async function listMyPayouts(professionalId, client) {
  if (!professionalId) return null;

  try {
    const supabase = client || createClient();
    const { data, error } = await supabase
      .from("payouts")
      .select("*")
      .eq("professional_id", professionalId)
      .order("requested_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch {
    return null;
  }
}

// ponytail: null on error so the vendor page can fall back to the proVendorState mock numbers.
export async function getEarningsSummary(professionalId, client) {
  if (!professionalId) return null;

  try {
    const supabase = client || createClient();
    const rate = await getCommissionRate(supabase);

    const { data: payments, error: payErr } = await supabase
      .from("payments")
      .select("amount, commission, pro_payout, status, bookings!inner(professional_id)")
      .eq("bookings.professional_id", professionalId);
    if (payErr) throw payErr;

    const { data: payouts, error: payoutErr } = await supabase
      .from("payouts")
      .select("amount, status")
      .eq("professional_id", professionalId)
      .in("status", ["paid", "processing", "requested"]);
    if (payoutErr) throw payoutErr;

    let gross = 0;
    let commission = 0;
    let released = 0;
    (payments || []).forEach((p) => {
      if (p.status === "refunded" || p.status === "failed") return;
      gross += Number(p.amount) || 0;
      commission += Number(p.commission) || 0;
      if (p.status === "released") released += Number(p.pro_payout) || 0;
    });

    let paidOut = 0;
    let pendingWithdrawals = 0;
    (payouts || []).forEach((p) => {
      if (p.status === "requested") pendingWithdrawals += (Number(p.amount) || 0);
      else paidOut += (Number(p.amount) || 0);
    });

    return {
      gross: round2(gross),
      commission: round2(commission),
      released: round2(released),
      available: round2(Math.max(0, released - paidOut - pendingWithdrawals)),
      paidOut: round2(paidOut),
      commissionRate: rate,
    };
  } catch {
    return null;
  }
}

export async function requestPayout(professionalId, amount, payoutDetailsOrMethod, client) {
  if (!professionalId) throw new Error("Professional ID is required.");
  const numericAmount = round2(amount);
  if (!numericAmount || numericAmount <= 0) {
    const err = new Error("Please specify a valid payout amount.");
    err.isUserFacing = true;
    throw err;
  }

  const supabase = client || createClient();

  // Determine payout destination details
  let payoutDetails = null;
  let methodString = "";

  if (payoutDetailsOrMethod && typeof payoutDetailsOrMethod === "object") {
    payoutDetails = payoutDetailsOrMethod;
  } else if (typeof payoutDetailsOrMethod === "string" && payoutDetailsOrMethod.trim()) {
    methodString = payoutDetailsOrMethod.trim();
  }

  // If payout details were not passed directly, look up from the professional profile
  if (!payoutDetails) {
    try {
      const { data: pro } = await supabase
        .from("professionals")
        .select("payout_details")
        .eq("id", professionalId)
        .maybeSingle();
      if (pro?.payout_details && typeof pro.payout_details === "object" && Object.keys(pro.payout_details).length > 0) {
        payoutDetails = pro.payout_details;
      }
    } catch {
      // Column may not exist or network error
    }
  }

  // Validate that valid bank or UPI details exist before allowing payout request
  if (!payoutDetails || !hasValidPayoutDetails(payoutDetails)) {
    const err = new Error("Add bank details to request a payout.");
    err.isUserFacing = true;
    throw err;
  }

  const formattedMethod = formatPayoutMethod(payoutDetails);

  // Try inserting with payout_details snapshot column
  try {
    const { data, error } = await supabase
      .from("payouts")
      .insert({
        professional_id: professionalId,
        amount: numericAmount,
        status: "requested",
        method: formattedMethod,
        payout_details: payoutDetails,
      })
      .select()
      .single();

    if (!error && data) {
      if (data.id) triggerPayoutRequestedNotification(data.id);
      return data;
    }
    if (error && !error.message?.includes("payout_details")) {
      throw error;
    }
  } catch (err) {
    // If payout_details column is not yet applied, fallback to base insert
    if (!err.message?.includes("payout_details")) {
      throw err;
    }
  }

  // Fallback: insert without payout_details column (method string preserves the destination info)
  const { data, error } = await supabase
    .from("payouts")
    .insert({
      professional_id: professionalId,
      amount: numericAmount,
      status: "requested",
      method: formattedMethod,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
