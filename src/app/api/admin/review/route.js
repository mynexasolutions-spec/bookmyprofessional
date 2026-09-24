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

  const { reviewId, status } = body || {};
  if (!reviewId || !["approved", "hidden"].includes(status)) {
    return NextResponse.json(
      { error: "reviewId and status ('approved'|'hidden') are required" },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("reviews").update({ status }).eq("id", reviewId);
    if (error) throw error;

    try {
      await logAdminAction(
        { action: `review.${status}`, entity: "reviews", entityId: reviewId, meta: { status } },
        supabase
      );
    } catch {}

    return NextResponse.json({ ok: true, reviewId, status });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Review update failed" }, { status: 500 });
  }
}
