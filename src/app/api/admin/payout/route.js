import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest, getAdminUser } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/data/admin";
import { sendUserEmail } from "@/lib/email";
import { formatMoney } from "@/lib/money";
import { notifyPayoutPaid } from "@/lib/whatsapp";

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

  const {
    payoutId,
    status,
    action,
    transactionRef,
    failureReason,
    rejectionReason,
    notes,
  } = body || {};

  if (!payoutId) {
    return NextResponse.json({ error: "payoutId is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const adminUser = await getAdminUser();
  const adminId = adminUser?.id || "admin";
  const now = new Date().toISOString();

  // Delete Action
  if (action === "delete") {
    try {
      const { error } = await supabase.from("payouts").delete().eq("id", payoutId);
      if (error) throw error;

      try {
        await logAdminAction(
          { action: "payout.delete", entity: "payouts", entityId: payoutId, meta: { deleted_by: adminId } },
          supabase
        );
      } catch {
        // non-blocking
      }
      revalidatePath("/admin");
      return NextResponse.json({ ok: true });
    } catch (error) {
      return NextResponse.json({ error: error?.message || "Payout deletion failed" }, { status: 500 });
    }
  }

  // Allowed status transitions
  const ALLOWED_STATUSES = ["requested", "processing", "paid", "failed", "rejected"];
  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  // Mandatory UTR / Transaction Reference verification when marking as paid
  if (status === "paid") {
    if (!transactionRef || !String(transactionRef).trim()) {
      return NextResponse.json(
        {
          error:
            "Transaction reference (Bank UTR / UPI reference number / IMPS Ref) is required before confirming a payout as Paid.",
        },
        { status: 400 }
      );
    }
  }

  try {
    // 1. Fetch current payout row
    const { data: payout, error: fetchErr } = await supabase
      .from("payouts")
      .select("id, professional_id, amount, method, status, payout_details, requested_at")
      .eq("id", payoutId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!payout) {
      return NextResponse.json({ error: "Payout record not found" }, { status: 404 });
    }

    // 2. Prepare merged audit details in payout_details jsonb
    const currentDetails =
      payout.payout_details && typeof payout.payout_details === "object"
        ? payout.payout_details
        : {};

    let updatedDetails = { ...currentDetails };

    if (status === "paid") {
      const cleanRef = String(transactionRef).trim();
      updatedDetails = {
        ...updatedDetails,
        transaction_ref: cleanRef,
        paid_at: now,
        confirmed_by_admin: adminId,
        notes: notes ? String(notes).trim() : updatedDetails.notes || null,
      };
    } else if (status === "processing") {
      updatedDetails = {
        ...updatedDetails,
        processing_started_at: now,
        processing_by_admin: adminId,
      };
    } else if (status === "failed") {
      updatedDetails = {
        ...updatedDetails,
        failure_reason: String(failureReason || "Bank / UPI transfer failed").trim(),
        failed_at: now,
        failed_by_admin: adminId,
      };
    } else if (status === "rejected") {
      updatedDetails = {
        ...updatedDetails,
        rejection_reason: String(rejectionReason || "Rejected by admin").trim(),
        rejected_at: now,
        rejected_by_admin: adminId,
      };
    } else if (status === "requested") {
      // Admin reconciled an unverified record back to requested
      updatedDetails = {
        ...updatedDetails,
        reverted_at: now,
        reverted_by_admin: adminId,
        reverted_reason: notes ? String(notes).trim() : "Reverted from unverified payment for reconciliation",
      };
    }

    // 3. Update database row
    const updatePayload = {
      status,
      processed_at: status === "requested" ? null : now,
      payout_details: updatedDetails,
    };

    const { error: updateErr } = await supabase
      .from("payouts")
      .update(updatePayload)
      .eq("id", payoutId);

    if (updateErr) throw updateErr;

    // 4. Audit Log
    try {
      await logAdminAction(
        {
          action: `payout.${status}`,
          entity: "payouts",
          entityId: payoutId,
          meta: {
            status,
            previous_status: payout.status,
            amount: payout.amount,
            admin_id: adminId,
            transaction_ref: updatedDetails.transaction_ref || null,
            reason: updatedDetails.failure_reason || updatedDetails.rejection_reason || null,
          },
        },
        supabase
      );
    } catch {
      // non-blocking audit logging
    }

    // 5. Notifications to Professional
    if (payout.professional_id) {
      // Email Notification
      try {
        let subject = "";
        let emailText = "";

        if (status === "paid") {
          subject = "Payout Confirmed — Money Sent to Your Bank / UPI";
          emailText = `Your payout request of ${formatMoney(payout.amount)} has been confirmed and transferred to your verified destination (${payout.method || "Bank/UPI"}).\n\nTransaction Reference (UTR): ${updatedDetails.transaction_ref}\nConfirmation Date: ${new Date(now).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}\n\nPlease check your bank account or UPI app for the credit reflection. If you have any questions, reference UTR ${updatedDetails.transaction_ref} with your bank or our support.\n— BookMyProfessional Team`;
        } else if (status === "processing") {
          subject = "Payout Update — Transfer In Progress";
          emailText = `Your payout request of ${formatMoney(payout.amount)} is currently being processed by our finance team for transfer to your destination (${payout.method || "Bank/UPI"}). You will receive confirmation and your UTR number as soon as the transfer clears.\n— BookMyProfessional Team`;
        } else if (status === "failed") {
          subject = "Payout Alert — Transfer Could Not Be Completed";
          emailText = `Your payout transfer of ${formatMoney(payout.amount)} could not be completed: ${updatedDetails.failure_reason}.\n\nYour earnings have been restored to your available balance. Please verify or update your bank account / UPI details in the Vendor Portal before requesting a new payout.\n— BookMyProfessional Team`;
        } else if (status === "rejected") {
          subject = "Payout Request Rejected";
          emailText = `Your payout request of ${formatMoney(payout.amount)} was rejected: ${updatedDetails.rejection_reason}.\n\nYour funds remain in your available balance.\n— BookMyProfessional Team`;
        }

        if (subject && emailText) {
          await sendUserEmail(payout.professional_id, {
            kind: "account",
            subject,
            text: emailText,
          });
        }
      } catch {
        // non-blocking
      }

      // WhatsApp Notification (Only on final verified transfer)
      if (status === "paid") {
        try {
          await notifyPayoutPaid(
            {
              id: payoutId,
              professional_id: payout.professional_id,
              amount: payout.amount,
              method: payout.method,
              transaction_ref: updatedDetails.transaction_ref,
            },
            supabase
          );
        } catch {
          // non-blocking
        }
      }
    }

    revalidatePath("/admin");
    return NextResponse.json({
      ok: true,
      payoutId,
      status,
      transactionRef: updatedDetails.transaction_ref || null,
    });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Payout update failed" }, { status: 500 });
  }
}
