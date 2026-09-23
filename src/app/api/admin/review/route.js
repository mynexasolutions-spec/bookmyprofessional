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
    let dbError = null;
    try {
      const { error } = await supabase.from("reviews").update({ status }).eq("id", reviewId);
      if (error) dbError = error;
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
          localFound = true;
        }
      }
    } catch (e) {
      console.error("Local review update failed:", e);
    }

    if (dbError && !localFound) throw dbError;

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
