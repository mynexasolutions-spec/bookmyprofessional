import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/data/admin";
import { sendUserEmail } from "@/lib/email";
import { formatMoney } from "@/lib/money";

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

  const { payoutId, status, action } = body || {};
  if (!payoutId) {
    return NextResponse.json({ error: "payoutId is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (action === "delete") {
    try {
      const { error } = await supabase.from("payouts").delete().eq("id", payoutId);
      if (error) throw error;
      
      try {
        await logAdminAction(
          { action: "payout.delete", entity: "payouts", entityId: payoutId },
          supabase
        );
      } catch (e) {
        // Ignore logging errors
      }
      revalidatePath("/admin");
      return NextResponse.json({ ok: true });
    } catch (error) {
      return NextResponse.json({ error: error?.message || "Payout deletion failed" }, { status: 500 });
    }
  }

  if (!["paid", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "status ('paid'|'rejected') is required" },
      { status: 400 }
    );
  }

  try {
    let payout = null;
    try {
      const { data } = await supabase
        .from("payouts")
        .select("professional_id, amount")
        .eq("id", payoutId)
        .maybeSingle();
      payout = data;
    } catch {
      // ignore — the status update below is what matters
    }

    const { error } = await supabase
      .from("payouts")
      .update({ status, processed_at: new Date().toISOString() })
      .eq("id", payoutId);
    
    if (error) {
      return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
    }
    
    try {
      await logAdminAction(
        { action: `payout.${status}`, entity: "payouts", entityId: payoutId, meta: { status } },
        supabase
      );
    } catch(e) {
      // Ignore logging errors
    }

    // ponytail: email is best-effort — a mail failure must never fail the payout update.
    if (payout?.professional_id) {
      try {
        await sendUserEmail(payout.professional_id, {
          kind: "account",
          subject: status === "paid" ? "Your payout has been paid" : "Your payout request was rejected",
          text:
            status === "paid"
              ? `Your payout of ${formatMoney(payout.amount)} has been marked as paid.\nYou can see it in your payout history on the vendor portal.\n— BookMyProfessional`
              : `Your payout request of ${formatMoney(payout.amount)} was rejected.\nOpen your vendor portal for details.\n— BookMyProfessional`,
        });
      } catch {
        // ignore — the payout was already updated
      }
    }
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Payout update failed" }, { status: 500 });
  }

  revalidatePath("/admin");
  return NextResponse.json({ ok: true, payoutId, status });
}
