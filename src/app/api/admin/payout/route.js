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
    
    try {
      await logAdminAction(
        { action: `payout.${status}`, entity: "payouts", entityId: payoutId, meta: { status } },
        supabase
      );
    } catch(e) {
      // Ignore logging errors
    }
  } catch (error) {
    // Ignore supabase error
  }

  // Update local fallback
  try {
    const fs = require("fs");
    const path = require("path");
    const dbPath = path.join(process.cwd(), "data", "payouts.json");
    if (fs.existsSync(dbPath)) {
      const payouts = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      const idx = payouts.findIndex((p) => p.id === payoutId);
      if (idx >= 0) {
        payouts[idx].status = status;
        payouts[idx].processed_at = new Date().toISOString();
        fs.writeFileSync(dbPath, JSON.stringify(payouts, null, 2));
      }
    }
  } catch (err) {
    console.error("Failed to update local payouts.json", err);
  }

  return NextResponse.json({ ok: true, payoutId, status });
}
