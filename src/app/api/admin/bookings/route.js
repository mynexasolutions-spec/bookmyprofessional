import { NextResponse } from "next/server";
import { isAdminRequest, getAdminUser } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction, updateBookingStatusAdmin } from "@/lib/data/admin";
import { processRefund } from "@/lib/payu-refund";

const STATUSES = ["upcoming", "in_progress", "completed", "cancelled"];

export async function POST(request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { id, status, action, simulate_failure } = body || {};
  if (!id) {
    return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const adminUser = await getAdminUser();

  // Case 1: Direct Refund Action triggered by Admin ([ Refund ] / [ Retry Refund ])
  if (action === "refund") {
    try {
      const refundResult = await processRefund({
        bookingId: id,
        simulateFailure: Boolean(simulate_failure),
        client: supabase,
        adminUser,
      });

      if (!refundResult.ok) {
        return NextResponse.json(
          {
            error: refundResult.error || "Refund failed at payment gateway",
            status: "refund_failed",
          },
          { status: 400 }
        );
      }

      await logAdminAction(
        {
          action: "booking.manual_refund",
          entity: "bookings",
          entityId: id,
          meta: {
            admin_name: adminUser?.name || "Admin",
            refundId: refundResult.refundId,
            amount: refundResult.amount,
            status: refundResult.status,
          },
        },
        supabase
      );

      return NextResponse.json({
        ok: true,
        id,
        refund: refundResult,
        status: refundResult.status,
        notice:
          refundResult.status === "refund_pending"
            ? `Refund request submitted to PayU (Ref: ${refundResult.refundId || "Queued"}). Pending settlement.`
            : `Refund confirmed successfully via PayU (Ref: ${refundResult.refundId}).`,
      });
    } catch (error) {
      return NextResponse.json(
        { error: error?.message || "Refund processing failed" },
        { status: 500 }
      );
    }
  }

  // Case 2: Status Override
  if (!STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Valid status (${STATUSES.map((s) => `'${s}'`).join("|")}) or action is required` },
      { status: 400 }
    );
  }

  try {
    await updateBookingStatusAdmin(supabase, id, status);
    await logAdminAction(
      {
        action: "booking.status_override",
        entity: "bookings",
        entityId: id,
        meta: { status, admin_name: adminUser?.name || "Admin" },
      },
      supabase
    );

    // If cancelled, automatically call PayU refund API with the original transaction ID
    if (status === "cancelled") {
      const refundResult = await processRefund({
        bookingId: id,
        simulateFailure: Boolean(simulate_failure),
        client: supabase,
        adminUser,
      });

      if (!refundResult.ok) {
        return NextResponse.json({
          ok: true,
          id,
          status,
          refundStatus: "refund_failed",
          refundError: refundResult.error,
          warning: `Booking cancelled, but PayU refund failed: ${refundResult.error}. Use "Retry Refund" in the table.`,
        });
      }

      if (refundResult.status === "refund_pending") {
        return NextResponse.json({
          ok: true,
          id,
          status,
          refundStatus: "refund_pending",
          refundId: refundResult.refundId,
          amount: refundResult.amount,
          notice: `Booking cancelled. PayU refund request queued (Ref: ${refundResult.refundId || "Queued"}). Settlement pending.`,
        });
      }

      return NextResponse.json({
        ok: true,
        id,
        status,
        refundStatus: "refunded",
        refundId: refundResult.refundId,
        amount: refundResult.amount,
        message: `Booking cancelled and refund confirmed via PayU.`,
      });
    }

    return NextResponse.json({ ok: true, id, status });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Booking update failed" }, { status: 500 });
  }
}
