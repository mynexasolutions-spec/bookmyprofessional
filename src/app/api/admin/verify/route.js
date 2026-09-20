import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { reviewDocument } from "@/lib/data/documents";

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
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Review failed" }, { status: 500 });
  }
}
