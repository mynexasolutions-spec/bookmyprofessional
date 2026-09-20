import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction, updateBookingStatusAdmin } from "@/lib/data/admin";

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

  const { id, status } = body || {};
  if (!id || !STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `id and status (${STATUSES.map((s) => `'${s}'`).join("|")}) are required` },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    await updateBookingStatusAdmin(supabase, id, status);
    await logAdminAction(
      { action: "booking.status_override", entity: "bookings", entityId: id, meta: { status } },
      supabase
    );
    return NextResponse.json({ ok: true, id, status });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Booking update failed" }, { status: 500 });
  }
}
