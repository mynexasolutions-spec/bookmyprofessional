import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction, deleteAnnouncement } from "@/lib/data/admin";

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

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = (body?.title || "").trim();
  const text = (body?.body || "").trim();  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data: profiles, error } = await supabase.from("profiles").select("id");
    if (error) throw error;

    const rows = (profiles || []).map((p) => ({
      user_id: p.id,
      title,
      body: text || null,
      type: "announcement",
      link: null,
    }));

    if (rows.length > 0) {
      const { error: insertError } = await supabase.from("notifications").insert(rows);
      if (insertError) throw insertError;
    }

    await logAdminAction(
      {
        action: "broadcast.send",
        entity: "notifications",
        meta: { title, recipients: rows.length },
      },
      supabase
    );

    return NextResponse.json({ ok: true, recipients: rows.length });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Broadcast failed" }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readBody(request);
  const title = (body?.title || "").trim();
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });
  const text = (body?.body || "").trim();

  try {
    const supabase = createAdminClient();
    await deleteAnnouncement(supabase, { title, body: text });
    await logAdminAction(
      { action: "broadcast.delete", entity: "notifications", meta: { title } },
      supabase
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Delete failed" }, { status: 500 });
  }
}
