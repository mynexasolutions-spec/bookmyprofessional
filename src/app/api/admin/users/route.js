import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction, updateUserSuspended, deleteUser } from "@/lib/data/admin";

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readBody(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const { userId, action } = body;
  if (!userId || !["suspend", "unsuspend"].includes(action)) {
    return NextResponse.json(
      { error: "userId and action ('suspend'|'unsuspend') are required" },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    await updateUserSuspended(supabase, userId, action === "suspend");
    await logAdminAction(
      { action: `user.${action}`, entity: "profiles", entityId: userId, meta: { action } },
      supabase
    );
    return NextResponse.json({ ok: true, userId, action });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "User update failed" }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readBody(request);
  const userId = body?.userId || new URL(request.url).searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  try {
    const supabase = createAdminClient();
    await deleteUser(supabase, userId);
    await logAdminAction({ action: "user.delete", entity: "profiles", entityId: userId }, supabase);
    return NextResponse.json({ ok: true, userId });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Delete failed" }, { status: 500 });
  }
}
