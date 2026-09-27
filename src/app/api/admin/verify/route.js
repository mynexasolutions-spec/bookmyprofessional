import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { reviewDocument } from "@/lib/data/documents";
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

  const { documentId, professionalId, status } = body || {};
  if (!documentId || !professionalId || !["approved", "rejected"].includes(status)) {
    return NextResponse.json(
      { error: "documentId, professionalId and status ('approved'|'rejected') are required" },
      { status: 400 }
    );
  }

  try {
    const supabase = createAdminClient();
    const result = await reviewDocument(documentId, professionalId, status, null, supabase);

    // ponytail: email is best-effort — a mail failure must never fail the review.
    try {
      const { data: doc } = await supabase
        .from("documents")
        .select("type")
        .eq("id", documentId)
        .maybeSingle();
      const docType = doc?.type || "verification";
      await sendUserEmail(professionalId, {
        kind: "account",
        subject: status === "approved" ? "Your document was approved" : "Your document needs attention",
        text:
          status === "approved"
            ? `Your ${docType} document was approved.\nOpen your vendor portal to view your verification status.\n— BookMyProfessional`
            : `Your ${docType} document needs attention.\nOpen your vendor portal and re-upload a valid copy.\n— BookMyProfessional`,
      });
    } catch {
      // ignore — the review result below is what matters
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Review failed" }, { status: 500 });
  }
}
