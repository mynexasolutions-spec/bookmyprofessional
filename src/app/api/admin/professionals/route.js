import { NextResponse } from "next/server";
import { isAdminRequest, getAdminUser } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction, updateProfessional, createProfessional } from "@/lib/data/admin";

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

  if (action === "create") {
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const password = body.password || "";
    const category = (body.category || "").trim();
    if (!name || !email || !category) {
      return NextResponse.json({ error: "name, email and category are required" }, { status: 400 });
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    try {
      const supabase = createAdminClient();
      const professional = await createProfessional(supabase, { ...body, name, email, category });
      await logAdminAction(
        { action: "professional.create", entity: "professionals", entityId: professional?.id, meta: { name, email, category } },
        supabase
      );
      return NextResponse.json({ ok: true, professional });
    } catch (error) {
      const status = error?.code === "email_exists" ? 409 : 500;
      return NextResponse.json({ error: error?.message || "Could not add professional" }, { status });
    }
  }

  if (!id || !PATCHES[action]) {
    return NextResponse.json(
      { error: "id and action ('activate'|'deactivate'|'approve'|'reject') are required" },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    const admin = await getAdminUser();
    const adminName = admin?.name || "Admin";

    // Enforce honest verification rule: Cannot approve without at least one approved uploaded document
    if (action === "approve") {
      const { data: docs, error: docErr } = await supabase
        .from("documents")
        .select("id, status")
        .eq("professional_id", id);

      if (docErr || !docs || docs.length === 0) {
        return NextResponse.json(
          { error: "Cannot approve: Professional has not uploaded any verification documents. Approval requires at least one uploaded and approved document." },
          { status: 400 }
        );
      }

      const hasApprovedDoc = docs.some((d) => d.status === "approved");
      if (!hasApprovedDoc) {
        return NextResponse.json(
          { error: "Cannot approve: The professional's uploaded documents have not been approved yet. Please review and approve their documents in the Verification section first." },
          { status: 400 }
        );
      }
    }

    const professional = await updateProfessional(supabase, id, PATCHES[action]);
    await logAdminAction(
      {
        action: `professional.${action}`,
        entity: "professionals",
        entityId: id,
        meta: {
          admin_name: adminName,
          admin_id: admin?.id || "admin",
          reviewed_at: new Date().toISOString(),
          action,
          professional_name: professional?.name,
        },
      },
      supabase
    );
    return NextResponse.json({ ok: true, id, action, professional });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Professional update failed" }, { status: 500 });
  }
}
