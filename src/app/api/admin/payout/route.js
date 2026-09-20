import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/data/admin";

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

  const { payoutId, status } = body || {};
  if (!payoutId || !["paid", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "payoutId and status ('paid'|'rejected') are required" },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("payouts")
      .update({ status, processed_at: new Date().toISOString() })
      .eq("id", payoutId);
    if (error) throw error;

    await logAdminAction(
      { action: `payout.${status}`, entity: "payouts", entityId: payoutId, meta: { status } },
      supabase
    );

    return NextResponse.json({ ok: true, payoutId, status });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Payout update failed" }, { status: 500 });
  }
}
