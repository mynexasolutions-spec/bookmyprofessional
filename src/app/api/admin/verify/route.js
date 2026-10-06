import { NextResponse } from "next/server";
import { isAdminRequest, getAdminUser } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { reviewDocument } from "@/lib/data/documents";
import { logAdminAction } from "@/lib/data/admin";
import { sendUserEmail } from "@/lib/email";

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

  const { documentId, professionalId, status, reason } = body || {};
  if (!documentId || !professionalId || !["approved", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "documentId, professionalId and status ('approved'|'rejected') are required" },
      { status: 400 }
    );
  }

  if (status === "rejected" && (!reason || !reason.trim())) {
    return NextResponse.json(
      { error: "A rejection reason is required when rejecting a document." },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    const admin = await getAdminUser();
    const adminName = admin?.name || "Admin";

    // Fetch document & professional details for audit log & email
    const { data: doc } = await supabase
      .from("documents")
      .select("type, file_path")
      .eq("id", documentId)
      .maybeSingle();

    const { data: pro } = await supabase
      .from("professionals")
      .select("name")
      .eq("id", professionalId)
      .maybeSingle();

    const result = await reviewDocument(documentId, professionalId, status, null, supabase);

    const reviewReason = (reason || "").trim() || (status === "approved" ? "Document approved by admin" : "Document rejected");

    // Store admin name, action, time, and reason in audit_log
    await logAdminAction(
      {
        action: status === "approved" ? "document.approve" : "document.reject",
        entity: "documents",
        entityId: documentId,
        meta: {
          admin_name: adminName,
          admin_id: admin?.id || "admin",
          reviewed_at: new Date().toISOString(),
          status,
          reason: reviewReason,
          document_type: doc?.type || "Document",
          professional_id: professionalId,
          professional_name: pro?.name || "Professional",
        },
      },
      supabase
    );

    // ponytail: email is best-effort — a mail failure must never fail the review.
    try {
      const docType = doc?.type || "verification";
      await sendUserEmail(professionalId, {
        kind: "account",
        subject: status === "approved" ? "Your document was approved" : "Your document was rejected",
        text:
          status === "approved"
            ? `Your ${docType} document was approved by ${adminName}.\nOpen your vendor portal to view your verification status.\n— BookMyProfessional`
            : `Your ${docType} document was rejected by ${adminName}.\nReason: ${reviewReason}\nPlease re-upload a valid copy in your vendor portal.\n— BookMyProfessional`,
      });
    } catch {
      // ignore email failure
    }

    return NextResponse.json({ ok: true, ...result, adminName, reason: reviewReason });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Review failed" }, { status: 500 });
  }
}
