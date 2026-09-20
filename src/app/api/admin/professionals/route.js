import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction, updateProfessional } from "@/lib/data/admin";

const PATCHES = {
  activate: { is_active: true },
  deactivate: { is_active: false },
  approve: { verification_status: "approved", verified: true },
  reject: { verification_status: "rejected", verified: false },
};

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

  const { id, action } = body || {};
  if (!id || !PATCHES[action]) {
    return NextResponse.json(
      { error: "id and action ('activate'|'deactivate'|'approve'|'reject') are required" },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    const professional = await updateProfessional(supabase, id, PATCHES[action]);
    await logAdminAction(
      { action: `professional.${action}`, entity: "professionals", entityId: id, meta: { action } },
      supabase
    );
    return NextResponse.json({ ok: true, id, action, professional });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Professional update failed" }, { status: 500 });
  }
}
