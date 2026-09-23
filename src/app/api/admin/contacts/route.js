import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/data/admin";
import fs from "fs";
import path from "path";

const MOCK_FILE = path.join(process.cwd(), "contacts.json");
const STATUSES = ["open", "resolved", "closed"];

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
    
    // Attempt DB update
    const { error } = await supabase
      .from("contacts")
      .update({ status })
      .eq("id", id);
      
    if (error) {
      // Fallback to JSON update if DB fails
      if (fs.existsSync(MOCK_FILE)) {
        const messages = JSON.parse(fs.readFileSync(MOCK_FILE, "utf-8"));
        const idx = messages.findIndex(m => m.id === id);
        if (idx !== -1) {
          messages[idx].status = status;
          fs.writeFileSync(MOCK_FILE, JSON.stringify(messages, null, 2));
        }
      }
    } else {
      await logAdminAction(
        { action: "contact.status_override", entity: "contacts", entityId: id, meta: { status } },
        supabase
      );
    }
    
    return NextResponse.json({ ok: true, id, status });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Contact update failed" }, { status: 500 });
  }
}
